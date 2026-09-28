module Broker.Browser.Live.Tests.LiveTests

open System
open Expecto
open Google.Protobuf
open Highbar.V1
open Broker.Protocol
open Broker.Core

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
        let controller=Guid.NewGuid()
        let moduleHash=Array.create 32 0x42uy
        Expect.isOk (LiveControl.requestBrowserArm session controller "browser-1" 9007199254741007UL moduleHash 9007199254741009UL 2000u now state) "arm requested"
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
            { parentId=Guid.NewGuid();inputId=Guid.NewGuid();sessionId=session;controllerId=controller;controllerIncarnation="browser-1"
              authorityEpoch=binding.AuthorityEpoch;moduleSha256=moduleHash;moduleGeneration=binding.ModuleGeneration;basisToken=basis.Token.ToByteArray()
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
        let controller=Guid.NewGuid()
        let moduleHash=Array.create 32 0x24uy
        Expect.isOk (LiveControl.requestBrowserArm session controller "browser" 9UL moduleHash 7UL 2000u now state) "arm"
        let mutable directive=Unchecked.defaultof<LiveControlDirective>
        controlLease.reader.TryRead(&directive)|>ignore
        let ack=LiveControlAckReport.empty()
        ack.Binding<-directive.Binding
        ack.ControlSequence<-directive.ControlSequence
        ack.Kind<-directive.Kind
        ack.Disposition<-LiveControlAckDisposition.LiveControlAckRecorded
        LiveControl.reportControlAck ack now state|>ignore
        let submission : LiveControl.Submission={parentId=Guid.NewGuid();inputId=Guid.NewGuid();sessionId=session;controllerId=controller;controllerIncarnation="browser";authorityEpoch=9UL;moduleSha256=moduleHash;moduleGeneration=7UL;basisToken=basis.Token.ToByteArray();actors=[nativeRef 0u 9007199254740999UL];action=LiveControl.Stop}
        Expect.isError (LiveControl.admit {submission with actors=[nativeRef 0u 0UL]} now state) "zero lifetime refused"
        Expect.isError (LiveControl.admit submission (now.AddMilliseconds 2001) state) "stale basis refused despite other traffic"
        let mutable delivery=Unchecked.defaultof<LiveControl.CommandDelivery>
        Expect.isFalse (commandLease.reader.TryRead(&delivery)) "refused work has no native effect"
        Expect.isOk (LiveControl.admit submission now state) "first parent reserves its complete result capacity"
        Expect.isError (LiveControl.admit {submission with parentId=Guid.NewGuid();inputId=Guid.NewGuid()} now state) "next parent is refused before emission at the declared bound"
        Expect.isTrue (commandLease.reader.TryRead(&delivery)) "only the fully reserved first parent is emitted"
        Expect.isFalse (commandLease.reader.TryRead(&delivery)) "capacity refusal emits no partial second parent"
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
        let controller=Guid.NewGuid()
        let moduleHash=Array.create 32 0x33uy
        Expect.isOk (LiveControl.requestBrowserArm session controller "browser" 11UL moduleHash 13UL 2000u now state) "arm"
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
]
