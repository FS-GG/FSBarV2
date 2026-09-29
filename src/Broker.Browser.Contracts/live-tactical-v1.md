# `barc-live-tactical-v1` contract

This profile is the additive tactical revision of `barc-live-v1`. It keeps the
guest ABI at version 1 and does not change preview or live-v1 wire tags. Native
peers negotiate `LIVE_CONTROL_PROTOCOL_TACTICAL_V1` and tactical revision 1.
A V1 peer, an incomplete catalogue, or a missing per-actor descriptor refuses
tactical input before authority is armed; it never silently reduces an action
to Stop, Move or Attack.

The producer reports a content-bound catalogue as bounded pages. A consumer
may use it only after receiving every page for one catalogue id and revision
with `complete=true`. Definitions, build options, footprint and present costs
come from the selected engine/content. Missing values remain absent. Every
tactical snapshot binds that catalogue to one observation basis and carries
perspective/sample-frame economy, feature references, and per-actor command
descriptors and queues. Resource values name their unit. Feature id zero is
valid because the containing `FeatureReference` supplies presence; its nonzero
lifetime and the observation basis prevent reuse from aliasing an old target.

Every tactical actor has both its existing `UnitReference` and a matching
`ActorTacticalBinding`. The binding's descriptor revision hashes the ordered
native supported-command fields. Each observed queue has a domain and a
revision covering the complete ordered native `(type,id,options,tag,timeout,
float-bit params)` tuples. Queue removal uses an exact native tag. Insert uses
a typed action and an exact before-tag. Factory production and factory rally
are different domains. Repeat is explicit state. Index cancellation and
clear-and-replay reorder are outside this revision.

The typed families are Build, Guard, Repair, ReclaimUnit, ReclaimFeature,
ReclaimArea, FactoryProduce, SetRally, QueueEdit and selected tactical modes.
Factory counts are expanded and capacity-reserved by the broker; each native
child has count 1. Raw command ids, engine option bits and arbitrary float
parameter arrays never enter a browser or guest intent. Native translation
uses the typed engine wrappers, including `Unit::ReclaimFeature`; construction
and production use typed Build, while rally is a produced-unit order.

BAR construction priority (`34571`) and cloak desire (`37382`) are the selected
mode candidates. Their numbers are producer-side discovery pins, not client
authority. A mode is available only when the current unit's runtime descriptor
reports the matching enabled command and the bounded boolean value set. An
absent, disabled or differently-shaped descriptor makes the mode unavailable.

All catalogue, descriptor, queue and feature lifetime revisions are uint64 and
must remain lossless across .NET, Fable/JavaScript and WASM. Unknown tactical
actions, queue domains or mode values are retained by protobuf decoders for
diagnosis and refused by semantic validation. Native rechecks content,
catalogue, actor/target lifetime, descriptor, queue, placement, resources,
authority and freshness immediately before dispatch. Admission and dispatch
remain distinct; observed game completion is not inferred from either.
