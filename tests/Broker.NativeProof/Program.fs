namespace Broker.NativeProof

open System
open System.Collections.Concurrent
open System.Diagnostics
open System.Threading
open System.Threading.Channels
open System.Threading.Tasks
open Grpc.Core
open Grpc.Net.Client
open Broker.Core
open Broker.Protocol
open FSBarV2.Broker.Contracts

module Program =

    let private fail detail = raise (InvalidOperationException(detail))

    let private version () =
        let value = ProtocolVersion.empty()
        value.Major <- 1u
        value.Minor <- 0u
        value

    let private hello clientName =
        let request = HelloRequest.empty()
        request.ClientName <- clientName
        request.ClientVersion <- ValueSome (version ())
        request

    let private moveCommand
        (clientName: string)
        (commandId: Guid)
        (targetSlot: int)
        (unitId: uint32)
        (x: float32)
        (z: float32) =
        let position = Vec2.empty()
        position.X <- x
        position.Y <- z
        let order = UnitOrder.empty()
        order.UnitIds.Add(unitId)
        order.Kind <- UnitOrder.Types.OrderKind.Move
        order.TargetPos <- ValueSome position
        let gameplay = GameplayPayload.empty()
        gameplay.UnitOrder <- order
        let command = Command.empty()
        command.CommandId <- Google.Protobuf.ByteString.CopyFrom(commandId.ToByteArray())
        command.OriginatingClient <- clientName
        command.TargetSlot <- targetSlot
        command.SubmittedAtUnixMs <- DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
        command.Gameplay <- gameplay
        command

    let private guidOfBytes (value: Google.Protobuf.ByteString) =
        if value.Length <> 16 then fail (sprintf "expected 16-byte command UUID, got %d bytes" value.Length)
        Guid(value.ToByteArray())

    let private distance x0 z0 x1 z1 =
        let dx = float (x1 - x0)
        let dz = float (z1 - z0)
        sqrt (dx * dx + dz * dz)

    let private run (listenAddress: string) =
        task {
            let clientName = "barc-real-move"
            let port =
                match listenAddress.Split(':') with
                | [| "127.0.0.1"; value |] -> Int32.Parse(value)
                | _ -> fail (sprintf "proof requires loopback 127.0.0.1:PORT, got %s" listenAddress)
            use lifetime = new CancellationTokenSource(TimeSpan.FromMinutes(3.0))
            let audit = ConcurrentQueue<Audit.AuditEvent>()
            let options = { ServerHost.defaultOptions with listenAddress = listenAddress }
            let! host = ServerHost.start options (Version(1, 0)) audit.Enqueue lifetime.Token
            try
                let lobby : Lobby.LobbyConfig =
                    { mapName = "Avalanche 3.4"
                      gameMode = "Skirmish"
                      participants =
                        [ { slotIndex = 1
                            kind = ParticipantSlot.ProxyAi
                            team = 0
                            boundClient = None } ]
                      display = Lobby.Headless }
                BrokerState.openHostSession lobby DateTimeOffset.UtcNow host.Hub
                |> Result.defaultWith fail

                use channel = GrpcChannel.ForAddress(sprintf "http://127.0.0.1:%d" port)
                let scripting = ScriptingClient.ScriptingClientClient(channel)
                let! helloReply = scripting.HelloAsync(hello clientName, cancellationToken = lifetime.Token).ResponseAsync
                match helloReply.BrokerVersion with
                | ValueSome brokerVersion when brokerVersion.Major = 1u -> ()
                | _ -> fail "broker returned an unexpected protocol version"

                let bind = BindSlotRequest.empty()
                bind.ClientName <- clientName
                bind.SlotIndex <- 1
                let! bindReply = scripting.BindSlotAsync(bind, cancellationToken = lifetime.Token).ResponseAsync
                if not bindReply.Ok then fail (sprintf "BindSlot failed: %A" bindReply.Reject)
                BrokerState.launchHostSession DateTimeOffset.UtcNow host.Hub
                |> Result.defaultWith fail

                let subscribe = SubscribeRequest.empty()
                subscribe.ClientName <- clientName
                use stateCall = scripting.SubscribeStateAsync(subscribe, cancellationToken = lifetime.Token)
                let messages = Channel.CreateUnbounded<StateMsg>()
                let pump =
                    task {
                        try
                            try
                                while! stateCall.ResponseStream.MoveNext(lifetime.Token) do
                                    do! messages.Writer.WriteAsync(stateCall.ResponseStream.Current, lifetime.Token).AsTask()
                            with
                            | :? OperationCanceledException -> ()
                            | :? RpcException as ex when ex.StatusCode = StatusCode.Cancelled -> ()
                        finally
                            messages.Writer.TryComplete() |> ignore
                    }
                let mutable latestSnapshot : GameStateSnapshot option = None
                let mutable validResult : NativeCommandResult option = None
                let mutable validDispatch : NativeCommandDispatch option = None
                let mutable validParent = Guid.Empty

                let observe (message: StateMsg) =
                    match message.Body with
                    | ValueSome (StateMsg.Types.Body.Snapshot snapshot) -> latestSnapshot <- Some snapshot
                    | ValueSome (StateMsg.Types.Body.NativeCommandResult result) ->
                        let parent = guidOfBytes result.ParentCommandId
                        if parent = validParent then validResult <- Some result
                    | ValueSome (StateMsg.Types.Body.NativeCommandDispatch dispatch) ->
                        let parent = guidOfBytes dispatch.ParentCommandId
                        if parent = validParent then validDispatch <- Some dispatch
                    | _ -> ()

                let waitUntil (name: string) (timeout: TimeSpan) (predicate: unit -> bool) =
                    task {
                        use timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(lifetime.Token)
                        timeoutCts.CancelAfter(timeout)
                        try
                            while not (predicate ()) do
                                let! message = messages.Reader.ReadAsync(timeoutCts.Token).AsTask()
                                observe message
                        with
                        | :? OperationCanceledException -> fail (sprintf "timed out waiting for %s" name)
                        | :? ChannelClosedException -> fail (sprintf "state stream closed while waiting for %s" name)
                    }

                printfn "HARNESS_READY endpoint=%s client=%s slot=1" listenAddress clientName
                do! waitUntil "a complete native snapshot" (TimeSpan.FromSeconds(45.0)) (fun () -> latestSnapshot.IsSome)

                let initial = latestSnapshot.Value
                let unit =
                    initial.Units
                    |> Seq.tryFind (fun candidate -> candidate.OwnerPlayerId = 0)
                    |> Option.orElseWith (fun () -> initial.Units |> Seq.tryHead)
                    |> Option.defaultWith (fun () -> fail "complete snapshot contained no controllable unit")
                let initialPos = unit.Pos |> ValueOption.defaultWith (fun () -> fail "selected unit has no position")
                let targetX = initialPos.X + 500.0f
                let targetZ = initialPos.Y
                printfn "SNAPSHOT tick=%d unit=%u before_x=%.1f before_z=%.1f target_x=%.1f target_z=%.1f" initial.Tick unit.Id initialPos.X initialPos.Y targetX targetZ

                use submit = scripting.SubmitCommandsAsync(cancellationToken = lifetime.Token)
                let submitWhenBaselineValid label unitId x z =
                    task {
                        let mutable accepted : (Guid * CommandAck) option = None
                        let mutable attempts = 0
                        while accepted.IsNone && attempts < 8 do
                            attempts <- attempts + 1
                            let parent = Guid.NewGuid()
                            do! submit.RequestStream.WriteAsync(moveCommand clientName parent 1 unitId x z)
                            let! hasAck = submit.ResponseStream.MoveNext(lifetime.Token)
                            if not hasAck then fail (sprintf "SubmitCommands closed before %s broker ACK" label)
                            let ack = submit.ResponseStream.Current
                            if guidOfBytes ack.CommandId <> parent then fail (sprintf "%s broker ACK changed parent identity" label)
                            if ack.Accepted then accepted <- Some (parent, ack)
                            else
                                let detail = ack.Reject |> ValueOption.map _.Detail |> ValueOption.defaultValue "missing reject"
                                printfn "BROKER_ACK_RETRY stage=%s parent=%O accepted=false detail=%s" label parent detail
                                do! waitUntil "a refreshed snapshot baseline" (TimeSpan.FromSeconds(10.0)) (fun () -> latestSnapshot.IsSome)
                        return accepted |> Option.defaultWith (fun () -> fail (sprintf "%s never reached broker admission" label))
                    }

                let! validParentAck = submitWhenBaselineValid "valid" unit.Id targetX targetZ
                validParent <- fst validParentAck
                printfn "BROKER_ACK stage=valid parent=%O accepted=true" validParent
                do! waitUntil "valid native admission" (TimeSpan.FromSeconds(15.0)) (fun () -> validResult.IsSome)
                let admission = validResult.Value
                if admission.OriginatingClient <> clientName then fail "valid native admission changed originating client"
                if admission.Status <> NativeCommandResultStatus.NativeCommandAccepted then
                    fail (sprintf "valid native admission status was %A: %s" admission.Status admission.Detail)
                printfn "NATIVE_ADMISSION stage=valid parent=%O origin=%s child=%u/%u unit=%u batch=%u correlation=%u status=%A accepted_count=%u incarnation=%s" validParent admission.OriginatingClient admission.ChildIndex admission.ChildCount admission.TargetUnitId admission.BatchSeq admission.ClientCommandId admission.Status admission.AcceptedCommandCount admission.ChannelIncarnation

                do! waitUntil "valid applied native dispatch" (TimeSpan.FromSeconds(15.0)) (fun () -> validDispatch.IsSome)
                let dispatch = validDispatch.Value
                if dispatch.OriginatingClient <> clientName then fail "valid dispatch changed originating client"
                if dispatch.Status <> NativeCommandDispatchStatus.NativeCommandDispatchApplied then
                    fail (sprintf "valid native dispatch status was %A: %s" dispatch.Status dispatch.Detail)
                if dispatch.BatchSeq <> admission.BatchSeq || dispatch.ClientCommandId <> admission.ClientCommandId then
                    fail "native admission and dispatch correlation identities differ"
                printfn "NATIVE_DISPATCH stage=valid parent=%O origin=%s child=%u/%u command_index=%u unit=%u batch=%u correlation=%u status=%A native_status=%u frame=%u incarnation=%s" validParent dispatch.OriginatingClient dispatch.ChildIndex dispatch.ChildCount dispatch.CommandIndex dispatch.TargetUnitId dispatch.BatchSeq dispatch.ClientCommandId dispatch.Status dispatch.NativeStatus dispatch.Frame dispatch.ChannelIncarnation

                let mutable displacement = 0.0
                do! waitUntil "observed unit displacement" (TimeSpan.FromSeconds(20.0)) (fun () ->
                    match latestSnapshot with
                    | None -> false
                    | Some snapshot ->
                        match snapshot.Units |> Seq.tryFind (fun candidate -> candidate.Id = unit.Id) with
                        | Some moved ->
                            match moved.Pos with
                            | ValueSome pos ->
                                displacement <- distance initialPos.X initialPos.Y pos.X pos.Y
                                displacement >= 50.0
                            | ValueNone -> false
                        | None -> false)
                printfn "OBSERVED_EFFECT parent=%O unit=%u displacement=%.1f" validParent unit.Id displacement
                do! submit.RequestStream.CompleteAsync()

                lifetime.Cancel()
                do! pump
                let auditEvents = audit.ToArray()
                printfn "PROOF_PASS source=FSBar.Protocol parent=%O audit_events=%d" validParent auditEvents.Length
                return 0
            finally
                lifetime.Cancel()
                (host :> IAsyncDisposable).DisposeAsync().AsTask().GetAwaiter().GetResult()
        }

    [<EntryPoint>]
    let main argv =
        let listenAddress = if argv.Length = 1 then argv[0] else "127.0.0.1:5021"
        try
            (if argv.Length > 0 && argv[0] = "--live-host" then LiveHost.run "barc-live-v1" argv[1..]
             elif argv.Length > 0 && argv[0] = "--tactical-live-host" then LiveHost.run "barc-live-tactical-v1" argv[1..]
             else run listenAddress) |> fun task -> task.GetAwaiter().GetResult()
        with ex ->
            eprintfn "PROOF_FAIL %s" ex.Message
            1
