module Broker.Browser.Preview.Tests.PreviewTests

open System
open System.IO
open System.Net
open System.Net.Http
open System.Net.Sockets
open System.Net.WebSockets
open System.Text.Json
open System.Threading
open System.Threading.Tasks
open Expecto
open Google.Protobuf
open Broker.Core
open Broker.Browser.Contracts
open Broker.Browser.Preview
open Broker.Protocol

let private freePort () =
    use listener = new TcpListener(IPAddress.Loopback, 0)
    listener.Start()
    let port = (listener.LocalEndpoint :?> IPEndPoint).Port
    listener.Stop()
    port

let private tempDirectory () =
    let path = Path.Combine(Path.GetTempPath(), "barc-preview-" + Guid.NewGuid().ToString("N"))
    Directory.CreateDirectory path |> ignore
    path

let private parentDirectory (path: string) =
    match Path.GetDirectoryName path with
    | null -> failwith "path has no directory"
    | value -> value

let private write (path: string) (text: string) =
    Directory.CreateDirectory(parentDirectory path) |> ignore
    File.WriteAllText(path, text)

let private createAssets root =
    write (Path.Combine(root, "assets/barc-preview.js")) "export function mount(root, options) { root.textContent = 'BARC preview client'; return { dispose() {} }; }"
    write (Path.Combine(root, "assets/barc-preview.css")) "#barc-preview { display: block; }"
    write (Path.Combine(root, "src/Broker.Browser.Wasm/guest-worker.js")) "export {};"
    write (Path.Combine(root, "src/Broker.Browser.Wasm/guest-supervisor.js")) "export {};"
    write (Path.Combine(root, "src/Broker.Browser.Contracts/generated/codec.js")) "export {};"
    write (Path.Combine(root, "src/Broker.Browser.Contracts/generated/barc_browser.js")) "export {};"
    for name in [ "manual-preview.wasm"; "custom-preview.wasm" ] do
        let path = Path.Combine(root, "guests", name)
        Directory.CreateDirectory(parentDirectory path) |> ignore
        File.WriteAllBytes(path, [| 0uy; 97uy; 115uy; 109uy; 1uy; 0uy; 0uy; 0uy |])

let private config (root: string) (ready: string) (lifetime: TimeSpan) (timing: PreviewHost.FixtureTiming) : PreviewHost.Config =
    { assetsRoot = root
      basePath = "/barc/"
      grpcPort = freePort()
      gatewayPort = freePort()
      staticPort = freePort()
      readyFile = ready
      qualificationReceipt = None
      fixtureMode = true
      credentialLifetime = lifetime
      fixtureTiming = timing }

let private receive (socket: ClientWebSocket) ct : Task<ServerEnvelope> = task {
    use data = new MemoryStream()
    let buffer = Array.zeroCreate<byte> 4096
    let mutable finished = false
    let mutable closed = false
    while not finished && not closed do
        let! result = socket.ReceiveAsync(Memory<byte>(buffer), ct).AsTask()
        closed <- result.MessageType = WebSocketMessageType.Close
        if not closed then
            data.Write(buffer, 0, result.Count)
            finished <- result.EndOfMessage
    if closed then return raise (EndOfStreamException "preview socket closed")
    else return ServerEnvelope.Parser.ParseFrom(data.ToArray())
}

let private authenticate (url: string) (origin: string) (sessionId: string) (credential: string) ct = task {
    let socket = new ClientWebSocket()
    socket.Options.SetRequestHeader("Origin", origin)
    do! socket.ConnectAsync(Uri url, ct)
    let auth =
        ClientAuth(Game = "bar", ProtocolVersion = "1.0.0", Profile = "barc-preview-v1",
                   Credential = credential, Origin = origin,
                   ExpectedSessionId = ByteString.CopyFrom(Guid.Parse(sessionId).ToByteArray()))
    let bytes = ClientEnvelope(Authenticate = auth).ToByteArray()
    do! socket.SendAsync(ReadOnlyMemory<byte>(bytes), WebSocketMessageType.Binary, true, ct).AsTask()
    return socket
}

let private getString (name: string) (json: JsonElement) =
    json.GetProperty(name).GetString() |> Option.ofObj |> Option.defaultWith (fun () -> failwithf "%s is null" name)

[<Tests>]
let tests = testList "BARC preview companion" [
    testTask "private handoff drives rich public gRPC fixture through authenticated gateway and replacement" {
        let root = tempDirectory()
        createAssets root
        let privateRoot = tempDirectory()
        let ready = Path.Combine(privateRoot, "ready.json")
        let receipt = Path.Combine(privateRoot, "qualification.json")
        let timing : PreviewHost.FixtureTiming =
            { secondSnapshot = TimeSpan.FromMilliseconds 600.0
              gap = TimeSpan.FromMilliseconds 100.0
              recovery = TimeSpan.FromMilliseconds 100.0
              replacement = TimeSpan.FromMilliseconds 250.0 }
        let settings = { config root ready (TimeSpan.FromSeconds 10.0) timing with qualificationReceipt = Some receipt }
        let timeout = new CancellationTokenSource(TimeSpan.FromSeconds 10.0)
        let! (handle: PreviewHost.Handle) = PreviewHost.start settings timeout.Token
        Expect.isTrue (File.Exists ready) "ready handoff exists"
        if not (OperatingSystem.IsWindows()) then
            Expect.equal (File.GetUnixFileMode ready) (UnixFileMode.UserRead ||| UnixFileMode.UserWrite) "ready handoff is mode 0600"
        let document = JsonDocument.Parse(File.ReadAllBytes ready)
        let handoff = document.RootElement
        Expect.equal (getString "schema" handoff) "barc.preview.ready/v1" "ready schema is versioned"
        Expect.isTrue (handoff.GetProperty("fixtureMode").GetBoolean()) "fixture mode is explicit"
        let staticBase = getString "staticBaseUrl" handoff
        let gatewayUrl = getString "gatewayWebSocketUrl" handoff
        let sessionId = getString "sessionId" handoff
        let credential = getString "credential" handoff
        Expect.isFalse (staticBase.Contains credential) "credential is absent from static URL"
        Expect.isFalse (gatewayUrl.Contains credential) "credential is absent from gateway URL"
        let http = new HttpClient()
        let! (response: HttpResponseMessage) = http.GetAsync(staticBase, timeout.Token)
        let! (page: string) = response.Content.ReadAsStringAsync(timeout.Token)
        Expect.equal response.StatusCode HttpStatusCode.OK "static client page is served"
        Expect.stringContains page "Fixture mode" "fixture is visibly labelled"
        Expect.stringContains page "assets/barc-preview.js" "stable client entry is imported"
        Expect.isFalse (page.Contains credential) "credential is absent from served HTML"
        Expect.equal (response.Headers.GetValues("Cache-Control") |> Seq.exactlyOne) "no-store" "static responses are private"
        let origin = sprintf "http://127.0.0.1:%d" settings.staticPort
        let! (socket: ClientWebSocket) = authenticate gatewayUrl origin sessionId credential timeout.Token
        let! (bootstrap: ServerEnvelope) = receive socket timeout.Token
        let! (initial: ServerEnvelope) = receive socket timeout.Token
        Expect.equal (Guid(initial.Observation.SessionId.ToByteArray()).ToString()) sessionId "observation matches authenticated session"
        Expect.equal initial.Observation.Sequence 9007199254740993UL "uint64 sequence stays exact"
        Expect.equal bootstrap.Bootstrap.SessionId initial.Observation.SessionId "bootstrap and observation session agree"
        Expect.equal bootstrap.Bootstrap.Limits.MaxEntities 64u "companion advertises the guest entity bound"
        Expect.equal bootstrap.Bootstrap.Limits.MaxFrameBytes 65536u "companion advertises the encoded frame bound"
        let units = initial.Observation.Units
        Expect.equal units.Count 3 "own, visible, and radar units cross the public path"
        Expect.equal units.[0].Observation ObservationKind.Own "own provenance is retained"
        Expect.equal units.[0].Position.Elevation 403.5f "own elevation is retained"
        Expect.equal units.[1].Observation ObservationKind.Visual "visible provenance is retained"
        Expect.equal units.[2].Observation ObservationKind.Radar "radar provenance is retained"
        Expect.isFalse units.[2].HasDefinitionId "unknown radar definition remains absent"
        Expect.isFalse units.[2].HasTeamId "unknown radar team remains absent"
        Expect.isFalse units.[2].HasHealth "unknown radar health remains absent"
        Expect.equal initial.Observation.Features.[0].Id 77UL "feature IDs remain independent of unit IDs"
        Expect.equal initial.Observation.Features.[0].Position.Elevation 222.25f "feature elevation is retained"
        Expect.isFalse initial.Observation.TeamEconomy.HasTeamId "unknown economy team remains absent"
        let! (second: ServerEnvelope) = receive socket timeout.Token
        Expect.equal second.Observation.Sequence 9007199254740994UL "next complete snapshot arrives"
        let! (stale: ServerEnvelope) = receive socket timeout.Token
        Expect.equal stale.Observation.Validity.Status ValidityStatus.Stale "sequence gap invalidates the feed"
        Expect.equal stale.Observation.Validity.ReceivedSequence 9007199254740996UL "gap identity is exact"
        let! (recovered: ServerEnvelope) = receive socket timeout.Token
        Expect.equal recovered.Observation.Sequence 9007199254740997UL "complete snapshot recovers the feed"
        Expect.equal recovered.Observation.Validity.Status ValidityStatus.Current "recovery is current"
        let closeBuffer = Array.zeroCreate<byte> 128
        let! (closed: ValueWebSocketReceiveResult) = socket.ReceiveAsync(Memory<byte>(closeBuffer), timeout.Token).AsTask()
        Expect.equal closed.MessageType WebSocketMessageType.Close "native session replacement closes old credential"
        let replacement = BrokerState.session handle.Hub |> Option.map Session.id
        Expect.isSome replacement "replacement session is live"
        Expect.notEqual replacement (Some(Guid.Parse sessionId)) "fixture replaces the original session"
        Expect.equal handle.NativeSubmissionCount 0 "preview composition submits no native command"
        socket.Dispose()
        do! (handle :> IAsyncDisposable).DisposeAsync().AsTask()
        Expect.isTrue (File.Exists receipt) "normal teardown writes the qualification receipt"
        if not (OperatingSystem.IsWindows()) then
            Expect.equal (File.GetUnixFileMode receipt) (UnixFileMode.UserRead ||| UnixFileMode.UserWrite) "qualification receipt is mode 0600"
        let qualification = JsonDocument.Parse(File.ReadAllBytes receipt)
        Expect.equal (getString "schema" qualification.RootElement) "barc.preview.qualification/v1" "qualification schema is versioned"
        Expect.equal (qualification.RootElement.GetProperty("nativeSubmissionCount").GetInt32()) 0 "qualification independently records zero native submissions"
        Expect.isTrue (qualification.RootElement.GetProperty("cleanShutdown").GetBoolean()) "receipt is written only after clean shutdown"
        qualification.Dispose()
        http.Dispose()
        document.Dispose()
        timeout.Dispose()
        Expect.isFalse (File.Exists ready) "private handoff is removed on teardown"
        Directory.Delete(root, true)
        Directory.Delete(privateRoot, true)
    }

    testTask "asset and ready-file validation fail closed before listeners start" {
        let root = tempDirectory()
        createAssets root
        let privateRoot = tempDirectory()
        let ready = Path.Combine(privateRoot, "ready.json")
        File.WriteAllText(ready, "occupied")
        let settings = config root ready (TimeSpan.FromSeconds 1.0) PreviewHost.defaultFixtureTiming
        let mutable existingRefused = false
        try
            let! handle = PreviewHost.start settings CancellationToken.None
            do! (handle :> IAsyncDisposable).DisposeAsync().AsTask()
        with :? ArgumentException -> existingRefused <- true
        Expect.isTrue existingRefused "existing handoff cannot be overwritten"
        File.Delete(Path.Combine(root, "guests/custom-preview.wasm"))
        File.Delete ready
        let mutable assetsRefused = false
        try
            let! handle = PreviewHost.start settings CancellationToken.None
            do! (handle :> IAsyncDisposable).DisposeAsync().AsTask()
        with :? ArgumentException -> assetsRefused <- true
        Expect.isTrue assetsRefused "incomplete trusted assets are refused"
        let mutable nonFixtureRefused = false
        try
            let! handle = PreviewHost.start { settings with fixtureMode = false } CancellationToken.None
            do! (handle :> IAsyncDisposable).DisposeAsync().AsTask()
        with :? ArgumentException -> nonFixtureRefused <- true
        Expect.isTrue nonFixtureRefused "unlabelled non-fixture operation is outside this horizon"
        Directory.Delete(root, true)
        Directory.Delete(privateRoot, true)
    }
]
