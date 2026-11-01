namespace Broker.Browser.Render

/// How the producing session observed a unit: the barc.browser.v1 `ObservationKind`.
[<RequireQualifiedAccess>]
type BarObservationKind =
    | Own
    | Visual
    | Radar

/// A world position. `X` and `Z` are the ground plane; `Elevation` (native Y) is absent when the producer
/// did not supply it. It is never invented, because expanding (X,Z) to (X,0,Z) discards elevation.
type BarPosition =
    { X: float
      Elevation: float option
      Z: float }

/// One observed unit. `Id` is the producer's uint64 identity as a decimal string, because JavaScript numbers
/// cannot hold the full range. Optional fields stay `None` when absent, and `Some 0.0` is a real zero.
type BarUnit =
    { Id: string
      DefinitionId: uint32 option
      TeamId: int option
      Kind: BarObservationKind
      Position: BarPosition
      Health: float option
      MaxHealth: float option }

/// One map feature (a reclaim point). It lives in its own identity space, apart from the units.
type BarFeature =
    { Id: string
      DefinitionId: uint32
      Position: BarPosition }

type BarResource =
    { Current: float option
      Storage: float option
      Income: float option
      Expenditure: float option }

type BarEconomy =
    { TeamId: int option
      Metal: BarResource
      Energy: BarResource }

/// Whether the broker's latest observation is current, or retained after the feed went stale.
[<RequireQualifiedAccess>]
type BarValidity =
    | Current
    | Stale

/// The BAR observable game state: the single type registered with Game.Render `RendererSelection`. It is the
/// browser projection of the broker's `Snapshot.BrowserObservation` (barc.browser.v1 `Observation`), and holds
/// everything every renderer backend draws, so no backend owns game state and a switch cannot lose it.
type BarGameState =
    { SessionId: string
      /// Decimal producer sequence; strictly increasing within a session.
      Sequence: string
      CapturedAtUnixMs: string
      PerspectiveId: string
      Validity: BarValidity
      Units: BarUnit list
      Features: BarFeature list
      Economy: BarEconomy option
      /// The unit the player selected: a `BarUnit.Id` of `Units`, or `None`. It is game state, not backend state, so
      /// every renderer backend shows it and a backend switch cannot lose it. It never comes from the broker: a wire
      /// observation decodes with `None`, and the client carries the selection across observations while the unit
      /// is still observed.
      Selected: string option }

[<RequireQualifiedAccess>]
module BarGameState =

    /// A state with no entities, for a client that has not yet received an observation.
    val empty: BarGameState

    /// Check the invariants the browser client enforces on a wire observation: nonzero decimal ids, no
    /// duplicate id within units or within features, finite coordinates and metrics, a nonzero feature
    /// definition, and at most `maxEntities` units and features together.
    val validate: maxEntities: int -> state: BarGameState -> Result<BarGameState, string>

    /// The state after the player's request, by BAR's own selection rule: `Select id` selects that unit when the state
    /// observes it and changes nothing otherwise; `Clear` empties the selection.
    val select: request: FS.GG.Game.Render.SelectionRequest -> state: BarGameState -> BarGameState

    /// The selection carried from `current` into `next`: kept while `next` still observes the unit, dropped when the
    /// unit is gone. The result is `next` with that selection.
    val carrySelection: current: BarGameState -> next: BarGameState -> BarGameState

    /// True when `next` follows `current` in the same session: the sequence is strictly greater.
    val follows: current: BarGameState -> next: BarGameState -> bool
