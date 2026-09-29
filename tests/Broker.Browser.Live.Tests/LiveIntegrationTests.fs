module Broker.Browser.Live.Tests.LiveIntegrationTests

open System
open System.Net
open System.Net.Sockets
open System.Net.WebSockets
open System.Threading
open System.Threading.Tasks
open Expecto
open Google.Protobuf
open Grpc.Net.Client
open Broker.Core
open Broker.Protocol
open Broker.Browser.Contracts
open Broker.Browser.Gateway
open Highbar.V1

let private freePort () =
    use listener = new TcpListener(IPAddress.Loopback, 0)
    listener.Start()
    let port = (listener.LocalEndpoint :?> IPEndPoint).Port
    listener.Stop()
    port

let private send (socket: ClientWebSocket) (message: LiveClientEnvelope) = task {
    let bytes = message.ToByteArray()
    do! socket.SendAsync(ReadOnlyMemory<byte>(bytes), WebSocketMessageType.Binary, true, CancellationToken.None).AsTask()
}

let private receive (socket: ClientWebSocket) = task {
    let bytes = Array.zeroCreate<byte> 65536
    let! result = socket.ReceiveAsync(Memory<byte>(bytes), CancellationToken.None).AsTask()
    return LiveServerEnvelope.Parser.ParseFrom(bytes, 0, result.Count)
}

let private reporter matchId =
    let value = LiveStateReporter.empty()
    value.PluginId <- "highbar-live"
    value.SchemaVersion <- "1.0.0"
    value.Protocol <- LiveControlProtocol.V1
    value.ProcessIncarnation <- "process-live"
    value.MatchIncarnation <- matchId
    value.StateChannelIncarnation <- "state-live"
    value

[<Tests>]
let tests = testList "production live boundary" [
    testTask "gateway refuses unselected origin and wrong broker session before provisioning authority" {
        let grpcPort = freePort()
        let! (handle: ServerHost.ServerHandle) =
            ServerHost.start
                { ServerHost.defaultOptions with listenAddress = sprintf "127.0.0.1:%d" grpcPort }
                (System.Version(1, 0)) ignore CancellationToken.None
        let channel = GrpcChannel.ForAddress(sprintf "http://127.0.0.1:%d" grpcPort)
        let coordinator = HighBarCoordinator.HighBarCoordinatorClient(channel)
        let heartbeat = HeartbeatRequest.empty()
        heartbeat.PluginId <- "highbar-live-auth"
        heartbeat.SchemaVersion <- "1.0.0"
        let! _ = coordinator.HeartbeatAsync(heartbeat).ResponseAsync
        let sessionId = Session.id (BrokerState.session handle.Hub).Value
        let origin = "http://127.0.0.1:4181"
        let browserPort = freePort()
        let! (gateway: Microsoft.Extensions.Hosting.IHost) =
            Gateway.startLiveAsync handle.Hub
                (Gateway.defaultLiveConfig (sprintf "http://127.0.0.1:%d" browserPort) origin "secret-live-auth" sessionId)
                CancellationToken.None
        let endpoint=Uri(sprintf "ws://127.0.0.1:%d/barc-live" browserPort)

        let wrongOrigin = new ClientWebSocket()
        wrongOrigin.Options.SetRequestHeader("Origin", "http://127.0.0.1:4182")
        let mutable originRefused=false
        try do! wrongOrigin.ConnectAsync(endpoint,CancellationToken.None)
        with :? WebSocketException -> originRefused<-true
        Expect.isTrue originRefused "an unselected browser Origin is refused at the HTTP upgrade boundary"

        let wrongSession = new ClientWebSocket()
        wrongSession.Options.SetRequestHeader("Origin",origin)
        do! wrongSession.ConnectAsync(endpoint,CancellationToken.None)
        let auth=ClientAuth(
                    Game="bar",ProtocolVersion="1.0.0",Profile="barc-live-v1",
                    Credential="secret-live-auth",Origin=origin,
                    ExpectedSessionId=ByteString.CopyFrom(Guid.NewGuid().ToByteArray()))
        do! send wrongSession (LiveClientEnvelope(Authenticate=auth))
        let buffer=Array.zeroCreate<byte> 256
        let mutable sessionRefused=false
        try
            let! (received:ValueWebSocketReceiveResult)=wrongSession.ReceiveAsync(Memory<byte>(buffer),CancellationToken.None).AsTask()
            sessionRefused<-received.MessageType=WebSocketMessageType.Close
        with :? WebSocketException -> sessionRefused<-true
        Expect.isTrue sessionRefused "a credential for another broker session is refused before bootstrap"
        Expect.isNone (LiveControl.currentBinding (BrokerState.liveControl handle.Hub)) "authentication refusals create no controller authority"
        wrongOrigin.Dispose()
        wrongSession.Dispose()

        do! gateway.StopAsync()
        (gateway :> IDisposable).Dispose()
        do! handle.DisposeAsync().AsTask()
        channel.Dispose()
    }
    testTask "native report, authenticated WebSocket, authority ACK, and ID0 command share exact identities" {
        let grpcPort = freePort()
        let! (handle: ServerHost.ServerHandle) =
            ServerHost.start
                { ServerHost.defaultOptions with listenAddress = sprintf "127.0.0.1:%d" grpcPort }
                (System.Version(1, 0)) ignore CancellationToken.None
        let channel = GrpcChannel.ForAddress(sprintf "http://127.0.0.1:%d" grpcPort)
        let coordinator = HighBarCoordinator.HighBarCoordinatorClient(channel)
        let live = HighBarLiveControl.HighBarLiveControlClient(channel)

        let heartbeat = HeartbeatRequest.empty()
        heartbeat.PluginId <- "highbar-live"
        heartbeat.SchemaVersion <- "1.0.0"
        let! _ = coordinator.HeartbeatAsync(heartbeat).ResponseAsync
        let sessionId = Session.id (BrokerState.session handle.Hub).Value
        let matchId = ByteString.CopyFrom(Array.init 16 byte)
        let source = reporter matchId

        let capabilities = LiveNativeCapabilities.empty()
        capabilities.MaxActorCount <- 64u
        capabilities.MaxBatchCommands <- 1u
        capabilities.MaxNativeUnitId <- 31999u
        capabilities.SnapshotCadenceCeilingFrames <- 30u
        capabilities.MaxObservationAgeMs <- 2000u
        capabilities.MaxReportedUnits <- 64u
        capabilities.MapWidthCells <- 1024u
        capabilities.MapHeightCells <- 1024u
        capabilities.MaxWorldXInclusive <- 8191f
        capabilities.MaxWorldZInclusive <- 8191f
        capabilities.SupportsStop <- true
        capabilities.SupportsMove <- true
        capabilities.SupportsAttackVisibleUnit <- true

        let invalidSource = reporter (ByteString.CopyFromUtf8("highbar-live-runtime-match-incarnation"))
        let invalidCapReport = LiveStateReport.empty()
        invalidCapReport.Reporter <- ValueSome invalidSource
        invalidCapReport.ReportSequence <- 9007199254740991UL
        invalidCapReport.Capabilities <- capabilities.Clone()
        let! (invalidCapAck: LiveStateReportAck) = live.ReportLiveStateAsync(invalidCapReport).ResponseAsync
        Expect.equal invalidCapAck.ReportSequence invalidCapReport.ReportSequence "refusal identifies the exact native report"
        Expect.equal invalidCapAck.Disposition LiveStateReportDisposition.LiveStateReportRefused "non-16-byte match incarnation is refused through the production RPC"
        Expect.isNone (LiveControl.latestCapabilities (BrokerState.liveControl handle.Hub)) "refused reporter installs no live capability"

        let capReport = LiveStateReport.empty()
        capReport.Reporter <- ValueSome source
        capReport.ReportSequence <- 9007199254740993UL
        capReport.Capabilities <- capabilities
        let! (capAck: LiveStateReportAck) = live.ReportLiveStateAsync(capReport).ResponseAsync
        Expect.equal capAck.Disposition LiveStateReportDisposition.LiveStateReportRecorded "production gRPC records native capability"

        let basis = NativeObservationBasis.empty()
        basis.Token <- ByteString.CopyFrom(Array.rev [|0uy..15uy|])
        basis.StateSequence <- 9007199254740995UL
        basis.Frame <- 91u
        basis.MatchIncarnation <- matchId
        basis.ProcessIncarnation <- source.ProcessIncarnation
        basis.StateChannelIncarnation <- source.StateChannelIncarnation
        basis.SnapshotSendMonotonicNs <- 9007199254740997UL
        basis.EffectiveCadenceFrames <- 30u
        let actorRef = NativeUnitReference.empty()
        actorRef.Id <- 0u
        actorRef.Lifetime <- 9007199254740999UL
        let actor = NativeLiveUnitMetadata.empty()
        actor.Reference <- ValueSome actorRef
        actor.Eligibility <- NativeLiveUnitEligibility.NativeLiveUnitOwnedActor
        let metadata = LiveSnapshotMetadata.empty()
        metadata.Basis <- ValueSome basis
        metadata.Units.Add actor
        let stateReport = LiveStateReport.empty()
        stateReport.Reporter <- ValueSome source
        stateReport.ReportSequence <- 9007199254741001UL
        stateReport.Snapshot <- metadata
        let! (stateAck: LiveStateReportAck) = live.ReportLiveStateAsync(stateReport).ResponseAsync
        Expect.equal stateAck.Disposition LiveStateReportDisposition.LiveStateReportRecorded "production gRPC records exact basis and lifetime"

        let controlSub = LiveControlSubscribe.empty()
        controlSub.PluginId <- source.PluginId
        controlSub.SchemaVersion <- source.SchemaVersion
        controlSub.Protocol <- LiveControlProtocol.V1
        controlSub.ControlChannelIncarnation <- "control-live"
        let controlCall = live.OpenLiveControlChannelAsync(controlSub)
        let seedBinding = LiveBinding.empty()
        seedBinding.PluginId <- source.PluginId
        seedBinding.CommandChannelIncarnation <- "command-live"
        let commandSub = LiveCommandSubscribe.empty()
        commandSub.PluginId <- source.PluginId
        commandSub.SchemaVersion <- source.SchemaVersion
        commandSub.Protocol <- LiveControlProtocol.V1
        commandSub.Binding <- ValueSome seedBinding
        let commandCall = live.OpenLiveCommandChannelAsync(commandSub)
        do! Task.Delay 50

        let push = coordinator.PushStateAsync()
        let own = OwnUnit.empty()
        own.UnitId <- 0u
        own.DefId <- 501u
        own.TeamId <- 0
        let position = Vector3.empty()
        position.X <- 10f
        position.Z <- 20f
        own.Position <- ValueSome position
        let snapshot = StateSnapshot.empty()
        snapshot.OwnUnits.Add own
        let update = StateUpdate.empty()
        update.Seq <- basis.StateSequence
        update.Frame <- basis.Frame
        update.Snapshot <- snapshot
        do! push.RequestStream.WriteAsync update
        let deadline = DateTimeOffset.UtcNow.AddSeconds 3.0
        while BrokerState.browserLatest handle.Hub |> Option.isNone do
            if DateTimeOffset.UtcNow > deadline then failtest "production observation did not materialize"
            do! Task.Delay 10

        let origin = "http://127.0.0.1:4179"
        let browserPort = freePort()
        let! (gateway: Microsoft.Extensions.Hosting.IHost) =
            Gateway.startLiveAsync handle.Hub
                (Gateway.defaultLiveConfig (sprintf "http://127.0.0.1:%d" browserPort) origin "secret-live" sessionId)
                CancellationToken.None
        let socket = new ClientWebSocket()
        socket.Options.SetRequestHeader("Origin", origin)
        do! socket.ConnectAsync(Uri(sprintf "ws://127.0.0.1:%d/barc-live" browserPort), CancellationToken.None)
        let auth = ClientAuth(Game="bar",ProtocolVersion="1.0.0",Profile="barc-live-v1",Credential="secret-live",Origin=origin,ExpectedSessionId=ByteString.CopyFrom(sessionId.ToByteArray()))
        do! send socket (LiveClientEnvelope(Authenticate=auth))
        let! (bootstrap: LiveServerEnvelope) = receive socket
        let! (observation: LiveServerEnvelope) = receive socket
        Expect.equal bootstrap.Bootstrap.LiveProfile "barc-live-v1" "live profile is explicitly negotiated"
        Expect.equal observation.Observation.Basis.StateSequence basis.StateSequence "production observation pairs with native metadata"
        Expect.equal observation.Observation.Units[0].Reference.Id 0UL "legal unit zero crosses WebSocket as a present reference"

        let laterBasis = basis.Clone()
        laterBasis.Token <- ByteString.CopyFrom(Array.init 16 (fun index -> byte (index + 16)))
        laterBasis.StateSequence <- basis.StateSequence + 2UL
        laterBasis.Frame <- basis.Frame + 1u
        laterBasis.SnapshotSendMonotonicNs <- basis.SnapshotSendMonotonicNs + 2UL
        let laterUpdate = StateUpdate.empty()
        laterUpdate.Seq <- laterBasis.StateSequence
        laterUpdate.Frame <- laterBasis.Frame
        laterUpdate.Snapshot <- snapshot.Clone()
        do! push.RequestStream.WriteAsync laterUpdate
        let laterDeadline = DateTimeOffset.UtcNow.AddSeconds 3.0
        while (match BrokerState.browserLatest handle.Hub with
               | Some(Snapshot.Current current) -> current.sequence <> laterBasis.StateSequence
               | _ -> true) do
            if DateTimeOffset.UtcNow > laterDeadline then failtest "state-first production observation did not materialize"
            do! Task.Delay 10
        let laterMetadata = LiveSnapshotMetadata.empty()
        laterMetadata.Basis <- ValueSome laterBasis
        laterMetadata.Units.Add(actor.Clone())
        let laterReport = LiveStateReport.empty()
        laterReport.Reporter <- ValueSome source
        laterReport.ReportSequence <- stateReport.ReportSequence + 2UL
        laterReport.Snapshot <- laterMetadata
        let! (laterAck: LiveStateReportAck) = live.ReportLiveStateAsync(laterReport).ResponseAsync
        Expect.equal laterAck.Disposition LiveStateReportDisposition.LiveStateReportRecorded "metadata arriving second is recorded"
        LiveControl.noteMetadataReported laterBasis.StateSequence (BrokerState.liveControl handle.Hub)
        LiveControl.noteMetadataReported laterBasis.StateSequence (BrokerState.liveControl handle.Hub)
        let! (pairedObservation: LiveServerEnvelope) = receive socket
        Expect.equal pairedObservation.Observation.Basis.StateSequence laterBasis.StateSequence "metadata arrival replays the exact already-materialized sequence"

        let controller = bootstrap.Bootstrap.Controller.Clone()
        let moduleId = LiveModuleIdentity(Sha256=ByteString.CopyFrom(Array.create 32 0x42uy),Generation=9007199254741005UL)
        do! send socket (LiveClientEnvelope(Arm=ArmController(Controller=controller,Module=moduleId)))
        let! hasControl = controlCall.ResponseStream.MoveNext(CancellationToken.None)
        Expect.isTrue hasControl "native priority control stream receives arm"
        let directive: LiveControlDirective = controlCall.ResponseStream.Current
        let ack = LiveControlAckReport.empty()
        ack.Binding <- directive.Binding
        ack.ControlSequence <- directive.ControlSequence
        ack.Kind <- directive.Kind
        ack.Disposition <- LiveControlAckDisposition.LiveControlAckRecorded
        let! (acked: LiveControlAckResponse) = live.ReportLiveControlAckAsync(ack).ResponseAsync
        Expect.equal acked.Disposition LiveControlAckDisposition.LiveControlAckRecorded "native authority ACK is correlated"
        let! (requested: LiveServerEnvelope) = receive socket
        let! (confirmed: LiveServerEnvelope) = receive socket
        Expect.equal requested.ControllerState.Stage Broker.Browser.Contracts.ControllerStage.ArmRequested "browser sees requested state without assuming authority"
        Expect.equal confirmed.ControllerState.Stage Broker.Browser.Contracts.ControllerStage.ArmNativeConfirmed "browser enables submission only after native ACK"

        let submit = SubmitLiveIntent(ParentId=ByteString.CopyFrom(Guid.NewGuid().ToByteArray()),InputId=ByteString.CopyFrom(Guid.NewGuid().ToByteArray()),Controller=controller,Module=moduleId,Basis=pairedObservation.Observation.Basis)
        submit.Intent <- LiveIntent(Stop=StopAction())
        submit.Intent.Actors.Add(UnitReference(Id=0UL,Lifetime=actorRef.Lifetime))
        do! send socket (LiveClientEnvelope(Submit=submit))
        let! (brokerResult: LiveServerEnvelope) = receive socket
        Expect.equal brokerResult.Result.Stage LiveResultStage.BrokerAdmission "broker admission has one observable result path"
        Expect.equal brokerResult.Result.ChildCount 1u "result capacity is reserved per expanded child"
        Expect.equal brokerResult.Result.Basis.StateSequence laterBasis.StateSequence "result preserves the exact observation basis"
        Expect.equal brokerResult.Result.Controller.ControllerId controller.ControllerId "result preserves the exact controller"
        Expect.equal brokerResult.Result.Module.Sha256 moduleId.Sha256 "result preserves the exact module hash"
        let! hasCommand = commandCall.ResponseStream.MoveNext(CancellationToken.None)
        Expect.isTrue hasCommand "native live gameplay stream receives admitted child"
        let child: LiveCommandBatch = commandCall.ResponseStream.Current
        Expect.equal child.Actor.Value.Id 0u "native child preserves legal unit zero"
        Expect.equal child.Actor.Value.Lifetime actorRef.Lifetime "native child preserves >2^53 lifetime"
        Expect.equal child.Batch.Value.Commands.Count 1 "live wrapper carries exactly one matching command"

        do! send socket (LiveClientEnvelope(Revoke=RevokeController(Controller=controller,Reason="test rearm")))
        let! (revokeRequested: LiveServerEnvelope) = receive socket
        Expect.equal revokeRequested.ControllerState.Stage Broker.Browser.Contracts.ControllerStage.RevokeRequested "browser disarms while native revoke is pending"
        let mutable revokeDirective = Unchecked.defaultof<LiveControlDirective>
        let mutable foundRevoke = false
        while not foundRevoke do
            let! more = controlCall.ResponseStream.MoveNext(CancellationToken.None)
            Expect.isTrue more "control stream remains available for revoke"
            revokeDirective <- controlCall.ResponseStream.Current
            foundRevoke <- revokeDirective.Kind=LiveControlDirectiveKind.Revoke
        let revokeAck = LiveControlAckReport.empty()
        revokeAck.Binding<-revokeDirective.Binding
        revokeAck.ControlSequence<-revokeDirective.ControlSequence
        revokeAck.Kind<-revokeDirective.Kind
        revokeAck.Disposition<-LiveControlAckDisposition.LiveControlAckRecorded
        let! (_: LiveControlAckResponse) = live.ReportLiveControlAckAsync(revokeAck).ResponseAsync
        let! (revoked: LiveServerEnvelope) = receive socket
        let! (replacement: LiveServerEnvelope) = receive socket
        let! (replacementObservation: LiveServerEnvelope) = receive socket
        Expect.equal revoked.ControllerState.Stage Broker.Browser.Contracts.ControllerStage.RevokeNativeConfirmed "old binding is confirmed revoked"
        Expect.isGreaterThan replacement.Bootstrap.Controller.AuthorityEpoch controller.AuthorityEpoch "replacement bootstrap carries a newer broker epoch"
        Expect.notEqual replacement.Bootstrap.Controller.ControllerId controller.ControllerId "replacement bootstrap carries a fresh controller identity"
        Expect.equal replacementObservation.Observation.Basis.StateSequence laterBasis.StateSequence "replacement immediately replays the same truthful paired observation"

        BrokerState.closeSession Session.OperatorTerminated DateTimeOffset.UtcNow handle.Hub
        let closeTimeout = new CancellationTokenSource(TimeSpan.FromSeconds 3.0)
        let closeBuffer = Array.zeroCreate<byte> 128
        let mutable closed = false
        try
            while not closed do
                let! (received: ValueWebSocketReceiveResult) = socket.ReceiveAsync(Memory<byte>(closeBuffer), closeTimeout.Token).AsTask()
                closed <- received.MessageType=WebSocketMessageType.Close
        with :? WebSocketException -> closed <- true
        Expect.isTrue closed "session replacement closes the authenticated live socket"
        closeTimeout.Dispose()
        socket.Dispose()
        do! gateway.StopAsync()
        (gateway :> IDisposable).Dispose()
        controlCall.Dispose()
        commandCall.Dispose()
        do! push.RequestStream.CompleteAsync()
        do! handle.DisposeAsync().AsTask()
        channel.Dispose()
    }
]
