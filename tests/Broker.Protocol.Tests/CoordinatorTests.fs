module Broker.Protocol.Tests.CoordinatorTests

open System
open System.Collections.Concurrent
open System.Threading
open System.Threading.Tasks
open System.Threading.Channels
open Expecto
open Broker.Core
open Broker.Protocol
open Highbar.V1

let private mkCoreCommand (kind: CommandPipeline.CommandKind) : CommandPipeline.Command =
    { commandId = Guid.NewGuid()
      originatingClient = ScriptingClientId "test"
      targetSlot = None
      kind = kind
      submittedAt = DateTimeOffset.UtcNow }

let private firstAi (batch: CommandBatch) : AICommand =
    if batch.Commands.Count = 0 then
        failtest "expected at least one AICommand"
    batch.Commands.[0]

let private mkSnapshotPayload (frame: uint32) =
    let ss = StateSnapshot.empty()
    ss.FrameNumber <- frame
    ss

let private mkStateUpdate (seqNo: uint64) (frame: uint32) =
    let upd = StateUpdate.empty()
    upd.Seq <- seqNo
    upd.Frame <- frame
    upd.Snapshot <- mkSnapshotPayload frame
    upd

let private mkKeepalive (seqNo: uint64) (frame: uint32) =
    let upd = StateUpdate.empty()
    upd.Seq <- seqNo
    upd.Frame <- frame
    upd.Keepalive <- KeepAlive.empty()
    upd

let private mkDelta (seqNo: uint64) (frame: uint32) (nonempty: bool) =
    let delta = StateDelta.empty()
    if nonempty then
        let event = DeltaEvent.empty()
        event.EconomyTick <- EconomyTickEvent.empty()
        delta.Events.Add(event)
    let upd = StateUpdate.empty()
    upd.Seq <- seqNo
    upd.Frame <- frame
    upd.Delta <- delta
    upd

let private position x y z =
    let p = Vector3.empty()
    p.X <- x
    p.Y <- y
    p.Z <- z
    p

let private mkHubWithAudit () =
    let q = ConcurrentQueue<Audit.AuditEvent>()
    let hub = BrokerState.create (System.Version(1, 0)) 64 (fun e -> q.Enqueue e)
    hub, q

[<Tests>]
let wireConvertTests =
    testList "WireConvert.applyHighBarStateUpdate (T014 / FR-013)" [

        test "snapshot path returns NewSnapshot with frame as tick" {
            let v0 = WireConvert.emptyRunningView
            let upd = mkStateUpdate 1UL 100u
            let _, result = WireConvert.applyHighBarStateUpdate upd v0
            match result with
            | WireConvert.NewSnapshot (s, _) ->
                Expect.equal s.tick 100L "frame is threaded into tick"
            | other ->
                failtestf "expected NewSnapshot, got %A" other
        }

        test "keepalive path returns KeepAliveOnly" {
            let v0 = WireConvert.emptyRunningView
            let upd = mkKeepalive 1UL 50u
            let _, result = WireConvert.applyHighBarStateUpdate upd v0
            match result with
            | WireConvert.KeepAliveOnly -> ()
            | other -> failtestf "expected KeepAliveOnly, got %A" other
        }

        test "first complete snapshot establishes the baseline without raising a gap" {
            let v0 = WireConvert.emptyRunningView
            let upd = mkStateUpdate 5UL 42u
            let v1, result = WireConvert.applyHighBarStateUpdate upd v0
            Expect.equal (WireConvert.lastSeq v1) 5UL "lastSeq advanced"
            Expect.isTrue (WireConvert.hasValidBaseline v1) "snapshot establishes baseline"
            match result with
            | WireConvert.Gap _ -> failtest "first update must not raise Gap"
            | _ -> ()
        }

        test "newer full snapshot recovers directly across a sequence jump" {
            let v0 = WireConvert.emptyRunningView
            let v1, _ = WireConvert.applyHighBarStateUpdate (mkStateUpdate 1UL 1u) v0
            let v2, result = WireConvert.applyHighBarStateUpdate (mkStateUpdate 5UL 5u) v1
            Expect.isTrue (WireConvert.hasValidBaseline v2) "replacement snapshot is valid"
            match result with
            | WireConvert.NewSnapshot (snapshot, _) -> Expect.equal snapshot.tick 5L "new baseline tick"
            | other -> failtestf "expected NewSnapshot, got %A" other
        }

        test "consecutive updates do not raise a gap" {
            let v0 = WireConvert.emptyRunningView
            let v1, _ = WireConvert.applyHighBarStateUpdate (mkStateUpdate 1UL 1u) v0
            let _, result = WireConvert.applyHighBarStateUpdate (mkStateUpdate 2UL 2u) v1
            match result with
            | WireConvert.Gap _ -> failtest "consecutive seq must not raise Gap"
            | _ -> ()
        }

        test "native X/Y/Z projects to legacy ground X/Z" {
            let own = OwnUnit.empty()
            own.UnitId <- 7u
            own.DefId <- 42u
            own.Position <- ValueSome (position 11.0f 7.0f 23.0f)
            let upd = mkStateUpdate 1UL 1u
            upd.Snapshot.OwnUnits.Add(own)
            let _, result = WireConvert.applyHighBarStateUpdate upd WireConvert.emptyRunningView
            match result with
            | WireConvert.NewSnapshot (snapshot, _) ->
                Expect.equal snapshot.units.Head.pos.x 11.0f "ground x comes from native X"
                Expect.equal snapshot.units.Head.pos.y 23.0f "ground y comes from native Z"
            | other -> failtestf "expected NewSnapshot, got %A" other
        }

        test "browser observation preserves provenance elevation radar and economy optionals" {
            let own = OwnUnit.empty()
            own.UnitId <- 77u
            own.DefId <- 501u
            own.TeamId <- 7
            own.Position <- ValueSome (position 11.25f 403.5f -37.5f)
            own.Health <- 123.5f
            own.MaxHealth <- 800.0f
            let radar = RadarBlip.empty()
            radar.BlipId <- 99u
            radar.Position <- ValueSome (position 73.25f 0.0f -8.5f)
            let economy = TeamEconomy.empty()
            economy.Metal <- 42.5f
            economy.MetalStorage <- 1000.0f
            economy.MetalIncome <- 7.25f
            let upd = mkStateUpdate 9007199254740993UL 1u
            upd.Snapshot.OwnUnits.Add own
            upd.Snapshot.RadarEnemies.Add radar
            upd.Snapshot.Economy <- ValueSome economy
            let _, result = WireConvert.applyHighBarStateUpdate upd WireConvert.emptyRunningView
            match result with
            | WireConvert.NewSnapshot (_, browser) ->
                Expect.equal browser.sequence 9007199254740993UL "full uint64 sequence retained"
                Expect.equal browser.units.[0].observation Snapshot.Own "own provenance retained"
                Expect.equal browser.units.[0].position.elevation (Some 403.5f) "elevation retained"
                Expect.equal browser.units.[1].observation Snapshot.Radar "radar provenance retained"
                Expect.equal browser.units.[1].definitionId None "unknown radar definition remains absent"
                Expect.equal browser.units.[1].health None "hidden health remains absent"
                Expect.equal browser.teamEconomy.Value.metal.expenditure None "unsupported expenditure remains absent"
            | other -> failtestf "expected NewSnapshot, got %A" other
        }

        test "nonempty delta before a baseline cannot fabricate a snapshot" {
            let view, result =
                WireConvert.applyHighBarStateUpdate
                    (mkDelta 1UL 1u true)
                    WireConvert.emptyRunningView
            Expect.isFalse (WireConvert.hasValidBaseline view) "no baseline was invented"
            match result with
            | WireConvert.Invalidated (_, 1UL, _) -> ()
            | other -> failtestf "expected Invalidated, got %A" other
        }

        test "snapshot gap delta invalidates until a newer snapshot recovers" {
            let v1, _ = WireConvert.applyHighBarStateUpdate (mkStateUpdate 1UL 1u) WireConvert.emptyRunningView
            let v2, gap = WireConvert.applyHighBarStateUpdate (mkDelta 3UL 3u true) v1
            Expect.isFalse (WireConvert.hasValidBaseline v2) "gap invalidates baseline"
            match gap with
            | WireConvert.Gap (1UL, 3UL) -> ()
            | other -> failtestf "expected gap, got %A" other
            let v3, recovery = WireConvert.applyHighBarStateUpdate (mkStateUpdate 4UL 4u) v2
            Expect.isTrue (WireConvert.hasValidBaseline v3) "full snapshot recovers"
            match recovery with
            | WireConvert.NewSnapshot (snapshot, _) -> Expect.equal snapshot.tick 4L "recovery tick"
            | other -> failtestf "expected recovered snapshot, got %A" other
        }

        test "unapplied delta invalidates until a newer snapshot recovers" {
            let v1, _ = WireConvert.applyHighBarStateUpdate (mkStateUpdate 1UL 1u) WireConvert.emptyRunningView
            let v2, invalid = WireConvert.applyHighBarStateUpdate (mkDelta 2UL 2u true) v1
            Expect.isFalse (WireConvert.hasValidBaseline v2) "unapplied delta invalidates"
            match invalid with
            | WireConvert.Invalidated (1UL, 2UL, _) -> ()
            | other -> failtestf "expected invalidation, got %A" other
            let v3, recovery = WireConvert.applyHighBarStateUpdate (mkStateUpdate 3UL 3u) v2
            Expect.isTrue (WireConvert.hasValidBaseline v3) "full snapshot recovers"
            match recovery with
            | WireConvert.NewSnapshot _ -> ()
            | other -> failtestf "expected recovered snapshot, got %A" other
        }

        test "empty delta and keepalive advance transport only" {
            let v1, _ = WireConvert.applyHighBarStateUpdate (mkStateUpdate 1UL 1u) WireConvert.emptyRunningView
            let v2, emptyResult = WireConvert.applyHighBarStateUpdate (mkDelta 2UL 2u false) v1
            let v3, keepaliveResult = WireConvert.applyHighBarStateUpdate (mkKeepalive 3UL 2u) v2
            Expect.equal emptyResult WireConvert.KeepAliveOnly "empty delta emits no snapshot"
            Expect.equal keepaliveResult WireConvert.KeepAliveOnly "keepalive emits no snapshot"
            Expect.isTrue (WireConvert.hasValidBaseline v3) "transport-only updates preserve baseline"
            Expect.equal (WireConvert.lastSeq v3) 3UL "transport sequence advances"
        }

        test "older and duplicate updates never regress the accepted sequence" {
            let v1, _ = WireConvert.applyHighBarStateUpdate (mkStateUpdate 5UL 5u) WireConvert.emptyRunningView
            let v2, _ = WireConvert.applyHighBarStateUpdate (mkStateUpdate 5UL 50u) v1
            let v3, _ = WireConvert.applyHighBarStateUpdate (mkStateUpdate 4UL 40u) v2
            Expect.equal (WireConvert.lastSeq v3) 5UL "sequence did not regress"
            Expect.isTrue (WireConvert.hasValidBaseline v3) "valid baseline is retained"
        }

        test "maximum sequence does not overflow gap detection" {
            let v1, _ =
                WireConvert.applyHighBarStateUpdate
                    (mkStateUpdate UInt64.MaxValue UInt32.MaxValue)
                    WireConvert.emptyRunningView
            let v2, result = WireConvert.applyHighBarStateUpdate (mkKeepalive 0UL 0u) v1
            Expect.equal (WireConvert.lastSeq v2) UInt64.MaxValue "wrapped sequence is ignored"
            Expect.equal result WireConvert.KeepAliveOnly "older update is transport-only"
        }

        test "snapshot with a missing entity position is invalid instead of fabricating zeroes" {
            let own = OwnUnit.empty()
            own.UnitId <- 9u
            let upd = mkStateUpdate 1UL 1u
            upd.Snapshot.OwnUnits.Add(own)
            let view, result = WireConvert.applyHighBarStateUpdate upd WireConvert.emptyRunningView
            Expect.isFalse (WireConvert.hasValidBaseline view) "incomplete snapshot rejected"
            match result with
            | WireConvert.Invalidated (_, _, detail) ->
                Expect.stringContains detail "missing position" "reason identifies absent field"
            | other -> failtestf "expected invalidation, got %A" other
        }

        test "browser preview bound does not invalidate the legacy materializer" {
            let upd = mkStateUpdate 1UL 1u
            for id in 1u .. 4097u do
                let feature = MapFeature.empty()
                feature.FeatureId <- id
                feature.DefId <- 1u
                feature.Position <- ValueSome (position 1.0f 2.0f 3.0f)
                upd.Snapshot.MapFeatures.Add feature
            let view, result = WireConvert.applyHighBarStateUpdate upd WireConvert.emptyRunningView
            Expect.isTrue (WireConvert.hasValidBaseline view) "legacy baseline remains valid"
            match result with
            | WireConvert.NewSnapshot (legacy, browser) ->
                Expect.equal legacy.features.Length 4097 "legacy snapshot is complete"
                let hub, _ = mkHubWithAudit ()
                Expect.isOk (BrokerState.openGuestSession DateTimeOffset.UtcNow hub) "session opens"
                BrokerState.applyBrowserObservation "fixture" browser hub
                match BrokerState.browserLatest hub with
                | Some (Snapshot.Stale(_, _, _, detail)) -> Expect.stringContains detail "4096-entity" "browser feed refuses oversize"
                | other -> failtestf "expected browser-only stale marker, got %A" other
            | other -> failtestf "expected complete legacy snapshot, got %A" other
        }
    ]

[<Tests>]
let heartbeatTests =
    testList "BrokerState.noteHeartbeat (T015 / FR-008 + FR-011)" [

        test "first heartbeat captures plugin id and refreshes lastHeartbeatAt" {
            let hub, _ = mkHubWithAudit()
            let now = DateTimeOffset.UtcNow
            let r = BrokerState.noteHeartbeat "ai-1" now hub
            Expect.equal r (Ok ()) "first heartbeat accepted"
            Expect.equal (BrokerState.activePluginId hub) (Some "ai-1") "plugin id captured"
            Expect.equal (BrokerState.lastHeartbeatAt hub) now "lastHeartbeatAt set"
        }

        test "subsequent heartbeats with same pluginId are accepted" {
            let hub, _ = mkHubWithAudit()
            let t0 = DateTimeOffset.UtcNow
            let t1 = t0.AddSeconds(1.0)
            BrokerState.noteHeartbeat "ai-1" t0 hub |> ignore
            let r = BrokerState.noteHeartbeat "ai-1" t1 hub
            Expect.equal r (Ok ()) "second heartbeat accepted"
            Expect.equal (BrokerState.lastHeartbeatAt hub) t1 "lastHeartbeatAt advanced"
        }

        test "heartbeat from a different plugin id is rejected as NotOwner (T016 / FR-011)" {
            let hub, audit = mkHubWithAudit()
            let now = DateTimeOffset.UtcNow
            BrokerState.noteHeartbeat "ai-1" now hub |> ignore
            let r = BrokerState.noteHeartbeat "ai-2" (now.AddSeconds(1.0)) hub
            match r with
            | Error (CommandPipeline.NotOwner (attempted, owner)) ->
                Expect.equal attempted "ai-2" "attempted recorded"
                Expect.equal owner "ai-1" "owner unchanged"
            | other ->
                failtestf "expected Error NotOwner, got %A" other
            // Audit must show the rejection (T016 / FR-011 surface).
            let arr = audit.ToArray()
            let nonOwner =
                arr
                |> Array.tryFind (function
                    | Audit.AuditEvent.CoordinatorNonOwnerRejected _ -> true
                    | _ -> false)
            Expect.isSome nonOwner "CoordinatorNonOwnerRejected emitted"
        }

        test "Pinned ownerRule rejects every other plugin id immediately" {
            let hub, _ = mkHubWithAudit()
            BrokerState.setOwnerRule (BrokerState.Pinned "ai-pinned") hub
            let r = BrokerState.noteHeartbeat "ai-other" DateTimeOffset.UtcNow hub
            match r with
            | Error (CommandPipeline.NotOwner (attempted, owner)) ->
                Expect.equal attempted "ai-other" "attempted recorded"
                Expect.equal owner "ai-pinned" "pinned owner echoed"
            | other ->
                failtestf "expected NotOwner, got %A" other
        }
    ]

[<Tests>]
let commandTranslationTests =
    testList "WireConvert.tryFromCoreCommandToHighBar (T026 / T027 / FR-005)" [

        // --- T026 / gameplay arms ---------------------------------------------------

        test "Move with targetPos maps to AICommand.MoveUnit" {
            let cmd =
                mkCoreCommand
                    (CommandPipeline.Gameplay
                        (CommandPipeline.UnitOrder
                            ([5u], CommandPipeline.Move, Some { x = 10.0f; y = 20.0f }, None)))
            match WireConvert.tryFromCoreCommandToHighBar cmd 1UL with
            | Ok batch ->
                Expect.equal batch.BatchSeq 1UL "batch_seq"
                Expect.equal batch.TargetUnitId 5u "target unit id"
                let ai = firstAi batch
                match ai.Command with
                | ValueSome (AICommand.Types.Command.MoveUnit mu) ->
                    Expect.equal mu.UnitId 5 "unit id"
                    match mu.ToPosition with
                    | ValueSome p ->
                        Expect.equal p.X 10.0f "x"
                        Expect.equal p.Y 0.0f "native elevation is deliberately zero"
                        Expect.equal p.Z 20.0f "legacy ground y maps to native Z"
                    | ValueNone -> failtest "expected ToPosition"
                | other -> failtestf "expected MoveUnit, got %A" other
            | Error r -> failtestf "unexpected reject: %A" r
        }

        test "Attack with targetUnitId maps to AICommand.Attack" {
            let cmd =
                mkCoreCommand
                    (CommandPipeline.Gameplay
                        (CommandPipeline.UnitOrder
                            ([7u], CommandPipeline.Attack, None, Some 99u)))
            match WireConvert.tryFromCoreCommandToHighBar cmd 2UL with
            | Ok batch ->
                let ai = firstAi batch
                match ai.Command with
                | ValueSome (AICommand.Types.Command.Attack ac) ->
                    Expect.equal ac.UnitId 7 "attacker"
                    Expect.equal ac.TargetUnitId 99 "target"
                | other -> failtestf "expected Attack, got %A" other
            | Error r -> failtestf "unexpected reject: %A" r
        }

        test "Attack with no targetUnitId but targetPos maps to AttackArea" {
            let cmd =
                mkCoreCommand
                    (CommandPipeline.Gameplay
                        (CommandPipeline.UnitOrder
                            ([3u], CommandPipeline.Attack, Some { x = 11.0f; y = 23.0f }, None)))
            match WireConvert.tryFromCoreCommandToHighBar cmd 3UL with
            | Ok batch ->
                let ai = firstAi batch
                match ai.Command with
                | ValueSome (AICommand.Types.Command.AttackArea aa) ->
                    Expect.equal aa.UnitId 3 "unit id"
                    Expect.isGreaterThan aa.Radius 0.0f "non-zero radius"
                    match aa.AttackPosition with
                    | ValueSome p ->
                        Expect.equal p.X 11.0f "attack ground x"
                        Expect.equal p.Y 0.0f "attack elevation"
                        Expect.equal p.Z 23.0f "attack ground z"
                    | ValueNone -> failtest "expected AttackPosition"
                | other -> failtestf "expected AttackArea, got %A" other
            | Error r -> failtestf "unexpected reject: %A" r
        }

        test "Stop / Guard maps to corresponding AICommand arms" {
            for kind, targetId in [
                CommandPipeline.Stop, None
                CommandPipeline.Guard, Some 9u ] do
                let cmd =
                    mkCoreCommand
                        (CommandPipeline.Gameplay
                            (CommandPipeline.UnitOrder ([1u], kind, None, targetId)))
                match WireConvert.tryFromCoreCommandToHighBar cmd 4UL with
                | Ok batch ->
                    let ai = firstAi batch
                    match ai.Command, kind with
                    | ValueSome (AICommand.Types.Command.Stop _), CommandPipeline.Stop -> ()
                    | ValueSome (AICommand.Types.Command.Guard guard), CommandPipeline.Guard ->
                        Expect.equal guard.GuardUnitId 9 "guard target survives conversion"
                    | got, _ -> failtestf "wrong AICommand arm for %A: %A" kind got
                | Error r -> failtestf "unexpected reject for %A: %A" kind r
        }

        test "Patrol with targetPos maps to AICommand.Patrol" {
            let cmd =
                mkCoreCommand
                    (CommandPipeline.Gameplay
                        (CommandPipeline.UnitOrder
                            ([4u], CommandPipeline.Patrol, Some { x = 50.0f; y = 60.0f }, None)))
            match WireConvert.tryFromCoreCommandToHighBar cmd 5UL with
            | Ok batch ->
                let ai = firstAi batch
                match ai.Command with
                | ValueSome (AICommand.Types.Command.Patrol p) ->
                    Expect.equal p.UnitId 4 "unit id"
                    match p.ToPosition with
                    | ValueSome target ->
                        Expect.equal target.X 50.0f "patrol ground x"
                        Expect.equal target.Y 0.0f "patrol elevation"
                        Expect.equal target.Z 60.0f "patrol ground z"
                    | ValueNone -> failtest "expected ToPosition"
                | other -> failtestf "expected Patrol, got %A" other
            | Error r -> failtestf "unexpected reject: %A" r
        }

        test "Build maps to AICommand.BuildUnit with class id parsed as def id" {
            let cmd =
                mkCoreCommand
                    (CommandPipeline.Gameplay
                        (CommandPipeline.Build
                            (10u, "42", { x = 100.0f; y = 200.0f })))
            match WireConvert.tryFromCoreCommandToHighBar cmd 6UL with
            | Ok batch ->
                Expect.equal batch.TargetUnitId 10u "builder threaded as target"
                let ai = firstAi batch
                match ai.Command with
                | ValueSome (AICommand.Types.Command.BuildUnit b) ->
                    Expect.equal b.UnitId 10 "builder"
                    Expect.equal b.ToBuildUnitDefId 42 "class -> def id"
                    match b.BuildPosition with
                    | ValueSome p ->
                        Expect.equal p.X 100.0f "build ground x"
                        Expect.equal p.Y 0.0f "build elevation"
                        Expect.equal p.Z 200.0f "build ground z"
                    | ValueNone -> failtest "expected BuildPosition"
                | other -> failtestf "expected BuildUnit, got %A" other
            | Error r -> failtestf "unexpected reject: %A" r
        }

        test "Custom rejects because native semantics are not defined" {
            let cmd =
                mkCoreCommand
                    (CommandPipeline.Gameplay
                        (CommandPipeline.Custom ("ping", [| 0uy; 0uy; 0uy; 0uy |])))
            match WireConvert.tryFromCoreCommandToHighBar cmd 7UL with
            | Error (CommandPipeline.InvalidPayload _) -> ()
            | other -> failtestf "expected InvalidPayload, got %A" other
        }

        test "empty order and invalid native identifiers reject before mapping" {
            for ids in [ []; [UInt32.MaxValue] ] do
                let cmd =
                    mkCoreCommand
                        (CommandPipeline.Gameplay
                            (CommandPipeline.UnitOrder (ids, CommandPipeline.Move, Some { x = 1.0f; y = 2.0f }, None)))
                match WireConvert.tryFromCoreCommandToHighBar cmd 8UL with
                | Error (CommandPipeline.InvalidPayload _) -> ()
                | other -> failtestf "expected InvalidPayload for %A, got %A" ids other
        }

        test "multi-unit expansion is ordered, distinct and all-or-nothing" {
            let cmd =
                mkCoreCommand
                    (CommandPipeline.Gameplay
                        (CommandPipeline.UnitOrder
                            ([9u; 3u; 7u], CommandPipeline.Guard, None, Some 42u)))
            match WireConvert.tryExpandCoreCommandToHighBar cmd [101UL, 201UL; 102UL, 202UL; 103UL, 203UL] with
            | Error reason -> failtestf "unexpected reject: %A" reason
            | Ok batches ->
                Expect.sequenceEqual (batches |> List.map _.TargetUnitId) [9u; 3u; 7u] "acting-unit order is preserved"
                Expect.sequenceEqual (batches |> List.map _.BatchSeq) [101UL; 102UL; 103UL] "reserved sequences are preserved"
                Expect.sequenceEqual
                    (batches |> List.map (fun batch -> batch.ClientCommandId |> ValueOption.defaultValue 0UL))
                    [201UL; 202UL; 203UL]
                    "per-child correlations are preserved"
                for batch in batches do
                    match (firstAi batch).Command with
                    | ValueSome (AICommand.Types.Command.Guard guard) ->
                        Expect.equal guard.GuardUnitId 42 "Guard target survives every expansion"
                    | other -> failtestf "expected Guard, got %A" other

            for ids in [ [1u; 1u]; [1u .. 65u] ] do
                let invalid =
                    { cmd with
                        kind = CommandPipeline.Gameplay (CommandPipeline.UnitOrder (ids, CommandPipeline.Move, Some { x = 1.0f; y = 2.0f }, None)) }
                let allocations = ids |> List.mapi (fun i _ -> uint64 (i + 1), uint64 (i + 100))
                match WireConvert.tryExpandCoreCommandToHighBar invalid allocations with
                | Error (CommandPipeline.InvalidPayload _) -> ()
                | other -> failtestf "expected atomic validation refusal for %A, got %A" ids other
        }

        test "nonnumeric build definition and non-finite position reject" {
            let invalidKinds = [
                CommandPipeline.Build (10u, "armmex", { x = 1.0f; y = 2.0f })
                CommandPipeline.Build (10u, "42", { x = Single.NaN; y = 2.0f }) ]
            for kind in invalidKinds do
                let cmd = mkCoreCommand (CommandPipeline.Gameplay kind)
                match WireConvert.tryFromCoreCommandToHighBar cmd 8UL with
                | Error (CommandPipeline.InvalidPayload _) -> ()
                | other -> failtestf "expected InvalidPayload, got %A" other
        }

        test "Move without targetPos rejects with InvalidPayload" {
            let cmd =
                mkCoreCommand
                    (CommandPipeline.Gameplay
                        (CommandPipeline.UnitOrder ([1u], CommandPipeline.Move, None, None)))
            match WireConvert.tryFromCoreCommandToHighBar cmd 8UL with
            | Error (CommandPipeline.InvalidPayload _) -> ()
            | other -> failtestf "expected InvalidPayload, got %A" other
        }

        // --- T027 / admin arms ------------------------------------------------------

        test "Admin Pause maps to AICommand.PauseTeam(enable=true)" {
            let cmd = mkCoreCommand (CommandPipeline.Admin CommandPipeline.Pause)
            match WireConvert.tryFromCoreCommandToHighBar cmd 9UL with
            | Ok batch ->
                let ai = firstAi batch
                match ai.Command with
                | ValueSome (AICommand.Types.Command.PauseTeam p) ->
                    Expect.isTrue p.Enable "Pause -> enable=true"
                | other -> failtestf "expected PauseTeam, got %A" other
            | Error r -> failtestf "unexpected reject: %A" r
        }

        test "Admin Resume maps to AICommand.PauseTeam(enable=false)" {
            let cmd = mkCoreCommand (CommandPipeline.Admin CommandPipeline.Resume)
            match WireConvert.tryFromCoreCommandToHighBar cmd 10UL with
            | Ok batch ->
                let ai = firstAi batch
                match ai.Command with
                | ValueSome (AICommand.Types.Command.PauseTeam p) ->
                    Expect.isFalse p.Enable "Resume -> enable=false"
                | other -> failtestf "expected PauseTeam, got %A" other
            | Error r -> failtestf "unexpected reject: %A" r
        }

        test "Admin GrantResources emits two GiveMe commands (metal + energy)" {
            let cmd =
                mkCoreCommand
                    (CommandPipeline.Admin
                        (CommandPipeline.GrantResources
                            (0, { metal = 100.0; energy = 200.0 })))
            match WireConvert.tryFromCoreCommandToHighBar cmd 11UL with
            | Ok batch ->
                Expect.equal batch.Commands.Count 2 "two AICommands per GrantResources"
                let kinds =
                    batch.Commands
                    |> Seq.map (fun ai ->
                        match ai.Command with
                        | ValueSome (AICommand.Types.Command.GiveMe g) -> g.ResourceId, g.Amount
                        | _ -> -1, 0.0f)
                    |> Seq.toList
                Expect.contains kinds (0, 100.0f) "metal grant"
                Expect.contains kinds (1, 200.0f) "energy grant"
            | Error r -> failtestf "unexpected reject: %A" r
        }

        test "Admin SetSpeed rejects with AdminNotAvailable (research §3)" {
            let cmd = mkCoreCommand (CommandPipeline.Admin (CommandPipeline.SetSpeed 2.0m))
            match WireConvert.tryFromCoreCommandToHighBar cmd 12UL with
            | Error CommandPipeline.AdminNotAvailable -> ()
            | other -> failtestf "expected AdminNotAvailable, got %A" other
        }

        test "Admin OverrideVision rejects with AdminNotAvailable" {
            let cmd =
                mkCoreCommand
                    (CommandPipeline.Admin
                        (CommandPipeline.OverrideVision (0, CommandPipeline.Full)))
            match WireConvert.tryFromCoreCommandToHighBar cmd 13UL with
            | Error CommandPipeline.AdminNotAvailable -> ()
            | other -> failtestf "expected AdminNotAvailable, got %A" other
        }

        test "Admin OverrideVictory rejects with AdminNotAvailable" {
            let cmd =
                mkCoreCommand
                    (CommandPipeline.Admin
                        (CommandPipeline.OverrideVictory (0, CommandPipeline.ForceWin)))
            match WireConvert.tryFromCoreCommandToHighBar cmd 14UL with
            | Error CommandPipeline.AdminNotAvailable -> ()
            | other -> failtestf "expected AdminNotAvailable, got %A" other
        }

        test "client_command_id carries the lower 64 bits of the UUID" {
            let cmd = mkCoreCommand (CommandPipeline.Admin CommandPipeline.Pause)
            match WireConvert.tryFromCoreCommandToHighBar cmd 99UL with
            | Ok batch ->
                let bytes = cmd.commandId.ToByteArray()
                let expected = System.BitConverter.ToUInt64(bytes, 0)
                match batch.ClientCommandId with
                | ValueSome got -> Expect.equal got expected "client_command_id matches lower-64"
                | ValueNone -> failtest "expected ClientCommandId set"
            | Error r -> failtestf "unexpected reject: %A" r
        }
    ]

[<Tests>]
let outboundDeliveryTests =
    testList "bounded atomic coordinator delivery (BARC-01.1e)" [
        test "one bounded admission expands a parent and rejects overflow without partial enqueue" {
            let hub = BrokerState.create (System.Version(1, 0)) 1 ignore
            let link : Session.ProxyAiLink =
                { attachedAt = DateTimeOffset.UtcNow
                  protocolVersion = System.Version(1, 0)
                  lastSnapshotAt = None
                  keepAliveIntervalMs = 5000
                  pluginId = "delivery-test"
                  schemaVersion = "1.0.0"
                  engineSha256 = "test"
                  lastHeartbeatAt = DateTimeOffset.UtcNow
                  lastSeq = 0UL }
            Expect.equal (BrokerState.attachCoordinator link hub) (Ok ()) "coordinator attached"
            let reader =
                match BrokerState.tryClaimCoordinatorCommandChannel "test-plugin" "test-incarnation" hub with
                | BrokerState.Claimed lease -> lease.reader
                | other -> failtestf "expected reader lease, got %A" other
            let parent =
                mkCoreCommand
                    (CommandPipeline.Gameplay
                        (CommandPipeline.UnitOrder
                            ([8u; 2u; 5u], CommandPipeline.Move, Some { x = 11.0f; y = 13.0f }, None)))
            Expect.equal (BrokerState.sendToCoordinator parent hub) (Ok ()) "whole parent admitted"
            let overflow = { parent with commandId = Guid.NewGuid() }
            Expect.equal (BrokerState.sendToCoordinator overflow hub) (Error CommandPipeline.QueueFull) "full outbound queue rejects the whole second parent"
            let mutable delivery = Unchecked.defaultof<BrokerState.OutboundDelivery>
            Expect.isTrue (reader.TryRead(&delivery)) "one parent envelope was queued"
            Expect.equal delivery.parentCommandId parent.commandId "full parent UUID is retained"
            Expect.equal delivery.batches.Length 3 "one batch per acting unit"
            Expect.sequenceEqual (delivery.batches |> List.map _.TargetUnitId) [8u; 2u; 5u] "batch order"
            Expect.equal
                (delivery.batches |> List.map (fun batch -> batch.ClientCommandId |> ValueOption.defaultValue 0UL) |> Set.ofList |> Set.count)
                3
                "child correlations are collision-free"
        }

        test "repeated parent UUID still receives collision-free child identities" {
            let hub = BrokerState.create (System.Version(1, 0)) 4 ignore
            let link : Session.ProxyAiLink =
                { attachedAt = DateTimeOffset.UtcNow; protocolVersion = System.Version(1, 0); lastSnapshotAt = None
                  keepAliveIntervalMs = 5000; pluginId = "collision-test"; schemaVersion = "1.0.0"
                  engineSha256 = "test"; lastHeartbeatAt = DateTimeOffset.UtcNow; lastSeq = 0UL }
            Expect.equal (BrokerState.attachCoordinator link hub) (Ok ()) "coordinator attached"
            let reader =
                match BrokerState.tryClaimCoordinatorCommandChannel "test-plugin" "test-incarnation" hub with
                | BrokerState.Claimed lease -> lease.reader
                | other -> failtestf "expected reader lease, got %A" other
            let parent =
                mkCoreCommand
                    (CommandPipeline.Gameplay
                        (CommandPipeline.UnitOrder ([3u; 4u], CommandPipeline.Stop, None, None)))
            Expect.equal (BrokerState.sendToCoordinator parent hub) (Ok ()) "first parent admitted"
            Expect.equal (BrokerState.sendToCoordinator parent hub) (Ok ()) "duplicate parent identity admitted with fresh child identities"
            let read () =
                let mutable delivery = Unchecked.defaultof<BrokerState.OutboundDelivery>
                Expect.isTrue (reader.TryRead(&delivery)) "delivery available"
                delivery
            let first = read ()
            let second = read ()
            let correlations (delivery: BrokerState.OutboundDelivery) =
                delivery.batches
                |> List.map (fun batch -> batch.ClientCommandId |> ValueOption.defaultValue 0UL)
                |> Set.ofList
            Expect.isEmpty (Set.intersect (correlations first) (correlations second)) "duplicate parents cannot collide"
            Expect.sequenceEqual (first.batches |> List.map _.BatchSeq) [1UL; 2UL] "first range"
            Expect.sequenceEqual (second.batches |> List.map _.BatchSeq) [3UL; 4UL] "second range"
        }

        test "native results correlate multiple children and callers and backlog without a subscriber" {
            let hub, audit = mkHubWithAudit ()
            let link : Session.ProxyAiLink =
                { attachedAt = DateTimeOffset.UtcNow; protocolVersion = System.Version(1, 0); lastSnapshotAt = None
                  keepAliveIntervalMs = 5000; pluginId = "result-owner"; schemaVersion = "1.0.0"
                  engineSha256 = "test"; lastHeartbeatAt = DateTimeOffset.UtcNow; lastSeq = 0UL }
            Expect.equal (BrokerState.attachCoordinator link hub) (Ok ()) "coordinator attached"
            let lease =
                match BrokerState.tryClaimCoordinatorCommandChannel "result-owner" "inc-1" hub with
                | BrokerState.Claimed lease -> lease
                | other -> failtestf "expected lease: %A" other
            let alpha = ScriptingClientId "alpha"
            let beta = ScriptingClientId "beta"
            let alphaClient =
                BrokerState.registerClient alpha (System.Version(1, 0)) DateTimeOffset.UtcNow hub
                |> function Ok client -> client | Error error -> failtestf "alpha registration: %A" error
            let betaClient =
                BrokerState.registerClient beta (System.Version(1, 0)) DateTimeOffset.UtcNow hub
                |> function Ok client -> client | Error error -> failtestf "beta registration: %A" error
            let alphaParent =
                { mkCoreCommand (CommandPipeline.Gameplay (CommandPipeline.UnitOrder ([4u; 9u], CommandPipeline.Stop, None, None))) with
                    originatingClient = alpha }
            let betaParent =
                { mkCoreCommand (CommandPipeline.Admin CommandPipeline.Pause) with originatingClient = beta }
            Expect.equal (BrokerState.sendToCoordinator alphaParent hub) (Ok ()) "alpha parent admitted"
            Expect.equal (BrokerState.sendToCoordinator betaParent hub) (Ok ()) "beta parent admitted"
            let readDelivery () =
                let mutable delivery = Unchecked.defaultof<BrokerState.OutboundDelivery>
                Expect.isTrue (lease.reader.TryRead(&delivery)) "delivery available"
                delivery
            let alphaDelivery = readDelivery ()
            let betaDelivery = readDelivery ()
            for index in 0 .. alphaDelivery.batches.Length - 1 do
                BrokerState.registerPendingNativeResult lease alphaDelivery index hub
                |> function Ok _ -> () | Error error -> failtest error
            BrokerState.registerPendingNativeResult lease betaDelivery 0 hub
            |> function Ok _ -> () | Error error -> failtest error

            let report status (batch: CommandBatch) =
                let result = CommandBatchResult.empty()
                result.BatchSeq <- batch.BatchSeq
                result.ClientCommandId <- batch.ClientCommandId |> ValueOption.defaultValue 0UL
                result.Status <- status
                result.AcceptedCommandCount <- if status = CommandBatchStatus.CommandBatchAccepted then 1u else 0u
                result
            let accepted = report CommandBatchStatus.CommandBatchAccepted alphaDelivery.batches[0]
            let rejected = report CommandBatchStatus.CommandBatchRejectedQueueFull alphaDelivery.batches[1]
            Expect.equal (BrokerState.reportNativeResult "intruder" "inc-1" accepted hub) BrokerState.Late "wrong owner cannot complete pending work"
            Expect.equal (BrokerState.reportNativeResult "result-owner" "inc-1" accepted hub) BrokerState.Recorded "accepted child records"
            Expect.equal (BrokerState.reportNativeResult "result-owner" "inc-1" rejected hub) BrokerState.Recorded "rejected child records"
            Expect.equal (BrokerState.reportNativeResult "result-owner" "inc-1" accepted hub) BrokerState.Duplicate "exact report retry is duplicate"
            Expect.equal (BrokerState.reportNativeResult "result-owner" "wrong-inc" accepted hub) BrokerState.Late "wrong incarnation is late"
            let betaBatch = betaDelivery.batches[0]
            BrokerState.expirePendingNativeResult "inc-1" betaBatch.BatchSeq (betaBatch.ClientCommandId |> ValueOption.defaultValue 0UL) "fixture cancellation after forwarding" hub

            let drain client =
                let channel = Channel.CreateUnbounded<FSBarV2.Broker.Contracts.StateMsg>()
                BrokerState.subscribeState client channel hub
                let results = ResizeArray<FSBarV2.Broker.Contracts.NativeCommandResult>()
                let mutable message = Unchecked.defaultof<FSBarV2.Broker.Contracts.StateMsg>
                while channel.Reader.TryRead(&message) do
                    match message.Body with
                    | ValueSome (FSBarV2.Broker.Contracts.StateMsg.Types.Body.NativeCommandResult result) -> results.Add result
                    | _ -> ()
                results |> Seq.toList
            let alphaResults = drain alphaClient
            let betaResults = drain betaClient
            Expect.sequenceEqual (alphaResults |> List.map _.ChildIndex) [0u; 1u] "multi-child order is retained"
            Expect.sequenceEqual
                (alphaResults |> List.map _.Status)
                [ FSBarV2.Broker.Contracts.NativeCommandResultStatus.NativeCommandAccepted
                  FSBarV2.Broker.Contracts.NativeCommandResultStatus.NativeCommandRejectedQueueFull ]
                "accepted and rejected results are distinct"
            Expect.equal (Guid(alphaResults[0].ParentCommandId.ToByteArray())) alphaParent.commandId "alpha parent UUID survives"
            Expect.equal betaResults.Length 1 "second caller receives only its own result"
            Expect.equal betaResults[0].OriginatingClient "beta" "second caller identity survives"
            Expect.equal betaResults[0].Status FSBarV2.Broker.Contracts.NativeCommandResultStatus.NativeCommandUnknown "cancellation is UNKNOWN"
            Expect.isTrue
                (audit.ToArray() |> Array.exists (function Audit.CoordinatorNativeCommandResult (_, _, _, parent, _, _, _, _, _, _, Audit.NativeUnknown, _, _) when parent = betaParent.commandId -> true | _ -> false))
                "unknown terminal result is typed audit evidence"
        }

        test "bounded terminal retention refuses before forwarding and preserves every accepted outcome" {
            let hub = BrokerState.create (System.Version(1, 0)) 1 ignore
            let link : Session.ProxyAiLink =
                { attachedAt = DateTimeOffset.UtcNow; protocolVersion = System.Version(1, 0); lastSnapshotAt = None
                  keepAliveIntervalMs = 5000; pluginId = "retention-owner"; schemaVersion = "1.0.0"
                  engineSha256 = "test"; lastHeartbeatAt = DateTimeOffset.UtcNow; lastSeq = 0UL }
            Expect.equal (BrokerState.attachCoordinator link hub) (Ok ()) "coordinator attached"
            let clientId = ScriptingClientId "slow-client"
            let client =
                BrokerState.registerClient clientId (System.Version(1, 0)) DateTimeOffset.UtcNow hub
                |> function Ok value -> value | Error error -> failtestf "register: %A" error
            let lease =
                match BrokerState.tryClaimCoordinatorCommandChannel "retention-owner" "retention-inc" hub with
                | BrokerState.Claimed value -> value
                | other -> failtestf "claim: %A" other
            let accepted = ResizeArray<CommandBatch>()
            for _ in 1 .. 8 do
                let command =
                    { mkCoreCommand (CommandPipeline.Admin CommandPipeline.Pause) with
                        originatingClient = clientId }
                Expect.equal (BrokerState.sendToCoordinator command hub) (Ok ()) "capacity is reserved before forwarding"
                let mutable delivery = Unchecked.defaultof<BrokerState.OutboundDelivery>
                Expect.isTrue (lease.reader.TryRead(&delivery)) "accepted parent is forwarded"
                BrokerState.registerPendingNativeResult lease delivery 0 hub
                |> function Ok _ -> () | Error error -> failtest error
                let batch = delivery.batches.Head
                accepted.Add batch
                let result = CommandBatchResult.empty()
                result.BatchSeq <- batch.BatchSeq
                result.ClientCommandId <- batch.ClientCommandId |> ValueOption.defaultValue 0UL
                result.Status <- CommandBatchStatus.CommandBatchAccepted
                result.AcceptedCommandCount <- 1u
                Expect.equal
                    (BrokerState.reportNativeResult "retention-owner" "retention-inc" result hub)
                    BrokerState.Recorded
                    "native admission completes"
            let overflow =
                { mkCoreCommand (CommandPipeline.Admin CommandPipeline.Pause) with
                    originatingClient = clientId }
            Expect.equal (BrokerState.sendToCoordinator overflow hub) (Error CommandPipeline.QueueFull) "retention exhaustion refuses admission"
            let mutable unexpected = Unchecked.defaultof<BrokerState.OutboundDelivery>
            Expect.isFalse (lease.reader.TryRead(&unexpected)) "refused work never reaches the native channel"
            for batch in accepted do
                let dispatch = CommandDispatchEvent.empty()
                dispatch.BatchSeq <- batch.BatchSeq
                dispatch.ClientCommandId <- batch.ClientCommandId |> ValueOption.defaultValue 0UL
                dispatch.ChannelIncarnation <- "retention-inc"
                dispatch.CommandIndex <- 0u
                dispatch.TargetUnitId <- batch.TargetUnitId
                dispatch.Status <- CommandDispatchStatus.CommandDispatchApplied
                Expect.isTrue (BrokerState.noteNativeDispatch dispatch hub) "reserved dispatch outcome is retained"
            let channel = Channel.CreateUnbounded<FSBarV2.Broker.Contracts.StateMsg>()
            BrokerState.subscribeState client channel hub
            let mutable admissionCount = 0
            let mutable dispatchCount = 0
            let mutable message = Unchecked.defaultof<FSBarV2.Broker.Contracts.StateMsg>
            while channel.Reader.TryRead(&message) do
                match message.Body with
                | ValueSome (FSBarV2.Broker.Contracts.StateMsg.Types.Body.NativeCommandResult _) -> admissionCount <- admissionCount + 1
                | ValueSome (FSBarV2.Broker.Contracts.StateMsg.Types.Body.NativeCommandDispatch _) -> dispatchCount <- dispatchCount + 1
                | _ -> ()
            Expect.equal admissionCount 8 "every accepted admission outcome survives a missing subscriber"
            Expect.equal dispatchCount 8 "every terminal execution outcome survives a missing subscriber"
            Expect.equal (BrokerState.sendToCoordinator overflow hub) (Ok ()) "draining retained outcomes releases admission capacity"
        }

        test "a coordinator session grants exactly one reader lease" {
            let hub = BrokerState.create (System.Version(1, 0)) 4 ignore
            let link : Session.ProxyAiLink =
                { attachedAt = DateTimeOffset.UtcNow; protocolVersion = System.Version(1, 0); lastSnapshotAt = None
                  keepAliveIntervalMs = 5000; pluginId = "lease-test"; schemaVersion = "1.0.0"
                  engineSha256 = "test"; lastHeartbeatAt = DateTimeOffset.UtcNow; lastSeq = 0UL }
            Expect.equal (BrokerState.attachCoordinator link hub) (Ok ()) "coordinator attached"
            let oldReader =
                match BrokerState.tryClaimCoordinatorCommandChannel "test-plugin" "test-incarnation" hub with
                | BrokerState.Claimed lease -> lease.reader
                | other -> failtestf "first reader should claim: %A" other
            Expect.equal (BrokerState.tryClaimCoordinatorCommandChannel "test-plugin" "test-incarnation-2" hub) BrokerState.AlreadyClaimed "second reader is refused"
            BrokerState.closeSession Session.OperatorTerminated DateTimeOffset.UtcNow hub
            Expect.equal (BrokerState.tryClaimCoordinatorCommandChannel "test-plugin" "test-incarnation-2" hub) BrokerState.NoCoordinator "closed session cannot be claimed"
            let replacement = { link with attachedAt = DateTimeOffset.UtcNow; pluginId = "lease-test-2" }
            Expect.equal (BrokerState.attachCoordinator replacement hub) (Ok ()) "replacement coordinator attached"
            let newReader =
                match BrokerState.tryClaimCoordinatorCommandChannel "test-plugin-2" "test-incarnation-2" hub with
                | BrokerState.Claimed lease -> lease.reader
                | other -> failtestf "replacement reader should claim its own channel: %A" other
            let command = mkCoreCommand (CommandPipeline.Admin CommandPipeline.Pause)
            Expect.equal (BrokerState.sendToCoordinator command hub) (Ok ()) "replacement delivery admitted"
            let mutable stale = Unchecked.defaultof<BrokerState.OutboundDelivery>
            Expect.isFalse (oldReader.TryRead(&stale)) "old lease cannot consume replacement delivery"
            let mutable current = Unchecked.defaultof<BrokerState.OutboundDelivery>
            Expect.isTrue (newReader.TryRead(&current)) "replacement lease receives replacement delivery"
            Expect.equal current.parentCommandId command.commandId "replacement channel identity"
        }

        test "stale reader cleanup cannot close a renewed channel in the same session" {
            let hub = BrokerState.create (System.Version(1, 0)) 4 ignore
            let link : Session.ProxyAiLink =
                { attachedAt = DateTimeOffset.UtcNow; protocolVersion = System.Version(1, 0); lastSnapshotAt = None
                  keepAliveIntervalMs = 5000; pluginId = "renewal-test"; schemaVersion = "1.0.0"
                  engineSha256 = "test"; lastHeartbeatAt = DateTimeOffset.UtcNow; lastSeq = 0UL }
            Expect.equal (BrokerState.attachCoordinator link hub) (Ok ()) "coordinator attached"
            let oldLease =
                match BrokerState.tryClaimCoordinatorCommandChannel "test-plugin" "test-incarnation" hub with
                | BrokerState.Claimed lease -> lease
                | other -> failtestf "old lease missing: %A" other
            BrokerState.completeCoordinatorCommandChannel oldLease.sessionId "normal completion" hub
            Expect.isTrue (BrokerState.ensureCoordinatorCommandChannel hub) "live session renewed its empty channel"
            let newLease =
                match BrokerState.tryClaimCoordinatorCommandChannel "test-plugin" "test-incarnation-2" hub with
                | BrokerState.Claimed lease -> lease
                | other -> failtestf "new lease missing: %A" other
            BrokerState.closeCoordinatorCommandChannel oldLease.leaseId "late old-reader cleanup" hub
            Expect.isTrue (BrokerState.hasCoordinatorCommandChannel hub) "old lease cannot close renewed channel"
            let command = mkCoreCommand (CommandPipeline.Admin CommandPipeline.Pause)
            Expect.equal (BrokerState.sendToCoordinator command hub) (Ok ()) "renewed channel remains writable"
            let mutable delivery = Unchecked.defaultof<BrokerState.OutboundDelivery>
            Expect.isTrue (newLease.reader.TryRead(&delivery)) "renewed reader receives command"
        }

        test "operator-path outbound refusal is audited" {
            let hub, audit = mkHubWithAudit ()
            let command = mkCoreCommand (CommandPipeline.Admin CommandPipeline.Pause)
            match BrokerState.sendToCoordinator command hub with
            | Error (CommandPipeline.InvalidPayload detail) ->
                Expect.stringContains detail "no active coordinator" "actionable refusal"
            | other -> failtestf "expected no-coordinator refusal, got %A" other
            Expect.isTrue
                (audit.ToArray()
                 |> Array.exists (function
                    | Audit.CommandRejected (_, client, commandId, CommandPipeline.InvalidPayload _)
                        when client = command.originatingClient && commandId = command.commandId -> true
                    | _ -> false))
                "operator refusal is retained in audit"
        }

        testAsync "pre-write cancellation records every child NotAttempted" {
            let hub, audit = mkHubWithAudit ()
            let service = HighBarCoordinatorService.create hub HighBarCoordinatorService.defaultConfig
            let link : Session.ProxyAiLink =
                { attachedAt = DateTimeOffset.UtcNow; protocolVersion = System.Version(1, 0); lastSnapshotAt = None
                  keepAliveIntervalMs = 5000; pluginId = "cancel-test"; schemaVersion = "1.0.0"
                  engineSha256 = "test"; lastHeartbeatAt = DateTimeOffset.UtcNow; lastSeq = 0UL }
            Expect.equal (BrokerState.attachCoordinator link hub) (Ok ()) "coordinator attached"
            let reader =
                match BrokerState.tryClaimCoordinatorCommandChannel "test-plugin" "test-incarnation" hub with
                | BrokerState.Claimed lease -> lease.reader
                | other -> failtestf "expected reader lease, got %A" other
            let parent =
                mkCoreCommand
                    (CommandPipeline.Gameplay
                        (CommandPipeline.UnitOrder ([10u; 11u], CommandPipeline.Stop, None, None)))
            Expect.equal (BrokerState.sendToCoordinator parent hub) (Ok ()) "parent admitted"
            let cancelledLater = { parent with commandId = Guid.NewGuid() }
            Expect.equal (BrokerState.sendToCoordinator cancelledLater hub) (Ok ()) "later parent admitted"
            let mutable delivery = Unchecked.defaultof<BrokerState.OutboundDelivery>
            Expect.isTrue (reader.TryRead(&delivery)) "delivery available"
            use cancelled = new CancellationTokenSource()
            cancelled.Cancel()
            let mutable writes = 0
            let! result =
                HighBarCoordinatorService.writeDelivery service (fun _ -> writes <- writes + 1; Task.CompletedTask) cancelled.Token delivery
                |> Async.AwaitTask
            Expect.equal result (Some "cancelled") "cancelled writer stops"
            Expect.equal writes 0 "no child write was attempted"
            BrokerState.completeCoordinatorCommandChannel delivery.sessionId "cancelled" hub
            let outcomes =
                audit.ToArray()
                |> Array.choose (function
                    | Audit.CoordinatorCommandDelivery (_, _, _, parentId, _, _, _, _, _, outcome, _)
                        when parentId = parent.commandId -> Some outcome
                    | _ -> None)
            Expect.sequenceEqual outcomes [Audit.NotAttempted; Audit.NotAttempted] "every child remains explicit"
            let laterOutcomes =
                audit.ToArray()
                |> Array.choose (function
                    | Audit.CoordinatorCommandDelivery (_, _, _, parentId, _, _, _, _, _, outcome, _)
                        when parentId = cancelledLater.commandId -> Some outcome
                    | _ -> None)
            Expect.sequenceEqual laterOutcomes [Audit.NotAttempted; Audit.NotAttempted] "cancellation drains later accepted parents"
        }

        testAsync "writer failure records WrittenToTransport, Unknown and NotAttempted without retry" {
            let hub, audit = mkHubWithAudit ()
            let service = HighBarCoordinatorService.create hub HighBarCoordinatorService.defaultConfig
            let link : Session.ProxyAiLink =
                { attachedAt = DateTimeOffset.UtcNow
                  protocolVersion = System.Version(1, 0)
                  lastSnapshotAt = None
                  keepAliveIntervalMs = 5000
                  pluginId = "failure-test"
                  schemaVersion = "1.0.0"
                  engineSha256 = "test"
                  lastHeartbeatAt = DateTimeOffset.UtcNow
                  lastSeq = 0UL }
            Expect.equal (BrokerState.attachCoordinator link hub) (Ok ()) "coordinator attached"
            let reader =
                match BrokerState.tryClaimCoordinatorCommandChannel "test-plugin" "test-incarnation" hub with
                | BrokerState.Claimed lease -> lease.reader
                | other -> failtestf "expected reader lease, got %A" other
            let parent =
                mkCoreCommand
                    (CommandPipeline.Gameplay
                        (CommandPipeline.UnitOrder
                            ([1u; 2u; 3u], CommandPipeline.Stop, None, None)))
            Expect.equal (BrokerState.sendToCoordinator parent hub) (Ok ()) "parent admitted"
            let laterParent =
                { parent with
                    commandId = Guid.NewGuid()
                    kind = CommandPipeline.Gameplay (CommandPipeline.UnitOrder ([7u; 8u], CommandPipeline.Stop, None, None)) }
            Expect.equal (BrokerState.sendToCoordinator laterParent hub) (Ok ()) "later parent admitted"
            let mutable delivery = Unchecked.defaultof<BrokerState.OutboundDelivery>
            Expect.isTrue (reader.TryRead(&delivery)) "delivery available"
            let mutable writes = 0
            let writer (_: CommandBatch) =
                writes <- writes + 1
                if writes = 2 then Task.FromException(Exception("injected writer failure"))
                else Task.CompletedTask
            let! result = HighBarCoordinatorService.writeDelivery service writer CancellationToken.None delivery |> Async.AwaitTask
            Expect.isSome result "writer failure terminates this delivery"
            Expect.equal writes 2 "failed child is not replayed and later child is not attempted"
            BrokerState.completeCoordinatorCommandChannel delivery.sessionId "injected writer failure" hub
            let outcomes =
                audit.ToArray()
                |> Array.choose (function
                    | Audit.CoordinatorCommandDelivery (_, _, client, parentId, index, childCount, actingUnit, _, _, outcome, _)
                        when parentId = parent.commandId -> Some (client, index, childCount, actingUnit, outcome)
                    | _ -> None)
                |> Array.toList
            Expect.equal outcomes
                [ parent.originatingClient, 0, 3, 1u, Audit.WrittenToTransport
                  parent.originatingClient, 1, 3, 2u, Audit.Unknown
                  parent.originatingClient, 2, 3, 3u, Audit.NotAttempted ]
                "transport outcomes retain client, child cardinality and acting-unit mapping"
            let laterOutcomes =
                audit.ToArray()
                |> Array.choose (function
                    | Audit.CoordinatorCommandDelivery (_, _, _, parentId, _, _, _, _, _, outcome, _)
                        when parentId = laterParent.commandId -> Some outcome
                    | _ -> None)
            Expect.sequenceEqual laterOutcomes [Audit.NotAttempted; Audit.NotAttempted] "writer failure drains later accepted parents"
        }

        testAsync "session replacement marks every unwritten child NotAttempted" {
            let hub, audit = mkHubWithAudit ()
            let service = HighBarCoordinatorService.create hub HighBarCoordinatorService.defaultConfig
            let link : Session.ProxyAiLink =
                { attachedAt = DateTimeOffset.UtcNow; protocolVersion = System.Version(1, 0); lastSnapshotAt = None
                  keepAliveIntervalMs = 5000; pluginId = "replacement-test"; schemaVersion = "1.0.0"
                  engineSha256 = "test"; lastHeartbeatAt = DateTimeOffset.UtcNow; lastSeq = 0UL }
            Expect.equal (BrokerState.attachCoordinator link hub) (Ok ()) "coordinator attached"
            let reader =
                match BrokerState.tryClaimCoordinatorCommandChannel "test-plugin" "test-incarnation" hub with
                | BrokerState.Claimed lease -> lease.reader
                | other -> failtestf "expected reader lease, got %A" other
            let parent =
                mkCoreCommand
                    (CommandPipeline.Gameplay
                        (CommandPipeline.UnitOrder ([4u; 6u], CommandPipeline.Stop, None, None)))
            Expect.equal (BrokerState.sendToCoordinator parent hub) (Ok ()) "parent admitted"
            let queued = { parent with commandId = Guid.NewGuid() }
            Expect.equal (BrokerState.sendToCoordinator queued hub) (Ok ()) "second parent admitted"
            let mutable delivery = Unchecked.defaultof<BrokerState.OutboundDelivery>
            Expect.isTrue (reader.TryRead(&delivery)) "delivery available"
            BrokerState.closeSession Session.OperatorTerminated DateTimeOffset.UtcNow hub
            let mutable writes = 0
            let! result =
                HighBarCoordinatorService.writeDelivery service (fun _ -> writes <- writes + 1; Task.CompletedTask) CancellationToken.None delivery
                |> Async.AwaitTask
            Expect.equal result (Some "session-replaced") "stale session is refused"
            Expect.equal writes 0 "no stale child is written"
            let outcomes =
                audit.ToArray()
                |> Array.choose (function
                    | Audit.CoordinatorCommandDelivery (_, _, _, parentId, _, _, _, _, _, outcome, _)
                        when parentId = parent.commandId -> Some outcome
                    | _ -> None)
            Expect.sequenceEqual outcomes [Audit.NotAttempted; Audit.NotAttempted] "all stale children are explicit"
            let queuedOutcomes =
                audit.ToArray()
                |> Array.choose (function
                    | Audit.CoordinatorCommandDelivery (_, _, _, parentId, _, _, _, _, _, outcome, _)
                        when parentId = queued.commandId -> Some outcome
                    | _ -> None)
            Expect.sequenceEqual queuedOutcomes [Audit.NotAttempted; Audit.NotAttempted] "closure drains later accepted parents"
        }
    ]
