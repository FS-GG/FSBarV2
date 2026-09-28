# BARC-01.3 browser and custom-WASM preview

**Draft, 2026-09-28.** Owner: `FS-GG/FSBarV2`. Proposed durable path:
`docs/roadmaps/barc-01-browser-preview.md`. This is a bounded continuation of
**BARC-01 — Fable BAR client and custom WASM control**, not a new feature.

Programme: [Unified §9.8](https://github.com/FS-GG/.github/blob/main/docs/2026-09-07-154210-fs-gg-unified-development-roadmap.md#98-feature-parts-and-subroadmap-index).
Product requirements remain in the [original BARC design](https://github.com/FS-GG/.github/blob/main/docs/2026-09-08-134900-fable-bar-wasm-client-design-roadmap.md),
especially §§4.3, 5.2, 8, 9 and 12.1. This plan owns the new `.3a–.3e` work;
the original `.3` entry summarizes their eventual acceptance. Earlier foundation
and native-result ledgers retain their own completion authority.

The outcome is a Fable/Elmish tactical preview connected to the existing broker,
with mouse and keyboard input interpreted by real WASM guests. The same product
composition runs inside a clean generated `fs-gg-fable-game` receiver. Typed
intentions are inspectable; this preview has no browser-to-native command route.
Both an imported custom module and the bundled manual module use the public
candidate ABI. Completing this preview does not complete BARC-01 or enable `.4`.

## Verified starting point and reuse

| Surface | Evidence and consequence |
| --- | --- |
| Broker foundation | [Owning plan](https://github.com/FS-GG/FSBarV2/blob/396af034057c826ed11b871f27b49984f30c1d8e/docs/roadmaps/barc-01-foundation.md) records ground coordinates, features, strict command decoding, bounded delivery and gap fencing. Reuse `BrokerState`, `WireConvert.RunningView` and the production `ServerHost`. |
| Current fork | Remote `main` was independently read back at `396af034057c826ed11b871f27b49984f30c1d8e`, the merged [viewer-detachment PR #1](https://github.com/FS-GG/FSBarV2/pull/1), above receiver/harness merge `b096ea17608c572ad2d0d3d4a961ad7f1c4a3b78`. The normal Release solution builds without SkiaViewer. Owning evidence reports Lib 2, Core 58, Contracts 6, Protocol 56, Tui 44 and SurfaceArea 25 passing tests. |
| Existing failure boundary | Integration is 28/31. Three admin fixtures expect `AdminNotAvailable` where strict decoding returns `InvalidPayload`; the same failures were independently reproduced against the earlier protected upstream base. Preserve this explicit baseline; do not call the full suite green. A focused expectation repair may join only with evidence that the fixture expresses the current intended contract. |
| Native result/effect | [Real Move proof](https://github.com/FS-GG/FSBarV2/blob/b096ea17608c572ad2d0d3d4a961ad7f1c4a3b78/docs/roadmaps/evidence/barc-01.2c-real-fsbar-native-move.md) crosses production FSBar, native admission, engine dispatch and observed movement. HighBar fork source is `81016ee38b123a490e6ff06037cdc2f56a105a96`; the proof records its tested candidate and asset hashes separately. This is genuine local native evidence, not a browser journey or hosted qualification. Preserve the frozen HighBar protobufs. |
| Missing browser data | [Core snapshot](https://github.com/FS-GG/FSBarV2/blob/396af034057c826ed11b871f27b49984f30c1d8e/src/Broker.Core/Snapshot.fsi) and [materializer](https://github.com/FS-GG/FSBarV2/blob/396af034057c826ed11b871f27b49984f30c1d8e/src/Broker.Protocol/WireConvert.fs) currently flatten own/visual units, discard elevation and radar, and deliberately emit no invented player economy. The native snapshot already carries own/visual/radar collections and team economy. `.3a` must preserve these in the existing broker projection before the UI can claim them. |
| Continuity limits | Complete snapshots replace the materialized baseline. Unsupported nonempty state deltas invalidate it; dispatch-only deltas do not. Preserve that behavior and show stale status until a complete replacement. This window does not claim general lifecycle-delta materialization. |
| Browser/Fable implementation | No BAR browser, product WebSocket endpoint, WASM host or guest SDK was found in the inspected FSBar tree. `ServerHost` currently serves HTTP/2 gRPC only. These are missing capabilities, not receiver configuration alone. |
| Qualified generator | Public Templates **0.15.0**, source `b86c841a1c4c4bf7f157a3ae4dc61b0356d6576d`; wizard **0.12.0**, source `4889c446de0a431d1168a61a89ab660fc2062314`; SDD **2.0.2**. [D5 public receiver repeat](https://github.com/FS-GG/FS.GG.Templates/actions/runs/36474756648) passed after `.github` pin activation `2574f02aa8cf835ab1e0b5ff6c62504c33098183`. Templates source closure is `46d3a28b1706c1ef447d7d6e0b4890ca1d88be4a`; it is not the package source identity. SDD 2.0.3 publication activity is not an adopted input without its receiver readback. |
| Actual Fable conventions | The public Templates source uses Fable tool **5.18.0**, Fable.Core **5.3.0**, Elmish **5.0.2**, browser bindings **2.20.0**, Vite **7.3.6**, and explicit shared protocol/cross-runtime tests. Use those qualified conventions. The generated arena's SignalR/RoomAuthority path does not own BAR state. |
| Existing WASM research/code | SC2 Client `0abaa74eaeab6fa8dd2b6274269726e31538bf48` contains a working product-specific worker/supervisor and Rust guest source. Inspect it as an implementation donor for supervision and tests, preserving provenance; do not import SC2 protocol/authority or create a common game framework. The BARC ABI remains the original design's candidate ABI. |

The fork has no configured protection/rulesets/workflows at this baseline.
Report local qualification and native GitHub merge readback explicitly; do not
invent hosted success. Upstream `EHotwagner` push/PR access remains 403. Fork
delivery is the selected ownership boundary; upstream adoption stays separate.
The old foundation prose has stale `.1h` status: its owner prepared correction
`b4f245ec94722f1699cdff10035217accbc3a5c4` for a coherent later source delivery.
The integrator may carry that exact correction; workers must not independently
rewrite the foundation ledger or the user's dirty original design checkout.

## Decisions for this horizon

1. **One broker authority.** Extend the existing materializer with a richer typed
   observation projection and derive compatible legacy views from the same
   accepted state. Preserve perspective provenance, own/visual/radar distinctions,
   unavailable fields, X/Z ground coordinates plus Y elevation, typed feature IDs
   and optional team economy. Do not rebuild state independently in another server.
   Native generation or allied-contact facts absent from the current profile stay
   unavailable; no invented IDs, player identities, visibility or zero-valued facts.
2. **Product HTTP/WebSocket/protobuf boundary.** Add an opt-in loopback HTTP/1.1
   browser listener alongside the existing gRPC host, sharing its `Hub`. Browser
   bootstrap identifies `game=bar`, protocol/profile, session/perspective, preview
   mode, state validity and limits. Pair with a short-lived, browser-specific
   credential and an explicit allowed origin; use an authenticated first socket
   message and a timeout before releasing state. An arena credential, wrong origin,
   unknown protocol or stale session must fail. The preview endpoint exposes no
   command submission operation and cannot call `admitScriptingCommand`.
3. **Explicit codecs.** Use one product `.proto` definition, native generated
   protobuf on the server, and generated protobuf.js bindings behind a small Fable
   adapter. Use exact locked dependency versions after the first compatibility
   probe. Encode/decode exact 64-bit identities via a lossless representation,
   never JavaScript numbers. protobuf.js supports generated browser bindings and
   explicit 64-bit conversions; its encoder does not implicitly validate inputs,
   so product semantic validation remains required ([upstream documentation](https://github.com/protobufjs/protobuf.js/blob/master/README.md)).
   The Rust guest consumes that same payload schema; avoid a parallel JSON ABI.
4. **Trusted host, untrusted bytes.** Retain the original `barc_*` i32 byte ABI,
   eight-byte output descriptor, bounded core wasm32 profile and external Worker
   watchdog. Trusted product code owns the Worker script. Import `.wasm` plus
   declarative manifest/configuration only. Begin with one active controller,
   Rust manual controller and a separately authored example; advisors and a second
   guest language remain later scope. Inspect every allocation/output range and
   validate the whole output before exposing an intent preview.
5. **Product-owned composition.** Put Fable components, codec adapter, input
   normalization and Worker assets in reusable product surfaces. The local client
   and generated receiver import the same built/source artifact, with identical
   hashes and example guest; neither duplicates BAR logic. Keep native protobuf,
   gRPC, filesystem and process assemblies outside every Fable compilation graph.
   Make no Templates source change unless a clean integration proves a missing
   reusable extension point.
6. **Local preview first.** Use the original resource limits as candidate test
   settings, not measured capacity promises. One measured Chromium configuration
   is the initial support statement. No remote hosting, native dispatch, retail
   keymap parity, unattended automation or release promise enters this window.

## First executable window

The routine route applies. Execute through
`/home/developer/projects/.github/.agents/skills/work-roadmap/SKILL.md`, the known
canonical fallback because this fork has no installed copy or routine policy.
That absence is not evidence that a hosted eligibility check exists. Preserve
native safeguards and exact source/test evidence; do not install a governance
workflow merely to make this preview possible.

- [ ] **BARC-01.3a — Preserve BAR observations through a real preview connection — route: routine.**
  Depends on the delivered broker foundation and current qualified provider
  identities above; `.2` live acceptance is not an entry gate.
  Extend the existing observation projection and validity publication, define the
  small versioned product schema and shared semantic corpus, then connect a real
  browser-capable WebSocket client through the production broker host. Fixtures
  enter through the coordinator service, not a DOM mock or second authority.
  The initial local contract commit freezes bootstrap, observation, normalized
  input, preview output and guest ABI fixtures so `.3b` can begin concurrently.
  Add a focused server project/adapter and tests without changing App/Tui.
  Acceptance: own unit, visual enemy, radar-only blip, feature and optional team
  economy survive actual coordinator → accepted broker state → authenticated
  WebSocket → Fable/JavaScript decoding. Use unequal X/Y/Z, shared unit/feature
  numeric IDs, absent versus zero values, sequence values above 2^53, unknown enum,
  malformed/oversized envelope and incomplete metadata cases. A gap or unsupported
  delta visibly invalidates old data, including late subscribers; a fresh complete
  snapshot recovers. A hidden enemy absent from the perspective fixture never
  appears. Wrong-origin/arena/stale credentials refuse. Attempted preview command
  messages cannot enqueue a native command, even with an active coordinator.
  Run focused Core/Protocol/contract tests, .NET ↔ Fable codec fixtures and a real
  socket integration test; retain unchanged native proto hashes. Stop after the
  bounded gateway/projection outcome, with actual evidence and remaining limits.

- [ ] **BARC-01.3b — Supervise real manual and custom WASM guests — route: routine.**
  Depends on `.3a`'s reviewed local schema/ABI corpus commit, not its PR merge or
  native runtime. Build the trusted supervisor/Worker and minimal Rust SDK/manual
  guest plus a separate example consuming the same schema. Freeze exported names,
  configuration and error semantics before connecting the UI. The SDK source and
  `.wasm` hashes travel with reproducible build instructions and conformance data.
  Acceptance: .NET, Fable/JavaScript and real Rust WASM consume/re-encode the same
  semantic corpus, retaining optional values, target namespaces and 64-bit
  sequences. Ordered select/ground-target input produces an equivalent typed Move
  preview in the manual guest; the example produces its independently authored
  policy output. A newly compiled/imported module works without rebuilding the
  host. Invalid imports/exports/start section, unbounded memory/table, overlapping
  or out-of-bounds descriptors, malformed/oversized output, trap and infinite loops
  in allocation, initialization, processing, freeing and shutdown are contained by
  an external watchdog. Termination discards output and old-generation messages;
  navigation/disarm remains responsive. A browser harness proves actual Worker
  behavior, not only Node tests. No output reaches native dispatch. Stop at the
  reusable host/SDK result; browser product acceptance belongs to the next window.

### Disjoint lanes and joins

The parent names one FSBar integrator before dispatch and assigns isolated
worktrees from `396af034…` or its verified successor. Implementation model is
`gpt-5.6-sol`, effort `medium`; reuse each worker for its repairs. Plan expansion
uses the existing `gpt-6-astra` high context while useful.

| Lane | Exclusive touch-set | Join/stop rule |
| --- | --- | --- |
| A: `.3a`, broker/contract owner | `src/Broker.Core/Snapshot.*`; relevant `src/Broker.Protocol/{WireConvert,BrokerState,HighBarCoordinatorService,ServerHost}.*` and project compile lists; new `src/Broker.Browser.Contracts/**`, `src/Broker.Browser.Gateway/**`; affected Core/Protocol tests; new `tests/Broker.Browser.Protocol.Tests/**`, `tests/Broker.Browser.Codec.Tests/**`, `fixtures/barc-browser/**` | Own the schema/corpus and generated browser codec. Publish its local immutable contract commit to B; later contract changes return through A and invalidate affected fixtures. No HighBar vendored schema edits. |
| B: `.3b`, host/guest owner | New `src/Broker.Browser.Wasm/**`, `sdk/barc/**`, `examples/barc-guests/**`, `tests/Broker.Browser.Wasm.Tests/**`, `scripts/build-barc-guests.*` | Read A's contract/corpus; generate private or local SDK outputs only within B's directories. Do not edit A's schema/generated browser codec, browser client, shared solution or existing integration fixtures. |
| Integrator | New owning roadmap/evidence, optional exact `.1h` correction, root solution/build/tool manifests and shared package locks; final cross-lane composition | Own shared files and final combined exact-tree checks. Per-project lane locks are lane-owned. Rebase/check viewer and receiver merges before integration; do not resurrect their removed references. |

No current viewer worker overlap remains after its merge, but `Broker.App/**`,
`Broker.Tui/**`, `Broker.Viz/**`, existing viewer/integration tests and SurfaceArea
baselines are excluded from A/B by default. If an actual signature change needs
one, route that bounded adjustment through the integrator before editing.
Keep dependent micro-steps local. The parent admits one coherent `.3` dependency
chain PR at a time through its live repository queue; parallel workers do not
each open PRs against the same unfinished chain. A pending merge does not block
disjoint local implementation. Stop/reassign when touch-sets overlap.

## Remaining preview outcomes

These are stable milestones, not an expanded executable checklist. Expand only
the next useful window after `.3a/.3b` expose measured contract and toolchain facts.

| Milestone | Outcome | Entry and decisive evidence |
| --- | --- | --- |
| **BARC-01.3c — Fable tactical preview with equivalent input** | Reusable Elmish DOM/SVG composition, session/stale strip, selection/ground target, radar uncertainty, features, economy and module import/diagnostics | A/B joined. A Playwright bot starts the actual product entry, pairs, loads the guest, selects an owned unit and confirms the same asymmetric ground point by mouse and keyboard. Compare guest-produced typed intents. Test focus loss, lost pointer capture, IME/text fields, repeat and hidden-tab release; host recovery survives a guest hang. UI code cannot fabricate the passing intent. |
| **BARC-01.3d — Clean Fable-game receiver** | Product-owned integration/example materializes the same composition and guest inside a clean public `fs-gg-fable-game` workspace | `.3c` artifact. Generate using the pinned public route; apply an explicit BAR composition from an immutable product archive, with no sibling-checkout dependency. Build through the generated Fable toolchain and serve production assets/Worker at its actual base path. Run the real paired fixture-backed broker journey there. Cross-runtime/browser tests reject arena messages/credentials in BAR mode and prove no arena tick mutates BAR state. Record package/source/asset hashes. |
| **BARC-01.3e — Qualified preview handoff** | Reproducible product and receiver preview acceptance with documented limits and measured browser costs | `.3c/.3d` actual browser runs. Repeat a separately built custom import, invalid/trapped/hung containment and equivalent inputs in both compositions; verify zero native submissions. Record machine/browser/tool versions, bytes, entity counts, guest time/watchdog behavior and navigation responsiveness. Clean production build and coherent combined-tree tests pass except explicitly classified pre-existing failures. Native merge readback closes `.3`; this is source/preview delivery, not published adoption or `.4` control. |

Next product outcomes retain their original identities. **BARC-01.4** joins this
preview with qualified real observation and native authority/results to prove
mouse, keyboard and independent custom-module control through actual effects in
both clients. `.2c`'s native Move is useful input, not that browser acceptance.
**`.5`** adds useful build/economy/combat/reclaim and queue play; **`.6`** qualifies
failure recovery, scale, SDK portability and recordings; **`.7`** publishes a
compatible opt-in release and proves clean installation and upgrades. Those
outcomes are not executable expansions of this preview window.

## Workspace, publication and accounting boundaries

Under [Unified §9.9](https://github.com/FS-GG/.github/blob/main/docs/2026-09-07-154210-fs-gg-unified-development-roadmap.md#99-when-new-workspaces-change),
the affected receiver family is explicitly selected `fs-gg-fable-game`. Before
this work it supplies its existing SVG/game examples; after `.3d`, an explicitly
composed receiver can run a BAR preview. `.3c` first enables the product browser
source, `.3d` first changes the selected generated receiver. Neither changes
ordinary freshly generated workspace contents or enables native gameplay.

Keep the already activated SVG Player and typed-SDD lifecycle defaults from D5.
BAR remains an explicit product composition. Use public Templates 0.15.0 and SDD
2.0.2 for the first clean receiver; identify any explicit lifecycle/bundle choice
in its evidence. Do not substitute an in-flight SDD publisher or local template.
The product archive in `.3d` is a pinned candidate adoption artifact, not a claim
that its package is public. `.7` owns product publication and installed public
receiver adoption. A demonstrated missing template extension would create a
Templates-owned producer change, publication, then receiver pin adoption; it
does not authorize a template rewrite or BAR default.

Existing generated workspaces do not auto-upgrade. `.3d` documents a bounded
opt-in integration and checks a retained-workspace smoke case for preservation
of unrelated arena/product code, modules and configuration. Full promised
upgrade compatibility and conflict handling remain `.7` acceptance. No SDD
operating epoch, protected default or fleet installation changes here.

Preserve feature `BARC-01`, selected item `BARC-01.3`, and stable `.3a–.3e` lane
identities under the parent's existing original-item mapping and attempt lineage.
Do not reset costs on a new worker, PR or retry, and do not invent a non-self
original mapping. Use the existing roadmap telemetry adapter for dispatch,
follow-ups and terminal reconciliation; the parent records this planner's final
usage after it becomes terminal. Product traces are separate evidence. Missing
host coverage or unjoined usage remains unknown, never zero or reconstructed.
Apply the existing whole-item 10% bureaucracy ceiling, near-5% recovery target,
15 distinct breach / any above-25% intervention rule; useful tests are excluded.
No additional manual receipt ledger is needed.

## Concrete remaining gaps and completion claim

The first window can run now. Its initial codec spike must lock compatible
protobuf.js/generator/Rust dependencies and confirm Fable consumption; those
versions are deliberately not guessed. The current native profile cannot prove
entity lifetime generations or all allied/remembered-contact semantics, so the
preview represents those fields as unavailable and `.4` qualifies any required
producer extension. Real perspective extraction remains native evidence; fixture
filtering proves only the preview boundary. Existing three admin-fixture failures,
upstream 403, absent hosted configuration and product publication are explicit
independent limits. Replan only if the single broker projection, explicit codec,
qualified generated receiver or guest isolation assumptions fail materially.

This draft creates no issue, claim, PR, implementation, publication or activation.
After source delivery, the integrator records authoritative `.3` closure only
after `.3e` and lands the required asynchronous Unified §0 progress update before
selecting the next dependent `.4` acceptance. Independent ready work may continue.

### Exact Unified §9.8 link addition

In the existing **Fable BAR client and custom WASM control** row, retain both
current links and append this link to the final subroadmap cell after the owning
document has landed:

```markdown
, [FSBarV2 browser/WASM preview — BARC-01.3](https://github.com/FS-GG/FSBarV2/blob/main/docs/roadmaps/barc-01-browser-preview.md)
```

Until then, the actual draft is `/tmp/barc-01.3-browser-preview-plan.md`; do not
publish a nonexistent default-branch link. Link maintenance may join existing
cross-repository work and does not require a planning-only PR.
