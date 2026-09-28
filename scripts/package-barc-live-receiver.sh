#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "usage: $0 --source <joined-fsbar-root> --pins <barc-live-pins.json> --output <archive.tar.gz>" >&2
  exit 64
}

source_root=
pins=
output=
while [[ $# -gt 0 ]]; do
  case "$1" in
    --source) [[ $# -ge 2 ]] || usage; source_root="$2"; shift 2 ;;
    --pins) [[ $# -ge 2 ]] || usage; pins="$2"; shift 2 ;;
    --output) [[ $# -ge 2 ]] || usage; output="$2"; shift 2 ;;
    *) usage ;;
  esac
done
[[ -n "$source_root" && -n "$pins" && -n "$output" ]] || usage
source_root="$(cd "$source_root" && pwd)"
pins="$(cd "$(dirname "$pins")" && pwd)/$(basename "$pins")"
[[ "$output" = /* ]] || output="$(pwd)/$output"
[[ -f "$pins" ]] || { echo "live receiver pins not found: $pins" >&2; exit 1; }
[[ ! -e "$output" && ! -e "$output.sha256" ]] || { echo "refusing to overwrite live receiver archive" >&2; exit 1; }

jq -e '
  .schema == "fsbar.barc-live-receiver-pins/v1" and
  .profile == "barc-live-v1" and
  (.source.commit | test("^[0-9a-f]{40}$")) and
  (.files | type == "array" and length >= 7) and
  ([.files[] | select(.role != "dependency") | .role] | sort == ["clientCss","clientJs","codec","contract","customGuest","manualGuest","worker"]) and
  all(.files[]; .role == "clientCss" or .role == "clientJs" or .role == "codec" or
    .role == "contract" or .role == "customGuest" or .role == "manualGuest" or
    .role == "worker" or .role == "dependency") and
  ([.files[].archivePath] | unique | length == 7) and
  all(.files[];
    (.sha256 | test("^[0-9a-f]{64}$")) and
    (.sourcePath | test("^(?!/)(?!.*(^|/)\\.\\.(/|$)).+$")) and
    (.archivePath | test("^(src|guests)/(?!.*(^|/)\\.\\.(/|$)).+$"))) and
  (.files[] | select(.role == "clientJs") | .archivePath) == "src/Broker.Browser.Client/dist/assets/barc-preview.js" and
  (.files[] | select(.role == "clientCss") | .archivePath) == "src/Broker.Browser.Client/dist/assets/barc-preview.css" and
  (.files[] | select(.role == "worker") | .archivePath) == "src/Broker.Browser.Wasm/guest-worker.js" and
  (.files[] | select(.role == "codec") | .archivePath) == "src/Broker.Browser.Contracts/generated/codec.js" and
  (.files[] | select(.role == "contract") | .archivePath) == "src/Broker.Browser.Contracts/generated/barc_browser.js" and
  all(.files[] | select(.role == "manualGuest" or .role == "customGuest"); .archivePath | test("^guests/[^/]+\\.wasm$"))
' "$pins" >/dev/null || { echo "invalid or incomplete live receiver pins" >&2; exit 2; }

expected_commit="$(jq -r '.source.commit' "$pins")"
actual_commit="$(git -C "$source_root" rev-parse HEAD)"
[[ "$actual_commit" == "$expected_commit" ]] || { echo "joined source commit does not match live receiver pins" >&2; exit 2; }
[[ -z "$(git -C "$source_root" status --porcelain --untracked-files=no)" ]] || {
  echo "joined source has tracked changes; commit exact live composition before packaging" >&2
  exit 2
}

while IFS=$'\t' read -r role source_path archive_path expected_sha; do
  file="$source_root/$source_path"
  [[ -f "$file" ]] || { echo "missing pinned $role source: $source_path" >&2; exit 2; }
  [[ "$(sha256sum "$file" | cut -d' ' -f1)" == "$expected_sha" ]] || {
    echo "pinned $role source hash mismatch: $source_path" >&2
    exit 2
  }
  if [[ "$role" == manualGuest || "$role" == customGuest ]]; then
    [[ "$(od -An -tx1 -N4 "$file" | tr -d ' \n')" == "0061736d" && "$(stat -c '%s' "$file")" -gt 8 ]] || {
      echo "pinned $role is not a built WASM guest" >&2
      exit 2
    }
  fi
done < <(jq -r '.files[] | [.role,.sourcePath,.archivePath,.sha256] | @tsv' "$pins")

stage="$(mktemp -d "${TMPDIR:-/tmp}/barc-live-receiver-package.XXXXXX")"
cleanup() { rm -rf -- "$stage"; }
trap cleanup EXIT
payload="$stage/payload"
mkdir -p "$payload/src" "$payload/guests"
while IFS=$'\t' read -r source_path archive_path; do
  mkdir -p "$payload/$(dirname "$archive_path")"
  install -m 0644 "$source_root/$source_path" "$payload/$archive_path"
done < <(jq -r '.files[] | [.sourcePath,.archivePath] | @tsv' "$pins")

install -m 0644 "$pins" "$payload/src/BARC-LIVE-PINS.json"
if find "$payload" -type f \( -name '*.dll' -o -name '*.exe' -o -name '*.so' -o -name '*.dylib' \) -print -quit | grep -q .; then
  echo "native or managed assemblies are forbidden in the live receiver archive" >&2
  exit 1
fi

while IFS=$'\t' read -r archive_path expected_sha; do
  [[ -f "$payload/$archive_path" && "$(sha256sum "$payload/$archive_path" | cut -d' ' -f1)" == "$expected_sha" ]] || {
    echo "packaged file does not match live receiver pin: $archive_path" >&2
    exit 2
  }
done < <(jq -r '.files[] | [.archivePath,.sha256] | @tsv' "$pins")

(
  cd "$payload"
  find src/Broker.Browser.Client src/Broker.Browser.Contracts/generated src/Broker.Browser.Wasm \
       src/BARC-LIVE-PINS.json guests -type f -print0 \
    | LC_ALL=C sort -z | xargs -0 sha256sum > BARC-PREVIEW.SHA256
)

mkdir -p "$(dirname "$output")"
tar -C "$payload" --sort=name --mtime='@0' --owner=0 --group=0 --numeric-owner \
  -czf "$output" BARC-PREVIEW.SHA256 guests src
sha256sum "$output" > "$output.sha256"
echo "$output"
