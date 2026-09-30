namespace Broker.Browser.Live

open System
open Google.Protobuf
open Broker.Browser.Contracts
open Broker.Protocol
open Highbar.V1

module LiveBoundary =
    let private guid (bytes: ByteString) = if bytes.Length=16 then Some(Guid(bytes.ToByteArray())) else None
    let private browserQueueAction = function
        | LiveSemanticAction.Unspecified -> Ok LiveActionKind.Unspecified
        | LiveSemanticAction.Stop -> Ok LiveActionKind.Stop
        | LiveSemanticAction.MoveReplace
        | LiveSemanticAction.MoveAppend -> Ok LiveActionKind.Move
        | LiveSemanticAction.AttackVisibleUnit -> Ok LiveActionKind.Attack
        | LiveSemanticAction.Build -> Ok LiveActionKind.Build
        | LiveSemanticAction.Guard -> Ok LiveActionKind.Guard
        | LiveSemanticAction.Repair -> Ok LiveActionKind.Repair
        | LiveSemanticAction.ReclaimUnit -> Ok LiveActionKind.ReclaimUnit
        | LiveSemanticAction.ReclaimFeature -> Ok LiveActionKind.ReclaimFeature
        | LiveSemanticAction.ReclaimArea -> Ok LiveActionKind.ReclaimArea
        | LiveSemanticAction.FactoryProduce -> Ok LiveActionKind.FactoryProduce
        | LiveSemanticAction.SetRally -> Ok LiveActionKind.SetRally
        | LiveSemanticAction.QueueEdit -> Ok LiveActionKind.QueueEdit
        | LiveSemanticAction.BarConstructionPriority
        | LiveSemanticAction.BarCloakDesire -> Ok LiveActionKind.TacticalMode
        | value -> Error(sprintf "native queue action %d is unsupported" (int value))
    let private requireController sessionId (controller: ControllerIdentity) =
        match guid controller.SessionId, guid controller.ControllerId with
        | Some session, Some id when session=sessionId && id<>Guid.Empty && controller.AuthorityEpoch>0UL && not(String.IsNullOrWhiteSpace controller.ControllerIncarnation) -> Ok id
        | _ -> Error "live controller identity or session refused"
    let arm sessionId (request: ArmController) now state =
        if isNull request.Controller || isNull request.Module || request.Module.Sha256.Length<>32 || request.Module.Generation=0UL then Error "live arm requires controller and module identity"
        else requireController sessionId request.Controller |> Result.bind(fun controllerId ->
            LiveControl.requestBrowserArm sessionId controllerId request.Controller.ControllerIncarnation request.Controller.AuthorityEpoch (request.Module.Sha256.ToByteArray()) request.Module.Generation 2000u now state)
    let revoke sessionId (request: RevokeController) now state =
        if isNull request.Controller then Error "live revoke requires controller identity"
        else requireController sessionId request.Controller |> Result.bind(fun _ ->
            match LiveControl.currentBinding state with
            | Some binding when binding.AuthorityEpoch=request.Controller.AuthorityEpoch -> LiveControl.requestRevoke binding request.Reason now state
            | _ -> Error "live controller is not active")
    let private nativeRef (value: UnitReference) =
        if obj.ReferenceEquals(value,null) || value.Id>31999UL || value.Lifetime=0UL then Error "unit reference is invalid"
        else let result=NativeUnitReference.empty() in result.Id<-uint32 value.Id;result.Lifetime<-value.Lifetime;Ok result
    let private action (intent: LiveIntent) =
        match intent.ActionCase with
        | LiveIntent.ActionOneofCase.Stop -> Ok LiveControl.Stop
        | LiveIntent.ActionOneofCase.Move when not(isNull intent.Move) && not(isNull intent.Move.Position) ->
            match intent.Move.Policy with
            | MovePolicy.Replace -> Ok(LiveControl.Move(intent.Move.Position.X,intent.Move.Position.Z,false))
            | MovePolicy.Append -> Ok(LiveControl.Move(intent.Move.Position.X,intent.Move.Position.Z,true))
            | _ -> Error "move policy is required"
        | LiveIntent.ActionOneofCase.Attack when not(isNull intent.Attack) && not(isNull intent.Attack.Target) -> nativeRef intent.Attack.Target |> Result.map LiveControl.Attack
        | _ -> Error "exactly one live action is required"
    let private nativePosition (value: Position3) =
        if obj.ReferenceEquals(value,null) then ValueNone else
            let result=NativePosition3.empty()
            result.X<-value.X; result.Z<-value.Z
            if value.HasElevation then result.Elevation<-ValueSome value.Elevation
            ValueSome result
    let private nativeFeature (value: FeatureReference) =
        if obj.ReferenceEquals(value,null) || value.Lifetime=0UL || value.Id>uint64 UInt32.MaxValue then ValueNone else
        let result=NativeFeatureReference.empty()
        result.Id<-uint32 value.Id; result.Lifetime<-value.Lifetime
        ValueSome result
    let private tacticalAction (intent: LiveIntent) =
        let policy value = enum<NativeQueuePolicy>(int value)
        match intent.ActionCase with
        | LiveIntent.ActionOneofCase.Build when not(isNull intent.Build) ->
            let value=NativeBuildIntent.empty()
            value.DefinitionId<-intent.Build.DefinitionId; value.Position<-nativePosition intent.Build.Position; value.Facing<-enum<NativeBuildFacing>(int intent.Build.Facing); value.QueuePolicy<-policy intent.Build.QueuePolicy
            Ok(LiveControl.Build value)
        | LiveIntent.ActionOneofCase.Guard | LiveIntent.ActionOneofCase.Repair | LiveIntent.ActionOneofCase.ReclaimUnit ->
            let source=if intent.ActionCase=LiveIntent.ActionOneofCase.Guard then intent.Guard elif intent.ActionCase=LiveIntent.ActionOneofCase.Repair then intent.Repair else intent.ReclaimUnit
            if isNull source then Error "friendly target is required" else
                nativeRef source.Target |> Result.map(fun target->let value=NativeFriendlyTargetIntent.empty() in value.Target<-ValueSome target;value.QueuePolicy<-policy source.QueuePolicy;if intent.ActionCase=LiveIntent.ActionOneofCase.Guard then LiveControl.Guard value elif intent.ActionCase=LiveIntent.ActionOneofCase.Repair then LiveControl.Repair value else LiveControl.ReclaimUnit value)
        | LiveIntent.ActionOneofCase.ReclaimFeature when not(isNull intent.ReclaimFeature) ->
            match nativeFeature intent.ReclaimFeature.Target with
            | ValueSome target -> let value=NativeReclaimFeatureIntent.empty() in value.Target<-ValueSome target;value.QueuePolicy<-policy intent.ReclaimFeature.QueuePolicy;Ok(LiveControl.ReclaimFeature value)
            | ValueNone -> Error "feature reference is invalid"
        | LiveIntent.ActionOneofCase.ReclaimArea when not(isNull intent.ReclaimArea) ->
            let value=NativeReclaimAreaIntent.empty()
            value.Center<-nativePosition intent.ReclaimArea.Center;value.RadiusWorldUnits<-intent.ReclaimArea.RadiusWorldUnits;value.QueuePolicy<-policy intent.ReclaimArea.QueuePolicy
            Ok(LiveControl.ReclaimArea value)
        | LiveIntent.ActionOneofCase.FactoryProduce when not(isNull intent.FactoryProduce) ->
            let value=NativeFactoryProduceIntent.empty()
            value.DefinitionId<-intent.FactoryProduce.DefinitionId;value.Count<-intent.FactoryProduce.Count;value.QueuePolicy<-policy intent.FactoryProduce.QueuePolicy
            Ok(LiveControl.FactoryProduce value)
        | LiveIntent.ActionOneofCase.SetRally when not(isNull intent.SetRally) ->
            let value=NativeSetRallyIntent.empty()
            value.Position<-nativePosition intent.SetRally.Position
            Ok(LiveControl.SetRally value)
        | LiveIntent.ActionOneofCase.QueueEdit when not(isNull intent.QueueEdit) ->
            let source=intent.QueueEdit
            let value=NativeQueueEditIntent.empty()
            value.ExpectedQueueRevision<-source.ExpectedQueueRevision;value.Kind<-enum<NativeQueueEditKind>(int source.Kind);value.Domain<-enum<NativeQueueDomain>(int source.Domain)
            match source.EditCase with
            | QueueEditTarget.EditOneofCase.Insert ->
                let insert=NativeQueueInsertIntent.empty()
                insert.BeforeNativeTag<-source.Insert.BeforeNativeTag;insert.Action<-enum<LiveSemanticAction>(int source.Insert.Action)
                if source.Insert.HasDefinitionId then insert.DefinitionId<-ValueSome source.Insert.DefinitionId
                insert.Position<-nativePosition source.Insert.Position
                match nativeRef source.Insert.UnitTarget with Ok target->insert.UnitTarget<-ValueSome target|_->()
                insert.FeatureTarget<-nativeFeature source.Insert.FeatureTarget;value.Insert<-insert
            | QueueEditTarget.EditOneofCase.RemoveNativeTag -> value.RemoveNativeTag<-source.RemoveNativeTag
            | QueueEditTarget.EditOneofCase.Repeat -> value.Repeat<-source.Repeat
            | _ -> ()
            Ok(LiveControl.QueueEdit value)
        | LiveIntent.ActionOneofCase.TacticalMode when not(isNull intent.TacticalMode) ->
            let value=NativeTacticalModeIntent.empty()
            value.Kind<-enum<NativeTacticalDescriptorKind>(int intent.TacticalMode.Kind);value.Value<-enum<NativeTacticalModeValue>(int intent.TacticalMode.Value)
            Ok(LiveControl.TacticalMode value)
        | _ -> Error "exactly one tactical action is required"
    let private tacticalCatalogueBinding (intent: LiveIntent) =
        match intent.ActionCase with
        | LiveIntent.ActionOneofCase.Build when not(isNull intent.Build) ->
            Some ({ id=intent.Build.CatalogueId.ToByteArray(); revision=intent.Build.CatalogueRevision }: LiveControl.TacticalCatalogueBinding)
        | LiveIntent.ActionOneofCase.FactoryProduce when not(isNull intent.FactoryProduce) ->
            Some ({ id=intent.FactoryProduce.CatalogueId.ToByteArray(); revision=intent.FactoryProduce.CatalogueRevision }: LiveControl.TacticalCatalogueBinding)
        | _ -> None
    let private tacticalActors (intent:LiveIntent) =
        if intent.ActorTacticalBindings.Count<>intent.Actors.Count then Error "every tactical actor requires one binding"
        else
            Seq.zip intent.Actors intent.ActorTacticalBindings
            |> Seq.fold(fun acc (actor,binding)->acc |> Result.bind(fun values->
                if obj.ReferenceEquals(binding,null) || obj.ReferenceEquals(binding.Actor,null) || obj.ReferenceEquals(actor,null)
                   || actor.Id<>binding.Actor.Id || actor.Lifetime<>binding.Actor.Lifetime then
                    Error "tactical actor binding does not match the declared actor order"
                else
                    nativeRef actor |> Result.map(fun reference->
                        let queues = binding.QueueRevisions |> Seq.map(fun q->({domain=enum<NativeQueueDomain>(int q.Domain);revision=q.Revision}:LiveControl.TacticalQueueBinding)) |> Seq.toList
                        ({reference=reference;descriptorRevision=binding.DescriptorRevision;queueRevisions=queues}:LiveControl.TacticalActor)::values))) (Ok []) |> Result.map List.rev
    let feedbackEnvelope (feedback: LiveControl.Feedback) : Broker.Browser.Contracts.LiveServerEnvelope =
        let actor=UnitReference(Id=uint64 feedback.actor.Id,Lifetime=feedback.actor.Lifetime)
        let result=Broker.Browser.Contracts.LiveResult(ResultSequence=feedback.resultSequence,ParentId=ByteString.CopyFrom(feedback.parentId.ToByteArray()),InputId=ByteString.CopyFrom(feedback.inputId.ToByteArray()),BatchSequence=feedback.batchSequence,CorrelationId=feedback.correlationId,ChildIndex=uint32 feedback.childIndex,ChildCount=uint32 feedback.childCount,Actor=actor,Reason=feedback.detail,CommandChannelIncarnation=feedback.commandChannelIncarnation)
        result.Module<-LiveModuleIdentity(Sha256=ByteString.CopyFrom(feedback.moduleSha256),Generation=feedback.moduleGeneration)
        result.Controller<-ControllerIdentity(SessionId=ByteString.CopyFrom(feedback.sessionId.ToByteArray()),ControllerId=ByteString.CopyFrom(feedback.controllerId.ToByteArray()),ControllerIncarnation=feedback.controllerIncarnation,AuthorityEpoch=feedback.authorityEpoch)
        result.Basis<-ObservationBasis(Token=feedback.basis.Token,StateSequence=feedback.basis.StateSequence,NativeFrame=feedback.basis.Frame,MatchId=feedback.basis.MatchIncarnation,ProcessIncarnation=feedback.basis.ProcessIncarnation,StateChannelIncarnation=feedback.basis.StateChannelIncarnation)
        result.Stage <- match feedback.stage with LiveControl.BrokerAdmission->LiveResultStage.BrokerAdmission | LiveControl.NativeAdmission->LiveResultStage.NativeAdmission | LiveControl.NativeDispatch->LiveResultStage.NativeDispatch | LiveControl.Unknown->LiveResultStage.Unknown
        result.Status <- match feedback.status with LiveControl.Accepted->LiveResultStatus.Accepted | LiveControl.Rejected->LiveResultStatus.Rejected | LiveControl.Applied->LiveResultStatus.Applied | LiveControl.Skipped->LiveResultStatus.Skipped | LiveControl.Expired->LiveResultStatus.Expired | LiveControl.UnknownStatus->LiveResultStatus.Unknown
        result.Disposition <- LiveResultDisposition.Recorded
        feedback.nativeFrame |> Option.iter(fun frame->result.NativeFrame<-frame)
        Broker.Browser.Contracts.LiveServerEnvelope(Result=result)
    let controllerEnvelope (update: LiveControl.ControllerUpdate) =
        let binding = update.binding
        let controller =
            ControllerIdentity(
                SessionId=binding.BrokerSessionId,
                ControllerId=binding.ControllerId,
                ControllerIncarnation=binding.ControllerIncarnation,
                AuthorityEpoch=binding.AuthorityEpoch)
        let moduleId = LiveModuleIdentity(Sha256=binding.ModuleSha256,Generation=binding.ModuleGeneration)
        let value = ControllerState(StateSequence=update.stateSequence,Controller=controller,Module=moduleId,Reason=update.reason)
        value.Stage <-
            match update.stage with
            | LiveControl.ArmRequested -> Broker.Browser.Contracts.ControllerStage.ArmRequested
            | LiveControl.NativeConfirmed -> Broker.Browser.Contracts.ControllerStage.ArmNativeConfirmed
            | LiveControl.RevokeRequested -> Broker.Browser.Contracts.ControllerStage.RevokeRequested
            | LiveControl.Revoked -> Broker.Browser.Contracts.ControllerStage.RevokeNativeConfirmed
            | LiveControl.ControllerExpired -> Broker.Browser.Contracts.ControllerStage.Expired
            | LiveControl.ControllerRefused -> Broker.Browser.Contracts.ControllerStage.Refused
        LiveServerEnvelope(ControllerState=value)
    let submit sessionId (request: SubmitLiveIntent) now state =
        if isNull request.Controller || isNull request.Module || isNull request.Basis || isNull request.Intent then Error "live submission is incomplete"
        else
            match guid request.ParentId, guid request.InputId, requireController sessionId request.Controller with
            | Some parentId, Some inputId, Ok controllerId ->
                if request.Intent.ActionCase<=LiveIntent.ActionOneofCase.Attack then
                    request.Intent.Actors |> Seq.fold(fun acc actor -> acc |> Result.bind(fun actors -> nativeRef actor |> Result.map(fun value->value::actors))) (Ok [])
                    |> Result.map List.rev
                    |> Result.bind(fun actors -> action request.Intent |> Result.bind(fun action ->
                        let submission:LiveControl.Submission =
                            { parentId=parentId;inputId=inputId;sessionId=sessionId;controllerId=controllerId
                              controllerIncarnation=request.Controller.ControllerIncarnation;authorityEpoch=request.Controller.AuthorityEpoch
                              moduleSha256=request.Module.Sha256.ToByteArray();moduleGeneration=request.Module.Generation
                              basis=(let value=NativeObservationBasis.empty() in value.Token<-request.Basis.Token;value.StateSequence<-request.Basis.StateSequence;value.Frame<-request.Basis.NativeFrame;value.MatchIncarnation<-request.Basis.MatchId;value.ProcessIncarnation<-request.Basis.ProcessIncarnation;value.StateChannelIncarnation<-request.Basis.StateChannelIncarnation;value.SnapshotSendMonotonicNs<-0UL;value.EffectiveCadenceFrames<-0u;value)
                              actors=actors;action=action }
                        LiveControl.admit submission now state))
                    |> Result.map(List.map(fun feedback -> (feedbackEnvelope feedback).Result))
                else
                    tacticalActors request.Intent |> Result.bind(fun actors->tacticalAction request.Intent |> Result.bind(fun action->
                        LiveControl.admitTactical
                            {parentId=parentId;inputId=inputId;sessionId=sessionId;controllerId=controllerId;controllerIncarnation=request.Controller.ControllerIncarnation;authorityEpoch=request.Controller.AuthorityEpoch;moduleSha256=request.Module.Sha256.ToByteArray();moduleGeneration=request.Module.Generation
                             basis=(let value=NativeObservationBasis.empty() in value.Token<-request.Basis.Token;value.StateSequence<-request.Basis.StateSequence;value.Frame<-request.Basis.NativeFrame;value.MatchIncarnation<-request.Basis.MatchId;value.ProcessIncarnation<-request.Basis.ProcessIncarnation;value.StateChannelIncarnation<-request.Basis.StateChannelIncarnation;value)
                             actors=actors;catalogue=tacticalCatalogueBinding request.Intent;action=action} now state)) |> Result.map(List.map(fun feedback->(feedbackEnvelope feedback).Result))
            | _ -> Error "live parent, input, or controller identity refused"
    let provisionBootstrapForProfile profile (sessionId: Guid) (perspectiveId: string) state =
        match LiveControl.latestCapabilities state with
        | Some caps when profile="barc-live-v1" || (profile="barc-live-tactical-v1" && caps.Tactical.IsSome && LiveControl.latestTacticalCatalogue state |> Option.isSome && LiveControl.latestTacticalSnapshot state |> Option.isSome) ->
            let provisional=LiveControl.provisionController sessionId state
            let limits=LiveLimits(MaxActorCount=caps.MaxActorCount,MaxInputBytes=65536u,MaxOutputBytes=65536u,MaxFrameBytes=65536u,MaxPendingInputs=8u,MaxModuleBytes=8388608u,GuestPhaseTimeoutMs=250u,MaxObservationAgeMs=caps.MaxObservationAgeMs,LiveSnapshotCadenceFrames=caps.SnapshotCadenceCeilingFrames,MaxNativeUnitId=caps.MaxNativeUnitId,MaxPendingParents=LiveControl.maxPendingParents state,MaxRetainedResults=LiveControl.maxRetainedResults state)
            let bounds=MapBounds(MinX=caps.MinWorldX,MaxX=caps.MaxWorldXInclusive,MinZ=caps.MinWorldZ,MaxZ=caps.MaxWorldZInclusive,TerrainElevationAvailable=caps.TerrainElevationAvailable)
            let capability=LiveCapabilities(Stop=caps.SupportsStop,Move=caps.SupportsMove,AttackVisibleUnit=caps.SupportsAttackVisibleUnit,MapBounds=bounds)
            let preview=Bootstrap(Game="bar",ProtocolVersion="1.0.0",Profile=profile,SessionId=ByteString.CopyFrom(sessionId.ToByteArray()),PerspectiveId=perspectiveId,Mode=PreviewMode.ReadOnly)
            let value=LiveBootstrap(Preview=preview,LiveProfile=profile,Limits=limits,Capabilities=capability)
            if profile="barc-live-tactical-v1" then
                let nativeCaps=caps.Tactical.Value
                capability.Tactical<-TacticalCapabilities(Profile=nativeCaps.Profile,Revision=nativeCaps.Revision,MaxCatalogueEntries=nativeCaps.MaxCatalogueEntries,MaxCataloguePageEntries=nativeCaps.MaxCataloguePageEntries,MaxBuildOptionsPerActor=nativeCaps.MaxBuildOptionsPerActor,MaxQueueEntriesPerActor=nativeCaps.MaxQueueEntriesPerActor,MaxFeatureReferences=nativeCaps.MaxFeatureReferences,MaxFactoryProductionCount=nativeCaps.MaxFactoryProductionCount,MaxAreaRadiusWorldUnits=nativeCaps.MaxAreaRadiusWorldUnits,MaxCommandDescriptorsPerActor=nativeCaps.MaxCommandDescriptorsPerActor)
                let pages=LiveControl.latestTacticalCatalogue state |> Option.get
                let first=pages.Head
                let content=first.Content.Value
                let catalogue=TacticalCatalogue(Profile=first.TacticalProfile,Revision=first.TacticalRevision,CatalogueId=first.CatalogueId,CatalogueRevision=first.CatalogueRevision,Complete=true)
                catalogue.Content<-ContentIdentity(EngineVersion=content.EngineVersion,GameName=content.GameName,GameVersion=content.GameVersion,GameContentSha256=content.GameContentSha256)
                for page in pages do
                    for definition in page.Definitions do
                        let projected=TacticalUnitDefinition(DefinitionId=definition.DefinitionId,InternalName=definition.InternalName,DisplayName=definition.DisplayName,FootprintXCells=definition.FootprintXCells,FootprintZCells=definition.FootprintZCells)
                        projected.BuildOptionDefinitionIds.Add definition.BuildOptionDefinitionIds
                        definition.Cost |> ValueOption.iter(fun cost->
                            let value=ResourceCost()
                            cost.Metal |> ValueOption.iter(fun x->value.Metal<-x)
                            cost.Energy |> ValueOption.iter(fun x->value.Energy<-x)
                            cost.BuildTime |> ValueOption.iter(fun x->value.BuildTime<-x)
                            projected.Cost<-value)
                        catalogue.Definitions.Add projected
                value.TacticalCatalogue<-catalogue
            value.Controller<-ControllerIdentity(SessionId=ByteString.CopyFrom(sessionId.ToByteArray()),ControllerId=ByteString.CopyFrom(provisional.controllerId.ToByteArray()),ControllerIncarnation=provisional.controllerIncarnation,AuthorityEpoch=provisional.authorityEpoch)
            Ok(LiveServerEnvelope(Bootstrap=value))
        | None -> Error "native live capabilities unavailable"
        | _ -> Error "requested live profile is unavailable"
    let provisionBootstrap sessionId perspectiveId state = provisionBootstrapForProfile "barc-live-v1" sessionId perspectiveId state
    let observation (value: Observation) state =
        match LiveControl.latestSnapshotMetadata state with
        | Some metadata when metadata.Basis.IsSome && metadata.Basis.Value.StateSequence=value.Sequence ->
            let basis=metadata.Basis.Value
            let browserBasis=ObservationBasis(Token=basis.Token,StateSequence=basis.StateSequence,NativeFrame=basis.Frame,MatchId=basis.MatchIncarnation,ProcessIncarnation=basis.ProcessIncarnation,StateChannelIncarnation=basis.StateChannelIncarnation)
            let live=LiveObservation(Preview=value,Basis=browserBasis)
            let mutable projectionError = ValueNone
            for unit in metadata.Units do
                match unit.Reference with
                | ValueSome reference ->
                    let kind=if unit.Eligibility=NativeLiveUnitEligibility.NativeLiveUnitOwnedActor then ObservationKind.Own else ObservationKind.Visual
                    live.Units.Add(LiveObservedUnit(Reference=UnitReference(Id=uint64 reference.Id,Lifetime=reference.Lifetime),Observation=kind))
                | ValueNone -> ()
            match LiveControl.latestTacticalSnapshot state with
            | Some tactical when tactical.Basis.IsSome && tactical.Basis.Value.StateSequence=value.Sequence ->
                let projected=TacticalObservation(CatalogueId=tactical.CatalogueId,CatalogueRevision=tactical.CatalogueRevision)
                tactical.Economy |> ValueOption.iter(fun economy->
                    let projectEconomyValue (source:NativeEconomyValue) =
                        let result=EconomyValue(ResourceName=source.ResourceName,Unit=source.Unit)
                        source.Current |> ValueOption.iter(fun x->result.Current<-x)
                        source.Storage |> ValueOption.iter(fun x->result.Storage<-x)
                        source.IncomePerSecond |> ValueOption.iter(fun x->result.IncomePerSecond<-x)
                        source.UsagePerSecond |> ValueOption.iter(fun x->result.UsagePerSecond<-x)
                        result
                    let result=TacticalEconomy(PerspectiveId=value.PerspectiveId,SampleFrame=economy.SampleFrame)
                    economy.Metal |> ValueOption.iter(fun x->result.Metal<-projectEconomyValue x)
                    economy.Energy |> ValueOption.iter(fun x->result.Energy<-projectEconomyValue x)
                    projected.Economy<-result)
                for feature in tactical.Features do
                    match feature.Reference with
                    | ValueSome reference ->
                        let result=TacticalFeature(Reference=FeatureReference(Id=uint64 reference.Id,Lifetime=reference.Lifetime),DefinitionId=feature.DefinitionId,Position=Position3(X=feature.WorldX,Z=feature.WorldZ))
                        feature.Elevation |> ValueOption.iter(fun x->result.Position.Elevation<-x)
                        feature.ReclaimLeft |> ValueOption.iter(fun x->result.ReclaimLeft<-x)
                        projected.Features.Add result
                    | ValueNone -> ()
                for actor in tactical.Actors do
                    match actor.Actor with
                    | ValueSome reference ->
                        let result=ActorTacticalState(Actor=UnitReference(Id=uint64 reference.Id,Lifetime=reference.Lifetime),DescriptorRevision=actor.DescriptorRevision)
                        for descriptor in actor.Descriptors do
                            let item=TacticalCommandDescriptor(Kind=enum<TacticalDescriptorKind>(int descriptor.Kind),Disabled=descriptor.Disabled)
                            item.AllowedDefinitionIds.Add descriptor.AllowedDefinitionIds
                            item.AllowedModeValues.Add(descriptor.AllowedModeValues |> Seq.map(fun x->enum<TacticalModeValue>(int x)))
                            descriptor.ObservedModeValue |> ValueOption.iter(fun x->item.ObservedModeValue<-enum<TacticalModeValue>(int x))
                            result.Descriptors.Add item
                        for queue in actor.Queue do
                            let item=TacticalQueue(Domain=enum<QueueDomain>(int queue.Domain),Revision=queue.Revision,Complete=queue.Complete)
                            queue.Repeat |> ValueOption.iter(fun x->item.Repeat<-x)
                            for entry in queue.Entries do
                                match browserQueueAction entry.Action with
                                | Error detail -> projectionError <- ValueSome detail
                                | Ok action ->
                                    let projectedEntry=TacticalQueueEntry(NativeTag=entry.NativeTag,Action=action)
                                    entry.DefinitionId |> ValueOption.iter(fun x->projectedEntry.DefinitionId<-x)
                                    entry.UnitTarget |> ValueOption.iter(fun x->projectedEntry.UnitTarget<-UnitReference(Id=uint64 x.Id,Lifetime=x.Lifetime))
                                    entry.FeatureTarget |> ValueOption.iter(fun x->projectedEntry.FeatureTarget<-FeatureReference(Id=uint64 x.Id,Lifetime=x.Lifetime))
                                    match entry.WorldX,entry.WorldZ with
                                    | ValueSome x,ValueSome z -> projectedEntry.Position<-Position3(X=x,Z=z)
                                    | _ -> ()
                                    item.Entries.Add projectedEntry
                            result.Queue.Add item
                        projected.Actors.Add result
                    | ValueNone -> ()
                live.Tactical<-projected
            | _ -> ()
            match projectionError with
            | ValueSome detail -> Error detail
            | ValueNone -> Ok(LiveServerEnvelope(Observation=live))
        | _ -> Error "native live metadata does not match the production observation"
