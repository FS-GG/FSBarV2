namespace Broker.Browser.Render.Host

open Browser.Types

/// The browser host of the BAR renderer selection: an Elmish program over `BarClient`, with the retained SVG
/// surface registered as the default (and, until the Pixi and Babylon adapters of GAME-RENDER-ADOPT-01.9, only)
/// backend. The host exposes a small imperative handle so a page, or a browser test, can drive it.
[<RequireQualifiedAccess>]
module BarHost =

    /// What a page can do with a mounted host. `select` takes a backend wire token ("svg", "pixi", "babylon") and
    /// returns whether the token named a declared backend; an unregistered backend is refused through the model,
    /// so read `observe` for the outcome. `observe` returns a plain object: `selected`, `status`, `available`,
    /// `refusal`, `sequence`, `validity`, `units`, `features`, `presented`, `remaining`, `rejected`.
    [<AllowNullLiteral>]
    type Handle =
        abstract select: token: string -> bool
        abstract observe: unit -> obj
        abstract step: unit -> unit
        abstract observeJson: json: string -> unit
        abstract dispose: unit -> unit

    /// Mount on `container`, presenting deterministic synthetic frames. With `intervalMs` greater than zero the
    /// feed advances itself, one frame per interval, until it is exhausted.
    val mountSynthetic: container: HTMLElement -> frames: int -> intervalMs: int -> Handle

    /// Mount on `container`, presenting recorded observations, each in the canonical JSON form of a
    /// barc.browser.v1 `Observation` (the shape of `fixtures/barc-browser/semantic`). A frame that does not
    /// decode raises, naming its position.
    val mountRecorded: container: HTMLElement -> observations: string[] -> intervalMs: int -> Handle

    /// Run the published conformance kit (`RendererConformance`, FS.GG.Game.Render 0.18.0) on the BAR renderers in
    /// `container`, which must be empty: the kit mounts and disposes the registered backends itself, on the recorded
    /// synthetic states, and reads each backend's output back. Resolves to one object per requirement,
    /// `{ check, passed, detail }`.
    val runConformance: container: HTMLElement -> Fable.Core.JS.Promise<obj[]>
