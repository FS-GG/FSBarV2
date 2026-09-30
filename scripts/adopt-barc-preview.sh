#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "usage: $0 <barc-preview.tar.gz> <generated-receiver-root>" >&2
  exit 64
}

[[ $# -eq 2 ]] || usage
archive="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
receiver="$(cd "$2" && pwd)"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
adapter="$repo_root/examples/barc-fable-game/adapter/Client/barc-receiver.js"
overlay="$repo_root/examples/barc-fable-game/receiver.patch"
target="$receiver/Client/public/barc-preview"
adapter_target="$receiver/Client/barc-receiver.js"

[[ -f "$archive" ]] || { echo "archive not found: $archive" >&2; exit 1; }
[[ -d "$receiver/.git" && -f "$receiver/Client/index.html" ]] || {
  echo "receiver is not a clean SDD-generated fs-gg-fable-game workspace: $receiver" >&2
  exit 1
}
[[ ! -e "$target" ]] || { echo "refusing collision at $target" >&2; exit 3; }
[[ ! -e "$adapter_target" ]] || { echo "refusing collision at $adapter_target" >&2; exit 3; }

if [[ -f "$archive.sha256" ]]; then
  expected="$(cut -d' ' -f1 "$archive.sha256")"
  actual="$(sha256sum "$archive" | cut -d' ' -f1)"
  [[ "$actual" == "$expected" ]] || { echo "archive sidecar hash mismatch" >&2; exit 1; }
fi

if tar -tzf "$archive" | grep -Eq '(^/|(^|/)\.\.(/|$))'; then
  echo "archive contains an unsafe path" >&2
  exit 1
fi
if tar -tzf "$archive" | grep -Ev '^(BARC-PREVIEW\.SHA256|guests(/|$)|src(/|$))' | grep -q .; then
  echo "archive contains a path outside the frozen BARC layout" >&2
  exit 1
fi

stage="$(mktemp -d "${TMPDIR:-/tmp}/barc-preview-adopt.XXXXXX")"
cleanup() { rm -rf -- "$stage"; }
trap cleanup EXIT
tar -xzf "$archive" -C "$stage"
(
  cd "$stage"
  sha256sum --check BARC-PREVIEW.SHA256 >/dev/null
)

required=(
  src/Broker.Browser.Client/dist/assets/barc-preview.js
  src/Broker.Browser.Client/dist/assets/barc-preview.css
  src/Broker.Browser.Wasm/guest-worker.js
)
if [[ -f "$stage/src/BARC-LIVE-PINS.json" ]]; then
  jq -e '
    (.schema == "fsbar.barc-live-receiver-pins/v1" or .schema == "fsbar.barc-live-receiver-pins/v2") and
    ([.files[] | select(.role == "manualGuest")] | length == 1) and
    ([.files[] | select(.role == "customGuest")] | length == 1)
  ' "$stage/src/BARC-LIVE-PINS.json" >/dev/null || {
    echo "archive contains invalid live receiver pins" >&2
    exit 2
  }
  mapfile -t live_guests < <(
    jq -r '.files[] | select(.role == "manualGuest" or .role == "customGuest") | .archivePath' \
      "$stage/src/BARC-LIVE-PINS.json"
  )
  required+=("${live_guests[@]}")
else
  required+=(guests/manual-preview.wasm guests/custom-preview.wasm)
fi
for relative in "${required[@]}"; do
  [[ -f "$stage/$relative" ]] || {
    echo "archive is missing required receiver asset $relative" >&2
    exit 2
  }
done

# The exact public bytes are the patch base. An owner edit to a managed file is a
# collision and must refuse before the archive or adapter writes anything.
git -C "$receiver" apply --check "$overlay" || {
  echo "receiver managed-file collision; no files were changed" >&2
  exit 3
}

mkdir -p "$receiver/Client/public"
mv "$stage" "$target"
install -m 0644 "$adapter" "$adapter_target"
git -C "$receiver" apply "$overlay"

echo "$target"
