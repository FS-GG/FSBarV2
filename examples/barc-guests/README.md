# BARC preview guests

`manual-preview` accepts selected units that are owned in the most recently
consumed observation and emits a typed Move preview after a ground target.
`custom-preview` is a separate Rust crate whose policy retains odd unit
identities. Both compile independently against the small `no_std` SDK and are
loaded as raw WASM bytes through the same host, without rebuilding host code.

Run `scripts/build-barc-guests.sh` with the pinned Rust 1.90.0 toolchain. The
script also derives hostile modules for the browser watchdog tests; generated
WASM binaries remain untracked.
