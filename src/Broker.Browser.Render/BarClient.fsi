namespace Broker.Browser.Render

open System
open Elmish
open FS.GG.Game.Render

/// The Elmish model of the BAR browser client: renderer selection over `BarGameState`, plus a replay feed.
/// Resource handles (the mounted backend) never enter the model; `program` keeps them in a `RendererHost`.
[<NoEquality; NoComparison>]
type BarClientModel =
    { /// Renderer selection. Its `State` is the BAR game state and survives every backend switch.
      Renderer: RendererModel<BarGameState>
      /// Recorded or synthetic frames not yet presented, in order.
      Remaining: BarGameState list
      /// How many frames the feed has presented.
      Presented: int
      /// The most recent refused observations, newest first, at most `BarClient.maxRejections`.
      Rejected: string list }

type BarClientMsg =
    /// A renderer-selection message: a backend switch, or host feedback.
    | Renderer of RendererMsg<BarGameState>
    /// One observation from any feed (live, recorded or synthetic). It is checked before it is presented. It must
    /// follow the presented sequence of the same session, except the broker's stale observation: that repeats the
    /// last sequence, carries no entities, and turns the presented state `Stale` while keeping its units.
    | Observe of BarGameState
    /// One observation as canonical JSON, decoded then treated as `Observe`.
    | ObserveJson of string
    /// Present the next frame of the replay feed. A feed with no frames left ignores it.
    | Step

[<RequireQualifiedAccess>]
module BarClient =

    /// The entity limit applied to every observation (the existing client's `MAX_GUEST_ENTITIES` bound is 64;
    /// a broker session negotiates its own, so this is the browser-side ceiling used when none is given).
    val maxEntities: int

    /// How many refusals the model keeps.
    val maxRejections: int

    /// Start on the default SVG backend with the first frame of `frames` (or the empty state), keeping the rest
    /// as the replay feed. Returns the renderer effects to run.
    val init:
        registry: RendererRegistry<BarGameState> ->
        frames: BarGameState list ->
            BarClientModel * RendererEffect<BarGameState> list

    /// Apply one message. Pure: the renderer effects are returned, not performed.
    val update:
        msg: BarClientMsg -> model: BarClientModel -> BarClientModel * RendererEffect<BarGameState> list

    /// The backends a selector should offer.
    val available: model: BarClientModel -> RendererBackend list

    /// An Elmish program that performs the renderer effects on one `RendererHost` and dispatches its feedback.
    /// `render` receives each model, for the host page to project (selector, status, hooks). Disposing the
    /// returned value releases the mounted backend.
    val program:
        registry: RendererRegistry<BarGameState> ->
        frames: BarGameState list ->
        render: (BarClientModel -> (BarClientMsg -> unit) -> unit) ->
            Program<unit, BarClientModel, BarClientMsg, unit> * IDisposable
