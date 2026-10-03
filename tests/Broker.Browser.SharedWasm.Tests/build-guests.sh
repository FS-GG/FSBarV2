#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "$here/../.." && pwd)"
mkdir -p "$here/.guests/examples/barc-guests" "$here/.guests/sdk/barc" "$here/public/sub/app/modules"
cp -r "$root/examples/barc-guests/manual-preview" "$root/examples/barc-guests/custom-preview" "$here/.guests/examples/barc-guests/"
cp -r "$root/sdk/barc/barc-guest-sdk" "$here/.guests/sdk/barc/"
build() {
  local crate="$1" name="$2"
  shift 2
  (cd "$here/.guests/examples/barc-guests/$crate"; RUSTFLAGS="-C link-arg=--max-memory=67108864" rustup run 1.90.0 cargo build --target wasm32v1-none --release --locked "$@")
  cp "$here/.guests/examples/barc-guests/$crate/target/wasm32v1-none/release/barc_${crate//-/_}.wasm" "$here/public/sub/app/modules/$name.wasm"
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
python3 "$here/extend-guests.py"
for behavior in foreign-output empty-output unaligned-output bad-abi; do
  build manual-preview "$behavior" --features "$behavior"
done
node "$here/make-invalid-modules.mjs"
sha256sum "$here/public/sub/app/modules/"*.wasm > "$here/public/sub/app/GUEST-SHA256SUMS"
