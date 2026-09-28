namespace Broker.Core

open System

module Snapshot =

    type Vec2 = { x: float32; y: float32 }

    type ResourceVector = { metal: float; energy: float }

    type EconomyStats =
        { income: ResourceVector
          expenditure: ResourceVector }

    type MapMeta =
        { mapName: string
          size: Vec2
          outline: byte[] }

    type PlayerTelemetry =
        { playerId: int
          teamId: int
          name: string
          resources: ResourceVector
          unitCount: int
          buildingCount: int
          unitClassBreakdown: Map<string, int>
          economy: EconomyStats
          kills: int
          losses: int }

    type Unit =
        { id: uint32
          classId: string
          ownerPlayerId: int
          pos: Vec2 }

    type Building =
        { id: uint32
          classId: string
          ownerPlayerId: int
          pos: Vec2 }

    type Feature =
        { id: uint32
          kind: string
          pos: Vec2 }

    type GameStateSnapshot =
        { sessionId: Guid
          tick: int64
          capturedAt: DateTimeOffset
          players: PlayerTelemetry list
          units: Unit list
          buildings: Building list
          features: Feature list
          mapMeta: MapMeta option }

    type Vec3 = { x: float32; elevation: float32 option; z: float32 }
    type ObservationKind = Own | Visual | Radar
    type ObservedUnit =
        { id: uint64; definitionId: uint32 option; teamId: int option
          observation: ObservationKind; position: Vec3
          health: float32 option; maxHealth: float32 option; generation: uint64 option }
    type ObservedFeature = { id: uint64; definitionId: uint32; position: Vec3 }
    type ResourceAmount =
        { current: float option; storage: float option
          income: float option; expenditure: float option }
    type TeamEconomy = { teamId: int option; metal: ResourceAmount; energy: ResourceAmount }
    type BrowserObservation =
        { sessionId: Guid; sequence: uint64; capturedAt: DateTimeOffset
          perspectiveId: string; units: ObservedUnit list
          features: ObservedFeature list; teamEconomy: TeamEconomy option }
    type BrowserFeed =
        | Current of BrowserObservation
        | Stale of sessionId:Guid * lastSequence:uint64 * receivedSequence:uint64 * detail:string

    let isStrictlyAfter (prev: GameStateSnapshot) (next: GameStateSnapshot) : bool =
        prev.sessionId = next.sessionId && next.tick > prev.tick

    let mapMetaOnFirstOnly
        (prev: GameStateSnapshot option)
        (next: GameStateSnapshot)
        : GameStateSnapshot =
        match prev with
        | None -> next
        | Some _ -> { next with mapMeta = None }
