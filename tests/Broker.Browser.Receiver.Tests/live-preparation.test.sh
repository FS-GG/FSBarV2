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
for dependency in barc-wire.js wasm-profile.js guest-supervisor.js index.js; do
  printf 'export const dependency = "%s";\n' "$dependency" > "$source/src/Broker.Browser.Wasm/$dependency"
done
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
  --arg barcWire "$(sha src/Broker.Browser.Wasm/barc-wire.js)" \
  --arg wasmProfile "$(sha src/Broker.Browser.Wasm/wasm-profile.js)" \
  --arg guestSupervisor "$(sha src/Broker.Browser.Wasm/guest-supervisor.js)" \
  --arg wasmIndex "$(sha src/Broker.Browser.Wasm/index.js)" \
  --arg manual "$(sha guest-build/manual-live.wasm)" --arg custom "$(sha guest-build/custom-live.wasm)" '
  {schema:"fsbar.barc-live-receiver-pins/v2",profile:"barc-live-tactical-v1",
   protocolVersion:2,tacticalRevision:1,guestAbiVersion:1,source:{commit:$commit},files:[
    {role:"clientJs",sourcePath:"src/Broker.Browser.Client/dist/assets/barc-preview.js",archivePath:"src/Broker.Browser.Client/dist/assets/barc-preview.js",sha256:$clientJs},
    {role:"clientCss",sourcePath:"src/Broker.Browser.Client/dist/assets/barc-preview.css",archivePath:"src/Broker.Browser.Client/dist/assets/barc-preview.css",sha256:$clientCss},
    {role:"codec",sourcePath:"src/Broker.Browser.Contracts/generated/codec.js",archivePath:"src/Broker.Browser.Contracts/generated/codec.js",sha256:$codec},
    {role:"contract",sourcePath:"src/Broker.Browser.Contracts/generated/barc_browser.js",archivePath:"src/Broker.Browser.Contracts/generated/barc_browser.js",sha256:$contract},
    {role:"worker",sourcePath:"src/Broker.Browser.Wasm/guest-worker.js",archivePath:"src/Broker.Browser.Wasm/guest-worker.js",sha256:$worker},
    {role:"manualGuest",sourcePath:"guest-build/manual-live.wasm",archivePath:"guests/manual-live.wasm",sha256:$manual},
    {role:"customGuest",sourcePath:"guest-build/custom-live.wasm",archivePath:"guests/custom-live.wasm",sha256:$custom},
    {role:"dependency",sourcePath:"src/Broker.Browser.Wasm/barc-wire.js",archivePath:"src/Broker.Browser.Wasm/barc-wire.js",sha256:$barcWire},
    {role:"dependency",sourcePath:"src/Broker.Browser.Wasm/wasm-profile.js",archivePath:"src/Broker.Browser.Wasm/wasm-profile.js",sha256:$wasmProfile},
    {role:"dependency",sourcePath:"src/Broker.Browser.Wasm/guest-supervisor.js",archivePath:"src/Broker.Browser.Wasm/guest-supervisor.js",sha256:$guestSupervisor},
    {role:"dependency",sourcePath:"src/Broker.Browser.Wasm/index.js",archivePath:"src/Broker.Browser.Wasm/index.js",sha256:$wasmIndex}]}' > "$pins"

"$repo_root/scripts/package-barc-live-receiver.sh" --source "$source" --pins "$pins" --output "$work/first.tar.gz" >/dev/null
"$repo_root/scripts/package-barc-live-receiver.sh" --source "$source" --pins "$pins" --output "$work/second.tar.gz" >/dev/null
cmp "$work/first.tar.gz" "$work/second.tar.gz"
"$repo_root/scripts/qualify-barc-receiver-live-prep.sh" --product-root "$source" \
  --archive "$work/first.tar.gz" --pins "$pins" --evidence "$work/evidence" >/dev/null
jq -e '.schema == "fsbar.barc-live-receiver-preparation/v2" and .disposition == "prepared" and
  .profile == "barc-live-tactical-v1" and
  .negotiation == {protocolVersion:2,tacticalRevision:1,guestAbiVersion:1,explicitOptIn:true} and
  .availability.factoryRally == {complete:false,disposition:"unavailable-until-native-catalogue-complete"} and
  .archive.manifestVerified == true and .receiver.previewRoutePreserved == true and
  (.claims | all(. == false)) and (.pending | length == 5)' "$work/evidence/qualification.json" >/dev/null
[[ "$(stat -c '%a' "$work/evidence/qualification.json")" == 600 ]]
cmp "$source/src/Broker.Browser.Wasm/barc-wire.js" \
  "$work/evidence/src/Broker.Browser.Wasm/barc-wire.js"
grep -F 'src/Broker.Browser.Wasm/barc-wire.js' "$work/evidence/BARC-PREVIEW.SHA256" >/dev/null

duplicate_pins="$work/duplicate-pins.json"
jq '(.files[] | select(.role == "dependency") | .archivePath) = "src/Broker.Browser.Wasm/guest-worker.js"' \
  "$pins" > "$duplicate_pins"
if "$repo_root/scripts/package-barc-live-receiver.sh" --source "$source" --pins "$duplicate_pins" \
  --output "$work/duplicate.tar.gz" >/dev/null 2>&1; then
  echo "live packager accepted duplicate archive destinations" >&2
  exit 1
fi

wrong_negotiation_pins="$work/wrong-negotiation-pins.json"
jq '.tacticalRevision = 2' "$pins" > "$wrong_negotiation_pins"
if "$repo_root/scripts/package-barc-live-receiver.sh" --source "$source" --pins "$wrong_negotiation_pins" \
  --output "$work/wrong-negotiation.tar.gz" >/dev/null 2>&1; then
  echo "live packager accepted a non-frozen tactical revision" >&2
  exit 1
fi
if "$repo_root/scripts/qualify-barc-receiver-live-prep.sh" --product-root "$source" \
  --archive "$work/first.tar.gz" --pins "$duplicate_pins" --evidence "$work/duplicate-evidence" >/dev/null 2>&1; then
  echo "live qualifier accepted duplicate archive destinations" >&2
  exit 1
fi

dotdot_pins="$work/dotdot-pins.json"
jq '(.files[] | select(.role == "dependency") | .archivePath) = "src/../escape.js"' \
  "$pins" > "$dotdot_pins"
if "$repo_root/scripts/package-barc-live-receiver.sh" --source "$source" --pins "$dotdot_pins" \
  --output "$work/dotdot.tar.gz" >/dev/null 2>&1; then
  echo "live packager accepted first archive dotdot component" >&2
  exit 1
fi

printf '%s\n' 'outside source bytes' > "$work/outside-source.js"
ln -s "$work/outside-source.js" "$source/escape-link.js"
escape_pins="$work/escape-pins.json"
jq --arg sha "$(sha256sum "$work/outside-source.js" | cut -d' ' -f1)" \
  '.files += [{role:"dependency",sourcePath:"escape-link.js",archivePath:"src/escape-link.js",sha256:$sha}]' \
  "$pins" > "$escape_pins"
if "$repo_root/scripts/package-barc-live-receiver.sh" --source "$source" --pins "$escape_pins" \
  --output "$work/escape.tar.gz" >/dev/null 2>&1; then
  echo "live packager accepted a source symlink escaping the source root" >&2
  exit 1
fi

mkdir "$work/outside"
printf '%s\n' 'preserve-me' > "$work/outside/sentinel"
python3 - "$work/unsafe.tar.gz" "$work/outside" <<'PY'
import io, sys, tarfile
archive, outside = sys.argv[1:]
with tarfile.open(archive, "w:gz") as output:
    link = tarfile.TarInfo("src")
    link.type = tarfile.SYMTYPE
    link.linkname = outside
    output.addfile(link)
    data = b"overwrite\n"
    item = tarfile.TarInfo("src/sentinel")
    item.size = len(data)
    output.addfile(item, io.BytesIO(data))
PY
if "$repo_root/scripts/qualify-barc-receiver-live-prep.sh" --product-root "$source" \
  --archive "$work/unsafe.tar.gz" --pins "$pins" --evidence "$work/unsafe-evidence" >/dev/null 2>&1; then
  echo "live qualifier accepted an unsafe archive member type" >&2
  exit 1
fi
[[ "$(cat "$work/outside/sentinel")" == preserve-me ]]
[[ ! -e "$work/unsafe-evidence/src/sentinel" ]]

printf '%s\n' 'changed' >> "$source/src/Broker.Browser.Wasm/guest-worker.js"
if "$repo_root/scripts/package-barc-live-receiver.sh" --source "$source" --pins "$pins" --output "$work/mutated.tar.gz" >/dev/null 2>&1; then
  echo "live packager accepted changed product bytes" >&2
  exit 1
fi

grep -F 'searchParams.get("barc-profile")' "$repo_root/examples/barc-fable-game/adapter/Client/barc-receiver.js" >/dev/null
grep -F 'profile === "barc-live-v1"' "$repo_root/examples/barc-fable-game/adapter/Client/barc-receiver.js" >/dev/null
grep -F 'profile === "barc-live-tactical-v1"' "$repo_root/examples/barc-fable-game/adapter/Client/barc-receiver.js" >/dev/null
if [[ -n "${BARC_LIVE_PREP_TEST_RECEIPT:-}" ]]; then
  [[ ! -e "$BARC_LIVE_PREP_TEST_RECEIPT" ]] || { echo "focused receipt path already exists" >&2; exit 1; }
  mkdir -p "$(dirname "$BARC_LIVE_PREP_TEST_RECEIPT")"
  umask 077
  jq -n --arg head "$(git -C "$repo_root" rev-parse HEAD)" '{
    schema:"fsbar.barc-live-receiver-focused-tests/v1",result:"passed",sourceHead:$head,
    positive:{dependencyPackaged:true,manifestVerified:true,qualificationPrepared:true},
    refusals:{duplicateArchiveDestination:true,firstDotdotComponent:true,
      sourceSymlinkEscape:true,unsafeTarTypeBeforeExtraction:true,outsideSentinelPreserved:true,
      changedProductBytes:true,nonFrozenTacticalRevision:true},
    claims:{liveAcceptance:false,nativeRuntime:false,publication:false}
  }' > "$BARC_LIVE_PREP_TEST_RECEIPT"
  chmod 0600 "$BARC_LIVE_PREP_TEST_RECEIPT"
fi
printf '%s\n' 'live receiver preparation test: passed'
