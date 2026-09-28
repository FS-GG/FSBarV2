#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
work="$(mktemp -d "${TMPDIR:-/tmp}/barc-receiver-package-test.XXXXXX")"
cleanup() { rm -rf -- "$work"; }
trap cleanup EXIT

mkdir -p \
  "$work/source/src/Broker.Browser.Client/dist" \
  "$work/source/src/Broker.Browser.Contracts/generated" \
  "$work/source/src/Broker.Browser.Wasm" \
  "$work/source/tests/Broker.Browser.Wasm.Tests/generated"
printf '%s\n' 'module Broker.Browser.Client.BarcPreview' > "$work/source/src/Broker.Browser.Client/BarcPreview.fs"
printf '%s\n' 'built-client' > "$work/source/src/Broker.Browser.Client/dist/index.js"
printf '%s\n' 'generated-codec' > "$work/source/src/Broker.Browser.Contracts/generated/barc_browser.js"
printf '%s\n' 'self.onmessage = () => {};' > "$work/source/src/Broker.Browser.Wasm/guest-worker.js"
printf '\x00\x61\x73\x6d\x01\x00\x00\x00\x00\x00' > "$work/source/tests/Broker.Browser.Wasm.Tests/generated/manual-preview.wasm"
printf '\x00\x61\x73\x6d\x01\x00\x00\x00\x00\x00' > "$work/source/tests/Broker.Browser.Wasm.Tests/generated/custom-preview.wasm"

"$repo_root/scripts/package-barc-preview.sh" "$work/source" "$work/first.tar.gz" >/dev/null
"$repo_root/scripts/package-barc-preview.sh" "$work/source" "$work/second.tar.gz" >/dev/null
cmp "$work/first.tar.gz" "$work/second.tar.gz"

mkdir "$work/unpacked"
tar -xzf "$work/first.tar.gz" -C "$work/unpacked"
(
  cd "$work/unpacked"
  sha256sum --check BARC-PREVIEW.SHA256 >/dev/null
)

expected="$work/expected.txt"
actual="$work/actual.txt"
printf '%s\n' \
  BARC-PREVIEW.SHA256 \
  guests/custom-preview.wasm \
  guests/manual-preview.wasm \
  src/Broker.Browser.Client/BarcPreview.fs \
  src/Broker.Browser.Client/dist/index.js \
  src/Broker.Browser.Contracts/generated/barc_browser.js \
  src/Broker.Browser.Wasm/guest-worker.js > "$expected"
find "$work/unpacked" -type f -printf '%P\n' | LC_ALL=C sort > "$actual"
diff -u "$expected" "$actual"

if "$repo_root/scripts/package-barc-preview.sh" "$work/source" "$work/first.tar.gz" >/dev/null 2>&1; then
  echo "packager overwrote an immutable archive" >&2
  exit 1
fi

printf '%s\n' 'receiver archive package test: passed'
