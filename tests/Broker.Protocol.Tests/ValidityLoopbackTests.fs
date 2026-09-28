module Broker.Protocol.Tests.ValidityLoopbackTests

open System
open System.Collections.Concurrent
open System.Net
open System.Net.Sockets
open System.Threading
open Expecto
open Grpc.Core
open Grpc.Net.Client
open Broker.Core
open Broker.Protocol
open FSBarV2.Broker.Contracts
open Highbar.V1

let private freePort () =
    let listener = new TcpListener(IPAddress.Loopback, 0)
    listener.Start()
    let port = (listener.LocalEndpoint :?> IPEndPoint).Port
    listener.Stop()
    port

let private mkHello name =
    let version = ProtocolVersion.empty()
    version.Major <- 1u
    version.Minor <- 0u
    let request = HelloRequest.empty()
    request.ClientName <- name
    request.ClientVersion <- ValueSome version
    request

let private mkSnapshot seq frame includeUnit features =
    let snapshot = StateSnapshot.empty()
    snapshot.FrameNumber <- frame
    if includeUnit then
        let unit = OwnUnit.empty()
        unit.UnitId <- 7u
        unit.DefId <- 303u
        unit.TeamId <- 2
        let pos = Vector3.empty()
        pos.X <- 3.0f
        pos.Y <- 400.0f
        pos.Z <- -5.0f
        unit.Position <- ValueSome pos
        snapshot.OwnUnits.Add(unit)
    for id, kind, x, elevation, z in features do
        let feature = MapFeature.empty()
        feature.FeatureId <- id
        feature.DefId <- kind
        let pos = Vector3.empty()
        pos.X <- x
        pos.Y <- elevation
        pos.Z <- z
        feature.Position <- ValueSome pos
        snapshot.MapFeatures.Add(feature)
    let update = StateUpdate.empty()
    update.Seq <- seq
    update.Frame <- frame
    update.Snapshot <- snapshot
    update

let private mkNonemptyDelta seq frame =
    let event = DeltaEvent.empty()
    event.EconomyTick <- EconomyTickEvent.empty()
    let delta = StateDelta.empty()
    delta.Events.Add(event)
    let update = StateUpdate.empty()
    update.Seq <- seq
    update.Frame <- frame
    update.Delta <- delta
    update

let private mkDispatchDelta seq frame incarnation (batch: CommandBatch) =
    let dispatch = CommandDispatchEvent.empty()
    dispatch.BatchSeq <- batch.BatchSeq
    dispatch.ClientCommandId <- batch.ClientCommandId |> ValueOption.defaultValue 0UL
    dispatch.ChannelIncarnation <- incarnation
    dispatch.CommandIndex <- 0u
    dispatch.TargetUnitId <- batch.TargetUnitId
    dispatch.Status <- CommandDispatchStatus.CommandDispatchApplied
    dispatch.Frame <- frame
    let event = DeltaEvent.empty()
    event.CommandDispatch <- dispatch
    let delta = StateDelta.empty()
    delta.Events.Add event
    let update = StateUpdate.empty()
    update.Seq <- seq
    update.Frame <- frame
    update.Delta <- delta
    update

let private readNext (call: AsyncServerStreamingCall<StateMsg>) (token: CancellationToken) =
    async {
        let! more = call.ResponseStream.MoveNext(token) |> Async.AwaitTask
        if not more then failtest "state stream closed unexpectedly"
        return call.ResponseStream.Current
    }

let private mkPauseCommand (clientName: string) (commandId: Guid) =
    let command = Command.empty()
    command.CommandId <- Google.Protobuf.ByteString.CopyFrom(commandId.ToByteArray())
    command.OriginatingClient <- clientName
    command.SubmittedAtUnixMs <- DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
    let admin = AdminPayload.empty()
    admin.Pause <- Pause.empty()
    command.Admin <- admin
    command

let private mkCorePauseCommand () : CommandPipeline.Command =
    { commandId = Guid.NewGuid()
      originatingClient = ScriptingClientId "stale-fixture"
      targetSlot = None
      submittedAt = DateTimeOffset.UtcNow
      kind = CommandPipeline.Admin CommandPipeline.Pause }

[<Tests>]
let validityLoopbackTests =
    testList "BARC-01 coordinator to scripting validity loopback" [
        testAsync "command and state streams may start concurrently before the owning heartbeat" {
            let port = freePort()
            let options = { ServerHost.defaultOptions with listenAddress = sprintf "127.0.0.1:%d" port }
            let! handle =
                ServerHost.start options (System.Version(1, 0)) ignore CancellationToken.None
                |> Async.AwaitTask
            try
                use channel = GrpcChannel.ForAddress(sprintf "http://127.0.0.1:%d" port)
                let coordinator = HighBarCoordinator.HighBarCoordinatorClient(channel)
                use timeout = new CancellationTokenSource(TimeSpan.FromSeconds(5.0))
                let subscribe = CommandChannelSubscribe.empty()
                subscribe.PluginId <- "concurrent-owner"
                subscribe.SchemaVersion <- "1.0.0"
                subscribe.AdmissionResultProtocol <- AdmissionResultProtocol.CorrelatedV1
                subscribe.ChannelIncarnation <- "concurrent-inc"
                use commands = coordinator.OpenCommandChannelAsync(subscribe, cancellationToken = timeout.Token)
                let pendingBatch = commands.ResponseStream.MoveNext(timeout.Token)
                let intruderSubscribe = CommandChannelSubscribe.empty()
                intruderSubscribe.PluginId <- "concurrent-intruder"
                intruderSubscribe.SchemaVersion <- "1.0.0"
                intruderSubscribe.AdmissionResultProtocol <- AdmissionResultProtocol.CorrelatedV1
                intruderSubscribe.ChannelIncarnation <- "intruder-inc"
                use intruder = coordinator.OpenCommandChannelAsync(intruderSubscribe, cancellationToken = timeout.Token)
                let intruderRead = intruder.ResponseStream.MoveNext(timeout.Token)
                use push = coordinator.PushStateAsync(cancellationToken = timeout.Token)
                let pendingSnapshot = push.RequestStream.WriteAsync(mkSnapshot 1UL 17u false [])

                let heartbeat = HeartbeatRequest.empty()
                heartbeat.PluginId <- "concurrent-owner"
                heartbeat.SchemaVersion <- "1.0.0"
                let! _ = coordinator.HeartbeatAsync(heartbeat, cancellationToken = timeout.Token).ResponseAsync |> Async.AwaitTask
                do! pendingSnapshot |> Async.AwaitTask
                let! intruderOutcome = intruderRead |> Async.AwaitTask |> Async.Catch
                match intruderOutcome with
                | Choice2Of2 (:? RpcException as ex) ->
                    Expect.equal ex.StatusCode StatusCode.PermissionDenied "early non-owner remains unauthorized after heartbeat binds"
                | Choice2Of2 (:? AggregateException as ex) ->
                    match ex.InnerException with
                    | :? RpcException as rpc ->
                        Expect.equal rpc.StatusCode StatusCode.PermissionDenied "early non-owner remains unauthorized after heartbeat binds"
                    | other -> failtestf "expected nested RPC refusal, got %A" other
                | other -> failtestf "expected early non-owner refusal, got %A" other

                let deadline = DateTimeOffset.UtcNow.AddSeconds 2.0
                let mutable admitted = false
                while not admitted do
                    if DateTimeOffset.UtcNow > deadline then failtest "early command channel did not claim after heartbeat"
                    let command = mkCorePauseCommand ()
                    match BrokerState.sendToCoordinator command handle.Hub with
                    | Ok () -> admitted <- true
                    | Error (CommandPipeline.InvalidPayload _) -> do! Async.Sleep 20
                    | Error other -> failtestf "unexpected startup admission: %A" other
                let! hasBatch = pendingBatch |> Async.AwaitTask
                Expect.isTrue hasBatch "early command stream receives work after heartbeat ownership binds"
                do! Async.Sleep 50
                let tick =
                    BrokerState.session handle.Hub
                    |> Option.bind (fun session -> (Session.toReading DateTimeOffset.UtcNow session).telemetry)
                    |> Option.map _.tick
                Expect.equal tick (Some 17L) "early state stream applies only after heartbeat generation binds"
            finally
                (handle :> IAsyncDisposable).DisposeAsync().AsTask().Wait()
        }

        testAsync "correlated native result and dispatch remain distinct from immediate scripting admission" {
            let port = freePort()
            let audit = ConcurrentQueue<Audit.AuditEvent>()
            let options = { ServerHost.defaultOptions with listenAddress = sprintf "127.0.0.1:%d" port }
            let! handle =
                ServerHost.start options (System.Version(1, 0)) audit.Enqueue CancellationToken.None
                |> Async.AwaitTask
            try
                use channel = GrpcChannel.ForAddress(sprintf "http://127.0.0.1:%d" port)
                let scripting = ScriptingClient.ScriptingClientClient(channel)
                let coordinator = HighBarCoordinator.HighBarCoordinatorClient(channel)
                let! _ = scripting.HelloAsync(mkHello "result-bot").ResponseAsync |> Async.AwaitTask
                let lobby : Lobby.LobbyConfig =
                    { mapName = "fixture"
                      gameMode = "Skirmish"
                      participants = []
                      display = Lobby.Headless }
                BrokerState.openHostSession lobby DateTimeOffset.UtcNow handle.Hub
                |> function Ok () -> () | Error error -> failtest error
                BrokerState.grantAdmin (ScriptingClientId "result-bot") "fixture" DateTimeOffset.UtcNow handle.Hub
                |> function Ok () -> () | Error error -> failtestf "grant admin: %A" error

                let subscribe = SubscribeRequest.empty()
                subscribe.ClientName <- "result-bot"
                use state = scripting.SubscribeStateAsync(subscribe)
                let heartbeat = HeartbeatRequest.empty()
                heartbeat.PluginId <- "native-owner"
                heartbeat.SchemaVersion <- "1.0.0"
                let! _ = coordinator.HeartbeatAsync(heartbeat).ResponseAsync |> Async.AwaitTask
                use push = coordinator.PushStateAsync()
                use timeout = new CancellationTokenSource(TimeSpan.FromSeconds(8.0))
                do! push.RequestStream.WriteAsync(mkSnapshot 1UL 1u false []) |> Async.AwaitTask
                let mutable baselineSeen = false
                while not baselineSeen do
                    let! message = readNext state timeout.Token
                    match message.Body with
                    | ValueSome (StateMsg.Types.Body.Snapshot _) -> baselineSeen <- true
                    | _ -> ()

                let incarnation = "inc-result-1"
                let sub = CommandChannelSubscribe.empty()
                sub.PluginId <- "native-owner"
                sub.SchemaVersion <- "1.0.0"
                sub.AdmissionResultProtocol <- AdmissionResultProtocol.CorrelatedV1
                sub.ChannelIncarnation <- incarnation
                use commandCts = CancellationTokenSource.CreateLinkedTokenSource(timeout.Token)
                use commandChannel = coordinator.OpenCommandChannelAsync(sub, cancellationToken = commandCts.Token)
                use submit = scripting.SubmitCommandsAsync(cancellationToken = timeout.Token)
                let parentId = Guid.NewGuid()
                do! submit.RequestStream.WriteAsync(mkPauseCommand "result-bot" parentId) |> Async.AwaitTask
                let! hasAck = submit.ResponseStream.MoveNext(timeout.Token) |> Async.AwaitTask
                Expect.isTrue hasAck "broker admission ACK arrived"
                Expect.isTrue submit.ResponseStream.Current.Accepted "ACK means broker admission"

                let! hasBatch = commandChannel.ResponseStream.MoveNext(timeout.Token) |> Async.AwaitTask
                Expect.isTrue hasBatch "native command batch was forwarded"
                let batch = commandChannel.ResponseStream.Current
                let report = CommandBatchResultReport.empty()
                report.PluginId <- "native-owner"
                report.ChannelIncarnation <- incarnation
                report.SchemaVersion <- "1.0.0"
                let native = CommandBatchResult.empty()
                native.BatchSeq <- batch.BatchSeq
                native.ClientCommandId <- batch.ClientCommandId |> ValueOption.defaultValue 0UL
                native.Status <- CommandBatchStatus.CommandBatchAccepted
                native.AcceptedCommandCount <- uint32 batch.Commands.Count
                report.Result <- ValueSome native
                let! recorded = coordinator.ReportCommandBatchResultAsync(report).ResponseAsync |> Async.AwaitTask
                Expect.equal recorded.Disposition CommandBatchResultReportDisposition.CommandBatchResultRecorded "first exact report records"

                let mutable resultSeen = false
                while not resultSeen do
                    let! message = readNext state timeout.Token
                    match message.Body with
                    | ValueSome (StateMsg.Types.Body.NativeCommandResult result) ->
                        Expect.equal (Guid(result.ParentCommandId.ToByteArray())) parentId "full parent UUID is preserved"
                        Expect.equal result.OriginatingClient "result-bot" "originating client is preserved"
                        Expect.equal result.ChildIndex 0u "child index is explicit"
                        Expect.equal result.BatchSeq batch.BatchSeq "batch sequence is exact"
                        Expect.equal result.ClientCommandId native.ClientCommandId "full uint64 correlation is exact"
                        Expect.equal result.Status NativeCommandResultStatus.NativeCommandAccepted "native status is distinct"
                        resultSeen <- true
                    | _ -> ()

                let! duplicate = coordinator.ReportCommandBatchResultAsync(report).ResponseAsync |> Async.AwaitTask
                Expect.equal duplicate.Disposition CommandBatchResultReportDisposition.CommandBatchResultDuplicate "exact retry is idempotent"
                let stale = { report with ChannelIncarnation = "old-incarnation" }
                let! late = coordinator.ReportCommandBatchResultAsync(stale).ResponseAsync |> Async.AwaitTask
                Expect.equal late.Disposition CommandBatchResultReportDisposition.CommandBatchResultLate "wrong incarnation is late"

                let dispatch = CommandDispatchEvent.empty()
                dispatch.BatchSeq <- batch.BatchSeq
                dispatch.ClientCommandId <- native.ClientCommandId
                dispatch.CommandIndex <- 0u
                dispatch.TargetUnitId <- batch.TargetUnitId
                dispatch.Status <- CommandDispatchStatus.CommandDispatchApplied
                dispatch.Frame <- 2u
                dispatch.ChannelIncarnation <- incarnation
                let event = DeltaEvent.empty()
                event.CommandDispatch <- dispatch
                let delta = StateDelta.empty()
                delta.Events.Add event
                let update = StateUpdate.empty()
                update.Seq <- 2UL
                update.Frame <- 2u
                update.Delta <- delta
                do! push.RequestStream.WriteAsync(update) |> Async.AwaitTask
                let mutable dispatchSeen = false
                while not dispatchSeen do
                    let! message = readNext state timeout.Token
                    match message.Body with
                    | ValueSome (StateMsg.Types.Body.NativeCommandDispatch observed) ->
                        Expect.equal (Guid(observed.ParentCommandId.ToByteArray())) parentId "dispatch retains parent"
                        Expect.equal observed.Status NativeCommandDispatchStatus.NativeCommandDispatchApplied "dispatch is a later applied stage"
                        dispatchSeen <- true
                    | _ -> ()
                Expect.isTrue (BrokerState.telemetryValid handle.Hub) "dispatch-only delta does not invalidate snapshot materialization"

                let unknownParent = Guid.NewGuid()
                do! submit.RequestStream.WriteAsync(mkPauseCommand "result-bot" unknownParent) |> Async.AwaitTask
                let! hasUnknownAck = submit.ResponseStream.MoveNext(timeout.Token) |> Async.AwaitTask
                Expect.isTrue hasUnknownAck "second broker ACK arrived"
                Expect.isTrue submit.ResponseStream.Current.Accepted "second command was broker-admitted"
                let! hasUnknownBatch = commandChannel.ResponseStream.MoveNext(timeout.Token) |> Async.AwaitTask
                Expect.isTrue hasUnknownBatch "second command was forwarded"
                commandCts.Cancel()
                let mutable unknownSeen = false
                while not unknownSeen do
                    let! message = readNext state timeout.Token
                    match message.Body with
                    | ValueSome (StateMsg.Types.Body.NativeCommandResult result)
                        when Guid(result.ParentCommandId.ToByteArray()) = unknownParent ->
                        Expect.equal result.Status NativeCommandResultStatus.NativeCommandUnknown "cancellation after forwarding is UNKNOWN"
                        unknownSeen <- true
                    | _ -> ()
            finally
                (handle :> IAsyncDisposable).DisposeAsync().AsTask().Wait()
        }

        testAsync "legacy observation-only command channel is refused before forwarding" {
            let port = freePort()
            let options = { ServerHost.defaultOptions with listenAddress = sprintf "127.0.0.1:%d" port }
            let! handle =
                ServerHost.start options (System.Version(1, 0)) ignore CancellationToken.None
                |> Async.AwaitTask
            try
                use channel = GrpcChannel.ForAddress(sprintf "http://127.0.0.1:%d" port)
                let coordinator = HighBarCoordinator.HighBarCoordinatorClient(channel)
                let heartbeat = HeartbeatRequest.empty()
                heartbeat.PluginId <- "legacy-owner"
                heartbeat.SchemaVersion <- "1.0.0"
                let! _ = coordinator.HeartbeatAsync(heartbeat).ResponseAsync |> Async.AwaitTask
                let sub = CommandChannelSubscribe.empty()
                sub.PluginId <- "legacy-owner"
                sub.SchemaVersion <- "1.0.0"
                sub.AdmissionResultProtocol <- AdmissionResultProtocol.LegacyObservationOnly
                sub.ChannelIncarnation <- "legacy-inc"
                use call = coordinator.OpenCommandChannelAsync(sub)
                let! outcome =
                    call.ResponseStream.MoveNext(CancellationToken.None)
                    |> Async.AwaitTask
                    |> Async.Catch
                match outcome with
                | Choice2Of2 (:? RpcException as ex) ->
                    Expect.equal ex.StatusCode StatusCode.FailedPrecondition "legacy refusal is explicit"
                | Choice2Of2 (:? AggregateException as ex) ->
                    match ex.InnerException with
                    | :? RpcException as rpc ->
                        Expect.equal rpc.StatusCode StatusCode.FailedPrecondition "legacy refusal is explicit"
                    | inner -> failtestf "unexpected aggregate inner exception: %O" inner
                | Choice2Of2 ex -> failtestf "unexpected exception: %O" ex
                | Choice1Of2 _ -> failtest "legacy channel should fail"
            finally
                (handle :> IAsyncDisposable).DisposeAsync().AsTask().Wait()
        }

        test "wire admission accepts bounded distinct units and rejects malformed identities" {
            let mkCommand () =
                let command = Command.empty()
                command.CommandId <- Google.Protobuf.ByteString.CopyFrom(Guid.NewGuid().ToByteArray())
                command.OriginatingClient <- "watcher"
                command.SubmittedAtUnixMs <- DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                let pause = AdminPayload.empty()
                pause.Pause <- Pause.empty()
                command.Admin <- pause
                command
            let malformedId = mkCommand ()
            malformedId.CommandId <- Google.Protobuf.ByteString.Empty
            match WireConvert.tryToCoreCommand malformedId with
            | Error (CommandPipeline.InvalidPayload _) -> ()
            | other -> failtestf "malformed UUID should reject: %A" other

            let command = mkCommand ()
            let order = UnitOrder.empty()
            order.UnitIds.Add(1u)
            order.UnitIds.Add(2u)
            order.Kind <- UnitOrder.Types.OrderKind.Move
            let target = Vec2.empty()
            target.X <- 1.0f
            target.Y <- 2.0f
            order.TargetPos <- ValueSome target
            let gameplay = GameplayPayload.empty()
            gameplay.UnitOrder <- order
            command.Gameplay <- gameplay
            match WireConvert.tryToCoreCommand command with
            | Ok { kind = CommandPipeline.Gameplay (CommandPipeline.UnitOrder ([1u; 2u], _, _, _)) } -> ()
            | other -> failtestf "bounded distinct multi-unit command should decode atomically: %A" other

            order.UnitIds.Add(2u)
            match WireConvert.tryToCoreCommand command with
            | Error (CommandPipeline.InvalidPayload _) -> ()
            | other -> failtestf "duplicate acting units should reject: %A" other

            let valid = mkCommand ()
            match WireConvert.tryToCoreCommand valid with
            | Ok { kind = CommandPipeline.Admin CommandPipeline.Pause } -> ()
            | other -> failtestf "valid pause should decode: %A" other
        }
        testAsync "Synthetic_BARC01 snapshot gap and unapplied-delta recovery stay fail closed" {
            let port = freePort()
            let audit = ConcurrentQueue<Audit.AuditEvent>()
            let options =
                { ServerHost.defaultOptions with
                    listenAddress = sprintf "127.0.0.1:%d" port }
            let! handle =
                ServerHost.start options (System.Version(1, 0)) audit.Enqueue CancellationToken.None
                |> Async.AwaitTask
            try
                use channel = GrpcChannel.ForAddress(sprintf "http://127.0.0.1:%d" port)
                let scripting = ScriptingClient.ScriptingClientClient(channel)
                let coordinator = HighBarCoordinator.HighBarCoordinatorClient(channel)
                let! _ = scripting.HelloAsync(mkHello "watcher").ResponseAsync |> Async.AwaitTask
                let subscribe = SubscribeRequest.empty()
                subscribe.ClientName <- "watcher"
                use stateCall = scripting.SubscribeStateAsync(subscribe)

                let heartbeat = HeartbeatRequest.empty()
                heartbeat.PluginId <- "synthetic-barc-01"
                heartbeat.SchemaVersion <- "1.0.0"
                let! _ = coordinator.HeartbeatAsync(heartbeat).ResponseAsync |> Async.AwaitTask
                use push = coordinator.PushStateAsync()
                use timeout = new CancellationTokenSource(TimeSpan.FromSeconds(5.0))

                do!
                    push.RequestStream.WriteAsync(
                        mkSnapshot
                            1UL
                            1u
                            true
                            [ 7u, 101u, 11.0f, 999.0f, -13.0f
                              19u, 202u, -23.0f, 888.0f, 29.0f ])
                    |> Async.AwaitTask
                let! first = readNext stateCall timeout.Token
                let! initial =
                    match first.Body with
                    | ValueSome (StateMsg.Types.Body.Validity validity) ->
                        Expect.equal validity.Status StateValidity.Types.Status.Invalid "pre-baseline state is explicit"
                        readNext stateCall timeout.Token
                    | _ -> async.Return first
                match initial.Body with
                | ValueSome (StateMsg.Types.Body.Snapshot snapshot) ->
                    Expect.equal snapshot.Tick 1L "complete snapshot is current"
                    Expect.equal snapshot.Units.Count 1 "unit is retained"
                    Expect.equal snapshot.Units.[0].Id 7u "unit id is independent of feature ids"
                    Expect.equal snapshot.Features.Count 2 "both features reach scripting"
                    let firstFeature = snapshot.Features.[0]
                    Expect.equal firstFeature.Id 7u "feature may share id 7 with a unit"
                    Expect.equal firstFeature.Kind "101" "first feature kind is exact"
                    Expect.equal firstFeature.Pos.Value.X 11.0f "first feature X is exact"
                    Expect.equal firstFeature.Pos.Value.Y -13.0f "native Z maps to scripting Y"
                    let secondFeature = snapshot.Features.[1]
                    Expect.equal secondFeature.Id 19u "second feature id is exact"
                    Expect.equal secondFeature.Kind "202" "second feature kind is exact"
                    Expect.equal secondFeature.Pos.Value.X -23.0f "second feature X is asymmetric"
                    Expect.equal secondFeature.Pos.Value.Y 29.0f "second feature Z is asymmetric"
                | other -> failtestf "expected initial snapshot, got %A" other

                do! push.RequestStream.WriteAsync(mkNonemptyDelta 3UL 3u) |> Async.AwaitTask
                let! invalid = readNext stateCall timeout.Token
                match invalid.Body with
                | ValueSome (StateMsg.Types.Body.Validity validity) ->
                    Expect.equal validity.Status StateValidity.Types.Status.Invalid "gap invalidates"
                    Expect.equal validity.LastSeq 1UL "last contiguous sequence"
                    Expect.equal validity.ReceivedSeq 3UL "received sequence"
                | other -> failtestf "expected invalidation, got %A" other
                Expect.isTrue (BrokerState.telemetryGap handle.Hub) "current gap is set"
                BrokerState.clearTelemetryGap handle.Hub
                Expect.isTrue (BrokerState.telemetryGap handle.Hub) "invalidity cannot be acknowledged away"

                // Joining during invalidity must produce metadata rather than
                // replaying the cached tick-1 snapshot as current.
                let! _ = scripting.HelloAsync(mkHello "late-watcher").ResponseAsync |> Async.AwaitTask
                let lateSubscribe = SubscribeRequest.empty()
                lateSubscribe.ClientName <- "late-watcher"
                use lateCall = scripting.SubscribeStateAsync(lateSubscribe)
                let! lateInitial = readNext lateCall timeout.Token
                match lateInitial.Body with
                | ValueSome (StateMsg.Types.Body.Validity validity) ->
                    Expect.equal validity.Status StateValidity.Types.Status.Invalid "late join sees invalidity"
                | other -> failtestf "late join received cached state: %A" other

                // The server-side control gate protects old readers that do
                // not understand the additive validity arm.
                use submit = scripting.SubmitCommandsAsync()
                let command = Command.empty()
                command.CommandId <- Google.Protobuf.ByteString.CopyFrom(Guid.NewGuid().ToByteArray())
                command.OriginatingClient <- "watcher"
                command.SubmittedAtUnixMs <- DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                let pause = AdminPayload.empty()
                pause.Pause <- Pause.empty()
                command.Admin <- pause
                do! submit.RequestStream.WriteAsync(command) |> Async.AwaitTask
                let! hasAck = submit.ResponseStream.MoveNext(timeout.Token) |> Async.AwaitTask
                Expect.isTrue hasAck "invalid-state command gets an acknowledgement"
                let ack = submit.ResponseStream.Current
                Expect.isFalse ack.Accepted "invalid state blocks command admission"
                match ack.Reject with
                | ValueSome reject ->
                    Expect.equal reject.Code Reject.Types.Code.InvalidPayload "control refusal code"
                    Expect.stringContains reject.Detail "telemetry baseline is invalid" "actionable refusal"
                | ValueNone -> failtest "expected command rejection detail"

                do! push.RequestStream.WriteAsync(mkSnapshot 4UL 4u false []) |> Async.AwaitTask
                let! recovered = readNext stateCall timeout.Token
                let! lateRecovered = readNext lateCall timeout.Token
                for message in [ recovered; lateRecovered ] do
                    match message.Body with
                    | ValueSome (StateMsg.Types.Body.Snapshot snapshot) ->
                        Expect.equal snapshot.Tick 4L "new full baseline recovers"
                        Expect.equal snapshot.Features.Count 0 "empty snapshot replaces old features"
                        Expect.equal snapshot.Units.Count 0 "empty snapshot replaces old units independently"
                    | other -> failtestf "expected recovered snapshot, got %A" other
                Expect.isFalse (BrokerState.telemetryGap handle.Hub) "recovery clears current gap"
                Expect.isTrue (BrokerState.telemetryValid handle.Hub) "recovery marks state current"
                Expect.isTrue
                    (audit.ToArray()
                     |> Array.exists (function
                         | Audit.AuditEvent.CoordinatorStateGap (_, "synthetic-barc-01", 1UL, 3UL) -> true
                         | _ -> false))
                    "gap remains in audit history"

                do! push.RequestStream.WriteAsync(mkNonemptyDelta 5UL 5u) |> Async.AwaitTask
                let! unapplied = readNext stateCall timeout.Token
                match unapplied.Body with
                | ValueSome (StateMsg.Types.Body.Validity validity) ->
                    Expect.stringContains validity.Detail "does not materialize" "unapplied delta reason"
                | other -> failtestf "expected unapplied-delta invalidation, got %A" other
                do!
                    push.RequestStream.WriteAsync(
                        mkSnapshot 6UL 6u false [ 31u, 404u, 37.0f, 777.0f, -41.0f ])
                    |> Async.AwaitTask
                let! recoveredAgain = readNext stateCall timeout.Token
                match recoveredAgain.Body with
                | ValueSome (StateMsg.Types.Body.Snapshot snapshot) ->
                    Expect.equal snapshot.Tick 6L "second full baseline recovers"
                    Expect.equal snapshot.Features.Count 1 "replacement feature set is current"
                    Expect.equal snapshot.Features.[0].Id 31u "old feature ids do not survive replacement"
                    Expect.equal snapshot.Features.[0].Kind "404" "replacement kind is exact"
                    Expect.equal snapshot.Features.[0].Pos.Value.X 37.0f "replacement X is exact"
                    Expect.equal snapshot.Features.[0].Pos.Value.Y -41.0f "replacement Z maps to scripting Y"
                | other -> failtestf "expected second recovery, got %A" other
                Expect.isTrue
                    (audit.ToArray()
                     |> Array.exists (function
                         | Audit.AuditEvent.CoordinatorStateInvalidated (_, "synthetic-barc-01", 4UL, 5UL, _) -> true
                         | _ -> false))
                    "unapplied delta remains in audit history"
            finally
                (handle :> IAsyncDisposable).DisposeAsync().AsTask().Wait()
        }

        testAsync "stale PushState cannot mutate replacement snapshot dispatch or liveness" {
            let port = freePort()
            let audit = ConcurrentQueue<Audit.AuditEvent>()
            let options = { ServerHost.defaultOptions with listenAddress = sprintf "127.0.0.1:%d" port }
            let! handle =
                ServerHost.start options (System.Version(1, 0)) audit.Enqueue CancellationToken.None
                |> Async.AwaitTask
            try
                use channel = GrpcChannel.ForAddress(sprintf "http://127.0.0.1:%d" port)
                let coordinator = HighBarCoordinator.HighBarCoordinatorClient(channel)
                let heartbeat plugin =
                    let request = HeartbeatRequest.empty()
                    request.PluginId <- plugin
                    request.SchemaVersion <- "1.0.0"
                    coordinator.HeartbeatAsync(request).ResponseAsync |> Async.AwaitTask
                let! _ = heartbeat "old-owner"
                use oldPush = coordinator.PushStateAsync()
                do! oldPush.RequestStream.WriteAsync(mkSnapshot 1UL 1u false []) |> Async.AwaitTask

                let deadline = DateTimeOffset.UtcNow.AddSeconds 8.0
                while BrokerState.session handle.Hub |> Option.isSome do
                    if DateTimeOffset.UtcNow > deadline then failtest "old session watchdog did not detach"
                    do! Async.Sleep 100

                let! _ = heartbeat "replacement-owner"
                use replacementPush = coordinator.PushStateAsync()
                do! replacementPush.RequestStream.WriteAsync(mkSnapshot 1UL 100u false []) |> Async.AwaitTask
                do! Async.Sleep 50
                let replacementHeartbeat = BrokerState.lastHeartbeatAt handle.Hub
                let replacementTick () =
                    BrokerState.session handle.Hub
                    |> Option.bind (fun session -> (Session.toReading DateTimeOffset.UtcNow session).telemetry)
                    |> Option.map _.tick
                Expect.equal (replacementTick ()) (Some 100L) "replacement baseline is installed"

                let lease =
                    match BrokerState.tryClaimCoordinatorCommandChannel "replacement-owner" "replacement-inc" handle.Hub with
                    | BrokerState.Claimed value -> value
                    | other -> failtestf "replacement command lease: %A" other
                let command = mkCorePauseCommand ()
                Expect.equal (BrokerState.sendToCoordinator command handle.Hub) (Ok ()) "replacement command admitted"
                let mutable delivery = Unchecked.defaultof<BrokerState.OutboundDelivery>
                Expect.isTrue (lease.reader.TryRead(&delivery)) "replacement delivery available"
                BrokerState.registerPendingNativeResult lease delivery 0 handle.Hub
                |> function Ok _ -> () | Error error -> failtest error
                let batch = delivery.batches.Head
                let result = CommandBatchResult.empty()
                result.BatchSeq <- batch.BatchSeq
                result.ClientCommandId <- batch.ClientCommandId |> ValueOption.defaultValue 0UL
                result.Status <- CommandBatchStatus.CommandBatchAccepted
                result.AcceptedCommandCount <- 1u
                Expect.equal
                    (BrokerState.reportNativeResult "replacement-owner" "replacement-inc" result handle.Hub)
                    BrokerState.Recorded
                    "replacement identity awaits dispatch"

                do! oldPush.RequestStream.WriteAsync(mkDispatchDelta 2UL 999u "replacement-inc" batch) |> Async.AwaitTask
                do! Async.Sleep 100
                Expect.equal (replacementTick ()) (Some 100L) "stale stream cannot replace the new baseline"
                Expect.equal (BrokerState.lastHeartbeatAt handle.Hub) replacementHeartbeat "stale stream cannot refresh replacement liveness"
                Expect.isFalse
                    (audit.ToArray()
                     |> Array.exists (function
                         | Audit.AuditEvent.CoordinatorNativeCommandDispatch (_, _, _, parent, _, _, _, _, _, _, _, _, _, _)
                            when parent = command.commandId -> true
                         | _ -> false))
                    "stale stream cannot consume the replacement dispatch identity"
                Expect.isTrue (BrokerState.session handle.Hub |> Option.isSome) "replacement session remains live"
            finally
                (handle :> IAsyncDisposable).DisposeAsync().AsTask().Wait()
        }
    ]
    |> testSequenced
