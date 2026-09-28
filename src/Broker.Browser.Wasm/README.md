# Trusted BARC preview Worker

`GuestSupervisor` gives each imported guest a fresh dedicated module Worker and
owns the timeout for every reported ABI phase. Replacing, disarming, faulting or
timing out a guest terminates that Worker and advances the generation before any
result can be accepted. Guest output is copied, identity-checked as
`barc.browser.v1.GuestResponse`, and returned as preview bytes. This package has
no native command transport.

Before compilation, the Worker parses the core WASM sections and requires the
candidate `barc_*` signatures, no imports or start function, one finite
non-shared memory of at most 64 MiB, and at most one finite table of 4096
elements. Every host-owned and guest-owned range is checked for unsigned bounds,
alignment and overlap around each call.

The supervision shape was informed by the product-specific worker in
FS-GG/SC2.Client at `0abaa74eaeab6fa8dd2b6274269726e31538bf48`, then tightened
for BARC's ABI and threat boundary. No SC2 protocol or command authority is
shared here.
