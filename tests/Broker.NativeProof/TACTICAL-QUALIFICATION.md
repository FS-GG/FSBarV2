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
pair, both selected BAR modes, mixed-child outcomes and combat. The imported
guest separately proves its pinned policy action and a locally refused
unavailable action with zero submission.
The driver records decoded submit/result/observation frames to new mode-0600
files and omits authentication frames. Native and engine traces remain private.

Acceptance waits for observations newer than each correlated native dispatch
frame. It requires new construction to reach complete health, repair to raise
health, reclaim targets to diminish or disappear with a resource gain beyond
passive income, exactly two new factory units, a produced unit at rally,
changed queue revisions/tags/repeat and mode values, and combat health loss.
Factory fanout is actor count times requested count. Every child retains its
broker/native/dispatch or unknown terminal outcome; mixed applied/refused
parents are preserved rather than flattened. The parent must reject missing or
preexisting effects, missing children, stale identities, fixture mode, reused
credentials, wrong pins or any public/default installation claim.
