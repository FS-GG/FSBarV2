namespace Broker.NativeProof

open System
open System.IO
open System.Text.Json
open System.Threading
open System.Threading.Tasks
open System.Runtime.InteropServices
open Broker.Core
open Broker.Protocol
open Broker.Browser.Gateway

module LiveHost =
    let run (argv: string array) = task {
        if argv.Length <> 5 then invalidArg "argv" "--live-host requires GRPC_ADDRESS GATEWAY_HTTP ORIGIN PRIVATE_DIRECTORY SOURCE_SHA"
        let grpcAddress, gatewayUrl, origin, privateDirectory, sourceSha = argv[0],argv[1],argv[2],argv[3],argv[4]
        if not (grpcAddress.StartsWith("127.0.0.1:")) then invalidArg "argv" "native qualification requires a loopback gRPC address"
        if Directory.Exists privateDirectory then invalidArg "argv" "private evidence directory must be new"
        Directory.CreateDirectory privateDirectory |> ignore
        if not (OperatingSystem.IsWindows()) then File.SetUnixFileMode(privateDirectory, UnixFileMode.UserRead ||| UnixFileMode.UserWrite ||| UnixFileMode.UserExecute)
        use lifetime = new CancellationTokenSource(TimeSpan.FromMinutes 30.)
        Console.CancelKeyPress.Add(fun args -> args.Cancel <- true; lifetime.Cancel())
        use termination = PosixSignalRegistration.Create(PosixSignal.SIGTERM, fun context -> context.Cancel <- true; lifetime.Cancel())
        let readyPath=Path.Combine(privateDirectory,"ready.json")
        let tracePath = Path.Combine(privateDirectory,"native-host.jsonl")
        use trace = new StreamWriter(new FileStream(tracePath,FileMode.CreateNew,FileAccess.Write,FileShare.Read))
        if not (OperatingSystem.IsWindows()) then File.SetUnixFileMode(tracePath, UnixFileMode.UserRead ||| UnixFileMode.UserWrite)
        let traceGate = obj()
        let write (value: objnull) = lock traceGate (fun () -> trace.WriteLine(JsonSerializer.Serialize value); trace.Flush())
        let! host = ServerHost.start { ServerHost.defaultOptions with listenAddress=grpcAddress } (Version(1,0)) ignore lifetime.Token
        try
            let lobby: Lobby.LobbyConfig =
                { mapName="Avalanche 3.4";gameMode="Skirmish";participants=[{slotIndex=1;kind=ParticipantSlot.ProxyAi;team=0;boundClient=None}];display=Lobby.Headless }
            BrokerState.openHostSession lobby DateTimeOffset.UtcNow host.Hub |> Result.defaultWith invalidOp
            BrokerState.launchHostSession DateTimeOffset.UtcNow host.Hub |> Result.defaultWith invalidOp
            let sessionId = BrokerState.session host.Hub |> Option.map Session.id |> Option.defaultWith(fun () -> invalidOp "native host has no session")
            let credential = Convert.ToHexString(System.Security.Cryptography.RandomNumberGenerator.GetBytes 32).ToLowerInvariant()
            let config = { Gateway.defaultLiveConfig gatewayUrl origin credential sessionId with credentialExpiresAt=DateTimeOffset.UtcNow.AddMinutes 30. }
            let! gateway = Gateway.startLiveAsync host.Hub config lifetime.Token
            try
                let state=BrokerState.liveControl host.Hub
                use feedbackSubscription = (LiveControl.feedback state).Subscribe({new IObserver<LiveControl.Feedback> with
                    member _.OnNext value =
                        let envelope=Broker.Browser.Live.LiveBoundary.feedbackEnvelope value
                        write(box {|kind="result";utc=DateTimeOffset.UtcNow;source=sourceSha;parentId=value.parentId;inputId=value.inputId;moduleGeneration=string value.moduleGeneration;authorityEpoch=string value.authorityEpoch;batchSequence=string value.batchSequence;correlationId=string value.correlationId;childIndex=value.childIndex;childCount=value.childCount;actorId=value.actor.Id;actorLifetime=string value.actor.Lifetime;stage=string value.stage;status=string value.status;detail=value.detail;nativeFrame=Option.toNullable value.nativeFrame;commandChannelIncarnation=value.commandChannelIncarnation;wireEnvelope=envelope.ToString()|})
                    member _.OnError error = write(box {|kind="result-stream-error";detail=error.Message|})
                    member _.OnCompleted() = write(box {|kind="result-stream-completed"|})})
                let _, feedSubscription = BrokerState.subscribeBrowserFeed ({new IObserver<Snapshot.BrowserFeed> with
                    member _.OnNext value =
                        match value with
                        | Snapshot.Current current ->
                            let units=current.units|>List.map(fun unit -> {|id=string unit.id;observation=string unit.observation;definitionId=Option.toNullable unit.definitionId;teamId=Option.toNullable unit.teamId;x=unit.position.x;z=unit.position.z;health=Option.toNullable unit.health;maxHealth=Option.toNullable unit.maxHealth|})
                            write(box {|kind="observation";utc=DateTimeOffset.UtcNow;sessionId=current.sessionId;stateSequence=string current.sequence;units=units|})
                        | Snapshot.Stale(session,lastSeq,receivedSeq,detail) -> write(box {|kind="stale";sessionId=session;lastSequence=string lastSeq;receivedSequence=string receivedSeq;detail=detail|})
                    member _.OnError error = write(box {|kind="observation-stream-error";detail=error.Message|})
                    member _.OnCompleted() = write(box {|kind="observation-stream-completed"|})}) host.Hub
                use feedSubscription=feedSubscription
                let ready={|schema="fsbar.barc-native-live-host/v1";sourceCommit=sourceSha;grpcAddress=grpcAddress;gatewayUrl=gatewayUrl.Replace("http://","ws://")+config.path;allowedOrigin=origin;sessionId=sessionId;credential=credential;nativeTracePath=tracePath;fixtureMode=false|}
                let readyBytes=JsonSerializer.SerializeToUtf8Bytes ready
                use readyFile = new FileStream(readyPath,FileMode.CreateNew,FileAccess.Write,FileShare.Read)
                if not (OperatingSystem.IsWindows()) then File.SetUnixFileMode(readyPath,UnixFileMode.UserRead ||| UnixFileMode.UserWrite)
                readyFile.Write readyBytes; readyFile.Flush(); readyFile.Close()
                printfn "LIVE_NATIVE_HOST_READY grpc=%s ready-file=%s" grpcAddress readyPath
                try do! Task.Delay(Timeout.Infinite,lifetime.Token) with :? OperationCanceledException -> ()
                File.Delete readyPath
                return 0
            finally
                gateway.Dispose()
        finally
            lifetime.Cancel()
            File.Delete readyPath
            (host :> IAsyncDisposable).DisposeAsync().AsTask().GetAwaiter().GetResult()
    }
