#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
toolchain_bin="/home/developer/.rustup/toolchains/1.90.0-x86_64-unknown-linux-gnu/bin"
expected_cargo="cargo 1.90.0 (840b83a10 2025-07-30)"
output="$repo_root/tests/Broker.Browser.Wasm.Tests/generated"
export PATH="$toolchain_bin:/home/developer/.cargo/bin:$PATH"

if [[ "$(cargo --version)" != "$expected_cargo" ]]; then
  echo "expected $expected_cargo; found $(cargo --version)" >&2
  exit 1
fi
rustup +1.90.0 target list --installed | grep -qx wasm32-unknown-unknown || {
  echo "Rust 1.90.0 wasm32-unknown-unknown target is required" >&2
  exit 1
}

mkdir -p "$output"

build() {
  local crate="$1" name="$2"
  shift 2
  (
    cd "$repo_root/examples/barc-guests/$crate"
    cargo build --target wasm32-unknown-unknown --release --locked "$@"
  )
  install -m 0644 \
    "$repo_root/examples/barc-guests/$crate/target/wasm32-unknown-unknown/release/barc_${crate//-/_}.wasm" \
    "$output/$name.wasm"
}

build manual-preview manual-preview
build custom-preview custom-preview
build manual-preview require-zero-descriptor --features require-zero-descriptor
for phase in alloc init process free shutdown; do
  build manual-preview "hang-$phase" --features "hang-$phase"
  build manual-preview "trap-$phase" --features "trap-$phase"
done
for behavior in oob-descriptor overlap-output malformed-output oversized-output; do
  build manual-preview "$behavior" --features "$behavior"
done

node "$repo_root/tests/Broker.Browser.Wasm.Tests/make-invalid-modules.mjs"

sha256sum "$output"/*.wasm
