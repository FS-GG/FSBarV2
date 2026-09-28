namespace Broker.Protocol

open System
open System.Collections.Generic
open System.Threading.Tasks
open System.Threading.Channels
open Broker.Core
open FSBarV2.Broker.Contracts

module BrokerState =

    type ClientChannel =
        { id: ScriptingClientId
          mutable subscriber: Channel<StateMsg> option
          feedbackBacklog: Queue<StateMsg> }

    type OutboundDelivery =
        { sessionId: Guid
          parentCommandId: Guid
          originatingClient: ScriptingClientId
          batches: Highbar.V1.CommandBatch list }

    type CoordinatorCommandLease =
        { sessionId: Guid
          leaseId: Guid
          pluginId: string
          channelIncarnation: string
          reader: ChannelReader<OutboundDelivery> }

    type CoordinatorCommandClaim =
        | NoCoordinator
        | AlreadyClaimed
        | Claimed of CoordinatorCommandLease

    type CoordinatorOutbound =
        { sessionId: Guid
          leaseId: Guid
          channel: Channel<OutboundDelivery>
          mutable readerClaimed: bool
          mutable pluginId: string
          mutable channelIncarnation: string }

    type NativeResultDisposition =
        | Recorded
        | Duplicate
        | Late

    type NativeIdentity =
        { sessionId: Guid
          leaseId: Guid
          pluginId: string
          channelIncarnation: string
          parentCommandId: Guid
          originatingClient: ScriptingClientId
          childIndex: int
          childCount: int
          targetUnitId: uint32
          batchSeq: uint64
          correlation: uint64
          expectedDispatches: uint32
          feedbackReserved: bool
          mutable resultPublished: bool
          mutable acceptedCommandCount: uint32 option
          mutable dispatchesSeen: uint32 }

    type PendingNativeResult =
        { identity: NativeIdentity
          completion: TaskCompletionSource<Highbar.V1.CommandBatchResult> }

    type SnapshotBroadcaster() =
        let observers = ResizeArray<IObserver<Snapshot.GameStateSnapshot>>()
        let lock' = obj ()
        member _.Push(snap: Snapshot.GameStateSnapshot) =
            let snap' =
                lock lock' (fun () -> observers.ToArray())
            for o in snap' do
                try o.OnNext(snap) with _ -> ()
        interface IObservable<Snapshot.GameStateSnapshot> with
            member _.Subscribe(observer: IObserver<Snapshot.GameStateSnapshot>) =
                lock lock' (fun () -> observers.Add observer)
                { new IDisposable with
                    member _.Dispose() =
                        lock lock' (fun () -> observers.Remove observer |> ignore) }

    type BrowserBroadcaster() =
        let observers = ResizeArray<IObserver<Snapshot.BrowserFeed>>()
        let lock' = obj ()
        member _.Push(value: Snapshot.BrowserFeed) =
            let copy = lock lock' (fun () -> observers.ToArray())
            for observer in copy do
                try observer.OnNext(value) with _ -> ()
        interface IObservable<Snapshot.BrowserFeed> with
            member _.Subscribe(observer: IObserver<Snapshot.BrowserFeed>) =
                lock lock' (fun () -> observers.Add observer)
                { new IDisposable with
                    member _.Dispose() = lock lock' (fun () -> observers.Remove observer |> ignore) }

    type OwnerRule =
        | FirstAttached
        | Pinned of pluginId:string

    type Hub =
        { brokerVersion: Version
          commandQueueCapacity: int
          auditEmitter: Audit.AuditEvent -> unit
          mutable session: Session.Session option
          mutable mode: Mode.Mode
          mutable roster: ScriptingRoster.Roster
          mutable slots: ParticipantSlot.ParticipantSlot list
          mutable coordinatorOutbound: CoordinatorOutbound option
          mutable nextBatchSeq: uint64
          mutable nextCorrelation: uint64
          mutable expectedSchemaVersion: string
          mutable ownerRule: OwnerRule
          mutable telemetryGap: bool
          mutable telemetryValid: bool
          mutable invalidity: (uint64 * uint64 * string) option
          // Live coordinator metadata that the heartbeat watchdog reads. Distinct
          // from the immutable ProxyAiLink embedded in Session.proxy so the watchdog
          // can refresh the timestamp without rebuilding the session record.
          mutable activePluginId: string option
          mutable lastHeartbeatAt: DateTimeOffset
          pendingNativeResults: Dictionary<struct(string * uint64 * uint64), PendingNativeResult>
          completedNativeResults: HashSet<struct(string * uint64 * uint64)>
          completedNativeResultOrder: Queue<struct(string * uint64 * uint64)>
          nativeIdentities: Dictionary<struct(string * uint64 * uint64), NativeIdentity>
          feedbackReservations: Dictionary<ScriptingClientId, int>
          clients: System.Collections.Concurrent.ConcurrentDictionary<ScriptingClientId, ClientChannel>
          stateLock: obj
          snapshotBroadcaster: SnapshotBroadcaster
          mutable browserLatest: Snapshot.BrowserFeed option
          browserBroadcaster: BrowserBroadcaster }

    let create
        (brokerVersion: Version)
        (commandQueueCapacity: int)
        (auditEmitter: Audit.AuditEvent -> unit)
        : Hub =
        { brokerVersion = brokerVersion
          commandQueueCapacity = commandQueueCapacity
          auditEmitter = auditEmitter
          session = None
          mode = Mode.Mode.Idle
          roster = ScriptingRoster.empty
          slots = []
          coordinatorOutbound = None
          nextBatchSeq = 1UL
          nextCorrelation = 1UL
          expectedSchemaVersion = "1.0.0"
          ownerRule = FirstAttached
          telemetryGap = false
          telemetryValid = false
          invalidity = None
          activePluginId = None
          lastHeartbeatAt = DateTimeOffset.MinValue
          pendingNativeResults = Dictionary()
          completedNativeResults = HashSet()
          completedNativeResultOrder = Queue()
          nativeIdentities = Dictionary()
          feedbackReservations = Dictionary()
          clients = System.Collections.Concurrent.ConcurrentDictionary<ScriptingClientId, ClientChannel>()
          stateLock = obj()
          snapshotBroadcaster = SnapshotBroadcaster()
          browserLatest = None
          browserBroadcaster = BrowserBroadcaster() }

    let brokerVersion (hub: Hub) = hub.brokerVersion
    let auditEmitter (hub: Hub) = hub.auditEmitter
    let mode (hub: Hub) = hub.mode
    let roster (hub: Hub) = hub.roster
    let slots (hub: Hub) = hub.slots
    let session (hub: Hub) = hub.session

    let private withLock (hub: Hub) (f: unit -> 'a) : 'a =
        lock hub.stateLock f

    let private newProxyOutbound sessionId capacity =
        let opts =
            BoundedChannelOptions(capacity,
                FullMode = BoundedChannelFullMode.Wait,
                SingleReader = true,
                SingleWriter = false)
        { sessionId = sessionId
          leaseId = Guid.NewGuid()
          channel = Channel.CreateBounded<OutboundDelivery>(opts)
          readerClaimed = false
          pluginId = ""
          channelIncarnation = "" }

    let openHostSession
        (config: Lobby.LobbyConfig)
        (at: DateTimeOffset)
        (hub: Hub)
        : Result<unit, string> =
        withLock hub (fun () ->
            match hub.session with
            | Some _ -> Error "session already active"
            | None ->
                let s = Session.newHostSession config at
                let prevMode = hub.mode
                hub.session <- Some s
                hub.mode <- Mode.Mode.Hosting config
                hub.slots <- config.participants
                hub.auditEmitter (Audit.AuditEvent.ModeChanged (at, prevMode, hub.mode))
                Ok ())

    let launchHostSession (at: DateTimeOffset) (hub: Hub) : Result<unit, string> =
        ignore at
        withLock hub (fun () ->
            match hub.session, hub.mode with
            | Some s, Mode.Mode.Hosting cfg ->
                let connected =
                    hub.roster
                    |> ScriptingRoster.toList
                    |> List.map (fun c -> c.id)
                match Lobby.validate cfg connected with
                | Error e -> Error (sprintf "lobby invalid: %A" e)
                | Ok _ ->
                    match Session.markLaunching s with
                    | Ok newSession ->
                        hub.session <- Some newSession
                        Ok ()
                    | Error e -> Error e
            | None, _ -> Error "no active session"
            | Some _, _ -> Error "launchHostSession requires Hosting mode")

    let openGuestSession (at: DateTimeOffset) (hub: Hub) : Result<unit, string> =
        withLock hub (fun () ->
            match hub.session with
            | Some _ -> Error "session already active"
            | None ->
                let s = Session.newGuestSession at
                let prevMode = hub.mode
                hub.session <- Some s
                hub.mode <- Mode.Mode.Guest
                hub.auditEmitter (Audit.AuditEvent.ModeChanged (at, prevMode, hub.mode))
                Ok ())

    let private broadcastSessionEnd (hub: Hub) (sessionId: Guid) (reason: Session.EndReason) =
        let endReasonEnum =
            match reason with
            | Session.Victory             -> SessionEnd.Types.Reason.Victory
            | Session.Defeat              -> SessionEnd.Types.Reason.Defeat
            | Session.OperatorTerminated  -> SessionEnd.Types.Reason.OperatorTerminated
            | Session.GameCrashed         -> SessionEnd.Types.Reason.GameCrashed
            | Session.ProxyDisconnected _ -> SessionEnd.Types.Reason.ProxyDisconnected
        let detail =
            match reason with
            | Session.ProxyDisconnected d -> d
            | _ -> ""
        let bytes = Google.Protobuf.ByteString.CopyFrom(sessionId.ToByteArray())
        let endMsg = SessionEnd.empty()
        endMsg.SessionId <- bytes
        endMsg.Reason <- endReasonEnum
        endMsg.Detail <- detail
        let stateMsg = StateMsg.empty()
        stateMsg.SessionEnd <- endMsg
        for KeyValue(_, c) in hub.clients do
            match c.subscriber with
            | Some ch ->
                ch.Writer.TryWrite(stateMsg) |> ignore
                ch.Writer.TryComplete() |> ignore
            | None -> ()

    let private recordDeliveryOutcome (hub: Hub) (delivery: OutboundDelivery) index outcome detail =
        let batch = delivery.batches[index]
        let correlation = batch.ClientCommandId |> ValueOption.defaultValue 0UL
        hub.auditEmitter
            (Audit.AuditEvent.CoordinatorCommandDelivery
                (DateTimeOffset.UtcNow, delivery.sessionId, delivery.originatingClient,
                 delivery.parentCommandId, index, delivery.batches.Length, batch.TargetUnitId,
                 batch.BatchSeq, correlation, outcome, detail))

    let private nativeKey incarnation batchSeq correlation =
        struct (incarnation, batchSeq, correlation)

    // Each parent queue slot may expand to several native children. Keep a
    // finite correlated-result window without making a valid multi-unit
    // parent depend on the parent-envelope queue depth.
    let private retentionCapacity (hub: Hub) = max 16 (hub.commandQueueCapacity * 16)
    let private maxRetainedIssues = 4
    let private maxRetainedFieldChars = 128
    let private maxRetainedDetailChars = 512

    let private truncateText maxChars (value: string) =
        if value.Length <= maxChars then value
        else value.Substring(0, maxChars)

    let private feedbackReservationCountLocked (hub: Hub) clientId =
        match hub.feedbackReservations.TryGetValue clientId with
        | true, count -> count
        | false, _ -> 0

    let private changeFeedbackReservationLocked (hub: Hub) clientId delta =
        let count = feedbackReservationCountLocked hub clientId + delta
        if count > 0 then hub.feedbackReservations[clientId] <- count
        else hub.feedbackReservations.Remove clientId |> ignore

    let private enqueueFeedbackLocked (hub: Hub) (clientId: ScriptingClientId) parentId stage reserved (message: StateMsg) =
        match reserved, hub.clients.TryGetValue clientId with
        | false, _ ->
            hub.auditEmitter
                (Audit.AuditEvent.CoordinatorTerminalFeedbackUnavailable
                    (DateTimeOffset.UtcNow, clientId, parentId, stage,
                     "originating scripting client was not registered at admission; typed audit retained"))
        | true, (true, client) ->
            match client.subscriber with
            | Some channel when channel.Writer.TryWrite message ->
                changeFeedbackReservationLocked hub clientId -1
            | _ ->
                // Admission reserved this exact terminal-result slot before
                // forwarding, so this enqueue cannot exceed the declared cap.
                client.feedbackBacklog.Enqueue message
                changeFeedbackReservationLocked hub clientId -1
        | true, (false, _) ->
            changeFeedbackReservationLocked hub clientId -1
            hub.auditEmitter
                (Audit.AuditEvent.CoordinatorTerminalFeedbackUnavailable
                    (DateTimeOffset.UtcNow, clientId, parentId, stage,
                     "originating scripting client is no longer registered; typed audit retained"))

    let private resultDetail (result: Highbar.V1.CommandBatchResult) =
        result.Issues
        |> Seq.truncate maxRetainedIssues
        |> Seq.map (fun issue ->
            if String.IsNullOrWhiteSpace issue.Detail then string issue.Code else issue.Detail)
        |> String.concat "; "
        |> truncateText maxRetainedDetailChars

    let private publishNativeResultLocked
        (hub: Hub)
        (identity: NativeIdentity)
        (outcome: Audit.NativeAdmissionOutcome)
        (acceptedCount: uint32)
        (issues: seq<Highbar.V1.CommandIssue>)
        (detail: string) =
        let detail = truncateText maxRetainedDetailChars detail
        hub.auditEmitter
            (Audit.AuditEvent.CoordinatorNativeCommandResult
                (DateTimeOffset.UtcNow, identity.sessionId, identity.originatingClient,
                 identity.parentCommandId, identity.childIndex, identity.childCount,
                 identity.targetUnitId, identity.batchSeq, identity.correlation,
                 identity.channelIncarnation, outcome, acceptedCount, detail))
        let result = NativeCommandResult.empty()
        result.ParentCommandId <- Google.Protobuf.ByteString.CopyFrom(identity.parentCommandId.ToByteArray())
        let (ScriptingClientId clientName) = identity.originatingClient
        result.OriginatingClient <- clientName
        result.ChildIndex <- uint32 identity.childIndex
        result.ChildCount <- uint32 identity.childCount
        result.TargetUnitId <- identity.targetUnitId
        result.BatchSeq <- identity.batchSeq
        result.ClientCommandId <- identity.correlation
        result.Status <-
            match outcome with
            | Audit.Accepted -> NativeCommandResultStatus.NativeCommandAccepted
            | Audit.RejectedInvalid -> NativeCommandResultStatus.NativeCommandRejectedInvalid
            | Audit.RejectedQueueFull -> NativeCommandResultStatus.NativeCommandRejectedQueueFull
            | Audit.NativeUnknown -> NativeCommandResultStatus.NativeCommandUnknown
        result.AcceptedCommandCount <- acceptedCount
        for source in issues |> Seq.truncate maxRetainedIssues do
            let issue = NativeCommandIssue.empty()
            issue.Code <- int source.Code
            issue.CommandIndex <- source.CommandIndex
            issue.FieldPath <- truncateText maxRetainedFieldChars source.FieldPath
            issue.Detail <- truncateText maxRetainedDetailChars source.Detail
            issue.RetryHint <- int source.RetryHint
            result.Issues.Add issue
        result.Detail <- detail
        result.ChannelIncarnation <- identity.channelIncarnation
        let message = StateMsg.empty()
        message.NativeCommandResult <- result
        enqueueFeedbackLocked hub identity.originatingClient identity.parentCommandId "native-admission" identity.feedbackReserved message
        identity.resultPublished <- true

    let private completePendingUnknownLocked (hub: Hub) (pending: PendingNativeResult) detail =
        let key = nativeKey pending.identity.channelIncarnation pending.identity.batchSeq pending.identity.correlation
        if hub.pendingNativeResults.Remove key then
            publishNativeResultLocked hub pending.identity Audit.NativeUnknown 0u Seq.empty detail
            pending.completion.TrySetCanceled() |> ignore

    let private completeIdentityUnknownLocked (hub: Hub) (identity: NativeIdentity) detail =
        if not identity.resultPublished then
            publishNativeResultLocked hub identity Audit.NativeUnknown 0u Seq.empty detail

    let private releaseDispatchReservationsLocked (hub: Hub) (identity: NativeIdentity) count =
        if identity.feedbackReserved && count > 0u then
            changeFeedbackReservationLocked hub identity.originatingClient -(int count)

    let private rememberCompletedLocked (hub: Hub) key =
        if hub.completedNativeResults.Add key then
            hub.completedNativeResultOrder.Enqueue key
            while hub.completedNativeResultOrder.Count > retentionCapacity hub do
                hub.completedNativeResults.Remove(hub.completedNativeResultOrder.Dequeue()) |> ignore

    let private completePendingForLeaseLocked (hub: Hub) leaseId detail =
        hub.pendingNativeResults.Values
        |> Seq.filter (fun pending -> pending.identity.leaseId = leaseId)
        |> Seq.toArray
        |> Array.iter (fun pending -> completePendingUnknownLocked hub pending detail)

    let private completeIdentitiesForLeaseLocked (hub: Hub) leaseId detail =
        hub.nativeIdentities.Values
        |> Seq.filter (fun identity -> identity.leaseId = leaseId)
        |> Seq.toArray
        |> Array.iter (fun identity -> completeIdentityUnknownLocked hub identity detail)

    let private clearNativeTrackingLocked (hub: Hub) detail =
        hub.pendingNativeResults.Values
        |> Seq.toArray
        |> Array.iter (fun pending -> completePendingUnknownLocked hub pending detail)
        hub.nativeIdentities.Values
        |> Seq.toArray
        |> Array.iter (fun identity ->
            completeIdentityUnknownLocked hub identity detail
            let remaining =
                if identity.expectedDispatches > identity.dispatchesSeen then
                    identity.expectedDispatches - identity.dispatchesSeen
                else 0u
            releaseDispatchReservationsLocked hub identity remaining)
        hub.completedNativeResults.Clear()
        hub.completedNativeResultOrder.Clear()
        hub.nativeIdentities.Clear()
        hub.feedbackReservations.Clear()

    let private discardQueuedDeliveries (hub: Hub) (outbound: CoordinatorOutbound) detail =
        let mutable delivery = Unchecked.defaultof<OutboundDelivery>
        while outbound.channel.Reader.TryRead(&delivery) do
            delivery.batches
            |> List.iteri (fun index batch ->
                recordDeliveryOutcome hub delivery index Audit.NotAttempted detail
                let correlation = batch.ClientCommandId |> ValueOption.defaultValue 0UL
                let key = nativeKey outbound.channelIncarnation batch.BatchSeq correlation
                match hub.nativeIdentities.TryGetValue key with
                | true, identity -> completeIdentityUnknownLocked hub identity detail
                | false, _ -> ())

    let closeSession (reason: Session.EndReason) (at: DateTimeOffset) (hub: Hub) : unit =
        withLock hub (fun () ->
            match hub.session with
            | None -> ()
            | Some s ->
                clearNativeTrackingLocked hub "coordinator session closed after command forwarding; native result is unknown"
                broadcastSessionEnd hub (Session.id s) reason
                hub.auditEmitter (Audit.AuditEvent.SessionEnded (at, Session.id s, reason))
                let prevMode = hub.mode
                hub.session <- None
                hub.mode <- Mode.Mode.Idle
                hub.slots <- []
                hub.coordinatorOutbound
                |> Option.iter (fun outbound ->
                    outbound.channel.Writer.TryComplete() |> ignore
                    discardQueuedDeliveries hub outbound "session closed before transport write")
                hub.coordinatorOutbound <- None
                hub.nextBatchSeq <- 1UL
                hub.nextCorrelation <- 1UL
                hub.activePluginId <- None
                hub.lastHeartbeatAt <- DateTimeOffset.MinValue
                hub.telemetryGap <- false
                hub.telemetryValid <- false
                hub.invalidity <- None
                hub.browserLatest <- None
                if prevMode <> hub.mode then
                    hub.auditEmitter (Audit.AuditEvent.ModeChanged (at, prevMode, hub.mode)))

    let private attachLink (link: Session.ProxyAiLink) (hub: Hub) : Result<unit, string> =
        withLock hub (fun () ->
            // Auto-detect: if no host session is in flight, this is Guest.
            let s, mode =
                match hub.session with
                | None ->
                    let g = Session.newGuestSession link.attachedAt
                    g, Mode.Mode.Guest
                | Some existing -> existing, hub.mode
            match Session.attachProxy link s with
            | Error e -> Error e
            | Ok newSession ->
                let prevMode = hub.mode
                hub.session <- Some newSession
                hub.mode <- mode
                hub.browserLatest <- None
                hub.coordinatorOutbound
                |> Option.iter (fun outbound ->
                    outbound.channel.Writer.TryComplete() |> ignore
                    discardQueuedDeliveries hub outbound "coordinator session was replaced before transport write")
                clearNativeTrackingLocked hub "coordinator session was replaced after command forwarding; native result is unknown"
                let sessionId = Session.id newSession
                hub.coordinatorOutbound <- Some (newProxyOutbound sessionId hub.commandQueueCapacity)
                hub.nextBatchSeq <- 1UL
                hub.nextCorrelation <- 1UL
                if prevMode <> hub.mode then
                    hub.auditEmitter (Audit.AuditEvent.ModeChanged (link.attachedAt, prevMode, hub.mode))
                Ok ())

    let applySnapshot (snapshot: Snapshot.GameStateSnapshot) (hub: Hub) : unit =
        // Convert before taking the lock, then enqueue under the same lock as
        // invalidation and subscription. This preserves stream order without
        // holding the lock across network I/O (TryWrite is nonblocking).
        let message = StateMsg.empty()
        message.Snapshot <- WireConvert.fromCoreSnapshot snapshot
        let applied =
            withLock hub (fun () ->
                match hub.session with
                | None -> false
                | Some s ->
                    hub.session <- Some (Session.applySnapshot snapshot s)
                    hub.telemetryValid <- true
                    hub.telemetryGap <- false
                    hub.invalidity <- None
                    for KeyValue(_, client) in hub.clients do
                        match client.subscriber with
                        | Some channel -> channel.Writer.TryWrite(message) |> ignore
                        | None -> ()
                    true)
        if applied then
            hub.snapshotBroadcaster.Push snapshot

    let snapshots (hub: Hub) : IObservable<Snapshot.GameStateSnapshot> =
        hub.snapshotBroadcaster :> IObservable<Snapshot.GameStateSnapshot>

    let applyBrowserObservation
        (perspectiveId: string)
        (observation: Snapshot.BrowserObservation)
        (hub: Hub)
        : unit =
        let published =
            withLock hub (fun () ->
                match hub.session with
                | None -> None
                | Some session ->
                    let current =
                        Snapshot.Current
                            { observation with
                                sessionId = Session.id session
                                perspectiveId = perspectiveId }
                    hub.browserLatest <- Some current
                    Some current)
        published |> Option.iter hub.browserBroadcaster.Push

    let invalidateBrowserFeed
        (lastSequence: uint64)
        (receivedSequence: uint64)
        (detail: string)
        (hub: Hub)
        : unit =
        let published =
            withLock hub (fun () ->
                match hub.session with
                | None -> None
                | Some session ->
                    let stale = Snapshot.Stale(Session.id session, lastSequence, receivedSequence, detail)
                    hub.browserLatest <- Some stale
                    Some stale)
        published |> Option.iter hub.browserBroadcaster.Push

    let browserLatest (hub: Hub) = withLock hub (fun () -> hub.browserLatest)

    let browserFeed (hub: Hub) : IObservable<Snapshot.BrowserFeed> =
        hub.browserBroadcaster :> IObservable<Snapshot.BrowserFeed>

    let subscribeBrowserFeed (observer: IObserver<Snapshot.BrowserFeed>) (hub: Hub) =
        withLock hub (fun () ->
            let subscription =
                (hub.browserBroadcaster :> IObservable<Snapshot.BrowserFeed>).Subscribe(observer)
            hub.browserLatest, subscription)

    let togglePause (hub: Hub) : Result<unit, string> =
        withLock hub (fun () ->
            match hub.session with
            | None -> Error "no active session"
            | Some s ->
                hub.session <- Some (Session.togglePause s)
                Ok ())

    let stepSpeed (delta: decimal) (hub: Hub) : Result<unit, string> =
        withLock hub (fun () ->
            match hub.session with
            | None -> Error "no active session"
            | Some s ->
                hub.session <- Some (Session.stepSpeed delta s)
                Ok ())

    let tryClaimCoordinatorCommandChannel pluginId channelIncarnation (hub: Hub) =
        withLock hub (fun () ->
            match hub.coordinatorOutbound with
            | Some outbound when not outbound.readerClaimed ->
                outbound.readerClaimed <- true
                outbound.pluginId <- pluginId
                outbound.channelIncarnation <- channelIncarnation
                Claimed
                    { sessionId = outbound.sessionId
                      leaseId = outbound.leaseId
                      pluginId = pluginId
                      channelIncarnation = channelIncarnation
                      reader = outbound.channel.Reader }
            | Some _ -> AlreadyClaimed
            | None -> NoCoordinator)

    let hasCoordinatorCommandChannel (hub: Hub) =
        withLock hub (fun () -> hub.coordinatorOutbound.IsSome)

    let ensureCoordinatorCommandChannel (hub: Hub) =
        withLock hub (fun () ->
            match hub.coordinatorOutbound, hub.session, hub.activePluginId with
            | Some _, _, _ -> true
            | None, Some session, Some _ ->
                hub.coordinatorOutbound <-
                    Some (newProxyOutbound (Session.id session) hub.commandQueueCapacity)
                true
            | _ -> false)

    let closeCoordinatorCommandChannel leaseId reason (hub: Hub) =
        withLock hub (fun () ->
            match hub.coordinatorOutbound with
            | Some outbound when outbound.leaseId = leaseId ->
                completePendingForLeaseLocked hub leaseId reason
                completeIdentitiesForLeaseLocked hub leaseId reason
                outbound.channel.Writer.TryComplete() |> ignore
                discardQueuedDeliveries hub outbound reason
                hub.coordinatorOutbound <- None
            | _ -> ())

    let completeCoordinatorCommandChannel sessionId reason (hub: Hub) =
        withLock hub (fun () ->
            match hub.coordinatorOutbound with
            | Some outbound when outbound.sessionId = sessionId ->
                completePendingForLeaseLocked hub outbound.leaseId reason
                completeIdentitiesForLeaseLocked hub outbound.leaseId reason
                outbound.channel.Writer.TryComplete() |> ignore
                discardQueuedDeliveries hub outbound reason
                hub.coordinatorOutbound <- None
            | _ -> ())

    let isCurrentDelivery (delivery: OutboundDelivery) (hub: Hub) : bool =
        withLock hub (fun () ->
            hub.session
            |> Option.exists (fun session -> Session.id session = delivery.sessionId)
            && hub.coordinatorOutbound
               |> Option.exists (fun outbound -> outbound.sessionId = delivery.sessionId))

    let registerPendingNativeResult
        (lease: CoordinatorCommandLease)
        (delivery: OutboundDelivery)
        childIndex
        (hub: Hub) =
        withLock hub (fun () ->
            let batch = delivery.batches[childIndex]
            let correlation = batch.ClientCommandId |> ValueOption.defaultValue 0UL
            let key = nativeKey lease.channelIncarnation batch.BatchSeq correlation
            match hub.coordinatorOutbound, hub.nativeIdentities.TryGetValue key with
            | Some outbound
              , (true, identity)
                when outbound.sessionId = lease.sessionId
                     && outbound.leaseId = lease.leaseId
                     && outbound.pluginId = lease.pluginId
                     && outbound.channelIncarnation = lease.channelIncarnation
                     && not (hub.pendingNativeResults.ContainsKey key)
                     && identity.leaseId = lease.leaseId
                     && identity.parentCommandId = delivery.parentCommandId ->
                let completion =
                    TaskCompletionSource<Highbar.V1.CommandBatchResult>(TaskCreationOptions.RunContinuationsAsynchronously)
                hub.pendingNativeResults[key] <- { identity = identity; completion = completion }
                Ok completion.Task
            | Some _, _ -> Error "coordinator command lease or reserved native identity was replaced before pending registration"
            | None, _ -> Error "coordinator command channel closed before pending registration")

    let expirePendingNativeResult channelIncarnation batchSeq correlation detail (hub: Hub) =
        withLock hub (fun () ->
            let key = nativeKey channelIncarnation batchSeq correlation
            match hub.pendingNativeResults.TryGetValue key with
            | true, pending -> completePendingUnknownLocked hub pending detail
            | false, _ -> ())

    let reportNativeResult pluginId channelIncarnation (result: Highbar.V1.CommandBatchResult) (hub: Hub) =
        withLock hub (fun () ->
            let key = nativeKey channelIncarnation result.BatchSeq result.ClientCommandId
            match hub.pendingNativeResults.TryGetValue key with
            | true, pending when pending.identity.pluginId = pluginId ->
                hub.pendingNativeResults.Remove key |> ignore
                rememberCompletedLocked hub key
                let outcome =
                    match result.Status with
                    | Highbar.V1.CommandBatchStatus.CommandBatchAccepted
                    | Highbar.V1.CommandBatchStatus.CommandBatchAcceptedWithWarnings -> Audit.Accepted
                    | Highbar.V1.CommandBatchStatus.CommandBatchRejectedQueueFull -> Audit.RejectedQueueFull
                    | _ -> Audit.RejectedInvalid
                let detail = resultDetail result
                publishNativeResultLocked hub pending.identity outcome result.AcceptedCommandCount result.Issues detail
                match outcome with
                | Audit.Accepted ->
                    let accepted = min result.AcceptedCommandCount pending.identity.expectedDispatches
                    pending.identity.acceptedCommandCount <- Some accepted
                    let retained = min pending.identity.expectedDispatches (max accepted pending.identity.dispatchesSeen)
                    let unused = pending.identity.expectedDispatches - retained
                    releaseDispatchReservationsLocked hub pending.identity unused
                    if pending.identity.dispatchesSeen >= accepted then
                        hub.nativeIdentities.Remove key |> ignore
                | _ ->
                    releaseDispatchReservationsLocked hub pending.identity pending.identity.expectedDispatches
                    hub.nativeIdentities.Remove key |> ignore
                pending.completion.TrySetResult result |> ignore
                Recorded
            | true, _ -> Late
            | false, _ when hub.completedNativeResults.Contains key -> Duplicate
            | false, _ -> Late)

    let noteNativeDispatch (dispatch: Highbar.V1.CommandDispatchEvent) (hub: Hub) =
        withLock hub (fun () ->
            let key = nativeKey dispatch.ChannelIncarnation dispatch.BatchSeq dispatch.ClientCommandId
            match hub.nativeIdentities.TryGetValue key, hub.coordinatorOutbound with
            | (true, identity), Some outbound
                when outbound.leaseId = identity.leaseId
                     && outbound.channelIncarnation = dispatch.ChannelIncarnation
                     && identity.dispatchesSeen < identity.expectedDispatches ->
                let outcome, wireOutcome =
                    if dispatch.Status = Highbar.V1.CommandDispatchStatus.CommandDispatchApplied then
                        Audit.Applied, NativeCommandDispatchStatus.NativeCommandDispatchApplied
                    else
                        Audit.Skipped (uint32 dispatch.Status), NativeCommandDispatchStatus.NativeCommandDispatchSkipped
                let detail =
                    match dispatch.Issue with
                    | ValueSome issue when not (String.IsNullOrWhiteSpace issue.Detail) ->
                        truncateText maxRetainedDetailChars issue.Detail
                    | _ -> string dispatch.Status
                hub.auditEmitter
                    (Audit.AuditEvent.CoordinatorNativeCommandDispatch
                        (DateTimeOffset.UtcNow, identity.sessionId, identity.originatingClient,
                         identity.parentCommandId, identity.childIndex, identity.childCount,
                         dispatch.CommandIndex, dispatch.TargetUnitId, dispatch.BatchSeq,
                         dispatch.ClientCommandId, dispatch.ChannelIncarnation, outcome,
                         dispatch.Frame, detail))
                let notification = NativeCommandDispatch.empty()
                notification.ParentCommandId <- Google.Protobuf.ByteString.CopyFrom(identity.parentCommandId.ToByteArray())
                let (ScriptingClientId clientName) = identity.originatingClient
                notification.OriginatingClient <- clientName
                notification.ChildIndex <- uint32 identity.childIndex
                notification.ChildCount <- uint32 identity.childCount
                notification.CommandIndex <- dispatch.CommandIndex
                notification.TargetUnitId <- dispatch.TargetUnitId
                notification.BatchSeq <- dispatch.BatchSeq
                notification.ClientCommandId <- dispatch.ClientCommandId
                notification.Status <- wireOutcome
                notification.NativeStatus <- uint32 dispatch.Status
                notification.Frame <- dispatch.Frame
                notification.Detail <- detail
                notification.ChannelIncarnation <- dispatch.ChannelIncarnation
                let message = StateMsg.empty()
                message.NativeCommandDispatch <- notification
                enqueueFeedbackLocked hub identity.originatingClient identity.parentCommandId "native-dispatch" identity.feedbackReserved message
                identity.dispatchesSeen <- identity.dispatchesSeen + 1u
                match identity.acceptedCommandCount with
                | Some expected when identity.dispatchesSeen >= expected ->
                    hub.nativeIdentities.Remove key |> ignore
                | _ -> ()
                true
            | _ -> false)

    let private expansionCount (command: CommandPipeline.Command) =
        match command.kind with
        | CommandPipeline.Gameplay (CommandPipeline.UnitOrder (ids, _, _, _)) -> ids.Length
        | _ -> 1

    let private admitOutboundLocked (command: CommandPipeline.Command) (hub: Hub) =
        match hub.session, hub.coordinatorOutbound with
        | Some session, Some outbound
            when outbound.readerClaimed
                 && not (String.IsNullOrWhiteSpace outbound.pluginId)
                 && not (String.IsNullOrWhiteSpace outbound.channelIncarnation) ->
            let count = expansionCount command
            let dummy = [ for i in 1 .. count -> uint64 i, uint64 i ]
            match WireConvert.tryExpandCoreCommandToHighBar command dummy with
            | Error reason -> Error reason
            // Keep one representable successor so advancing the reservation
            // cursor can never wrap to zero after a successful enqueue.
            | Ok _ when count > 0 &&
                        (hub.nextBatchSeq > UInt64.MaxValue - uint64 count ||
                         hub.nextCorrelation > UInt64.MaxValue - uint64 count) ->
                Error (CommandPipeline.InvalidPayload "coordinator child identity space is exhausted")
            | Ok _ ->
                let sessionId = Session.id session
                let allocations =
                    [ for index in 0 .. count - 1 ->
                        hub.nextBatchSeq + uint64 index,
                        hub.nextCorrelation + uint64 index ]
                match WireConvert.tryExpandCoreCommandToHighBar command allocations with
                | Error reason -> Error reason
                | Ok batches ->
                    let feedbackReserved = hub.clients.ContainsKey command.originatingClient
                    let requiredFeedback =
                        batches |> List.sumBy (fun batch -> 1 + batch.Commands.Count)
                    let feedbackFits =
                        if not feedbackReserved then true
                        else
                            match hub.clients.TryGetValue command.originatingClient with
                            | true, client ->
                                client.feedbackBacklog.Count
                                + feedbackReservationCountLocked hub command.originatingClient
                                + requiredFeedback
                                <= retentionCapacity hub
                            | false, _ -> false
                    if hub.nativeIdentities.Count + batches.Length > retentionCapacity hub
                       || not feedbackFits then
                        Error CommandPipeline.QueueFull
                    else
                        let identities =
                            batches
                            |> List.mapi (fun index batch ->
                                let correlation = batch.ClientCommandId |> ValueOption.defaultValue 0UL
                                let key = nativeKey outbound.channelIncarnation batch.BatchSeq correlation
                                key,
                                { sessionId = sessionId
                                  leaseId = outbound.leaseId
                                  pluginId = outbound.pluginId
                                  channelIncarnation = outbound.channelIncarnation
                                  parentCommandId = command.commandId
                                  originatingClient = command.originatingClient
                                  childIndex = index
                                  childCount = batches.Length
                                  targetUnitId = batch.TargetUnitId
                                  batchSeq = batch.BatchSeq
                                  correlation = correlation
                                  expectedDispatches = uint32 batch.Commands.Count
                                  feedbackReserved = feedbackReserved
                                  resultPublished = false
                                  acceptedCommandCount = None
                                  dispatchesSeen = 0u })
                        let delivery =
                            { sessionId = sessionId
                              parentCommandId = command.commandId
                              originatingClient = command.originatingClient
                              batches = batches }
                        for key, identity in identities do
                            hub.nativeIdentities[key] <- identity
                        if feedbackReserved then
                            changeFeedbackReservationLocked hub command.originatingClient requiredFeedback
                        if outbound.channel.Writer.TryWrite delivery then
                            hub.nextBatchSeq <- hub.nextBatchSeq + uint64 count
                            hub.nextCorrelation <- hub.nextCorrelation + uint64 count
                            Ok ()
                        else
                            for key, _ in identities do hub.nativeIdentities.Remove key |> ignore
                            if feedbackReserved then
                                changeFeedbackReservationLocked hub command.originatingClient -requiredFeedback
                            Error CommandPipeline.QueueFull
        | _ -> Error (CommandPipeline.InvalidPayload "no active coordinator command channel")

    let sendToCoordinator (command: CommandPipeline.Command) (hub: Hub) =
        let result = withLock hub (fun () -> admitOutboundLocked command hub)
        match result with
        | Ok () -> ()
        | Error reason ->
            hub.auditEmitter
                (Audit.AuditEvent.CommandRejected
                    (DateTimeOffset.UtcNow, command.originatingClient, command.commandId, reason))
        result

    let admitScriptingCommand
        (client: ClientChannel)
        (command: CommandPipeline.Command)
        (hub: Hub)
        : BackpressureGate.CommandAck =
        withLock hub (fun () ->
            if not hub.telemetryValid then
                { commandId = command.commandId
                  accepted = false
                  reject =
                    Some (
                        CommandPipeline.InvalidPayload
                            "telemetry baseline is invalid or missing; wait for a complete snapshot") }
            else
                match CommandPipeline.authorise hub.mode hub.roster hub.slots command with
                | Error reason ->
                    { commandId = command.commandId; accepted = false; reject = Some reason }
                | Ok () ->
                    match admitOutboundLocked command hub with
                    | Ok () -> { commandId = command.commandId; accepted = true; reject = None }
                    | Error reason ->
                        { commandId = command.commandId; accepted = false; reject = Some reason })

    let expectedSchemaVersion (hub: Hub) = hub.expectedSchemaVersion
    let setExpectedSchemaVersion (v: string) (hub: Hub) : unit =
        withLock hub (fun () -> hub.expectedSchemaVersion <- v)
    let ownerRule (hub: Hub) = hub.ownerRule
    let setOwnerRule (rule: OwnerRule) (hub: Hub) : unit =
        withLock hub (fun () -> hub.ownerRule <- rule)

    let attachCoordinator (link: Session.ProxyAiLink) (hub: Hub) : Result<unit, string> =
        // Open the underlying session via the shared `attachLink` helper,
        // then record coordinator-flavoured liveness metadata + audit.
        match attachLink link hub with
        | Error e -> Error e
        | Ok () ->
            withLock hub (fun () ->
                hub.activePluginId <- Some link.pluginId
                hub.lastHeartbeatAt <- link.attachedAt
                hub.telemetryGap <- false
                hub.telemetryValid <- false
                hub.invalidity <- None)
            hub.auditEmitter (
                Audit.AuditEvent.CoordinatorAttached
                    (link.attachedAt, link.pluginId, link.schemaVersion, link.engineSha256))
            Ok ()

    /// Owner rule enforcement (FR-011) + liveness refresh (FR-008).
    let noteHeartbeat
        (pluginId: string)
        (at: DateTimeOffset)
        (hub: Hub)
        : Result<unit, CommandPipeline.RejectReason> =
        withLock hub (fun () ->
            // Owner check — ownerRule + activePluginId together decide.
            let ownerCheck () =
                match hub.ownerRule, hub.activePluginId with
                | Pinned pinned, _ when pinned <> "" && pinned <> pluginId ->
                    Error (CommandPipeline.NotOwner (pluginId, pinned))
                | _, Some active when active <> "" && active <> pluginId ->
                    Error (CommandPipeline.NotOwner (pluginId, active))
                | _ -> Ok ()
            match ownerCheck () with
            | Error r ->
                let owner =
                    match r with
                    | CommandPipeline.NotOwner (_, o) -> o
                    | _ -> ""
                hub.auditEmitter (Audit.AuditEvent.CoordinatorNonOwnerRejected (at, pluginId, owner))
                Error r
            | Ok () ->
                // FirstAttached: capture the owner pluginId on the first
                // heartbeat for an attached session.
                if hub.activePluginId.IsNone && pluginId <> "" then
                    hub.activePluginId <- Some pluginId
                hub.lastHeartbeatAt <- at
                hub.auditEmitter (Audit.AuditEvent.CoordinatorHeartbeat (at, pluginId, 0u))
                Ok ())

    let noteStateGap
        (pluginId: string)
        (lastSeq: uint64)
        (receivedSeq: uint64)
        (at: DateTimeOffset)
        (hub: Hub)
        : unit =
        let validity = StateValidity.empty()
        validity.Status <- StateValidity.Types.Status.Invalid
        validity.LastSeq <- lastSeq
        validity.ReceivedSeq <- receivedSeq
        validity.Detail <- "state sequence gap"
        let message = StateMsg.empty()
        message.Validity <- validity
        withLock hub (fun () ->
                hub.telemetryGap <- true
                hub.telemetryValid <- false
                hub.invalidity <- Some (lastSeq, receivedSeq, "state sequence gap")
                for KeyValue(_, client) in hub.clients do
                    match client.subscriber with
                    | Some channel -> channel.Writer.TryWrite(message) |> ignore
                    | None -> ())
        hub.auditEmitter (Audit.AuditEvent.CoordinatorStateGap (at, pluginId, lastSeq, receivedSeq))

    let noteStateInvalidated
        (pluginId: string)
        (lastSeq: uint64)
        (receivedSeq: uint64)
        (detail: string)
        (at: DateTimeOffset)
        (hub: Hub)
        : unit =
        let validity = StateValidity.empty()
        validity.Status <- StateValidity.Types.Status.Invalid
        validity.LastSeq <- lastSeq
        validity.ReceivedSeq <- receivedSeq
        validity.Detail <- detail
        let message = StateMsg.empty()
        message.Validity <- validity
        withLock hub (fun () ->
                hub.telemetryGap <- true
                hub.telemetryValid <- false
                hub.invalidity <- Some (lastSeq, receivedSeq, detail)
                for KeyValue(_, client) in hub.clients do
                    match client.subscriber with
                    | Some channel -> channel.Writer.TryWrite(message) |> ignore
                    | None -> ())
        hub.auditEmitter (
            Audit.AuditEvent.CoordinatorStateInvalidated
                (at, pluginId, lastSeq, receivedSeq, detail))

    /// Lightweight liveness refresh — bumps `lastHeartbeatAt` without
    /// taking the owner-rule path or emitting an audit event. Called per
    /// inbound StateUpdate to keep the watchdog from false-tripping
    /// during steady streaming. The unary `Heartbeat` RPC keeps using
    /// `noteHeartbeat` for the audit + owner check.
    let refreshLiveness (at: DateTimeOffset) (hub: Hub) : unit =
        // No lock — single-writer (the per-attach PushState handler) and
        // a stale read here only delays the watchdog by one tick.
        hub.lastHeartbeatAt <- at

    /// Most recent Heartbeat / accepted StateUpdate timestamp for the live
    /// coordinator session. `MinValue` when no session is attached. Read by
    /// the heartbeat watchdog (HighBarCoordinatorService) for FR-008.
    let lastHeartbeatAt (hub: Hub) : DateTimeOffset = hub.lastHeartbeatAt

    let activePluginId (hub: Hub) : string option = hub.activePluginId

    let telemetryGap (hub: Hub) : bool = hub.telemetryGap

    let telemetryValid (hub: Hub) : bool = hub.telemetryValid

    let subscribeState
        (client: ClientChannel)
        (channel: Channel<StateMsg>)
        (hub: Hub)
        : unit =
        withLock hub (fun () ->
            client.subscriber <- Some channel
            let initial =
                match hub.session with
                | None -> None
                | Some session when hub.telemetryValid ->
                    (Session.toReading DateTimeOffset.UtcNow session).telemetry
                    |> Option.map (fun snapshot ->
                        let message = StateMsg.empty()
                        message.Snapshot <- WireConvert.fromCoreSnapshot snapshot
                        message)
                | Some _ ->
                    let lastSeq, receivedSeq, detail =
                        hub.invalidity
                        |> Option.defaultValue (0UL, 0UL, "awaiting a complete state snapshot")
                    let validity = StateValidity.empty()
                    validity.Status <- StateValidity.Types.Status.Invalid
                    validity.LastSeq <- lastSeq
                    validity.ReceivedSeq <- receivedSeq
                    validity.Detail <- detail
                    let message = StateMsg.empty()
                    message.Validity <- validity
                    Some message
            match initial with
            | Some message -> channel.Writer.TryWrite(message) |> ignore
            | None -> ()
            let rec drainBacklog () =
                if client.feedbackBacklog.Count > 0 then
                    let message = client.feedbackBacklog.Peek()
                    if channel.Writer.TryWrite message then
                        client.feedbackBacklog.Dequeue() |> ignore
                        drainBacklog ()
            drainBacklog ())

    let unsubscribeState (client: ClientChannel) (hub: Hub) : unit =
        withLock hub (fun () -> client.subscriber <- None)

    let flushFeedbackBacklog (client: ClientChannel) (hub: Hub) : unit =
        withLock hub (fun () ->
            let rec drain () =
                match client.subscriber with
                | Some channel when client.feedbackBacklog.Count > 0 ->
                    let message = client.feedbackBacklog.Peek()
                    if channel.Writer.TryWrite message then
                        client.feedbackBacklog.Dequeue() |> ignore
                        drain ()
                | _ -> ()
            drain ())

    let clearTelemetryGap (hub: Hub) : unit =
        withLock hub (fun () ->
            // A current invalid baseline cannot be acknowledged away. The
            // flag clears when applySnapshot establishes recovery.
            if hub.telemetryValid then
                hub.telemetryGap <- false)

    let registerClient
        (id: ScriptingClientId)
        (peerVersion: Version)
        (at: DateTimeOffset)
        (hub: Hub)
        : Result<ClientChannel, ScriptingRoster.RosterError> =
        withLock hub (fun () ->
            match ScriptingRoster.tryAdd id peerVersion at hub.roster with
            | Error e -> Error e
            | Ok newRoster ->
                hub.roster <- newRoster
                let channel : ClientChannel =
                    { id = id
                      subscriber = None
                      feedbackBacklog = Queue() }
                hub.clients[id] <- channel
                hub.auditEmitter (Audit.AuditEvent.ClientConnected (at, id, peerVersion))
                Ok channel)

    let unregisterClient
        (id: ScriptingClientId)
        (reason: string)
        (at: DateTimeOffset)
        (hub: Hub)
        : unit =
        withLock hub (fun () ->
            match hub.clients.TryRemove(id) with
            | true, c ->
                c.subscriber
                |> Option.iter (fun ch -> ch.Writer.TryComplete() |> ignore)
                hub.roster <- ScriptingRoster.remove id hub.roster
                // Also free any slot bindings the client held.
                hub.slots <- hub.slots |> List.map (fun s ->
                    if s.boundClient = Some id then { s with boundClient = None } else s)
                hub.auditEmitter (Audit.AuditEvent.ClientDisconnected (at, id, reason))
            | false, _ -> ())

    let tryGetClient (id: ScriptingClientId) (hub: Hub) : ClientChannel option =
        match hub.clients.TryGetValue(id) with
        | true, c -> Some c
        | false, _ -> None

    let liveClients (hub: Hub) : ClientChannel list =
        hub.clients |> Seq.map (fun kv -> kv.Value) |> List.ofSeq

    let grantAdmin
        (id: ScriptingClientId)
        (by: string)
        (at: DateTimeOffset)
        (hub: Hub)
        : Result<unit, ScriptingRoster.RosterError> =
        withLock hub (fun () ->
            match ScriptingRoster.grantAdmin id hub.roster with
            | Error e -> Error e
            | Ok r ->
                hub.roster <- r
                hub.auditEmitter (Audit.AuditEvent.AdminGranted (at, id, by))
                Ok ())

    let revokeAdmin
        (id: ScriptingClientId)
        (by: string)
        (at: DateTimeOffset)
        (hub: Hub)
        : Result<unit, ScriptingRoster.RosterError> =
        withLock hub (fun () ->
            match ScriptingRoster.revokeAdmin id hub.roster with
            | Error e -> Error e
            | Ok r ->
                hub.roster <- r
                hub.auditEmitter (Audit.AuditEvent.AdminRevoked (at, id, by))
                Ok ())

    let bindSlot
        (id: ScriptingClientId)
        (slot: int)
        (hub: Hub)
        : Result<unit, ParticipantSlot.SingleWriterError> =
        withLock hub (fun () ->
            match ParticipantSlot.tryBind slot id hub.slots with
            | Error e -> Error e
            | Ok newSlots ->
                hub.slots <- newSlots
                Ok ())

    let unbindSlot (id: ScriptingClientId) (slot: int) (hub: Hub) : unit =
        withLock hub (fun () ->
            // Only unbind if the slot is currently held by this client.
            let target = hub.slots |> List.tryFind (fun s -> s.slotIndex = slot)
            match target with
            | Some s when s.boundClient = Some id ->
                hub.slots <- ParticipantSlot.unbind slot hub.slots
            | _ -> ())

    let private rosterError (e: ScriptingRoster.RosterError) =
        match e with
        | ScriptingRoster.NameInUse  -> "name in use"
        | ScriptingRoster.NotFound (ScriptingClientId n) -> sprintf "client %s not found" n

    let asCoreFacade (hub: Hub) : Session.CoreFacade =
        { new Session.CoreFacade with
            member _.Mode() = hub.mode
            member _.Roster() = hub.roster
            member _.Slots() = hub.slots
            member _.BrokerVersion() = hub.brokerVersion
            member _.OnSnapshot(snapshot) = applySnapshot snapshot hub
            member _.OnClientConnected(client) =
                // Already handled by registerClient; this hook is for outside callers.
                ignore client
            member _.OnClientDisconnected(id, reason) =
                unregisterClient id reason DateTimeOffset.UtcNow hub
            member _.OperatorOpenHost(config) =
                openHostSession config DateTimeOffset.UtcNow hub
            member _.OperatorLaunchHost() =
                launchHostSession DateTimeOffset.UtcNow hub
            member _.OperatorTogglePause() =
                // Toggle the broker-internal pause display, then dispatch the
                // matching admin command to the coordinator (T031 / FR-005).
                // The coordinator translates Admin.Pause/Resume into
                // PauseTeamCommand on the wire (data-model §1.10).
                let r = togglePause hub
                match r with
                | Ok () ->
                    let nowDt = DateTimeOffset.UtcNow
                    let paused =
                        hub.session
                        |> Option.map (fun s -> (Session.toReading nowDt s).pause = Session.Paused)
                        |> Option.defaultValue false
                    let kind =
                        if paused then CommandPipeline.Admin CommandPipeline.Pause
                        else CommandPipeline.Admin CommandPipeline.Resume
                    let cmd : CommandPipeline.Command =
                        { commandId = Guid.NewGuid()
                          originatingClient = ScriptingClientId "operator"
                          targetSlot = None
                          kind = kind
                          submittedAt = nowDt }
                    sendToCoordinator cmd hub |> ignore
                | Error _ -> ()
                r
            member _.OperatorStepSpeed(delta) =
                // SetSpeed has no AICommand mapping (research §3); the local
                // dashboard speed indicator updates but the dispatch is
                // rejected at the coordinator boundary by
                // tryFromCoreCommandToHighBar. Audit the rejection so the
                // operator can see why the engine did not respond.
                let r = stepSpeed delta hub
                match r with
                | Ok () ->
                    let cmd : CommandPipeline.Command =
                        { commandId = Guid.NewGuid()
                          originatingClient = ScriptingClientId "operator"
                          targetSlot = None
                          kind = CommandPipeline.Admin (CommandPipeline.SetSpeed delta)
                          submittedAt = DateTimeOffset.UtcNow }
                    sendToCoordinator cmd hub |> ignore
                | Error _ -> ()
                r
            member _.OperatorEndSession() =
                closeSession Session.OperatorTerminated DateTimeOffset.UtcNow hub
                Ok ()
            member _.OperatorGrantAdmin(id) =
                grantAdmin id "operator" DateTimeOffset.UtcNow hub
                |> Result.mapError rosterError
            member _.OperatorRevokeAdmin(id) =
                revokeAdmin id "operator" DateTimeOffset.UtcNow hub
                |> Result.mapError rosterError }
