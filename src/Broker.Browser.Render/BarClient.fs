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
    | Select of SelectionRequest
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

    // The broker's stale observation (Gateway.fs `envelope`) carries the last sequence, the session and the
    // validity, and no units, features, economy, perspective or capture time. It says "the feed went stale", not
    // "the world is empty", so the prior entities are retained and only the validity changes.
    let private carriesEntities (state: BarGameState) =
        not state.Units.IsEmpty || not state.Features.IsEmpty || state.Economy.IsSome

    let private retained (current: BarGameState) (stale: BarGameState) : BarGameState =
        if carriesEntities stale then
            stale
        else
            { current with
                Sequence = stale.Sequence
                Validity = BarValidity.Stale }

    // A frame is presented only when it is valid and follows the current one. A new session id starts a new
    // sequence, so replaying a different recording is not mistaken for a replayed frame. The one frame that may
    // repeat the presented sequence is the Current-to-Stale transition: the broker reuses the last sequence.
    let private observe (state: BarGameState) (model: BarClientModel) =
        let current = model.Renderer.State

        match BarGameState.validate maxEntities state with
        | Error reason -> reject reason model, []
        | Ok checked' ->
            let sameSession = checked'.SessionId = current.SessionId

            let staleTransition =
                sameSession
                && checked'.Validity = BarValidity.Stale
                && current.Validity = BarValidity.Current
                && checked'.Sequence = current.Sequence

            if sameSession && not staleTransition && not (BarGameState.follows current checked') then
                reject "observation sequence does not follow the presented one" model, []
            else
                let next =
                    if sameSession && checked'.Validity = BarValidity.Stale then
                        retained current checked'
                    elif sameSession then
                        // The selection is the player's, not the broker's: it follows the unit while it is observed.
                        BarGameState.carrySelection current checked'
                    else
                        // A new session is a new world: nothing is selected in it.
                        { checked' with Selected = None }

                let renderer, effects =
                    RendererSelection.update (RendererMsg.StateChanged next) model.Renderer

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
        | Select request ->
            let current = model.Renderer.State
            let next = BarGameState.select request current

            if next = current then
                model, []
            else
                let renderer, effects = RendererSelection.update (RendererMsg.StateChanged next) model.Renderer
                { model with Renderer = renderer }, effects
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
