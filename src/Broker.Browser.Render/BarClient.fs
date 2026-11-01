namespace Broker.Browser.Render

open System
open Elmish
open FS.GG.Game.Render

[<NoEquality; NoComparison>]
type BarClientModel =
    { Renderer: RendererModel<BarGameState>
      Remaining: BarGameState list
      Presented: int
      Rejected: string list }

type BarClientMsg =
    | Renderer of RendererMsg<BarGameState>
    | Observe of BarGameState
    | ObserveJson of string
    | Step

[<RequireQualifiedAccess>]
module BarClient =

    let maxEntities = 4096
    let maxRejections = 8

    let private reject (reason: string) (model: BarClientModel) : BarClientModel =
        { model with Rejected = reason :: model.Rejected |> List.truncate maxRejections }

    let init (registry: RendererRegistry<BarGameState>) (frames: BarGameState list) =
        let first, rest =
            match frames with
            | [] -> BarGameState.empty, []
            | head :: tail -> head, tail

        let renderer, effects = RendererSelection.init registry first

        { Renderer = renderer
          Remaining = rest
          Presented = (if frames.IsEmpty then 0 else 1)
          Rejected = [] },
        effects

    // A frame is presented only when it is valid and follows the current one. A new session id starts a new
    // sequence, so replaying a different recording is not mistaken for a replayed frame.
    let private observe (state: BarGameState) (model: BarClientModel) =
        let current = model.Renderer.State

        match BarGameState.validate maxEntities state with
        | Error reason -> reject reason model, []
        | Ok checked' ->
            if checked'.SessionId = current.SessionId && not (BarGameState.follows current checked') then
                reject "observation sequence does not follow the presented one" model, []
            else
                let renderer, effects =
                    RendererSelection.update (RendererMsg.StateChanged checked') model.Renderer

                { model with
                    Renderer = renderer
                    Presented = model.Presented + 1 },
                effects

    let update (msg: BarClientMsg) (model: BarClientModel) =
        match msg with
        | Renderer inner ->
            let renderer, effects = RendererSelection.update inner model.Renderer
            { model with Renderer = renderer }, effects
        | Observe state -> observe state model
        | ObserveJson json ->
            match BarObservationJson.decode json with
            | Ok state -> observe state model
            | Error reason -> reject ("observation did not decode: " + reason) model, []
        | Step ->
            match model.Remaining with
            | [] -> model, []
            | next :: rest -> observe next { model with Remaining = rest }

    let available (model: BarClientModel) = RendererSelection.available model.Renderer

    let program
        (registry: RendererRegistry<BarGameState>)
        (frames: BarGameState list)
        (render: BarClientModel -> (BarClientMsg -> unit) -> unit)
        =
        let host = RendererHost.create registry

        let perform (effects: RendererEffect<BarGameState> list) : Cmd<BarClientMsg> =
            match effects with
            | [] -> Cmd.none
            | _ ->
                Cmd.ofEffect (fun dispatch ->
                    // Feedback is dispatched after `Run` returns, so no adapter can reenter the host.
                    host.Run effects |> List.iter (fun feedback -> dispatch (Renderer feedback)))

        let start () =
            let model, effects = init registry frames
            model, perform effects

        let step msg model =
            let next, effects = update msg model
            next, perform effects

        Program.mkProgram start step render, (host :> IDisposable)
