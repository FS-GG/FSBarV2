# GAME-RENDER-ADOPT-01.8 — BAR adopts the Game.Render renderer selection

Delivery: [FS-GG/.github#5180](https://github.com/FS-GG/.github/issues/5180). Outcome:
[FS-GG/.github#5179](https://github.com/FS-GG/.github/issues/5179). Builds on GAME-RENDER-MULTI-01 (Atlas
`game/renderer-selection-contract`). Siblings: FS.GG.Game#745 (authoring and conformance kit), FS.GG.FourD#56 (the
adoption pattern followed here) and #5181 (BAR Pixi and Babylon adapters, recorded-state play).

## Inventory (what BAR exposes today)

The premise "no BAR browser client exists" is false. The BARC browser client, its contracts and its fixtures are
already in this repository.

| Part | Where | Notes |
|---|---|---|
| Browser client | `src/Broker.Browser.Client` | Fable 5.18.0 + Elmish 5.0.2 state machine (`Domain.fs`, `BarcPreview.fs`) around a JavaScript runtime (`runtime.js`, `live-runtime.js`) that draws a hand-written DOM/SVG map (viewBox 800 by 520, `x = 400 + 2X`, `y = 260 + 2Z`) and owns pairing, strict envelope validation and the WASM guest lifecycle. Built by Vite as `barc-preview.js`. |
| Browser contracts | `src/Broker.Browser.Contracts` (`barc_browser.proto`, `barc_live.proto`) | `barc.browser.v1`: `Bootstrap`, `Observation` (units, features, team economy, validity), guest request/response. 168 and 562 lines. |
| Gateway and live boundary | `src/Broker.Browser.Gateway`, `src/Broker.Browser.Live`, `src/Broker.Browser.Preview` | Authenticated loopback WebSocket that streams `Snapshot.BrowserFeed` to the browser; live control authority. |
| Shared WASM | `src/Broker.Browser.Wasm`, `src/Broker.Browser.SharedWasm` | Guest supervisor; the adapter consumes `FS.GG.Wasm.Browser` and `FS.GG.Wasm.Contracts` 0.2.0. |
| Broker observable state | `src/Broker.Core/Snapshot.fsi` | `GameStateSnapshot` (players, units, buildings, features, map meta) for the TUI and scripting clients; `BrowserObservation` / `BrowserFeed` (`Current` or `Stale`) for the browser. Native coordinates are (X,Y,Z), Y elevation; the browser carries `Vec3` with optional elevation. |
| Broker wire | `src/Broker.Contracts` | `scriptingclient.proto` (`SubscribeState` stream of `StateMsg`, `StateValidity`), and the vendored HighBarV3 set under `highbar/` (`coordinator.proto` `PushState`, `state.proto` `StateSnapshot`/`StateDelta`, `commands.proto`, `events.proto`, `live_control.proto`), pinned to HighBarV3 `dd6f5ef9`. |
| HighBarV3 output | `proto/` (upstream) | `StateSnapshot`: `OwnUnit`, `EnemyUnit` (with `LosQuality`), `RadarBlip`, `MapFeature`, `TeamEconomy`, `StaticMap`, plus `StateDelta` events. The broker maps these into `BrowserObservation`. |
| Recording or replay format | none | There is no capture-and-replay format for broker state. The only recorded browser state is the conformance corpus `fixtures/barc-browser` (and `barc-live`): canonical-JSON `semantic/*.json` beside protobuf `wire/*.bin`, indexed by `manifest.json` with sha256 values. |
| Existing tests | `tests/Broker.Browser.Client.Tests` | Elmish state tests under Fable/Node, a boundary test over the corpus, and Playwright journeys. No hosted workflow runs them. |
| Hosted CI | `.github/workflows` | Path-filtered: knowledge tests, record source, pre-arm source controls, routine eligibility. |

Live BAR state needs the native chain (Coordination#1032 and #4842). This slice uses the recorded corpus and
deterministic synthetic state.

## Home decision: FSBarV2

The BAR browser client stays in `FS-GG/FSBarV2`. No new repository is proposed.

1. **The client already lives here.** The home question assumed there was no browser client. There is one, with its
   pinned Fable 5.18.0 tool, Node and Vite toolchain, exact package locks and a corpus of recorded state. A sibling
   repository would be a second home for the same product, or would force a move of working code.
2. **The state type follows the broker, not the renderer.** `BarGameState` is the browser projection of
   `Snapshot.BrowserObservation` and of `barc_browser.proto`. Those change with the gateway in this repository.
   A sibling repository would hold a vendored copy of the proto and the fixtures and need a cross-repository release
   for every contract change.
3. **Dependency direction is right.** FSBarV2 consumes FS.GG.Game already (`FS.GG.Wasm.*` 0.2.0). FS.GG.Game must not
   depend on a game, and does not here. Renderer adapters registered by BAR sit in the consumer.
4. **Release cadence does not argue for a split.** The client is a private npm package that the receiver adopts as a
   hash-manifested archive, not an independently versioned package; the broker and its browser contract release
   together.
5. **Toolchain coupling is already paid.** The F# and .NET 10 solution and the Fable and Node client share one repository
   and one SDK pin (10.0.403). The new projects add no tool.

Cost accepted: FSBarV2 CI is path-filtered per concern, so this slice adds its own workflow
(`bar-render-selection.yml`) instead of joining a shared pipeline.

## Design

**State type.** `BarGameState` (`src/Broker.Browser.Render/BarGameState.fsi`) is the type registered with
`RendererSelection`: session, decimal sequence, perspective, validity (`Current` or `Stale`), units
(`Own`, `Visual`, `Radar`; optional definition, team, health), features, optional team economy. uint64 values stay
decimal strings, because JavaScript numbers cannot hold them. An absent optional field stays `None` and a real zero
stays `Some 0.0` (the fixtures `observation-optional-absent` and `-present-zero` cover this); elevation is never
invented. `BarGameState.validate` enforces the same invariants as the client's `validateObservation`.

**Mapping from the broker state.** `BarObservationJson.decode` reads the canonical JSON form of a
`barc.browser.v1` `Observation` (bare or inside a server envelope): the form `decodeServerFrame` yields and the
fixtures record. Unknown fields are ignored and an unknown enum value is refused, matching the corpus expectations. `uint32` and `int32`
fields (`definitionId`, `teamId`) must be whole numbers in range: .NET and Fable narrow `-1` or `2.7` differently
(`Some 0u` against `4294967295`; 2 against 2.7), so the decoder refuses them instead.
The producer side, from HighBar `StateSnapshot` through `Snapshot.BrowserObservation` to the wire, is unchanged.

**Shared Scene projection.** `BarScene.view : BarGameState -> Scene` is what all three backends draw: a backdrop,
features, radar blips, visual contacts and own units in a fixed order, using the existing preview's coordinate
mapping. It uses only `Rectangle` and `Circle` nodes, the vocabulary the Pixi and Babylon adapters draw. A stale state
is veiled.

**Elmish client.** `BarClient` (`init`, `update`, `program`) holds `RendererModel<BarGameState>` and a replay feed.
`Observe`, `ObserveJson` and `Step` present a frame only if it validates and follows the presented sequence of the same
session. The one exception is the broker's stale observation (`Gateway.fs` `envelope`): it repeats the last sequence and
carries no units, features, economy or perspective, so an equal-sequence Current-to-Stale frame is accepted and the
presented state keeps its entities and turns `Stale` (veiled). A second equal-sequence stale frame, or a stale frame
behind the presented sequence, is refused. `program` runs the renderer effects on one `RendererHost` through `Cmd.ofEffect` and dispatches the host
feedback afterwards, so no adapter reenters the host. The mounted backend never enters the model.

**Default adapter.** `Broker.Browser.Render.Host` is the Fable-only host. `BarHost` registers the game's retained SVG
surface as the default adapter: `RetainedSvgSurface.create` over `BarScene.retained`, registered with
`RendererRegistry.create` (through `RetainedSvgSurface.registry`, which also declares the viewport). Each observed unit is
one selectable semantic object whose id is the unit's `Id`, with an accessible label (for example "Own unit 77, team 0,
health 80 of 100") and an entry in the surface's accessible mirror; the backdrop, the features and a stale veil are not
selectable. The user's selection is game state (`BarGameState.Selected`): the surface reports it, `BarClient` applies
it with `BarGameState.select` and presents it like any new state, and the surface follows the state afterwards, so it
survives the next observation while its unit is still observed. Pixi and Babylon are not registered, so selecting them
is refused with `Unavailable`, the SVG surface and the game state unchanged. They are #5181.

**Consuming FS.GG.Game, not a fork.** The BAR projects reference the published `FS.GG.Game.Render` 0.18.0 (the
renderer-selection contract, `SceneInteraction` and the conformance kit; its bounded Fable source view serves the Fable
compile) and, in the Fable host, `FS.GG.Game.Render.Browser` 0.18.0 (the retained SVG surface, the Pixi and Babylon
surfaces and the browser conformance support, shipped as Fable source). The four byte-exact pinned copies of
FS.GG.Game `main` (`eng/game-render/`, both `Upstream/` directories and `scripts/check-game-render-pin.py`) that the
first slice carried are deleted. The packages need `Fable.Core` 5.6.1, so both projects moved from 5.3.0, and the
browser test installs the exact JavaScript packages the bindings were generated against, `pixi.js` 8.22.0 and
`@babylonjs/core` 9.33.1, mapped by an import map (`tests/Broker.Browser.Render.Tests/browser/harness.html`) as
FS.GG.Game's own browser smoke does. With no pinned file to keep byte-exact, both projects build under the repository
defaults (nullness on, warnings as errors).

**Conformance kit.** `BarHost.runConformance` runs `RendererConformance` (FS.GG.Game.Render 0.18.0) in the real browser
on the BAR registry through `BrowserConformance.subject`, on three distinct recorded-shape states. Its `shows` probe reads
the retained SVG back (the number of selectable objects and each unit's drawn centre, which must match the state), so a
surface that ignored the state would fail. With only the SVG backend registered the kit runs the `subject`, `registry`,
`round-trip`, `dispose` and `present failure` sections (18 requirements); `switch`, `late failure` and `interaction`
need a second backend and join with #5181.

**Known limits.** `BarHost.Handle.select` returns whether the token names a declared backend, so it is true for `pixi`
and `babylon` even though they are refused; read `observe().refusal` for the outcome. Decode strictness equal to the
client's `validateObservation` (capture time, session and perspective binding), the 64-entity guest limit, generation
and validity sequences and duplicate-key semantics are held for the live slice (#5181).

**The existing client is untouched.** `src/Broker.Browser.Client`, its runtime, the receiver and the WASM path are not
changed. The new SVG surface does not yet carry the preview's selection, ground-target pick, guest preview or live
control; replacing the hand-written view is a later slice.

## Upstream gaps found (candidate Deliveries under the Outcome)

1. **Publication.** Resolved: `FS.GG.Game.Render` and `FS.GG.Game.Render.Browser` 0.18.0 are published and this slice
   consumes them. Same as FourD gap 1.
2. **The Fable view of `FS.GG.UI.Scene` has the types but not the `Scene` module's constructors.** `Scene.filledRectangle`,
   `Scene.circle` and `Scene.group` exist for .NET only, so a portable `view: State -> Scene` must build `SceneNode`
   values by hand. The authoring kit (FS.GG.Game#745) or FS.GG.Rendering should expose the constructors to Fable.
3. **No retained-scene SVG path for the template.** Resolved by `RetainedSvgSurface` and `RendererRegistry.create` in 0.18.0,
   which this slice uses: BAR units are selectable, labelled objects. Selection and the accessible mirror come from the
   surface; BAR's ground-target pick is still the existing client's.
4. **No recording format.** There is no capture-and-replay format for broker state. A recording is a list of canonical
   observation JSON, which `BarObservationJson` and `BarClient.ObserveJson` already consume. A capture tool (broker
   side) and a manifest are an FSBarV2 follow-up; it is not an FS.GG.Game gap.
5. **Fable limitations met (for the kit's notes).** `System.IO.Path.Combine` with several arguments emits an array under
   Fable, and `Double.TryParse` with a provider is refused. The shared code avoids both.

## Evidence in this slice

- `scripts/verify-bar-render.sh` (the hosted workflow runs exactly this): 130 checks (`bar-render checks=130`) and a
  decoded-value digest (`bar-render digest=179673289a01e215 over=20`: the canonical text of every decoded fixture,
  integer probe, stale frame and synthetic frame, hashed with FNV-1a 64). .NET and the Fable-emitted code under Node
  must print identical output, so the gate compares values, not only counts. The Fable compile of the host. Six
  Chromium journeys: default retained SVG draws the state and a step moves it; every unit is a selectable, labelled
  object and a real click on the accessible mirror and a real Escape key change the game state, which survives the next
  observation without rebuilding the surface; Pixi, Babylon and unknown tokens refused with the same SVG node and state;
  recorded fixture decoded, drawn, and a bad frame refused; the broker's stale shape veils the retained units, a
  replayed stale frame is refused, dispose releases the surface; and the published conformance kit.
- Conformance kit: `bar-render kit results=18 failed=0` (FS.GG.Game.Render 0.18.0, SVG only).
- Mutation controls: the previous stale handling fails the unit check and the Chromium journey; the previous lenient
  decoder fails the refusal checks; a Fable-only change to a field no check asserts leaves all checks passing but
  changes the digest, so `cmp` fails; drawing every unit at the wrong x fails three kit requirements (the backend shows
  every presented state, the recovered SVG, the next state).

## Held remainder (not accepted by this slice)

- #5180's "fed from the broker's state stream": this slice feeds recorded and synthetic state. The live stream joins
  when Coordination#1032 and #4842 qualify the headless BAR route.
- Pixi and Babylon adapters, the three-backend switch test and the selector UI (#5181).
- Replacing the existing hand-written preview view with the registered surface, and carrying its input.
