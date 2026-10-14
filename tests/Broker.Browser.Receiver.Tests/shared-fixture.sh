# Inert deployed assets for archive integrity controls; no guest/browser runs.
shared_fixture() {
  local source="$1" shared="$1/src/Broker.Browser.SharedWasm"
  mkdir -p "$shared/fable" "$shared/_content/FS.GG.Wasm.Browser/policy" "$source/src/Broker.Browser.Wasm"
  printf '%s\n' 'export { GuestSupervisor } from "../Broker.Browser.SharedWasm/index.js";' > "$source/src/Broker.Browser.Wasm/index.js"
  printf '%s\n' 'export {};' > "$source/src/Broker.Browser.Wasm/guest-worker.js"
  printf '%s\n' 'export {};' > "$source/src/Broker.Browser.Wasm/guest-supervisor.js"
  printf '%s\n' 'export {};' > "$source/src/Broker.Browser.Wasm/barc-wire.js"
  printf '%s\n' 'export {};' > "$source/src/Broker.Browser.Wasm/wasm-profile.js"
  printf '%s\n' 'import "./fable/Adapter.js"; import "./_content/FS.GG.Wasm.Browser/worker-client.mjs"; export class GuestSupervisor {}' > "$shared/index.js"
  printf '%s\n' 'import "../_content/FS.GG.Wasm.Browser/policy/Host.js";' > "$shared/fable/Adapter.js"
  printf '%s\n' 'export {};' > "$shared/_content/FS.GG.Wasm.Browser/worker-client.mjs"
  printf '%s\n' 'import "./policy/WorkerEntry.js";' > "$shared/_content/FS.GG.Wasm.Browser/module-worker.mjs"
  printf '%s\n' 'import "./Owned.js";' > "$shared/_content/FS.GG.Wasm.Browser/policy/Host.js"
  printf '%s\n' 'import "./Owned.js";' > "$shared/_content/FS.GG.Wasm.Browser/policy/WorkerEntry.js"
  printf '%s\n' 'export {};' > "$shared/_content/FS.GG.Wasm.Browser/policy/Owned.js"
}
