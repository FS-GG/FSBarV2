# BAR useful-play development audit

Date: 2026-10-01. Scope: BARC-01.5. Status: development findings; native useful-play acceptance remains **0/6**.

## Current result

The selected product uses unmodified Recoil 2025.06.19 with an ABI-matched HighBar plugin and a bounded Lua queue observer. The custom atomic replacement experiment remains optional, inactive and unqualified. Stock FactoryProduce Replace is unsupported. This preserves the original useful-play goal without requiring a custom engine transaction service. See the [owning useful-play roadmap](../barc-01-useful-play.md) and [preserved optional experiment](../barc-01-factory-atomic-replacement.md).

Source was delivered at [HighBar f0855537](https://github.com/FS-GG/HighBarV3/commit/f08555372168cd911f438de0be5ec2898fd1cfb5) and [FSBar 6b9139e8](https://github.com/FS-GG/FSBarV2/commit/6b9139e83334da903ea6861adb57d97578af2239). These are source-delivery facts, not native acceptance or installed defaults. Three controlled native attempts ended before browser start. The latest produced complete stock production and rally observations, then failed host readiness. The narrower Count1 smoke and all six useful-play journeys remain unaccepted.

## Problems and effective repairs

| Problem | Repair and demonstrated scope |
|---|---|
| Host Lua tests did not match stock engine numeric behavior | Stock Lua 5.1 FLOAT tests, byte-based SHA and float32 packing; source compatibility established |
| Production and rally APIs were confused | Production uses GetFactoryCommands; rally uses GetUnitCommands; distinct-domain fixtures catch the old mistake |
| Browser fixtures bypassed the production projection | Tests now traverse real native-to-browser codecs and freshly compiled generated contracts |
| Append streams and evidence snapshots had incompatible assumptions | Actual O_APPEND descriptor checks; immutable authenticated prefixes permit healthy engine suffix growth while completed host/browser journals stay fixed |
| Child files inherited public permissions | Private launch-time umask; ordinary-child tests exercise the actual supervisor |
| Complete content was outside the engine's search roots | Rapid descriptor and sibling pool moved to stock scanner locations; subsequent attempts reached content loading |
| AI library lacked discovery metadata | Exact C interface metadata added; latest attempt reached stock queue observations |
| Partial process identity could become falsely trusted | Atomic acquisition and sticky unknown state; later attempts positively settled cleanup without rewriting the first attempt's unknown result |
| Runtime settings were reused as new input | Fresh successor restored the admitted immutable seed; structural input/output separation remains recommended |
| Host readiness accepted an early incomplete tactical view | A bounded source repair is prepared; complete selection coherence remains to be joined and qualified |

The Lua reader follows the actual [synced stock route](https://github.com/FS-GG/HighBarV3/blob/f08555372168cd911f438de0be5ec2898fd1cfb5/data/barc-stock-observer/LuaRules/Gadgets/barc_stock_queue_reader.lua#L14). It bounds entries and parameters, retains finite float32 bits and reports unavailable fields honestly. Timeout is unavailable; a stock observation never implies transactional replacement or synchronized rollback.

## Two repairs before the next native attempt

### Correct factory quantity translation

The delivered stock dispatcher uses the generic Append option, SHIFT 32, for factory Count1. The pinned engine interprets SHIFT as a quantity multiplier of five. FSBar already encodes factory Count1 with options 0, but the final native adapter substitutes the generic option. This is a source defect; five produced units have not been observed because current attempts stop before browser commands. Evidence: [stock dispatch](https://github.com/FS-GG/HighBarV3/blob/f08555372168cd911f438de0be5ec2898fd1cfb5/src/circuit/grpc/CommandDispatch.cpp#L303), [broker encoding](https://github.com/FS-GG/FSBarV2/blob/6b9139e83334da903ea6861adb57d97578af2239/src/Broker.Protocol/LiveControl.fs#L814), [stock multiplier](https://github.com/beyond-all-reason/RecoilEngine/blob/2639eedac7d1fd67d793ec93ebd27f014f336a14/rts/Sim/Units/CommandAI/FactoryCAI.cpp#L146).

Use factory-specific options 0 for permitted ordinary production. Preserve ordinary movement and positioned-construction Append semantics. Test the production dispatch path against the pinned factory command behavior, with the old SHIFT translation as an adverse case. A successful callback or correlated Count1 child cannot prove exactly one produced unit.

### Publish the same usable selection that readiness validates

The current host independently reads tactical state, selects a factory and later requires definitions, builder, target and browser positions. A readiness check that only asks whether any suitable factory exists can still disagree with the first factory selected afterward. Return one complete selection from the bounded readiness evaluator and use it to materialize ready data. Test delayed metadata, multiple factories, missing projected actors and expiry through the production selection path. See [host selection](https://github.com/FS-GG/FSBarV2/blob/6b9139e83334da903ea6861adb57d97578af2239/tests/Broker.NativeProof/LiveHost.fs#L192).

## Development improvements

1. **Test the boundary that changes meaning.** Native option translation, real loader paths, deployed Lua numeric behavior and the published readiness selection need direct tests. Passing hand-authored fixtures or stale assemblies cannot establish those behaviors.
2. **Separate immutable input from runtime output.** Materialize writable settings per attempt from a verified seed. Successor packages must not inherit files rewritten by an earlier process. Bind the managed assembly and dependencies as well as its unchanged launcher.
3. **Validate discovery as well as hashes.** Keep scanner layout, content dependencies, AI metadata and receiver asset paths in the existing packet closure. Authenticate actual loaded executable/library identities after owned startup and before evidence becomes eligible.
4. **Make failures diagnostic without exposing private payloads.** Retain separate operation and cleanup outcomes and bounded readiness reasons. Later empty process censuses cannot retroactively establish earlier ownership.
5. **Keep current plans current.** Replace stale active factory/custom-engine summaries, preserve history, and record source delivery separately from actual game acceptance. Missing telemetry means engineering-efficiency claims remain unavailable.

## Next work in the existing roadmap

HighBar's `.5b` quantity correction, FSBar's `.5f` readiness selection and private packet custody work can proceed independently. One integrator joins their exact artifacts before a controlled Count1 smoke. Browser/guest and generated-receiver owners can prepare the retained `.5d/.5e` scenarios concurrently.

A later `.5f` result must demonstrate all original construction/economy/combat/reclaim, guard/repair, factory/rally/queue and selected-mode outcomes through pointer and keyboard in both products, plus an independently imported tactical policy in each. Quantity requires actual requested products and preserved queue semantics; Unknown and Expired cannot become Applied or trigger silent retries. Count1 transport evidence is a prerequisite, not six-journey acceptance. The [current normalizer](https://github.com/FS-GG/FSBarV2/blob/6b9139e83334da903ea6861adb57d97578af2239/tests/Broker.NativeProof/stock-native-trace.mjs#L115) explicitly retains that distinction.

Resilience/scale and qualified publication/adoption remain `.6/.7`. This audit introduces no new programme, registry, runtime or completion ledger. BAR gameplay acceptance remains independent of the selected V2 platform acceptance.

## Source incorporation in this delivery

The host now retains the exact cloned selection returned by `selectStockFactory` and consumes it when materializing readiness. The regression covers an unusable first factory, a usable later factory, delayed projection and mutation after selection. The existing readiness and operation budgets remain unchanged. This source correction and the audit's roadmap amendments are integrated together; no new native result follows. HighBar's factory-only quantity correction is a separate source join. Exact artifact rebuilds, immutable settings seeds and a fresh controlled operation remain required before Count1 or useful-play acceptance.
