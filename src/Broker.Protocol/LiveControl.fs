namespace Broker.Protocol

open System
open System.Collections.Generic
open System.Threading.Channels
open Google.Protobuf
open Highbar.V1

module LiveControl =
    type Action = Stop | Move of x:float32 * z:float32 * append:bool | Attack of target:NativeUnitReference
    type Submission =
        { parentId: Guid; inputId: Guid; sessionId: Guid; controllerId: Guid
          controllerIncarnation: string; authorityEpoch: uint64; moduleSha256: byte[]
          moduleGeneration: uint64; basis: NativeObservationBasis; actors: NativeUnitReference list; action: Action }
    type TacticalQueueBinding = { domain: NativeQueueDomain; revision: uint64 }
    type TacticalActor =
        { reference: NativeUnitReference; descriptorRevision: uint64
          queueRevisions: TacticalQueueBinding list }
    type TacticalCatalogueBinding = { id: byte[]; revision: uint64 }
    type TacticalAction =
        | Build of NativeBuildIntent | Guard of NativeFriendlyTargetIntent | Repair of NativeFriendlyTargetIntent
        | ReclaimUnit of NativeFriendlyTargetIntent | ReclaimFeature of NativeReclaimFeatureIntent
        | ReclaimArea of NativeReclaimAreaIntent | FactoryProduce of NativeFactoryProduceIntent
        | SetRally of NativeSetRallyIntent | QueueEdit of NativeQueueEditIntent | TacticalMode of NativeTacticalModeIntent
    type TacticalSubmission =
        { parentId: Guid; inputId: Guid; sessionId: Guid; controllerId: Guid
          controllerIncarnation: string; authorityEpoch: uint64; moduleSha256: byte[]
          moduleGeneration: uint64; basis: NativeObservationBasis; actors: TacticalActor list
          catalogue: TacticalCatalogueBinding option; action: TacticalAction }
    type FeedbackStage = BrokerAdmission | NativeAdmission | NativeDispatch | Unknown
    type FeedbackStatus = Accepted | Rejected | Applied | Skipped | Expired | UnknownStatus
    type Feedback =
        { resultSequence: uint64; parentId: Guid; inputId: Guid; sessionId: Guid
          controllerId: Guid; controllerIncarnation: string; moduleGeneration: uint64
          moduleSha256: byte[]; authorityEpoch: uint64; basis: NativeObservationBasis
          batchSequence: uint64; correlationId: uint64
          childIndex: int; childCount: int; actor: NativeUnitReference
          stage: FeedbackStage; status: FeedbackStatus; detail: string
          nativeFrame: uint32 option; commandChannelIncarnation: string }
    type ControllerStage = ArmRequested | NativeConfirmed | RevokeRequested | Revoked | ControllerExpired | ControllerRefused
    type ControllerUpdate = { stateSequence: uint64; binding: LiveBinding; stage: ControllerStage; reason: string }
    type ProvisionalController = { sessionId: Guid; controllerId: Guid; controllerIncarnation: string; authorityEpoch: uint64 }
    type ControlLease = { incarnation: string; reader: ChannelReader<LiveControlDirective> }
    type CommandDelivery = { batches: LiveCommandBatch list }
    type CommandLease = { incarnation: string; reader: ChannelReader<CommandDelivery> }
    type ClaimResult<'a> = Claimed of 'a | AlreadyClaimed | Unavailable of string
    type NativeAdmissionDisposition = NativeRecorded | NativeDuplicate | NativeNotOwned

    type Controller =
        { binding: LiveBinding; mutable stage: ControllerStage; mutable controlSequence: uint64
          mutable leaseExpiresAt: DateTimeOffset; mutable moduleGeneration: uint64
          mutable renewPending: bool; mutable pendingLeaseMs: uint32; mutable pendingDeadline: DateTimeOffset }
    type Identity =
        { feedback: Feedback; deadline: DateTimeOffset
          mutable admissionSeen: bool; mutable dispatchSeen: bool
          mutable pendingDispatch: CommandDispatchEvent option }
    type Broadcaster() =
        let observers = ResizeArray<IObserver<Feedback>>()
        let gate = obj()
        member _.Push value =
            let copy = lock gate (fun () -> observers.ToArray())
            for observer in copy do try observer.OnNext value with _ -> ()
        interface IObservable<Feedback> with
            member _.Subscribe observer =
                lock gate (fun () -> observers.Add observer)
                { new IDisposable with member _.Dispose() = lock gate (fun () -> observers.Remove observer |> ignore) }
    type ControllerBroadcaster() =
        let observers = ResizeArray<IObserver<ControllerUpdate>>()
        let gate = obj()
        member _.Push value =
            let copy = lock gate (fun () -> observers.ToArray())
            for observer in copy do try observer.OnNext value with _ -> ()
        interface IObservable<ControllerUpdate> with
            member _.Subscribe observer =
                lock gate (fun () -> observers.Add observer)
                { new IDisposable with member _.Dispose() = lock gate (fun () -> observers.Remove observer |> ignore) }
    type MetadataBroadcaster() =
        let observers = ResizeArray<IObserver<uint64>>()
        let gate = obj()
        member _.Push value =
            let copy = lock gate (fun () -> observers.ToArray())
            for observer in copy do try observer.OnNext value with _ -> ()
        interface IObservable<uint64> with
            member _.Subscribe observer =
                lock gate (fun () -> observers.Add observer)
                { new IDisposable with member _.Dispose() = lock gate (fun () -> observers.Remove observer |> ignore) }

    type State =
        { gate: obj; parentCapacity: int; controlChannel: Channel<LiveControlDirective>
          commandChannel: Channel<CommandDelivery>; mutable controlClaim: string option
          mutable commandClaim: string option; mutable reporter: LiveStateReporter option
          mutable capabilities: LiveNativeCapabilities option; mutable snapshot: LiveSnapshotMetadata option
          tacticalPages: SortedDictionary<uint32,TacticalCataloguePage>
          mutable tacticalCatalogueIdentity: struct(ByteString * uint64 * uint32) option
          mutable tacticalCatalogue: TacticalCataloguePage list option
          mutable tacticalSnapshot: TacticalSnapshotMetadata option
          mutable snapshotReceivedAt: DateTimeOffset; mutable lastReportSequence: uint64; mutable controller: Controller option
          mutable nextControlSequence: uint64; mutable nextBatchSequence: uint64
          mutable nextCorrelation: uint64; mutable nextResultSequence: uint64; mutable nextControllerStateSequence: uint64
          parents: HashSet<Guid>; identities: Dictionary<struct(string * uint64 * uint64), Identity>
          completedParents: HashSet<Guid>; completedParentOrder: Queue<Guid>
          completed: HashSet<struct(string * uint64 * uint64)>; completedOrder: Queue<struct(string * uint64 * uint64)>
          provisionalControllers: Dictionary<Guid, ProvisionalController>; provisionalOrder: Queue<Guid>; mutable nextAuthorityEpoch: uint64
          broadcaster: Broadcaster; controllerBroadcaster: ControllerBroadcaster; metadataBroadcaster: MetadataBroadcaster }

    let private bounded<'a> capacity =
        Channel.CreateBounded<'a>(BoundedChannelOptions(capacity, FullMode=BoundedChannelFullMode.Wait, SingleReader=true, SingleWriter=false))
    let create parentCapacity =
        if parentCapacity <= 0 then invalidArg "parentCapacity" "must be positive"
        { gate=obj(); parentCapacity=parentCapacity; controlChannel=bounded 16; commandChannel=bounded parentCapacity
          controlClaim=None; commandClaim=None; reporter=None; capabilities=None; snapshot=None
          tacticalPages=SortedDictionary(); tacticalCatalogueIdentity=None; tacticalCatalogue=None; tacticalSnapshot=None
          snapshotReceivedAt=DateTimeOffset.MinValue; lastReportSequence=0UL; controller=None; nextControlSequence=1UL
          nextBatchSequence=1UL; nextCorrelation=1UL; nextResultSequence=1UL; nextControllerStateSequence=1UL
          parents=HashSet(); identities=Dictionary(); completedParents=HashSet(); completedParentOrder=Queue()
          completed=HashSet(); completedOrder=Queue(); provisionalControllers=Dictionary(); provisionalOrder=Queue(); nextAuthorityEpoch=1UL
          broadcaster=Broadcaster(); controllerBroadcaster=ControllerBroadcaster(); metadataBroadcaster=MetadataBroadcaster() }

    let private bytesEqual (a: ByteString) (b: ByteString) = a.Span.SequenceEqual b.Span
    let private validReporter (reporter: LiveStateReporter) =
        not (String.IsNullOrWhiteSpace reporter.PluginId)
        && not (String.IsNullOrWhiteSpace reporter.ProcessIncarnation)
        && not (String.IsNullOrWhiteSpace reporter.StateChannelIncarnation)
        && reporter.MatchIncarnation.Length = 16
        && (reporter.Protocol = LiveControlProtocol.V1 || reporter.Protocol = LiveControlProtocol.TacticalV1)
    let private sameReporter (a: LiveStateReporter) (b: LiveStateReporter) =
        a.PluginId=b.PluginId && a.ProcessIncarnation=b.ProcessIncarnation
        && a.StateChannelIncarnation=b.StateChannelIncarnation && bytesEqual a.MatchIncarnation b.MatchIncarnation
        && a.Protocol=b.Protocol

    let private finiteOptional (value: ValueOption<float32>) =
        value |> ValueOption.forall Single.IsFinite
    let private equalBasis (a: NativeObservationBasis) (b: NativeObservationBasis) =
        a.StateSequence=b.StateSequence && a.Frame=b.Frame && bytesEqual a.Token b.Token
        && bytesEqual a.MatchIncarnation b.MatchIncarnation && a.ProcessIncarnation=b.ProcessIncarnation
        && a.StateChannelIncarnation=b.StateChannelIncarnation
    let private fullTupleTacticalProfile = "barc-live-tactical-v1"
    let private stockTacticalProfile = "barc-live-tactical-stock-v1"
    let private validTacticalCapabilities (value: NativeTacticalCapabilities) =
        ((value.Profile=fullTupleTacticalProfile && value.Revision=1u)
         || (value.Profile=stockTacticalProfile && value.Revision=2u))
        && value.MaxCatalogueEntries>0u && value.MaxCataloguePageEntries>0u
        && value.MaxCataloguePageEntries<=value.MaxCatalogueEntries
        && value.MaxBuildOptionsPerActor>0u && value.MaxQueueEntriesPerActor>0u
        && value.MaxFeatureReferences>0u && value.MaxFactoryProductionCount>0u
        && value.MaxAreaRadiusWorldUnits>0u && value.MaxCommandDescriptorsPerActor>0u
    let private validDefinition maxOptions (value: NativeUnitDefinition) =
        value.DefinitionId>0u && not(String.IsNullOrWhiteSpace value.InternalName)
        && not(String.IsNullOrWhiteSpace value.DisplayName)
        && value.FootprintXCells>0u && value.FootprintZCells>0u
        && value.BuildOptionDefinitionIds.Count<=int maxOptions
        && value.BuildOptionDefinitionIds |> Seq.forall ((<>)0u)
        && value.BuildOptionDefinitionIds |> Seq.distinct |> Seq.length = value.BuildOptionDefinitionIds.Count
        && (value.Cost |> ValueOption.forall(fun cost->finiteOptional cost.Metal && finiteOptional cost.Energy && finiteOptional cost.BuildTime))
    let private validCataloguePage (caps: NativeTacticalCapabilities) (page: TacticalCataloguePage) =
        let validContent =
            match page.Content with
            | ValueSome content ->
                not (String.IsNullOrWhiteSpace content.EngineVersion)
                && not (String.IsNullOrWhiteSpace content.GameName)
                && not (String.IsNullOrWhiteSpace content.GameVersion)
                && content.GameContentSha256.Length=32
            | ValueNone -> false
        page.TacticalProfile=caps.Profile && page.TacticalRevision=caps.Revision
        && validContent
        && page.CatalogueId.Length=16 && page.CatalogueRevision>0UL
        && page.PageCount>0u && page.PageIndex<page.PageCount
        && page.Definitions.Count<=int caps.MaxCataloguePageEntries
        && page.Definitions |> Seq.forall (validDefinition caps.MaxBuildOptionsPerActor)
        && (page.Definitions |> Seq.map(fun d->d.DefinitionId) |> Seq.distinct |> Seq.length)=page.Definitions.Count
        && ((page.PageIndex+1u=page.PageCount && page.NextPageToken.IsEmpty) || (page.PageIndex+1u<page.PageCount && not page.NextPageToken.IsEmpty))
    let private validPosition (caps: LiveNativeCapabilities) (value: NativePosition3) =
        Single.IsFinite value.X && Single.IsFinite value.Z
        && finiteOptional value.Elevation
        && value.X>=caps.MinWorldX && value.X<=caps.MaxWorldXInclusive
        && value.Z>=caps.MinWorldZ && value.Z<=caps.MaxWorldZInclusive
    let private validEconomyValue (value: NativeEconomyValue) =
        not(String.IsNullOrWhiteSpace value.ResourceName) && not(String.IsNullOrWhiteSpace value.Unit)
        && finiteOptional value.Current && finiteOptional value.Storage
        && finiteOptional value.IncomePerSecond && finiteOptional value.UsagePerSecond
    let private validTacticalSnapshot (caps: LiveNativeCapabilities) (catalogue: TacticalCataloguePage list) (baseSnapshot: LiveSnapshotMetadata) (value: TacticalSnapshotMetadata) =
        let tactical=caps.Tactical.Value
        let definitions=catalogue |> Seq.collect(fun p->p.Definitions) |> Seq.map(fun d->d.DefinitionId) |> Set.ofSeq
        let ownRefs=baseSnapshot.Units |> Seq.choose(fun u-> if u.Eligibility=NativeLiveUnitEligibility.NativeLiveUnitOwnedActor then u.Reference |> ValueOption.toOption |> Option.map(fun r->struct(r.Id,r.Lifetime)) else None) |> Set.ofSeq
        let validQueue (q:NativeObservedQueue) =
            let uniqueTags=(q.Entries |> Seq.map(fun entry->entry.NativeTag) |> Seq.distinct |> Seq.length)=q.Entries.Count
            let scheme=int q.EvidenceScheme
            let evidenceMatches =
                (tactical.Profile=fullTupleTacticalProfile && tactical.Revision=1u && (scheme=0 || scheme=1))
                || (tactical.Profile=stockTacticalProfile && tactical.Revision=2u && scheme=2)
            let availabilityMatches =
                if tactical.Profile=stockTacticalProfile then
                    (q.Complete && q.Revision>0UL)
                    || (not q.Complete && q.Revision=0UL && q.Entries.Count=0 && q.Repeat.IsNone)
                else q.Revision>0UL
            q.Domain<>NativeQueueDomain.Unspecified && availabilityMatches
            && q.Entries.Count<=int tactical.MaxQueueEntriesPerActor && uniqueTags && evidenceMatches
        value.Basis.IsSome && baseSnapshot.Basis.IsSome && equalBasis value.Basis.Value baseSnapshot.Basis.Value
        && value.CatalogueId.Span.SequenceEqual(catalogue.Head.CatalogueId.Span) && value.CatalogueRevision=catalogue.Head.CatalogueRevision
        && value.Actors.Count<=int caps.MaxActorCount && value.Features.Count<=int tactical.MaxFeatureReferences
        && (value.Actors |> Seq.map(fun a->a.Actor |> ValueOption.map(fun r->r.Id) |> ValueOption.defaultValue UInt32.MaxValue) |> Seq.distinct |> Seq.length)=value.Actors.Count
        && value.Actors |> Seq.forall(fun actor ->
            actor.Actor |> ValueOption.exists(fun reference->reference.Lifetime>0UL && ownRefs.Contains(struct(reference.Id,reference.Lifetime)))
            && actor.DescriptorRevision>0UL && actor.Descriptors.Count<=int tactical.MaxCommandDescriptorsPerActor
            && (actor.Descriptors |> Seq.map(fun d->d.Kind) |> Seq.distinct |> Seq.length)=actor.Descriptors.Count
            && (actor.Descriptors |> Seq.forall(fun d->
                d.Kind<>NativeTacticalDescriptorKind.Unspecified
                && match d.Kind,d.NativeCommandId with
                   | NativeTacticalDescriptorKind.NativeTacticalDescriptorBarConstructionPriority,ValueSome id -> id=34571 && d.AllowedModeValues.Count>0
                   | NativeTacticalDescriptorKind.NativeTacticalDescriptorBarCloakDesire,ValueSome id -> id=37382 && d.AllowedModeValues.Count>0
                   | NativeTacticalDescriptorKind.NativeTacticalDescriptorBarConstructionPriority,_
                   | NativeTacticalDescriptorKind.NativeTacticalDescriptorBarCloakDesire,_ -> false
                   | _,ValueNone -> true
                   | _ -> false))
            && actor.Descriptors |> Seq.forall(fun d-> d.AllowedDefinitionIds |> Seq.forall definitions.Contains)
            && (actor.Queue |> Seq.map(fun q->q.Domain) |> Seq.distinct |> Seq.length)=actor.Queue.Count
            && (actor.Queue |> Seq.forall validQueue))
        && (value.Features |> Seq.map(fun f->f.Reference |> ValueOption.map(fun r->r.Id) |> ValueOption.defaultValue UInt32.MaxValue) |> Seq.distinct |> Seq.length)=value.Features.Count
        && value.Features |> Seq.forall(fun f->f.Reference |> ValueOption.exists(fun reference->reference.Lifetime>0UL) && f.DefinitionId>0u && Single.IsFinite f.WorldX && Single.IsFinite f.WorldZ && finiteOptional f.Elevation && finiteOptional f.ReclaimLeft)
        && (value.Economy |> ValueOption.forall(fun economy->economy.Metal |> ValueOption.exists validEconomyValue && economy.Energy |> ValueOption.exists validEconomyValue))

    let reportState (report: LiveStateReport) receivedAt state = lock state.gate (fun () ->
        match report.Reporter with
        | ValueNone -> LiveStateReportDisposition.LiveStateReportRefused
        | ValueSome reporter when not (validReporter reporter) || report.ReportSequence = 0UL ->
            LiveStateReportDisposition.LiveStateReportRefused
        | ValueSome reporter when state.reporter |> Option.exists (fun prior -> not (sameReporter prior reporter)) ->
            LiveStateReportDisposition.LiveStateReportRefused
        | ValueSome _ when report.ReportSequence < state.lastReportSequence ->
            LiveStateReportDisposition.LiveStateReportStale
        | ValueSome _ when report.ReportSequence = state.lastReportSequence ->
            LiveStateReportDisposition.LiveStateReportDuplicate
        | ValueSome reporter ->
            state.reporter <- Some reporter
            match report.Body with
            | ValueSome (LiveStateReport.Types.Body.Capabilities capabilities)
                when capabilities.MaxActorCount = 64u && capabilities.MaxBatchCommands = 1u
                     && capabilities.MaxNativeUnitId = 31999u && capabilities.MaxObservationAgeMs > 0u
                     && capabilities.SnapshotCadenceCeilingFrames > 0u
                     && capabilities.MaxReportedUnits > 0u && capabilities.MaxReportedUnits <= 64u
                     && capabilities.MapWidthCells > 0u && capabilities.MapHeightCells > 0u
                     && Single.IsFinite capabilities.MinWorldX && Single.IsFinite capabilities.MaxWorldXInclusive
                     && Single.IsFinite capabilities.MinWorldZ && Single.IsFinite capabilities.MaxWorldZInclusive
                     && capabilities.MinWorldX <= capabilities.MaxWorldXInclusive
                     && capabilities.MinWorldZ <= capabilities.MaxWorldZInclusive
                     && capabilities.SupportsStop && capabilities.SupportsMove && capabilities.SupportsAttackVisibleUnit
                     && ((reporter.Protocol=LiveControlProtocol.V1 && capabilities.Tactical.IsNone)
                         || (reporter.Protocol=LiveControlProtocol.TacticalV1 && capabilities.Tactical |> ValueOption.exists validTacticalCapabilities)) ->
                state.capabilities <- Some capabilities
                state.tacticalPages.Clear()
                state.tacticalCatalogueIdentity <- None
                state.tacticalCatalogue <- None
                state.tacticalSnapshot <- None
                state.lastReportSequence <- report.ReportSequence
                LiveStateReportDisposition.LiveStateReportRecorded
            | ValueSome (LiveStateReport.Types.Body.Snapshot snapshot) ->
                match snapshot.Basis with
                | ValueSome basis
                    when basis.StateSequence > 0UL && basis.Token.Length = 16 && basis.MatchIncarnation.Length = 16
                         && basis.SnapshotSendMonotonicNs > 0UL
                         && basis.ProcessIncarnation = reporter.ProcessIncarnation
                         && basis.StateChannelIncarnation = reporter.StateChannelIncarnation
                         && bytesEqual basis.MatchIncarnation reporter.MatchIncarnation
                         && basis.EffectiveCadenceFrames > 0u
                         && basis.EffectiveCadenceFrames <= (state.capabilities |> Option.map (fun c -> c.SnapshotCadenceCeilingFrames) |> Option.defaultValue 0u)
                         && snapshot.Units.Count <= (state.capabilities |> Option.map (fun c -> int c.MaxReportedUnits) |> Option.defaultValue 0)
                         && snapshot.Units |> Seq.forall (fun unit ->
                                match unit.Reference with
                                | ValueSome reference -> reference.Lifetime > 0UL && reference.Id <= 31999u && unit.Eligibility <> NativeLiveUnitEligibility.Unspecified
                                | ValueNone -> false)
                         && (snapshot.Units |> Seq.choose (fun unit -> unit.Reference |> ValueOption.toOption |> Option.map (fun reference -> reference.Id)) |> Seq.distinct |> Seq.length) = snapshot.Units.Count ->
                    state.snapshot <- Some snapshot
                    if state.tacticalSnapshot |> Option.exists(fun tactical->not(tactical.Basis |> ValueOption.exists(equalBasis basis))) then
                        state.tacticalSnapshot <- None
                    state.snapshotReceivedAt <- receivedAt
                    state.lastReportSequence <- report.ReportSequence
                    LiveStateReportDisposition.LiveStateReportRecorded
                | _ -> LiveStateReportDisposition.LiveStateReportRefused
            | ValueSome (LiveStateReport.Types.Body.TacticalCatalogue page) ->
                match state.capabilities with
                | Some caps when reporter.Protocol=LiveControlProtocol.TacticalV1 && caps.Tactical.IsSome && validCataloguePage caps.Tactical.Value page ->
                    let identity=struct(page.CatalogueId,page.CatalogueRevision,page.PageCount)
                    let identityChanged =
                        state.tacticalCatalogueIdentity
                        |> Option.exists(fun prior->let struct(id,revision,count)=prior in not(bytesEqual id page.CatalogueId && revision=page.CatalogueRevision && count=page.PageCount))
                    let consistentContent =
                        identityChanged || (state.tacticalPages.Values
                        |> Seq.tryHead
                        |> Option.forall(fun prior->prior.Content.Value.ToByteArray().AsSpan().SequenceEqual(page.Content.Value.ToByteArray().AsSpan())))
                    if not consistentContent then LiveStateReportDisposition.LiveStateReportRefused else
                        match state.tacticalCatalogueIdentity with
                        | Some prior when let struct(id,revision,count)=prior in not(bytesEqual id page.CatalogueId && revision=page.CatalogueRevision && count=page.PageCount) ->
                            state.tacticalPages.Clear()
                            state.tacticalCatalogue <- None
                        | _ -> ()
                        state.tacticalCatalogueIdentity <- Some identity
                        state.tacticalPages[page.PageIndex] <- page.Clone()
                        state.tacticalSnapshot <- None
                        if state.tacticalPages.Count=int page.PageCount then
                            let pages=state.tacticalPages.Values |> Seq.toList
                            let definitions=pages |> Seq.collect(fun p->p.Definitions) |> Seq.toList
                            if pages |> List.forall(fun p->p.Complete)
                               && definitions.Length<=int caps.Tactical.Value.MaxCatalogueEntries
                               && (definitions |> Seq.map(fun d->d.DefinitionId) |> Seq.distinct |> Seq.length)=definitions.Length then
                                state.tacticalCatalogue <- Some pages
                        state.lastReportSequence <- report.ReportSequence
                        LiveStateReportDisposition.LiveStateReportRecorded
                | _ -> LiveStateReportDisposition.LiveStateReportRefused
            | ValueSome (LiveStateReport.Types.Body.TacticalSnapshot snapshot) ->
                match state.capabilities,state.snapshot,state.tacticalCatalogue with
                | Some caps,Some baseSnapshot,Some catalogue when reporter.Protocol=LiveControlProtocol.TacticalV1 && validTacticalSnapshot caps catalogue baseSnapshot snapshot ->
                    state.tacticalSnapshot <- Some(snapshot.Clone())
                    state.lastReportSequence <- report.ReportSequence
                    LiveStateReportDisposition.LiveStateReportRecorded
                | _ -> LiveStateReportDisposition.LiveStateReportRefused
            | _ -> LiveStateReportDisposition.LiveStateReportRefused)

    let private controllerUpdate stage reason (controller: Controller) state =
        let sequence = state.nextControllerStateSequence
        state.nextControllerStateSequence <- sequence + 1UL
        { stateSequence=sequence; binding=controller.binding; stage=stage; reason=reason }
    let claimControl (subscribe: LiveControlSubscribe) state = lock state.gate (fun () ->
        if (subscribe.Protocol<>LiveControlProtocol.V1 && subscribe.Protocol<>LiveControlProtocol.TacticalV1)
           || String.IsNullOrWhiteSpace subscribe.ControlChannelIncarnation
           || state.reporter |> Option.exists(fun reporter->reporter.Protocol<>subscribe.Protocol) then Unavailable "invalid live control subscription"
        else match state.controlClaim with
             | Some _ -> AlreadyClaimed
             | None ->
                 state.controlClaim <- Some subscribe.ControlChannelIncarnation
                 Claimed ({ incarnation = subscribe.ControlChannelIncarnation; reader = state.controlChannel.Reader } : ControlLease))
    let releaseControl incarnation state =
        let mutable update=None
        lock state.gate (fun () ->
            if state.controlClaim=Some incarnation then
                state.controlClaim<-None
                match state.controller with
                | Some controller when controller.binding.ControlChannelIncarnation=incarnation && controller.stage<>Revoked && controller.stage<>ControllerExpired && controller.stage<>ControllerRefused ->
                    controller.stage<-ControllerExpired
                    update<-Some(controllerUpdate ControllerExpired "native control channel ended" controller state)
                | _ -> ())
        update |> Option.iter state.controllerBroadcaster.Push
    let claimCommands (subscribe: LiveCommandSubscribe) state = lock state.gate (fun () ->
        match subscribe.Binding with
        | ValueNone -> Unavailable "invalid live command subscription"
        | ValueSome binding when (subscribe.Protocol<>LiveControlProtocol.V1 && subscribe.Protocol<>LiveControlProtocol.TacticalV1)
                                 || String.IsNullOrWhiteSpace binding.CommandChannelIncarnation
                                 || state.reporter |> Option.exists(fun reporter->reporter.Protocol<>subscribe.Protocol) -> Unavailable "invalid live command subscription"
        | ValueSome binding ->
            match state.commandClaim with
            | Some _ -> AlreadyClaimed
            | None ->
                state.commandClaim <- Some binding.CommandChannelIncarnation
                Claimed ({ incarnation = binding.CommandChannelIncarnation; reader = state.commandChannel.Reader } : CommandLease))
    let releaseCommands incarnation state =
        let mutable update=None
        lock state.gate (fun () ->
            if state.commandClaim=Some incarnation then
                state.commandClaim<-None
                match state.controller with
                | Some controller when controller.binding.CommandChannelIncarnation=incarnation && controller.stage<>Revoked && controller.stage<>ControllerExpired && controller.stage<>ControllerRefused ->
                    controller.stage<-ControllerExpired
                    update<-Some(controllerUpdate ControllerExpired "native command channel ended" controller state)
                | _ -> ())
        update |> Option.iter state.controllerBroadcaster.Push

    let private bindingValid (binding: LiveBinding) =
        binding.BrokerSessionId.Length=16 && binding.ControllerId.Length=16
        && binding.ModuleSha256.Length=32 && binding.AuthorityEpoch>0UL && binding.ModuleGeneration>0UL
        && not (String.IsNullOrWhiteSpace binding.ControllerIncarnation)
        && not (String.IsNullOrWhiteSpace binding.CommandChannelIncarnation)
        && not (String.IsNullOrWhiteSpace binding.ControlChannelIncarnation)
    let private sameBinding (a: LiveBinding) (b: LiveBinding) =
        a.PluginId = b.PluginId
        && a.ProcessIncarnation = b.ProcessIncarnation
        && bytesEqual a.MatchIncarnation b.MatchIncarnation
        && a.CommandChannelIncarnation = b.CommandChannelIncarnation
        && a.ControlChannelIncarnation = b.ControlChannelIncarnation
        && bytesEqual a.BrokerSessionId b.BrokerSessionId
        && bytesEqual a.ControllerId b.ControllerId
        && a.ControllerIncarnation = b.ControllerIncarnation
        && a.AuthorityEpoch = b.AuthorityEpoch
        && bytesEqual a.ModuleSha256 b.ModuleSha256
        && a.ModuleGeneration = b.ModuleGeneration
    let private directive kind binding seq lease reason =
        let value = LiveControlDirective.empty()
        value.Kind <- kind
        value.Binding <- ValueSome binding
        value.ControlSequence <- seq
        value.LeaseDurationMs <- lease
        value.Reason <- reason
        value
    let provisionController sessionId state = lock state.gate (fun () ->
        while state.provisionalOrder.Count > 0 && not (state.provisionalControllers.ContainsKey(state.provisionalOrder.Peek())) do
            state.provisionalOrder.Dequeue() |> ignore
        while state.provisionalControllers.Count >= state.parentCapacity && state.provisionalOrder.Count > 0 do
            state.provisionalControllers.Remove(state.provisionalOrder.Dequeue()) |> ignore
        let epoch = state.nextAuthorityEpoch
        state.nextAuthorityEpoch <- epoch + 1UL
        let provisional =
            { sessionId=sessionId; controllerId=Guid.NewGuid()
              controllerIncarnation=Guid.NewGuid().ToString("N"); authorityEpoch=epoch }
        state.provisionalControllers[provisional.controllerId] <- provisional
        state.provisionalOrder.Enqueue provisional.controllerId
        provisional)
    let releaseProvisionalController controllerId state =
        lock state.gate (fun () -> state.provisionalControllers.Remove controllerId |> ignore)
    let requestArm (binding: LiveBinding) leaseDurationMs (now: DateTimeOffset) state =
        let mutable update = None
        let result = lock state.gate (fun () ->
            if not (bindingValid binding) || leaseDurationMs=0u || state.capabilities.IsNone || state.snapshot.IsNone then Error "live capability, snapshot, or binding unavailable"
            elif state.controlClaim<>Some binding.ControlChannelIncarnation || state.commandClaim<>Some binding.CommandChannelIncarnation then Error "native live channels do not match binding"
            elif state.controller |> Option.exists (fun c -> c.stage<>Revoked && c.stage<>ControllerExpired && c.stage<>ControllerRefused) then Error "a live controller is already active"
            else
                let seq=state.nextControlSequence
                state.nextControlSequence<-seq+1UL
                let deadline=now.AddMilliseconds(float leaseDurationMs)
                let c={binding=binding;stage=ArmRequested;controlSequence=seq;leaseExpiresAt=deadline;moduleGeneration=binding.ModuleGeneration;renewPending=false;pendingLeaseMs=leaseDurationMs;pendingDeadline=deadline}
                if state.controlChannel.Writer.TryWrite(directive LiveControlDirectiveKind.Arm binding seq leaseDurationMs "") then
                    state.controller<-Some c
                    update <- Some(controllerUpdate ArmRequested "native arm requested" c state)
                    Ok ()
                else Error "live control channel is full")
        update |> Option.iter state.controllerBroadcaster.Push
        result
    let requestBrowserArm (sessionId: Guid) (controllerId: Guid) (controllerIncarnation: string)
                          (authorityEpoch: uint64) (moduleSha256: byte[]) (moduleGeneration: uint64)
                          (leaseDurationMs: uint32) (now: DateTimeOffset) state =
        let binding = lock state.gate (fun () ->
            match state.reporter, state.controlClaim, state.commandClaim, state.provisionalControllers.TryGetValue controllerId with
            | Some reporter, Some controlChannel, Some commandChannel, (true, provisional)
                when provisional.sessionId=sessionId
                     && provisional.controllerIncarnation=controllerIncarnation
                     && provisional.authorityEpoch=authorityEpoch ->
                let value = LiveBinding.empty()
                value.PluginId <- reporter.PluginId
                value.ProcessIncarnation <- reporter.ProcessIncarnation
                value.MatchIncarnation <- reporter.MatchIncarnation
                value.CommandChannelIncarnation <- commandChannel
                value.ControlChannelIncarnation <- controlChannel
                value.BrokerSessionId <- ByteString.CopyFrom(sessionId.ToByteArray())
                value.ControllerId <- ByteString.CopyFrom(controllerId.ToByteArray())
                value.ControllerIncarnation <- controllerIncarnation
                value.AuthorityEpoch <- authorityEpoch
                value.ModuleSha256 <- ByteString.CopyFrom moduleSha256
                value.ModuleGeneration <- moduleGeneration
                Some value
            | _ -> None)
        match binding with
        | Some value ->
            match requestArm value leaseDurationMs now state with
            | Ok () as accepted ->
                releaseProvisionalController controllerId state
                accepted
            | Error _ as refused -> refused
        | None -> Error "broker-issued live controller reservation is unavailable or mismatched"
    let requestRenew binding leaseDurationMs (now: DateTimeOffset) state =
        let mutable update = None
        let result = lock state.gate (fun () ->
            match state.controller with
            | Some c when sameBinding c.binding binding && c.stage=NativeConfirmed && now >= c.leaseExpiresAt ->
                c.stage <- ControllerExpired
                update <- Some(controllerUpdate ControllerExpired "native authority lease expired" c state)
                Error "live authority lease expired"
            | Some c when sameBinding c.binding binding && c.stage=NativeConfirmed && not c.renewPending && leaseDurationMs>0u ->
                let seq=state.nextControlSequence
                state.nextControlSequence<-seq+1UL
                if state.controlChannel.Writer.TryWrite(directive LiveControlDirectiveKind.Renew c.binding seq leaseDurationMs "") then
                    c.controlSequence<-seq
                    c.renewPending<-true
                    c.pendingLeaseMs<-leaseDurationMs
                    c.pendingDeadline<-now.AddMilliseconds(float leaseDurationMs)
                    Ok ()
                else Error "live control channel is full"
            | Some c when c.renewPending -> Error "live renewal acknowledgment is pending"
            | _ -> Error "live controller is not native-confirmed")
        update |> Option.iter state.controllerBroadcaster.Push
        result
    let requestRevoke (binding: LiveBinding) reason (now: DateTimeOffset) state =
        ignore now
        let mutable update = None
        let result = lock state.gate (fun () ->
            match state.controller with
            | Some c when sameBinding c.binding binding && (c.stage=ArmRequested || c.stage=NativeConfirmed) ->
                let seq=state.nextControlSequence
                state.nextControlSequence<-seq+1UL
                if state.controlChannel.Writer.TryWrite(directive LiveControlDirectiveKind.Revoke binding seq 0u reason) then
                    c.controlSequence<-seq
                    c.stage<-RevokeRequested
                    c.renewPending<-false
                    update <- Some(controllerUpdate RevokeRequested reason c state)
                    Ok ()
                else Error "live control channel is full"
            | _ -> Error "live controller is not native-confirmed")
        update |> Option.iter state.controllerBroadcaster.Push
        result
    let reportControlAck (report: LiveControlAckReport) (now: DateTimeOffset) state =
        let mutable update = None
        let result = lock state.gate (fun () ->
            match state.controller with
            | Some c when report.ControlSequence = c.controlSequence
                           && report.Binding |> ValueOption.exists (sameBinding c.binding) ->
                match report.Disposition, report.Kind, c.stage with
                | LiveControlAckDisposition.LiveControlAckRecorded, LiveControlDirectiveKind.Arm, ArmRequested when now >= c.pendingDeadline ->
                    c.stage<-ControllerExpired
                    update <- Some(controllerUpdate ControllerExpired "native arm acknowledgment missed the lease deadline" c state)
                    LiveControlAckDisposition.LiveControlAckRefused
                | LiveControlAckDisposition.LiveControlAckRecorded, LiveControlDirectiveKind.Arm, ArmRequested ->
                    c.stage<-NativeConfirmed
                    update <- Some(controllerUpdate NativeConfirmed report.Detail c state)
                    LiveControlAckDisposition.LiveControlAckRecorded
                | LiveControlAckDisposition.LiveControlAckRefused, LiveControlDirectiveKind.Arm, ArmRequested ->
                    c.stage<-ControllerRefused
                    update <- Some(controllerUpdate ControllerRefused report.Detail c state)
                    LiveControlAckDisposition.LiveControlAckRefused
                | LiveControlAckDisposition.LiveControlAckRecorded, LiveControlDirectiveKind.Revoke, RevokeRequested ->
                    c.stage<-Revoked
                    update <- Some(controllerUpdate Revoked report.Detail c state)
                    LiveControlAckDisposition.LiveControlAckRecorded
                | LiveControlAckDisposition.LiveControlAckRecorded, LiveControlDirectiveKind.Renew, NativeConfirmed when c.renewPending && now >= c.pendingDeadline ->
                    c.renewPending <- false
                    c.stage <- ControllerExpired
                    update <- Some(controllerUpdate ControllerExpired "native renewal acknowledgment missed the lease deadline" c state)
                    LiveControlAckDisposition.LiveControlAckRefused
                | LiveControlAckDisposition.LiveControlAckRecorded, LiveControlDirectiveKind.Renew, NativeConfirmed when c.renewPending ->
                    c.renewPending <- false
                    c.leaseExpiresAt <- c.pendingDeadline
                    LiveControlAckDisposition.LiveControlAckRecorded
                | LiveControlAckDisposition.LiveControlAckDuplicate, _, _ -> LiveControlAckDisposition.LiveControlAckDuplicate
                | _ -> LiveControlAckDisposition.LiveControlAckStale
            | _ -> LiveControlAckDisposition.LiveControlAckStale)
        update |> Option.iter state.controllerBroadcaster.Push
        result

    let private sameRef (a: NativeUnitReference) (b: NativeUnitReference) = a.Id=b.Id && a.Lifetime=b.Lifetime
    let private sameBasis (a: NativeObservationBasis) (b: NativeObservationBasis) =
        bytesEqual a.Token b.Token && a.StateSequence=b.StateSequence && a.Frame=b.Frame
        && bytesEqual a.MatchIncarnation b.MatchIncarnation
        && a.ProcessIncarnation=b.ProcessIncarnation
        && a.StateChannelIncarnation=b.StateChannelIncarnation
    let private uuidBytes (id:Guid) = ByteString.CopyFrom(id.ToByteArray())
    let private cloneRef (value:NativeUnitReference) =
        let copy = NativeUnitReference.empty()
        copy.Id <- value.Id
        copy.Lifetime <- value.Lifetime
        copy
    let private remainingMs (now: DateTimeOffset) (expiry: DateTimeOffset) = max 1u (uint32 (max 0.0 (expiry-now).TotalMilliseconds))
    // A native command can only dispatch through the earlier observation/lease fence. Keep a
    // small, bounded interval after that fence for its terminal report to cross the transport.
    let private resultFeedbackAllowance = TimeSpan.FromSeconds 2.0
    let private publish state value = state.broadcaster.Push value
    let private rememberCompleted key state =
        if state.completed.Add key then state.completedOrder.Enqueue key
        let limit = state.parentCapacity * 64
        while state.completedOrder.Count > limit do
            state.completed.Remove(state.completedOrder.Dequeue()) |> ignore
    let private rememberCompletedParent parentId state =
        if state.completedParents.Add parentId then state.completedParentOrder.Enqueue parentId
        while state.completedParentOrder.Count > state.parentCapacity do
            state.completedParents.Remove(state.completedParentOrder.Dequeue()) |> ignore
    let private finishIdentity key (identity: Identity) state =
        state.identities.Remove key |> ignore
        rememberCompleted key state
        if state.identities.Values |> Seq.exists (fun item -> item.feedback.parentId = identity.feedback.parentId) |> not then
            state.parents.Remove identity.feedback.parentId |> ignore
            rememberCompletedParent identity.feedback.parentId state
    let admit (submission: Submission) now state =
        let mutable published = []
        let result = lock state.gate (fun () ->
            match state.controller, state.capabilities, state.snapshot with
            | Some controller, Some caps, Some snapshot
                when controller.stage = NativeConfirmed && now < controller.leaseExpiresAt ->
                let basis = snapshot.Basis.Value
                let bindingMismatch =
                    submission.sessionId <> Guid(controller.binding.BrokerSessionId.ToByteArray())
                    || submission.controllerId <> Guid(controller.binding.ControllerId.ToByteArray())
                    || submission.controllerIncarnation <> controller.binding.ControllerIncarnation
                    || submission.authorityEpoch <> controller.binding.AuthorityEpoch
                    || submission.moduleGeneration <> controller.binding.ModuleGeneration
                    || not (submission.moduleSha256.AsSpan().SequenceEqual(controller.binding.ModuleSha256.Span))
                if bindingMismatch then
                    Error "live submission identity mismatch"
                elif submission.actors.Length < 1 || submission.actors.Length > 64
                     || submission.actors |> List.exists (fun a -> a.Lifetime = 0UL || a.Id > caps.MaxNativeUnitId) then
                    Error "live actors are invalid"
                elif submission.actors |> List.map (fun a -> a.Id) |> Set.ofList |> Set.count <> submission.actors.Length then
                    Error "live actors must be distinct"
                elif state.parents.Contains submission.parentId || state.completedParents.Contains submission.parentId then
                    Error "live parent or result capacity exhausted"
                elif not (sameBasis submission.basis basis) then
                    let count=submission.actors.Length
                    published <-
                        submission.actors
                        |> List.mapi (fun index actor ->
                            { resultSequence=state.nextResultSequence+uint64 index
                              parentId=submission.parentId;inputId=submission.inputId
                              sessionId=submission.sessionId;controllerId=submission.controllerId
                              controllerIncarnation=submission.controllerIncarnation
                              moduleGeneration=submission.moduleGeneration;moduleSha256=Array.copy submission.moduleSha256
                              authorityEpoch=submission.authorityEpoch;basis=submission.basis.Clone()
                              batchSequence=0UL;correlationId=0UL;childIndex=index;childCount=count
                              actor=cloneRef actor;stage=BrokerAdmission;status=Rejected
                              detail="broker refused stale observation basis; refresh the current observation"
                              nativeFrame=None;commandChannelIncarnation=controller.binding.CommandChannelIncarnation })
                    state.nextResultSequence<-state.nextResultSequence+uint64 count
                    rememberCompletedParent submission.parentId state
                    // This is a terminal broker refusal, so it reserves no native/result
                    // capacity and emits no command. Publish under the same state gate as
                    // accepted admission to preserve the global result sequence.
                    for value in published do publish state value
                    Ok published
                elif now - state.snapshotReceivedAt > TimeSpan.FromMilliseconds(float caps.MaxObservationAgeMs) then
                    Error "live observation basis expired"
                elif state.parents.Count >= state.parentCapacity
                     || state.identities.Count + submission.actors.Length > state.parentCapacity * 64 then
                    Error "live parent or result capacity exhausted"
                else
                    let eligible kind reference =
                        snapshot.Units |> Seq.exists (fun u ->
                            u.Eligibility = kind && u.Reference |> ValueOption.exists (fun current -> sameRef current reference))
                    if submission.actors |> List.exists (fun actor -> not (eligible NativeLiveUnitEligibility.NativeLiveUnitOwnedActor actor)) then
                        Error "actor is not owned at the acknowledged basis"
                    else
                        match submission.action with
                        | Attack target when submission.actors |> List.exists (fun a -> a.Id = target.Id)
                                             || not (eligible NativeLiveUnitEligibility.NativeLiveUnitVisualTarget target) ->
                            Error "attack target is not a distinct visible lifetime"
                        | Move (x, z, _) when not (Single.IsFinite x && Single.IsFinite z)
                                                || x < caps.MinWorldX || x > caps.MaxWorldXInclusive
                                                || z < caps.MinWorldZ || z > caps.MaxWorldZInclusive ->
                            Error "move target is outside live map bounds"
                        | _ ->
                            let count = submission.actors.Length
                            let deadline = state.snapshotReceivedAt.AddMilliseconds(float caps.MaxObservationAgeMs)
                            let batches =
                                submission.actors
                                |> List.mapi (fun index actor ->
                                    let batchSeq = state.nextBatchSequence + uint64 index
                                    let correlation = state.nextCorrelation + uint64 index
                                    let ai = AICommand.empty()
                                    let batch = CommandBatch.empty()
                                    batch.BatchSeq <- batchSeq
                                    batch.TargetUnitId <- actor.Id
                                    batch.ClientCommandId <- ValueSome correlation
                                    let semantic =
                                        match submission.action with
                                        | Stop ->
                                            let command = StopCommand.empty()
                                            command.UnitId <- int actor.Id
                                            command.Options <- 0u
                                            ai.Stop <- command
                                            batch.ConflictPolicy <- CommandConflictPolicy.CommandConflictReplaceCurrent
                                            LiveSemanticAction.Stop
                                        | Move (x, z, append) ->
                                            let command = MoveUnitCommand.empty()
                                            command.UnitId <- int actor.Id
                                            command.Options <- if append then 32u else 0u
                                            let position = Vector3.empty()
                                            position.X <- x
                                            position.Z <- z
                                            command.ToPosition <- ValueSome position
                                            ai.MoveUnit <- command
                                            batch.ConflictPolicy <- if append then CommandConflictPolicy.CommandConflictQueueAfterCurrent else CommandConflictPolicy.CommandConflictReplaceCurrent
                                            if append then LiveSemanticAction.MoveAppend else LiveSemanticAction.MoveReplace
                                        | Attack target ->
                                            let command = AttackCommand.empty()
                                            command.UnitId <- int actor.Id
                                            command.Options <- 0u
                                            command.TargetUnitId <- int target.Id
                                            ai.Attack <- command
                                            batch.ConflictPolicy <- CommandConflictPolicy.CommandConflictReplaceCurrent
                                            LiveSemanticAction.AttackVisibleUnit
                                    batch.Commands.Add ai
                                    batch.BasedOnFrame <- ValueSome basis.Frame
                                    batch.BasedOnStateSeq <- ValueSome basis.StateSequence
                                    let generation = UnitGeneration.empty()
                                    generation.UnitId <- actor.Id
                                    generation.Generation <- actor.Lifetime
                                    batch.TargetGeneration <- ValueSome generation
                                    let attribution = LiveCommandAttribution.empty()
                                    attribution.ParentId <- uuidBytes submission.parentId
                                    attribution.InputId <- uuidBytes submission.inputId
                                    attribution.ChildIndex <- uint32 index
                                    attribution.ChildCount <- uint32 count
                                    let live = LiveCommandBatch.empty()
                                    live.Batch <- ValueSome batch
                                    live.Binding <- ValueSome controller.binding
                                    live.Attribution <- ValueSome attribution
                                    live.Basis <- ValueSome basis
                                    live.Actor <- ValueSome (cloneRef actor)
                                    live.SemanticAction <- semantic
                                    live.RemainingBasisValidityMs <- remainingMs now deadline
                                    live.RemainingCommandLifetimeMs <- remainingMs now deadline
                                    live.RemainingLeaseValidityMs <- remainingMs now controller.leaseExpiresAt
                                    match submission.action with
                                    | Attack target -> live.VisibleAttackTarget <- ValueSome (cloneRef target)
                                    | _ -> ()
                                    let feedback =
                                        { resultSequence = state.nextResultSequence + uint64 index
                                          parentId = submission.parentId; inputId = submission.inputId
                                          sessionId = submission.sessionId; controllerId = submission.controllerId
                                          controllerIncarnation = submission.controllerIncarnation
                                          moduleGeneration = submission.moduleGeneration; moduleSha256 = Array.copy submission.moduleSha256
                                          authorityEpoch = submission.authorityEpoch; basis = basis.Clone()
                                          batchSequence = batchSeq; correlationId = correlation; childIndex = index; childCount = count
                                          actor = cloneRef actor; stage = BrokerAdmission; status = Accepted
                                          detail = "broker admitted live child"; nativeFrame = None
                                          commandChannelIncarnation = controller.binding.CommandChannelIncarnation }
                                    live, feedback)
                            if state.commandChannel.Writer.TryWrite { batches = batches |> List.map fst } then
                                state.parents.Add submission.parentId |> ignore
                                state.nextBatchSequence <- state.nextBatchSequence + uint64 count
                                state.nextCorrelation <- state.nextCorrelation + uint64 count
                                state.nextResultSequence <- state.nextResultSequence + uint64 count
                                let dispatchDeadline = min deadline controller.leaseExpiresAt
                                let resultDeadline = dispatchDeadline.Add resultFeedbackAllowance
                                for _, feedback in batches do
                                    let key = struct(feedback.commandChannelIncarnation, feedback.batchSequence, feedback.correlationId)
                                    state.identities[key] <-
                                        { feedback = feedback; deadline = resultDeadline
                                          admissionSeen = false; dispatchSeen = false; pendingDispatch = None }
                                published <- batches |> List.map snd
                                // Publish broker admission before the delivery can acquire the
                                // state lock to report native admission or dispatch feedback.
                                for value in published do publish state value
                                Ok published
                            else
                                Error "live command channel is full"
            | _ -> Error "live controller is not native-confirmed")
        result

    let private tacticalShape action =
        match action with
        | Build _ -> NativeTacticalDescriptorKind.NativeTacticalDescriptorBuild,NativeQueueDomain.ActorOrder
        | Guard _ -> NativeTacticalDescriptorKind.NativeTacticalDescriptorGuard,NativeQueueDomain.ActorOrder
        | Repair _ -> NativeTacticalDescriptorKind.NativeTacticalDescriptorRepair,NativeQueueDomain.ActorOrder
        | ReclaimUnit _ -> NativeTacticalDescriptorKind.NativeTacticalDescriptorReclaimUnit,NativeQueueDomain.ActorOrder
        | ReclaimFeature _ -> NativeTacticalDescriptorKind.NativeTacticalDescriptorReclaimFeature,NativeQueueDomain.ActorOrder
        | ReclaimArea _ -> NativeTacticalDescriptorKind.NativeTacticalDescriptorReclaimArea,NativeQueueDomain.ActorOrder
        | FactoryProduce _ -> NativeTacticalDescriptorKind.NativeTacticalDescriptorFactoryProduce,NativeQueueDomain.FactoryProduction
        | SetRally _ -> NativeTacticalDescriptorKind.NativeTacticalDescriptorSetRally,NativeQueueDomain.FactoryRally
        | QueueEdit value ->
            let kind = match value.Kind with
                       | NativeQueueEditKind.Insert -> NativeTacticalDescriptorKind.NativeTacticalDescriptorQueueInsert
                       | NativeQueueEditKind.RemoveTag -> NativeTacticalDescriptorKind.NativeTacticalDescriptorQueueRemove
                       | NativeQueueEditKind.SetRepeat -> NativeTacticalDescriptorKind.NativeTacticalDescriptorQueueRepeat
                       | _ -> NativeTacticalDescriptorKind.Unspecified
            kind,value.Domain
        | TacticalMode value -> value.Kind,NativeQueueDomain.ActorOrder
    let private queueOptions policy =
        match policy with
        | NativeQueuePolicy.Replace -> Some(0u,CommandConflictPolicy.CommandConflictReplaceCurrent)
        | NativeQueuePolicy.Append -> Some(32u,CommandConflictPolicy.CommandConflictQueueAfterCurrent)
        | NativeQueuePolicy.RejectIfBusy -> Some(0u,CommandConflictPolicy.CommandConflictRejectIfBusy)
        | _ -> None
    let private tacticalCount action = match action with FactoryProduce value -> uint64 value.Count | _ -> 1UL
    let private vector x y z =
        let value=Vector3.empty()
        value.X<-x; value.Y<-y; value.Z<-z
        value
    let private engineBuildFacing facing =
        // BuildUnitCommand carries the engine ABI ordinal, which differs from
        // the stable tactical protocol enum retained in NativeTacticalCommand.
        match facing with
        | NativeBuildFacing.North -> 2
        | NativeBuildFacing.East -> 1
        | NativeBuildFacing.South -> 0
        | NativeBuildFacing.West -> 3
        | _ -> -1
    let private translateTactical (actor:NativeUnitReference) (action:TacticalAction) =
        let ai=AICommand.empty()
        let mutable conflict=CommandConflictPolicy.CommandConflictReplaceCurrent
        let semantic,native =
            match action with
            | Build value ->
                let options,policy=queueOptions value.QueuePolicy |> Option.get
                let command=BuildUnitCommand.empty()
                command.UnitId<-int actor.Id
                command.Options<-options
                command.ToBuildUnitDefId<-int value.DefinitionId
                command.BuildPosition<-ValueSome(vector value.Position.Value.X (value.Position.Value.Elevation |> ValueOption.defaultValue 0.0f) value.Position.Value.Z)
                command.Facing<-engineBuildFacing value.Facing
                ai.BuildUnit<-command
                conflict<-policy
                LiveSemanticAction.Build,NativeTacticalCommand.Types.Action.Build(value.Clone())
            | Guard value | Repair value | ReclaimUnit value ->
                let options,policy=queueOptions value.QueuePolicy |> Option.get
                conflict<-policy
                let target=value.Target.Value
                match action with
                | Guard _ ->
                    let c=GuardCommand.empty()
                    c.UnitId<-int actor.Id; c.Options<-options; c.GuardUnitId<-int target.Id; ai.Guard<-c
                | Repair _ ->
                    let c=RepairCommand.empty()
                    c.UnitId<-int actor.Id; c.Options<-options; c.RepairUnitId<-int target.Id; ai.Repair<-c
                | _ ->
                    let c=ReclaimUnitCommand.empty()
                    c.UnitId<-int actor.Id; c.Options<-options; c.ReclaimUnitId<-int target.Id; ai.ReclaimUnit<-c
                (match action with Guard _->LiveSemanticAction.Guard|Repair _->LiveSemanticAction.Repair|_->LiveSemanticAction.ReclaimUnit),
                (match action with Guard _->NativeTacticalCommand.Types.Action.Guard(value.Clone())|Repair _->NativeTacticalCommand.Types.Action.Repair(value.Clone())|_->NativeTacticalCommand.Types.Action.ReclaimUnit(value.Clone()))
            | ReclaimFeature value ->
                let options,policy=queueOptions value.QueuePolicy |> Option.get
                conflict<-policy
                let c=ReclaimFeatureCommand.empty()
                c.UnitId<-int actor.Id; c.Options<-options; c.FeatureId<-int value.Target.Value.Id; ai.ReclaimFeature<-c
                LiveSemanticAction.ReclaimFeature,NativeTacticalCommand.Types.Action.ReclaimFeature(value.Clone())
            | ReclaimArea value ->
                let options,policy=queueOptions value.QueuePolicy |> Option.get
                conflict<-policy
                let p=value.Center.Value
                let c=ReclaimInAreaCommand.empty()
                c.UnitId<-int actor.Id; c.Options<-options; c.Position<-ValueSome(vector p.X (p.Elevation |> ValueOption.defaultValue 0.0f) p.Z); c.Radius<-value.RadiusWorldUnits; ai.ReclaimInArea<-c
                LiveSemanticAction.ReclaimArea,NativeTacticalCommand.Types.Action.ReclaimArea(value.Clone())
            | FactoryProduce value ->
                let _,policy=queueOptions value.QueuePolicy |> Option.get
                conflict<-policy
                let one=value.Clone()
                one.Count<-1u
                let c=BuildUnitCommand.empty()
                c.UnitId<-int actor.Id; c.Options<-0u; c.ToBuildUnitDefId<-int value.DefinitionId; ai.BuildUnit<-c
                LiveSemanticAction.FactoryProduce,NativeTacticalCommand.Types.Action.FactoryProduce(one)
            | SetRally value ->
                let p=value.Position.Value
                let c=MoveUnitCommand.empty()
                c.UnitId<-int actor.Id; c.Options<-0u; c.ToPosition<-ValueSome(vector p.X (p.Elevation |> ValueOption.defaultValue 0.0f) p.Z); ai.MoveUnit<-c
                LiveSemanticAction.SetRally,NativeTacticalCommand.Types.Action.SetRally(value.Clone())
            | QueueEdit value ->
                match value.Kind with
                | NativeQueueEditKind.SetRepeat ->
                    let c=SetRepeatCommand.empty()
                    c.UnitId<-int actor.Id; c.Options<-(if value.Domain=NativeQueueDomain.FactoryProduction then 64u else 0u); c.Repeat<-value.Repeat; ai.SetRepeat<-c
                | _ ->
                    let c=CustomCommand.empty()
                    c.UnitId<-int actor.Id
                    c.Options<-(if value.Domain=NativeQueueDomain.FactoryProduction then 64u else 0u)
                    if value.Kind=NativeQueueEditKind.RemoveTag then
                        c.CommandId<-2
                        c.Params.Add(float32 value.RemoveNativeTag)
                    else
                        c.CommandId<-1
                        let insert=value.Insert
                        let commandId,parameters =
                            match insert.Action with
                            | LiveSemanticAction.MoveReplace -> 10,[insert.Position.Value.X;insert.Position.Value.Elevation |> ValueOption.defaultValue 0.0f;insert.Position.Value.Z]
                            | LiveSemanticAction.Build -> -(int insert.DefinitionId.Value),[insert.Position.Value.X;insert.Position.Value.Elevation |> ValueOption.defaultValue 0.0f;insert.Position.Value.Z;2.0f]
                            | LiveSemanticAction.FactoryProduce -> -(int insert.DefinitionId.Value),[]
                            | LiveSemanticAction.Guard -> 25,[float32 insert.UnitTarget.Value.Id]
                            | LiveSemanticAction.Repair -> 40,[float32 insert.UnitTarget.Value.Id]
                            | LiveSemanticAction.ReclaimUnit -> 90,[float32 insert.UnitTarget.Value.Id]
                            | _ -> 0,[]
                        c.Params.Add(float32 insert.BeforeNativeTag)
                        c.Params.Add(float32 commandId)
                        c.Params.Add(0.0f)
                        c.Params.Add(parameters)
                    ai.Custom<-c
                LiveSemanticAction.QueueEdit,NativeTacticalCommand.Types.Action.QueueEdit(value.Clone())
            | TacticalMode value ->
                let c=CustomCommand.empty()
                c.UnitId<-int actor.Id; c.Options<-0u; c.CommandId<-(if value.Kind=NativeTacticalDescriptorKind.NativeTacticalDescriptorBarConstructionPriority then 34571 else 37382)
                c.Params.Add(if value.Value=NativeTacticalModeValue.Enabled then 1.0f else 0.0f)
                ai.Custom<-c
                (if value.Kind=NativeTacticalDescriptorKind.NativeTacticalDescriptorBarConstructionPriority then LiveSemanticAction.BarConstructionPriority else LiveSemanticAction.BarCloakDesire),NativeTacticalCommand.Types.Action.TacticalMode(value.Clone())
        ai,conflict,semantic,native
    let admitTactical (submission:TacticalSubmission) now state =
        let mutable published=[]
        lock state.gate (fun () ->
            match state.controller,state.capabilities,state.snapshot,state.tacticalCatalogue,state.tacticalSnapshot,state.reporter with
            | Some controller,Some caps,Some snapshot,Some catalogue,Some tactical,Some reporter when reporter.Protocol=LiveControlProtocol.TacticalV1 && controller.stage=NativeConfirmed && now<controller.leaseExpiresAt ->
                let countPerActorWide=tacticalCount submission.action
                let childCountWide=uint64 submission.actors.Length*countPerActorWide
                let countWithinAdvertisedBound =
                    match submission.action with
                    | FactoryProduce value -> value.Count>0u && value.Count<=caps.Tactical.Value.MaxFactoryProductionCount
                    | _ -> true
                let bindingMismatch=submission.sessionId<>Guid(controller.binding.BrokerSessionId.ToByteArray()) || submission.controllerId<>Guid(controller.binding.ControllerId.ToByteArray()) || submission.controllerIncarnation<>controller.binding.ControllerIncarnation || submission.authorityEpoch<>controller.binding.AuthorityEpoch || submission.moduleGeneration<>controller.binding.ModuleGeneration || not(submission.moduleSha256.AsSpan().SequenceEqual(controller.binding.ModuleSha256.Span))
                if bindingMismatch then
                    Error "live tactical submission identity mismatch"
                elif submission.actors.Length<1 || not countWithinAdvertisedBound || childCountWide>64UL || submission.actors |> List.exists(fun a->a.reference.Lifetime=0UL || a.reference.Id>caps.MaxNativeUnitId) then
                    Error "live tactical actors or expanded child count are invalid"
                else
                  let countPerActor=int countPerActorWide
                  let childCount=int childCountWide
                  let basis=snapshot.Basis.Value
                  let descriptorKind,domain=tacticalShape submission.action
                  let owned= snapshot.Units |> Seq.choose(fun u->if u.Eligibility=NativeLiveUnitEligibility.NativeLiveUnitOwnedActor then u.Reference |> ValueOption.toOption else None) |> Seq.toList
                  let actorMetadata reference=tactical.Actors |> Seq.tryFind(fun a->a.Actor |> ValueOption.exists(sameRef reference))
                  let definitionIds=catalogue |> Seq.collect(fun p->p.Definitions) |> Seq.map(fun d->d.DefinitionId) |> Set.ofSeq
                  let queueFor actor = actor.Queue |> Seq.tryFind(fun q->q.Domain=domain && q.Complete)
                  let validInsert (insert:NativeQueueInsertIntent) =
                    let position = insert.Position |> ValueOption.exists(validPosition caps)
                    let target = insert.UnitTarget |> ValueOption.exists(fun t->owned |> List.exists(sameRef t))
                    match insert.Action with
                    | LiveSemanticAction.MoveReplace -> domain=NativeQueueDomain.ActorOrder && position
                    | LiveSemanticAction.Build -> domain=NativeQueueDomain.ActorOrder && insert.DefinitionId |> ValueOption.exists definitionIds.Contains && position
                    | LiveSemanticAction.FactoryProduce -> domain=NativeQueueDomain.FactoryProduction && insert.DefinitionId |> ValueOption.exists definitionIds.Contains
                    | LiveSemanticAction.Guard | LiveSemanticAction.Repair | LiveSemanticAction.ReclaimUnit -> domain=NativeQueueDomain.ActorOrder && target
                    | _ -> false
                  let reject detail =
                    published <-
                        [0..childCount-1]
                        |> List.map(fun index->
                            let actor=submission.actors[index/countPerActor].reference
                            {resultSequence=state.nextResultSequence+uint64 index;parentId=submission.parentId;inputId=submission.inputId;sessionId=submission.sessionId;controllerId=submission.controllerId;controllerIncarnation=submission.controllerIncarnation;moduleGeneration=submission.moduleGeneration;moduleSha256=Array.copy submission.moduleSha256;authorityEpoch=submission.authorityEpoch;basis=submission.basis.Clone();batchSequence=0UL;correlationId=0UL;childIndex=index;childCount=childCount;actor=cloneRef actor;stage=BrokerAdmission;status=Rejected;detail=detail;nativeFrame=None;commandChannelIncarnation=controller.binding.CommandChannelIncarnation})
                    state.nextResultSequence<-state.nextResultSequence+uint64 childCount
                    rememberCompletedParent submission.parentId state
                    for value in published do publish state value
                    Ok published
                  let actionValid =
                    let currentCatalogue =
                        submission.catalogue
                        |> Option.exists(fun binding ->
                            binding.revision=tactical.CatalogueRevision
                            && binding.id.AsSpan().SequenceEqual(tactical.CatalogueId.Span))
                    match submission.action with
                    | Build v -> currentCatalogue && v.DefinitionId>0u && definitionIds.Contains v.DefinitionId && v.Position |> ValueOption.exists(validPosition caps) && v.Facing<>NativeBuildFacing.Unspecified && queueOptions v.QueuePolicy |> Option.isSome
                    | Guard v | Repair v | ReclaimUnit v -> v.Target |> ValueOption.exists(fun t->owned |> List.exists(sameRef t)) && queueOptions v.QueuePolicy |> Option.isSome
                    | ReclaimFeature v -> v.Target |> ValueOption.exists(fun target->tactical.Features |> Seq.exists(fun f->f.Reference |> ValueOption.exists(fun current->current.Id=target.Id && current.Lifetime=target.Lifetime))) && queueOptions v.QueuePolicy |> Option.isSome
                    | ReclaimArea v -> v.Center |> ValueOption.exists(validPosition caps) && Single.IsFinite v.RadiusWorldUnits && v.RadiusWorldUnits>0f && v.RadiusWorldUnits<=float32 caps.Tactical.Value.MaxAreaRadiusWorldUnits && queueOptions v.QueuePolicy |> Option.isSome
                    | FactoryProduce v -> currentCatalogue && v.DefinitionId>0u && definitionIds.Contains v.DefinitionId && v.Count>0u && v.Count<=caps.Tactical.Value.MaxFactoryProductionCount && queueOptions v.QueuePolicy |> Option.isSome
                    | SetRally v -> v.Position |> ValueOption.exists(validPosition caps)
                    | QueueEdit v ->
                        v.Domain<>NativeQueueDomain.Unspecified && v.ExpectedQueueRevision>0UL && v.Kind<>NativeQueueEditKind.Unspecified
                        && (match v.Kind,v.Edit with
                            | NativeQueueEditKind.Insert,ValueSome(NativeQueueEditIntent.Types.Edit.Insert insert) -> validInsert insert
                            | NativeQueueEditKind.RemoveTag,ValueSome(NativeQueueEditIntent.Types.Edit.RemoveNativeTag _) -> true
                            | NativeQueueEditKind.SetRepeat,ValueSome(NativeQueueEditIntent.Types.Edit.Repeat _) -> v.Domain<>NativeQueueDomain.FactoryRally
                            | _ -> false)
                    | TacticalMode v -> (v.Kind=NativeTacticalDescriptorKind.NativeTacticalDescriptorBarConstructionPriority || v.Kind=NativeTacticalDescriptorKind.NativeTacticalDescriptorBarCloakDesire) && v.Value<>NativeTacticalModeValue.Unspecified
                  if submission.actors |> List.map(fun a->a.reference.Id) |> Set.ofList |> Set.count<>submission.actors.Length then Error "live tactical actors must be distinct"
                  elif state.parents.Contains submission.parentId || state.completedParents.Contains submission.parentId then Error "live parent or result capacity exhausted"
                  elif not(sameBasis submission.basis basis) then reject "broker refused stale tactical observation basis; refresh the current observation"
                  elif not(tactical.Basis |> ValueOption.exists(sameBasis basis)) then reject "broker refused incomplete tactical metadata for the current observation basis"
                  elif now-state.snapshotReceivedAt>TimeSpan.FromMilliseconds(float caps.MaxObservationAgeMs) then reject "broker refused expired tactical observation basis"
                  elif not actionValid || descriptorKind=NativeTacticalDescriptorKind.Unspecified then reject "broker refused invalid or unavailable tactical action"
                  elif state.parents.Count>=state.parentCapacity || state.identities.Count+childCount>state.parentCapacity*64 then Error "live parent or result capacity exhausted"
                  else
                    let descriptorAllows (descriptor:NativeTacticalCommandDescriptor) =
                        if descriptor.Kind<>descriptorKind || descriptor.Disabled then false else
                        match submission.action with
                        | Build value -> descriptor.AllowedDefinitionIds.Contains value.DefinitionId
                        | FactoryProduce value -> descriptor.AllowedDefinitionIds.Contains value.DefinitionId
                        | TacticalMode value -> descriptor.AllowedModeValues.Contains value.Value
                        | _ -> true
                    let queueEditAllows (queue:NativeObservedQueue) =
                        match submission.action with
                        | QueueEdit value when value.Kind=NativeQueueEditKind.RemoveTag -> queue.Entries |> Seq.exists(fun entry->entry.NativeTag=value.RemoveNativeTag)
                        | QueueEdit value when value.Kind=NativeQueueEditKind.Insert ->
                            match value.Edit with
                            | ValueSome(NativeQueueEditIntent.Types.Edit.Insert insert) -> queue.Entries |> Seq.exists(fun entry->entry.NativeTag=insert.BeforeNativeTag)
                            | _ -> false
                        | _ -> true
                    let factoryPolicyAllows (queue:NativeObservedQueue) =
                        match submission.action with
                        | FactoryProduce value ->
                            match value.QueuePolicy with
                            | NativeQueuePolicy.Append -> true
                            | NativeQueuePolicy.Replace -> caps.Tactical.Value.Profile<>stockTacticalProfile && queue.Entries.Count=0
                            | NativeQueuePolicy.RejectIfBusy -> queue.Entries.Count=0
                            | _ -> false
                        | _ -> true
                    let checkedActors=submission.actors |> List.map(fun requested->
                        match actorMetadata requested.reference with
                        | Some metadata when requested.descriptorRevision=metadata.DescriptorRevision
                            && metadata.Descriptors |> Seq.exists descriptorAllows
                                && requested.queueRevisions |> List.exists(fun q->q.domain=domain && q.revision>0UL && queueFor metadata |> Option.exists(fun current->current.Complete && current.Revision=q.revision && queueEditAllows current && factoryPolicyAllows current)) -> Some(requested,metadata)
                        | _ -> None)
                    if checkedActors |> List.exists Option.isNone then reject "broker refused stale or unavailable actor capability or queue revision"
                    else
                        let deadline=state.snapshotReceivedAt.AddMilliseconds(float caps.MaxObservationAgeMs)
                        let expanded=checkedActors |> List.choose id |> List.collect(fun pair->List.replicate countPerActor pair)
                        let batches=expanded |> List.mapi(fun index (requested,_) ->
                            let batchSeq=state.nextBatchSequence+uint64 index
                            let correlation=state.nextCorrelation+uint64 index
                            let ai,conflict,semantic,nativeAction=translateTactical requested.reference submission.action
                            let batch=CommandBatch.empty()
                            batch.BatchSeq<-batchSeq; batch.TargetUnitId<-requested.reference.Id; batch.ClientCommandId<-ValueSome correlation; batch.ConflictPolicy<-conflict; batch.Commands.Add ai; batch.BasedOnFrame<-ValueSome basis.Frame; batch.BasedOnStateSeq<-ValueSome basis.StateSequence
                            let gen=UnitGeneration.empty()
                            gen.UnitId<-requested.reference.Id; gen.Generation<-requested.reference.Lifetime; batch.TargetGeneration<-ValueSome gen
                            let attribution=LiveCommandAttribution.empty()
                            attribution.ParentId<-uuidBytes submission.parentId; attribution.InputId<-uuidBytes submission.inputId; attribution.ChildIndex<-uint32 index; attribution.ChildCount<-uint32 childCount
                            let command=NativeTacticalCommand.empty()
                            command.CatalogueId<-tactical.CatalogueId; command.CatalogueRevision<-tactical.CatalogueRevision; command.ActorDescriptorRevision<-requested.descriptorRevision; command.QueueDomain<-domain; command.ExpectedQueueRevision<-(requested.queueRevisions |> List.find(fun q->q.domain=domain)).revision; command.Action<-ValueSome nativeAction
                            let live=LiveCommandBatch.empty()
                            live.Batch<-ValueSome batch; live.Binding<-ValueSome controller.binding; live.Attribution<-ValueSome attribution; live.Basis<-ValueSome basis; live.Actor<-ValueSome(cloneRef requested.reference); live.SemanticAction<-semantic; live.TacticalCommand<-ValueSome command; live.RemainingBasisValidityMs<-remainingMs now deadline; live.RemainingCommandLifetimeMs<-remainingMs now deadline; live.RemainingLeaseValidityMs<-remainingMs now controller.leaseExpiresAt
                            let feedback={resultSequence=state.nextResultSequence+uint64 index;parentId=submission.parentId;inputId=submission.inputId;sessionId=submission.sessionId;controllerId=submission.controllerId;controllerIncarnation=submission.controllerIncarnation;moduleGeneration=submission.moduleGeneration;moduleSha256=Array.copy submission.moduleSha256;authorityEpoch=submission.authorityEpoch;basis=basis.Clone();batchSequence=batchSeq;correlationId=correlation;childIndex=index;childCount=childCount;actor=cloneRef requested.reference;stage=BrokerAdmission;status=Accepted;detail="broker admitted tactical child";nativeFrame=None;commandChannelIncarnation=controller.binding.CommandChannelIncarnation}
                            live,feedback)
                        if state.commandChannel.Writer.TryWrite {batches=batches|>List.map fst} then
                            state.parents.Add submission.parentId|>ignore
                            state.nextBatchSequence<-state.nextBatchSequence+uint64 childCount
                            state.nextCorrelation<-state.nextCorrelation+uint64 childCount
                            state.nextResultSequence<-state.nextResultSequence+uint64 childCount
                            let resultDeadline=(min deadline controller.leaseExpiresAt).Add resultFeedbackAllowance
                            for _,feedback in batches do
                                let key=struct(feedback.commandChannelIncarnation,feedback.batchSequence,feedback.correlationId)
                                state.identities[key]<-{feedback=feedback;deadline=resultDeadline;admissionSeen=false;dispatchSeen=false;pendingDispatch=None}
                            published<-batches|>List.map snd
                            for value in published do publish state value
                            Ok published
                        else Error "live command channel is full"
            | _ -> Error "tactical live state is incomplete or controller is not native-confirmed")

    let private dispatchFeedback (identity: Identity) (dispatch: CommandDispatchEvent) state =
        let applied = dispatch.Status = CommandDispatchStatus.CommandDispatchApplied
        let item =
            { identity.feedback with resultSequence = state.nextResultSequence; stage = NativeDispatch
                                     status = if applied then Applied else Skipped
                                     detail = string dispatch.Status; nativeFrame = Some dispatch.Frame }
        state.nextResultSequence <- state.nextResultSequence + 1UL
        item

    let reportNativeAdmission (pluginId: string) channelIncarnation result state =
        ignore pluginId
        lock state.gate (fun () ->
            let key = struct(channelIncarnation, result.BatchSeq, result.ClientCommandId)
            match state.identities.TryGetValue key with
            | true, identity when not identity.admissionSeen ->
                identity.admissionSeen <- true
                let accepted = result.Status = CommandBatchStatus.CommandBatchAccepted || result.Status = CommandBatchStatus.CommandBatchAcceptedWithWarnings
                let item =
                    { identity.feedback with resultSequence = state.nextResultSequence; stage = NativeAdmission
                                             status = if accepted then Accepted else Rejected
                                             detail = if result.Issues.Count = 0 then string result.Status else result.Issues[0].Detail }
                state.nextResultSequence <- state.nextResultSequence + 1UL
                publish state item
                match identity.pendingDispatch with
                | Some dispatch ->
                    publish state (dispatchFeedback identity dispatch state)
                    finishIdentity key identity state
                | None when not accepted -> finishIdentity key identity state
                | None -> ()
                NativeRecorded
            | true, _ -> NativeDuplicate
            | false, _ when state.completed.Contains key -> NativeDuplicate
            | _ -> NativeNotOwned)
    let noteDispatch dispatch state =
        lock state.gate (fun () ->
            let key = struct(dispatch.ChannelIncarnation, dispatch.BatchSeq, dispatch.ClientCommandId)
            match state.identities.TryGetValue key with
            | true, identity when not identity.dispatchSeen ->
                identity.dispatchSeen <- true
                if identity.admissionSeen then
                    publish state (dispatchFeedback identity dispatch state)
                    finishIdentity key identity state
                else
                    identity.pendingDispatch <- Some(dispatch.Clone())
                true
            | true, _ -> true
            | false, _ when state.completed.Contains key -> true
            | _ -> false)
    let expirePendingResults (now: DateTimeOffset) state =
        let expired = lock state.gate (fun () ->
            let due =
                state.identities
                |> Seq.choose (fun pair -> if now >= pair.Value.deadline then Some(pair.Key, pair.Value) else None)
                |> Seq.toList
            due
            |> List.map (fun (key, identity) ->
                let item =
                    { identity.feedback with
                        resultSequence = state.nextResultSequence
                        stage = Unknown
                        status = UnknownStatus
                        detail = "native live result deadline elapsed" }
                state.nextResultSequence <- state.nextResultSequence + 1UL
                finishIdentity key identity state
                item))
        for item in expired do publish state item
        expired.Length
    let feedback state = state.broadcaster :> IObservable<Feedback>
    let controllerUpdates state = state.controllerBroadcaster :> IObservable<ControllerUpdate>
    let noteMetadataReported sequence state = state.metadataBroadcaster.Push sequence
    let metadataReports state = state.metadataBroadcaster :> IObservable<uint64>
    let blocksLegacyGameplay state =
        lock state.gate (fun () ->
            state.controller
            |> Option.exists (fun controller ->
                controller.stage = ArmRequested
                || (controller.stage = NativeConfirmed && DateTimeOffset.UtcNow < controller.leaseExpiresAt)
                || controller.stage = RevokeRequested))
    let maxPendingParents state = uint32 state.parentCapacity
    let maxRetainedResults state = uint32 (state.parentCapacity * 64 * 3)
    let latestCapabilities state = lock state.gate (fun () -> state.capabilities)
    let latestSnapshotMetadata state = lock state.gate (fun () -> state.snapshot)
    let latestTacticalCatalogue state = lock state.gate (fun () -> state.tacticalCatalogue |> Option.map(List.map(fun page->page.Clone())))
    let latestTacticalSnapshot state = lock state.gate (fun () -> state.tacticalSnapshot |> Option.map(fun snapshot->snapshot.Clone()))
    let currentBinding state = lock state.gate (fun () -> state.controller |> Option.map (fun controller -> controller.binding))
    let reset (detail: string) state =
        let terminal = lock state.gate (fun () ->
            let pending =
                state.identities.Values
                |> Seq.map (fun identity ->
                    let item =
                        { identity.feedback with
                            resultSequence = state.nextResultSequence
                            stage = Unknown
                            status = UnknownStatus
                            detail = detail }
                    state.nextResultSequence <- state.nextResultSequence + 1UL
                    item)
                |> Seq.toList
            state.reporter <- None
            state.capabilities <- None
            state.snapshot <- None
            state.tacticalPages.Clear()
            state.tacticalCatalogueIdentity <- None
            state.tacticalCatalogue <- None
            state.tacticalSnapshot <- None
            state.lastReportSequence <- 0UL
            state.controller <- None
            state.parents.Clear()
            state.completedParents.Clear()
            state.completedParentOrder.Clear()
            state.identities.Clear()
            state.completed.Clear()
            state.completedOrder.Clear()
            state.provisionalControllers.Clear()
            state.provisionalOrder.Clear()
            state.controlClaim <- None
            state.commandClaim <- None
            pending)
        for item in terminal do publish state item
