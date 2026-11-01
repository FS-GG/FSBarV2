namespace Broker.Browser.Render

open FS.GG.Game.Render
open FS.GG.UI.Scene

[<RequireQualifiedAccess>]
module BarScene =

    let width = 800.0
    let height = 520.0

    let private scale = 2.0

    let toViewport (position: BarPosition) : Point =
        { X = width / 2.0 + scale * position.X
          Y = height / 2.0 + scale * position.Z }

    // The portable Scene vocabulary (FS.GG.UI.Scene's Fable view has the types but not the `Scene` module's
    // constructors), so nodes are built directly. Each is the value the `Scene` module's function returns.
    let private node (n: SceneNode) : Scene = { Nodes = [ n ] }
    let private group (scenes: Scene list) : Scene = node (Group scenes)

    let private filledRectangle (bounds: Rect) (fill: Color) : Scene =
        node (Rectangle((bounds.X, bounds.Y, bounds.Width, bounds.Height), fill))

    let private circle (centre: Point) (radius: float) (fill: Color) : Scene = node (Circle(centre, radius, fill))

    let private colour red green blue alpha : Color =
        { Red = red
          Green = green
          Blue = blue
          Alpha = alpha }

    let private backdrop = colour 18uy 24uy 32uy 255uy
    let private featureColour = colour 140uy 148uy 156uy 255uy
    let private radarColour = colour 232uy 180uy 60uy 255uy
    let private visualColour = colour 216uy 84uy 72uy 255uy
    let private ownColour = colour 84uy 200uy 120uy 255uy
    let private veil = colour 18uy 24uy 32uy 150uy

    let private byId (id: string) = (id.Length, id)

    let private square (centre: Point) (half: float) (fill: Color) : Scene =
        filledRectangle
            { X = centre.X - half
              Y = centre.Y - half
              Width = 2.0 * half
              Height = 2.0 * half }
            fill

    // A unit is drawn as a circle (own and visual) or a square (radar). The geometry is shared by the Scene, the
    // retained scene and the selectable objects, so a unit is selectable exactly where it is drawn.
    let private radius (kind: BarObservationKind) =
        match kind with
        | BarObservationKind.Radar -> 7.0
        | BarObservationKind.Visual -> 8.0
        | BarObservationKind.Own -> 10.0

    let private unitColour (kind: BarObservationKind) =
        match kind with
        | BarObservationKind.Radar -> radarColour
        | BarObservationKind.Visual -> visualColour
        | BarObservationKind.Own -> ownColour

    let private selectionColour = colour 255uy 140uy 0uy 255uy

    let private unitScene (unit: BarUnit) : Scene =
        let centre = toViewport unit.Position

        match unit.Kind with
        | BarObservationKind.Radar -> square centre (radius unit.Kind) (unitColour unit.Kind)
        | _ -> circle centre (radius unit.Kind) (unitColour unit.Kind)

    // Painting order, topmost last: radar, then visual, then own, each by id.
    let private kindOrder = [ BarObservationKind.Radar; BarObservationKind.Visual; BarObservationKind.Own ]

    let private ofKind (kind: BarObservationKind) (state: BarGameState) : BarUnit list =
        state.Units
        |> List.filter (fun u -> u.Kind = kind)
        |> List.sortBy (fun u -> byId u.Id)

    let private paintOrder (state: BarGameState) : BarUnit list =
        kindOrder |> List.collect (fun kind -> ofKind kind state)

    let private fullRectangle: Rect =
        { X = 0.0
          Y = 0.0
          Width = width
          Height = height }

    let private featureScenes (state: BarGameState) : Scene list =
        state.Features
        |> List.sortBy (fun f -> byId f.Id)
        |> List.map (fun f -> square (toViewport f.Position) 5.0 featureColour)

    // The ring a canvas backend draws behind the selected unit: the canvases show the selection through the Scene,
    // while the retained SVG surface shows it itself.
    let private ring (state: BarGameState) : Scene list =
        match state.Selected with
        | Some id ->
            state.Units
            |> List.filter (fun u -> u.Id = id)
            |> List.map (fun u -> circle (toViewport u.Position) (radius u.Kind + 4.0) selectionColour)
        | None -> []

    let view (state: BarGameState) : Scene =
        let layers =
            [ filledRectangle fullRectangle backdrop
              group (featureScenes state) ]
            @ [ for kind in kindOrder -> group (ofKind kind state |> List.map unitScene) ]

        // The ring sits under every unit (after the features), so the selected unit stays drawn on top of it.
        let withRing =
            match ring state with
            | [] -> layers
            | rings -> (layers |> List.take 2) @ [ group rings ] @ (layers |> List.skip 2)

        match state.Validity with
        | BarValidity.Current -> group withRing
        | BarValidity.Stale -> group (withRing @ [ filledRectangle fullRectangle veil ])

    let describe (state: BarGameState) : string =
        let count kind =
            state.Units |> List.filter (fun u -> u.Kind = kind) |> List.length

        sprintf
            "BAR tactical map, sequence %s, %s: %d own, %d visual, %d radar, %d features"
            state.Sequence
            (match state.Validity with
             | BarValidity.Current -> "current"
             | BarValidity.Stale -> "stale")
            (count BarObservationKind.Own)
            (count BarObservationKind.Visual)
            (count BarObservationKind.Radar)
            state.Features.Length

    let private kindName (kind: BarObservationKind) =
        match kind with
        | BarObservationKind.Own -> "Own"
        | BarObservationKind.Visual -> "Visual"
        | BarObservationKind.Radar -> "Radar"

    let describeUnit (unit: BarUnit) : string =
        let team =
            match unit.TeamId with
            | Some id -> sprintf ", team %d" id
            | None -> ""

        let health =
            match unit.Health, unit.MaxHealth with
            | Some current, Some maximum -> sprintf ", health %g of %g" current maximum
            | Some current, None -> sprintf ", health %g" current
            | None, _ -> ""

        sprintf "%s unit %s%s%s" (kindName unit.Kind) unit.Id team health

    let objects (state: BarGameState) : SelectableObject list =
        paintOrder state
        |> List.map (fun u ->
            let centre = toViewport u.Position
            let half = radius u.Kind

            { Id = u.Id
              Label = describeUnit u
              Bounds =
                { X = centre.X - half
                  Y = centre.Y - half
                  Width = 2.0 * half
                  Height = 2.0 * half }
              Shape =
                (match u.Kind with
                 | BarObservationKind.Radar -> SelectableShape.Box
                 | _ -> SelectableShape.Ellipse) })

    let interaction: SceneInteraction<BarGameState> =
        SceneInteraction.create objects (fun state -> state.Selected) BarGameState.select
