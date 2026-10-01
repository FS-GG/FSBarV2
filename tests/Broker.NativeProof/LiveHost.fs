namespace Broker.NativeProof

open System
open System.IO
open System.Text.Json
open System.Threading
open System.Threading.Tasks
open System.Runtime.InteropServices
open System.Diagnostics
open System.Collections.Generic
open System.Text.RegularExpressions
open Microsoft.Win32.SafeHandles
open Google.Protobuf
open Highbar.V1
open Broker.Core
open Broker.Protocol
open Broker.Browser.Gateway

module LiveHost =
    [<DllImport("libc", EntryPoint="geteuid")>]
    extern uint32 private getEffectiveUserId()

    [<DllImport("libc", EntryPoint="open", SetLastError=true)>]
    extern int private openFile(string path, int flags, uint32 mode)

    // The helper authenticates the retained descriptor itself. FileMode.Append
    // seeks before writes but does not set O_APPEND on Unix, so create the
    // stock journal with the exact descriptor contract and then transfer its
    // ownership to FileStream.
    let openStockJournal path =
        if not (OperatingSystem.IsLinux()) then invalidOp "stock journal custody requires Linux descriptor flags"
        let oWriteOnly=0x1
        let oCreate=0x40
        let oExclusive=0x80
        let oAppend=0x400
        let oNoFollow=0x20000
        let oCloseOnExec=0x80000
        let descriptor=openFile(path,oWriteOnly ||| oCreate ||| oExclusive ||| oAppend ||| oNoFollow ||| oCloseOnExec,0o600u)
        if descriptor<0 then
            let error=Marshal.GetLastPInvokeError()
            raise (IOException($"could not create private append-only host journal (errno {error})"))
        let handle=new SafeFileHandle(nativeint descriptor,true)
        try
            new FileStream(handle,FileAccess.Write,4096,false)
        with
        | _ ->
            handle.Dispose()
            try File.Delete path with _ -> ()
            reraise()

    let private requiredEnvironment name =
        Environment.GetEnvironmentVariable name
        |> Option.ofObj
        |> Option.filter (String.IsNullOrWhiteSpace >> not)
        |> Option.defaultWith(fun () -> invalidOp $"missing {name}")

    let private processStartTicks() =
        let text=File.ReadAllText $"/proc/{Environment.ProcessId}/stat"
        let close=text.LastIndexOf(") ",StringComparison.Ordinal)
        if close<0 then invalidOp "process start identity unavailable"
        let fields=text.Substring(close+2).Split(' ',StringSplitOptions.RemoveEmptyEntries)
        if fields.Length<=19 then invalidOp "process start identity incomplete"
        fields[19]

    let private ownedRoleHome path =
        let info=DirectoryInfo path
        if not info.Exists || info.LinkTarget<>null then invalidOp "private role home must be a precreated directory"
        if not (OperatingSystem.IsWindows()) && File.GetUnixFileMode(path)<>(UnixFileMode.UserRead ||| UnixFileMode.UserWrite ||| UnixFileMode.UserExecute) then invalidOp "private role home must be mode 0700"
        let child=Path.Combine(path,$"host-{Environment.ProcessId}-{Guid.NewGuid():N}")
        Directory.CreateDirectory child |> ignore
        if not (OperatingSystem.IsWindows()) then File.SetUnixFileMode(child,UnixFileMode.UserRead ||| UnixFileMode.UserWrite ||| UnixFileMode.UserExecute)
        child

    let stockFactoryAvailable (tactical: TacticalSnapshotMetadata) =
        let production (actor: NativeActorTacticalMetadata) = actor.Queue |> Seq.tryFind(fun queue -> queue.Domain=NativeQueueDomain.FactoryProduction && queue.Complete && int queue.EvidenceScheme=2 && queue.Entries.Count>0)
        tactical.Actors
        |> Seq.exists(fun factory ->
            match factory.Actor |> ValueOption.toOption,production factory with
            | Some _,Some queue ->
                queue.Entries
                |> Seq.choose(fun entry -> entry.DefinitionId |> ValueOption.toOption)
                |> Seq.tryHead
                |> Option.exists(fun currentDefinition ->
                    factory.Descriptors
                    |> Seq.filter(fun descriptor -> descriptor.Kind=NativeTacticalDescriptorKind.NativeTacticalDescriptorFactoryProduce && not descriptor.Disabled)
                    |> Seq.collect(fun descriptor -> descriptor.AllowedDefinitionIds)
                    |> Seq.exists((<>)currentDefinition))
            | _ -> false)

    let run (profile: string) (argv: string array) = task {
        if argv.Length <> 5 then invalidArg "argv" "--live-host requires GRPC_ADDRESS GATEWAY_HTTP ORIGIN PRIVATE_DIRECTORY SOURCE_SHA"
        if profile <> "barc-live-v1" && profile <> "barc-live-tactical-v1" && profile <> "barc-live-tactical-stock-v1" then invalidArg "profile" "unsupported live profile"
        let grpcAddress, gatewayUrl, origin, privateDirectory, sourceSha = argv[0],argv[1],argv[2],argv[3],argv[4]
        if not (grpcAddress.StartsWith("127.0.0.1:")) then invalidArg "argv" "native qualification requires a loopback gRPC address"
        let stock=profile="barc-live-tactical-stock-v1"
        let privateRoot = if stock then ownedRoleHome privateDirectory else
                              if Directory.Exists privateDirectory then invalidArg "argv" "private evidence directory must be new"
                              Directory.CreateDirectory privateDirectory |> ignore
                              if not (OperatingSystem.IsWindows()) then File.SetUnixFileMode(privateDirectory, UnixFileMode.UserRead ||| UnixFileMode.UserWrite ||| UnixFileMode.UserExecute)
                              privateDirectory
        use lifetime = new CancellationTokenSource(TimeSpan.FromMinutes 30.)
        Console.CancelKeyPress.Add(fun args -> args.Cancel <- true; lifetime.Cancel())
        use termination = PosixSignalRegistration.Create(PosixSignal.SIGTERM, fun context -> context.Cancel <- true; lifetime.Cancel())
        let readyPath=if stock then requiredEnvironment "BARC_STOCK_SMOKE_READY" else Path.Combine(privateRoot,"ready.json")
        let tracePath=if stock then requiredEnvironment "BARC_STOCK_SMOKE_HOST_TRACE" else Path.Combine(privateRoot,"native-host.jsonl")
        if File.Exists tracePath then invalidOp "private host journal must be new"
        use traceStream = if stock then openStockJournal tracePath else new FileStream(tracePath,FileMode.CreateNew,FileAccess.Write,FileShare.Read)
        use trace = new StreamWriter(traceStream)
        if not (OperatingSystem.IsWindows()) then File.SetUnixFileMode(tracePath, UnixFileMode.UserRead ||| UnixFileMode.UserWrite)
        let traceGate = obj()
        let runId=if stock then requiredEnvironment "BARC_STOCK_SMOKE_RUN_ID" else ""
        let source = if stock then
                         use document=JsonDocument.Parse(requiredEnvironment "BARC_STOCK_SMOKE_SOURCE_JSON")
                         let value=document.RootElement.Clone()
                         if value.ValueKind<>JsonValueKind.Object || value.EnumerateObject() |> Seq.map(fun p->p.Name) |> Set.ofSeq <> set["fsbarCommit";"highbarCommit"] then invalidOp "closed stock source identity required"
                         if not(Regex.IsMatch(runId,"^[A-Za-z0-9._-]{1,64}$")) || value.EnumerateObject() |> Seq.exists(fun p -> p.Value.ValueKind<>JsonValueKind.String || p.Value.GetString() |> Option.ofObj |> Option.exists(fun text -> Regex.IsMatch(text,"^[0-9a-f]{40}$")) |> not) then invalidOp "stock run/source identity invalid"
                         value
                     else Unchecked.defaultof<JsonElement>
        let writer={|pid=Environment.ProcessId;startTicks=(if stock then processStartTicks() else "0");uid=(if stock then int(getEffectiveUserId()) else 0)|}
        let mutable journalSequence=0UL
        let mutable journalComplete=false
        let writeKind kind (value: objnull) = lock traceGate (fun () ->
            if not journalComplete then
                journalSequence<-journalSequence+1UL
                let row = if stock then box {|schema="fsbar.barc-stock-host-journal/v1";runId=runId;sequence=string journalSequence;kind=kind;writer=writer;source=source;value=value|} else value
                trace.WriteLine(JsonSerializer.Serialize row);trace.Flush())
        let completeJournal() = lock traceGate (fun () ->
            if stock && not journalComplete then
                journalSequence<-journalSequence+1UL
                trace.WriteLine(JsonSerializer.Serialize {|schema="fsbar.barc-stock-host-journal/v1";runId=runId;sequence=string journalSequence;kind="complete";writer=writer;source=source;value={|selectedCase="stock-smoke-count1"|}|})
                trace.Flush();journalComplete<-true)
        let write (value: objnull) = writeKind "event" value
        if stock then writeKind "header" (box {|selectedCase="stock-smoke-count1"|})
        let! host = ServerHost.start { ServerHost.defaultOptions with listenAddress=grpcAddress } (Version(1,0)) ignore lifetime.Token
        try
            let lobby: Lobby.LobbyConfig =
                { mapName="Avalanche 3.4";gameMode="Skirmish";participants=[{slotIndex=1;kind=ParticipantSlot.ProxyAi;team=0;boundClient=None}];display=Lobby.Headless }
            BrokerState.openHostSession lobby DateTimeOffset.UtcNow host.Hub |> Result.defaultWith invalidOp
            BrokerState.launchHostSession DateTimeOffset.UtcNow host.Hub |> Result.defaultWith invalidOp
            let sessionId = BrokerState.session host.Hub |> Option.map Session.id |> Option.defaultWith(fun () -> invalidOp "native host has no session")
            let credential = Convert.ToHexString(System.Security.Cryptography.RandomNumberGenerator.GetBytes 32).ToLowerInvariant()
            let config = { Gateway.defaultLiveConfig gatewayUrl origin credential sessionId with credentialExpiresAt=DateTimeOffset.UtcNow.AddMinutes 30. }
            let diagnostic (value: Gateway.LiveDiagnostic) =
                let struct(phase,reason)=Gateway.diagnosticNames value
                write(box {|kind="gateway-diagnostic";utc=DateTimeOffset.UtcNow;source=sourceSha;phase=phase;reason=reason|})
            let! gateway = Gateway.startLiveAsyncWithDiagnostics host.Hub config diagnostic lifetime.Token
            try
                let state=BrokerState.liveControl host.Hub
                let terminalParents=HashSet<Guid>()
                let protobufJson (value: Google.Protobuf.IMessage) =
                    use document=JsonDocument.Parse(string value)
                    document.RootElement.Clone()
                use feedbackSubscription = (LiveControl.feedback state).Subscribe({new IObserver<LiveControl.Feedback> with
                    member _.OnNext value =
                        let envelope=Broker.Browser.Live.LiveBoundary.feedbackEnvelope value
                        writeKind "result" (box {|utc=DateTimeOffset.UtcNow;source=sourceSha;parentId=value.parentId;inputId=value.inputId;brokerSessionId=Convert.ToBase64String(value.sessionId.ToByteArray());moduleGeneration=string value.moduleGeneration;moduleSha256=Convert.ToHexString(value.moduleSha256).ToLowerInvariant();authorityEpoch=string value.authorityEpoch;basis=protobufJson value.basis;batchSequence=string value.batchSequence;correlationId=string value.correlationId;childIndex=value.childIndex;childCount=value.childCount;actorId=value.actor.Id;actorLifetime=string value.actor.Lifetime;stage=string value.stage;status=string value.status;detail=value.detail;nativeFrame=Option.toNullable value.nativeFrame;commandChannelIncarnation=value.commandChannelIncarnation;wireEnvelope=envelope.ToString()|})
                        let terminal = string value.stage="NativeDispatch" || string value.stage="Unknown" || string value.status="Rejected"
                        if stock && terminal && terminalParents.Add value.parentId && terminalParents.Count=4 then completeJournal()
                    member _.OnError error = writeKind "result-stream-error" (box {|detail=error.Message|})
                    member _.OnCompleted() = writeKind "result-stream-completed" (box {|detail=""|})})
                use metadataSubscription = (LiveControl.metadataReports state).Subscribe({new IObserver<uint64> with
                    member _.OnNext sequence =
                        let capabilities=LiveControl.latestCapabilities state |> Option.map (protobufJson >> box) |> Option.toObj
                        let catalogue=LiveControl.latestTacticalCatalogue state |> Option.map (List.map protobufJson >> box) |> Option.toObj
                        let tactical=LiveControl.latestTacticalSnapshot state |> Option.map (protobufJson >> box) |> Option.toObj
                        writeKind "live-metadata" (box {|utc=DateTimeOffset.UtcNow;source=sourceSha;stateSequence=string sequence;capabilities=capabilities;catalogue=catalogue;tactical=tactical|})
                    member _.OnError error = writeKind "metadata-stream-error" (box {|detail=error.Message|})
                    member _.OnCompleted() = writeKind "metadata-stream-completed" (box {|detail=""|})})
                let _, feedSubscription = BrokerState.subscribeBrowserFeed ({new IObserver<Snapshot.BrowserFeed> with
                    member _.OnNext value =
                        match value with
                        | Snapshot.Current current ->
                            let units=current.units|>List.map(fun unit -> {|id=string unit.id;observation=string unit.observation;definitionId=Option.toNullable unit.definitionId;teamId=Option.toNullable unit.teamId;x=unit.position.x;z=unit.position.z;health=Option.toNullable unit.health;maxHealth=Option.toNullable unit.maxHealth|})
                            writeKind "observation" (box {|utc=DateTimeOffset.UtcNow;sessionId=current.sessionId;stateSequence=string current.sequence;units=units|})
                        | Snapshot.Stale(session,lastSeq,receivedSeq,detail) -> writeKind "stale" (box {|sessionId=session;lastSequence=string lastSeq;receivedSequence=string receivedSeq;detail=detail|})
                    member _.OnError error = writeKind "observation-stream-error" (box {|detail=error.Message|})
                    member _.OnCompleted() = writeKind "observation-stream-completed" (box {|detail=""|})}) host.Hub
                use feedSubscription=feedSubscription
                let stockSelectionAvailable () =
                    LiveControl.latestTacticalSnapshot state |> Option.exists stockFactoryAvailable
                if profile="barc-live-tactical-v1" || profile="barc-live-tactical-stock-v1" then
                    use tacticalReady=CancellationTokenSource.CreateLinkedTokenSource(lifetime.Token)
                    tacticalReady.CancelAfter(TimeSpan.FromSeconds 60.)
                    try
                        while LiveControl.latestCapabilities state |> Option.bind (fun value -> value.Tactical |> ValueOption.toOption) |> Option.isNone
                              || LiveControl.latestTacticalCatalogue state |> Option.isNone
                              || LiveControl.latestTacticalSnapshot state |> Option.isNone
                              || (stock && not(stockSelectionAvailable())) do
                            do! Task.Delay(50,tacticalReady.Token)
                    with :? OperationCanceledException ->
                        if stock then invalidOp "timed out waiting for usable stock factory, builder, target and paired projections"
                        else invalidOp "timed out waiting for native tactical capabilities, complete catalogue and paired snapshot"
                let tacticalRevision,queueEvidenceScheme =
                    if profile="barc-live-tactical-stock-v1" then
                        let capabilities = LiveControl.latestCapabilities state |> Option.bind (fun value -> value.Tactical |> ValueOption.toOption) |> Option.defaultWith(fun () -> invalidOp "stock readiness lost tactical capabilities")
                        let catalogue = LiveControl.latestTacticalCatalogue state |> Option.defaultWith(fun () -> invalidOp "stock readiness lost its complete catalogue")
                        let tactical = LiveControl.latestTacticalSnapshot state |> Option.defaultWith(fun () -> invalidOp "stock readiness lost its paired tactical snapshot")
                        if capabilities.Profile<>profile || capabilities.Revision<>2u then invalidOp "stock readiness requires exact profile revision 2"
                        if List.isEmpty catalogue || catalogue |> List.exists(fun page -> page.TacticalProfile<>profile || page.TacticalRevision<>2u || not page.Complete || page.CatalogueId.Length<>16 || page.CatalogueRevision=0UL || page.Content |> ValueOption.exists(fun content -> content.EngineVersion="2025.06.19" && not(String.IsNullOrWhiteSpace content.GameName) && not(String.IsNullOrWhiteSpace content.GameVersion) && content.GameContentSha256.Length=32) |> not) then invalidOp "stock readiness requires complete current catalogue/content identity"
                        if tactical.Basis |> ValueOption.exists(fun basis -> basis.Token.Length>0 && basis.MatchIncarnation.Length=16 && basis.StateSequence>0UL && basis.SnapshotSendMonotonicNs>0UL) |> not || tactical.CatalogueId.Length<>16 || tactical.CatalogueRevision=0UL || tactical.Actors.Count=0 then invalidOp "stock readiness requires current basis, catalogue and actor metadata"
                        let queues=tactical.Actors |> Seq.collect(fun actor -> actor.Queue) |> Seq.toArray
                        if queues.Length=0 || queues |> Seq.exists(fun queue -> int queue.EvidenceScheme<>2) then invalidOp "stock readiness requires queue evidence scheme 2"
                        2,2
                    elif profile="barc-live-tactical-v1" then 1,0
                    else 0,0
                let readyBytes =
                    if stock then
                        let metadataPath=requiredEnvironment "BARC_STOCK_SMOKE_METADATA"
                        let setupPath=requiredEnvironment "BARC_STOCK_SMOKE_SETUP"
                        let receiverUrl=requiredEnvironment "BARC_STOCK_SMOKE_RECEIVER_URL"
                        let tactical=LiveControl.latestTacticalSnapshot state |> Option.defaultWith(fun () -> invalidOp "stock metadata snapshot unavailable")
                        let snapshot=LiveControl.latestSnapshotMetadata state |> Option.defaultWith(fun () -> invalidOp "stock base snapshot unavailable")
                        let catalogue=LiveControl.latestTacticalCatalogue state |> Option.defaultWith(fun () -> invalidOp "stock catalogue unavailable")
                        let basis=tactical.Basis |> ValueOption.defaultWith(fun () -> invalidOp "stock basis unavailable")
                        let production (actor: NativeActorTacticalMetadata) = actor.Queue |> Seq.tryFind(fun queue -> queue.Domain=NativeQueueDomain.FactoryProduction && queue.Complete && int queue.EvidenceScheme=2 && queue.Entries.Count>0)
                        let factory=tactical.Actors |> Seq.tryFind(fun actor -> actor.Actor.IsSome && production actor |> Option.isSome) |> Option.defaultWith(fun () -> invalidOp "actual stock factory unavailable")
                        let factoryRef=factory.Actor.Value
                        let factoryQueue=production factory |> Option.get
                        let existingDefinition=factoryQueue.Entries |> Seq.choose(fun entry -> entry.DefinitionId |> ValueOption.toOption) |> Seq.tryHead |> Option.defaultWith(fun () -> invalidOp "actual existing production definition unavailable")
                        let productDefinition=factory.Descriptors |> Seq.filter(fun descriptor -> descriptor.Kind=NativeTacticalDescriptorKind.NativeTacticalDescriptorFactoryProduce && not descriptor.Disabled) |> Seq.collect(fun descriptor -> descriptor.AllowedDefinitionIds) |> Seq.tryFind((<>)existingDefinition) |> Option.defaultWith(fun () -> invalidOp "distinct actual factory product definition unavailable")
                        let builder=tactical.Actors |> Seq.tryFind(fun actor -> actor.Actor.IsSome && actor.Actor.Value.Id<>factoryRef.Id && actor.Descriptors |> Seq.exists(fun descriptor -> descriptor.Kind=NativeTacticalDescriptorKind.NativeTacticalDescriptorBuild && not descriptor.Disabled)) |> Option.defaultWith(fun () -> invalidOp "actual builder actor unavailable")
                        let builderRef=builder.Actor.Value
                        let combat=snapshot.Units |> Seq.tryFind(fun unit -> unit.Reference.IsSome && unit.Eligibility=NativeLiveUnitEligibility.NativeLiveUnitVisualTarget) |> Option.defaultWith(fun () -> invalidOp "actual visual combat target unavailable")
                        let combatRef=combat.Reference.Value
                        let current=BrokerState.browserLatest host.Hub |> Option.bind(function Snapshot.Current value -> Some value | _ -> None) |> Option.defaultWith(fun () -> invalidOp "actual browser projection unavailable")
                        let position id = current.units |> List.tryFind(fun unit -> unit.id=uint64 id) |> Option.map(fun unit -> {|x=unit.position.x;z=unit.position.z|}) |> Option.defaultWith(fun () -> invalidOp $"actual position unavailable for {id}")
                        let actorRef (value: NativeUnitReference) = {|id=string value.Id;lifetime=string value.Lifetime|}
                        let metadata={|schema="fsbar.barc-stock-native-smoke-metadata/v1";runId=runId;writer=writer;basis={|token=Convert.ToBase64String(basis.Token.ToByteArray());stateSequence=string basis.StateSequence;nativeFrame=basis.Frame;matchId=Convert.ToBase64String(basis.MatchIncarnation.ToByteArray());processIncarnation=basis.ProcessIncarnation;stateChannelIncarnation=basis.StateChannelIncarnation|};catalogue={|id=Convert.ToBase64String(tactical.CatalogueId.ToByteArray());revision=string tactical.CatalogueRevision;contentSha256=Convert.ToHexString(catalogue.Head.Content.Value.GameContentSha256.ToByteArray()).ToLowerInvariant()|};actors={|factory=actorRef factoryRef;builder=actorRef builderRef;combatTarget=actorRef combatRef|}|}
                        let setup={|schema="fsbar.barc-stock-native-smoke-setup/v1";runId=runId;writer=writer;existingProductionDefinitionId=existingDefinition;productDefinitionId=productDefinition;positions={|rally=position factoryRef.Id;move=position builderRef.Id|}|}
                        let writeNew path (bytes: byte[]) =
                            use stream=new FileStream(path,FileMode.CreateNew,FileAccess.Write,FileShare.Read)
                            if not (OperatingSystem.IsWindows()) then File.SetUnixFileMode(path,UnixFileMode.UserRead ||| UnixFileMode.UserWrite)
                            stream.Write bytes;stream.Flush(true)
                        writeNew metadataPath (JsonSerializer.SerializeToUtf8Bytes metadata);writeNew setupPath (JsonSerializer.SerializeToUtf8Bytes setup)
                        let sourceFsbar=source.GetProperty("fsbarCommit").GetString()
                        if sourceFsbar<>sourceSha then invalidOp "stock source argument/environment mismatch"
                        JsonSerializer.SerializeToUtf8Bytes {|schema="fsbar.barc-stock-native-smoke-ready/v1";runId=runId;writer=writer;source=source;profile=profile;tacticalRevision=tacticalRevision;queueEvidenceScheme=queueEvidenceScheme;grpcAddress=grpcAddress;gatewayUrl=gatewayUrl.Replace("http://","ws://")+config.path;allowedOrigin=origin;receiverUrl=receiverUrl;sessionId=string sessionId;credential=credential;metadataPath=metadataPath;setupPath=setupPath;hostTracePath=tracePath|}
                    else
                        JsonSerializer.SerializeToUtf8Bytes {|schema="fsbar.barc-native-live-host/v2";sourceCommit=sourceSha;profile=profile;protocolVersion=2;tacticalRevision=tacticalRevision;queueEvidenceScheme=queueEvidenceScheme;guestAbiVersion=1;grpcAddress=grpcAddress;gatewayUrl=gatewayUrl.Replace("http://","ws://")+config.path;allowedOrigin=origin;sessionId=sessionId;credential=credential;nativeTracePath=tracePath;fixtureMode=false|}
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
