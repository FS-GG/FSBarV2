# BARC-01.2c correlated native result receiver

Part: **Fable BAR client and custom WASM control — BARC-01**

This FSBar source window adopts the frozen HighBar correlated command-result
contract. It keeps the existing scripting `CommandAck` as broker admission and
adds later, separately typed native admission and engine-dispatch notifications.

## Pinned producer contract

The vendored HighBar protobufs are pinned to producer contract commit
`dd6f5ef909905a8b5182d3d52c10946527ea79e5`:

- `coordinator.proto`: `b8d3f56494564a8628a20ffdcc2ac7e42a0508f8f1162bcc87ee6c0f6b7c3c1d`
- `state.proto`: `11ff63ac8211cbb6530e9be3ce4323a8b5911306d85c1b472c6aaa4618fc78d8`
- ordered five-file bundle: `796278dda7e178a5592413e9842795711efae7b101bc502d1501622bfb5c316e`

`OpenCommandChannel` requires strict schema equality,
`ADMISSION_RESULT_PROTOCOL_CORRELATED_V1`, and a fresh nonempty channel
incarnation. Legacy or unspecified result protocols fail before a command can
be forwarded. Exactly one owning plugin and command reader can hold the live
channel. HighBar may start its command and state streams concurrently with the
first heartbeat: FSBar waits up to the heartbeat deadline for the owner and
generation, then revalidates them before claiming or mutating state. The wait
does not grant authority to a non-owner or let an early stream follow a later
replacement generation.

## Observable command stages

| Stage | Scripting surface | Meaning |
|---|---|---|
| Broker admission | `CommandAck` | FSBar validated authority and queued the complete parent envelope. |
| Native admission | `StateMsg.native_command_result` | The owning HighBar plugin accepted or rejected one expanded child. |
| Engine dispatch | `StateMsg.native_command_dispatch` | The engine attempted that child at a frame. `APPLIED` does not prove a later state change. |
| Observed effect | later state snapshot | The state feed shows the world changed. This remains a separate assertion. |

Every native notification retains the full parent UUID, originating scripting
client, child index/count, target unit, batch sequence, full `uint64`
correlation, and channel incarnation. Dispatch also retains the native command
index and frame.

FSBar registers pending work before the server-stream write. Reports are keyed
by `(channel_incarnation, batch_seq, client_command_id)`. Exact retries are
idempotent. Wrong owners, old incarnations, mismatched identities, and reports
arriving after terminal uncertainty cannot complete current work.

Timeout, cancellation, EOF, or channel replacement after forwarding produces
`NATIVE_COMMAND_UNKNOWN`; FSBar never replays the command. Feedback waits in
the originating client's backlog when it has no active state subscriber. If
the client has unregistered, a typed audit event records why scripting
delivery was unavailable.

Correlated state is bounded before forwarding. The retention window is sixteen
expanded native children/events per configured parent queue slot, with a
minimum of sixteen. Each scripting admission reserves one native-admission
notification and one notification for every expected engine dispatch. If the
identity window or that client's backlog plus reservations cannot hold the
whole expanded parent, FSBar returns `QUEUE_FULL` before any child reaches the
plugin. Rejection releases unused dispatch reservations; accepted and unknown
work remains bounded until its dispatches arrive or the session ends. Duplicate
result tombstones use the same finite window, so retries outside the retained
window are classified as late. Each retained result carries at most four
issues; issue field paths are capped at 128 characters and result/dispatch
details at 512 characters. Together with the fixed protobuf fields, this
bounds retained payload bytes as well as event and identity counts.

Dispatch events are consumed independently from snapshot materialization. A
dispatch-only delta advances transport sequence without changing the cached
snapshot. Any mixed or otherwise unsupported state mutation retains the
existing fail-closed invalidation behavior.

Every `PushState` mutation is fenced by the owning session generation. A stale
stream can finish after replacement, but it cannot apply a snapshot, consume a
dispatch identity, refresh replacement liveness, or tear down the new session.

## Evidence and remaining gate

Focused tests cover accepted, rejected, duplicate, late, unknown, multiple
children, two callers, missing subscribers, queue overflow, cancellation,
replacement leases, explicit legacy refusal, and dispatch-only state
handling. The real gRPC fixture drives scripting admission through FSBar,
reports native acceptance, observes the correlated scripting notification,
then observes a distinct `APPLIED` dispatch notification.

This source window does not by itself prove a live game effect. BARC-01.2c
closes only after the pinned Move command travels through the product FSBar
process and the same parent/client/child identity is joined to native
admission, applied dispatch, and observed displacement.

## Workspace impact

No scaffold, generated-workspace default, installed public tool, or activation
policy changes. Existing workspaces adopt this behavior only after the FSBar
receiver source is delivered and installed with the matching HighBar producer.
Clean-creation and upgrade behavior are unchanged in this window.
