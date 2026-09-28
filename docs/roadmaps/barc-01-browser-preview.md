# BARC-01.3 browser and custom-WASM preview

**Selected implementation window, 2026-09-28.** Owner: `FS-GG/FSBarV2`. Durable path:
`docs/roadmaps/barc-01-browser-preview.md`. `.3a/.3b` are source delivered;
`.3c–.3e` remain unfinished. This expands the existing **BARC-01** feature and
preserves its milestone and cost lineage.

Programme: [Unified §9.8](https://github.com/FS-GG/.github/blob/main/docs/2026-09-07-154210-fs-gg-unified-development-roadmap.md#98-feature-parts-and-subroadmap-index).
Requirements remain in the [original BARC design](https://github.com/FS-GG/.github/blob/main/docs/2026-09-08-134900-fable-bar-wasm-client-design-roadmap.md),
especially §§4.3, 5.2, 8, 9 and 12.1. Earlier foundation/native ledgers retain
completion authority. This document owns `.3a–.3e`; the original `.3` entry
summarizes their eventual acceptance.

The outcome is a Fable/Elmish tactical preview connected to the existing broker,
with equivalent mouse/keyboard actions interpreted by real WASM guests. The same
product composition and example guest run in a clean generated Fable-game
receiver. Typed intentions remain previews: no browser-to-native submission
operation is introduced. This window does not deliver `.4` native control.

**Dispatch condition satisfied:** the parent read back Unified closure
[PR #3957](https://github.com/FS-GG/.github/pull/3957) at protected merge
`f4df3703023254efa9a51b6ab5b3fc9008b4ce66`, with the qualified candidate tree.
Viewer and `.3a/.3b` closure now appear in §0. The parent may select the next
window after accepting these joins/touch-sets; this planner does not dispatch it.

## Accepted source and actual remaining gaps

The fork's remote `main` was read back at
`16e0a1bddaa64f38754824b012195c803361aedc`, merged [PR #3](https://github.com/FS-GG/FSBarV2/pull/3).
The accepted merge has the qualified candidate `c00d11d` tree. Inspect the
[owning first-window evidence](https://github.com/FS-GG/FSBarV2/blob/16e0a1bddaa64f38754824b012195c803361aedc/docs/roadmaps/evidence/barc-01.3ab-browser-boundary.md)
and reuse these surfaces:

| Capability | Delivered evidence and next consequence |
| --- | --- |
| Rich broker projection | `Broker.Core/Snapshot.*`, `Broker.Protocol/WireConvert.*` and `BrokerState.*` preserve own/visual/radar, features, X/Z plus elevation and optional economy through one materializer. A real coordinator → production Hub → authenticated WebSocket suite passes 10 cases. Keep perspective filtering and baseline invalidation there. |
| Browser transport | `Broker.Browser.Gateway/Gateway.*` starts an optional loopback HTTP WebSocket listener sharing the existing Hub. Authentication is the first client frame; bootstrap is the first authenticated **WebSocket** server envelope. There is no HTTP bootstrap endpoint or launchable preview application yet. Wrong origin/game/profile/session, replaced sessions and bounded teardown are covered. All post-authentication client frames refuse. |
| Product schema and codec | `Broker.Browser.Contracts/barc_browser.proto` and `generated/codec.js` define `barc.browser.v1`. Fable 5.18.0/Core 5.3.0 compatibility proves 19 decoded cases plus two malformed/truncated exceptions. Unknown enums survive, unknown envelopes have no body, and the 65,537-byte fixture is only a boundary observation. A product client must enforce byte limits and semantic validity before use. |
| Real Worker and Rust guests | `Broker.Browser.Wasm/index.js` exports `GuestSupervisor`; actual Chromium Worker tests pass 24 cases. Reuse its external phase watchdog, byte/range checks and request/session/context/generation fences. Rust manual and separately built odd-ID example guests use the same ABI and can load without a host rebuild. This is host qualification, not product UI acceptance. |
| Integration constraints | Supervisor permits one pending call, with 64 KiB input/output and a 250 ms default per-phase watchdog. The Rust SDK accepts at most 64 observed units and clears selection on each observation. Production UI must serialize calls, respect encoded-request overhead and visibly handle capacity. Continuous updates require a narrow guest selection-retention correction. |
| Missing product surfaces | No Fable tactical application, transport semantic guard, user input adapter, pairing/module UI, executable fixture-backed companion, product asset archive or generated BAR receiver exists. Browser ABI tests do not establish these paths. |
| Qualified base | Release solution build had zero warnings/errors; Core 58, Protocol 58, Contracts 6, Tui 44, SurfaceArea 25, gateway 10, Node 6 and Worker 24 passed. Integration stays 28/31: three inherited admin fixtures expect `AdminNotAvailable` instead of strict-decoding `InvalidPayload`. Preserve the attribution; do not call the entire suite green. |

Schema SHA-256 is `752ef84e8631de6e08f5ef94851fcbd918e451ebfb5d446a705baa317f65ea0f`;
corpus bundle SHA-256 is `0cd8abc6beaa7f92425c6e56ba7faa3ff7d62d30989a6ab95134a72d4e420bbf`.
Existing locks pin protobuf.js 8.8.0, generator 2.7.0, Long 5.3.2,
Google.Protobuf 3.34.1 and Grpc.Tools 2.76.0. Guest builds use Rust 1.90.0.
Do not generate another wire schema or replace the working codecs.

The [native Move proof](https://github.com/FS-GG/FSBarV2/blob/b096ea17608c572ad2d0d3d4a961ad7f1c4a3b78/docs/roadmaps/evidence/barc-01.2c-real-fsbar-native-move.md)
remains genuine local native evidence at its separate boundary. HighBar source
`81016ee38b123a490e6ff06037cdc2f56a105a96` and frozen native protobufs are unchanged
by this window. The viewer detachment is already merged. No SkiaViewer work is
needed. Fork source/native readback does not imply hosted CI: this fork has no
configured workflows/protection. Upstream EHotwagner delivery remains 403.

## Fixed composition and first integration join

Use the existing codec and Worker behind new product-owned Fable modules in
`src/Broker.Browser.Client/`. A small `BarcPreview.mount(root, options)` surface
starts the component and returns disposal; options identify the broker endpoint,
pairing input and trusted asset base. The local entry point and generated receiver
call the same surface. Freeze this mount/asset-layout interface in an early local
commit; it is a product composition seam, not a general game framework.

Add a dedicated `src/Broker.Browser.Preview/` executable which composes the
production Protocol host, Gateway and static client assets. Its explicit fixture
mode feeds BAR-shaped observations through the public HighBar coordinator gRPC
service. It does not call browser projection setters to simulate a successful
journey, create a second state authority, launch a native game or dispatch commands.
Reuse fixture values and setup conventions from `GatewayTests.fs`, with a
repeatable sequence of complete snapshots, gap, recovery and session replacement.
The fixture runner is part of this bounded preview composition and is labelled
as such in the UI.

The executable creates an expiring session credential and a private local pairing
handoff; the UI accepts endpoint/session/credential through its pairing controls.
The browser supplies its own origin. Keep credentials out of asset bundles,
checked-in fixtures, URLs, localStorage and captured public evidence. The generated
receiver's actual served origin must be passed to Gateway. Preserve the current
first-message authentication instead of inventing a second authentication route.

The product archive preserves the relative client/codec/Worker source layout.
A generated receiver installs that exact tree beneath its `Client` subtree and
compiles the same Fable sources, with the same trusted Worker and guest bytes.
Receiver packaging adds only its entry-point adapter, declared dependencies and
asset/build wiring. It must not rewrite BAR implementation sources. Record hashes
for both consumed compositions. Production asset URLs must work at a non-root
base path; neither sibling checkout references nor a development server proxy
counts as receiver acceptance.

**First acceptance example:** start the actual preview executable and browser
entry point, pair through the visible controls, load the manual `.wasm`, and receive
an owned unit 77, visual enemy, radar-only contact, feature 77 and optional economy
from the real broker connection. Click owned unit 77, allow another complete
observation, then confirm ground `(128.25, -64.5)` through mouse targeting. Repeat
by focusing the owned-unit list and using the keyboard ground cursor/confirmation.
Both paths must yield the same guest-produced Move payload, including unit 77 and
X/Z; compare payload semantics independently of request counters. Ground elevation
stays absent when terrain height is unavailable. Test the same journey in the
receiver before `.3d` is accepted.

The current payload has no terrain/map-bounds contract. Use an explicit fixture
world rectangle and labelled orthographic fixture view for this preview. Do not
infer real BAR map scale or pathfinding from the screen bounds. Preserve known
elevation in observation details, and preserve unavailable facts as unavailable.

## Milestones

- [x] **BARC-01.3a — Preserve BAR observations through a real preview connection — route: routine.**
  Source delivered by PR #3 at `16e0a1b…`, with the rich broker projection,
  authenticated preview gateway, shared schema and actual Fable codec probe.
  Qualification details and semantic limitations are in the evidence above.

- [x] **BARC-01.3b — Supervise real manual and custom WASM guests — route: routine.**
  Source delivered by the same PR/merge. The trusted Worker, candidate ABI, SDK,
  reproducible manual/example guests and actual browser containment are accepted.
  Product UI, larger observation capacity and final receiver use remain below.

- [ ] **BARC-01.3c — Launchable Fable tactical preview with equivalent input — route: routine.**
  Depends on `.3a/.3b` and the parent's authoritative PR #3957 projection readback.
  Deliver the mountable Elmish DOM/SVG component and the companion executable as
  one joined source outcome. Show own/visual/radar shapes, typed features, optional
  economy, selection/target preview, connection/state age and module status. Mark
  stale retained objects visibly and disable guest gameplay input while stale.
  Mouse and keyboard adapters share domain Select/GroundTarget requests; DOM code
  cannot create Move output. Include keyboard-only pairing, load/disarm, selection,
  coarse/fine target movement and confirmation, readable target text and Escape.
  Suspend gameplay shortcuts in text fields, dialogs and IME composition. Release
  held navigation, pointer capture and pending gestures on blur/lost capture;
  window focus loss/hidden tab suspends the guest and invalidates pending output.
  Explicit resume reinitializes against the current accepted observation.

  Before decoding, bound incoming binary bytes by the configured ceiling and then
  the stricter negotiated limit. Reject unknown/missing body, unsupported required
  enums/profile/mode, wrong session/perspective, non-finite positions/resources,
  invalid identity/sequence values and over-limit collections before state or guest
  mutation. Unknown optional protobuf fields can remain compatible. A server
  `preview` body is not a source of gameplay output. Handle legitimate stale
  envelopes without requiring fields that are present only on current observations.
  Use exact uint64 strings/BigInt throughout; never round through JS numbers.

  Serialize initialize/observation/input operations through the existing single-call
  supervisor. Keep the queue bounded; coalesce only superseded complete snapshots,
  never ordered discrete inputs, and reset visibly on overflow. Bind every input
  to the guest's acknowledged observation, session and generation. Stale state,
  disconnect, replacement and semantic refusal clear pending target/output and
  disarm before stale results can render. Account for GuestRequest encoding overhead
  within the 64 KiB guest bound. A >64-unit observation must visibly suspend this
  SDK profile rather than truncate; larger profiles belong to later qualification.

  Repair selection continuity inside the existing Rust SDK: on a newer current
  observation retain only still-observed owned selected units; remove lost/changed
  ownership and reset on session replacement. Do not have the DOM silently replay
  selection to hide the guest behavior. Test this with a snapshot between selection
  and target, an ownership change, and the independent odd-ID policy. No ABI or
  HighBar schema extension is required for this correction.

  Acceptance: the first example above passes through the actual entry, broker and
  Worker; radar lacks invented health/team, unit/feature 77 stay distinct, zero
  economy differs from absent. The product file picker imports independently built
  custom bytes without rebuilding; selecting odd/even units demonstrates the custom
  policy changes output. Product-level malformed/oversized/unknown cases refuse
  before guest invocation. Trap/hang/import failures leave pairing/navigation and
  disarm responsive. Capture zero native submissions with a broker command-channel
  sentinel, not merely a browser GET-only assertion. Focused Fable state/input tests,
  real entry-point Playwright journeys and affected existing suites pass.

- [ ] **BARC-01.3d — Clean public Fable-game receiver consumes the same preview — route: routine.**
  Preparation depends on the frozen mount/archive layout; final acceptance depends
  on `.3c`'s joined artifact. Produce one hash-manifested candidate archive from the
  exact product source/build, including client sources, generated codec, trusted
  Worker assets and manual/example WASM. Generated product code consumes that exact
  archive; no separate BAR implementation, native assemblies or unpublished package
  substitution is permitted.

  From public packages and empty selected caches, create an explicit Fable-game
  receiver using Templates 0.15.0 and qualified SDD 2.0.3. Keep the activated SVG
  Player/typed-SDD defaults and record actual scaffold/tool/provider provenance.
  Add the opt-in BAR mount to the generated Client with its own connection scope;
  its Server continues to serve product assets, while BAR connects to the configured
  paired FSBar gateway. Existing arena examples may remain reachable, but BAR never
  joins RoomAuthority, sends arena movement or receives arena credentials as grants.
  Do not alter Templates source absent a reproduced missing extension point.

  Acceptance: the generated Fable build and production server load the same component,
  Worker and guest at the actual base path. Both input journeys, custom import,
  stale/recovery and guest-fault navigation pass against the real fixture-backed
  broker. Cross-runtime and browser tests refuse arena credentials/messages in BAR
  sessions and prove arena ticks do not mutate BAR state. Compare implementation
  and guest hashes with the local composition. A retained-workspace smoke case
  preserves unrelated source, user module/configuration and lifecycle choice; the
  adopter refuses collisions instead of overwriting owner files. This is candidate
  composition adoption, not public BAR package publication or a complete upgrade
  promise. Stop at that receiver outcome and evidence.

- [ ] **BARC-01.3e — Qualify the joined preview and close its bounded outcome — route: routine.**
  Depends on `.3c/.3d` and their exact combined source/archive. The integrator runs
  coherent focused checks once on the joined tree, preserving known baseline
  failures without laundering new ones. Replay the real product/receiver journeys,
  host semantic refusals, focus/stale/session recovery, independent custom policy,
  containment and zero-native-submission assertions. Reuse the unchanged corpus and
  ABI suites; rerun when changes affect them, not per administrative checkpoint.
  Record OS/hardware/browser/tool versions, artifact hashes/bytes, entity counts,
  guest p95/max processing and observed watchdog/navigation behavior for the declared
  small fixture profile. Report startup and round-trip measurements separately;
  synthetic timings do not establish native game latency or late-game capacity.

  Source delivery requires exact native PR merge and default-branch readback in
  the selected fork. Close `.3` only when both local and generated previews meet
  acceptance. Report hosted checks as unavailable if configuration remains absent.
  Publication, upstream adoption and `.4` live browser control remain separate.
  Land the mandatory asynchronous Unified §0 closure projection before selecting
  the next dependent `.4` acceptance.

## Parallel ownership and joins

Use isolated worktrees from `16e0a1b…` or a verified compatible successor. The
parent names one integrator and releases implementation now that PR #3957 has landed.
Reuse existing `gpt-5.6-sol` medium workers; this Astra-high expansion does not
require another planning review. Workers use the canonical
`/home/developer/projects/.github/.agents/skills/work-roadmap/SKILL.md` fallback.
Routine route and native safeguards apply; missing hosted routine policy is not
permission to claim a hosted eligibility pass.

| Lane | Exclusive touch-set | Real dependency and stop |
| --- | --- | --- |
| Client, `.3c` | New `src/Broker.Browser.Client/**`, `tests/Broker.Browser.Client.Tests/**` | Own mount API, transport semantic guard, Elmish/input/Worker integration and product browser tests. Read delivered contracts/Worker; request changes through their owner. Can implement against accepted corpus while companion is built; cannot claim the real journey before joining it. |
| Companion/guest continuity, `.3c` | New `src/Broker.Browser.Preview/**`, `tests/Broker.Browser.Preview.Tests/**`; existing `sdk/barc/**`, `examples/barc-guests/**`, `scripts/build-barc-guests.sh`, `tests/Broker.Browser.Wasm.Tests/**` | Own runnable production-host composition, actual coordinator fixtures, pairing handoff and narrow SDK selection correction. Consume the agreed client output/mount layout; keep hostile fixtures separate from shipped example assets. Stop at launcher and guest tests plus the client join. |
| Receiver, `.3d` | New `examples/barc-fable-game/**`, `tests/Broker.Browser.Receiver.Tests/**`, `scripts/package-barc-preview.*`, `scripts/qualify-barc-receiver.*` | Begin clean scaffold/provenance and packaging preparation after interface freeze. Consume immutable client/Worker/guest trees without edits. Final receiver journey waits for joined `.3c`; it is not independently complete because scaffolding passes. |
| Parent integrator, `.3e` | Root solution/tool/build files, shared dependency manifests/locks, archive interface manifest, owning roadmap/evidence and Unified index/progress | Lane owners may edit their new lane-local manifests/locks using the existing exact pins; review those at integration. Apply shared dependency proposals, own shared changes and coherent qualification. A demonstrated Gateway/contract/Core defect routes through this owner to one assigned worker; other lanes remain read-only on those files. |

The initial mount/options, output directory, asset layout and launcher readiness
handoff are one small integrator-owned interface commit. Then client and companion
work proceed in parallel; receiver preparation can also proceed. Do not dispatch
separate workers for tightly coupled UI substeps or let receiver packaging edit
client files. Native protobufs, Broker.App/Tui/Viz, unrelated admin fixtures and
the user's dirty original BARC design are outside all lane touch-sets.

Accumulate dependent micro-steps as local tested commits. The parent admits one
coherent `.3` dependency-chain PR at a time via its live queue; lane count does
not create a PR per lane. If an earlier coherent delivery lands before receiver
completion, retain `.3` open and preserve every later acceptance gate.

## Public inputs, workspace impact and later outcomes

Templates **0.15.0** source is `b86c841a1c4c4bf7f157a3ae4dc61b0356d6576d`;
wizard **0.12.0** source is `4889c446de0a431d1168a61a89ab660fc2062314`.
[D5's public receiver repeat](https://github.com/FS-GG/FS.GG.Templates/actions/runs/36474756648)
passed after `.github` activation `2574f02aa8cf835ab1e0b5ff6c62504c33098183`.
The Fable provider uses Fable 5.18.0/Core 5.3.0, Elmish 5.0.2, browser bindings
2.20.0 and Vite 7.3.6. Preserve exact generated locks and add only necessary
product dependencies through the integrator.

SDD **2.0.3** source/tag is `0c26ac591e76d2839177da823b3f6ada5c09a698`.
Its [receiver source PR #1083](https://github.com/FS-GG/FS.GG.SDD/pull/1083) and
[successful public readback](https://github.com/FS-GG/FS.GG.SDD/actions/runs/36478312479)
identify the published release after the earlier publisher's anonymous-index
race. The owning clean public-only and retained qualifier passed on that exact
source without a target-command override; the parent verified its record/hash,
not a second full qualifier run. `.3d` explicitly selects this qualified public
version, records its installed package hashes and exercises its own Fable receiver.
That selection does not change any ordinary registry still pinned to SDD 2.0.2.

Under [Unified §9.9](https://github.com/FS-GG/.github/blob/main/docs/2026-09-07-154210-fs-gg-unified-development-roadmap.md#99-when-new-workspaces-change),
`.3c` first enables the product browser source and `.3d` first changes the
explicitly selected generated receiver. Ordinary newly generated workspaces,
SVG Player/typed-SDD defaults, operating epochs and fleet installations do not
change. BAR is opt-in. A source archive is candidate adoption, not a public
package release. `.7` owns coherent product publication, public receiver adoption
and full promised upgrade/conflict handling. Existing workspaces do not auto-upgrade.
Any proven reusable template defect needs a Templates-owned fix, publication and
subsequent receiver adoption; it does not authorize replacing the arena default.

Later original outcomes remain outlines: **BARC-01.4** joins qualified native
observation/authority with actual mouse, keyboard and independent guest effects
in both clients; **`.5`** adds useful build/economy/combat/reclaim and queue play;
**`.6`** qualifies recovery, larger workloads, SDK portability and recordings;
**`.7`** qualifies published installation and upgrades. The `.2c` native Move
proof and this preview do not by themselves close `.4`.

Keep feature `BARC-01`, selected item `BARC-01.3`, existing original-item mapping
and stable `.3a–.3e` IDs across workers/repairs. The current planner attempt is
`barc-preview-horizon-readonly-20260928-2124`; telemetry is not configured and no
usage/efficiency result is claimed. The parent reconciles supported terminal
usage; missing counters stay unknown. Preserve the existing 10% whole-item
bureaucracy ceiling, useful-test exclusion, near-5% recovery target and the
15-distinct-breach/any-above-25% intervention rule without a duplicate ledger.

The parent accepted this window after the projection readback. Implementation
uses isolated local branches and joins one coherent source outcome before PR
admission. This unmerged plan does not claim product or receiver acceptance. The existing §9.8 browser-plan link
continues to point to `docs/roadmaps/barc-01-browser-preview.md`; retain the
original design/foundation links and add no new roadmap row.
