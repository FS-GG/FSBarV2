namespace Broker.Browser.Render

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

    let private unitScene (unit: BarUnit) : Scene =
        let centre = toViewport unit.Position

        match unit.Kind with
        | BarObservationKind.Radar -> square centre 7.0 radarColour
        | BarObservationKind.Visual -> circle centre 8.0 visualColour
        | BarObservationKind.Own -> circle centre 10.0 ownColour

    let private ofKind (kind: BarObservationKind) (state: BarGameState) : Scene list =
        state.Units
        |> List.filter (fun u -> u.Kind = kind)
        |> List.sortBy (fun u -> byId u.Id)
        |> List.map unitScene

    let view (state: BarGameState) : Scene =
        let features =
            state.Features
            |> List.sortBy (fun f -> byId f.Id)
            |> List.map (fun f -> square (toViewport f.Position) 5.0 featureColour)

        let layers =
            [ filledRectangle
                  { X = 0.0
                    Y = 0.0
                    Width = width
                    Height = height }
                  backdrop
              group features
              group (ofKind BarObservationKind.Radar state)
              group (ofKind BarObservationKind.Visual state)
              group (ofKind BarObservationKind.Own state) ]

        match state.Validity with
        | BarValidity.Current -> group layers
        | BarValidity.Stale ->
            group (
                layers
                @ [ filledRectangle
                        { X = 0.0
                          Y = 0.0
                          Width = width
                          Height = height }
                        veil ]
            )

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
