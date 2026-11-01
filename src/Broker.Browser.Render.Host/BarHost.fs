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
        abstract bootstrapJson: json: string -> unit
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
              "guestPreviewable" ==> (BarGameState.guestPreviewable state |> Result.isOk)
              "bootstrapSession" ==> (match model.Bootstrap with Some b -> b.SessionId | None -> "")
              "presented" ==> model.Presented
              "remaining" ==> model.Remaining.Length
              "rejected" ==> (model.Rejected |> Array.ofList) ]

    let private label = "BAR tactical map"

    /// The BAR renderers in `container`, registered for the game-state type: the published interactive SVG, Pixi and
    /// Babylon surfaces, each projecting `BarScene.view` and made interactive by `BarScene.interaction`. A pointer
    /// press, the keys and the accessible mirror of whichever backend is mounted ask `selection` for a change of the
    /// selected unit. SVG is the default adapter (`RendererRegistry.create`). `lateFailure` is called each time a Pixi
    /// mount is created and returns where that mount reports an asynchronous initialisation failure.
    let private registry
        (container: HTMLElement)
        (selection: SelectionRoute)
        (lateFailure: unit -> (RendererBackend -> string -> unit))
        : RendererRegistry<BarGameState> =
        let adapt surface =
            SceneSurface.interactiveAdapter BarScene.view BarScene.interaction selection surface

        let svg = SvgSurface.surface container (SvgSurface.defaultOptions label BarScene.width BarScene.height)

        let pixi =
            let options () =
                { PixiSurface.defaultOptions label BarScene.width BarScene.height with
                    OnFailure = lateFailure () RendererBackend.Pixi }

            SceneSurface.create RendererBackend.Pixi (fun scene -> PixiSurface.mountScene container (options ()) scene)
            |> SceneSurface.withInteraction (fun request frame -> PixiSurface.mountInteractive container (options ()) request frame)

        let babylon =
            BabylonSurface.surface container (BabylonSurface.defaultOptions label BarScene.width BarScene.height)

        match RendererRegistry.create (adapt svg) with
        | Ok registry ->
            registry
            |> RendererRegistry.register (adapt pixi)
            |> RendererRegistry.register (adapt babylon)
        | Error reason -> failwithf "the SVG surface is not an SVG adapter: %s" reason

    let private mount (container: HTMLElement) (frames: BarGameState list option) (intervalMs: int) : Handle =
        let mutable latest: BarClientModel option = None
        let mutable send: BarClientMsg -> unit = ignore
        let mutable disposed = false
        let selection = SelectionRoute.create ()
        selection |> SelectionRoute.bind (fun request -> send (Select request))

        // A Pixi mount that fails after it returned `Ok` reports here while it is undisposed (the adapter guarantees
        // that); it fails the program's current attempt, which is that mount's, and the model falls back to SVG.
        let lateFailure () =
            fun (backend: RendererBackend) (reason: string) ->
                match latest with
                | Some model when not disposed -> send (Renderer(RendererMsg.MountFailed(backend, model.Renderer.Attempt, reason)))
                | _ -> ()

        let registry = registry container selection lateFailure
        let mutable timer: float option = None

        let render model dispatch =
            latest <- Some model
            send <- dispatch

        let program, host =
            match frames with
            | Some frames -> BarClient.program registry frames render
            | None -> BarClient.programLive registry render

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
            member _.bootstrapJson json = if not disposed then send (BootstrapJson json)

            member _.dispose() =
                if not disposed then
                    disposed <- true
                    stop ()
                    host.Dispose() }

    let mountSynthetic (container: HTMLElement) (frames: int) (intervalMs: int) : Handle =
        mount container (Some(BarSynthetic.frames frames)) intervalMs

    let mountLive (container: HTMLElement) : Handle = mount container None 0

    [<Emit("(window.__glHook.failNext.pixi = 1, undefined)")>]
    let private armNextPixiMount () : unit = jsNative

    let armPixiInitFailure () : unit =
        BrowserConformance.installContextProbe ()
        armNextPixiMount ()

    let mountRecorded (container: HTMLElement) (observations: string[]) (intervalMs: int) : Handle =
        let decoded =
            observations
            |> Array.mapi (fun index json ->
                match BarObservationJson.decode json with
                | Ok state -> state
                | Error reason -> failwithf "recorded observation %d did not decode: %s" index reason)
            |> List.ofArray

        mount container (Some decoded) intervalMs

    // --- The conformance kit ---------------------------------------------------------------------------------------

    let private near (a: float * float) (b: float * float) =
        abs (fst a - fst b) < 14.0 && abs (snd a - snd b) < 14.0

    let private centreOf (unit: BarUnit) =
        let p = BarScene.toViewport unit.Position
        p.X, p.Y

    // What the SVG draws of the units: the centre of every circle (own and visual units) and of every 14-pixel
    // square (radar). The hit shapes in the selectables layer are ellipses and rectangles with no fill, and are not
    // counted: only shapes with a `fill-opacity` other than 0 are drawn.
    let private svgMarkers (container: HTMLElement) : (float * float) list =
        let number (element: Element) (name: string) = float (element.getAttribute name)
        let drawn (element: Element) = element.getAttribute "fill-opacity" <> "0"
        let all (selector: string) = container.querySelectorAll selector

        [ for index in 0 .. int (all "circle").length - 1 do
              let circle = (all "circle").[index]
              if drawn circle then yield number circle "cx", number circle "cy"
          for index in 0 .. int (all "rect").length - 1 do
              let square = (all "rect").[index]
              if drawn square && number square "width" = 14.0 then
                  yield number square "x" + 7.0, number square "y" + 7.0 ]

    // The SVG draws exactly the state's units, each where the state puts it, and has one mirror entry for each.
    let private showsSvg (container: HTMLElement) (state: BarGameState) =
        let markers = svgMarkers container
        let entries = int (container.querySelectorAll "[data-scene-control-id]").length
        let centres = state.Units |> List.map centreOf

        let missing = centres |> List.filter (fun centre -> not (markers |> List.exists (near centre)))

        if markers.Length = centres.Length && entries = centres.Length && missing.IsEmpty then
            Ok()
        else
            Error(sprintf "the surface draws %d units and %d mirror entries, not the %d units of sequence %s, or draws one elsewhere (%d)" markers.Length entries centres.Length state.Sequence missing.Length)

    // A canvas is read back: every unit's centre is a unit colour, and the centre of a unit that only another state has
    // is the backdrop. Babylon draws lit (about three quarters of the scene colour), so "unit colour" is "not backdrop".
    let private isBackdrop (pixel: int[]) =
        pixel.Length >= 3 && abs (pixel.[0] - 18) < 30 && abs (pixel.[1] - 24) < 30 && abs (pixel.[2] - 32) < 30

    let private showsCanvas
        (container: HTMLElement)
        (others: BarGameState list)
        (host: ConformanceHost<BarGameState>)
        (backend: RendererBackend)
        (state: BarGameState)
        =
        async {
            let ownCentres = state.Units |> List.map centreOf

            let onlyElsewhere =
                others
                |> List.collect (fun other -> other.Units |> List.map centreOf)
                |> List.filter (fun centre -> ownCentres |> List.forall (fun own -> not (near own centre)))
                |> List.truncate 3

            let mutable problem = None

            for (x, y) in state.Units |> List.map centreOf |> List.truncate 4 do
                if problem.IsNone then
                    let! pixel = BrowserConformance.readPixel host container backend (int x) (int y) (fun p -> not (isBackdrop p)) 30
                    if isBackdrop pixel || pixel.Length = 0 then
                        problem <- Some(sprintf "%s: the unit at (%g, %g) is not drawn" (RendererBackend.id backend) x y)

            for (x, y) in onlyElsewhere do
                if problem.IsNone then
                    let! pixel = BrowserConformance.readPixel host container backend (int x) (int y) isBackdrop 30
                    if not (isBackdrop pixel) then
                        problem <- Some(sprintf "%s: (%g, %g) belongs to another state but is not backdrop" (RendererBackend.id backend) x y)

            return
                match problem with
                | None -> Ok()
                | Some reason -> Error reason
        }

    /// The states the kit presents: three recorded-shape frames whose units sit in different places.
    let private kitStates = BarSynthetic.frames 3

    let runConformance (container: HTMLElement) : JS.Promise<obj[]> =
        BrowserConformance.installContextProbe ()
        let route = BrowserRenderers.route ()
        let selection = SelectionRoute.create ()
        let registry = registry container selection route.Capture

        let shows (host: ConformanceHost<BarGameState>) (backend: RendererBackend) (state: BarGameState) =
            match backend with
            | RendererBackend.Svg -> async { return showsSvg container state }
            | _ -> showsCanvas container (kitStates |> List.filter (fun other -> other <> state)) host backend state

        let subject =
            BrowserConformance.subject container route registry RendererBackend.all kitStates shows
            // What each backend DREW (FS.GG.Game#753): the pixels BarScene.view decides, read back from the SVG, Pixi's canvas
            // and Babylon's canvas, with Babylon's lit appearance declared by the probe.
            |> RendererConformance.withPixels
                (fun state -> ScenePixels.expectations BarScene.width BarScene.height (BarScene.view state))
                (BrowserConformance.pixelProbe container BarScene.width BarScene.height)
            |> RendererConformance.withInteraction BarScene.interaction selection (BrowserConformance.interactionProbe container)

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
