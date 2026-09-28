namespace Broker.Browser.Preview

open System
open System.IO
open System.Net
open System.Security.Cryptography
open System.Text
open System.Text.Json
open System.Threading
open System.Threading.Tasks
open Grpc.Net.Client
open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Hosting
open Microsoft.AspNetCore.Http
open Microsoft.Extensions.FileProviders
open Microsoft.Extensions.Hosting
open Broker.Core
open Broker.Protocol
open Broker.Browser.Gateway
open Highbar.V1

module PreviewHost =
    type FixtureTiming =
        { secondSnapshot: TimeSpan
          gap: TimeSpan
          recovery: TimeSpan
          replacement: TimeSpan }

    type Config =
        { assetsRoot: string
          basePath: string
          grpcPort: int
          gatewayPort: int
          staticPort: int
          readyFile: string
          qualificationReceipt: string option
          fixtureMode: bool
          credentialLifetime: TimeSpan
          fixtureTiming: FixtureTiming }

    let defaultFixtureTiming =
        { secondSnapshot = TimeSpan.FromSeconds 1.0
          gap = TimeSpan.FromSeconds 1.0
          recovery = TimeSpan.FromSeconds 1.0
          replacement = TimeSpan.FromSeconds 10.0 }

    let private loopback port = sprintf "127.0.0.1:%d" port
    let private http port = sprintf "http://127.0.0.1:%d" port
    let private ws port = sprintf "ws://127.0.0.1:%d/barc-preview" port

    let private validate (config: Config) =
        let fullRoot = Path.GetFullPath config.assetsRoot
        let ready = Path.GetFullPath config.readyFile
        if not config.fixtureMode then
            invalidArg "fixtureMode" "this preview horizon requires explicit fixture mode"
        if not (Directory.Exists fullRoot) then invalidArg "assetsRoot" "asset root does not exist"
        if config.basePath.Length < 3 || not (config.basePath.StartsWith "/") || not (config.basePath.EndsWith "/")
           || config.basePath.Contains("..") || config.basePath.Contains("//") then
            invalidArg "basePath" "base path must be a non-root absolute path ending in /"
        for port in [ config.grpcPort; config.gatewayPort; config.staticPort ] do
            if port < 1 || port > 65535 then invalidArg "port" "ports must be 1..65535"
        if Set.ofList [ config.grpcPort; config.gatewayPort; config.staticPort ] |> Set.count <> 3 then
            invalidArg "port" "gRPC, gateway, and static ports must be distinct"
        if String.IsNullOrWhiteSpace ready || File.Exists ready || Directory.Exists ready then
            invalidArg "readyFile" "ready file must be a new caller-owned path"
        let relativeReady = Path.GetRelativePath(fullRoot, ready)
        if relativeReady <> ".." && not (relativeReady.StartsWith(".." + string Path.DirectorySeparatorChar)) then
            invalidArg "readyFile" "ready file must be outside the public asset root"
        let qualificationReceipt =
            config.qualificationReceipt
            |> Option.map Path.GetFullPath
        qualificationReceipt |> Option.iter (fun receipt ->
            if String.IsNullOrWhiteSpace receipt || File.Exists receipt || Directory.Exists receipt then
                invalidArg "qualificationReceipt" "qualification receipt must be a new caller-owned path"
            if receipt = ready then
                invalidArg "qualificationReceipt" "qualification receipt and ready file must be distinct"
            let relativeReceipt = Path.GetRelativePath(fullRoot, receipt)
            if relativeReceipt <> ".." && not (relativeReceipt.StartsWith(".." + string Path.DirectorySeparatorChar)) then
                invalidArg "qualificationReceipt" "qualification receipt must be outside the public asset root")
        if config.credentialLifetime <= TimeSpan.Zero then invalidArg "credentialLifetime" "credential lifetime must be positive"
        let required =
            [ "assets/barc-preview.js"
              "assets/barc-preview.css"
              "src/Broker.Browser.Wasm/guest-worker.js"
              "src/Broker.Browser.Wasm/guest-supervisor.js"
              "src/Broker.Browser.Contracts/generated/codec.js"
              "src/Broker.Browser.Contracts/generated/barc_browser.js"
              "guests/manual-preview.wasm"
              "guests/custom-preview.wasm" ]
        for relative in required do
            if not (File.Exists(Path.Combine(fullRoot, relative))) then
                invalidArg "assetsRoot" (relative + " is required")
        for relative in [ "guests/manual-preview.wasm"; "guests/custom-preview.wasm" ] do
            use stream = File.OpenRead(Path.Combine(fullRoot, relative))
            let header = Array.zeroCreate<byte> 4
            if stream.Read(header, 0, header.Length) <> header.Length
               || header <> [| 0uy; 97uy; 115uy; 109uy |] then
                invalidArg "assetsRoot" (relative + " is not a WebAssembly module")
        fullRoot, ready, qualificationReceipt

    let private token () =
        let bytes = RandomNumberGenerator.GetBytes 32
        Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')

    let private html basePath =
        let escaped = WebUtility.HtmlEncode basePath
        $"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<meta name="referrer" content="no-referrer"><title>BARC fixture preview</title>
<link rel="stylesheet" href="{escaped}assets/barc-preview.css"></head>
<body><main><p id="fixture-label">Fixture mode: BAR-shaped coordinator observations</p><div id="barc-preview"></div></main>
<script type="module">
import {{ mount }} from "{escaped}assets/barc-preview.js";
const assetBaseUrl = new URL("{escaped}", window.location.href).href;
window.barcPreview = mount(document.getElementById("barc-preview"), {{ assetBaseUrl }});
</script></body></html>"""

    let private startStatic root basePath port ct = task {
        let builder = WebApplication.CreateBuilder()
        builder.WebHost.UseUrls(http port) |> ignore
        let app = builder.Build()
        app.Use(Func<HttpContext, RequestDelegate, Task>(fun context next ->
            context.Response.Headers["Cache-Control"] <- "no-store"
            context.Response.Headers["Referrer-Policy"] <- "no-referrer"
            context.Response.Headers["X-Content-Type-Options"] <- "nosniff"
            next.Invoke(context))) |> ignore
        app.MapGet(basePath, Func<HttpContext, Task>(fun context -> task {
            context.Response.ContentType <- "text/html; charset=utf-8"
            do! context.Response.WriteAsync(html basePath) })) |> ignore
        let requestPath = basePath.TrimEnd('/')
        app.UseStaticFiles(Microsoft.AspNetCore.Builder.StaticFileOptions(
            FileProvider = new PhysicalFileProvider(root),
            RequestPath = PathString(requestPath))) |> ignore
        do! app.StartAsync(ct)
        return app :> IHost
    }

    let private position x elevation z =
        let p = Vector3.empty()
        p.X <- x; p.Y <- elevation; p.Z <- z
        p

    let private richSnapshot seq frame ownX =
        let snapshot = StateSnapshot.empty()
        let own = OwnUnit.empty()
        own.UnitId <- 77u; own.DefId <- 501u; own.TeamId <- 7
        own.Health <- 123.5f; own.MaxHealth <- 800.0f
        own.Position <- ValueSome(position ownX 403.5f -37.5f)
        snapshot.OwnUnits.Add own
        let evenOwn = OwnUnit.empty()
        evenOwn.UnitId <- 78u; evenOwn.DefId <- 503u; evenOwn.TeamId <- 7
        evenOwn.Health <- 321.0f; evenOwn.MaxHealth <- 900.0f
        evenOwn.Position <- ValueSome(position 26.75f 118.25f 44.5f)
        snapshot.OwnUnits.Add evenOwn
        let enemy = EnemyUnit.empty()
        enemy.UnitId <- 88u; enemy.DefId <- 502u; enemy.TeamId <- 9
        enemy.Position <- ValueSome(position -19.5f 17.25f 61.75f)
        snapshot.VisibleEnemies.Add enemy
        let radar = RadarBlip.empty()
        radar.BlipId <- 99u
        radar.Position <- ValueSome(position 73.25f 0.0f -8.5f)
        snapshot.RadarEnemies.Add radar
        let feature = MapFeature.empty()
        feature.FeatureId <- 77u; feature.DefId <- 909u
        feature.Position <- ValueSome(position -5.5f 222.25f 91.75f)
        snapshot.MapFeatures.Add feature
        let economy = TeamEconomy.empty()
        economy.Metal <- 42.5f; economy.MetalStorage <- 1000.0f; economy.MetalIncome <- 7.25f
        economy.Energy <- 0.0f; economy.EnergyStorage <- 5000.0f; economy.EnergyIncome <- 91.5f
        snapshot.Economy <- ValueSome economy
        let update = StateUpdate.empty()
        update.Seq <- seq; update.Frame <- frame; update.Snapshot <- snapshot
        update

    let private gap seq frame =
        let event = DeltaEvent.empty()
        event.EconomyTick <- EconomyTickEvent.empty()
        let delta = StateDelta.empty()
        delta.Events.Add event
        let update = StateUpdate.empty()
        update.Seq <- seq; update.Frame <- frame; update.Delta <- delta
        update

    let private heartbeat (client: HighBarCoordinator.HighBarCoordinatorClient) plugin ct = task {
        let request = HeartbeatRequest.empty()
        request.PluginId <- plugin
        request.SchemaVersion <- "1.0.0"
        let! response = client.HeartbeatAsync(request, cancellationToken = ct).ResponseAsync
        return response
    }

    let private writePrivate path (bytes: byte array) =
        let options = FileStreamOptions(Mode = FileMode.CreateNew, Access = FileAccess.Write, Share = FileShare.None)
        if not (OperatingSystem.IsWindows()) then
            options.UnixCreateMode <- UnixFileMode.UserRead ||| UnixFileMode.UserWrite
        use stream = new FileStream(path, options)
        stream.Write(bytes, 0, bytes.Length)
        stream.Flush true

    let private writeQualification path nativeSubmissionCount =
        let payload =
            {| schema = "barc.preview.qualification/v1"
               nativeSubmissionCount = nativeSubmissionCount
               cleanShutdown = true |}
        writePrivate path (JsonSerializer.SerializeToUtf8Bytes(payload, JsonSerializerOptions(WriteIndented = true)))

    type Handle internal
        (protocol: ServerHost.ServerHandle, gateway: IHost, staticHost: IHost,
         grpcChannel: GrpcChannel, fixtureCall: Grpc.Core.AsyncClientStreamingCall<StateUpdate, PushAck>,
         commandCall: Grpc.Core.AsyncServerStreamingCall<CommandBatch>, lifetime: CancellationTokenSource,
         fixtureTask: Task, commandTask: Task, readyFile: string, qualificationReceipt: string option,
         nativeCount: int ref) =
        let mutable disposed = 0
        member _.Hub = protocol.Hub
        member _.ReadyFile = readyFile
        member _.FixtureTask = fixtureTask
        member _.NativeSubmissionCount = nativeCount.Value
        interface IAsyncDisposable with
            member _.DisposeAsync() = ValueTask(task {
                if Interlocked.Exchange(&disposed, 1) = 0 then
                    lifetime.Cancel()
                    try do! fixtureCall.RequestStream.CompleteAsync() with _ -> ()
                    fixtureCall.Dispose(); commandCall.Dispose(); grpcChannel.Dispose()
                    try do! Task.WhenAll(fixtureTask, commandTask) with _ -> ()
                    do! gateway.StopAsync()
                    do! staticHost.StopAsync()
                    do! (protocol :> IAsyncDisposable).DisposeAsync().AsTask()
                    try File.Delete readyFile with _ -> ()
                    lifetime.Dispose()
                    qualificationReceipt |> Option.iter (fun path -> writeQualification path nativeCount.Value) })

    let private writeReady path staticBase gatewayUrl sessionId credential (expires: DateTimeOffset) grpcEndpoint fixture =
        let payload =
            {| schema = "barc.preview.ready/v1"
               staticBaseUrl = staticBase
               gatewayWebSocketUrl = gatewayUrl
               sessionId = string sessionId
               credential = credential
               credentialExpiresAtUtc = expires.ToString("O")
               grpcEndpoint = grpcEndpoint
               fixtureMode = fixture |}
        writePrivate path (JsonSerializer.SerializeToUtf8Bytes(payload, JsonSerializerOptions(WriteIndented = true)))

    let start (config: Config) (ct: CancellationToken) = task {
        let root, readyPath, qualificationReceipt = validate config
        let linked = CancellationTokenSource.CreateLinkedTokenSource(ct)
        let mutable protocolResource : ServerHost.ServerHandle option = None
        let mutable gatewayResource : IHost option = None
        let mutable staticResource : IHost option = None
        let mutable channelResource : GrpcChannel option = None
        let mutable fixtureResource : Grpc.Core.AsyncClientStreamingCall<StateUpdate, PushAck> option = None
        let mutable commandResource : Grpc.Core.AsyncServerStreamingCall<CommandBatch> option = None
        let mutable fixtureWork : Task option = None
        let mutable commandWork : Task option = None
        try
            let! protocol = ServerHost.start { ServerHost.defaultOptions with listenAddress = loopback config.grpcPort } (Version(1, 0)) ignore linked.Token
            protocolResource <- Some protocol
            let grpcChannel = GrpcChannel.ForAddress(http config.grpcPort)
            channelResource <- Some grpcChannel
            let coordinator = HighBarCoordinator.HighBarCoordinatorClient(grpcChannel)
            let! _ = heartbeat coordinator "barc-fixture" linked.Token
            let sessionId = Session.id (BrokerState.session protocol.Hub).Value
            let credential = token ()
            let expires = DateTimeOffset.UtcNow.Add config.credentialLifetime
            let staticOrigin = http config.staticPort
            let! gateway = Gateway.startAsync protocol.Hub
                               { Gateway.defaultConfig (http config.gatewayPort) staticOrigin credential sessionId with
                                   credentialExpiresAt = expires
                                   perspectiveId = "barc-fixture"
                                   maxFrameBytes = 65536
                                   maxEntities = 64 } linked.Token
            gatewayResource <- Some gateway
            let! staticHost = startStatic root config.basePath config.staticPort linked.Token
            staticResource <- Some staticHost
            let fixtureCall = coordinator.PushStateAsync(cancellationToken = linked.Token)
            fixtureResource <- Some fixtureCall
            let nativeCount = ref 0
            let subscribe = CommandChannelSubscribe.empty()
            subscribe.PluginId <- "barc-fixture"; subscribe.SchemaVersion <- "1.0.0"
            subscribe.AdmissionResultProtocol <- AdmissionResultProtocol.CorrelatedV1
            subscribe.ChannelIncarnation <- "barc-preview-sentinel"
            let commandCall = coordinator.OpenCommandChannelAsync(subscribe, cancellationToken = linked.Token)
            commandResource <- Some commandCall
            let commandTask = task {
                try
                    while! commandCall.ResponseStream.MoveNext(linked.Token) do
                        Interlocked.Increment nativeCount |> ignore
                with :? OperationCanceledException -> () }
            commandWork <- Some commandTask
            let fixtureTask = task {
                if config.fixtureMode then
                    try
                        do! fixtureCall.RequestStream.WriteAsync(richSnapshot 9007199254740993UL 100u 11.25f)
                        do! Task.Delay(config.fixtureTiming.secondSnapshot, linked.Token)
                        do! fixtureCall.RequestStream.WriteAsync(richSnapshot 9007199254740994UL 101u 12.25f)
                        do! Task.Delay(config.fixtureTiming.gap, linked.Token)
                        do! fixtureCall.RequestStream.WriteAsync(gap 9007199254740996UL 102u)
                        do! Task.Delay(config.fixtureTiming.recovery, linked.Token)
                        do! fixtureCall.RequestStream.WriteAsync(richSnapshot 9007199254740997UL 103u 13.25f)
                        do! Task.Delay(config.fixtureTiming.replacement, linked.Token)
                        do! fixtureCall.RequestStream.CompleteAsync()
                        let deadline = DateTimeOffset.UtcNow.AddSeconds 3.0
                        while BrokerState.session protocol.Hub |> Option.isSome do
                            if DateTimeOffset.UtcNow > deadline then failwith "fixture state stream did not detach"
                            do! Task.Delay(10, linked.Token)
                        let! _ = heartbeat coordinator "barc-fixture-replacement" linked.Token
                        ()
                    with :? OperationCanceledException -> () }
            fixtureWork <- Some fixtureTask
            let staticBase = staticOrigin + config.basePath
            writeReady readyPath staticBase (ws config.gatewayPort) sessionId credential expires (http config.grpcPort) config.fixtureMode
            return Handle(protocol, gateway, staticHost, grpcChannel, fixtureCall, commandCall, linked,
                          fixtureTask, commandTask, readyPath, qualificationReceipt, nativeCount)
        with error ->
            linked.Cancel()
            fixtureResource |> Option.iter (fun call -> try call.Dispose() with _ -> ())
            commandResource |> Option.iter (fun call -> try call.Dispose() with _ -> ())
            channelResource |> Option.iter (fun channel -> try channel.Dispose() with _ -> ())
            let work = [ fixtureWork; commandWork ] |> List.choose id |> List.toArray
            if work.Length > 0 then
                try do! Task.WhenAll work with _ -> ()
            match staticResource with
            | Some host -> try do! host.StopAsync() with _ -> ()
            | None -> ()
            match gatewayResource with
            | Some host -> try do! host.StopAsync() with _ -> ()
            | None -> ()
            match protocolResource with
            | Some host -> try do! (host :> IAsyncDisposable).DisposeAsync().AsTask() with _ -> ()
            | None -> ()
            try File.Delete readyPath with _ -> ()
            linked.Dispose()
            return raise error
    }
