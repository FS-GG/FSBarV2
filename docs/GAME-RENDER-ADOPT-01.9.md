# GAME-RENDER-ADOPT-01.9 — BAR on SVG, Pixi and Babylon, with unit selection and a live-slice decode

Delivery: [FS-GG/.github#5181](https://github.com/FS-GG/.github/issues/5181). Outcome:
[FS-GG/.github#5179](https://github.com/FS-GG/.github/issues/5179). Builds on `docs/GAME-RENDER-ADOPT-01.8.md`
(#5180: the published FS.GG.Game.Render 0.18.0, the BAR game-state type and the client).

## Update: FS.GG.Game 0.19.0 (FS-GG/FS.GG.Game#753)

BAR now consumes `FS.GG.Game.Render` and `FS.GG.Game.Render.Browser` 0.19.0 (both projects and their locks; the packages'
other requirements are unchanged). 0.19.0 brings the Babylon orthographic 2D camera, the CSS-scaled pick fix and the
conformance kit's `pixels` section. BAR adopts `RendererConformance.withPixels`: `ScenePixels.expectations` over
`BarScene.view` and `BrowserConformance.pixelProbe`, so the kit reads back what the SVG, Pixi's canvas and Babylon's canvas
DREW and checks it against the scene, and checks that the hit region and the drawn edge of each box object (the radar
squares) coincide. The kit now runs 117 requirements (110 before; 7 are `pixels`), all passing on software WebGL and on
fdev's `--gpu` flags.

Pixel findings, read from a screenshot of each output at the centre of a unit of each kind (software and GPU agree):

| Point | SVG | Pixi | Babylon (software) | Babylon (RADV) |
|---|---|---|---|---|
| backdrop | 18,24,32 | 18,24,32 | 14,18,24 | 13,18,24 |
| own unit | 84,200,120 | 84,200,120 | 63,150,90 | 63,150,90 |
| visual unit | 216,84,72 | 216,84,72 | 162,63,54 | 162,63,54 |
| radar unit | 232,180,60 | 232,180,60 | 174,135,45 | 174,135,45 |
| feature | 140,148,156 | 140,148,156 | 105,111,117 | 105,111,117 |

Every unit is where `BarScene` puts it on all three backends. Babylon is still lit: it draws a flat shape at 0.75 of the
scene colour. That is not gone: 0.19.0 declares it as Babylon's appearance in the kit's pixel probe (tolerance 4 per
channel), so the kit expects it instead of tolerating a darker pixel. The one-unit difference on the backdrop between
software and GPU rasterisers is inside that tolerance. A negative control (radar squares drawn 3 pixels larger than their
selectable bounds) fails the `pixels` hit-region-and-edge requirement on all three backends.

## What a player gets

On recorded or synthetic state, BAR renders on SVG, Pixi and Babylon from one `BarScene.view`, and the player switches
backend at run time (`RendererMsg.SelectBackend`, from `BarHost` `select`) without losing game state. Units are selectable
on all three through the published interaction contract (`SceneInteraction`): a pointer press on a unit, the keyboard
(arrows, Enter or Space, Escape) and the accessible mirror (one labelled button per unit, `aria-pressed`, a polite status).
The selection is game state (`BarGameState.Selected`), so it survives every switch and the next observation while its
unit is still observed. Live play stays a remaining assertion: the native chain is Coordination#1032 and #4842, and
nothing here opens a transport.

## Design

- **Registry.** `BarHost.registry` registers the published `SvgSurface`, `PixiSurface` and `BabylonSurface` for
  `BarGameState`, each through `SceneSurface.interactiveAdapter BarScene.view BarScene.interaction selection`. SVG is the
  default adapter (`RendererRegistry.create`); Pixi and Babylon join with `RendererRegistry.register`. The selection route
  sends every `SelectionRequest` to `BarClient`'s `Select` message.
- **Selectable units.** `BarScene.objects` gives each unit a `SelectableObject` (id = the unit id, a label such as
  "Own unit 1, team 0, health 800 of 800", bounds around where the unit is drawn, an ellipse for own and visual units, a box
  for radar). `BarScene.interaction` is `SceneInteraction.create` over those objects, `Selected` and `BarGameState.select`.
  The canvas backends show the selection as a ring behind the unit.
- **Retained SVG.** #5180 registered `RetainedSvgSurface` as the default. The conformance kit's `interaction` section cannot
  run on it (see gap 1), so the three-backend registry uses the interactive `SvgSurface` instead, and `BarScene.retained` is
  removed. The retained surface remains the right choice for a game that has no canvas backends.
- **Late failure.** A Pixi mount that returns `Ok` and then fails asynchronously reports through `PixiOptions.OnFailure`
  to the program, which fails the current attempt (`RendererMsg.MountFailed`); the model falls back to SVG with the state
  intact. The kit's own run binds the same adapter to its `LateFailureRoute`.
- **Live feed.** `BarClient.initLive`, `programLive` and `BarHost.mountLive` start a feed that presents nothing until a
  `Bootstrap` (or `BootstrapJson`) binds it. The transport is not part of this slice.

## Live-slice decode strictness (from #5181's scope notes)

Equal to the existing client's `validateBootstrap` and `validateObservation` (`src/Broker.Browser.Client/runtime.js`).

| Rule | Where |
|---|---|
| `capturedAtUnixMs` is required (a decimal without leading zeros) for a `Current` observation; a `Stale` one carries none | `BarGameState.validate` |
| Session and perspective are bound to the bootstrap: the session must match; a `Current` observation's perspective must match; a `Stale` one's is that perspective or none | `BarGameState.validateBound`, `BarClient` `Bootstrap` |
| The negotiated `limits.maxEntities` bounds units and features together | `validateBound` |
| The 64-unit guest preview bound is separate from the negotiated limit: more than 64 current units are rendered whole and never truncated, and are reported as not guest-previewable | `BarGameState.guestPreviewable`, `observe().guestPreviewable` |
| Generation and validity sequences (`unit.generation`, `validity.lastSequence`, `validity.receivedSequence`) are decimal strings that are zero or have no leading zero | `BarObservationJson.decode` |
| A duplicate key in one JSON object is refused: `JSON.parse` keeps the last duplicate and other readers the first, so it has no single meaning. A unit and a feature may share an id (separate identity spaces) | `BarObservationJson.decode` |
| The bootstrap itself: `bar`, `1.0.0`, `barc-preview-v1`, session, perspective, read-only mode, valid validity, positive integer limits | `BarObservationJson.decodeBootstrap` |
| A live feed refuses an observation that arrives before its bootstrap | `BarClient.initLive` |

A recording that carries no bootstrap is still checked against the ceiling (`BarClient.maxEntities`) only.

## Evidence

- `scripts/verify-bar-render.sh`: `bar-render checks=200` from .NET and from Fable under Node (identical output) and
  `bar-render digest=e0bc177150cc773a over=41`. The digest covers the new bootstrap and strictness probes.
- Chromium (11 journeys): the default SVG draws and steps; unit selection from the mirror and the keyboard; switching
  across SVG, Pixi and Babylon in both orders with the selection, the sequence and the unit count kept and exactly one
  backend holding the page; a real pointer press on a unit and Escape on each of the three backends; a Pixi mount that
  fails after returning falls back to SVG; the recorded fixture; the broker's stale shape; a live feed bound to its
  bootstrap; and the published conformance kit.
- Kit: `bar-render kit results=110 failed=0` (FS.GG.Game.Render 0.18.0, all three backends, with the `interaction` section);
  on 0.19.0, `bar-render kit results=117 failed=0` with the `pixels` section (see the update above).
  It passes on SwiftShader and on fdev's `--gpu` flag set (`ANGLE ... AMD ... radv` read from `WEBGL_debug_renderer_info`).
- Mutation controls: duplicate-key refusal off fails "duplicate top-level sequence is refused"; the capture-time rule off
  fails "a current observation without a capture time is refused"; perspective binding off fails "another perspective is
  refused for a current observation".

## Upstream gaps found

1. **`RetainedSvgSurface` does not meet the kit's interaction contract** ([FS-GG/FS.GG.Game#767](https://github.com/FS-GG/FS.GG.Game/issues/767)). With it as the default, the kit's `interaction`
   section fails 9 SVG requirements (no `data-renderer` on the root or mirror, so no input-host census, mirror or tab
   order) and the two cross-backend selection checks. A game cannot combine a retained default with interactive canvas
   adapters and pass the kit. FS.GG.Game should tag the retained surface like `SvgSurface.mountInteractive` does, or the
   kit should say how a retained default declares interaction.
2. **`LateFailureRoute` cannot be bound by a host that does not use `RendererDriver`** ([FS-GG/FS.GG.Game#768](https://github.com/FS-GG/FS.GG.Game/issues/768)). `Bind` is not in the `.fsi`, so
   `BrowserRenderers.declare` and `BrowserRenderers.start` suit only a program that dispatches through the driver. BAR runs
   `RendererHost` from an Elmish `Cmd.ofEffect` (the host `Run` is not reentrant) and so builds the Pixi surface itself
   (about ten lines) to set `PixiOptions.OnFailure`. A public bind, or a driver that exposes effect running to an Elmish
   program, would avoid that copy.
3. **The Fable view of `FS.GG.UI.Scene` has the types but not the `Scene` module constructors** (unchanged from 01.8). BAR-side: `BarScene` builds `SceneNode` values by hand (`node`, `group`, `filledRectangle`, `circle`) so one file compiles for .NET and Fable. It is not an FS.GG.Game defect; the constructors belong with FS.GG.Rendering, and BAR drops its copies when they reach the Fable view.
4. **A consumer re-pins the JavaScript packages** ([FS-GG/FS.GG.Game#769](https://github.com/FS-GG/FS.GG.Game/issues/769)). The package ships the exact npm closures under `js-bindings/` and the
   bindings import `pixi.js` and `@babylonjs/core/*`, but a consumer writes its own import map and pins (`pixi.js` 8.22.0,
   `@babylonjs/core` 9.33.1). A packaged import-map helper would remove it.

## Held remainder

- **Zero coordinates are refused.** proto3 omits default values, so a unit or feature at `x = 0` or `z = 0` arrives without
  that member and decodes as "position.x is missing". This is in parity with `assertPosition` in
  `src/Broker.Browser.Client/runtime.js`, which refuses the same observation, so the decoder is unchanged here. The fix
  must change both readers together, with a shared fixture for a position on each axis and at the origin. FSBarV2 has issues
  disabled, so the follow-up is raised through the organization intake against FS-GG/.github#5181.

- Live play: the transport that feeds `mountLive` waits for the native chain (Coordination#1032 and #4842). Its numbers are
  recorded in the 01.2 harness.
- Replacing the existing hand-written preview view and carrying its ground-target pick and guest preview.
- Babylon still draws lit at about 0.75 of the scene colour (now declared and checked by the kit, above), and
  `webglcontextlost` is not handled (FS.GG.Game known limits). The selector UI for a page is the host's `select`; a visible control is not built.
