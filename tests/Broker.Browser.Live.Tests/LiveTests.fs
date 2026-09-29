module Broker.Browser.Live.Tests.LiveTests

open System
open Expecto
open Google.Protobuf
open Highbar.V1
open Broker.Protocol
open Broker.Core
open Broker.Browser.Contracts
open Broker.Browser.Live

let bytes16 (text: string) =
    ByteString.CopyFrom(Array.append (System.Text.Encoding.ASCII.GetBytes text) (Array.zeroCreate 16) |> Array.take 16)

let nativeRef id lifetime =
    let reference = NativeUnitReference.empty()
    reference.Id <- id
    reference.Lifetime <- lifetime
    reference

let setupState state now =
    let reporter = LiveStateReporter.empty()
    reporter.PluginId <- "highbar"
    reporter.SchemaVersion <- "1.0.0"
    reporter.Protocol <- LiveControlProtocol.V1
    reporter.ProcessIncarnation <- "process-1"
    reporter.MatchIncarnation <- bytes16 "match"
    reporter.StateChannelIncarnation <- "state-1"

    let caps = LiveNativeCapabilities.empty()
    caps.MaxActorCount <- 64u
    caps.MaxBatchCommands <- 1u
    caps.MaxNativeUnitId <- 31999u
    caps.SnapshotCadenceCeilingFrames <- 30u
    caps.MaxObservationAgeMs <- 2000u
    caps.MaxReportedUnits <- 64u
    caps.MapWidthCells <- 1024u
    caps.MapHeightCells <- 1024u
    caps.MaxWorldXInclusive <- 8191f
    caps.MaxWorldZInclusive <- 8191f
    caps.SupportsStop <- true
    caps.SupportsMove <- true
    caps.SupportsAttackVisibleUnit <- true

    let capReport = LiveStateReport.empty()
    capReport.Reporter <- ValueSome reporter
    capReport.ReportSequence <- 9007199254740993UL
    capReport.Capabilities <- caps
    Expect.equal (LiveControl.reportState capReport now state) LiveStateReportDisposition.LiveStateReportRecorded "capabilities recorded"
    let basis = NativeObservationBasis.empty()
    basis.Token <- bytes16 "basis"
    basis.StateSequence <- 9007199254740995UL
    basis.Frame <- 700u
    basis.MatchIncarnation <- reporter.MatchIncarnation
    basis.ProcessIncarnation <- reporter.ProcessIncarnation
    basis.StateChannelIncarnation <- reporter.StateChannelIncarnation
    basis.SnapshotSendMonotonicNs <- 9007199254740997UL
    basis.EffectiveCadenceFrames <- 30u

    let snapshot = LiveSnapshotMetadata.empty()
    snapshot.Basis <- ValueSome basis

    let actor = NativeLiveUnitMetadata.empty()
    actor.Reference <- ValueSome(nativeRef 0u 9007199254740999UL)
    actor.Eligibility <- NativeLiveUnitEligibility.NativeLiveUnitOwnedActor
    snapshot.Units.Add actor

    let actor2 = NativeLiveUnitMetadata.empty()
    actor2.Reference <- ValueSome(nativeRef 78u 9007199254741001UL)
    actor2.Eligibility <- NativeLiveUnitEligibility.NativeLiveUnitOwnedActor
    snapshot.Units.Add actor2

    let target = NativeLiveUnitMetadata.empty()
    target.Reference <- ValueSome(nativeRef 77u 9007199254741003UL)
    target.Eligibility <- NativeLiveUnitEligibility.NativeLiveUnitVisualTarget
    snapshot.Units.Add target

    let snapshotReport = LiveStateReport.empty()
    snapshotReport.Reporter <- ValueSome reporter
    snapshotReport.ReportSequence <- 9007199254741005UL
    snapshotReport.Snapshot <- snapshot
    Expect.equal (LiveControl.reportState snapshotReport now state) LiveStateReportDisposition.LiveStateReportRecorded "snapshot metadata recorded"
    Expect.equal (LiveControl.reportState snapshotReport now state) LiveStateReportDisposition.LiveStateReportDuplicate "exact native state retry is idempotent"
    let staleReport = snapshotReport.Clone()
    staleReport.ReportSequence <- snapshotReport.ReportSequence - 1UL
    Expect.equal (LiveControl.reportState staleReport now state) LiveStateReportDisposition.LiveStateReportStale "out-of-order native state cannot replace the basis"
    let control = LiveControlSubscribe.empty()
    control.PluginId <- "highbar"
    control.SchemaVersion <- "1.0.0"
    control.Protocol <- LiveControlProtocol.V1
    control.ControlChannelIncarnation <- "control-1"

    let controlLease =
        match LiveControl.claimControl control state with
        | LiveControl.Claimed lease -> lease
        | other -> failtestf "control claim %A" other

    let initial = LiveBinding.empty()
    initial.PluginId <- "highbar"
    initial.CommandChannelIncarnation <- "command-1"

    let commands = LiveCommandSubscribe.empty()
    commands.Protocol <- LiveControlProtocol.V1
    commands.SchemaVersion <- "1.0.0"
    commands.Binding <- ValueSome initial

    let commandLease =
        match LiveControl.claimCommands commands state with
        | LiveControl.Claimed lease -> lease
        | other -> failtestf "command claim %A" other
    state,controlLease,commandLease,basis

let setup capacity now = setupState (LiveControl.create capacity) now

[<Tests>]
let tests=testList "live broker boundary" [
    testTask "native metadata arms independently and atomically emits one fenced child per actor" {
        let now=DateTimeOffset(2026,9,29,12,0,0,TimeSpan.Zero)
        let state,controlLease,commandLease,basis=setup 8 now
        let session=Guid.NewGuid()
        let provisional=LiveControl.provisionController session state
        let controller=provisional.controllerId
        let moduleHash=Array.create 32 0x42uy
        Expect.isOk (LiveControl.requestBrowserArm session controller provisional.controllerIncarnation provisional.authorityEpoch moduleHash 9007199254741009UL 2000u now state) "arm requested"
        let mutable directive=Unchecked.defaultof<LiveControlDirective>
        Expect.isTrue (controlLease.reader.TryRead(&directive)) "priority control directive available"
        let ack=LiveControlAckReport.empty()
        ack.Binding<-directive.Binding
        ack.ControlSequence<-directive.ControlSequence
        ack.Kind<-directive.Kind
        ack.Disposition<-LiveControlAckDisposition.LiveControlAckRecorded
        Expect.equal (LiveControl.reportControlAck ack now state) LiveControlAckDisposition.LiveControlAckRecorded "native arm confirmed without gameplay drain"
        let binding=LiveControl.currentBinding state |> Option.get
        Expect.isOk (LiveControl.requestRenew binding 2000u (now.AddMilliseconds 500) state) "confirmed controller renews on the priority path"
        Expect.isTrue (controlLease.reader.TryRead(&directive)) "renew does not share the gameplay stream"
        Expect.equal directive.Kind LiveControlDirectiveKind.Renew "priority directive is an explicit renew"
        ack.Binding <- directive.Binding
        ack.ControlSequence <- directive.ControlSequence
        ack.Kind <- directive.Kind
        Expect.equal (LiveControl.reportControlAck ack (now.AddMilliseconds 510) state) LiveControlAckDisposition.LiveControlAckRecorded "renewal takes effect only after native ACK"
        let submission : LiveControl.Submission =
            { parentId=Guid.NewGuid();inputId=Guid.NewGuid();sessionId=session;controllerId=controller;controllerIncarnation=provisional.controllerIncarnation
              authorityEpoch=binding.AuthorityEpoch;moduleSha256=moduleHash;moduleGeneration=binding.ModuleGeneration;basis=basis.Clone()
              actors=[nativeRef 0u 9007199254740999UL;nativeRef 78u 9007199254741001UL];action=LiveControl.Move(12f,34f,true) }
        let admitted = Expect.wantOk (LiveControl.admit submission now state) "all children admitted"
        Expect.equal admitted.Length 2 "broker feedback reserved for both children"
        let mutable delivery=Unchecked.defaultof<LiveControl.CommandDelivery>
        Expect.isTrue (commandLease.reader.TryRead(&delivery)) "one atomic parent delivery available"
        Expect.equal delivery.batches.Length 2 "one child per actor"
        for child in delivery.batches do
            Expect.equal child.Batch.Value.Commands.Count 1 "one native command per fenced child"
            Expect.equal child.Batch.Value.Commands[0].MoveUnit.Options 32u "semantic append maps to installed SHIFT bit"
            Expect.equal child.Batch.Value.ConflictPolicy CommandConflictPolicy.CommandConflictQueueAfterCurrent "append queues"
            Expect.equal child.Basis.Value.StateSequence 9007199254740995UL "exact >2^53 basis retained"
        let first = delivery.batches.Head.Batch.Value
        let nativeResult = CommandBatchResult.empty()
        nativeResult.BatchSeq <- first.BatchSeq
        nativeResult.ClientCommandId <- first.ClientCommandId.Value
        nativeResult.Status <- CommandBatchStatus.CommandBatchAccepted
        Expect.equal
            (LiveControl.reportNativeAdmission "highbar" binding.CommandChannelIncarnation nativeResult state)
            LiveControl.NativeRecorded
            "first native admission is recorded"
        Expect.equal
            (LiveControl.reportNativeAdmission "highbar" binding.CommandChannelIncarnation nativeResult state)
            LiveControl.NativeDuplicate
            "native admission retry is explicitly duplicate"
    }
    testCase "stale basis, bad lifetime, and over-capacity refuse before emission" <| fun _ ->
        let now=DateTimeOffset(2026,9,29,12,0,0,TimeSpan.Zero)
        let state,controlLease,commandLease,basis=setup 1 now
        let session=Guid.NewGuid()
        let provisional=LiveControl.provisionController session state
        let controller=provisional.controllerId
        let moduleHash=Array.create 32 0x24uy
        Expect.isOk (LiveControl.requestBrowserArm session controller provisional.controllerIncarnation provisional.authorityEpoch moduleHash 7UL 2000u now state) "arm"
        let mutable directive=Unchecked.defaultof<LiveControlDirective>
        controlLease.reader.TryRead(&directive)|>ignore
        let ack=LiveControlAckReport.empty()
        ack.Binding<-directive.Binding
        ack.ControlSequence<-directive.ControlSequence
        ack.Kind<-directive.Kind
        ack.Disposition<-LiveControlAckDisposition.LiveControlAckRecorded
        LiveControl.reportControlAck ack now state|>ignore
        let submission : LiveControl.Submission={parentId=Guid.NewGuid();inputId=Guid.NewGuid();sessionId=session;controllerId=controller;controllerIncarnation=provisional.controllerIncarnation;authorityEpoch=provisional.authorityEpoch;moduleSha256=moduleHash;moduleGeneration=7UL;basis=basis.Clone();actors=[nativeRef 0u 9007199254740999UL];action=LiveControl.Stop}
        Expect.isError (LiveControl.admit {submission with actors=[nativeRef 0u 0UL]} now state) "zero lifetime refused"
        Expect.isError (LiveControl.admit submission (now.AddMilliseconds 2001) state) "stale basis refused despite other traffic"
        let mutable delivery=Unchecked.defaultof<LiveControl.CommandDelivery>
        Expect.isFalse (commandLease.reader.TryRead(&delivery)) "refused work has no native effect"
        Expect.isOk (LiveControl.admit submission now state) "first parent reserves its complete result capacity"
        Expect.isError (LiveControl.admit {submission with parentId=Guid.NewGuid();inputId=Guid.NewGuid()} now state) "next parent is refused before emission at the declared bound"
        Expect.isTrue (commandLease.reader.TryRead(&delivery)) "only the fully reserved first parent is emitted"
        let firstDelivery=delivery
        Expect.isFalse (commandLease.reader.TryRead(&delivery)) "capacity refusal emits no partial second parent"
        let rejected=CommandBatchResult.empty()
        rejected.BatchSeq<-firstDelivery.batches.Head.Batch.Value.BatchSeq
        rejected.ClientCommandId<-firstDelivery.batches.Head.Batch.Value.ClientCommandId.Value
        rejected.Status<-CommandBatchStatus.CommandBatchRejectedInvalid
        Expect.equal (LiveControl.reportNativeAdmission "highbar" directive.Binding.Value.CommandChannelIncarnation rejected state) LiveControl.NativeRecorded "native rejection terminates the child"
        Expect.isError (LiveControl.admit submission now state) "completed parent replay is refused from bounded history"
        let pending={submission with parentId=Guid.NewGuid();inputId=Guid.NewGuid()}
        Expect.isOk (LiveControl.admit pending now state) "released capacity accepts a distinct parent"
        Expect.isTrue (commandLease.reader.TryRead(&delivery)) "distinct parent is emitted"
        let terminal = ResizeArray<LiveControl.Feedback>()
        use _subscription =
            (LiveControl.feedback state).Subscribe
                { new IObserver<LiveControl.Feedback> with
                    member _.OnNext value = terminal.Add value
                    member _.OnError _ = ()
                    member _.OnCompleted() = () }
        LiveControl.reset "native session ended before completion" state
        Expect.equal terminal.Count 1 "session teardown publishes one terminal result for every accepted child"
        Expect.equal terminal[0].stage LiveControl.Unknown "teardown result remains distinct from native dispatch"
        Expect.equal terminal[0].status LiveControl.UnknownStatus "unknown completion is truthful"
    testCase "confirmed live authority fences legacy gameplay writers" <| fun _ ->
        let now=DateTimeOffset.UtcNow
        let hub=BrokerState.create (System.Version(1,0)) 4 ignore
        let state=BrokerState.liveControl hub
        let _,controlLease,_,_=setupState state now
        let session=Guid.NewGuid()
        let provisional=LiveControl.provisionController session state
        let controller=provisional.controllerId
        let moduleHash=Array.create 32 0x33uy
        Expect.isOk (LiveControl.requestBrowserArm session controller provisional.controllerIncarnation provisional.authorityEpoch moduleHash 13UL 2000u now state) "arm"
        let mutable directive=Unchecked.defaultof<LiveControlDirective>
        Expect.isTrue (controlLease.reader.TryRead(&directive)) "arm directive"
        let ack=LiveControlAckReport.empty()
        ack.Binding<-directive.Binding
        ack.ControlSequence<-directive.ControlSequence
        ack.Kind<-directive.Kind
        ack.Disposition<-LiveControlAckDisposition.LiveControlAckRecorded
        LiveControl.reportControlAck ack now state |> ignore
        let command : CommandPipeline.Command =
            { commandId=Guid.NewGuid();originatingClient=ScriptingClientId "legacy"
              targetSlot=None;submittedAt=now
              kind=CommandPipeline.Gameplay(CommandPipeline.UnitOrder([0u],CommandPipeline.Stop,None,None)) }
        match BrokerState.sendToCoordinator command hub with
        | Error(CommandPipeline.InvalidPayload detail) -> Expect.stringContains detail "fenced" "legacy writer is explicitly fenced"
        | other -> failtestf "expected live authority fence, got %A" other
    testCase "pending-arm revoke fences late ACK and delayed arm ACK expires" <| fun _ ->
        let now=DateTimeOffset(2026,9,29,12,0,0,TimeSpan.Zero)
        let state,controlLease,_,_=setup 4 now
        let session=Guid.NewGuid()
        let first=LiveControl.provisionController session state
        let moduleHash=Array.create 32 0x55uy
        Expect.isOk (LiveControl.requestBrowserArm session first.controllerId first.controllerIncarnation first.authorityEpoch moduleHash 1UL 2000u now state) "pending arm"
        let binding=LiveControl.currentBinding state |> Option.get
        Expect.isOk (LiveControl.requestRevoke binding "browser canceled pending arm" now state) "pending arm can be synchronously revoked"
        let mutable arm=Unchecked.defaultof<LiveControlDirective>
        let mutable revoke=Unchecked.defaultof<LiveControlDirective>
        Expect.isTrue (controlLease.reader.TryRead(&arm)) "arm directive exists"
        Expect.isTrue (controlLease.reader.TryRead(&revoke)) "higher-sequence revoke follows"
        let late=LiveControlAckReport.empty()
        late.Binding<-arm.Binding
        late.ControlSequence<-arm.ControlSequence
        late.Kind<-arm.Kind
        late.Disposition<-LiveControlAckDisposition.LiveControlAckRecorded
        Expect.equal (LiveControl.reportControlAck late (now.AddMilliseconds 10) state) LiveControlAckDisposition.LiveControlAckStale "late ARM ACK cannot resurrect canceled UI"

        let isolated,isolatedControl,_,_=setup 4 now
        let second=LiveControl.provisionController session isolated
        Expect.isOk (LiveControl.requestBrowserArm session second.controllerId second.controllerIncarnation second.authorityEpoch moduleHash 1UL 100u now isolated) "short arm"
        Expect.isTrue (isolatedControl.reader.TryRead(&arm)) "short arm directive"
        late.Binding<-arm.Binding
        late.ControlSequence<-arm.ControlSequence
        late.Kind<-arm.Kind
        Expect.equal (LiveControl.reportControlAck late (now.AddMilliseconds 101) isolated) LiveControlAckDisposition.LiveControlAckRefused "ACK cannot extend an already-expired native lease window"

    testCase "browser identity matrix and occupied controller slot refuse without native emission" <| fun _ ->
        let now=DateTimeOffset(2026,9,29,12,0,0,TimeSpan.Zero)
        let state,controlLease,commandLease,basis=setup 8 now
        let session=Guid.NewGuid()
        let provisional=LiveControl.provisionController session state
        let moduleHash=Array.create 32 0x61uy
        Expect.isOk (LiveControl.requestBrowserArm session provisional.controllerId provisional.controllerIncarnation provisional.authorityEpoch moduleHash 9007199254741011UL 2000u now state) "arm"
        let mutable directive=Unchecked.defaultof<LiveControlDirective>
        Expect.isTrue (controlLease.reader.TryRead(&directive)) "arm directive"
        let ack=LiveControlAckReport.empty()
        ack.Binding<-directive.Binding
        ack.ControlSequence<-directive.ControlSequence
        ack.Kind<-directive.Kind
        ack.Disposition<-LiveControlAckDisposition.LiveControlAckRecorded
        Expect.equal (LiveControl.reportControlAck ack now state) LiveControlAckDisposition.LiveControlAckRecorded "arm confirmed"

        let controller =
            ControllerIdentity(
                SessionId=ByteString.CopyFrom(session.ToByteArray()),
                ControllerId=ByteString.CopyFrom(provisional.controllerId.ToByteArray()),
                ControllerIncarnation=provisional.controllerIncarnation,
                AuthorityEpoch=provisional.authorityEpoch)
        let moduleId=LiveModuleIdentity(Sha256=ByteString.CopyFrom(moduleHash),Generation=9007199254741011UL)
        let browserBasis=
            ObservationBasis(
                Token=basis.Token, StateSequence=basis.StateSequence, NativeFrame=basis.Frame,
                MatchId=basis.MatchIncarnation, ProcessIncarnation=basis.ProcessIncarnation,
                StateChannelIncarnation=basis.StateChannelIncarnation)
        let request=SubmitLiveIntent(
                        ParentId=ByteString.CopyFrom(Guid.NewGuid().ToByteArray()),
                        InputId=ByteString.CopyFrom(Guid.NewGuid().ToByteArray()),
                        Controller=controller,Module=moduleId,Basis=browserBasis)
        request.Intent<-LiveIntent(Stop=StopAction())
        request.Intent.Actors.Add(UnitReference(Id=0UL,Lifetime=9007199254740999UL))

        let refusals =
            [ "session", fun (value:SubmitLiveIntent) -> value.Controller.SessionId<-ByteString.CopyFrom(Guid.NewGuid().ToByteArray())
              "module", fun value -> value.Module.Sha256<-ByteString.CopyFrom(Array.create 32 0x62uy)
              "module generation", fun value -> value.Module.Generation<-value.Module.Generation+1UL
              "epoch", fun value -> value.Controller.AuthorityEpoch<-value.Controller.AuthorityEpoch+1UL
              "controller incarnation", fun value -> value.Controller.ControllerIncarnation<-"wrong-controller" ]
        for name,change in refusals do
            let candidate=request.Clone()
            candidate.ParentId<-ByteString.CopyFrom(Guid.NewGuid().ToByteArray())
            candidate.InputId<-ByteString.CopyFrom(Guid.NewGuid().ToByteArray())
            change candidate
            Expect.isError (LiveBoundary.submit session candidate now state) (name+" mismatch refused")

        let stale=request.Clone()
        stale.ParentId<-ByteString.CopyFrom(Guid.NewGuid().ToByteArray())
        stale.InputId<-ByteString.CopyFrom(Guid.NewGuid().ToByteArray())
        stale.Basis.StateSequence<-stale.Basis.StateSequence-1UL
        match LiveBoundary.submit session stale now state with
        | Ok [ rejected ] ->
            Expect.equal rejected.Stage LiveResultStage.BrokerAdmission "stale displayed basis is a broker-stage refusal"
            Expect.equal rejected.Status LiveResultStatus.Rejected "stale displayed basis is terminally rejected"
            Expect.equal rejected.Disposition LiveResultDisposition.Recorded "the correlated refusal is a recorded result"
            Expect.equal rejected.ParentId stale.ParentId "refusal preserves the pending browser parent"
            Expect.equal rejected.Basis.StateSequence stale.Basis.StateSequence "refusal echoes the exact stale basis"
        | other -> failtestf "expected one correlated stale-basis refusal, got %A" other

        let second=LiveControl.provisionController session state
        Expect.isError
            (LiveControl.requestBrowserArm session second.controllerId second.controllerIncarnation second.authorityEpoch moduleHash 2UL 2000u now state)
            "the single controller slot cannot be replaced while confirmed"
        let mutable delivery=Unchecked.defaultof<LiveControl.CommandDelivery>
        Expect.isFalse (commandLease.reader.TryRead(&delivery)) "all mismatches, stale-basis refusal, and slot contention emit zero native commands"
        LiveControl.reset "production snapshot baseline lost" state
        Expect.isError (LiveBoundary.submit session request now state) "a submission cannot survive loss of the paired native baseline"
        Expect.isFalse (commandLease.reader.TryRead(&delivery)) "lost baseline emits zero native commands"

    testCase "reordered results and replacement preserve accepted identities" <| fun _ ->
        let now=DateTimeOffset(2026,9,29,12,0,0,TimeSpan.Zero)
        let state,controlLease,commandLease,basis=setup 4 now
        let session=Guid.NewGuid()
        let provisional=LiveControl.provisionController session state
        let moduleHash=Array.create 32 0x71uy
        Expect.isOk (LiveControl.requestBrowserArm session provisional.controllerId provisional.controllerIncarnation provisional.authorityEpoch moduleHash 9007199254741013UL 2000u now state) "arm"
        let mutable directive=Unchecked.defaultof<LiveControlDirective>
        controlLease.reader.TryRead(&directive)|>ignore
        let ack=LiveControlAckReport.empty()
        ack.Binding<-directive.Binding
        ack.ControlSequence<-directive.ControlSequence
        ack.Kind<-directive.Kind
        ack.Disposition<-LiveControlAckDisposition.LiveControlAckRecorded
        LiveControl.reportControlAck ack now state|>ignore
        let binding=LiveControl.currentBinding state |> Option.get
        let makeSubmission parent input : LiveControl.Submission =
            { parentId=parent;inputId=input;sessionId=session;controllerId=provisional.controllerId
              controllerIncarnation=provisional.controllerIncarnation;authorityEpoch=provisional.authorityEpoch
              moduleSha256=moduleHash;moduleGeneration=9007199254741013UL;basis=basis.Clone()
              actors=[nativeRef 0u 9007199254740999UL];action=LiveControl.Stop }
        let observed=ResizeArray<LiveControl.Feedback>()
        use _subscription=
            (LiveControl.feedback state).Subscribe
                { new IObserver<LiveControl.Feedback> with
                    member _.OnNext value=observed.Add value
                    member _.OnError _=()
                    member _.OnCompleted()=() }

        let firstParent,firstInput=Guid.NewGuid(),Guid.NewGuid()
        Expect.isOk (LiveControl.admit (makeSubmission firstParent firstInput) now state) "first parent admitted"
        let mutable delivery=Unchecked.defaultof<LiveControl.CommandDelivery>
        Expect.isTrue (commandLease.reader.TryRead(&delivery)) "first child emitted"
        let child=delivery.batches.Head.Batch.Value
        let dispatch=CommandDispatchEvent.empty()
        dispatch.ChannelIncarnation<-binding.CommandChannelIncarnation
        dispatch.BatchSeq<-child.BatchSeq
        dispatch.ClientCommandId<-child.ClientCommandId.Value
        dispatch.Status<-CommandDispatchStatus.CommandDispatchApplied
        dispatch.Frame<-901u
        Expect.isTrue (LiveControl.noteDispatch dispatch state) "dispatch may arrive before admission feedback"
        Expect.isFalse
            (observed |> Seq.exists(fun value->value.parentId=firstParent && value.stage=LiveControl.NativeDispatch))
            "early dispatch remains buffered until matching admission"
        let admission=CommandBatchResult.empty()
        admission.BatchSeq<-child.BatchSeq
        admission.ClientCommandId<-child.ClientCommandId.Value
        admission.Status<-CommandBatchStatus.CommandBatchAccepted
        Expect.equal (LiveControl.reportNativeAdmission "highbar" binding.CommandChannelIncarnation admission state) LiveControl.NativeRecorded "matching admission releases buffered dispatch"
        Expect.equal (LiveControl.reportNativeAdmission "highbar" binding.CommandChannelIncarnation admission state) LiveControl.NativeDuplicate "admission retry remains duplicate"
        Expect.isTrue (LiveControl.noteDispatch dispatch state) "duplicate dispatch is idempotently owned"
        let orderedStages=observed |> Seq.filter(fun value->value.parentId=firstParent) |> Seq.map(fun value->value.stage) |> Seq.toList
        Expect.equal orderedStages [LiveControl.BrokerAdmission;LiveControl.NativeAdmission;LiveControl.NativeDispatch] "browser feedback is canonically ordered"
        let firstTerminal=observed |> Seq.filter(fun value->value.parentId=firstParent && value.stage=LiveControl.NativeDispatch) |> Seq.toList
        Expect.equal firstTerminal.Length 1 "reordered and duplicate feedback yields one terminal event"
        Expect.equal firstTerminal.Head.nativeFrame (Some 901u) "terminal event retains the actual dispatch frame"

        let replacedParent,replacedInput=Guid.NewGuid(),Guid.NewGuid()
        Expect.isOk (LiveControl.admit (makeSubmission replacedParent replacedInput) now state) "second parent admitted"
        Expect.isTrue (commandLease.reader.TryRead(&delivery)) "replaced child emitted once"
        let replacedChild=delivery.batches.Head.Batch.Value
        LiveControl.reset "native session replaced" state
        let unknown=observed |> Seq.find(fun value->value.parentId=replacedParent && value.stage=LiveControl.Unknown)
        Expect.equal unknown.inputId replacedInput "replacement keeps the accepted input identity"
        Expect.equal unknown.basis.StateSequence basis.StateSequence "replacement keeps the accepted full basis"
        Expect.equal unknown.moduleGeneration 9007199254741013UL "replacement keeps the accepted module identity"
        admission.BatchSeq<-replacedChild.BatchSeq
        admission.ClientCommandId<-replacedChild.ClientCommandId.Value
        Expect.equal (LiveControl.reportNativeAdmission "highbar" binding.CommandChannelIncarnation admission state) LiveControl.NativeNotOwned "late result after replacement cannot satisfy current state"
        dispatch.BatchSeq<-replacedChild.BatchSeq
        dispatch.ClientCommandId<-replacedChild.ClientCommandId.Value
        Expect.isFalse (LiveControl.noteDispatch dispatch state) "late dispatch after replacement is not attached to another parent"

    testCase "missing native outcome expires once while live channels remain healthy" <| fun _ ->
        let now=DateTimeOffset(2026,9,29,12,0,0,TimeSpan.Zero)
        let state,controlLease,commandLease,basis=setup 1 now
        let session=Guid.NewGuid()
        let provisional=LiveControl.provisionController session state
        let moduleHash=Array.create 32 0x73uy
        Expect.isOk (LiveControl.requestBrowserArm session provisional.controllerId provisional.controllerIncarnation provisional.authorityEpoch moduleHash 9007199254741013UL 10000u now state) "arm"
        let mutable directive=Unchecked.defaultof<LiveControlDirective>
        Expect.isTrue (controlLease.reader.TryRead(&directive)) "arm directive available"
        let ack=LiveControlAckReport.empty()
        ack.Binding<-directive.Binding
        ack.ControlSequence<-directive.ControlSequence
        ack.Kind<-directive.Kind
        ack.Disposition<-LiveControlAckDisposition.LiveControlAckRecorded
        Expect.equal (LiveControl.reportControlAck ack now state) LiveControlAckDisposition.LiveControlAckRecorded "arm confirmed"
        let binding=LiveControl.currentBinding state |> Option.get
        let submission parent input selectedBasis : LiveControl.Submission =
            { parentId=parent;inputId=input;sessionId=session;controllerId=provisional.controllerId
              controllerIncarnation=provisional.controllerIncarnation;authorityEpoch=provisional.authorityEpoch
              moduleSha256=moduleHash;moduleGeneration=9007199254741013UL;basis=selectedBasis
              actors=[nativeRef 0u 9007199254740999UL];action=LiveControl.Stop }
        let observed=ResizeArray<LiveControl.Feedback>()
        use _subscription=
            (LiveControl.feedback state).Subscribe
                { new IObserver<LiveControl.Feedback> with
                    member _.OnNext value=observed.Add value
                    member _.OnError _=()
                    member _.OnCompleted()=() }

        let expiredParent,expiredInput=Guid.NewGuid(),Guid.NewGuid()
        Expect.isOk (LiveControl.admit (submission expiredParent expiredInput (basis.Clone())) now state) "parent admitted"
        let mutable delivery=Unchecked.defaultof<LiveControl.CommandDelivery>
        Expect.isTrue (commandLease.reader.TryRead(&delivery)) "child emitted exactly once"
        let expiredChild=delivery.batches.Head.Batch.Value
        let dispatch=CommandDispatchEvent.empty()
        dispatch.ChannelIncarnation<-binding.CommandChannelIncarnation
        dispatch.BatchSeq<-expiredChild.BatchSeq
        dispatch.ClientCommandId<-expiredChild.ClientCommandId.Value
        dispatch.Status<-CommandDispatchStatus.CommandDispatchApplied
        dispatch.Frame<-999u
        Expect.isTrue (LiveControl.noteDispatch dispatch state) "early dispatch is reserved while admission is missing"
        Expect.isFalse (observed |> Seq.exists(fun item->item.parentId=expiredParent && item.stage=LiveControl.NativeDispatch)) "reserved dispatch is not terminal feedback yet"
        Expect.equal (LiveControl.expirePendingResults (now.AddMilliseconds 3999) state) 0 "dispatch fence plus feedback allowance has not elapsed"
        Expect.equal (LiveControl.expirePendingResults (now.AddMilliseconds 4000) state) 1 "maintenance expires the missing native outcome"
        Expect.equal (LiveControl.expirePendingResults (now.AddMilliseconds 4500) state) 0 "maintenance is idempotent"
        let terminals=observed |> Seq.filter(fun item->item.parentId=expiredParent && item.stage=LiveControl.Unknown) |> Seq.toList
        Expect.equal terminals.Length 1 "one visible unknown terminal is published"
        let terminal=terminals.Head
        Expect.equal terminal.inputId expiredInput "unknown preserves the accepted input"
        Expect.equal terminal.basis basis "unknown preserves the full accepted basis"
        Expect.equal terminal.controllerIncarnation provisional.controllerIncarnation "unknown preserves the controller"
        Expect.equal terminal.moduleGeneration 9007199254741013UL "unknown preserves the module"
        Expect.isSome (LiveControl.currentBinding state) "result expiry does not reset the healthy controller"
        Expect.isOk (LiveControl.requestRenew binding 10000u (now.AddMilliseconds 4500) state) "healthy priority control path remains usable"

        let admission=CommandBatchResult.empty()
        admission.BatchSeq<-expiredChild.BatchSeq
        admission.ClientCommandId<-expiredChild.ClientCommandId.Value
        admission.Status<-CommandBatchStatus.CommandBatchAccepted
        Expect.equal (LiveControl.reportNativeAdmission "highbar" binding.CommandChannelIncarnation admission state) LiveControl.NativeDuplicate "late admission cannot reopen an expired identity"
        Expect.isTrue (LiveControl.noteDispatch dispatch state) "late dispatch is idempotently owned"
        Expect.equal (observed |> Seq.filter(fun item->item.parentId=expiredParent && item.stage=LiveControl.Unknown) |> Seq.length) 1 "late feedback publishes no second terminal"
        Expect.isFalse (commandLease.reader.TryRead(&delivery)) "expired parent is never re-emitted"

        let reporter=LiveStateReporter.empty()
        reporter.PluginId<-"highbar"
        reporter.SchemaVersion<-"1.0.0"
        reporter.Protocol<-LiveControlProtocol.V1
        reporter.ProcessIncarnation<-"process-1"
        reporter.MatchIncarnation<-bytes16 "match"
        reporter.StateChannelIncarnation<-"state-1"
        let refreshedBasis=basis.Clone()
        refreshedBasis.Token<-bytes16 "basis-2"
        refreshedBasis.StateSequence<-9007199254741007UL
        refreshedBasis.Frame<-701u
        refreshedBasis.SnapshotSendMonotonicNs<-9007199254741009UL
        let refreshed=(LiveControl.latestSnapshotMetadata state |> Option.get).Clone()
        refreshed.Basis<-ValueSome refreshedBasis
        let refresh=LiveStateReport.empty()
        refresh.Reporter<-ValueSome reporter
        refresh.ReportSequence<-9007199254741011UL
        refresh.Snapshot<-refreshed
        Expect.equal (LiveControl.reportState refresh (now.AddMilliseconds 4500) state) LiveStateReportDisposition.LiveStateReportRecorded "fresh native metadata arrives without replacing the live channels"
        let nextParent,nextInput=Guid.NewGuid(),Guid.NewGuid()
        Expect.isOk (LiveControl.admit (submission nextParent nextInput (refreshedBasis.Clone())) (now.AddMilliseconds 4500) state) "expired result capacity is reusable"
        Expect.isTrue (commandLease.reader.TryRead(&delivery)) "only the distinct parent emits after capacity release"
        Expect.isError (LiveControl.admit (submission expiredParent (Guid.NewGuid()) (refreshedBasis.Clone())) (now.AddMilliseconds 4500) state) "completed parent replay remains refused"
]
