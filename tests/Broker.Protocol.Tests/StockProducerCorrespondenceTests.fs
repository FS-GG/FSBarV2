module Broker.Protocol.Tests.StockProducerCorrespondenceTests

open System
open System.IO
open System.Security.Cryptography
open System.Text.Json
open Expecto
open Google.Protobuf
open Highbar.V1
open Broker.Core
open Broker.Protocol
open Broker.Browser.Live

// The four immutable payloads are compiled HighBar producer output with controlled
// engine facts. The retained native packet has no raw delta. Additional metadata
// below is explicitly controlled and is never appended to the producer bytes.
let private fixture name =
    File.ReadAllBytes(Path.Combine(AppContext.BaseDirectory, "fixtures", "controlled-owned-damage", name))

let private update name = StateUpdate.Parser.ParseFrom(fixture ("owned-damage-" + name + ".pb"))
let private apply value view = WireConvert.applyHighBarStateUpdate value view
let private baseline () = apply (update "baseline") WireConvert.emptyRunningView |> fst
let private current result =
    match result with
    | WireConvert.NewSnapshot (_, browser) -> browser
    | other -> failtestf "expected materialized producer snapshot, got %A" other
let private health (browser: Snapshot.BrowserObservation) =
    browser.units |> List.find (fun unit -> unit.id = 42UL) |> fun unit -> unit.health
let private replacement () =
    let projected, _ = apply (update "projected") (baseline ())
    apply (update "replacement") projected |> snd |> current

let private bytes16 value = ByteString.CopyFrom(Array.create 16 value)
let private reference lifetime =
    let value = NativeUnitReference.empty()
    value.Id <- 42u
    value.Lifetime <- lifetime
    value

let private liveSetup () =
    let state = LiveControl.create 8
    let now = DateTimeOffset.UtcNow
    let reporter = LiveStateReporter.empty()
    reporter.PluginId <- "controlled-highbar"
    reporter.SchemaVersion <- "1.1.0"
    reporter.Protocol <- LiveControlProtocol.TacticalV1
    reporter.ProcessIncarnation <- "controlled-process"
    reporter.MatchIncarnation <- bytes16 1uy
    reporter.StateChannelIncarnation <- "controlled-state"
    let mutable reportSequence = 0UL
    let report body =
        reportSequence <- reportSequence + 1UL
        let value = LiveStateReport.empty()
        value.Reporter <- ValueSome reporter
        value.ReportSequence <- reportSequence
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
    tacticalCaps.Profile <- "barc-live-tactical-stock-v1"
    tacticalCaps.Revision <- 2u
    tacticalCaps.MaxCatalogueEntries <- 16u
    tacticalCaps.MaxCataloguePageEntries <- 8u
    tacticalCaps.MaxBuildOptionsPerActor <- 8u
    tacticalCaps.MaxQueueEntriesPerActor <- 8u
    tacticalCaps.MaxFeatureReferences <- 8u
    tacticalCaps.MaxFactoryProductionCount <- 4u
    tacticalCaps.MaxAreaRadiusWorldUnits <- 256u
    tacticalCaps.MaxCommandDescriptorsPerActor <- 8u
    caps.Tactical <- ValueSome tacticalCaps
    Expect.equal (report (LiveStateReport.Types.Body.Capabilities caps)) LiveStateReportDisposition.LiveStateReportRecorded "controlled capabilities accepted"
    let page = TacticalCataloguePage.empty()
    page.TacticalProfile <- tacticalCaps.Profile
    page.TacticalRevision <- tacticalCaps.Revision
    page.CatalogueId <- bytes16 2uy
    page.CatalogueRevision <- 1UL
    page.PageCount <- 1u
    page.Complete <- true
    let content = NativeContentIdentity.empty()
    content.EngineVersion <- "controlled-recoil"
    content.GameName <- "controlled-BAR"
    content.GameVersion <- "controlled-fixture"
    content.GameContentSha256 <- ByteString.CopyFrom(Array.create 32 3uy)
    page.Content <- ValueSome content
    Expect.equal (report (LiveStateReport.Types.Body.TacticalCatalogue page)) LiveStateReportDisposition.LiveStateReportRecorded "controlled catalogue accepted"
    let basis (value: StateUpdate) =
        let result = NativeObservationBasis.empty()
        result.Token <- bytes16 (byte value.Seq)
        result.StateSequence <- value.Seq
        result.Frame <- value.Frame
        result.MatchIncarnation <- reporter.MatchIncarnation
        result.ProcessIncarnation <- reporter.ProcessIncarnation
        result.StateChannelIncarnation <- reporter.StateChannelIncarnation
        result.SnapshotSendMonotonicNs <- value.SendMonotonicNs
        result.EffectiveCadenceFrames <- value.Snapshot.EffectiveCadenceFrames
        result
    let metadata basis lifetime =
        let result = LiveSnapshotMetadata.empty()
        result.Basis <- ValueSome basis
        let actor = NativeLiveUnitMetadata.empty()
        actor.Reference <- ValueSome (reference lifetime)
        actor.Eligibility <- NativeLiveUnitEligibility.NativeLiveUnitOwnedActor
        result.Units.Add actor
        result
    let tactical basis lifetime =
        let result = TacticalSnapshotMetadata.empty()
        result.Basis <- ValueSome basis
        result.CatalogueId <- page.CatalogueId
        result.CatalogueRevision <- page.CatalogueRevision
        let actor = NativeActorTacticalMetadata.empty()
        actor.Actor <- ValueSome (reference lifetime)
        actor.DescriptorRevision <- 1UL
        result.Actors.Add actor
        let economy = NativeEconomySnapshot.empty()
        economy.SampleFrame <- basis.Frame
        let resource name income =
            let value = NativeEconomyValue.empty()
            value.ResourceName <- name
            value.Unit <- "per-second"
            value.Current <- ValueSome 12f
            value.IncomePerSecond <- ValueSome income
            value
        economy.Metal <- ValueSome (resource "metal" 7f)
        economy.Energy <- ValueSome (resource "energy" 11f)
        result.Economy <- ValueSome economy
        result
    state, report, basis, metadata, tactical

let private preview (browser: Snapshot.BrowserObservation) =
    let result = Broker.Browser.Contracts.Observation(
        SessionId = ByteString.CopyFrom(browser.sessionId.ToByteArray()),
        Sequence = browser.sequence, CapturedAtUnixMs = browser.capturedAt.ToUnixTimeMilliseconds(),
        PerspectiveId = browser.perspectiveId)
    for unit in browser.units do
        let value = Broker.Browser.Contracts.ObservedUnit(Id = unit.id)
        unit.health |> Option.iter (fun health -> value.Health <- health)
        result.Units.Add value
    result

let private ready state =
    LiveBoundary.provisionBootstrapForProfile "barc-live-tactical-stock-v1" (Guid.NewGuid()) "team-0" state

[<Tests>]
let stockProducerCorrespondenceTests =
    testList "Controlled BARC-01.5f producer correspondence" [
        test "immutable compiled producer manifest and bytes match" {
            let manifestBytes = fixture "manifest.json"
            Expect.equal (Convert.ToHexString(SHA256.HashData manifestBytes).ToLowerInvariant()) "270b756ae5ed2d2974b35eb91c0a366eed487b90e91ba77834ae87b0f9365d8e" "root-verified manifest"
            use manifest = JsonDocument.Parse manifestBytes
            let root = manifest.RootElement
            Expect.equal (root.GetProperty("provenance").GetString()) "controlledFixture" "never actual-native evidence"
            Expect.isFalse (root.GetProperty("retainedNativePacketHasRawDelta").GetBoolean()) "no reconstructed native payload claim"
            Expect.equal (root.GetProperty("sourceHead").GetString()) "a5a6eab3809e4defc66c6f1947df9764c98175aa" "exact producer source"
            for artifact in root.GetProperty("artifacts").EnumerateArray() do
                let data = fixture (artifact.GetProperty("path").GetString() |> nonNull)
                Expect.equal data.Length (artifact.GetProperty("bytes").GetInt32()) "exact producer length"
                Expect.equal (Convert.ToHexString(SHA256.HashData data).ToLowerInvariant()) (artifact.GetProperty("sha256").GetString()) "exact producer bytes"
        }
        test "typed consumer preserves mixed delta and replaces health with authoritative 83" {
            let baselineView = baseline ()
            Expect.isTrue (WireConvert.hasValidBaseline baselineView) "compiled snapshot accepted"
            let legacy = update "legacy"
            Expect.equal legacy.Delta.Events.Count 130 "128 owned damage events plus dispatch and economy"
            let projected = update "projected"
            Expect.equal projected.Delta.Events.Count 2 "production projection preserves both unrelated arms"
            Expect.isTrue (projected.Delta.Events |> Seq.exists (fun event -> (match event.Kind with ValueSome (DeltaEvent.Types.Kind.CommandDispatch _) -> true | _ -> false))) "dispatch remains"
            Expect.isTrue (projected.Delta.Events |> Seq.exists (fun event -> (match event.Kind with ValueSome (DeltaEvent.Types.Kind.EconomyTick _) -> true | _ -> false))) "economy remains"
            let projectedView, projectedResult = apply projected baselineView
            let browser = current projectedResult
            Expect.equal (health browser) (Some 100f) "damage is not subtracted from retained health"
            Expect.isTrue (WireConvert.hasValidBaseline projectedView) "supported mixed delta stays valid"
            let finalView, finalResult = apply (update "replacement") projectedView
            let final = current finalResult
            Expect.isTrue (WireConvert.hasValidBaseline finalView) "complete authoritative replacement accepted"
            Expect.equal final.sequence 36UL "exact replacement sequence"
            Expect.equal (health final) (Some 83f) "engine resulting health reaches typed consumer"
            Expect.equal final.units.Length 1 "complete controlled membership"
        }
        test "omitting replacement leaves stale health and legacy damage refuses until full recovery" {
            let projectedView, projectedResult = apply (update "projected") (baseline ())
            Expect.equal (health (current projectedResult)) (Some 100f) "causal omission fails health83 claim"
            let invalid, _ = apply (update "legacy") (baseline ())
            Expect.isFalse (WireConvert.hasValidBaseline invalid) "unsupported owned damage invalidates"
            let economy = update "projected"
            economy.Seq <- 36UL
            let stillInvalid, _ = apply economy invalid
            Expect.isFalse (WireConvert.hasValidBaseline stillInvalid) "economy cannot repair invalid facts"
            let recovered, result = apply (update "replacement") invalid
            Expect.isTrue (WireConvert.hasValidBaseline recovered) "full snapshot recovers"
            Expect.equal (health (current result)) (Some 83f) "recovery health is authoritative"
            Expect.equal (WireConvert.lastSeq projectedView) 35UL "omission never invents replacement basis"
        }
        test "snapshot-before-event and mixed unknown arm cannot preserve a usable baseline" {
            let early = update "replacement"
            early.Seq <- 35UL
            let view, _ = apply early (baseline ())
            let late = update "legacy"
            late.Seq <- 36UL
            let invalid, _ = apply late view
            Expect.isFalse (WireConvert.hasValidBaseline invalid) "late unsupported event invalidates early snapshot"
            let mixed = update "projected"
            mixed.Delta.Events.Add((update "legacy").Delta.Events.[0].Clone())
            let invalidMixed, _ = apply mixed (baseline ())
            Expect.isFalse (WireConvert.hasValidBaseline invalidMixed) "one unknown arm refuses entire delta"
        }
        test "delta gap duplicate and malformed controlled facts fail closed" {
            let gap = update "projected"
            gap.Seq <- 36UL
            let invalid, _ = apply gap (baseline ())
            Expect.isFalse (WireConvert.hasValidBaseline invalid) "sparse gap invalidates"
            let after, _ = apply (update "replacement") (baseline ())
            let duplicate, result = apply (update "replacement") after
            Expect.equal (WireConvert.lastSeq duplicate) 36UL "duplicate does not move sequence"
            Expect.equal result WireConvert.KeepAliveOnly "duplicate emits no fresh facts"
            let malformed = update "replacement"
            malformed.Snapshot.OwnUnits.[0].Position <- ValueNone
            let rejected, _ = apply malformed (baseline ())
            Expect.isFalse (WireConvert.hasValidBaseline rejected) "missing position cannot fabricate usable facts"
        }
        test "controlled complete replacement removes membership and never infers reused-id continuity" {
            let removed = update "replacement"
            removed.Seq <- 37UL
            removed.Snapshot.OwnUnits.Clear()
            let afterDamage, _ = apply (update "replacement") (baseline ())
            let withoutUnit, removedResult = apply removed afterDamage
            Expect.isEmpty (current removedResult).units "complete replacement removes old unit membership"
            let reused = update "replacement"
            reused.Seq <- 38UL
            reused.Snapshot.OwnUnits.[0].Health <- 61f
            let _, reusedResult = apply reused withoutUnit
            let browser = current reusedResult
            Expect.equal (health browser) (Some 61f) "controlled reused-id facts come only from new complete snapshot"
            Expect.equal browser.units.Head.generation None "frozen snapshot does not fabricate a lifetime"
        }
        test "real live join refuses missing reordered and stale tactical metadata then pairs health83" {
            let browser = replacement ()
            let state, report, basis, metadata, tactical = liveSetup ()
            let finalBasis = basis (update "replacement")
            let finalMetadata = metadata finalBasis 1UL
            let finalTactical = tactical finalBasis 1UL
            Expect.isError (LiveBoundary.observation (preview browser) state) "producer snapshot alone has no native basis"
            Expect.isError (ready state) "producer bytes contain no tactical metadata"
            Expect.equal (report (LiveStateReport.Types.Body.TacticalSnapshot finalTactical)) LiveStateReportDisposition.LiveStateReportRefused "tactical-before-basis is refused"
            Expect.equal (report (LiveStateReport.Types.Body.Snapshot finalMetadata)) LiveStateReportDisposition.LiveStateReportRecorded "matching controlled basis accepted"
            let basic = Expect.wantOk (LiveBoundary.observation (preview browser) state) "basic live preview joins real metadata"
            Expect.isNull basic.Observation.Tactical "basic join does not fabricate tactical metadata"
            Expect.isError (ready state) "stock tactical readiness remains refused"
            let stale = tactical (basis (update "baseline")) 1UL
            Expect.equal (report (LiveStateReport.Types.Body.TacticalSnapshot stale)) LiveStateReportDisposition.LiveStateReportRefused "stale tactical basis refused"
            Expect.isError (ready state) "stale metadata never releases readiness"
            Expect.equal (report (LiveStateReport.Types.Body.TacticalSnapshot finalTactical)) LiveStateReportDisposition.LiveStateReportRecorded "genuine typed matching controlled tactical report accepted"
            Expect.isOk (ready state) "only same-basis tactical metadata releases stock readiness"
            let paired = Expect.wantOk (LiveBoundary.observation (preview browser) state) "production live boundary joins replacement"
            Expect.equal paired.Observation.Basis.StateSequence 36UL "basis belongs to authoritative replacement"
            Expect.equal paired.Observation.Preview.Units.[0].Health 83f "health83 survives live join"
            Expect.equal paired.Observation.Tactical.Economy.SampleFrame finalBasis.Frame "tactical economy has same-basis sample"
            Expect.equal paired.Observation.Tactical.Economy.Metal.IncomePerSecond 7f "controlled direct tactical income retained"
            Expect.isFalse paired.Observation.Tactical.Economy.Metal.HasUsagePerSecond "missing tactical usage stays absent"
        }
        test "destroy reuse and epoch replacement require new same-basis lifetime metadata" {
            let state, report, basis, metadata, tactical = liveSetup ()
            let original = basis (update "replacement")
            Expect.equal (report (LiveStateReport.Types.Body.Snapshot (metadata original 1UL))) LiveStateReportDisposition.LiveStateReportRecorded "initial lifetime"
            Expect.equal (report (LiveStateReport.Types.Body.TacticalSnapshot (tactical original 1UL))) LiveStateReportDisposition.LiveStateReportRecorded "initial tactical lifetime"
            let newer = original.Clone()
            newer.StateSequence <- 37UL
            newer.Token <- bytes16 37uy
            newer.SnapshotSendMonotonicNs <- original.SnapshotSendMonotonicNs + 1UL
            Expect.equal (report (LiveStateReport.Types.Body.Snapshot (metadata newer 2UL))) LiveStateReportDisposition.LiveStateReportRecorded "controlled reused id gets new lifetime"
            Expect.isError (ready state) "replacement drops old tactical readiness"
            Expect.equal (report (LiveStateReport.Types.Body.TacticalSnapshot (tactical newer 1UL))) LiveStateReportDisposition.LiveStateReportRefused "reused id cannot inherit old lifetime"
            Expect.equal (report (LiveStateReport.Types.Body.TacticalSnapshot (tactical newer 2UL))) LiveStateReportDisposition.LiveStateReportRecorded "new lifetime joins"
            let wrongEpoch = newer.Clone()
            wrongEpoch.ProcessIncarnation <- "replacement-process"
            Expect.equal (report (LiveStateReport.Types.Body.TacticalSnapshot (tactical wrongEpoch 2UL))) LiveStateReportDisposition.LiveStateReportRefused "equal sequence cannot hide changed epoch"
            LiveControl.reset "controlled process replacement" state
            Expect.isError (ready state) "reset cannot inherit previous epoch readiness"
            Expect.isError (LiveBoundary.observation (preview (replacement ())) state) "previous observation has no replacement epoch metadata"
        }
    ]
