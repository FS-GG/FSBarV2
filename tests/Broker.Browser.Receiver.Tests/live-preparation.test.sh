#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
work="$(mktemp -d "${TMPDIR:-/tmp}/barc-live-receiver-prep-test.XXXXXX")"
cleanup() { rm -rf -- "$work"; }
trap cleanup EXIT
source="$work/source"
mkdir -p "$source/src/Broker.Browser.Client/dist/assets" \
  "$source/src/Broker.Browser.Contracts/generated" "$source/src/Broker.Browser.Wasm" \
  "$source/guest-build"
printf '%s\n' 'export function mount() { return () => {}; }' > "$source/src/Broker.Browser.Client/dist/assets/barc-preview.js"
printf '%s\n' '.barc-preview {}' > "$source/src/Broker.Browser.Client/dist/assets/barc-preview.css"
printf '%s\n' 'codec' > "$source/src/Broker.Browser.Contracts/generated/codec.js"
printf '%s\n' 'contract' > "$source/src/Broker.Browser.Contracts/generated/barc_browser.js"
printf '%s\n' 'self.onmessage = () => {};' > "$source/src/Broker.Browser.Wasm/guest-worker.js"
printf '\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x00' > "$source/guest-build/manual-live.wasm"
printf '\x00\x61\x73\x6d\x01\x00\x00\x00\x02\x00' > "$source/guest-build/custom-live.wasm"
git -C "$source" init -q
git -C "$source" config user.name receiver-test
git -C "$source" config user.email receiver-test@example.invalid
git -C "$source" add .
git -C "$source" commit -qm source
commit="$(git -C "$source" rev-parse HEAD)"

sha() { sha256sum "$source/$1" | cut -d' ' -f1; }
pins="$work/pins.json"
jq -n --arg commit "$commit" \
  --arg clientJs "$(sha src/Broker.Browser.Client/dist/assets/barc-preview.js)" \
  --arg clientCss "$(sha src/Broker.Browser.Client/dist/assets/barc-preview.css)" \
  --arg codec "$(sha src/Broker.Browser.Contracts/generated/codec.js)" \
  --arg contract "$(sha src/Broker.Browser.Contracts/generated/barc_browser.js)" \
  --arg worker "$(sha src/Broker.Browser.Wasm/guest-worker.js)" \
  --arg manual "$(sha guest-build/manual-live.wasm)" --arg custom "$(sha guest-build/custom-live.wasm)" '
  {schema:"fsbar.barc-live-receiver-pins/v1",profile:"barc-live-v1",source:{commit:$commit},files:[
    {role:"clientJs",sourcePath:"src/Broker.Browser.Client/dist/assets/barc-preview.js",archivePath:"src/Broker.Browser.Client/dist/assets/barc-preview.js",sha256:$clientJs},
    {role:"clientCss",sourcePath:"src/Broker.Browser.Client/dist/assets/barc-preview.css",archivePath:"src/Broker.Browser.Client/dist/assets/barc-preview.css",sha256:$clientCss},
    {role:"codec",sourcePath:"src/Broker.Browser.Contracts/generated/codec.js",archivePath:"src/Broker.Browser.Contracts/generated/codec.js",sha256:$codec},
    {role:"contract",sourcePath:"src/Broker.Browser.Contracts/generated/barc_browser.js",archivePath:"src/Broker.Browser.Contracts/generated/barc_browser.js",sha256:$contract},
    {role:"worker",sourcePath:"src/Broker.Browser.Wasm/guest-worker.js",archivePath:"src/Broker.Browser.Wasm/guest-worker.js",sha256:$worker},
    {role:"manualGuest",sourcePath:"guest-build/manual-live.wasm",archivePath:"guests/manual-live.wasm",sha256:$manual},
    {role:"customGuest",sourcePath:"guest-build/custom-live.wasm",archivePath:"guests/custom-live.wasm",sha256:$custom}]}' > "$pins"

"$repo_root/scripts/package-barc-live-receiver.sh" --source "$source" --pins "$pins" --output "$work/first.tar.gz" >/dev/null
"$repo_root/scripts/package-barc-live-receiver.sh" --source "$source" --pins "$pins" --output "$work/second.tar.gz" >/dev/null
cmp "$work/first.tar.gz" "$work/second.tar.gz"
"$repo_root/scripts/qualify-barc-receiver-live-prep.sh" --product-root "$source" \
  --archive "$work/first.tar.gz" --pins "$pins" --evidence "$work/evidence" >/dev/null
jq -e '.disposition == "prepared" and .profile == "barc-live-v1" and
  .archive.manifestVerified == true and .receiver.previewRoutePreserved == true and
  (.claims | all(. == false)) and (.pending | length == 4)' "$work/evidence/qualification.json" >/dev/null
[[ "$(stat -c '%a' "$work/evidence/qualification.json")" == 600 ]]

printf '%s\n' 'changed' >> "$source/src/Broker.Browser.Wasm/guest-worker.js"
if "$repo_root/scripts/package-barc-live-receiver.sh" --source "$source" --pins "$pins" --output "$work/mutated.tar.gz" >/dev/null 2>&1; then
  echo "live packager accepted changed product bytes" >&2
  exit 1
fi

grep -F 'searchParams.get("barc-profile")' "$repo_root/examples/barc-fable-game/adapter/Client/barc-receiver.js" >/dev/null
grep -F 'profile === "barc-live-v1"' "$repo_root/examples/barc-fable-game/adapter/Client/barc-receiver.js" >/dev/null
printf '%s\n' 'live receiver preparation test: passed'
