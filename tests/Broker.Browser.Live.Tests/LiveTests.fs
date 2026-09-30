module Broker.Browser.Live.Tests.LiveTests

open System
open System.Threading
open System.Threading.Tasks
open Expecto
open Google.Protobuf
open Highbar.V1
open Broker.Browser.Gateway
open Broker.Protocol

[<Tests>]
let gatewayDiagnosticTests = testList "gateway diagnostic classification" [
    testCase "receive output and renewal winners have independent fixed reasons" <| fun _ ->
        let receiveTask=Task.CompletedTask
        let outputTask=Task.FromException(InvalidOperationException "private credential uuid frame")
        let renewalTask=Task.FromCanceled(CancellationToken(true))
        let renewalFault=Task.FromException(InvalidOperationException "renewal failed")
        Expect.equal (Gateway.completedTaskDiagnostic receiveTask outputTask renewalTask receiveTask) Gateway.ReceiveTaskCompleted "receive completion is distinct"
        Expect.equal (Gateway.completedTaskDiagnostic receiveTask outputTask renewalTask outputTask) Gateway.OutputTaskFailed "output failure is distinct"
        Expect.equal (Gateway.completedTaskDiagnostic receiveTask outputTask renewalTask renewalTask) Gateway.RenewalTaskCancelled "renewal cancellation is distinct"
        let renewalFailure=Gateway.completedTaskDiagnostic receiveTask outputTask renewalFault renewalFault
        Expect.equal renewalFailure Gateway.RenewalTaskFailed "renewal failure is distinct"
        Expect.notEqual renewalFailure Gateway.ReceiveTaskFailed "renewal failure cannot alias receive failure"
        Expect.notEqual renewalFailure Gateway.OutputTaskFailed "renewal failure cannot alias output failure"
        let simultaneousReceive=Task.FromException(InvalidOperationException "receive")
        let simultaneousOutput=Task.FromException(InvalidOperationException "output")
        let winner=Task.WhenAny([|simultaneousReceive;simultaneousOutput|]).Result
        Expect.isTrue (Object.ReferenceEquals(winner,simultaneousReceive)) "WhenAny preserves observed order for simultaneous completed tasks"
        Expect.equal (Gateway.completedTaskDiagnostic simultaneousReceive simultaneousOutput renewalTask winner) Gateway.ReceiveTaskFailed "the exact winner controls classification"
        Expect.throws (fun () -> Gateway.completedTaskDiagnostic receiveTask outputTask renewalTask (Task.Delay 1) |> ignore) "unobserved tasks cannot be classified"
    testCase "forwarded feedback precedence and inversion are closed" <| fun _ ->
        Expect.equal (Gateway.feedbackDiagnostic LiveControl.BrokerAdmission LiveControl.Accepted) (Some Gateway.BrokerAdmissionForwarded) "accepted broker feedback is classified"
        Expect.equal (Gateway.feedbackDiagnostic LiveControl.BrokerAdmission LiveControl.Rejected) (Some Gateway.BrokerAdmissionRejectedForwarded) "rejected broker feedback is classified"
        Expect.equal (Gateway.feedbackDiagnostic LiveControl.Unknown LiveControl.UnknownStatus) (Some Gateway.UnknownForwarded) "unknown stage is classified"
        Expect.equal (Gateway.feedbackDiagnostic LiveControl.Unknown LiveControl.Expired) (Some Gateway.ExpiredForwarded) "expired takes precedence over unknown stage"
        Expect.equal (Gateway.feedbackDiagnostic LiveControl.NativeAdmission LiveControl.Accepted) None "unselected feedback does not invert into a diagnostic"
    testCase "throwing diagnostic callbacks cannot escape" <| fun _ ->
        Gateway.emitDiagnostic (fun _ -> raise(InvalidOperationException "private detail")) Gateway.SubmitAccepted
    testCase "submit refusal classes are closed and never echo detail" <| fun _ ->
        Expect.equal (Gateway.submitRefusalReason "live command channel is full") Gateway.CommandChannelFull "known submit refusal has a stable class"
        let secret="credential=private uuid=33221100-5544-7766-8899-aabbccddeeff actor=9 x=10"
        let fallback=Gateway.submitRefusalReason secret
        Expect.equal fallback Gateway.UnknownRefusal "unknown detail uses the closed fallback"
        let struct(_,name)=Gateway.diagnosticNames(Gateway.SubmitRefused fallback)
        Expect.equal name "unknown-refusal" "fallback projection is fixed"
        Expect.isFalse (name.Contains "private") "fallback does not echo sensitive detail"
]
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

let setupTactical now =
    let state=LiveControl.create 8
    let reporter=LiveStateReporter.empty()
    reporter.PluginId<-"highbar";reporter.SchemaVersion<-"1.1.0";reporter.Protocol<-LiveControlProtocol.TacticalV1;reporter.ProcessIncarnation<-"process-t";reporter.MatchIncarnation<-bytes16 "match-t";reporter.StateChannelIncarnation<-"state-t"
    let caps=LiveNativeCapabilities.empty()
    caps.MaxActorCount<-64u;caps.MaxBatchCommands<-1u;caps.MaxNativeUnitId<-31999u;caps.SnapshotCadenceCeilingFrames<-30u;caps.MaxObservationAgeMs<-2000u;caps.MaxReportedUnits<-64u;caps.MapWidthCells<-1024u;caps.MapHeightCells<-1024u;caps.MaxWorldXInclusive<-8191f;caps.MaxWorldZInclusive<-8191f;caps.SupportsStop<-true;caps.SupportsMove<-true;caps.SupportsAttackVisibleUnit<-true
    let tacticalCaps=NativeTacticalCapabilities.empty()
    tacticalCaps.Profile<-"barc-live-tactical-v1";tacticalCaps.Revision<-1u;tacticalCaps.MaxCatalogueEntries<-16u;tacticalCaps.MaxCataloguePageEntries<-8u;tacticalCaps.MaxBuildOptionsPerActor<-8u;tacticalCaps.MaxQueueEntriesPerActor<-8u;tacticalCaps.MaxFeatureReferences<-8u;tacticalCaps.MaxFactoryProductionCount<-4u;tacticalCaps.MaxAreaRadiusWorldUnits<-256u;tacticalCaps.MaxCommandDescriptorsPerActor<-8u
    caps.Tactical<-ValueSome tacticalCaps
    let report body sequence =
        let value=LiveStateReport.empty()
        value.Reporter<-ValueSome reporter;value.ReportSequence<-sequence;value.Body<-ValueSome body
        LiveControl.reportState value now state
    Expect.equal (report (LiveStateReport.Types.Body.Capabilities caps) 1UL) LiveStateReportDisposition.LiveStateReportRecorded "tactical capabilities"
    let basis=NativeObservationBasis.empty()
    basis.Token<-bytes16 "basis-t";basis.StateSequence<-9007199254741101UL;basis.Frame<-800u;basis.MatchIncarnation<-reporter.MatchIncarnation;basis.ProcessIncarnation<-reporter.ProcessIncarnation;basis.StateChannelIncarnation<-reporter.StateChannelIncarnation;basis.SnapshotSendMonotonicNs<-9007199254741103UL;basis.EffectiveCadenceFrames<-30u
    let snapshot=LiveSnapshotMetadata.empty()
    snapshot.Basis<-ValueSome basis
    let actor=NativeLiveUnitMetadata.empty()
    actor.Reference<-ValueSome(nativeRef 0u 9007199254741105UL);actor.Eligibility<-NativeLiveUnitEligibility.NativeLiveUnitOwnedActor;snapshot.Units.Add actor
    Expect.equal (report (LiveStateReport.Types.Body.Snapshot snapshot) 2UL) LiveStateReportDisposition.LiveStateReportRecorded "base snapshot"
    let page=TacticalCataloguePage.empty()
    page.TacticalProfile<-"barc-live-tactical-v1";page.TacticalRevision<-1u;page.CatalogueId<-bytes16 "catalogue";page.CatalogueRevision<-9007199254741107UL;page.PageCount<-1u;page.Complete<-true
    let content=NativeContentIdentity.empty()
    content.EngineVersion<-"recoil";content.GameName<-"BAR";content.GameVersion<-"test";content.GameContentSha256<-ByteString.CopyFrom(Array.create 32 7uy);page.Content<-ValueSome content
    let definition=NativeUnitDefinition.empty()
    definition.DefinitionId<-42u;definition.InternalName<-"armmex";definition.DisplayName<-"Metal Extractor";definition.FootprintXCells<-4u;definition.FootprintZCells<-4u;page.Definitions.Add definition
    Expect.equal (report (LiveStateReport.Types.Body.TacticalCatalogue page) 3UL) LiveStateReportDisposition.LiveStateReportRecorded "complete catalogue"
    let tactical=TacticalSnapshotMetadata.empty()
    tactical.Basis<-ValueSome basis;tactical.CatalogueId<-page.CatalogueId;tactical.CatalogueRevision<-page.CatalogueRevision
    let metadata=NativeActorTacticalMetadata.empty()
    metadata.Actor<-ValueSome(nativeRef 0u 9007199254741105UL);metadata.DescriptorRevision<-9007199254741109UL
    let descriptor=NativeTacticalCommandDescriptor.empty()
    descriptor.Kind<-NativeTacticalDescriptorKind.NativeTacticalDescriptorFactoryProduce;descriptor.AllowedDefinitionIds.Add 42u;metadata.Descriptors.Add descriptor
    let buildDescriptor=NativeTacticalCommandDescriptor.empty()
    buildDescriptor.Kind<-NativeTacticalDescriptorKind.NativeTacticalDescriptorBuild;buildDescriptor.AllowedDefinitionIds.Add 42u;metadata.Descriptors.Add buildDescriptor
    let queue=NativeObservedQueue.empty()
    queue.Domain<-NativeQueueDomain.FactoryProduction;queue.Revision<-9007199254741111UL;queue.Complete<-true;metadata.Queue.Add queue
    let actorQueue=NativeObservedQueue.empty()
    actorQueue.Domain<-NativeQueueDomain.ActorOrder;actorQueue.Revision<-9007199254741113UL;actorQueue.Complete<-true;metadata.Queue.Add actorQueue;tactical.Actors.Add metadata
    Expect.equal (report (LiveStateReport.Types.Body.TacticalSnapshot tactical) 4UL) LiveStateReportDisposition.LiveStateReportRecorded "paired tactical snapshot"
    let control=LiveControlSubscribe.empty()
    control.PluginId<-"highbar";control.SchemaVersion<-"1.1.0";control.Protocol<-LiveControlProtocol.TacticalV1;control.ControlChannelIncarnation<-"control-t"
    let controlLease=match LiveControl.claimControl control state with LiveControl.Claimed lease->lease|other->failtestf "control %A" other
    let initial=LiveBinding.empty()
    initial.PluginId<-"highbar";initial.CommandChannelIncarnation<-"command-t"
    let commands=LiveCommandSubscribe.empty()
    commands.Protocol<-LiveControlProtocol.TacticalV1;commands.SchemaVersion<-"1.1.0";commands.Binding<-ValueSome initial
    let commandLease=match LiveControl.claimCommands commands state with LiveControl.Claimed lease->lease|other->failtestf "commands %A" other
    state,controlLease,commandLease,basis,metadata,page


let reportFeaturePopulation negotiatedCount observedCount now =
    let state = LiveControl.create 4
    let reporter = LiveStateReporter.empty()
    reporter.PluginId <- "highbar-capacity"
    reporter.SchemaVersion <- "1.1.0"
    reporter.Protocol <- LiveControlProtocol.TacticalV1
    reporter.ProcessIncarnation <- "process-capacity"
    reporter.MatchIncarnation <- bytes16 "match-capacity"
    reporter.StateChannelIncarnation <- "state-capacity"
    let report body sequence =
        let value = LiveStateReport.empty()
        value.Reporter <- ValueSome reporter
        value.ReportSequence <- sequence
        value.Body <- ValueSome body
        LiveControl.reportState value now state
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
    let tacticalCaps = NativeTacticalCapabilities.empty()
    tacticalCaps.Profile <- "barc-live-tactical-v1"
    tacticalCaps.Revision <- 1u
    tacticalCaps.MaxCatalogueEntries <- 4096u
    tacticalCaps.MaxCataloguePageEntries <- 128u
    tacticalCaps.MaxBuildOptionsPerActor <- 256u
    tacticalCaps.MaxQueueEntriesPerActor <- 64u
    tacticalCaps.MaxFeatureReferences <- uint32 negotiatedCount
    tacticalCaps.MaxFactoryProductionCount <- 1u
    tacticalCaps.MaxAreaRadiusWorldUnits <- 2048u
    tacticalCaps.MaxCommandDescriptorsPerActor <- 32u
    caps.Tactical <- ValueSome tacticalCaps
    Expect.equal (report (LiveStateReport.Types.Body.Capabilities caps) 1UL) LiveStateReportDisposition.LiveStateReportRecorded "negotiated tactical capabilities"
    let basis = NativeObservationBasis.empty()
    basis.Token <- bytes16 "basis-capacity"
    basis.StateSequence <- 9007199254742001UL
    basis.Frame <- 900u
    basis.MatchIncarnation <- reporter.MatchIncarnation
    basis.ProcessIncarnation <- reporter.ProcessIncarnation
    basis.StateChannelIncarnation <- reporter.StateChannelIncarnation
    basis.SnapshotSendMonotonicNs <- 9007199254742003UL
    basis.EffectiveCadenceFrames <- 6u
    let snapshot = LiveSnapshotMetadata.empty()
    snapshot.Basis <- ValueSome basis
    let actor = NativeLiveUnitMetadata.empty()
    actor.Reference <- ValueSome(nativeRef 0u 9007199254742005UL)
    actor.Eligibility <- NativeLiveUnitEligibility.NativeLiveUnitOwnedActor
    snapshot.Units.Add actor
    Expect.equal (report (LiveStateReport.Types.Body.Snapshot snapshot) 2UL) LiveStateReportDisposition.LiveStateReportRecorded "paired base snapshot"
    let page = TacticalCataloguePage.empty()
    page.TacticalProfile <- "barc-live-tactical-v1"
    page.TacticalRevision <- 1u
    page.CatalogueId <- bytes16 "capacity-catalog"
    page.CatalogueRevision <- 9007199254742007UL
    page.PageCount <- 1u
    page.Complete <- true
    let content = NativeContentIdentity.empty()
    content.EngineVersion <- "recoil"
    content.GameName <- "BAR"
    content.GameVersion <- "test"
    content.GameContentSha256 <- ByteString.CopyFrom(Array.create 32 0x51uy)
    page.Content <- ValueSome content
    let definition = NativeUnitDefinition.empty()
    definition.DefinitionId <- 91u
    definition.InternalName <- "feature-def"
    definition.DisplayName <- "Feature"
    definition.FootprintXCells <- 1u
    definition.FootprintZCells <- 1u
    page.Definitions.Add definition
    Expect.equal (report (LiveStateReport.Types.Body.TacticalCatalogue page) 3UL) LiveStateReportDisposition.LiveStateReportRecorded "complete catalogue"
    let tactical = TacticalSnapshotMetadata.empty()
    tactical.Basis <- ValueSome basis
    tactical.CatalogueId <- page.CatalogueId
    tactical.CatalogueRevision <- page.CatalogueRevision
    for index in 0..observedCount-1 do
        let reference = NativeFeatureReference.empty()
        reference.Id <- uint32 index
        reference.Lifetime <- 9007199254743000UL + uint64 index
        let feature = NativeFeatureMetadata.empty()
        feature.Reference <- ValueSome reference
        feature.DefinitionId <- 91u
        feature.WorldX <- float32 (index % 512)
        feature.WorldZ <- float32 ((index * 3) % 512)
        feature.Elevation <- ValueSome(float32 index / 10f)
        feature.ReclaimLeft <- ValueSome 0.75f
        tactical.Features.Add feature
    let finalReport = LiveStateReport.empty()
    finalReport.Reporter <- ValueSome reporter
    finalReport.ReportSequence <- 4UL
    finalReport.TacticalSnapshot <- tactical
    LiveControl.reportState finalReport now state,state,basis,page,finalReport.ToByteArray().Length,finalReport

[<Tests>]
let tests=testList "live broker boundary" [
    testCase "negotiated feature capacity preserves complete references and refuses overflow atomically" <| fun _ ->
        let now=DateTimeOffset(2026,9,29,14,0,0,TimeSpan.Zero)
        for count in [256;342;512] do
            let disposition,state,basis,_,nativeBytes,_=reportFeaturePopulation 512 count now
            Expect.equal disposition LiveStateReportDisposition.LiveStateReportRecorded (sprintf "%d features accepted at negotiated 512" count)
            Expect.isLessThan nativeBytes (4*1024*1024) "full native LiveStateReport remains below 4 MiB"
            printfn "feature-capacity count=%d native-bytes=%d" count nativeBytes
            let stored=LiveControl.latestTacticalSnapshot state |> Option.get
            Expect.equal stored.Features.Count count "all native features retained"
            let selected=stored.Features[count-1].Reference.Value
            Expect.equal selected.Id (uint32(count-1)) "feature beyond the former index bound keeps its id"
            Expect.equal selected.Lifetime (9007199254743000UL+uint64(count-1)) "feature lifetime is exact"
            let preview = Observation(SessionId=ByteString.CopyFrom(Guid.NewGuid().ToByteArray()),Sequence=basis.StateSequence,CapturedAtUnixMs=now.ToUnixTimeMilliseconds(),PerspectiveId="team-0")
            for index in 0..count-1 do
                preview.Features.Add(ObservedFeature(Id=uint64 index,DefinitionId=91u,Position=Position3(X=float32(index%512),Elevation=float32 index/10f,Z=float32((index*3)%512))))
            let envelope=Expect.wantOk (LiveBoundary.observation preview state) "paired native metadata projects through the browser boundary"
            Expect.equal envelope.Observation.Tactical.Features.Count count "browser tactical projection is complete"
            let projected=envelope.Observation.Tactical.Features[count-1].Reference
            Expect.equal projected.Id (uint64(count-1)) "projected feature id survives"
            Expect.equal projected.Lifetime selected.Lifetime "projected feature lifetime survives"
            let browserBytes=envelope.ToByteArray().Length
            Expect.isLessThan browserBytes (64*1024) "full browser envelope remains below 64 KiB"
            printfn "feature-capacity count=%d browser-bytes=%d" count browserBytes
        let refused256,state256,_,_,_,_=reportFeaturePopulation 256 342 now
        Expect.equal refused256 LiveStateReportDisposition.LiveStateReportRefused "negotiated 256 refuses 342"
        Expect.isNone (LiveControl.latestTacticalSnapshot state256) "overflow retains zero partial tactical child"
        let refused513,state513,_,_,_,_=reportFeaturePopulation 512 513 now
        Expect.equal refused513 LiveStateReportDisposition.LiveStateReportRefused "negotiated 512 refuses 513"
        Expect.isNone (LiveControl.latestTacticalSnapshot state513) "513 refusal retains zero partial tactical child"
        let _,guardState,_,_,_,acceptedReport=reportFeaturePopulation 512 342 now
        let duplicate=acceptedReport.Clone()
        duplicate.ReportSequence<-5UL
        let duplicateFeature=duplicate.TacticalSnapshot.Features[300].Clone()
        duplicateFeature.Reference.Value.Lifetime<-duplicateFeature.Reference.Value.Lifetime+1UL
        duplicate.TacticalSnapshot.Features.Add duplicateFeature
        Expect.equal (LiveControl.reportState duplicate now guardState) LiveStateReportDisposition.LiveStateReportRefused "duplicate numeric feature id is refused even with a different lifetime"
        let malformed=acceptedReport.Clone()
        malformed.ReportSequence<-5UL
        malformed.TacticalSnapshot.Features[300].Reference.Value.Lifetime<-0UL
        Expect.equal (LiveControl.reportState malformed now guardState) LiveStateReportDisposition.LiveStateReportRefused "zero feature lifetime is refused"
        let stale=acceptedReport.Clone()
        stale.ReportSequence<-3UL
        stale.TacticalSnapshot.Features[300].Reference.Value.Lifetime<-9007199254999999UL
        Expect.equal (LiveControl.reportState stale now guardState) LiveStateReportDisposition.LiveStateReportStale "stale reused reference cannot replace current metadata"
        let _,replacementState,_,_,_,replacementBase=reportFeaturePopulation 512 342 now
        let replacement=replacementBase.Clone()
        replacement.ReportSequence<-5UL
        replacement.TacticalSnapshot.Features[300].Reference.Value.Lifetime<-9007199254999999UL
        Expect.equal (LiveControl.reportState replacement now replacementState) LiveStateReportDisposition.LiveStateReportRecorded "fresh reused id requires a new lifetime"
        Expect.equal (LiveControl.latestTacticalSnapshot replacementState |> Option.get).Features[300].Reference.Value.Lifetime 9007199254999999UL "only the fresh replacement lifetime becomes current"


    testCase "tactical catalogue and queue revisions reserve every expanded child before native emission" <| fun _ ->
        let now=DateTimeOffset(2026,9,29,13,0,0,TimeSpan.Zero)
        let state,controlLease,commandLease,basis,metadata,_=setupTactical now
        let session=Guid.NewGuid()
        let provisional=LiveControl.provisionController session state
        let moduleHash=Array.create 32 0x61uy
        Expect.isOk (LiveControl.requestBrowserArm session provisional.controllerId provisional.controllerIncarnation provisional.authorityEpoch moduleHash 3UL 2000u now state) "arm"
        let mutable directive=Unchecked.defaultof<LiveControlDirective>
        Expect.isTrue(controlLease.reader.TryRead(&directive)) "arm directive"
        let ack=LiveControlAckReport.empty()
        ack.Binding<-directive.Binding;ack.ControlSequence<-directive.ControlSequence;ack.Kind<-directive.Kind;ack.Disposition<-LiveControlAckDisposition.LiveControlAckRecorded
        LiveControl.reportControlAck ack now state|>ignore
        let bootstrap=Expect.wantOk(LiveBoundary.provisionBootstrapForProfile "barc-live-tactical-v1" session "team-0" state) "complete tactical bootstrap"
        Expect.equal bootstrap.Bootstrap.TacticalCatalogue.Definitions.Count 1 "complete catalogue is assembled before exposure"
        let controller=ControllerIdentity(SessionId=ByteString.CopyFrom(session.ToByteArray()),ControllerId=ByteString.CopyFrom(provisional.controllerId.ToByteArray()),ControllerIncarnation=provisional.controllerIncarnation,AuthorityEpoch=provisional.authorityEpoch)
        let browserBasis=ObservationBasis(Token=basis.Token,StateSequence=basis.StateSequence,NativeFrame=basis.Frame,MatchId=basis.MatchIncarnation,ProcessIncarnation=basis.ProcessIncarnation,StateChannelIncarnation=basis.StateChannelIncarnation)
        let request=SubmitLiveIntent(ParentId=ByteString.CopyFrom(Guid.NewGuid().ToByteArray()),InputId=ByteString.CopyFrom(Guid.NewGuid().ToByteArray()),Controller=controller,Module=LiveModuleIdentity(Sha256=ByteString.CopyFrom(moduleHash),Generation=3UL),Basis=browserBasis)
        let intent=LiveIntent(FactoryProduce=FactoryProduceTarget(DefinitionId=42u,Count=2u,QueuePolicy=TacticalQueuePolicy.Append,CatalogueId=bootstrap.Bootstrap.TacticalCatalogue.CatalogueId,CatalogueRevision=bootstrap.Bootstrap.TacticalCatalogue.CatalogueRevision))
        intent.Actors.Add(UnitReference(Id=0UL,Lifetime=9007199254741105UL))
        let actorBinding=ActorTacticalBinding(Actor=UnitReference(Id=0UL,Lifetime=9007199254741105UL),DescriptorRevision=metadata.DescriptorRevision)
        actorBinding.QueueRevisions.Add(QueueRevisionBinding(Domain=QueueDomain.FactoryProduction,Revision=12UL))
        intent.ActorTacticalBindings.Add actorBinding
        request.Intent<-intent
        let refused=Expect.wantOk(LiveBoundary.submit session request now state) "stale queue revision is a correlated terminal refusal"
        Expect.equal refused.Length 2 "every expanded child receives a refusal"
        Expect.isTrue (refused |> List.forall(fun result->result.Stage=LiveResultStage.BrokerAdmission && result.Status=LiveResultStatus.Rejected)) "refusal is explicit broker admission feedback"
        let mutable delivery=Unchecked.defaultof<LiveControl.CommandDelivery>
        Expect.isFalse(commandLease.reader.TryRead(&delivery)) "refused parent emits no child"
        actorBinding.QueueRevisions[0].Revision<-9007199254741111UL
        let staleCatalogue=request.Clone()
        staleCatalogue.ParentId<-ByteString.CopyFrom(Guid.NewGuid().ToByteArray())
        staleCatalogue.Intent.FactoryProduce.CatalogueRevision<-bootstrap.Bootstrap.TacticalCatalogue.CatalogueRevision-1UL
        let staleCatalogueResults=Expect.wantOk(LiveBoundary.submit session staleCatalogue now state) "stale catalogue is a correlated terminal refusal"
        Expect.equal staleCatalogueResults.Length 2 "stale catalogue refuses every expanded child"
        Expect.isTrue (staleCatalogueResults |> List.forall(fun result->result.Stage=LiveResultStage.BrokerAdmission && result.Status=LiveResultStatus.Rejected)) "stale catalogue refusal is explicit"
        Expect.isFalse(commandLease.reader.TryRead(&delivery)) "stale catalogue emits no native child"
        let mismatchedActor=request.Clone()
        mismatchedActor.ParentId<-ByteString.CopyFrom(Guid.NewGuid().ToByteArray())
        mismatchedActor.Intent.ActorTacticalBindings[0].Actor.Lifetime<-mismatchedActor.Intent.Actors[0].Lifetime+1UL
        Expect.isError (LiveBoundary.submit session mismatchedActor now state) "actor binding must match the declared actor in order"
        Expect.isFalse(commandLease.reader.TryRead(&delivery)) "mismatched actor binding emits no native child"
        request.ParentId<-ByteString.CopyFrom(Guid.NewGuid().ToByteArray())
        let admitted=Expect.wantOk(LiveBoundary.submit session request now state) "valid factory count expands through browser boundary"
        Expect.equal admitted.Length 2 "all children reserved"
        Expect.isTrue(commandLease.reader.TryRead(&delivery)) "one atomic delivery"
        Expect.equal delivery.batches.Length 2 "count expands to exact children"
        for child in delivery.batches do
            Expect.equal child.Batch.Value.Commands.Count 1 "one translated native command"
            Expect.equal child.Batch.Value.Commands[0].BuildUnit.Options 32u "append uses SHIFT32"
            Expect.equal child.TacticalCommand.Value.FactoryProduce.Count 1u "each child count is one"
            Expect.equal child.TacticalCommand.Value.ExpectedQueueRevision 9007199254741111UL "lossless >2^53 queue revision"
        actorBinding.QueueRevisions.Add(QueueRevisionBinding(Domain=QueueDomain.ActorOrder,Revision=9007199254741113UL))
        request.ParentId<-ByteString.CopyFrom(Guid.NewGuid().ToByteArray())
        let missingPosition=BuildTarget(DefinitionId=42u,Facing=BuildFacing.North,QueuePolicy=TacticalQueuePolicy.Replace,CatalogueId=bootstrap.Bootstrap.TacticalCatalogue.CatalogueId,CatalogueRevision=bootstrap.Bootstrap.TacticalCatalogue.CatalogueRevision)
        let missingPositionIntent=LiveIntent(Build=missingPosition)
        missingPositionIntent.Actors.Add(UnitReference(Id=0UL,Lifetime=9007199254741105UL))
        missingPositionIntent.ActorTacticalBindings.Add(actorBinding.Clone())
        request.Intent<-missingPositionIntent
        let malformed=Expect.wantOk(LiveBoundary.submit session request now state) "missing nested position is safely refused"
        Expect.equal malformed.Length 1 "malformed build receives one correlated refusal"
        Expect.equal malformed.Head.Status LiveResultStatus.Rejected "malformed build is rejected"
        Expect.isFalse(commandLease.reader.TryRead(&delivery)) "malformed build emits no native child"
        for facing,expectedEngineFacing in [BuildFacing.North,2;BuildFacing.East,1;BuildFacing.South,0;BuildFacing.West,3] do
            request.ParentId<-ByteString.CopyFrom(Guid.NewGuid().ToByteArray())
            let build=BuildTarget(DefinitionId=42u,Position=Position3(X=1792f,Z=1856f),Facing=facing,QueuePolicy=TacticalQueuePolicy.Replace,CatalogueId=bootstrap.Bootstrap.TacticalCatalogue.CatalogueId,CatalogueRevision=bootstrap.Bootstrap.TacticalCatalogue.CatalogueRevision)
            let buildIntent=LiveIntent(Build=build)
            buildIntent.Actors.Add(UnitReference(Id=0UL,Lifetime=9007199254741105UL))
            buildIntent.ActorTacticalBindings.Add(actorBinding.Clone())
            request.Intent<-buildIntent
            let accepted=Expect.wantOk(LiveBoundary.submit session request now state) "valid build facing is admitted"
            Expect.equal accepted.Length 1 "one build child reserved"
            Expect.isTrue(commandLease.reader.TryRead(&delivery)) "build delivery emitted"
            let child=delivery.batches.Head
            Expect.equal child.Batch.Value.Commands[0].BuildUnit.Facing expectedEngineFacing "legacy command uses the engine-facing ordinal"
            Expect.equal child.TacticalCommand.Value.Build.Facing (enum<NativeBuildFacing>(int facing)) "tactical command retains the protocol-facing enum"
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

        let observed=ResizeArray<LiveControl.Feedback>()
        use _subscription=
            (LiveControl.feedback state).Subscribe
                { new IObserver<LiveControl.Feedback> with
                    member _.OnNext value=observed.Add value
                    member _.OnError _=()
                    member _.OnCompleted()=() }
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
        Expect.equal observed.Count 1 "the first stale parent has one terminal feedback record"
        Expect.isError (LiveBoundary.submit session stale now state) "the same stale parent cannot emit a second terminal refusal"
        let rewritten=stale.Clone()
        rewritten.Basis<-browserBasis.Clone()
        Expect.isError (LiveBoundary.submit session rewritten now state) "a terminally refused parent cannot be rewritten against a fresh basis"
        Expect.equal observed.Count 1 "duplicate and rewritten terminal parents emit no additional feedback"
        let fresh=request.Clone()
        fresh.ParentId<-ByteString.CopyFrom(Guid.NewGuid().ToByteArray())
        fresh.InputId<-ByteString.CopyFrom(Guid.NewGuid().ToByteArray())
        Expect.isOk (LiveBoundary.submit session fresh now state) "a new parent on the current basis remains admissible"
        Expect.equal observed.Count 2 "the fresh parent publishes its broker admission once"

        let second=LiveControl.provisionController session state
        Expect.isError
            (LiveControl.requestBrowserArm session second.controllerId second.controllerIncarnation second.authorityEpoch moduleHash 2UL 2000u now state)
            "the single controller slot cannot be replaced while confirmed"
        let mutable delivery=Unchecked.defaultof<LiveControl.CommandDelivery>
        Expect.isTrue (commandLease.reader.TryRead(&delivery)) "the fresh current-basis parent emits one native delivery"
        Expect.equal delivery.batches.Length 1 "only the fresh parent emits a native child"
        Expect.isFalse (commandLease.reader.TryRead(&delivery)) "mismatches, stale refusal, duplicate, rewrite, and slot contention emit no native commands"
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
