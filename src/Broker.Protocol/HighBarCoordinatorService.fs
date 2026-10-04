namespace Broker.Protocol

open System
open System.Threading
open System.Threading.Tasks
open Broker.Core
open Highbar.V1

module HighBarCoordinatorService =

    // Read-only opt-in diagnostics; no new RPC or public service surface.
    let private acceptedStateDiagnostics = new System.Diagnostics.DiagnosticListener("FSBar.HighBar.AcceptedState")

    type Config =
        { expectedSchemaVersion: string
          ownerRule: BrokerState.OwnerRule
          heartbeatTimeoutMs: int
          nativeResultTimeoutMs: int }

    let defaultConfig : Config =
        { expectedSchemaVersion = "1.0.0"
          ownerRule = BrokerState.FirstAttached
          heartbeatTimeoutMs = 5000
          nativeResultTimeoutMs = 2000 }

    type Service =
        { hub: BrokerState.Hub
          config: Config
          mutable attached: bool
          // Reset per attach. Set to a fresh CTS when an attach completes;
          // cancellation triggers closeSession + stream tear-down.
          mutable sessionCts: CancellationTokenSource option
          mutable sessionGeneration: Guid option
          mutable sessionReady: TaskCompletionSource<Guid>
          stateLock: obj }

    let create (hub: BrokerState.Hub) (config: Config) : Service =
        BrokerState.setExpectedSchemaVersion config.expectedSchemaVersion hub
        BrokerState.setOwnerRule config.ownerRule hub
        { hub = hub
          config = config
          attached = false
          sessionCts = None
          sessionGeneration = None
          sessionReady = TaskCompletionSource<Guid>(TaskCreationOptions.RunContinuationsAsynchronously)
          stateLock = obj() }

    let isAttached (service: Service) : bool = service.attached

    let private withLock (service: Service) (f: unit -> 'a) : 'a =
        lock service.stateLock f

    let private detachInternal (service: Service) (expectedGeneration: Guid option) (reason: string) : unit =
        let shouldDetach, cts =
            withLock service (fun () ->
                if expectedGeneration.IsSome && service.sessionGeneration = expectedGeneration then
                    let cts = service.sessionCts
                    let pid =
                        BrokerState.activePluginId service.hub
                        |> Option.defaultValue ""
                    service.sessionCts <- None
                    service.sessionGeneration <- None
                    service.sessionReady <- TaskCompletionSource<Guid>(TaskCreationOptions.RunContinuationsAsynchronously)
                    service.attached <- false
                    // Keep the service-generation fence held through Hub
                    // teardown so a replacement attach cannot be closed by
                    // stale cleanup after this critical section.
                    BrokerState.closeSession (Session.ProxyDisconnected reason) DateTimeOffset.UtcNow service.hub
                    service.hub
                    |> BrokerState.auditEmitter
                    |> fun emit -> emit (Audit.AuditEvent.CoordinatorDetached (DateTimeOffset.UtcNow, pid, reason))
                    true, cts
                else
                    false, None)
        if shouldDetach then
            match cts with
            | Some cts ->
                try cts.Cancel() with _ -> ()
                cts.Dispose()
            | None -> ()

    let detach (service: Service) (reason: string) : unit =
        let generation = withLock service (fun () -> service.sessionGeneration)
        detachInternal service generation reason

    /// Background heartbeat watchdog. Wakes every 500 ms; if the broker
    /// hasn't seen a Heartbeat or accepted StateUpdate within
    /// `heartbeatTimeoutMs`, force-closes the coordinator session.
    /// Implemented as an async loop bound to the per-attach CTS so the
    /// watchdog dies with the session it was watching (no zombie loops).
    let private startHeartbeatWatchdog (service: Service) (generation: Guid) (cts: CancellationTokenSource) : unit =
        let token = cts.Token
        Task.Run(fun () ->
            task {
                let interval = TimeSpan.FromMilliseconds(500.0)
                let timeout = TimeSpan.FromMilliseconds(float service.config.heartbeatTimeoutMs)
                while not token.IsCancellationRequested do
                    try
                        do! Task.Delay(interval, token)
                    with :? OperationCanceledException -> ()
                    if not token.IsCancellationRequested then
                        let last = BrokerState.lastHeartbeatAt service.hub
                        if last <> DateTimeOffset.MinValue then
                            let elapsed = DateTimeOffset.UtcNow - last
                            if elapsed > timeout then
                                detachInternal service (Some generation) "heartbeat-timeout"
            } :> Task)
        |> ignore

    let private rpcException (code: Grpc.Core.StatusCode) (detail: string) =
        Grpc.Core.RpcException(Grpc.Core.Status(code, detail))

    let private awaitOwningGeneration (service: Service) (cancellationToken: CancellationToken) : Task<Guid> =
        task {
            let ready =
                withLock service (fun () ->
                    match service.sessionGeneration with
                    | Some generation -> Task.FromResult generation
                    | None -> service.sessionReady.Task)
            let! completed =
                Task.WhenAny(
                    ready :> Task,
                    Task.Delay(service.config.heartbeatTimeoutMs, cancellationToken))
            if Object.ReferenceEquals(completed, ready :> Task) then
                return! ready
            elif cancellationToken.IsCancellationRequested then
                return raise (OperationCanceledException cancellationToken)
            else
                return raise (rpcException Grpc.Core.StatusCode.FailedPrecondition "timed out waiting for the owning heartbeat")
        }

    let writeDelivery
        (service: Service)
        (writeBatch: CommandBatch -> Task)
        (cancellationToken: CancellationToken)
        (delivery: BrokerState.OutboundDelivery)
        : Task<string option> =
        let emit index (batch: CommandBatch) outcome detail =
            let correlation =
                match batch.ClientCommandId with
                | ValueSome value -> value
                | ValueNone -> 0UL
            BrokerState.auditEmitter service.hub
                (Audit.AuditEvent.CoordinatorCommandDelivery
                    (DateTimeOffset.UtcNow, delivery.sessionId, delivery.originatingClient,
                     delivery.parentCommandId, index, delivery.batches.Length, batch.TargetUnitId,
                     batch.BatchSeq, correlation, outcome, detail))
        let notAttemptedFrom start detail =
            delivery.batches
            |> List.iteri (fun index batch ->
                if index >= start then emit index batch Audit.NotAttempted detail)
        task {
            let batches = List.toArray delivery.batches
            let mutable index = 0
            let mutable failure : string option = None
            while index < batches.Length && failure.IsNone do
                if cancellationToken.IsCancellationRequested then
                    notAttemptedFrom index "transport cancelled before write"
                    failure <- Some "cancelled"
                elif not (BrokerState.isCurrentDelivery delivery service.hub) then
                    notAttemptedFrom index "coordinator session was replaced"
                    failure <- Some "session-replaced"
                else
                    let batch = batches[index]
                    try
                        do! writeBatch batch
                        emit index batch Audit.WrittenToTransport "gRPC server-stream write completed; native result unavailable"
                        index <- index + 1
                    with
                    | :? OperationCanceledException ->
                        emit index batch Audit.Unknown "transport write cancellation left acceptance unknown"
                        notAttemptedFrom (index + 1) "earlier child write did not complete"
                        failure <- Some "cancelled-during-write"
                    | ex ->
                        emit index batch Audit.Unknown (sprintf "transport write failed: %s" ex.Message)
                        notAttemptedFrom (index + 1) "earlier child write failed"
                        failure <- Some (sprintf "write-error: %s" ex.Message)
            return failure
        }

    let private writeCorrelatedDelivery
        (service: Service)
        (lease: BrokerState.CoordinatorCommandLease)
        (writeBatch: CommandBatch -> Task)
        (cancellationToken: CancellationToken)
        (delivery: BrokerState.OutboundDelivery)
        : Task<string option> =
        task {
            let batches = List.toArray delivery.batches
            let mutable index = 0
            let mutable failure : string option = None
            let mutable notAttemptedStart = batches.Length
            while index < batches.Length && failure.IsNone do
                let batch = batches[index]
                let correlation = batch.ClientCommandId |> ValueOption.defaultValue 0UL
                if cancellationToken.IsCancellationRequested then
                    failure <- Some "cancelled"
                    notAttemptedStart <- index
                elif not (BrokerState.isCurrentDelivery delivery service.hub) then
                    failure <- Some "session-replaced"
                    notAttemptedStart <- index
                else
                    match BrokerState.registerPendingNativeResult lease delivery index service.hub with
                    | Error detail ->
                        failure <- Some detail
                        notAttemptedStart <- index
                    | Ok resultTask ->
                        try
                            do! writeBatch batch
                            let! completed =
                                Task.WhenAny(
                                    resultTask :> Task,
                                    Task.Delay(service.config.nativeResultTimeoutMs, cancellationToken))
                            if Object.ReferenceEquals(completed, resultTask :> Task) then
                                let! _ = resultTask
                                index <- index + 1
                            else
                                let detail =
                                    if cancellationToken.IsCancellationRequested then
                                        "command result wait cancelled after forwarding; native result is unknown"
                                    else
                                        "native admission result deadline expired after forwarding; native result is unknown"
                                BrokerState.expirePendingNativeResult lease.channelIncarnation batch.BatchSeq correlation detail service.hub
                                if cancellationToken.IsCancellationRequested then
                                    failure <- Some "cancelled-after-forward"
                                    notAttemptedStart <- index + 1
                                else index <- index + 1
                        with
                        | :? OperationCanceledException ->
                            BrokerState.expirePendingNativeResult lease.channelIncarnation batch.BatchSeq correlation "command stream cancelled after forwarding; native result is unknown" service.hub
                            failure <- Some "cancelled-during-write"
                            notAttemptedStart <- index + 1
                        | ex ->
                            BrokerState.expirePendingNativeResult lease.channelIncarnation batch.BatchSeq correlation (sprintf "command stream failed after pending registration: %s; native result is unknown" ex.Message) service.hub
                            failure <- Some (sprintf "write-error: %s" ex.Message)
                            notAttemptedStart <- index + 1
            if failure.IsSome then
                for remaining in notAttemptedStart .. batches.Length - 1 do
                    let batch = batches[remaining]
                    let correlation = batch.ClientCommandId |> ValueOption.defaultValue 0UL
                    service.hub
                    |> BrokerState.auditEmitter
                    |> fun emit ->
                        emit (Audit.AuditEvent.CoordinatorCommandDelivery
                            (DateTimeOffset.UtcNow, delivery.sessionId, delivery.originatingClient,
                             delivery.parentCommandId, remaining, delivery.batches.Length,
                             batch.TargetUnitId, batch.BatchSeq, correlation, Audit.NotAttempted,
                             "earlier child did not reach a terminal native result"))
            return failure
        }

    type Impl(service: Service) =
        inherit HighBarCoordinator.HighBarCoordinatorBase()

        override _.Heartbeat
            (request: HeartbeatRequest)
            (context: Grpc.Core.ServerCallContext)
            : Task<HeartbeatResponse> =
            ignore context
            task {
                let now = DateTimeOffset.UtcNow
                let received = request.SchemaVersion
                let expected = service.config.expectedSchemaVersion
                // FR-003: strict-equality schema check
                if received <> expected then
                    BrokerState.auditEmitter service.hub
                        (Audit.AuditEvent.CoordinatorSchemaMismatch (now, expected, received, request.PluginId))
                    raise (rpcException
                        Grpc.Core.StatusCode.FailedPrecondition
                        (sprintf "schema mismatch expected=%s received=%s" expected received))
                // Serialize the first attach, owner capture and generation
                // publication. Concurrent startup RPCs wait on sessionReady
                // and can never observe an owner-empty half-attach.
                let watchdog =
                    withLock service (fun () ->
                        let mutable started = None
                        if not service.attached then
                            let link : Session.ProxyAiLink =
                                { attachedAt = now
                                  protocolVersion = Version(1, 0)
                                  lastSnapshotAt = None
                                  keepAliveIntervalMs = service.config.heartbeatTimeoutMs
                                  pluginId = request.PluginId
                                  schemaVersion = received
                                  engineSha256 = request.EngineSha256
                                  lastHeartbeatAt = now
                                  lastSeq = 0UL }
                            match BrokerState.attachCoordinator link service.hub with
                            | Error e ->
                                raise (rpcException Grpc.Core.StatusCode.Internal (sprintf "attachCoordinator failed: %s" e))
                            | Ok () ->
                                let cts = new CancellationTokenSource()
                                let generation = Guid.NewGuid()
                                service.attached <- true
                                service.sessionCts <- Some cts
                                service.sessionGeneration <- Some generation
                                started <- Some (generation, cts)
                        match BrokerState.noteHeartbeat request.PluginId now service.hub with
                        | Error (CommandPipeline.NotOwner (attempted, owner)) ->
                            raise (rpcException Grpc.Core.StatusCode.PermissionDenied
                                (sprintf "not owner attempted=%s owner=%s" attempted owner))
                        | Error r ->
                            raise (rpcException Grpc.Core.StatusCode.Internal (sprintf "heartbeat rejected: %A" r))
                        | Ok () ->
                            match service.sessionGeneration with
                            | Some generation -> service.sessionReady.TrySetResult generation |> ignore
                            | None -> ()
                        started)
                watchdog |> Option.iter (fun (generation, cts) -> startHeartbeatWatchdog service generation cts)
                let resp = HeartbeatResponse.empty()
                resp.CoordinatorId <- "fsbar-broker"
                resp.EchoedFrame <- request.Frame
                resp.SchemaVersion <- expected
                return resp
            }

        override _.PushState
            (requestStream: Grpc.Core.IAsyncStreamReader<StateUpdate>)
            (context: Grpc.Core.ServerCallContext)
            : Task<PushAck> =
            task {
                let! owningGeneration = awaitOwningGeneration service context.CancellationToken
                let mutable view = WireConvert.emptyRunningView
                let mutable msgCount = 0UL
                let mutable maxSeq = 0UL
                try
                    let mutable continueLoop = true
                    while continueLoop do
                        let! more = requestStream.MoveNext(context.CancellationToken)
                        if not more then
                            continueLoop <- false
                        else
                            let upd = requestStream.Current
                            let now = DateTimeOffset.UtcNow
                            let view', result = WireConvert.applyHighBarStateUpdate upd view
                            let accepted =
                                withLock service (fun () ->
                                    if service.attached && service.sessionGeneration = Some owningGeneration then
                                        match upd.Payload with
                                        | ValueSome (StateUpdate.Types.Payload.Delta delta) ->
                                            for event in delta.Events do
                                                match event.Kind with
                                                | ValueSome (DeltaEvent.Types.Kind.CommandDispatch dispatch) ->
                                                    if not (LiveControl.noteDispatch dispatch (BrokerState.liveControl service.hub)) then
                                                        BrokerState.noteNativeDispatch dispatch service.hub |> ignore
                                                | _ -> ()
                                        | _ -> ()
                                        let pid =
                                            BrokerState.activePluginId service.hub
                                            |> Option.defaultValue ""
                                        match result with
                                        | WireConvert.NewSnapshot (snap, browser) ->
                                            BrokerState.applySnapshot snap service.hub
                                            BrokerState.applyBrowserObservation pid browser service.hub
                                            BrokerState.refreshLiveness now service.hub
                                        | WireConvert.Gap (l, r) ->
                                            BrokerState.noteStateGap pid l r now service.hub
                                            BrokerState.invalidateBrowserFeed l r "state sequence gap" service.hub
                                            BrokerState.refreshLiveness now service.hub
                                        | WireConvert.Invalidated (l, r, detail) ->
                                            BrokerState.noteStateInvalidated pid l r detail now service.hub
                                            BrokerState.invalidateBrowserFeed l r detail service.hub
                                            BrokerState.refreshLiveness now service.hub
                                        | WireConvert.KeepAliveOnly ->
                                            BrokerState.refreshLiveness now service.hub
                                        // Keep generation fencing through the readonly cloned diagnostic.
                                        if acceptedStateDiagnostics.IsEnabled("AcceptedState") then
                                            let disposition =
                                                match result with
                                                | WireConvert.NewSnapshot _ -> "materialized"
                                                | WireConvert.Invalidated _ -> "invalidated"
                                                | WireConvert.Gap _ -> "gap"
                                                | WireConvert.KeepAliveOnly -> "liveness-only"
                                            acceptedStateDiagnostics.Write("AcceptedState", box (struct(owningGeneration, upd.Clone(), disposition)))
                                        true
                                    else false)
                            if accepted then
                                view <- view'
                                msgCount <- msgCount + 1UL
                                if upd.Seq > maxSeq then maxSeq <- upd.Seq
                            else
                                continueLoop <- false
                with
                | :? OperationCanceledException -> ()
                // Stream completed: plugin signalled it's done streaming
                // state. Treat as graceful disconnect — fan out SessionEnd
                // and return to Idle (FR-008 acceptance scenario 4).
                if not context.CancellationToken.IsCancellationRequested then
                    detachInternal service (Some owningGeneration) "graceful-close"
                let ack = PushAck.empty()
                ack.MessagesReceived <- msgCount
                ack.MaxSeqSeen <- maxSeq
                ack.CoordinatorId <- "fsbar-broker"
                return ack
            }

        override _.OpenCommandChannel
            (request: CommandChannelSubscribe)
            (responseStream: Grpc.Core.IServerStreamWriter<CommandBatch>)
            (context: Grpc.Core.ServerCallContext)
            : Task =
            task {
                if request.SchemaVersion <> service.config.expectedSchemaVersion then
                    raise (rpcException Grpc.Core.StatusCode.FailedPrecondition
                        (sprintf "schema mismatch expected=%s received=%s" service.config.expectedSchemaVersion request.SchemaVersion))
                if request.AdmissionResultProtocol <> AdmissionResultProtocol.CorrelatedV1 then
                    raise (rpcException Grpc.Core.StatusCode.FailedPrecondition
                        "correlated native admission results are required; legacy observation-only command channels cannot forward commands")
                if String.IsNullOrWhiteSpace request.PluginId then
                    raise (rpcException Grpc.Core.StatusCode.InvalidArgument "plugin_id must be non-empty")
                if String.IsNullOrWhiteSpace request.ChannelIncarnation then
                    raise (rpcException Grpc.Core.StatusCode.InvalidArgument "channel_incarnation must be non-empty")
                let! owningGeneration = awaitOwningGeneration service context.CancellationToken
                let pid = request.PluginId
                let rec claim () =
                    task {
                        if context.CancellationToken.IsCancellationRequested then
                            return Error "cancelled-before-claim"
                        else
                            let claimResult =
                                withLock service (fun () ->
                                    if not service.attached || service.sessionGeneration <> Some owningGeneration then
                                        Choice2Of2 "owning heartbeat generation was replaced before command-channel claim"
                                    else
                                        let owner = BrokerState.activePluginId service.hub |> Option.defaultValue ""
                                        if owner <> request.PluginId then
                                            raise (rpcException Grpc.Core.StatusCode.PermissionDenied
                                                (sprintf "not owner attempted=%s owner=%s" request.PluginId owner))
                                        Choice1Of2 (BrokerState.tryClaimCoordinatorCommandChannel request.PluginId request.ChannelIncarnation service.hub))
                            match claimResult with
                            | Choice2Of2 detail ->
                                return raise (rpcException Grpc.Core.StatusCode.FailedPrecondition detail)
                            | Choice1Of2 BrokerState.NoCoordinator ->
                                let ensured =
                                    withLock service (fun () ->
                                        service.sessionGeneration = Some owningGeneration
                                        && BrokerState.ensureCoordinatorCommandChannel service.hub)
                                if not ensured then
                                    do! Task.Delay(100, context.CancellationToken)
                                return! claim ()
                            | Choice1Of2 BrokerState.AlreadyClaimed ->
                                return raise (rpcException Grpc.Core.StatusCode.AlreadyExists "coordinator command reader is already claimed")
                            | Choice1Of2 (BrokerState.Claimed lease) -> return Ok lease
                    }
                let rec drain (lease: BrokerState.CoordinatorCommandLease) =
                    task {
                        if context.CancellationToken.IsCancellationRequested then
                            return "cancelled"
                        else
                            let! ok = lease.reader.WaitToReadAsync(context.CancellationToken).AsTask()
                            if not ok then
                                return "channel-completed"
                            else
                                let mutable delivery = Unchecked.defaultof<_>
                                let mutable failure : string option = None
                                while failure.IsNone && lease.reader.TryRead(&delivery) do
                                    let! result =
                                        writeCorrelatedDelivery service lease responseStream.WriteAsync context.CancellationToken delivery
                                    failure <- result
                                match failure with
                                | Some reason -> return reason
                                | None -> return! drain lease
                    }
                let! closeReason =
                    task {
                      try
                        let! claimResult = claim ()
                        match claimResult with
                        | Error reason -> return reason
                        | Ok lease ->
                            BrokerState.auditEmitter service.hub
                                (Audit.AuditEvent.CoordinatorCommandChannelOpened (DateTimeOffset.UtcNow, pid))
                            try
                                return! drain lease
                            finally
                                BrokerState.closeCoordinatorCommandChannel
                                    lease.leaseId
                                    "command stream exited before transport write"
                                    service.hub
                      with
                      | :? OperationCanceledException -> return "cancelled"
                      | :? Grpc.Core.RpcException as ex -> return raise ex
                      | ex -> return sprintf "error: %s" ex.Message
                    }
                BrokerState.auditEmitter service.hub
                    (Audit.AuditEvent.CoordinatorCommandChannelClosed (DateTimeOffset.UtcNow, pid, closeReason))
            } :> Task

        override _.ReportCommandBatchResult
            (request: CommandBatchResultReport)
            (context: Grpc.Core.ServerCallContext)
            : Task<CommandBatchResultReportAck> =
            ignore context
            task {
                if request.SchemaVersion <> service.config.expectedSchemaVersion then
                    raise (rpcException Grpc.Core.StatusCode.FailedPrecondition
                        (sprintf "schema mismatch expected=%s received=%s" service.config.expectedSchemaVersion request.SchemaVersion))
                let owner = BrokerState.activePluginId service.hub |> Option.defaultValue ""
                if String.IsNullOrWhiteSpace request.PluginId || request.PluginId <> owner then
                    raise (rpcException Grpc.Core.StatusCode.PermissionDenied
                        (sprintf "not owner attempted=%s owner=%s" request.PluginId owner))
                if String.IsNullOrWhiteSpace request.ChannelIncarnation then
                    raise (rpcException Grpc.Core.StatusCode.InvalidArgument "channel_incarnation must be non-empty")
                let result =
                    match request.Result with
                    | ValueSome result -> result
                    | ValueNone -> raise (rpcException Grpc.Core.StatusCode.InvalidArgument "result must be present")
                let disposition =
                    match LiveControl.reportNativeAdmission request.PluginId request.ChannelIncarnation result (BrokerState.liveControl service.hub) with
                    | LiveControl.NativeRecorded -> BrokerState.Recorded
                    | LiveControl.NativeDuplicate -> BrokerState.Duplicate
                    | LiveControl.NativeNotOwned ->
                        BrokerState.reportNativeResult request.PluginId request.ChannelIncarnation result service.hub
                let reply = CommandBatchResultReportAck.empty()
                reply.Disposition <-
                    match disposition with
                    | BrokerState.Recorded -> CommandBatchResultReportDisposition.CommandBatchResultRecorded
                    | BrokerState.Duplicate -> CommandBatchResultReportDisposition.CommandBatchResultDuplicate
                    | BrokerState.Late -> CommandBatchResultReportDisposition.CommandBatchResultLate
                return reply
            }

    type LiveImpl(service: Service) =
        inherit HighBarLiveControl.HighBarLiveControlBase()

        let state = BrokerState.liveControl service.hub

        let requireOwner pluginId =
            let owner = BrokerState.activePluginId service.hub |> Option.defaultValue ""
            if String.IsNullOrWhiteSpace pluginId || pluginId <> owner then
                raise (rpcException Grpc.Core.StatusCode.PermissionDenied
                    (sprintf "not owner attempted=%s owner=%s" pluginId owner))

        let requireSchema schema =
            if schema <> service.config.expectedSchemaVersion then
                raise (rpcException Grpc.Core.StatusCode.FailedPrecondition
                    (sprintf "schema mismatch expected=%s received=%s" service.config.expectedSchemaVersion schema))

        override _.OpenLiveControlChannel request responseStream context =
            task {
                requireSchema request.SchemaVersion
                requireOwner request.PluginId
                match LiveControl.claimControl request state with
                | LiveControl.Unavailable detail ->
                    return raise (rpcException Grpc.Core.StatusCode.FailedPrecondition detail)
                | LiveControl.AlreadyClaimed ->
                    return raise (rpcException Grpc.Core.StatusCode.AlreadyExists "live control reader already claimed")
                | LiveControl.Claimed lease ->
                    try
                        try
                            let mutable running = true
                            while running && not context.CancellationToken.IsCancellationRequested do
                                let! ready = lease.reader.WaitToReadAsync(context.CancellationToken).AsTask()
                                running <- ready
                                let mutable directive = Unchecked.defaultof<LiveControlDirective>
                                while running && lease.reader.TryRead(&directive) do
                                    do! responseStream.WriteAsync directive
                        with :? OperationCanceledException -> ()
                    finally
                        LiveControl.releaseControl lease.incarnation state
            } :> Task

        override _.OpenLiveCommandChannel request responseStream context =
            task {
                requireSchema request.SchemaVersion
                match request.Binding with
                | ValueNone -> return raise (rpcException Grpc.Core.StatusCode.InvalidArgument "binding must be present")
                | ValueSome binding -> requireOwner binding.PluginId
                match LiveControl.claimCommands request state with
                | LiveControl.Unavailable detail ->
                    return raise (rpcException Grpc.Core.StatusCode.FailedPrecondition detail)
                | LiveControl.AlreadyClaimed ->
                    return raise (rpcException Grpc.Core.StatusCode.AlreadyExists "live command reader already claimed")
                | LiveControl.Claimed lease ->
                    try
                        try
                            let mutable running = true
                            while running && not context.CancellationToken.IsCancellationRequested do
                                let! ready = lease.reader.WaitToReadAsync(context.CancellationToken).AsTask()
                                running <- ready
                                let mutable delivery = Unchecked.defaultof<LiveControl.CommandDelivery>
                                while running && lease.reader.TryRead(&delivery) do
                                    for batch in delivery.batches do
                                        do! responseStream.WriteAsync batch
                        with :? OperationCanceledException -> ()
                    finally
                        LiveControl.releaseCommands lease.incarnation state
            } :> Task

        override _.ReportLiveControlAck request context =
            ignore context
            task {
                match request.Binding with
                | ValueNone -> raise (rpcException Grpc.Core.StatusCode.InvalidArgument "binding must be present")
                | ValueSome binding -> requireOwner binding.PluginId
                let response = LiveControlAckResponse.empty()
                response.Disposition <- LiveControl.reportControlAck request DateTimeOffset.UtcNow state
                return response
            }

        override _.ReportLiveState request context =
            ignore context
            task {
                match request.Reporter with
                | ValueNone -> raise (rpcException Grpc.Core.StatusCode.InvalidArgument "reporter must be present")
                | ValueSome reporter ->
                    requireSchema reporter.SchemaVersion
                    requireOwner reporter.PluginId
                let response = LiveStateReportAck.empty()
                response.ReportSequence <- request.ReportSequence
                response.Disposition <- LiveControl.reportState request DateTimeOffset.UtcNow state
                if response.Disposition = LiveStateReportDisposition.LiveStateReportRecorded then
                    match request.Body with
                    | ValueSome (LiveStateReport.Types.Body.Snapshot snapshot) when snapshot.Basis.IsSome ->
                        LiveControl.noteMetadataReported snapshot.Basis.Value.StateSequence state
                    | ValueSome (LiveStateReport.Types.Body.TacticalSnapshot snapshot) when snapshot.Basis.IsSome ->
                        LiveControl.noteMetadataReported snapshot.Basis.Value.StateSequence state
                    | _ -> ()
                return response
            }
