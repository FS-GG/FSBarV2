namespace Broker.Browser.Render.Host

open Browser.Types

/// The browser host of the BAR renderer selection: an Elmish program over `BarClient`, with the published interactive
/// SVG, Pixi and Babylon surfaces registered for the game state (SVG is the default) and switchable at runtime. The
/// host exposes a small imperative handle so a page, or a browser test, can drive it.
[<RequireQualifiedAccess>]
module BarHost =

    /// What a page can do with a mounted host. `select` takes a backend wire token ("svg", "pixi", "babylon") and
    /// returns whether the token named a declared backend; all three are registered, so a switch that fails (for
    /// example no WebGL) falls back to SVG through the model: read `observe` for the outcome. `observe` returns a plain
    /// object: `selected` (the backend), `status`, `available`, `refusal`, `sequence`, `validity`, `units`, `features`,
    /// `selectedUnit` (the selected unit's id, or an empty string), `guestPreviewable` (whether the guest preview can
    /// take the state), `bootstrapSession` (the bound session, or an empty string), `presented`, `remaining` and
    /// `rejected`. `bootstrapJson` binds a live feed to its bootstrap; `observeJson` is checked against it.
    [<AllowNullLiteral>]
    type Handle =
        abstract select: token: string -> bool
        abstract observe: unit -> obj
        abstract step: unit -> unit
        abstract observeJson: json: string -> unit
        abstract bootstrapJson: json: string -> unit
        abstract dispose: unit -> unit

    /// Mount on `container`, presenting deterministic synthetic frames. With `intervalMs` greater than zero the
    /// feed advances itself, one frame per interval, until it is exhausted.
    val mountSynthetic: container: HTMLElement -> frames: int -> intervalMs: int -> Handle

    /// Mount on `container`, presenting recorded observations, each in the canonical JSON form of a
    /// barc.browser.v1 `Observation` (the shape of `fixtures/barc-browser/semantic`). A frame that does not
    /// decode raises, naming its position.
    val mountRecorded: container: HTMLElement -> observations: string[] -> intervalMs: int -> Handle

    /// Mount on `container` for a live feed: nothing is presented until `bootstrapJson` binds the session and
    /// perspective, and every observation (`observeJson`) is then checked against that bootstrap. The transport that
    /// feeds it is not part of this slice.
    val mountLive: container: HTMLElement -> Handle

    /// Test hook: make the next Pixi mount succeed and its asynchronous initialisation fail, to exercise the late-failure
    /// fallback to SVG. It installs the kit's WebGL context probe.
    val armPixiInitFailure: unit -> unit

    /// Run the published conformance kit (`RendererConformance`, FS.GG.Game.Render 0.18.0) on the BAR renderers in
    /// `container`, which must be empty: the kit mounts and disposes the registered backends itself, on the recorded
    /// synthetic states, and reads each backend's output back. Resolves to one object per requirement,
    /// `{ check, passed, detail }`.
    val runConformance: container: HTMLElement -> Fable.Core.JS.Promise<obj[]>
