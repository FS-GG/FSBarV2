# BARC-01.2c real FSBar/native Move evidence

This evidence file is populated only by a successful run of
`tests/Broker.NativeProof/run-real-move.sh`. The harness starts the production
`Broker.Protocol.ServerHost`, opens a real host session, and connects through
the public `ScriptingClient` gRPC service. The Recoil engine then loads the
pinned HighBar native plugin and connects to the same FSBar host.

The acceptance boundary requires all of these separately observable stages:

1. immediate FSBar broker admission (`CommandAck.accepted`);
2. correlated native admission (`NativeCommandResult`);
3. correlated engine dispatch (`NativeCommandDispatch`); and
4. a later scripting snapshot showing displacement of the commanded unit.

Parent UUID, originating client, child index/count, target, batch sequence,
full `uint64` correlation, channel incarnation, and dispatch frame are printed
by the harness. No raw game or engine assets are written to the repository.

## Fresh run

Executed at `2026-09-28T19:57:15Z`:

```console
tests/Broker.NativeProof/run-real-move.sh
```

The run passed against FSBar receiver
`64c24a59a3b7fafbc602eb5a6c9257c7b29e4e97` and HighBar final candidate
`9c8eb4d9f5ace44ab463ea6acc73f143a580f2a3`. The producer contract was frozen
at `dd6f5ef909905a8b5182d3d52c10946527ea79e5`. The FSBar and HighBar
`coordinator.proto` files both hashed to
`b8d3f56494564a8628a20ffdcc2ac7e42a0508f8f1162bcc87ee6c0f6b7c3c1d`.

The accepted Move produced these distinct observations:

- broker ACK: parent `315e6b72-9955-46bc-982c-151018b58044`, accepted;
- native admission: the same parent and origin `barc-real-move`, child `0/1`,
  unit `25947`, batch `1`, correlation `1`, status `NativeCommandAccepted`,
  accepted count `1`;
- native dispatch: the same attribution, batch and correlation, command index
  `0`, status `NativeCommandDispatchApplied`, native status `1`, frame `196`;
- observed effect: unit `25947` moved `81.4` world units in a later FSBar
  scripting snapshot.

Admission and dispatch used the same fresh channel incarnation
`highbar-e4f63c1a391f-217580959527885-1`. The receiver emitted 29 audit events
during the bounded run.

The native assets were local-only and had these hashes:

| Asset | SHA-256 |
| --- | --- |
| Recoil `spring-headless` | `e4f63c1a391f9ddfbb4d1da225d9533b1d56c65133687d036422a7380c84e833` |
| installed HighBar plugin | `5407312b3c9e3a8a7c10db79473aa57c65a03b6767eba2567bc00ca7be9f4cbd` |
| Avalanche 3.4 map | `3873260c6b5e533490598488eab3ff0b6587c778aee60cbb71186938dfaee426` |
| BAR game package | `58ca71d252e89e844361293e3b6b0aa2fb29fd217094b83e2a8f51ed1541f250` |
| start script | `ee8c0137cf5436d2136bdeb5e3532a3e55a7220e41a1cc0a2de1328f8979b7e7` |

The retained local harness log has SHA-256
`d79e34596a496710a449acd15e142944af7f8fbc8cde9692cd0aa512fa8bcdf0`;
the local engine log has SHA-256
`b0f0b282dd8b3216e1ff75758220a63e7ac1e25b93634ffdf9e0b18d9f0646a0`.
Neither raw log nor any game asset is committed.

The proof uses the production `Broker.Protocol.ServerHost` directly because
the frozen receiver base still includes the pre-existing `SkiaViewer 1.1.3`
restore dependency in `Broker.App`. It configures host mode through the
production `BrokerState` API, then crosses the public scripting and coordinator
gRPC services for every observed command stage. The separately staged viewer
detachment is not required by this Protocol-host proof.

An earlier live run against receiver candidate `80a29ca` exposed a native
startup ordering race: `OpenCommandChannel` could reach FSBar before the first
Heartbeat published its owner and generation, receive `PermissionDenied`, and
leave the scripting path without a command channel. Receiver `64c24a5` adds a
generation-fenced startup wait and a real gRPC ordering regression. The fresh
run above is the post-repair proof; the earlier timing-dependent pass is not
used as acceptance evidence.
