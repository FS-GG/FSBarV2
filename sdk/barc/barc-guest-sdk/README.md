# BARC Rust guest SDK

This `no_std` SDK decodes `barc.browser.v1.GuestRequest` protobuf bytes and
encodes `GuestResponse` Move previews without converting `uint64` identities to
floating point values. `export_preview_guest!` supplies the bounded candidate
ABI; a guest supplies its own selection policy. The host treats every output as
preview data only.

The same exports accept `LiveGuestRequest` after `barc-live-v1`
initialization. The SDK retains lifetime-bearing owned references, drops
changed lifetimes, refuses radar-only Attack targets, and echoes the exact
input, observation basis and module generation. Policies emit semantic Stop,
Move replace/append or visible-unit Attack intents.
