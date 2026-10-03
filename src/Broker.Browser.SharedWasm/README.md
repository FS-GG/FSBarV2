# BAR shared Worker adapter preparation

This isolated Fable adapter consumes exact public `FS.GG.Wasm.Contracts` and
`FS.GG.Wasm.Browser` 0.2.0 through `Host.CreateConnected`. It preserves the
`GuestSupervisor` API for load, initialize, process, shutdown, disarm, dispose,
active and generation. Its JavaScript holds promises and converts bytes; the
installed host owns queueing, deadlines, memory safety, replacement and termination.
The existing `Broker.Browser.Wasm/barc-wire.js` validates preview and live responses.
Rejected product output calls `Host.RejectAdapterOutput` before delivery.

The deployment layout places `fable/` and the complete installed `_content/` tree
beside `index.js`, with the existing `barc-wire.js` at the sibling product path.
`assetBase` can select another installed asset directory. A `workerUrl` selects its
containing asset directory, whose Worker is the package's `module-worker.mjs`.
Deploy all transitive `policy/` and Fable library assets.

The default BAR profile uses ABI 1, destructive replacement, busy refusal,
nonempty aligned output and a 250 ms budget for each phase. Lower deadline/byte/
memory limits can be configured within the published profile; the frozen table
bound is 4096. Different table bounds are refused because this package has no
per-configuration table-limit capability. Browser elapsed-time termination is
not deterministic instruction fuel or a complete operating-system memory quota.

Run `tests/Broker.Browser.SharedWasm.Tests/build-guests.sh`, then `build.sh`, then
`npm ci && npm test` in that test directory. The project pins Fable 5.18.0 locally;
the guest build pins Rust 1.90.0 with `wasm32v1-none` and a finite 64 MiB maximum.

This preparation does not switch the production Client or receiver distribution.
Those paths and their native acceptance belong to WASM-SHARED-01.5-B2.
