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
              "presented" ==> model.Presented
              "remaining" ==> model.Remaining.Length
              "rejected" ==> (model.Rejected |> Array.ofList) ]

    let private mount (container: HTMLElement) (frames: BarGameState list) (intervalMs: int) : Handle =
        let registry =
            SvgSurface.registry
                container
                (SvgSurface.defaultOptions "BAR tactical map" BarScene.width BarScene.height)
                BarScene.view

        let mutable latest: BarClientModel option = None
        let mutable send: BarClientMsg -> unit = ignore
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
                | None -> null

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
