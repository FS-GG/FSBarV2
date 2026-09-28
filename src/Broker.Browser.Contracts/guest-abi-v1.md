# BARC guest ABI v1

The guest consumes and produces `barc.browser.v1` protobuf bytes. All pointers
and lengths are unsigned wasm32 ranges represented through the host's `i32`
imports/exports. The host validates complete ranges before reading or writing.

Required exports:

- `barc_abi_version() -> i32`
- `barc_alloc(length: i32) -> i32`
- `barc_free(pointer: i32, length: i32) -> void`
- `barc_initialize(input_pointer: i32, input_length: i32, descriptor_pointer: i32) -> i32`
- `barc_process(input_pointer: i32, input_length: i32, descriptor_pointer: i32) -> i32`
- `barc_shutdown() -> i32`

`barc_abi_version` returns `1`. The host allocates the eight-byte descriptor
and passes its address to `barc_initialize` and `barc_process`. On success,
the guest writes an output pointer followed by output length as two
little-endian `u32` values and returns status `0`. The host validates both
ranges and frees guest-owned output with `barc_free`.

`barc_initialize` receives a `GuestRequest.initialize` carrying the negotiated
`Bootstrap`. `barc_process` receives a `GuestRequest` carrying a materialized
`Observation`, selection, or ground target. Every successful call emits an
encoded `GuestResponse` with `GUEST_ACK_STATUS_CONSUMED`, the matching request
and session identities, and the consumed context sequence. A no-action response
omits the `preview` oneof and uses `INTENT_KIND_UNSPECIFIED`; zero pointer and
length do not represent success.

Nonzero status is a refused or failed invocation and the descriptor must be
zeroed. Deferred event streams, queries, UI chunks, and native command
submission are unavailable in ABI v1. The trusted Worker owns frame bounds,
timeouts, generation fencing, and teardown.
