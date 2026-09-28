# BARC-01.3a/.3b browser boundary qualification

Owner: FS-GG/FSBarV2. This is the locally qualified first window of the
[owning browser preview roadmap](../barc-01-browser-preview.md), based on
protected fork main `396af034057c826ed11b871f27b49984f30c1d8e`.
Native GitHub delivery remains a separate readback.

The same production coordinator stream, broker materializer and authenticated
WebSocket journey carries own and visual units, radar-only contacts, features
with an overlapping unit ID, unequal X/Y/Z, optional economy and a sequence
above JavaScript's safe integer range. Unknown radar/team fields stay absent.
Gaps invalidate both retained and live browser views; a complete snapshot
recovers them. Wrong origins, game/profile/session credentials, malformed or
oversized authentication and post-authentication input refuse. A replaced
native session closes the old browser connection. A peer withholding its close
acknowledgment cannot hold teardown open. Browser entity limits leave legacy
materialization intact, including the 4097-entity regression. The endpoint is
optional loopback HTTP and has no native submission operation.

The wire source SHA-256 is
`752ef84e8631de6e08f5ef94851fcbd918e451ebfb5d446a705baa317f65ea0f`;
the shared corpus bundle SHA-256 is
`0cd8abc6beaa7f92425c6e56ba7faa3ff7d62d30989a6ab95134a72d4e420bbf`.
The HighBar native contracts were not changed. Product schema is
`barc.browser.v1`; its C# namespace is `Broker.Browser.Contracts`.
Protobuf.js 8.8.0, generator 2.7.0, Long 5.3.2, Google.Protobuf 3.34.1
and Grpc.Tools 2.76.0 are pinned.

A real F# adapter compiled with Fable 5.18.0/Fable.Core 5.3.0 imports the generated
codec and verifies 19 semantic corpus cases, exact uint64 strings, absent versus
zero values and canonical re-encoding. Two malformed/truncated cases throw.
Unknown enum values remain preserved and unknown envelopes have no body;
the 65537-byte fixture is only a recorded boundary. These last three cases
are not claimed as decoder refusals. The later product host must enforce
incoming server-frame limits and semantic acceptance before updating UI state.

The trusted module Worker validates the wasm32 profile, disallows imports/start,
requires bounded nonshared memory/table and exact ABI signatures, checks and
zeroes host-owned descriptors, bounds and copies output, validates the whole
Move payload, and fences request/session/context/generation identities. External
phase watchdogs contain loops and traps in allocation, initialization, processing,
freeing and shutdown while navigation and disarm remain responsive. Rust 1.90.0
manual and independently compiled custom guests consume the shared observation
and input schema and emit equivalent typed Move previews. A custom guest is
loaded without rebuilding the host. None of this code submits native commands.

The integrator ran the combined source locally on Linux x86_64 with Chromium
153.0.8010.12. Release solution build passed with zero warnings/errors. Core
58/58, Protocol 58/58, Contracts 6/6, Tui 44/44, SurfaceArea 25/25, real browser
gateway 10/10, Node strict/profile 6/6 and actual Chromium Worker 24/24 passed.
The Rust locked build passed, and all 21 derived WASM fixture hashes matched
the independently built worker set. Integration remains 28/31: the same three
admin fixtures expect `AdminNotAvailable` while strict decoding returns
`InvalidPayload`; these were independently reproduced on the earlier protected
base. No new integration failure was observed. Synthetic timing files emitted
by that suite are not acceptance evidence for production latency.

Reproduce from this source checkout:

```console
dotnet tool restore
dotnet build FSBarV2.sln --configuration Release
dotnet run --project tests/Broker.Browser.Protocol.Tests --configuration Release --no-build
npm ci --ignore-scripts --prefix src/Broker.Browser.Contracts
npm run generate --prefix src/Broker.Browser.Contracts
node fixtures/barc-browser/scripts/build-corpus.mjs
bash scripts/build-barc-guests.sh
npm ci --ignore-scripts --prefix tests/Broker.Browser.Wasm.Tests
npm test --prefix tests/Broker.Browser.Wasm.Tests
```

The exact Fable compatibility commands are in
[its executable test README](../../../tests/Broker.Browser.Codec.Tests/README.md).
Rustup must already expose the pinned toolchain and WASM target. Playwright may
use an explicitly selected installed Chromium through `PLAYWRIGHT_EXECUTABLE_PATH`.
No toolchain or browser installation is performed by the product build script.

The fork has no hosted checks/protection configured; this evidence is local,
not a hosted CI pass. Upstream access, `.3c–.3e` product/receiver preview, `.4`
native browser control and `.7` publication/adoption remain separate.
Roadmap telemetry is not configured; native usage and efficiency remain unknown.
