namespace Broker.Protocol

open System
open Broker.Core
open FSBarV2.Broker.Contracts

module WireConvert =

    let private bytesToGuid (bs: Google.Protobuf.ByteString) : Guid =
        if bs.Length <> 16 then Guid.Empty
        else Guid(bs.ToByteArray())

    let private guidToBytes (g: Guid) : Google.Protobuf.ByteString =
        Google.Protobuf.ByteString.CopyFrom(g.ToByteArray())

    let private toCoreVecOpt (v: ValueOption<Vec2>) : Snapshot.Vec2 =
        match v with
        | ValueSome v -> { x = v.X; y = v.Y }
        | ValueNone -> { x = 0.0f; y = 0.0f }

    let private fromCoreVec (v: Snapshot.Vec2) : Vec2 =
        let w = Vec2.empty()
        w.X <- v.x
        w.Y <- v.y
        w

    let private toCoreResOpt (r: ValueOption<ResourceVector>) : Snapshot.ResourceVector =
        match r with
        | ValueSome r -> { metal = r.Metal; energy = r.Energy }
        | ValueNone -> { metal = 0.0; energy = 0.0 }

    let private fromCoreResources (r: Snapshot.ResourceVector) : ResourceVector =
        let w = ResourceVector.empty()
        w.Metal <- r.metal
        w.Energy <- r.energy
        w

    let private toCoreEconOpt (e: ValueOption<EconomyStats>) : Snapshot.EconomyStats =
        match e with
        | ValueSome e -> { income = toCoreResOpt e.Income; expenditure = toCoreResOpt e.Expenditure }
        | ValueNone -> { income = { metal = 0.0; energy = 0.0 }; expenditure = { metal = 0.0; energy = 0.0 } }

    let private fromCoreEconomy (e: Snapshot.EconomyStats) : EconomyStats =
        let w = EconomyStats.empty()
        w.Income <- ValueSome (fromCoreResources e.income)
        w.Expenditure <- ValueSome (fromCoreResources e.expenditure)
        w

    let private toCorePlayer (p: PlayerTelemetry) : Snapshot.PlayerTelemetry =
        { playerId = p.PlayerId
          teamId = p.TeamId
          name = p.Name
          resources = toCoreResOpt p.Resources
          unitCount = int p.UnitCount
          buildingCount = int p.BuildingCount
          unitClassBreakdown =
              p.UnitClassBreakdown
              |> Seq.map (fun kv -> kv.Key, int kv.Value)
              |> Map.ofSeq
          economy = toCoreEconOpt p.Economy
          kills = int p.Kills
          losses = int p.Losses }

    let private fromCorePlayer (p: Snapshot.PlayerTelemetry) : PlayerTelemetry =
        let w = PlayerTelemetry.empty()
        w.PlayerId <- p.playerId
        w.TeamId <- p.teamId
        w.Name <- p.name
        w.Resources <- ValueSome (fromCoreResources p.resources)
        w.UnitCount <- uint32 p.unitCount
        w.BuildingCount <- uint32 p.buildingCount
        for KeyValue(k, v) in p.unitClassBreakdown do
            w.UnitClassBreakdown[k] <- uint32 v
        w.Economy <- ValueSome (fromCoreEconomy p.economy)
        w.Kills <- uint32 p.kills
        w.Losses <- uint32 p.losses
        w

    let private toCoreUnit (u: Unit) : Snapshot.Unit =
        { id = u.Id
          classId = u.ClassId
          ownerPlayerId = u.OwnerPlayerId
          pos = toCoreVecOpt u.Pos }

    let private toCoreBuilding (b: Building) : Snapshot.Building =
        { id = b.Id
          classId = b.ClassId
          ownerPlayerId = b.OwnerPlayerId
          pos = toCoreVecOpt b.Pos }

    let private fromCoreUnit (u: Snapshot.Unit) : Unit =
        let w = Unit.empty()
        w.Id <- u.id
        w.ClassId <- u.classId
        w.OwnerPlayerId <- u.ownerPlayerId
        w.Pos <- ValueSome (fromCoreVec u.pos)
        w

    let private fromCoreBuilding (b: Snapshot.Building) : Building =
        let w = Building.empty()
        w.Id <- b.id
        w.ClassId <- b.classId
        w.OwnerPlayerId <- b.ownerPlayerId
        w.Pos <- ValueSome (fromCoreVec b.pos)
        w

    let private fromCoreFeature (f: Snapshot.Feature) : Feature =
        let w = Feature.empty()
        w.Id <- f.id
        w.Kind <- f.kind
        w.Pos <- ValueSome (fromCoreVec f.pos)
        w

    let private toCoreMapMetaOpt (m: ValueOption<MapMeta>) : Snapshot.MapMeta option =
        match m with
        | ValueSome m ->
            Some
                { mapName = m.MapName
                  size = toCoreVecOpt m.Size
                  outline = m.Outline.ToByteArray() }
        | ValueNone -> None

    let fromCoreSnapshot (snapshot: Snapshot.GameStateSnapshot) : GameStateSnapshot =
        let w = GameStateSnapshot.empty()
        w.SessionId <- guidToBytes snapshot.sessionId
        w.Tick <- snapshot.tick
        w.CapturedAtUnixMs <- snapshot.capturedAt.ToUnixTimeMilliseconds()
        for p in snapshot.players do
            w.Players.Add(fromCorePlayer p)
        for u in snapshot.units do
            w.Units.Add(fromCoreUnit u)
        for b in snapshot.buildings do
            w.Buildings.Add(fromCoreBuilding b)
        for f in snapshot.features do
            w.Features.Add(fromCoreFeature f)
        match snapshot.mapMeta with
        | None -> ()
        | Some m ->
            let mw = MapMeta.empty()
            mw.MapName <- m.mapName
            mw.Size <- ValueSome (fromCoreVec m.size)
            mw.Outline <- Google.Protobuf.ByteString.CopyFrom(m.outline)
            w.MapMeta <- ValueSome mw
        w

    let toCoreVersion (msg: ProtocolVersion) : Version =
        Version(int msg.Major, int msg.Minor)

    let toCoreVersionOpt (msg: ValueOption<ProtocolVersion>) : Version =
        match msg with
        | ValueSome v -> toCoreVersion v
        | ValueNone -> Version(0, 0)

    let fromCoreVersion (version: Version) : ProtocolVersion =
        let w = ProtocolVersion.empty()
        w.Major <- uint32 (max 0 version.Major)
        w.Minor <- uint32 (max 0 version.Minor)
        w

    let private invalid detail = Error (CommandPipeline.InvalidPayload detail)

    let private finite32 (value: float32) = not (Single.IsNaN value || Single.IsInfinity value)

    let private finite64 (value: float) = not (Double.IsNaN value || Double.IsInfinity value)

    let private validPosition (name: string) (pos: ValueOption<Vec2>) : Result<Snapshot.Vec2, CommandPipeline.RejectReason> =
        match pos with
        | ValueSome p when finite32 p.X && finite32 p.Y -> Ok { x = p.X; y = p.Y }
        | ValueSome _ -> invalid (name + " has non-finite coordinates")
        | ValueNone -> invalid (name + " is required")

    let private validNativeId (name: string) (id: uint32) : Result<unit, CommandPipeline.RejectReason> =
        if id > uint32 Int32.MaxValue then invalid (name + " exceeds the native signed identifier range")
        else Ok ()

    let private toCoreOrderKind (k: UnitOrder.Types.OrderKind) : Result<CommandPipeline.OrderKind, CommandPipeline.RejectReason> =
        match k with
        | UnitOrder.Types.OrderKind.Move    -> Ok CommandPipeline.Move
        | UnitOrder.Types.OrderKind.Attack  -> Ok CommandPipeline.Attack
        | UnitOrder.Types.OrderKind.Stop    -> Ok CommandPipeline.Stop
        | UnitOrder.Types.OrderKind.Guard   -> Ok CommandPipeline.Guard
        | UnitOrder.Types.OrderKind.Patrol  -> Ok CommandPipeline.Patrol
        | _                                 -> invalid "unknown unit order"

    let private toCoreVision (m: VisionMode) : CommandPipeline.VisionMode =
        match m with
        | VisionMode.Full   -> CommandPipeline.Full
        | VisionMode.Blind  -> CommandPipeline.Blind
        | _                 -> CommandPipeline.Normal

    let private toCoreVictory (m: VictoryOverride) : CommandPipeline.VictoryOverride =
        match m with
        | VictoryOverride.ForceWin   -> CommandPipeline.ForceWin
        | VictoryOverride.ForceLose  -> CommandPipeline.ForceLose
        | _                          -> CommandPipeline.Reset

    let private toCoreGameplay (gp: GameplayPayload) : Result<CommandPipeline.GameplayPayload, CommandPipeline.RejectReason> =
        match gp.Body with
        | ValueSome (GameplayPayload.Types.Body.UnitOrder uo) ->
            let ids = uo.UnitIds |> List.ofSeq
            let targetUnit = if uo.TargetUnitId = 0u then None else Some uo.TargetUnitId
            let targetPos =
                match uo.TargetPos with
                | ValueSome p when finite32 p.X && finite32 p.Y -> Ok (Some { Snapshot.x = p.X; Snapshot.y = p.Y })
                | ValueSome _ -> invalid "target position has non-finite coordinates"
                | ValueNone -> Ok None
            match ids with
            | _ when ids.Length >= 1 && ids.Length <= 64 && (ids |> Set.ofList |> Set.count) = ids.Length ->
                ids
                |> List.fold (fun state unitId -> state |> Result.bind (fun () -> validNativeId "unit id" unitId)) (Ok ())
                |> Result.bind (fun () -> toCoreOrderKind uo.Kind)
                |> Result.bind (fun kind ->
                    targetPos |> Result.bind (fun pos ->
                        let targetCheck =
                            match targetUnit with
                            | Some id -> validNativeId "target unit id" id
                            | None -> Ok ()
                        targetCheck |> Result.bind (fun () ->
                            match kind, pos, targetUnit with
                            | CommandPipeline.Move, Some _, None
                            | CommandPipeline.Patrol, Some _, None
                            | CommandPipeline.Stop, None, None
                            | CommandPipeline.Attack, Some _, None
                            | CommandPipeline.Attack, None, Some _
                            | CommandPipeline.Guard, None, Some _ ->
                                Ok (CommandPipeline.UnitOrder (ids, kind, pos, targetUnit))
                            | _ -> invalid (sprintf "%A has missing or ambiguous target fields" kind))))
            | [] -> invalid "unit order has no acting unit"
            | _ when ids.Length > 64 -> invalid "unit order exceeds the 64 acting-unit limit"
            | _ -> invalid "unit order acting units must be distinct"
        | ValueSome (GameplayPayload.Types.Body.Build bo) ->
            validNativeId "builder id" bo.BuilderId
            |> Result.bind (fun () -> validPosition "build position" bo.Pos)
            |> Result.bind (fun pos ->
                let mutable defId = 0
                if Int32.TryParse(bo.ClassId, &defId) && defId > 0 then
                    Ok (CommandPipeline.Build (bo.BuilderId, bo.ClassId, pos))
                else invalid "build class id must be a positive native definition id")
        | ValueSome (GameplayPayload.Types.Body.Custom _) -> invalid "custom gameplay commands have no supported native mapping"
        | ValueNone -> invalid "gameplay command body is missing"

    let private toCoreAdmin (ap: AdminPayload) : Result<CommandPipeline.AdminPayload, CommandPipeline.RejectReason> =
        match ap.Body with
        | ValueSome (AdminPayload.Types.Body.Pause _)    -> Ok CommandPipeline.Pause
        | ValueSome (AdminPayload.Types.Body.Resume _)   -> Ok CommandPipeline.Resume
        | ValueSome (AdminPayload.Types.Body.GrantResources g) ->
            match g.Resources with
            | ValueSome resources when g.PlayerId = 0 && finite64 resources.Metal && finite64 resources.Energy
                                       && abs resources.Metal <= float Single.MaxValue
                                       && abs resources.Energy <= float Single.MaxValue ->
                Ok (CommandPipeline.GrantResources (g.PlayerId, { metal = resources.Metal; energy = resources.Energy }))
            | _ -> invalid "resource grant requires finite resources and the supported team target"
        | ValueSome _ -> Error CommandPipeline.AdminNotAvailable
        | ValueNone -> invalid "admin command body is missing"

    let tryToCoreCommand (msg: Command) : Result<CommandPipeline.Command, CommandPipeline.RejectReason> =
        let cid = bytesToGuid msg.CommandId
        if cid = Guid.Empty then invalid "command id must be a nonzero 16-byte UUID"
        elif String.IsNullOrWhiteSpace msg.OriginatingClient then invalid "originating client is required"
        elif msg.TargetSlot < 0 then invalid "target slot cannot be negative"
        elif msg.SubmittedAtUnixMs <= 0L then invalid "submitted time must be a positive Unix millisecond timestamp"
        else
          let kind =
            match msg.Kind with
            | ValueSome (Command.Types.Kind.Gameplay gp) -> toCoreGameplay gp |> Result.map CommandPipeline.Gameplay
            | ValueSome (Command.Types.Kind.Admin ap)    -> toCoreAdmin ap |> Result.map CommandPipeline.Admin
            | ValueNone -> invalid "command kind is missing"
          kind |> Result.bind (fun decoded ->
              try
                  Ok { commandId = cid
                       originatingClient = ScriptingClientId msg.OriginatingClient
                       targetSlot = if msg.TargetSlot = 0 then None else Some msg.TargetSlot
                       kind = decoded
                       submittedAt = DateTimeOffset.FromUnixTimeMilliseconds(msg.SubmittedAtUnixMs) }
              with :? ArgumentOutOfRangeException -> invalid "submitted time is outside the supported range")

    let toReject
        (reason: CommandPipeline.RejectReason)
        (commandId: Guid option)
        (brokerVersion: Version option)
        : Reject =
        let w = Reject.empty()
        let code, detail =
            match reason with
            | CommandPipeline.QueueFull -> Reject.Types.Code.QueueFull, "queue full"
            | CommandPipeline.AdminNotAvailable -> Reject.Types.Code.AdminNotAvailable, "admin not available"
            | CommandPipeline.SlotNotOwned (s, owner) ->
                let detail =
                    match owner with
                    | Some (ScriptingClientId n) -> sprintf "slot %d owned by %s" s n
                    | None -> sprintf "slot %d unowned" s
                Reject.Types.Code.SlotNotOwned, detail
            | CommandPipeline.NameInUse -> Reject.Types.Code.NameInUse, "name in use"
            | CommandPipeline.VersionMismatch (b, p) ->
                Reject.Types.Code.VersionMismatch, sprintf "broker %O peer %O" b p
            | CommandPipeline.SchemaMismatch (expected, received) ->
                // Coordinator-wire concern; if a scripting-client somehow sees
                // it, surface it as InvalidPayload with both versions in the
                // detail (data-model §4: SchemaMismatch is not a ScriptingClient
                // wire code).
                Reject.Types.Code.InvalidPayload, sprintf "schema mismatch expected=%s received=%s" expected received
            | CommandPipeline.NotOwner (attempted, owner) ->
                // Coordinator-wire concern; ScriptingClient never sees this. If
                // it bubbles up here, surface descriptively.
                Reject.Types.Code.InvalidPayload, sprintf "not owner attempted=%s owner=%s" attempted owner
            | CommandPipeline.InvalidPayload d ->
                Reject.Types.Code.InvalidPayload, d
        w.Code <- code
        w.Detail <- detail
        match commandId with
        | Some id -> w.CommandId <- guidToBytes id
        | None -> ()
        match brokerVersion with
        | Some v -> w.BrokerVersion <- ValueSome (fromCoreVersion v)
        | None -> ()
        w

    // === Coordinator side (feature 002) =========================================

    type RunningView =
        { sessionId: Guid
          lastSeq: uint64 option
          baselineValid: bool
          units: Map<uint32, Snapshot.Unit>
          browserUnits: Snapshot.ObservedUnit list
          features: Map<uint32, Snapshot.Feature>
          browserFeatures: Snapshot.ObservedFeature list
          teamEconomy: Snapshot.TeamEconomy option
          mapMeta: Snapshot.MapMeta option
          lastFrame: int64 }

    let emptyRunningView : RunningView =
        { sessionId = Guid.Empty
          lastSeq = None
          baselineValid = false
          units = Map.empty
          browserUnits = []
          features = Map.empty
          browserFeatures = []
          teamEconomy = None
          mapMeta = None
          lastFrame = 0L }

    let lastSeq (view: RunningView) : uint64 = view.lastSeq |> Option.defaultValue 0UL

    let hasValidBaseline (view: RunningView) : bool = view.baselineValid

    type ApplyResult =
        | NewSnapshot of Snapshot.GameStateSnapshot * Snapshot.BrowserObservation
        | Gap of lastSeq:uint64 * receivedSeq:uint64
        | Invalidated of lastSeq:uint64 * receivedSeq:uint64 * detail:string
        | KeepAliveOnly

    // --- HighBar → Core helpers ---

    let private vec3ToVec2 (v: Highbar.V1.Vector3) : Snapshot.Vec2 =
        // Recoil uses X/Z as its ground plane; Y is elevation. The legacy
        // broker Vec2 therefore carries (X,Z), not (X,Y).
        { x = v.X; y = v.Z }

    let private vec3 (v: Highbar.V1.Vector3) : Snapshot.Vec3 =
        { x = v.X; elevation = Some v.Y; z = v.Z }

    let private requirePosition (entity: string) (id: uint32) (v: ValueOption<Highbar.V1.Vector3>) : Result<Snapshot.Vec2, string> =
        match v with
        | ValueSome v -> Ok (vec3ToVec2 v)
        | ValueNone -> Error (sprintf "%s %u is missing position" entity id)

    let private ownUnitToCoreUnit (u: Highbar.V1.OwnUnit) : Result<Snapshot.Unit, string> =
        requirePosition "own unit" u.UnitId u.Position
        |> Result.map (fun pos ->
            { id = u.UnitId
              classId = string u.DefId
              ownerPlayerId = u.TeamId
              pos = pos })

    let private enemyUnitToCoreUnit (u: Highbar.V1.EnemyUnit) : Result<Snapshot.Unit, string> =
        requirePosition "enemy unit" u.UnitId u.Position
        |> Result.map (fun pos ->
            { id = u.UnitId
              classId = string u.DefId
              ownerPlayerId = u.TeamId
              pos = pos })

    let private mapFeatureToCoreFeature (f: Highbar.V1.MapFeature) : Result<Snapshot.Feature, string> =
        requirePosition "map feature" f.FeatureId f.Position
        |> Result.map (fun pos ->
            { id = f.FeatureId
              kind = string f.DefId
              pos = pos })

    let private staticMapToCoreMapMeta (m: ValueOption<Highbar.V1.StaticMap>) : Snapshot.MapMeta option =
        match m with
        | ValueSome sm ->
            Some
                { mapName = ""
                  size = { x = float32 sm.WidthCells; y = float32 sm.HeightCells }
                  outline = sm.Heightmap.ToByteArray() }
        | ValueNone -> None

    let private ownUnitToObserved (u: Highbar.V1.OwnUnit) =
        match u.Position with
        | ValueNone -> Error (sprintf "own unit %u is missing position" u.UnitId)
        | ValueSome p ->
            Ok ({ id = uint64 u.UnitId
                  definitionId = Some u.DefId
                  teamId = Some u.TeamId
                  observation = Snapshot.Own
                  position = vec3 p
                  health = Some u.Health
                  maxHealth = Some u.MaxHealth
                  generation = None } : Snapshot.ObservedUnit)

    let private enemyUnitToObserved (u: Highbar.V1.EnemyUnit) =
        match u.Position with
        | ValueNone -> Error (sprintf "enemy unit %u is missing position" u.UnitId)
        | ValueSome p ->
            Ok ({ id = uint64 u.UnitId
                  definitionId = Some u.DefId
                  teamId = Some u.TeamId
                  observation = Snapshot.Visual
                  position = vec3 p
                  health = Some u.Health
                  maxHealth = Some u.MaxHealth
                  generation = None } : Snapshot.ObservedUnit)

    let private radarToObserved (u: Highbar.V1.RadarBlip) =
        match u.Position with
        | ValueNone -> Error (sprintf "radar blip %u is missing position" u.BlipId)
        | ValueSome p ->
            Ok ({ id = uint64 u.BlipId
                  definitionId = (if u.SuspectedDefId = 0u then None else Some u.SuspectedDefId)
                  teamId = None
                  observation = Snapshot.Radar
                  position = vec3 p
                  health = None
                  maxHealth = None
                  generation = None } : Snapshot.ObservedUnit)

    let private featureToObserved (f: Highbar.V1.MapFeature) =
        match f.Position with
        | ValueNone -> Error (sprintf "map feature %u is missing position" f.FeatureId)
        | ValueSome p ->
            Ok ({ id = uint64 f.FeatureId
                  definitionId = f.DefId
                  position = vec3 p } : Snapshot.ObservedFeature)

    let private economyToObserved (e: ValueOption<Highbar.V1.TeamEconomy>) =
        match e with
        | ValueNone -> None
        | ValueSome e ->
            let metal : Snapshot.ResourceAmount =
                { current = Some (float e.Metal)
                  storage = Some (float e.MetalStorage)
                  income = Some (float e.MetalIncome)
                  expenditure = None }
            let energy : Snapshot.ResourceAmount =
                { current = Some (float e.Energy)
                  storage = Some (float e.EnergyStorage)
                  income = Some (float e.EnergyIncome)
                  expenditure = None }
            Some ({ teamId = None; metal = metal; energy = energy } : Snapshot.TeamEconomy)

    let private economyTickToObserved (e: Highbar.V1.EconomyTickEvent) =
        let values =
            [ e.Metal; e.MetalIncome; e.MetalUsage; e.MetalStorage
              e.Energy; e.EnergyIncome; e.EnergyUsage; e.EnergyStorage ]
        if values |> List.exists (Single.IsFinite >> not) then
            Error "economy tick contains a non-finite value"
        else
            let metal : Snapshot.ResourceAmount =
                { current = Some (float e.Metal)
                  storage = Some (float e.MetalStorage)
                  income = Some (float e.MetalIncome)
                  expenditure = None }
            let energy : Snapshot.ResourceAmount =
                { current = Some (float e.Energy)
                  storage = Some (float e.EnergyStorage)
                  income = Some (float e.EnergyIncome)
                  expenditure = None }
            Ok ({ teamId = None; metal = metal; energy = energy } : Snapshot.TeamEconomy)

    let private snapshotFromView (view: RunningView) : Snapshot.GameStateSnapshot =
        let unitList = view.units |> Map.toList |> List.map snd
        let featureList = view.features |> Map.toList |> List.map snd
        { sessionId = view.sessionId
          tick = view.lastFrame
          capturedAt = DateTimeOffset.UtcNow
          // HighBar's StateSnapshot carries team economy but no player
          // identity or complete PlayerTelemetry. Do not invent a "host"
          // player or missing economy fields.
          players = []
          units = unitList
          buildings = []
          features = featureList
          mapMeta = view.mapMeta }

    let private browserObservationFromView (view: RunningView) : Snapshot.BrowserObservation =
        { sessionId = view.sessionId
          sequence = view.lastSeq |> Option.defaultValue 0UL
          capturedAt = DateTimeOffset.UtcNow
          perspectiveId = ""
          units = view.browserUnits
          features = view.browserFeatures
          teamEconomy = view.teamEconomy }

    let applyHighBarStateUpdate
        (update: Highbar.V1.StateUpdate)
        (view: RunningView)
        : RunningView * ApplyResult =
        let recvSeq = update.Seq
        let previousSeq = view.lastSeq |> Option.defaultValue 0UL
        let isOlderOrDuplicate =
            view.lastSeq |> Option.exists (fun last -> recvSeq <= last)
        if isOlderOrDuplicate then
            view, KeepAliveOnly
        else
            let hasGap =
                // Subtraction is safe because stale/duplicate values were
                // rejected above; unlike `last + 1`, this cannot overflow.
                view.lastSeq
                |> Option.exists (fun last -> recvSeq - last > 1UL)
            let isKnownOwnedIdle (idle: Highbar.V1.UnitIdleEvent) =
                idle.UnitId >= 0
                && view.browserUnits
                   |> List.exists (fun unit ->
                       unit.observation = Snapshot.Own
                       && unit.id = uint64 idle.UnitId)
            let isSupportedIdle idle = view.baselineValid && isKnownOwnedIdle idle
            let unsupportedArmName (event: Highbar.V1.DeltaEvent) =
                match event.Kind with
                | ValueNone -> Some "unset"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.CommandDispatch _)
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.EconomyTick _) -> None
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.UnitIdle idle) when isSupportedIdle idle -> None
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.UnitIdle _) -> Some "unit_idle"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.UnitCreated _) -> Some "unit_created"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.UnitFinished _) -> Some "unit_finished"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.UnitDamaged _) -> Some "unit_damaged"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.UnitDestroyed _) -> Some "unit_destroyed"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.UnitMoveFailed _) -> Some "unit_move_failed"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.UnitGiven _) -> Some "unit_given"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.UnitCaptured _) -> Some "unit_captured"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.EnemyEnterLos _) -> Some "enemy_enter_los"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.EnemyLeaveLos _) -> Some "enemy_leave_los"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.EnemyEnterRadar _) -> Some "enemy_enter_radar"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.EnemyLeaveRadar _) -> Some "enemy_leave_radar"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.EnemyDamaged _) -> Some "enemy_damaged"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.EnemyDestroyed _) -> Some "enemy_destroyed"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.FeatureCreated _) -> Some "feature_created"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.FeatureDestroyed _) -> Some "feature_destroyed"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.Message _) -> Some "message"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.WeaponFired _) -> Some "weapon_fired"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.PlayerCommand _) -> Some "player_command"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.SeismicPing _) -> Some "seismic_ping"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.CommandFinished _) -> Some "command_finished"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.EnemyCreated _) -> Some "enemy_created"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.EnemyFinished _) -> Some "enemy_finished"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.LuaMessage _) -> Some "lua_message"
                | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.AdminAudit _) -> Some "admin_audit"
            let describeUnsupportedArms (delta: Highbar.V1.StateDelta) =
                let idleSample=
                    delta.Events
                    |> Seq.tryPick (fun event ->
                        match event.Kind with
                        | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.UnitIdle idle) when not (isSupportedIdle idle) ->
                            Some(idle.UnitId,isKnownOwnedIdle idle)
                        | _ -> None)
                let counts=
                    delta.Events
                    |> Seq.choose unsupportedArmName
                    |> Seq.countBy id
                    |> Seq.sortBy fst
                    |> Seq.toList
                let shown=counts |> List.truncate 8
                let labels=
                    shown
                    |> List.map (fun (name,count) ->
                        match name,idleSample with
                        | "unit_idle",Some(actor,knownOwn) -> sprintf "unit_idle(actor=%d,knownOwn=%b)=%d" actor knownOwn count
                        | _ -> sprintf "%s=%d" name count)
                let omitted=counts.Length-shown.Length
                sprintf "arms[%s]; distinct=%d; omitted=%d" (String.concat "," labels) counts.Length omitted
            match update.Payload with
            | ValueSome (Highbar.V1.StateUpdate.Types.Payload.Snapshot ss) ->
                let collect (items: seq<'a>) (convert: 'a -> Result<'b, string>) : Result<'b list, string> =
                    items
                    |> Seq.fold (fun state item ->
                        match state, convert item with
                        | Ok values, Ok value -> Ok (value :: values)
                        | Error e, _ -> Error e
                        | _, Error e -> Error e) (Ok [])
                    |> Result.map List.rev
                let converted =
                    match collect ss.OwnUnits ownUnitToCoreUnit,
                          collect ss.VisibleEnemies enemyUnitToCoreUnit,
                          collect ss.MapFeatures mapFeatureToCoreFeature,
                          collect ss.OwnUnits ownUnitToObserved,
                          collect ss.VisibleEnemies enemyUnitToObserved,
                          collect ss.RadarEnemies radarToObserved,
                          collect ss.MapFeatures featureToObserved with
                    | Ok ownUnits, Ok enemies, Ok features, Ok observedOwn, Ok observedEnemies, Ok radar, Ok observedFeatures ->
                        Ok (ownUnits, enemies, features, observedOwn @ observedEnemies @ radar, observedFeatures)
                    | Error e, _, _, _, _, _, _ | _, Error e, _, _, _, _, _
                    | _, _, Error e, _, _, _, _ | _, _, _, Error e, _, _, _
                    | _, _, _, _, Error e, _, _ | _, _, _, _, _, Error e, _
                    | _, _, _, _, _, _, Error e -> Error e
                match converted with
                | Error detail ->
                    let invalid =
                        { view with
                            lastSeq = Some recvSeq
                            baselineValid = false }
                    invalid, Invalidated (previousSeq, recvSeq, detail)
                | Ok (ownUnits, enemies, features, observedUnits, observedFeatures) ->
                    let units =
                        Seq.append ownUnits enemies
                        |> Seq.map (fun unit -> unit.id, unit)
                        |> Map.ofSeq
                    let featureMap =
                        features
                        |> Seq.map (fun feature -> feature.id, feature)
                        |> Map.ofSeq
                    // A complete snapshot is a replacement baseline. It may
                    // recover directly across a sequence jump because it does
                    // not depend on the missing deltas.
                    let view' =
                        { view with
                            lastSeq = Some recvSeq
                            baselineValid = true
                            units = units
                            browserUnits = observedUnits
                            features = featureMap
                            browserFeatures = observedFeatures
                            teamEconomy = economyToObserved ss.Economy
                            mapMeta = staticMapToCoreMapMeta ss.StaticMap
                            lastFrame = int64 update.Frame }
                    view', NewSnapshot (snapshotFromView view', browserObservationFromView view')
            | _ when hasGap ->
                let invalid =
                    { view with
                        lastSeq = Some recvSeq
                        baselineValid = false }
                invalid, Gap (previousSeq, recvSeq)
            | ValueSome (Highbar.V1.StateUpdate.Types.Payload.Delta delta)
                when delta.Events.Count > 0
                     && (delta.Events
                         |> Seq.forall (fun event ->
                             match event.Kind with
                             | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.CommandDispatch _)
                             | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.EconomyTick _) -> true
                             | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.UnitIdle idle) ->
                                 // UnitIdle changes order state, which the browser snapshot
                                 // does not project. It is fact-preserving only for an owned
                                 // unit already established by the complete baseline. Refuse
                                 // absent/negative IDs so lifecycle or ownership drift cannot
                                 // be hidden as a keepalive.
                                 isSupportedIdle idle
                             | _ -> false)) ->
                // Dispatch feedback is consumed independently by
                // HighBarCoordinatorService. UnitIdle preserves the last
                // complete owned-unit facts. EconomyTick is the regular
                // producer delta emitted immediately after a complete
                // snapshot and can be applied without weakening unit,
                // lifetime, ownership, or visibility fences.
                let economies =
                    delta.Events
                    |> Seq.choose (fun event ->
                        match event.Kind with
                        | ValueSome (Highbar.V1.DeltaEvent.Types.Kind.EconomyTick economy) -> Some economy
                        | _ -> None)
                    |> Seq.toList
                match economies with
                | [] -> { view with lastSeq = Some recvSeq }, KeepAliveOnly
                | [ _ ] when not view.baselineValid ->
                    { view with lastSeq = Some recvSeq },
                    Invalidated (previousSeq, recvSeq, "economy tick received before a complete baseline")
                | [ economy ] ->
                    match economyTickToObserved economy with
                    | Error detail ->
                        { view with lastSeq = Some recvSeq; baselineValid = false },
                        Invalidated (previousSeq, recvSeq, detail)
                    | Ok teamEconomy ->
                        let view' =
                            { view with
                                lastSeq = Some recvSeq
                                teamEconomy = Some teamEconomy
                                lastFrame = int64 update.Frame }
                        view', NewSnapshot (snapshotFromView view', browserObservationFromView view')
                | _ ->
                    { view with lastSeq = Some recvSeq; baselineValid = false },
                    Invalidated (previousSeq, recvSeq, "StateDelta contains multiple economy ticks")
            | ValueSome (Highbar.V1.StateUpdate.Types.Payload.Delta delta) when delta.Events.Count > 0 ->
                let arms=describeUnsupportedArms delta
                let detail =
                    if view.baselineValid then
                        sprintf "nonempty StateDelta contains event arms the broker does not materialize; %s" arms
                    else
                        sprintf "nonempty StateDelta received before a complete baseline; %s" arms
                let invalid =
                    { view with
                        lastSeq = Some recvSeq
                        baselineValid = false }
                invalid, Invalidated (previousSeq, recvSeq, detail)
            | ValueSome (Highbar.V1.StateUpdate.Types.Payload.Delta _)
            | ValueSome (Highbar.V1.StateUpdate.Types.Payload.Keepalive _)
            | ValueNone ->
                { view with lastSeq = Some recvSeq }, KeepAliveOnly

    // --- Core → HighBar helpers ---

    let private vec2ToVec3 (v: Snapshot.Vec2) : Highbar.V1.Vector3 =
        let w = Highbar.V1.Vector3.empty()
        w.X <- v.x
        w.Y <- 0.0f
        w.Z <- v.y
        w

    let private commandBatch (seq: uint64) (targetUnitId: uint32) (correlation: uint64) (ais: Highbar.V1.AICommand list) : Highbar.V1.CommandBatch =
        let cb = Highbar.V1.CommandBatch.empty()
        cb.BatchSeq <- seq
        cb.TargetUnitId <- targetUnitId
        for ai in ais do cb.Commands.Add(ai)
        cb.ClientCommandId <- ValueSome correlation
        cb

    let private mapValidatedCoreCommandToHighBar
        (command: CommandPipeline.Command)
        (batchSeq: uint64)
        (correlation: uint64)
        : Result<Highbar.V1.CommandBatch, CommandPipeline.RejectReason> =
        let firstUnit (ids: uint32 list) : int32 =
            match ids with
            | u :: _ -> int u
            | [] -> 0
        let firstUnitU (ids: uint32 list) : uint32 =
            match ids with
            | u :: _ -> u
            | [] -> 0u
        match command.kind with
        | CommandPipeline.Gameplay (CommandPipeline.UnitOrder (uids, kind, targetPos, targetUnitId)) ->
            let target = firstUnitU uids
            match kind, targetUnitId, targetPos with
            | CommandPipeline.Move, _, Some pos ->
                let mu = Highbar.V1.MoveUnitCommand.empty()
                mu.UnitId <- firstUnit uids
                mu.ToPosition <- ValueSome (vec2ToVec3 pos)
                let ai = Highbar.V1.AICommand.empty()
                ai.MoveUnit <- mu
                Ok (commandBatch batchSeq target correlation [ai])
            | CommandPipeline.Move, _, None ->
                Error (CommandPipeline.InvalidPayload "Move requires targetPos")
            | CommandPipeline.Attack, Some tid, _ ->
                let ac = Highbar.V1.AttackCommand.empty()
                ac.UnitId <- firstUnit uids
                ac.TargetUnitId <- int tid
                let ai = Highbar.V1.AICommand.empty()
                ai.Attack <- ac
                Ok (commandBatch batchSeq target correlation [ai])
            | CommandPipeline.Attack, None, Some pos ->
                let aa = Highbar.V1.AttackAreaCommand.empty()
                aa.UnitId <- firstUnit uids
                aa.AttackPosition <- ValueSome (vec2ToVec3 pos)
                aa.Radius <- 64.0f   // broker default; tunable later
                let ai = Highbar.V1.AICommand.empty()
                ai.AttackArea <- aa
                Ok (commandBatch batchSeq target correlation [ai])
            | CommandPipeline.Attack, None, None ->
                Error (CommandPipeline.InvalidPayload "Attack requires either targetUnitId or targetPos")
            | CommandPipeline.Stop, _, _ ->
                let s = Highbar.V1.StopCommand.empty()
                s.UnitId <- firstUnit uids
                let ai = Highbar.V1.AICommand.empty()
                ai.Stop <- s
                Ok (commandBatch batchSeq target correlation [ai])
            | CommandPipeline.Guard, Some tid, None ->
                let g = Highbar.V1.GuardCommand.empty()
                g.UnitId <- firstUnit uids
                g.GuardUnitId <- int tid
                let ai = Highbar.V1.AICommand.empty()
                ai.Guard <- g
                Ok (commandBatch batchSeq target correlation [ai])
            | CommandPipeline.Patrol, _, Some pos ->
                let p = Highbar.V1.PatrolCommand.empty()
                p.UnitId <- firstUnit uids
                p.ToPosition <- ValueSome (vec2ToVec3 pos)
                let ai = Highbar.V1.AICommand.empty()
                ai.Patrol <- p
                Ok (commandBatch batchSeq target correlation [ai])
            | CommandPipeline.Patrol, _, None ->
                Error (CommandPipeline.InvalidPayload "Patrol requires targetPos")
            | _ ->
                Error (CommandPipeline.InvalidPayload "unit order has missing or ambiguous target fields")
        | CommandPipeline.Gameplay (CommandPipeline.Build (builderId, classId, pos)) ->
            let b = Highbar.V1.BuildUnitCommand.empty()
            b.UnitId <- int builderId
            // The admission wrapper verifies that classId is a positive
            // native definition id before this conversion runs.
            let mutable defId = 0
            System.Int32.TryParse(classId, &defId) |> ignore
            b.ToBuildUnitDefId <- defId
            b.BuildPosition <- ValueSome (vec2ToVec3 pos)
            let ai = Highbar.V1.AICommand.empty()
            ai.BuildUnit <- b
            Ok (commandBatch batchSeq builderId correlation [ai])
        | CommandPipeline.Gameplay (CommandPipeline.Custom (_, blob)) ->
            let c = Highbar.V1.CustomCommand.empty()
            // CustomCommand.Params is RepeatedField<float32>; decode the
            // blob as length-prefixed float32 if present (bytes / 4).
            // The mapping is informational; the engine plugin chooses how
            // to interpret CustomCommand.CommandId + Params.
            for i in 0 .. (blob.Length / 4) - 1 do
                let f = System.BitConverter.ToSingle(blob, i * 4)
                c.Params.Add(f)
            let ai = Highbar.V1.AICommand.empty()
            ai.Custom <- c
            Ok (commandBatch batchSeq 0u correlation [ai])
        | CommandPipeline.Admin CommandPipeline.Pause ->
            let p = Highbar.V1.PauseTeamCommand.empty()
            p.Enable <- true
            let ai = Highbar.V1.AICommand.empty()
            ai.PauseTeam <- p
            Ok (commandBatch batchSeq 0u correlation [ai])
        | CommandPipeline.Admin CommandPipeline.Resume ->
            let p = Highbar.V1.PauseTeamCommand.empty()
            p.Enable <- false
            let ai = Highbar.V1.AICommand.empty()
            ai.PauseTeam <- p
            Ok (commandBatch batchSeq 0u correlation [ai])
        | CommandPipeline.Admin (CommandPipeline.GrantResources (_, resources)) ->
            // GiveMeCommand is per-resource; emit two AICommands (metal + energy).
            let metalGm = Highbar.V1.GiveMeCommand.empty()
            metalGm.ResourceId <- 0   // 0 = metal by upstream convention
            metalGm.Amount <- float32 resources.metal
            let energyGm = Highbar.V1.GiveMeCommand.empty()
            energyGm.ResourceId <- 1   // 1 = energy
            energyGm.Amount <- float32 resources.energy
            let aiM = Highbar.V1.AICommand.empty()
            aiM.GiveMe <- metalGm
            let aiE = Highbar.V1.AICommand.empty()
            aiE.GiveMe <- energyGm
            Ok (commandBatch batchSeq 0u correlation [aiM; aiE])
        | CommandPipeline.Admin (CommandPipeline.SetSpeed _)
        | CommandPipeline.Admin (CommandPipeline.OverrideVision _)
        | CommandPipeline.Admin (CommandPipeline.OverrideVictory _) ->
            Error CommandPipeline.AdminNotAvailable

    let tryFromCoreCommandToHighBar
        (command: CommandPipeline.Command)
        (batchSeq: uint64)
        : Result<Highbar.V1.CommandBatch, CommandPipeline.RejectReason> =
        let nativeId name id = validNativeId name id
        let finitePos (pos: Snapshot.Vec2) = finite32 pos.x && finite32 pos.y
        let validateKind =
            match command.kind with
            | CommandPipeline.Gameplay (CommandPipeline.UnitOrder (ids, kind, pos, targetId)) ->
                match ids with
                | [unitId] ->
                    nativeId "unit id" unitId
                    |> Result.bind (fun () ->
                        match targetId with
                        | Some id -> nativeId "target unit id" id
                        | None -> Ok ())
                    |> Result.bind (fun () ->
                        if pos |> Option.exists (finitePos >> not) then invalid "target position has non-finite coordinates"
                        else
                            match kind, pos, targetId with
                            | CommandPipeline.Move, Some _, None
                            | CommandPipeline.Patrol, Some _, None
                            | CommandPipeline.Stop, None, None
                            | CommandPipeline.Attack, Some _, None
                            | CommandPipeline.Attack, None, Some _
                            | CommandPipeline.Guard, None, Some _ -> Ok ()
                            | _ -> invalid "unit order has missing or ambiguous target fields")
                | [] -> invalid "unit order has no acting unit"
                | _ -> invalid "multi-unit order requires explicit per-unit expansion"
            | CommandPipeline.Gameplay (CommandPipeline.Build (builderId, classId, pos)) ->
                nativeId "builder id" builderId
                |> Result.bind (fun () ->
                    let mutable defId = 0
                    if Int32.TryParse(classId, &defId) && defId > 0 && finitePos pos then Ok ()
                    else invalid "build requires a positive native definition id and finite position")
            | CommandPipeline.Gameplay (CommandPipeline.Custom _) ->
                invalid "custom gameplay commands have no supported native mapping"
            | CommandPipeline.Admin (CommandPipeline.GrantResources (playerId, resources)) ->
                if playerId = 0 && finite64 resources.metal && finite64 resources.energy
                   && abs resources.metal <= float Single.MaxValue
                   && abs resources.energy <= float Single.MaxValue then Ok ()
                else invalid "resource grant requires finite resources and the supported team target"
            | _ -> Ok ()
        let bytes = command.commandId.ToByteArray()
        let correlation = System.BitConverter.ToUInt64(bytes, 0)
        validateKind |> Result.bind (fun () -> mapValidatedCoreCommandToHighBar command batchSeq correlation)

    let tryExpandCoreCommandToHighBar
        (command: CommandPipeline.Command)
        (allocations: (uint64 * uint64) list)
        : Result<Highbar.V1.CommandBatch list, CommandPipeline.RejectReason> =
        let invalid detail = Error (CommandPipeline.InvalidPayload detail)
        let expand commands =
            if List.length commands <> List.length allocations then
                invalid "wire allocation count does not match command expansion"
            else
                List.zip commands allocations
                |> List.fold (fun state (child, (seq, correlation)) ->
                    state
                    |> Result.bind (fun batches ->
                        mapValidatedCoreCommandToHighBar child seq correlation
                        |> Result.map (fun batch -> batch :: batches))) (Ok [])
                |> Result.map List.rev
        match command.kind with
        | CommandPipeline.Gameplay (CommandPipeline.UnitOrder (ids, kind, pos, targetId)) ->
            if ids.Length < 1 || ids.Length > 64 then
                invalid "unit order requires between 1 and 64 acting units"
            elif (ids |> Set.ofList |> Set.count) <> ids.Length then
                invalid "unit order acting units must be distinct"
            else
                let validateId id = validNativeId "unit id" id
                let validation =
                    ids
                    |> List.fold (fun state id -> state |> Result.bind (fun () -> validateId id)) (Ok ())
                    |> Result.bind (fun () ->
                        match targetId with
                        | Some id -> validNativeId "target unit id" id
                        | None -> Ok ())
                    |> Result.bind (fun () ->
                        if pos |> Option.exists (fun p -> not (finite32 p.x && finite32 p.y)) then
                            invalid "target position has non-finite coordinates"
                        else
                            match kind, pos, targetId with
                            | CommandPipeline.Move, Some _, None
                            | CommandPipeline.Patrol, Some _, None
                            | CommandPipeline.Stop, None, None
                            | CommandPipeline.Attack, Some _, None
                            | CommandPipeline.Attack, None, Some _
                            | CommandPipeline.Guard, None, Some _ -> Ok ()
                            | _ -> invalid "unit order has missing or ambiguous target fields")
                validation
                |> Result.bind (fun () ->
                    ids
                    |> List.map (fun id ->
                        { command with
                            kind = CommandPipeline.Gameplay (CommandPipeline.UnitOrder ([id], kind, pos, targetId)) })
                    |> expand)
        | _ ->
            match allocations with
            | [seq, correlation] ->
                // The existing converter remains the single-command validator;
                // replace its UUID-derived correlation only after it succeeds.
                tryFromCoreCommandToHighBar command seq
                |> Result.bind (fun _ -> mapValidatedCoreCommandToHighBar command seq correlation)
                |> Result.map List.singleton
            | _ -> invalid "non-unit command requires exactly one wire allocation"
