namespace Broker.Browser.Render

[<RequireQualifiedAccess>]
type BarObservationKind =
    | Own
    | Visual
    | Radar

type BarPosition =
    { X: float
      Elevation: float option
      Z: float }

type BarUnit =
    { Id: string
      DefinitionId: uint32 option
      TeamId: int option
      Kind: BarObservationKind
      Position: BarPosition
      Health: float option
      MaxHealth: float option }

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

[<RequireQualifiedAccess>]
type BarValidity =
    | Current
    | Stale

type BarGameState =
    { SessionId: string
      Sequence: string
      CapturedAtUnixMs: string
      PerspectiveId: string
      Validity: BarValidity
      Units: BarUnit list
      Features: BarFeature list
      Economy: BarEconomy option }

[<RequireQualifiedAccess>]
module BarGameState =

    let empty: BarGameState =
        { SessionId = ""
          Sequence = "0"
          CapturedAtUnixMs = "0"
          PerspectiveId = ""
          Validity = BarValidity.Stale
          Units = []
          Features = []
          Economy = None }

    let private isFinite (value: float) =
        not (System.Double.IsNaN value) && not (System.Double.IsInfinity value)

    let private isDecimal (text: string) =
        text.Length > 0 && text |> Seq.forall (fun c -> c >= '0' && c <= '9')

    let private isNonzeroId (text: string) = isDecimal text && text.[0] <> '0'

    let private positionOk (position: BarPosition) =
        isFinite position.X
        && isFinite position.Z
        && (match position.Elevation with
            | Some elevation -> isFinite elevation
            | None -> true)

    let private optionalFinite (value: float option) =
        match value with
        | Some number -> isFinite number
        | None -> true

    let private resourceOk (resource: BarResource) =
        optionalFinite resource.Current
        && optionalFinite resource.Storage
        && optionalFinite resource.Income
        && optionalFinite resource.Expenditure

    let private duplicate (ids: string list) =
        ids |> List.countBy id |> List.exists (fun (_, count) -> count > 1)

    let validate (maxEntities: int) (state: BarGameState) : Result<BarGameState, string> =
        if not (isDecimal state.Sequence) || state.Sequence = "0" then
            Error "observation sequence is not a nonzero decimal"
        elif state.Units.Length + state.Features.Length > maxEntities then
            Error "observation exceeds the negotiated entity limit"
        elif state.Units |> List.exists (fun u -> not (isNonzeroId u.Id)) then
            Error "unit identity is zero or malformed"
        elif duplicate (state.Units |> List.map _.Id) then
            Error "unit identity is duplicated"
        elif state.Features |> List.exists (fun f -> not (isNonzeroId f.Id) || f.DefinitionId = 0u) then
            Error "feature identity or type is invalid"
        elif duplicate (state.Features |> List.map _.Id) then
            Error "feature identity is duplicated"
        elif state.Units |> List.exists (fun u -> not (positionOk u.Position)) then
            Error "unit position is non-finite"
        elif state.Features |> List.exists (fun f -> not (positionOk f.Position)) then
            Error "feature position is non-finite"
        elif state.Units |> List.exists (fun u -> not (optionalFinite u.Health && optionalFinite u.MaxHealth)) then
            Error "unit health is non-finite"
        elif
            (match state.Economy with
             | Some economy -> not (resourceOk economy.Metal && resourceOk economy.Energy)
             | None -> false)
        then
            Error "economy is non-finite"
        else
            Ok state

    let follows (current: BarGameState) (next: BarGameState) : bool =
        // Decimal strings compare numerically by length, then lexicographically.
        let a = current.Sequence
        let b = next.Sequence
        b.Length > a.Length || (b.Length = a.Length && System.String.CompareOrdinal(b, a) > 0)
