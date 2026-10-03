# BAR shared WASM adapter

WASM-SHARED-01.5-B1 prepares a new isolated adapter against the published connected
Contracts/Browser 0.2.0. Production Client, legacy facade, receiver archive and native
packet adoption remain the later .5-B2 join with the native-capacity owner.

The adapter uses the installed `Host.CreateConnected`, strict BAR ABI 1 profile,
product-owned preview/live wire validation and `RejectAdapterOutput` retirement.
All package-owned Worker assets, including policy and transitive libraries, are
served under `/sub/app/` by focused installed-consumer tests. JavaScript implements
only Worker transport supplied by the package, Promise bookkeeping, hashing and
byte conversions; it contains no queue, watchdog, memory or replacement reducer.

Qualification builds manual and custom guests independently from repository-owned
Rust sources in an isolated test copy, with Rust 1.90.0, `wasm32v1-none` and finite
64 MiB memory maximum. Additional isolated adversaries cover malformed/foreign,
empty and unaligned output and wrong ABI. Existing preview/live/tactical wire,
selection, host descriptor zeroing, admission, trap, cleanup, deadline, replacement
and disarm tests exercise the actual installed module Worker.

Source preparation and browser evidence do not confer native command authority,
close production adoption or transfer previous useful-play evidence to new bytes.
The package pins and locked public-feed restore remain explicit. Telemetry is
not configured; measured usage remains unknown.

The preparation uses exact public archive SHA-256 identities:
Browser `40d11feebb07b01c0846b1b9716db10badc5dfbce1a450eb5319ab89b8f041e6`,
Contracts `b5bb9d0217dc31de9649b7c952db514bab5c99d32b30e6480da1f313d446fba4`.
The isolated NuGet lock SHA-256 is
`058d6c4822e96fc0bcd78642cf1178c987f9e0d79df5ce53fc2a645cb16e6dab`.

Two API observations remain explicit for the integration decision. The shared
Worker retires on successful shutdown, so `active` becomes false; the old BAR
supervisor kept its physical Worker handle and reported true even though the
Worker had discarded its guest. No existing product entrypoint calls shutdown.
The installed profile freezes the table maximum at 4096 and cannot express a
smaller caller-selected table bound. The adapter refuses different table bounds
instead of pretending the package enforces them.

The programme integrator accepted `active=false` after physical shared-Worker
shutdown retirement for .5-B1, with that migration effect retained for .5-B2.
The fixed 4096 table profile qualifies current product callers; this is not a
claim of complete historical constructor configuration parity. At protected
`4e3ee2d4b77ab3f8875fcfb21cee20a374630707`, the preview caller in
`src/Broker.Browser.Client/runtime.js:181` supplies only `workerUrl`, and the live
caller in `live-runtime.js:209` supplies `workerUrl` and a 250 ms deadline.
Neither overrides the table maximum. The old validator accepts a supplied
`maximumTableElements` (`wasm-profile.js:96,132`); the new boundary explicitly
refuses 2048 and other nondefault values. Causal tests retain that refusal and
reject noninteger, zero or above-profile deadline limits before Worker creation.

Local qualification passed clean public package restore, locked restore, .NET
build with zero warnings/errors, Fable 5.18.0 and **37/37 Chromium cases** (6.2 s).
The evidence in `tests/Broker.Browser.SharedWasm.Tests/qualification.json` binds
adapter source, reused product wire validator, both installed package archives,
locks, guest artifacts and the complete installed Worker asset tree. The tests
also prove immediate load activity/busy refusal during artifact hashing, stale
hash preparation discard, cleanup-phase deadline reporting and one generation
advance on timeout. Artifact and configuration digests are computed from actual
bytes; the F# adapter supplies the canonical configuration document.

The adapter is prepared locally. Root owns source PR admission and the later
.5-B2 Client/facade, receiver asset closure and native-capacity join. No PR,
source merge, receiver adoption or native acceptance is asserted by this proof.
