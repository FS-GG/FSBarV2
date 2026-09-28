#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "usage: $0 <joined-fsbar-root> <output.tar.gz>" >&2
  exit 64
}

[[ $# -eq 2 ]] || usage
source_root="$(cd "$1" && pwd)"
output="$2"
[[ "$output" = /* ]] || output="$(pwd)/$output"

[[ ! -e "$output" ]] || { echo "refusing to overwrite $output" >&2; exit 1; }
[[ ! -e "$output.sha256" ]] || { echo "refusing to overwrite $output.sha256" >&2; exit 1; }

required_directories=(
  src/Broker.Browser.Client
  src/Broker.Browser.Contracts/generated
  src/Broker.Browser.Wasm
)
for relative in "${required_directories[@]}"; do
  [[ -d "$source_root/$relative" ]] || {
    echo "joined BARC source is incomplete: missing $relative" >&2
    exit 2
  }
done

guest_root="$source_root/tests/Broker.Browser.Wasm.Tests/generated"
for guest in manual-preview custom-preview; do
  file="$guest_root/$guest.wasm"
  [[ -f "$file" ]] || {
    echo "joined BARC source is incomplete: missing real guest $file" >&2
    exit 2
  }
  [[ "$(od -An -tx1 -N4 "$file" | tr -d ' \n')" == "0061736d" ]] || {
    echo "refusing non-WASM guest $file" >&2
    exit 1
  }
  [[ "$(stat -c '%s' "$file")" -gt 8 ]] || {
    echo "refusing empty WASM shell $file; package the independently built guest" >&2
    exit 1
  }
done

stage="$(mktemp -d "${TMPDIR:-/tmp}/barc-preview-package.XXXXXX")"
cleanup() { rm -rf -- "$stage"; }
trap cleanup EXIT
payload="$stage/payload"
mkdir -p "$payload/src" "$payload/guests"

copy_tree() {
  local relative="$1" destination="$payload/$relative"
  mkdir -p "$destination"
  tar -C "$source_root/$relative" \
    --exclude='node_modules' --exclude='bin' --exclude='obj' --exclude='.vite' \
    --exclude='TestResults' --exclude='playwright-report' --exclude='test-results' \
    -cf - . | tar -C "$destination" -xf -
}

for relative in "${required_directories[@]}"; do
  copy_tree "$relative"
done
install -m 0644 "$guest_root/manual-preview.wasm" "$payload/guests/manual-preview.wasm"
install -m 0644 "$guest_root/custom-preview.wasm" "$payload/guests/custom-preview.wasm"

if find "$payload" -type f \( -name '*.dll' -o -name '*.exe' -o -name '*.so' -o -name '*.dylib' \) -print -quit | grep -q .; then
  echo "native or managed assemblies are forbidden in the Fable receiver archive" >&2
  exit 1
fi

(
  cd "$payload"
  find src/Broker.Browser.Client src/Broker.Browser.Contracts/generated \
       src/Broker.Browser.Wasm guests -type f -print0 \
    | LC_ALL=C sort -z \
    | xargs -0 sha256sum > BARC-PREVIEW.SHA256
)

mkdir -p "$(dirname "$output")"
tar -C "$payload" --sort=name --mtime='@0' --owner=0 --group=0 --numeric-owner \
  -czf "$output" BARC-PREVIEW.SHA256 guests src
sha256sum "$output" > "$output.sha256"
echo "$output"
