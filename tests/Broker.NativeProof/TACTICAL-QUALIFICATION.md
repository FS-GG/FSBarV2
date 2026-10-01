# Tactical native qualification preparation

This harness prepares the six real `barc-live-tactical-v1` journeys required by
BARC-01.5f. It does not start the engine and does not treat broker or native
`APPLIED` feedback as completion of a game effect.

Start the production host with `--tactical-live-host`. The host waits for exact
native tactical capabilities, a complete catalogue and a tactical snapshot
paired to a production basis before it creates its private mode-0600 ready
file. The ready file uses `fsbar.barc-native-live-host/v2`, identifies profile
revision 1 and retains server-generated pairing data only in the private
directory. Host output prints the ready-file path, never its credential.

The parent-owned runner creates a mode-0600
`fsbar.barc-tactical-native-browser-handoff/v1` file with exact source,
archive, client, plugin and engine hashes. It supplies local and generated
receivers, each with pointer, keyboard and imported-guest journeys. Every
journey uses a distinct credential and output file. Run:

```console
dotnet run -c Release --project tests/Broker.NativeProof/Broker.NativeProof.fsproj -- \
  --tactical-live-host 127.0.0.1:PORT http://127.0.0.1:PORT \
  http://127.0.0.1:RECEIVER /private/new-host-dir SOURCE_COMMIT

npm --prefix tests/Broker.NativeProof ci --ignore-scripts
BARC_TACTICAL_HANDOFF=/private/handoff.json \
  npm --prefix tests/Broker.NativeProof run test:tactical
```

Pointer and keyboard each cover construction and economy, guard, repair,
lifetime-bound unit/feature/area reclaim, exact factory count and rally,
current queue insert/remove/repeat, reject-if-busy, a deliberate stale-revision
pair, both selected BAR modes, mixed-child outcomes and combat. Keyboard
journeys use Tab/Ctrl+Tab for actors, `t` for an exact friendly target, `f` for
an exact feature target, `a` for a visual enemy and the action keys before
Enter. The imported guest's bytes are hashed before import; its pinned Build
policy must itself create a new completed building. A locally refused
unavailable action separately proves zero submission.
The driver records decoded submit/result/observation frames to new mode-0600
files and omits authentication frames. Native and engine traces remain private.

Acceptance finishes each causal effect before starting the next action. Each
effect window ends at the next action and admits only the same
process/match/state-channel with sequence and native frame after dispatch. It
requires new construction to reach complete health, repair to raise health,
reclaim targets to diminish or disappear with a resource gain beyond passive
income, a rally installed before exactly two new lifetime identities are
produced and reach it, and exact queue revisions/tags. Repeat must be observed
on and then off while the production queue is empty. Modes use actors whose
runtime descriptors actually advertise them, and combat lowers the exact
lifetime-bound visual target's health.

Reject-if-busy is sent only while the observed actor-order queue is nonempty;
a missing submit is a failed qualification rather than a native refusal. The
stale-revision pair invokes two UI actions synchronously and requires identical
basis and queue bindings before the first edit changes the revision. The mixed
fixture exposes two actors that are both broker-admissible for Guard, then
invalidates exactly one at the native fence; every broker admission must be
accepted before one child applies and the other refuses. These fixture roles
are explicit handoff data and cannot be inferred by the driver.
Factory fanout is actor count times requested count. Every child retains its
broker/native/dispatch or unknown terminal outcome; mixed applied/refused
parents are preserved rather than flattened. The parent must reject missing or
preexisting effects, wrong lifetimes, foreign-source observations, effects
that occur after the next action, missing children, wrong causal effect types,
stale identities, fixture mode, reused credentials, wrong pins or any
public/default installation claim.

## Selected stock smoke preparation

The separate `barc-live-tactical-stock-v1` route prepares one bounded local
pointer smoke case. It does not replace or reduce the six journeys above. The
host waits for revision 2 capabilities, a complete current catalogue/content
identity, a nonempty scheme 2 stock queue and current native basis and actor
metadata before it writes the private ready file.

The parent runner combines that authenticated ready record with actual stock
metadata and setup through `materializeStockHandoff`. It must not write a ready
flag itself. The resulting `fsbar.barc-stock-native-smoke-handoff/v1` selects
exactly local/pointer/Count1 and retains exact source, artifact, receiver,
connection, actor, catalogue and process/channel identities. Run the prepared
route only after those actual values are available:

```console
dotnet run -c Release --project tests/Broker.NativeProof/Broker.NativeProof.fsproj -- \
  --stock-tactical-live-host 127.0.0.1:PORT http://127.0.0.1:PORT \
  http://127.0.0.1:RECEIVER /private/new-host-dir SOURCE_COMMIT

BARC_STOCK_SMOKE_HANDOFF=/private/stock-smoke-handoff.json \
  npm --prefix tests/Broker.NativeProof run test:stock-smoke
```

The route captures an existing nonempty production queue, rally, Append
Count1, visible Replace refusal with no native submission, ordinary Move and a
visual Attack. Normalization accepts only the bounded stock CallRules trace and
uses the pinned generated production codec to compare native, host and browser
basis bytes. A final stock read joins the native dispatch envelope to actual
host and browser results; native command index and browser child index remain
separate identities. Same queue revision at a fresh canonical basis is valid,
while a duplicate actor/domain/revision/basis is refused.

This is source preparation. No stock native run, generated receiver journey,
artifact custody, publication or installed adoption is claimed here. The full
six-journey native qualification and optional custom replacement route remain
open.
