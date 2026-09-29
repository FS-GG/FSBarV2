namespace Broker.Browser.Gateway

open System
open System.Net
open System.Net.WebSockets
open System.Threading
open System.Threading.Channels
open System.Threading.Tasks
open Google.Protobuf
open Microsoft.AspNetCore.Builder
open Microsoft.AspNetCore.Hosting
open Microsoft.AspNetCore.Http
open Microsoft.Extensions.Hosting
open Broker.Core
open Broker.Protocol
open Broker.Browser.Contracts
open Broker.Browser.Live
open Highbar.V1

module Gateway =
    [<Literal>]
    let private Game = "bar"
    [<Literal>]
    let private ProtocolVersion = "1.0.0"
    [<Literal>]
    let private Profile = "barc-preview-v1"

    type Config =
        { url: string
          path: string
          allowedOrigin: string
          credential: string
          credentialSessionId: Guid
          credentialExpiresAt: DateTimeOffset
          perspectiveId: string
          authTimeout: TimeSpan
          closeTimeout: TimeSpan
          maxFrameBytes: int
          maxEntities: int }

    let defaultConfig url origin credential sessionId =
        { url = url; path = "/barc-preview"; allowedOrigin = origin
          credential = credential; credentialSessionId = sessionId
          credentialExpiresAt = DateTimeOffset.UtcNow.AddMinutes 5.0
          perspectiveId = ""; authTimeout = TimeSpan.FromSeconds 3.0
          closeTimeout = TimeSpan.FromSeconds 1.0
          maxFrameBytes = 65536; maxEntities = 4096 }

    type LiveConfig =
        { url: string; path: string; allowedOrigin: string; credential: string
          credentialSessionId: Guid; credentialExpiresAt: DateTimeOffset; perspectiveId: string
          authTimeout: TimeSpan; closeTimeout: TimeSpan; maxFrameBytes: int }

    type private PreparedLiveObservation =
        | PreparedCurrent of sequence: uint64 * envelope: LiveServerEnvelope
        | PreparedStale of lastSequence: uint64 * receivedSequence: uint64 * detail: string
        | PreparedSessionChanged
        | PreparedUnavailable

    let defaultLiveConfig url origin credential sessionId =
        { url=url; path="/barc-live"; allowedOrigin=origin; credential=credential
          credentialSessionId=sessionId; credentialExpiresAt=DateTimeOffset.UtcNow.AddMinutes 5.0
          perspectiveId=""; authTimeout=TimeSpan.FromSeconds 3.0
          closeTimeout=TimeSpan.FromSeconds 1.0; maxFrameBytes=65536 }

    let private guidBytes (id: Guid) = ByteString.CopyFrom(id.ToByteArray())
    let private bytesGuid (value: ByteString) = if value.Length = 16 then Some(Guid(value.ToByteArray())) else None

    let private position (value: Snapshot.Vec3) =
        let p = Position3(X = value.x, Z = value.z)
        value.elevation |> Option.iter (fun v -> p.Elevation <- v)
        p

    let private resource (value: Snapshot.ResourceAmount) =
        let r = ResourceAmount()
        value.current |> Option.iter (fun v -> r.Current <- v)
        value.storage |> Option.iter (fun v -> r.Storage <- v)
        value.income |> Option.iter (fun v -> r.Income <- v)
        value.expenditure |> Option.iter (fun v -> r.Expenditure <- v)
        r

    let private validity status lastSeq received detail =
        let v = Validity(Status = status, LastSequence = lastSeq, Detail = detail)
        received |> Option.iter (fun s -> v.ReceivedSequence <- s)
        v

    let private observation (value: Snapshot.BrowserObservation) =
        let o = Observation(SessionId = guidBytes value.sessionId, Sequence = value.sequence,
                            CapturedAtUnixMs = value.capturedAt.ToUnixTimeMilliseconds(),
                            PerspectiveId = value.perspectiveId,
                            Validity = validity ValidityStatus.Current value.sequence None "")
        for unit in value.units do
            let kind = match unit.observation with Snapshot.Own -> ObservationKind.Own | Snapshot.Visual -> ObservationKind.Visual | Snapshot.Radar -> ObservationKind.Radar
            let u = ObservedUnit(Id = unit.id, Observation = kind, Position = position unit.position)
            unit.definitionId |> Option.iter (fun x -> u.DefinitionId <- x)
            unit.teamId |> Option.iter (fun x -> u.TeamId <- x)
            unit.health |> Option.iter (fun x -> u.Health <- x)
            unit.maxHealth |> Option.iter (fun x -> u.MaxHealth <- x)
            unit.generation |> Option.iter (fun x -> u.Generation <- x)
            o.Units.Add u
        for feature in value.features do
            o.Features.Add(ObservedFeature(Id = feature.id, DefinitionId = feature.definitionId, Position = position feature.position))
        value.teamEconomy |> Option.iter (fun e ->
            let economy = TeamEconomy(Metal = resource e.metal, Energy = resource e.energy)
            e.teamId |> Option.iter (fun teamId -> economy.TeamId <- teamId)
            o.TeamEconomy <- economy)
        ServerEnvelope(Observation = o)

    let private envelope = function
        | Snapshot.Current current -> observation current
        | Snapshot.Stale(sessionId, lastSeq, receivedSeq, detail) ->
            let o = Observation(SessionId = guidBytes sessionId, Sequence = lastSeq,
                                Validity = validity ValidityStatus.Stale lastSeq (Some receivedSeq) detail)
            ServerEnvelope(Observation = o)

    let private send maxBytes (socket: WebSocket) (message: IMessage) ct =
        let bytes = message.ToByteArray()
        if bytes.Length > maxBytes then
            Task.FromException(InvalidOperationException "browser preview output exceeds negotiated frame bound")
        else
            socket.SendAsync(ReadOnlyMemory<byte>(bytes), WebSocketMessageType.Binary, true, ct).AsTask()

    let private close (socket: WebSocket) status detail (timeout: TimeSpan) = task {
        use closeCts = new CancellationTokenSource(timeout)
        try
            if socket.State = WebSocketState.Open then
                // Send the close frame without waiting for an untrusted peer
                // to acknowledge it. Connection task cancellation owns the
                // receive/feed teardown immediately afterwards.
                do! socket.CloseOutputAsync(status, detail, closeCts.Token)
        with
        | :? WebSocketException
        | :? OperationCanceledException -> socket.Abort()
        | _ -> socket.Abort()
    }

    let private receiveOne (socket: WebSocket) maxBytes ct = task {
        let buffer = Array.zeroCreate<byte> maxBytes
        let mutable used = 0
        let mutable done' = false
        let mutable invalid = false
        while not done' && not invalid do
            if used = maxBytes then invalid <- true
            else
                let! result = socket.ReceiveAsync(Memory<byte>(buffer, used, maxBytes - used), ct).AsTask()
                if result.MessageType <> WebSocketMessageType.Binary then invalid <- true
                else
                    used <- used + result.Count
                    done' <- result.EndOfMessage
        if invalid || used = 0 then return Error "malformed or oversized binary frame"
        else return Ok (ReadOnlyMemory<byte>(buffer, 0, used))
    }

    let private authenticate (config: Config) (origin: string) (auth: ClientAuth) (hub: BrokerState.Hub) =
        match BrokerState.session hub, bytesGuid auth.ExpectedSessionId with
        | Some session, Some expected
            when origin = config.allowedOrigin
              && auth.Origin = origin
              && auth.Game = Game
              && auth.ProtocolVersion = ProtocolVersion
              && auth.Profile = Profile
              && auth.Credential = config.credential
              && DateTimeOffset.UtcNow <= config.credentialExpiresAt
              && expected = config.credentialSessionId
              && expected = Session.id session -> Ok expected
        | _ -> Error "browser credential, origin, protocol, or session refused"

    exception private SessionChanged
    exception private EntityLimitExceeded

    let private feedSession = function
        | Snapshot.Current value -> value.sessionId
        | Snapshot.Stale(sessionId, _, _, _) -> sessionId

    let private entityCount = function
        | Snapshot.Current value -> value.units.Length + value.features.Length
        | Snapshot.Stale _ -> 0

    let private currentSessionId hub =
        BrokerState.session hub |> Option.map Session.id

    let private runSocket hub (config: Config) (context: HttpContext) = task {
        let origin = context.Request.Headers.Origin.ToString()
        if origin <> config.allowedOrigin then
            context.Response.StatusCode <- StatusCodes.Status403Forbidden
        elif not context.WebSockets.IsWebSocketRequest then
            context.Response.StatusCode <- StatusCodes.Status400BadRequest
        else
            use! socket = context.WebSockets.AcceptWebSocketAsync()
            use authCts = CancellationTokenSource.CreateLinkedTokenSource(context.RequestAborted)
            authCts.CancelAfter config.authTimeout
            try
                let! received = receiveOne socket config.maxFrameBytes authCts.Token
                match received with
                | Error detail -> do! close socket WebSocketCloseStatus.InvalidPayloadData detail config.closeTimeout
                | Ok bytes ->
                    let parsed =
                        try Ok (ClientEnvelope.Parser.ParseFrom(bytes.ToArray()))
                        with :? InvalidProtocolBufferException -> Error "malformed authentication"
                    match parsed with
                    | Error detail -> do! close socket WebSocketCloseStatus.InvalidPayloadData detail config.closeTimeout
                    | Ok message when isNull message.Authenticate -> do! close socket WebSocketCloseStatus.PolicyViolation "authentication required" config.closeTimeout
                    | Ok message ->
                        match authenticate config origin message.Authenticate hub with
                        | Error detail -> do! close socket WebSocketCloseStatus.PolicyViolation detail config.closeTimeout
                        | Ok sessionId ->
                            use connectionCts = CancellationTokenSource.CreateLinkedTokenSource(context.RequestAborted)
                            let updates = Channel.CreateBounded<Snapshot.BrowserFeed>(BoundedChannelOptions(16, FullMode = BoundedChannelFullMode.Wait, SingleReader = true, SingleWriter = false))
                            let observer =
                                { new IObserver<Snapshot.BrowserFeed> with
                                    member _.OnNext value =
                                        if not (updates.Writer.TryWrite value) then
                                            updates.Writer.TryComplete(InvalidOperationException "browser subscriber is too slow") |> ignore
                                    member _.OnError error = updates.Writer.TryComplete error |> ignore
                                    member _.OnCompleted() = updates.Writer.TryComplete() |> ignore }
                            let latest, subscription = BrokerState.subscribeBrowserFeed observer hub
                            use subscription = subscription
                            let initialIsValid =
                                currentSessionId hub = Some sessionId
                                && (latest |> Option.forall (fun value -> feedSession value = sessionId && entityCount value <= config.maxEntities))
                            if not initialIsValid then
                                do! close socket WebSocketCloseStatus.PolicyViolation "authenticated session was replaced" config.closeTimeout
                            else
                                let initialValidity =
                                    match latest with
                                    | Some (Snapshot.Current current) -> validity ValidityStatus.Current current.sequence None ""
                                    | Some (Snapshot.Stale(_, lastSeq, receivedSeq, detail)) -> validity ValidityStatus.Stale lastSeq (Some receivedSeq) detail
                                    | None -> validity ValidityStatus.Stale 0UL None "observation unavailable"
                                let bootstrap = Bootstrap(Game = Game, ProtocolVersion = ProtocolVersion, Profile = Profile,
                                                          SessionId = guidBytes sessionId, PerspectiveId = config.perspectiveId,
                                                          Mode = PreviewMode.ReadOnly, Validity = initialValidity,
                                                          Limits = Limits(MaxFrameBytes = uint32 config.maxFrameBytes, AuthTimeoutMs = uint32 config.authTimeout.TotalMilliseconds, MaxEntities = uint32 config.maxEntities))
                                do! send config.maxFrameBytes socket (ServerEnvelope(Bootstrap = bootstrap)) connectionCts.Token
                                match latest with
                                | Some value -> do! send config.maxFrameBytes socket (envelope value) connectionCts.Token
                                | None -> ()
                                let receiveTask = receiveOne socket config.maxFrameBytes connectionCts.Token
                                let feedTask = task {
                                    while socket.State = WebSocketState.Open do
                                        let! value = updates.Reader.ReadAsync(connectionCts.Token).AsTask()
                                        if feedSession value <> sessionId || currentSessionId hub <> Some sessionId then
                                            raise SessionChanged
                                        if entityCount value > config.maxEntities then
                                            raise EntityLimitExceeded
                                        do! send config.maxFrameBytes socket (envelope value) connectionCts.Token }
                                let sessionTask = task {
                                    while currentSessionId hub = Some sessionId do
                                        do! Task.Delay(25, connectionCts.Token)
                                    raise SessionChanged }
                                let receiveObserved = receiveTask :> Task
                                let feedObserved = feedTask :> Task
                                let sessionObserved = sessionTask :> Task
                                let observed = [| receiveObserved; feedObserved; sessionObserved |]
                                let! completed = Task.WhenAny observed
                                if Object.ReferenceEquals(completed, receiveObserved) then
                                    do! close socket WebSocketCloseStatus.PolicyViolation "preview socket accepts authentication only" config.closeTimeout
                                elif Object.ReferenceEquals(completed, sessionObserved) then
                                    do! close socket WebSocketCloseStatus.PolicyViolation "authenticated session was replaced" config.closeTimeout
                                elif feedTask.IsFaulted then
                                    let entityLimit =
                                        match feedTask.Exception with
                                        | null -> false
                                        | error -> error.GetBaseException() :? EntityLimitExceeded
                                    if entityLimit then
                                        do! close socket WebSocketCloseStatus.MessageTooBig "browser preview entity bound exceeded" config.closeTimeout
                                    else
                                        do! close socket WebSocketCloseStatus.InternalServerError "browser feed unavailable" config.closeTimeout
                                else
                                    do! close socket WebSocketCloseStatus.InternalServerError "browser feed unavailable" config.closeTimeout
                                connectionCts.Cancel()
                                try do! Task.WhenAll observed with _ -> ()
            with
            | :? OperationCanceledException -> ()
            | :? ChannelClosedException -> do! close socket WebSocketCloseStatus.InternalServerError "browser feed unavailable" config.closeTimeout
            | :? InvalidOperationException -> do! close socket WebSocketCloseStatus.MessageTooBig "browser preview output exceeds negotiated frame bound" config.closeTimeout
    }

    let startAsync hub (config: Config) cancellationToken = task {
        let mutable listenUri = Unchecked.defaultof<Uri>
        let mutable originUri = Unchecked.defaultof<Uri>
        let validListen = Uri.TryCreate(config.url, UriKind.Absolute, &listenUri)
        let validOrigin = Uri.TryCreate(config.allowedOrigin, UriKind.Absolute, &originUri)
        let loopback =
            validListen
            && listenUri.Scheme = Uri.UriSchemeHttp
            && (listenUri.Host = "localhost"
                || listenUri.Host = IPAddress.Loopback.ToString()
                || listenUri.Host = IPAddress.IPv6Loopback.ToString())
        if not loopback
           || not validOrigin
           || (originUri.Scheme <> Uri.UriSchemeHttp && originUri.Scheme <> Uri.UriSchemeHttps)
           || not (String.IsNullOrEmpty listenUri.AbsolutePath || listenUri.AbsolutePath = "/")
           || not (String.IsNullOrEmpty listenUri.Query && String.IsNullOrEmpty listenUri.Fragment && String.IsNullOrEmpty listenUri.UserInfo)
           || originUri.AbsolutePath <> "/"
           || not (String.IsNullOrEmpty originUri.Query && String.IsNullOrEmpty originUri.Fragment)
           || String.IsNullOrWhiteSpace config.path || not (config.path.StartsWith "/") || config.path.StartsWith("//")
           || config.path.Contains('?') || config.path.Contains('#')
           || String.IsNullOrWhiteSpace config.credential || config.credentialSessionId = Guid.Empty
           || config.authTimeout <= TimeSpan.Zero || config.closeTimeout <= TimeSpan.Zero
           || config.maxFrameBytes <= 0 || config.maxEntities <= 0 then
            invalidArg "config" "browser preview requires loopback HTTP, an exact origin/path, session credential, and positive bounds"
        let builder = WebApplication.CreateBuilder()
        builder.WebHost.UseUrls(config.url) |> ignore
        let app = builder.Build()
        app.UseWebSockets() |> ignore
        app.Map(config.path, Func<HttpContext, Task>(fun context -> runSocket hub config context :> Task)) |> ignore
        do! app.StartAsync(cancellationToken)
        return app :> IHost
    }

    let private authenticateLive (config: LiveConfig) origin (auth: ClientAuth) hub =
        match BrokerState.session hub, bytesGuid auth.ExpectedSessionId with
        | Some session, Some expected
            when origin=config.allowedOrigin && auth.Origin=origin && auth.Game=Game
              && auth.ProtocolVersion=ProtocolVersion && auth.Profile="barc-live-v1"
              && auth.Credential=config.credential && DateTimeOffset.UtcNow<=config.credentialExpiresAt
              && expected=config.credentialSessionId && expected=Session.id session -> Ok expected
        | _ -> Error "live browser credential, origin, protocol, or session refused"

    let private runLiveSocket hub (config: LiveConfig) (context: HttpContext) = task {
        let origin=context.Request.Headers.Origin.ToString()
        if origin<>config.allowedOrigin then context.Response.StatusCode<-StatusCodes.Status403Forbidden
        elif not context.WebSockets.IsWebSocketRequest then context.Response.StatusCode<-StatusCodes.Status400BadRequest
        else
            use! socket=context.WebSockets.AcceptWebSocketAsync()
            use authCts=CancellationTokenSource.CreateLinkedTokenSource(context.RequestAborted)
            authCts.CancelAfter config.authTimeout
            try
                let! received=receiveOne socket config.maxFrameBytes authCts.Token
                match received with
                | Error detail -> do! close socket WebSocketCloseStatus.InvalidPayloadData detail config.closeTimeout
                | Ok bytes ->
                    let parsed=try Ok(LiveClientEnvelope.Parser.ParseFrom(bytes.ToArray())) with :? InvalidProtocolBufferException -> Error "malformed live authentication"
                    match parsed with
                    | Error detail -> do! close socket WebSocketCloseStatus.InvalidPayloadData detail config.closeTimeout
                    | Ok message when isNull message.Authenticate -> do! close socket WebSocketCloseStatus.PolicyViolation "live authentication required" config.closeTimeout
                    | Ok message ->
                        match authenticateLive config origin message.Authenticate hub with
                        | Error detail -> do! close socket WebSocketCloseStatus.PolicyViolation detail config.closeTimeout
                        | Ok sessionId ->
                            let state=BrokerState.liveControl hub
                            match LiveBoundary.provisionBootstrap sessionId config.perspectiveId state with
                            | Error detail -> do! close socket WebSocketCloseStatus.PolicyViolation detail config.closeTimeout
                            | Ok bootstrap ->
                                use connectionCts=CancellationTokenSource.CreateLinkedTokenSource(context.RequestAborted)
                                do! send config.maxFrameBytes socket bootstrap connectionCts.Token
                                let mutable provisionalControllerId = bytesGuid bootstrap.Bootstrap.Controller.ControllerId
                                let outputs=Channel.CreateBounded<LiveServerEnvelope>(int (LiveControl.maxRetainedResults state) + 16)
                                let outputGate=obj()
                                let mutable lastObservationSequence: uint64 option=None
                                let mutable lastObservationEnvelope: LiveServerEnvelope option=None
                                let mutable lastStaleIdentity: struct(uint64 * uint64) option=None
                                let mutable observationGeneration=0UL
                                let enqueueLocked detail envelope =
                                    if not (outputs.Writer.TryWrite envelope) then
                                        outputs.Writer.TryComplete(InvalidOperationException detail) |> ignore
                                        false
                                    else true
                                let prepareObservation value =
                                    match value with
                                    | Snapshot.Current current when current.sessionId=sessionId ->
                                        let preview=(observation current).Observation
                                        match LiveBoundary.observation preview state with
                                        | Ok envelope -> PreparedCurrent(current.sequence,envelope)
                                        | Error _ -> PreparedUnavailable
                                    | Snapshot.Stale(staleSessionId,lastSequence,receivedSequence,detail) when staleSessionId=sessionId ->
                                        PreparedStale(lastSequence,receivedSequence,detail)
                                    | _ -> PreparedSessionChanged
                                let enqueuePreparedObservationLocked generation prepared =
                                    if generation=observationGeneration then
                                        match prepared with
                                        | PreparedCurrent(sequence,envelope) ->
                                            match lastObservationSequence with
                                            | Some prior when sequence<=prior -> ()
                                            | _ when enqueueLocked "live observation delivery capacity exhausted" envelope ->
                                                lastObservationSequence<-Some sequence
                                                lastObservationEnvelope<-Some(envelope.Clone())
                                                lastStaleIdentity<-None
                                            | _ -> ()
                                        | PreparedStale(lastSequence,receivedSequence,detail) ->
                                            let identity=struct(lastSequence,receivedSequence)
                                            let superseded=
                                                match lastObservationSequence with
                                                | Some delivered -> receivedSequence<=delivered
                                                | None -> false
                                            if not superseded then
                                                match lastObservationEnvelope with
                                                | Some prior when lastStaleIdentity<>Some identity ->
                                                    let stale=prior.Clone()
                                                    // Retain the last fully paired facts and basis. The validity
                                                    // reports the gap without inventing a snapshot for lastSequence.
                                                    stale.Observation.Preview.Validity<-
                                                        validity ValidityStatus.Stale lastSequence (Some receivedSequence) detail
                                                    if enqueueLocked "live stale observation delivery capacity exhausted" stale then
                                                        lastStaleIdentity<-Some identity
                                                | _ -> ()
                                        | PreparedSessionChanged -> outputs.Writer.TryComplete(SessionChanged) |> ignore
                                        | PreparedUnavailable -> ()
                                let prepareAndEnqueueObservation value =
                                    // Projection consults BrokerState/LiveControl. Never perform it while
                                    // holding outputGate: admission feedback is synchronously published while
                                    // holding LiveControl's gate to preserve broker-before-native ordering.
                                    let generation=lock outputGate (fun () -> observationGeneration)
                                    let prepared=prepareObservation value
                                    lock outputGate (fun () -> enqueuePreparedObservationLocked generation prepared)
                                let feedObserver =
                                    { new IObserver<Snapshot.BrowserFeed> with
                                        member _.OnNext value = prepareAndEnqueueObservation value
                                        member _.OnError error = outputs.Writer.TryComplete error |> ignore
                                        member _.OnCompleted() = outputs.Writer.TryComplete() |> ignore }
                                let metadataObserver =
                                    { new IObserver<uint64> with
                                        member _.OnNext sequence =
                                            let generation=lock outputGate (fun () -> observationGeneration)
                                            let prepared=
                                                match BrokerState.browserLatest hub with
                                                | Some(Snapshot.Current current as feed) when current.sequence=sequence -> prepareObservation feed
                                                | _ -> PreparedUnavailable
                                            lock outputGate (fun () -> enqueuePreparedObservationLocked generation prepared)
                                        member _.OnError error = outputs.Writer.TryComplete error |> ignore
                                        member _.OnCompleted() = () }
                                let resultObserver =
                                    { new IObserver<LiveControl.Feedback> with
                                        member _.OnNext value = lock outputGate (fun () -> enqueueLocked "live result delivery capacity exhausted" (LiveBoundary.feedbackEnvelope value) |> ignore)
                                        member _.OnError error = outputs.Writer.TryComplete error |> ignore
                                        member _.OnCompleted() = outputs.Writer.TryComplete() |> ignore }
                                let controllerObserver =
                                    { new IObserver<LiveControl.ControllerUpdate> with
                                        member _.OnNext value =
                                            let terminal=value.stage = LiveControl.Revoked || value.stage = LiveControl.ControllerExpired || value.stage = LiveControl.ControllerRefused
                                            let replacement =
                                                if terminal then
                                                    match LiveBoundary.provisionBootstrap sessionId config.perspectiveId state with
                                                    | Error detail -> Error detail
                                                    | Ok bootstrap ->
                                                        let prepared=BrokerState.browserLatest hub |> Option.map prepareObservation
                                                        Ok(Some(bootstrap,prepared))
                                                else Ok None
                                            let mutable unusedControllerId=None
                                            lock outputGate (fun () ->
                                                if enqueueLocked "live controller delivery capacity exhausted" (LiveBoundary.controllerEnvelope value) then
                                                    match replacement with
                                                    | Ok(Some(bootstrap,prepared)) when enqueueLocked "live replacement bootstrap delivery capacity exhausted" bootstrap ->
                                                        unusedControllerId<-provisionalControllerId
                                                        provisionalControllerId<-bytesGuid bootstrap.Bootstrap.Controller.ControllerId
                                                        observationGeneration<-observationGeneration+1UL
                                                        lastObservationSequence<-None
                                                        lastObservationEnvelope<-None
                                                        lastStaleIdentity<-None
                                                        prepared |> Option.iter (enqueuePreparedObservationLocked observationGeneration)
                                                    | Ok(Some(bootstrap,_)) -> unusedControllerId<-bytesGuid bootstrap.Bootstrap.Controller.ControllerId
                                                    | Ok None -> ()
                                                    | Error detail -> outputs.Writer.TryComplete(InvalidOperationException detail) |> ignore
                                                else
                                                    match replacement with
                                                    | Ok(Some(bootstrap,_)) -> unusedControllerId<-bytesGuid bootstrap.Bootstrap.Controller.ControllerId
                                                    | _ -> ())
                                            unusedControllerId |> Option.iter (fun controllerId -> LiveControl.releaseProvisionalController controllerId state)
                                        member _.OnError error = outputs.Writer.TryComplete error |> ignore
                                        member _.OnCompleted() = outputs.Writer.TryComplete() |> ignore }
                                let latest,feedSubscription=BrokerState.subscribeBrowserFeed feedObserver hub
                                use feedSubscription=feedSubscription
                                use metadataSubscription=(LiveControl.metadataReports state).Subscribe metadataObserver
                                use resultSubscription=(LiveControl.feedback state).Subscribe resultObserver
                                use controllerSubscription=(LiveControl.controllerUpdates state).Subscribe controllerObserver
                                let mutable ownedBinding: LiveBinding option = None
                                latest |> Option.iter prepareAndEnqueueObservation
                                let receiveTask=task {
                                    while socket.State=WebSocketState.Open do
                                        let! frame=receiveOne socket config.maxFrameBytes connectionCts.Token
                                        match frame with
                                        | Error detail -> raise(InvalidOperationException detail)
                                        | Ok payload ->
                                            let request=LiveClientEnvelope.Parser.ParseFrom(payload.ToArray())
                                            match request.BodyCase with
                                            | LiveClientEnvelope.BodyOneofCase.Arm ->
                                                match LiveBoundary.arm sessionId request.Arm DateTimeOffset.UtcNow state with
                                                | Ok () ->
                                                    provisionalControllerId <- None
                                                    ownedBinding <- LiveControl.currentBinding state
                                                | Error detail -> raise(InvalidOperationException detail)
                                            | LiveClientEnvelope.BodyOneofCase.Revoke ->
                                                match LiveBoundary.revoke sessionId request.Revoke DateTimeOffset.UtcNow state with
                                                | Ok () -> ownedBinding <- None
                                                | Error detail -> raise(InvalidOperationException detail)
                                            | LiveClientEnvelope.BodyOneofCase.Submit ->
                                                match LiveBoundary.submit sessionId request.Submit DateTimeOffset.UtcNow state with
                                                | Ok _ -> ()
                                                | Error detail -> raise(InvalidOperationException detail)
                                            | _ -> raise(InvalidOperationException "unsupported live client envelope") }
                                let outputTask = task {
                                    while true do
                                        let! item = outputs.Reader.ReadAsync(connectionCts.Token).AsTask()
                                        do! send config.maxFrameBytes socket item connectionCts.Token }
                                let renewTask = task {
                                    while true do
                                        do! Task.Delay(TimeSpan.FromMilliseconds 500.0, connectionCts.Token)
                                        let now=DateTimeOffset.UtcNow
                                        LiveControl.expirePendingResults now state |> ignore
                                        match BrokerState.session hub with
                                        | Some current when Session.id current=sessionId ->
                                            match ownedBinding with
                                            | Some binding -> LiveControl.requestRenew binding 2000u now state |> ignore
                                            | None -> ()
                                        | _ -> raise SessionChanged }
                                let observed=[|receiveTask:>Task;outputTask:>Task;renewTask:>Task|]
                                let! _=Task.WhenAny observed
                                connectionCts.Cancel()
                                try do! Task.WhenAll observed with _ -> ()
                                ownedBinding
                                |> Option.iter (fun binding -> LiveControl.requestRevoke binding "browser connection ended" DateTimeOffset.UtcNow state |> ignore)
                                provisionalControllerId |> Option.iter (fun controllerId -> LiveControl.releaseProvisionalController controllerId state)
                                do! close socket WebSocketCloseStatus.NormalClosure "live session ended" config.closeTimeout
            with
            | :? OperationCanceledException -> ()
            | :? InvalidOperationException as ex -> do! close socket WebSocketCloseStatus.PolicyViolation ex.Message config.closeTimeout
            | :? InvalidProtocolBufferException -> do! close socket WebSocketCloseStatus.InvalidPayloadData "malformed live frame" config.closeTimeout
    }

    let startLiveAsync hub (config: LiveConfig) cancellationToken = task {
        let mutable listenUri = Unchecked.defaultof<Uri>
        let mutable originUri = Unchecked.defaultof<Uri>
        let validListen = Uri.TryCreate(config.url, UriKind.Absolute, &listenUri)
        let validOrigin = Uri.TryCreate(config.allowedOrigin, UriKind.Absolute, &originUri)
        let loopback =
            validListen
            && listenUri.Scheme = Uri.UriSchemeHttp
            && (listenUri.Host = "localhost"
                || listenUri.Host = IPAddress.Loopback.ToString()
                || listenUri.Host = IPAddress.IPv6Loopback.ToString())
        if not loopback
           || not validOrigin
           || (originUri.Scheme <> Uri.UriSchemeHttp && originUri.Scheme <> Uri.UriSchemeHttps)
           || not (String.IsNullOrEmpty listenUri.AbsolutePath || listenUri.AbsolutePath = "/")
           || not (String.IsNullOrEmpty listenUri.Query && String.IsNullOrEmpty listenUri.Fragment && String.IsNullOrEmpty listenUri.UserInfo)
           || originUri.AbsolutePath <> "/"
           || not (String.IsNullOrEmpty originUri.Query && String.IsNullOrEmpty originUri.Fragment && String.IsNullOrEmpty originUri.UserInfo)
           || String.IsNullOrWhiteSpace config.path || not (config.path.StartsWith "/") || config.path.StartsWith("//")
           || config.path.Contains('?') || config.path.Contains('#')
           || String.IsNullOrWhiteSpace config.credential || config.credentialSessionId = Guid.Empty
           || config.authTimeout <= TimeSpan.Zero || config.closeTimeout <= TimeSpan.Zero
           || config.maxFrameBytes <= 0 then
            invalidArg "config" "live browser requires loopback HTTP, an exact origin/path, session credential, and positive bounds"
        let builder=WebApplication.CreateBuilder()
        builder.WebHost.UseUrls(config.url)|>ignore
        let app=builder.Build()
        app.UseWebSockets()|>ignore
        app.Map(config.path,Func<HttpContext,Task>(fun context->runLiveSocket hub config context:>Task))|>ignore
        do! app.StartAsync(cancellationToken)
        return app:>IHost
    }
