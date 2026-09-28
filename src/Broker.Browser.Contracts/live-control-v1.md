# BARC live-control v1 contract

Live control is an explicit `barc-live-v1` profile in the existing
`barc.browser.v1` package. `barc-preview-v1`, `barc_browser.proto`, and guest
ABI version 1 remain compatible. A preview client or a peer that omits the
live profile is refused before receiving a live envelope.

The live profile requires:

- 16-byte session, controller, input, parent, match, and basis-token values;
- a 32-byte host-attached module SHA-256 and nonzero module generation;
- nonempty process, state-channel, command-channel, control-channel, and
  controller incarnations;
- nonzero authority epoch, unit lifetime, input identity, and basis identity;
- `1..64` distinct actor references and exactly one Stop, Move, or Attack
  action; engine unit id `0` is valid and absence is represented only by an
  absent `UnitReference` message;
- finite Move coordinates inside the advertised inclusive X/Z map bounds;
- an Attack target distinct from all actors, VISUAL at the acknowledged basis,
  and still VISUAL/alive with the same lifetime at native dispatch;
- exact guest echo of input id, basis, and module generation. Module SHA-256 is
  attached and verified by the host rather than asserted by a guest;
- limits of 64 actors, 64 KiB input/output/frame, eight pending guest inputs,
  and an 8 MiB module. The guest phase timeout is 250 ms.

`max_observation_age_ms` and `live_snapshot_cadence_frames` are separate,
required producer-qualified values with no protobuf defaults. Client wall time,
deltas, and keepalives cannot refresh a basis. The broker and native producer
bind a basis token to exact match/process/channel, state sequence, frame, native
snapshot monotonic stamp, and a server-side monotonic deadline.

Move exposes only REPLACE and APPEND. The native adapter maps APPEND to the
installed engine SHIFT bit (`32`); no raw engine option bits cross this API.
Stop and Move REPLACE use `COMMAND_CONFLICT_REPLACE_CURRENT`; Move APPEND uses
`COMMAND_CONFLICT_QUEUE_AFTER_CURRENT`; Attack uses replace-current. Area
attack is unreachable.

Controller submission is enabled only in `ARM_NATIVE_CONFIRMED`. Reconnect,
module replacement, or local expiry disables submission immediately. Native
revoke confirmation proves the dispatch fence has linearized after any engine
call already in progress and before every later call; it does not undo an
already-issued order. A new epoch requires a fresh explicit arm.

Every accepted parent reserves bounded result capacity. Broker admission,
native admission, native dispatch, and unknown outcomes remain separate.
`APPLIED` is a native-dispatch status only. Result sequence supplies a replay
cursor, and the same `LiveResult` reaches UI consumers and a later bounded
`LiveGuestRequest` so guest policy can consume outcomes.
