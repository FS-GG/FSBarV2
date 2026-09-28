# BARC guest ABI v1

The guest consumes and produces `barc.browser.v1` protobuf bytes. All pointers
and lengths are unsigned wasm32 ranges represented through the host's `i32`
imports/exports. The host validates complete ranges before reading or writing.

Required exports:

- `barc_alloc(length: i32) -> i32`
- `barc_free(pointer: i32, length: i32) -> void`
- `barc_init(pointer: i32, length: i32) -> i32`
- `barc_process(pointer: i32, length: i32) -> i32`
- `barc_shutdown() -> void`

`barc_process` receives one encoded `GuestRequest`. Its return value points to
an eight-byte little-endian descriptor containing output pointer then output
length. The output is one encoded `GuestResponse`. Zero pointer/length denotes
no preview. The trusted Worker owns timeouts, generation fencing and teardown;
guest output never enters native command submission in preview mode.
