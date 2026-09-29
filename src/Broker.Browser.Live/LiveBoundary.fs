namespace Broker.Browser.Live

open System
open Google.Protobuf
open Broker.Browser.Contracts
open Broker.Protocol
open Highbar.V1

module LiveBoundary =
    let private guid (bytes: ByteString) = if bytes.Length=16 then Some(Guid(bytes.ToByteArray())) else None
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
        if value.Id>31999UL || value.Lifetime=0UL then Error "unit reference is invalid"
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
                request.Intent.Actors |> Seq.fold(fun acc actor -> acc |> Result.bind(fun actors -> nativeRef actor |> Result.map(fun value->value::actors))) (Ok [])
                |> Result.map List.rev
                |> Result.bind(fun actors -> action request.Intent |> Result.bind(fun action ->
                    LiveControl.admit
                        { parentId=parentId;inputId=inputId;sessionId=sessionId;controllerId=controllerId
                          controllerIncarnation=request.Controller.ControllerIncarnation;authorityEpoch=request.Controller.AuthorityEpoch
                          moduleSha256=request.Module.Sha256.ToByteArray();moduleGeneration=request.Module.Generation
                          basis=(let value=NativeObservationBasis.empty() in value.Token<-request.Basis.Token;value.StateSequence<-request.Basis.StateSequence;value.Frame<-request.Basis.NativeFrame;value.MatchIncarnation<-request.Basis.MatchId;value.ProcessIncarnation<-request.Basis.ProcessIncarnation;value.StateChannelIncarnation<-request.Basis.StateChannelIncarnation;value.SnapshotSendMonotonicNs<-0UL;value.EffectiveCadenceFrames<-0u;value)
                          actors=actors;action=action } now state))
                |> Result.map(List.map(fun feedback -> (feedbackEnvelope feedback).Result))
            | _ -> Error "live parent, input, or controller identity refused"
    let provisionBootstrap (sessionId: Guid) (perspectiveId: string) state =
        match LiveControl.latestCapabilities state with
        | Some caps ->
            let provisional=LiveControl.provisionController sessionId state
            let limits=LiveLimits(MaxActorCount=caps.MaxActorCount,MaxInputBytes=65536u,MaxOutputBytes=65536u,MaxFrameBytes=65536u,MaxPendingInputs=8u,MaxModuleBytes=8388608u,GuestPhaseTimeoutMs=250u,MaxObservationAgeMs=caps.MaxObservationAgeMs,LiveSnapshotCadenceFrames=caps.SnapshotCadenceCeilingFrames,MaxNativeUnitId=caps.MaxNativeUnitId,MaxPendingParents=LiveControl.maxPendingParents state,MaxRetainedResults=LiveControl.maxRetainedResults state)
            let bounds=MapBounds(MinX=caps.MinWorldX,MaxX=caps.MaxWorldXInclusive,MinZ=caps.MinWorldZ,MaxZ=caps.MaxWorldZInclusive,TerrainElevationAvailable=caps.TerrainElevationAvailable)
            let capability=LiveCapabilities(Stop=caps.SupportsStop,Move=caps.SupportsMove,AttackVisibleUnit=caps.SupportsAttackVisibleUnit,MapBounds=bounds)
            let preview=Bootstrap(Game="bar",ProtocolVersion="1.0.0",Profile="barc-live-v1",SessionId=ByteString.CopyFrom(sessionId.ToByteArray()),PerspectiveId=perspectiveId,Mode=PreviewMode.ReadOnly)
            let value=LiveBootstrap(Preview=preview,LiveProfile="barc-live-v1",Limits=limits,Capabilities=capability)
            value.Controller<-ControllerIdentity(SessionId=ByteString.CopyFrom(sessionId.ToByteArray()),ControllerId=ByteString.CopyFrom(provisional.controllerId.ToByteArray()),ControllerIncarnation=provisional.controllerIncarnation,AuthorityEpoch=provisional.authorityEpoch)
            Ok(LiveServerEnvelope(Bootstrap=value))
        | None -> Error "native live capabilities unavailable"
    let observation (value: Observation) state =
        match LiveControl.latestSnapshotMetadata state with
        | Some metadata when metadata.Basis.IsSome && metadata.Basis.Value.StateSequence=value.Sequence ->
            let basis=metadata.Basis.Value
            let browserBasis=ObservationBasis(Token=basis.Token,StateSequence=basis.StateSequence,NativeFrame=basis.Frame,MatchId=basis.MatchIncarnation,ProcessIncarnation=basis.ProcessIncarnation,StateChannelIncarnation=basis.StateChannelIncarnation)
            let live=LiveObservation(Preview=value,Basis=browserBasis)
            for unit in metadata.Units do
                match unit.Reference with
                | ValueSome reference ->
                    let kind=if unit.Eligibility=NativeLiveUnitEligibility.NativeLiveUnitOwnedActor then ObservationKind.Own else ObservationKind.Visual
                    live.Units.Add(LiveObservedUnit(Reference=UnitReference(Id=uint64 reference.Id,Lifetime=reference.Lifetime),Observation=kind))
                | ValueNone -> ()
            Ok(LiveServerEnvelope(Observation=live))
        | _ -> Error "native live metadata does not match the production observation"
