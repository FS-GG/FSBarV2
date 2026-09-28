#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
clean_receiver="${1:?path to a freshly generated public receiver required}"
work="$(mktemp -d "${TMPDIR:-/tmp}/barc-receiver-adoption-test.XXXXXX")"
cleanup() { rm -rf -- "$work"; }
trap cleanup EXIT

tar -C "$clean_receiver" --exclude='./.git' -cf - . | tar -C "$work" -xf -
git -C "$work" init -q

mkdir -p "$work/authored" "$work/.agents/skills/local-owner"
printf '%s\n' 'user module' > "$work/authored/UserModule.fs"
printf '%s\n' 'user config' > "$work/user.config"
printf '%s\n' 'owner lifecycle' > "$work/.agents/skills/local-owner/SKILL.md"
preserved_before="$(sha256sum "$work/authored/UserModule.fs" "$work/user.config" "$work/.agents/skills/local-owner/SKILL.md")"

source="$work/source"
mkdir -p \
  "$source/src/Broker.Browser.Client/dist/assets" \
  "$source/src/Broker.Browser.Contracts/generated" \
  "$source/src/Broker.Browser.Wasm" \
  "$source/tests/Broker.Browser.Wasm.Tests/generated"
printf '%s\n' 'export function mount() { return () => {}; }' > "$source/src/Broker.Browser.Client/dist/assets/barc-preview.js"
printf '%s\n' '.barc-preview {}' > "$source/src/Broker.Browser.Client/dist/assets/barc-preview.css"
printf '%s\n' 'generated-codec' > "$source/src/Broker.Browser.Contracts/generated/barc_browser.js"
printf '%s\n' 'self.onmessage = () => {};' > "$source/src/Broker.Browser.Wasm/guest-worker.js"
printf '\x00\x61\x73\x6d\x01\x00\x00\x00\x00\x00' > "$source/tests/Broker.Browser.Wasm.Tests/generated/manual-preview.wasm"
printf '\x00\x61\x73\x6d\x01\x00\x00\x00\x00\x00' > "$source/tests/Broker.Browser.Wasm.Tests/generated/custom-preview.wasm"

"$repo_root/scripts/package-barc-preview.sh" "$source" "$work/barc-preview.tar.gz" >/dev/null
"$repo_root/scripts/adopt-barc-preview.sh" "$work/barc-preview.tar.gz" "$work" >/dev/null

[[ "$preserved_before" == "$(sha256sum "$work/authored/UserModule.fs" "$work/user.config" "$work/.agents/skills/local-owner/SKILL.md")" ]] || {
  echo "adoption changed unrelated/user/lifecycle files" >&2
  exit 1
}
grep -F 'barc-preview-root' "$work/Client/index.html" >/dev/null
grep -F 'initialGatewayUrl' "$repo_root/examples/barc-fable-game/BARC_RECEIVER_PROVENANCE.json" >/dev/null

tree_before="$(find "$work" -type f -not -path "$work/.git/*" -print0 | sort -z | xargs -0 sha256sum | sha256sum)"
if "$repo_root/scripts/adopt-barc-preview.sh" "$work/barc-preview.tar.gz" "$work" >/dev/null 2>&1; then
  echo "repeated adoption overwrote managed files" >&2
  exit 1
fi
[[ "$tree_before" == "$(find "$work" -type f -not -path "$work/.git/*" -print0 | sort -z | xargs -0 sha256sum | sha256sum)" ]] || {
  echo "collision refusal changed the retained receiver" >&2
  exit 1
}

echo "receiver retained/collision adoption test: passed"
