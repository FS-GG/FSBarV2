These are **controlled fixtures**, serialized by the compiled HighBar production
planner/projector using the exact protobuf schema at producer source
`a5a6eab3809e4defc66c6f1947df9764c98175aa`. `manifest.json` and all four `.pb`
files are byte-identical to the producer output. The manifest SHA-256 is
`270b756ae5ed2d2974b35eb91c0a366eed487b90e91ba77834ae87b0f9365d8e`.

The bounded retained diagnosis (`WORKER-CAPTURE-ARM-DIAGNOSIS-20261003.json`,
SHA-256 `2f4aee560947afd98c3dd8b37ab20021ccdd1edf7abfd636228497ff3f01f0df`)
identified baseline 34 followed by owned damage 35. It does **not** retain raw
StateDelta bytes. These payloads reconstruct a controlled sequence; they are
not native capture, plugin adoption, a player journey, or operation authority.

The baseline contains owned unit 42 at health 100. The legacy delta contains
128 damage events plus dispatch and economy. The production coordinator
projection retains dispatch/economy; the complete replacement at sequence 36
contains engine-supplied health 83. No resulting health is inferred from damage.
The replacement omits StaticMap and fully replaces entity/economy facts.

`StockProducerCorrespondenceTests.fs` parses the immutable bytes using the real
F# `StateUpdate.Parser`, runs `WireConvert`, and joins the resulting observation
through `LiveControl` and `LiveBoundary`. Metadata is deliberately absent from
the producer artifacts. The tests construct separate, genuine typed controlled
capability, catalogue, live basis and tactical reports; they never append facts
to producer bytes. Tactical readiness refuses missing, early, stale, wrong
lifetime and wrong epoch reports. A matching basic preview may be available
before tactical readiness. Controlled tactical economy preserves presence and
sample frame; legacy cached/default economy is not evidence of direct income.

Additional complete snapshots for membership removal/reuse and negative cases
are explicitly controlled mutations in test memory. They do not broaden the
production owned-damage capability or establish lifecycle callback ordering.
No StateDelta formal model is claimed. Existing GrowingLog custody is unchanged.
Publication, loaded plugin/receiver adoption, and native useful play remain pending
(0/6; no operation grant).

Run the focused checks with:

```console
dotnet run --project tests/Broker.Protocol.Tests -- --filter-test-list 'Controlled BARC-01.5f producer correspondence' --sequenced
```
