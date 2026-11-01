namespace Broker.Browser.Render.Host

open System
open Browser.Types
open Fable.Core
open Fable.Core.JsInterop
open Elmish
open FS.GG.Game.Render
open FS.GG.Game.Render.Browser
open Broker.Browser.Render

[<RequireQualifiedAccess>]
module BarHost =

    [<AllowNullLiteral>]
    type Handle =
        abstract select: token: string -> bool
        abstract observe: unit -> obj
        abstract step: unit -> unit
        abstract observeJson: json: string -> unit
        abstract dispose: unit -> unit

    let private status (model: BarClientModel) =
        match model.Renderer.Status with
        | RendererStatus.Active -> "active"
        | RendererStatus.Failed _ -> "failed"

    let private refusal (model: BarClientModel) =
        match model.Renderer.Refusal with
        | None -> ""
        | Some(RendererRefusal.Unavailable backend) -> sprintf "unavailable:%s" (RendererBackend.id backend)
        | Some(RendererRefusal.MountFailed(backend, reason)) -> sprintf "mount-failed:%s:%s" (RendererBackend.id backend) reason
        | Some(RendererRefusal.DisposeFailed(backend, reason)) -> sprintf "dispose-failed:%s:%s" (RendererBackend.id backend) reason
        | Some(RendererRefusal.PresentFailed(backend, reason)) -> sprintf "present-failed:%s:%s" (RendererBackend.id backend) reason

    let private observation (model: BarClientModel) : obj =
        let state = model.Renderer.State

        createObj
            [ "selected" ==> RendererBackend.id model.Renderer.Selected
              "status" ==> status model
              "available" ==> (BarClient.available model |> List.map RendererBackend.id |> Array.ofList)
              "refusal" ==> refusal model
              "sequence" ==> state.Sequence
              "validity" ==> (match state.Validity with BarValidity.Current -> "current" | BarValidity.Stale -> "stale")
              "units" ==> state.Units.Length
              "features" ==> state.Features.Length
              "selectedUnit" ==> (match state.Selected with Some id -> id | None -> "")
              "presented" ==> model.Presented
              "remaining" ==> model.Remaining.Length
              "rejected" ==> (model.Rejected |> Array.ofList) ]

    let private selectionMsg (selected: string option) =
        match selected with
        | Some id -> Select(SelectionRequest.Select id)
        | None -> Select SelectionRequest.Clear

    let private label = "BAR tactical map"

    /// The registry of the BAR renderers in `container`: the retained SVG surface is the default adapter
    /// (`RendererRegistry.create`), so each observed unit is a selectable object with an accessible label, and a
    /// selection the player makes on it is reported to `onSelect`.
    let private registry (container: HTMLElement) (onSelect: string option -> unit) : RendererRegistry<BarGameState> =
        let surface =
            RetainedSvgSurface.create container label (fun _ -> BarScene.width, BarScene.height) BarScene.retained
            |> RetainedSvgSurface.withSelection (fun state -> state.Selected) onSelect

        RetainedSvgSurface.registry surface

    let private mount (container: HTMLElement) (frames: BarGameState list) (intervalMs: int) : Handle =
        let mutable latest: BarClientModel option = None
        let mutable send: BarClientMsg -> unit = ignore
        let registry = registry container (fun selected -> send (selectionMsg selected))
        let mutable disposed = false
        let mutable timer: float option = None

        let program, host =
            BarClient.program registry frames (fun model dispatch ->
                latest <- Some model
                send <- dispatch)

        program
        |> Program.withErrorHandler (fun (context, error) ->
            Browser.Dom.console.error ("BAR renderer Elmish failure", context, error))
        |> Program.run

        let stop () =
            match timer with
            | Some id ->
                Browser.Dom.window.clearInterval id
                timer <- None
            | None -> ()

        if intervalMs > 0 then
            timer <-
                Some(
                    Browser.Dom.window.setInterval (
                        (fun () ->
                            match latest with
                            | Some model when not model.Remaining.IsEmpty -> send Step
                            | _ -> stop ()),
                        intervalMs
                    )
                )

        { new Handle with
            member _.select token =
                match RendererBackend.tryParse token with
                | Some backend ->
                    if not disposed then send (Renderer(RendererMsg.SelectBackend backend))
                    true
                | None -> false

            member _.observe() =
                match latest with
                | Some model -> observation model
                | None -> Unchecked.defaultof<obj>

            member _.step() = if not disposed then send Step
            member _.observeJson json = if not disposed then send (ObserveJson json)

            member _.dispose() =
                if not disposed then
                    disposed <- true
                    stop ()
                    host.Dispose() }

    let mountSynthetic (container: HTMLElement) (frames: int) (intervalMs: int) : Handle =
        mount container (BarSynthetic.frames frames) intervalMs

    let mountRecorded (container: HTMLElement) (observations: string[]) (intervalMs: int) : Handle =
        let decoded =
            observations
            |> Array.mapi (fun index json ->
                match BarObservationJson.decode json with
                | Ok state -> state
                | Error reason -> failwithf "recorded observation %d did not decode: %s" index reason)
            |> List.ofArray

        mount container decoded intervalMs

    // What the retained SVG shows of a unit: its object's circle centre, or its square's centre.
    let private unitCentre (container: HTMLElement) (unit: BarUnit) : (float * float) option =
        let selector = sprintf "[data-scene-object-id='%s']" unit.Id

        match container.querySelector selector with
        | null -> None
        | objectNode ->
            match objectNode.querySelector "circle" with
            | null ->
                match objectNode.querySelector "rect" with
                | null -> None
                | square ->
                    let half = float (square.getAttribute "width") / 2.0
                    Some(float (square.getAttribute "x") + half, float (square.getAttribute "y") + half)
            | circle -> Some(float (circle.getAttribute "cx"), float (circle.getAttribute "cy"))

    // The SVG shows exactly the state's units, each where the state puts it, and nothing else.
    let private shows (container: HTMLElement) (_: ConformanceHost<BarGameState>) (_: RendererBackend) (state: BarGameState) =
        async {
            let objects = int (container.querySelectorAll "[data-scene-control-id]").length
            let wrong =
                state.Units
                |> List.filter (fun unit ->
                    let expected = BarScene.toViewport unit.Position
                    unitCentre container unit <> Some(expected.X, expected.Y))

            return
                if objects = state.Units.Length && wrong.IsEmpty then
                    Ok()
                else
                    Error(sprintf "the surface shows %d objects, not the %d units of sequence %s, or draws a unit elsewhere (%d)" objects state.Units.Length state.Sequence wrong.Length)
        }

    let runConformance (container: HTMLElement) : JS.Promise<obj[]> =
        BrowserConformance.installContextProbe ()
        let route = BrowserRenderers.route ()

        let subject =
            BrowserConformance.subject
                container
                route
                (registry container ignore)
                [ RendererBackend.Svg ]
                (BarSynthetic.frames 3)
                (shows container)

        async {
            let! results = RendererConformance.run subject

            return
                results
                |> List.map (fun result ->
                    createObj
                        [ "check" ==> result.Check
                          "passed" ==> result.Passed
                          "detail" ==> result.Detail ])
                |> Array.ofList
        }
        |> Async.StartAsPromise
