module Broker.Browser.Protocol.Tests.GatewayTests

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

let private receive (socket: ClientWebSocket) : Task<ServerEnvelope> = task {
    let bytes = Array.zeroCreate<byte> 65536
    let! result = socket.ReceiveAsync(Memory<byte>(bytes), CancellationToken.None).AsTask()
    return ServerEnvelope.Parser.ParseFrom(bytes, 0, result.Count)
}

let private connect (url: string) (origin: string) (auth: ClientAuth) : Task<ClientWebSocket> = task {
    let socket = new ClientWebSocket()
    socket.Options.SetRequestHeader("Origin", origin)
    do! socket.ConnectAsync(Uri url, CancellationToken.None)
    let envelope = ClientEnvelope(Authenticate = auth)
    let bytes = envelope.ToByteArray()
    do! socket.SendAsync(ReadOnlyMemory<byte>(bytes), WebSocketMessageType.Binary, true, CancellationToken.None).AsTask()
    return socket
}

let private observation (sessionId: Guid) (sequence: uint64) : Snapshot.BrowserObservation =
    { sessionId = sessionId
      sequence = sequence
      capturedAt = DateTimeOffset.FromUnixTimeMilliseconds 1770000000123L
      perspectiveId = "ignored-by-boundary"
      units =
        [ { id = 77UL; definitionId = Some 501u; teamId = Some 7
            observation = Snapshot.Own
            position = { x = 11.25f; elevation = Some 403.5f; z = -37.5f }
            health = Some 123.5f; maxHealth = Some 800.0f; generation = None }
          { id = 99UL; definitionId = None; teamId = None
            observation = Snapshot.Radar
            position = { x = 73.25f; elevation = Some 0.0f; z = -8.5f }
            health = None; maxHealth = None; generation = None } ]
      features = []
      teamEconomy = None }

let private setupHub () =
    let hub = BrokerState.create (System.Version(1, 0)) 16 ignore
    let now = DateTimeOffset.UtcNow
    Expect.isOk (BrokerState.openGuestSession now hub) "guest session opens"
    let link : Session.ProxyAiLink =
        { attachedAt = now; protocolVersion = System.Version(1, 0); lastSnapshotAt = None
          keepAliveIntervalMs = 1000; pluginId = "highbar"; schemaVersion = "1.0.0"
          engineSha256 = "fixture"; lastHeartbeatAt = now; lastSeq = 0UL }
    Expect.isOk (BrokerState.attachCoordinator link hub) "coordinator attaches"
    hub, Session.id (BrokerState.session hub).Value

let private auth (sessionId: Guid) (origin: string) (credential: string) =
    ClientAuth(Game = "bar", ProtocolVersion = "1.0.0", Profile = "barc-preview-v1",
               Credential = credential, Origin = origin,
               ExpectedSessionId = ByteString.CopyFrom(sessionId.ToByteArray()))

[<Tests>]
let tests = testList "authenticated browser preview boundary" [
    testTask "real coordinator stream materializes through broker to authenticated WebSocket" {
        let grpcPort = freePort()
        let! (handle: ServerHost.ServerHandle) =
            ServerHost.start
                { ServerHost.defaultOptions with listenAddress = sprintf "127.0.0.1:%d" grpcPort }
                (System.Version(1, 0)) ignore CancellationToken.None
        let channel = GrpcChannel.ForAddress(sprintf "http://127.0.0.1:%d" grpcPort)
        let coordinator = HighBarCoordinator.HighBarCoordinatorClient(channel)
        let heartbeat = HeartbeatRequest.empty()
        heartbeat.PluginId <- "highbar-browser"
        heartbeat.SchemaVersion <- "1.0.0"
        let! _ = coordinator.HeartbeatAsync(heartbeat).ResponseAsync
        let sessionId = Session.id (BrokerState.session handle.Hub).Value
        let origin = "http://127.0.0.1:4173"
        let browserPort = freePort()
        let httpUrl = sprintf "http://127.0.0.1:%d" browserPort
        let wsUrl = sprintf "ws://127.0.0.1:%d/barc-preview" browserPort
        let! (gateway: Microsoft.Extensions.Hosting.IHost) =
            Gateway.startAsync handle.Hub
                { Gateway.defaultConfig httpUrl origin "secret" sessionId with perspectiveId = "highbar-browser" }
                CancellationToken.None
        let push = coordinator.PushStateAsync()
        let pos = Vector3.empty()
        pos.X <- 11.25f; pos.Y <- 403.5f; pos.Z <- -37.5f
        let own = OwnUnit.empty()
        own.UnitId <- 77u; own.DefId <- 501u; own.TeamId <- 7
        own.Health <- 10.0f; own.MaxHealth <- 20.0f; own.Position <- ValueSome pos
        let snapshot = StateSnapshot.empty()
        snapshot.OwnUnits.Add own
        let update = StateUpdate.empty()
        update.Seq <- 9007199254740993UL; update.Frame <- 10u; update.Snapshot <- snapshot
        do! push.RequestStream.WriteAsync update
        let deadline = DateTimeOffset.UtcNow.AddSeconds 3.0
        while BrokerState.browserLatest handle.Hub |> Option.isNone do
            if DateTimeOffset.UtcNow > deadline then failtest "coordinator snapshot did not materialize"
            do! Task.Delay 10
        let! (socket: ClientWebSocket) = connect wsUrl origin (auth sessionId origin "secret")
        let! (_: ServerEnvelope) = receive socket
        let! (state: ServerEnvelope) = receive socket
        Expect.equal state.Observation.Sequence 9007199254740993UL "coordinator uint64 reaches WebSocket"
        Expect.equal state.Observation.Units.[0].Position.Elevation 403.5f "coordinator elevation reaches WebSocket"
        socket.Abort(); socket.Dispose(); push.Dispose(); channel.Dispose()
        do! gateway.StopAsync()
        do! (handle :> IAsyncDisposable).DisposeAsync().AsTask()
    }

    testTask "current stale late-subscriber and recovery preserve full uint64 values" {
        let hub, sessionId = setupHub()
        let origin = "http://127.0.0.1:4173"
        let port = freePort()
        let httpUrl = sprintf "http://127.0.0.1:%d" port
        let wsUrl = sprintf "ws://127.0.0.1:%d/barc-preview" port
        let config = { Gateway.defaultConfig httpUrl origin "secret" sessionId with perspectiveId = "team-7" }
        let! (host: Microsoft.Extensions.Hosting.IHost) = Gateway.startAsync hub config CancellationToken.None
        BrokerState.applyBrowserObservation "team-7" (observation sessionId 9007199254740993UL) hub
        let! (socket: ClientWebSocket) = connect wsUrl origin (auth sessionId origin "secret")
        let! (bootstrap: ServerEnvelope) = receive socket
        let! (current: ServerEnvelope) = receive socket
        Expect.equal bootstrap.Bootstrap.PerspectiveId "team-7" "bootstrap identifies perspective"
        Expect.equal current.Observation.Sequence 9007199254740993UL "uint64 remains exact"
        Expect.equal current.Observation.Units.[0].Position.Elevation 403.5f "elevation is retained"
        Expect.equal current.Observation.Units.[1].Observation ObservationKind.Radar "radar provenance retained"
        Expect.isFalse current.Observation.Units.[1].HasHealth "hidden health stays absent"
        BrokerState.invalidateBrowserFeed 9007199254740993UL 9007199254740995UL "gap" hub
        let! (staleState: ServerEnvelope) = receive socket
        Expect.equal staleState.Observation.Validity.Status ValidityStatus.Stale "live subscriber sees invalidation"
        let! (late: ClientWebSocket) = connect wsUrl origin (auth sessionId origin "secret")
        let! (lateBootstrap: ServerEnvelope) = receive late
        let! (lateState: ServerEnvelope) = receive late
        Expect.equal lateBootstrap.Bootstrap.Validity.Status ValidityStatus.Stale "late bootstrap is stale"
        Expect.equal lateState.Observation.Validity.ReceivedSequence 9007199254740995UL "gap identity retained"
        BrokerState.applyBrowserObservation "team-7" (observation sessionId 9007199254740996UL) hub
        let! (recovered: ServerEnvelope) = receive socket
        Expect.equal recovered.Observation.Sequence 9007199254740996UL "complete replacement recovers"
        socket.Abort(); socket.Dispose(); late.Abort(); late.Dispose()
        do! host.StopAsync()
    }

    testTask "wrong origin and stale credential are refused before preview data" {
        let hub, sessionId = setupHub()
        let origin = "http://127.0.0.1:4173"
        let port = freePort()
        let httpUrl = sprintf "http://127.0.0.1:%d" port
        let wsUrl = sprintf "ws://127.0.0.1:%d/barc-preview" port
        let expired = { Gateway.defaultConfig httpUrl origin "expired" sessionId with credentialExpiresAt = DateTimeOffset.UtcNow.AddSeconds(-1.0) }
        let! (host: Microsoft.Extensions.Hosting.IHost) = Gateway.startAsync hub expired CancellationToken.None
        let! (stale: ClientWebSocket) = connect wsUrl origin (auth sessionId origin "expired")
        let bytes = Array.zeroCreate<byte> 128
        let! (closed: ValueWebSocketReceiveResult) = stale.ReceiveAsync(Memory<byte>(bytes), CancellationToken.None).AsTask()
        Expect.equal closed.MessageType WebSocketMessageType.Close "expired credential closes socket"
        let mutable refused = false
        try
            let! (unexpected: ClientWebSocket) = connect wsUrl "https://hostile.invalid" (auth sessionId "https://hostile.invalid" "expired")
            unexpected.Dispose()
        with _ -> refused <- true
        Expect.isTrue refused "wrong HTTP origin must not upgrade"
        stale.Abort(); stale.Dispose()
        do! host.StopAsync()
    }

    testTask "post-auth hostile frames cannot enter an active coordinator command channel" {
        let hub, sessionId = setupHub()
        let claim = BrokerState.tryClaimCoordinatorCommandChannel "highbar" "browser-test" hub
        let reader = match claim with BrokerState.Claimed lease -> lease.reader | other -> failtestf "expected command lease, got %A" other
        let origin = "http://127.0.0.1:4173"
        let port = freePort()
        let httpUrl = sprintf "http://127.0.0.1:%d" port
        let wsUrl = sprintf "ws://127.0.0.1:%d/barc-preview" port
        let! (host: Microsoft.Extensions.Hosting.IHost) = Gateway.startAsync hub (Gateway.defaultConfig httpUrl origin "secret" sessionId) CancellationToken.None
        let! (socket: ClientWebSocket) = connect wsUrl origin (auth sessionId origin "secret")
        let! _ = receive socket
        let hostile = ClientEnvelope(Authenticate = auth sessionId origin "secret").ToByteArray()
        do! socket.SendAsync(ReadOnlyMemory<byte>(hostile), WebSocketMessageType.Binary, true, CancellationToken.None).AsTask()
        do! Task.Delay 50
        let mutable delivery = Unchecked.defaultof<BrokerState.OutboundDelivery>
        Expect.isFalse (reader.TryRead(&delivery)) "browser input cannot enqueue a native command"
        socket.Abort(); socket.Dispose()
        do! host.StopAsync()
    }

    testTask "malformed and oversized authentication frames are refused" {
        let hub, sessionId = setupHub()
        let origin = "http://127.0.0.1:4173"
        let port = freePort()
        let httpUrl = sprintf "http://127.0.0.1:%d" port
        let wsUrl = sprintf "ws://127.0.0.1:%d/barc-preview" port
        let! (host: Microsoft.Extensions.Hosting.IHost) =
            Gateway.startAsync hub (Gateway.defaultConfig httpUrl origin "secret" sessionId) CancellationToken.None
        let raw () = task {
            let socket = new ClientWebSocket()
            socket.Options.SetRequestHeader("Origin", origin)
            do! socket.ConnectAsync(Uri wsUrl, CancellationToken.None)
            return socket }
        let! (malformed: ClientWebSocket) = raw ()
        do! malformed.SendAsync(ReadOnlyMemory<byte>([| 0xffuy |]), WebSocketMessageType.Binary, true, CancellationToken.None).AsTask()
        let closeBuffer = Array.zeroCreate<byte> 128
        let! (malformedClose: ValueWebSocketReceiveResult) = malformed.ReceiveAsync(Memory<byte>(closeBuffer), CancellationToken.None).AsTask()
        Expect.equal malformedClose.MessageType WebSocketMessageType.Close "malformed protobuf closes socket"
        let! (oversized: ClientWebSocket) = raw ()
        let full = Array.zeroCreate<byte> 65536
        do! oversized.SendAsync(ReadOnlyMemory<byte>(full), WebSocketMessageType.Binary, false, CancellationToken.None).AsTask()
        do! oversized.SendAsync(ReadOnlyMemory<byte>([| 0uy |]), WebSocketMessageType.Binary, true, CancellationToken.None).AsTask()
        let! (oversizedClose: ValueWebSocketReceiveResult) = oversized.ReceiveAsync(Memory<byte>(closeBuffer), CancellationToken.None).AsTask()
        Expect.equal oversizedClose.MessageType WebSocketMessageType.Close "oversized frame closes socket"
        malformed.Dispose(); oversized.Dispose()
        do! host.StopAsync()
    }
]
