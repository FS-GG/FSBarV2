#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "usage: $0 --product-root <joined-fsbar> --archive <live-receiver.tar.gz> --pins <barc-live-pins.json> --evidence <new-directory>" >&2
  exit 64
}

product_root=
archive=
pins=
evidence=
while [[ $# -gt 0 ]]; do
  case "$1" in
    --product-root) [[ $# -ge 2 ]] || usage; product_root="$2"; shift 2 ;;
    --archive) [[ $# -ge 2 ]] || usage; archive="$2"; shift 2 ;;
    --pins) [[ $# -ge 2 ]] || usage; pins="$2"; shift 2 ;;
    --evidence) [[ $# -ge 2 ]] || usage; evidence="$2"; shift 2 ;;
    *) usage ;;
  esac
done
[[ -n "$product_root" && -n "$archive" && -n "$pins" && -n "$evidence" ]] || usage
product_root="$(cd "$product_root" && pwd)"
archive="$(cd "$(dirname "$archive")" && pwd)/$(basename "$archive")"
pins="$(cd "$(dirname "$pins")" && pwd)/$(basename "$pins")"
[[ ! -e "$evidence" ]] || { echo "evidence path must not exist: $evidence" >&2; exit 1; }
[[ -f "$archive" && -f "$pins" ]] || { echo "archive and pins are required" >&2; exit 1; }

umask 077
mkdir -m 0700 "$evidence"
if [[ -f "$archive.sha256" ]]; then
  [[ "$(cut -d' ' -f1 "$archive.sha256")" == "$(sha256sum "$archive" | cut -d' ' -f1)" ]] || {
    echo "live receiver archive sidecar hash mismatch" >&2; exit 1;
  }
fi
if tar -tzf "$archive" | grep -Eq '(^/|(^|/)\.\.(/|$))'; then
  echo "live receiver archive contains an unsafe path" >&2; exit 1
fi
tar -xzf "$archive" -C "$evidence"
if find "$evidence" -type l -print -quit | grep -q .; then
  echo "live receiver archive contains a symbolic link" >&2; exit 1
fi
expected_files="$evidence/.expected-files"
actual_files="$evidence/.actual-files"
{ printf '%s\n' BARC-PREVIEW.SHA256; awk '{print $2}' "$evidence/BARC-PREVIEW.SHA256"; } | LC_ALL=C sort > "$expected_files"
find "$evidence" -type f ! -name '.expected-files' ! -name '.actual-files' -printf '%P\n' | LC_ALL=C sort > "$actual_files"
cmp "$expected_files" "$actual_files" || { echo "archive contains an unmanifested or missing file" >&2; exit 1; }
rm "$expected_files" "$actual_files"
cmp "$pins" "$evidence/src/BARC-LIVE-PINS.json"
(
  cd "$evidence"
  sha256sum --check BARC-PREVIEW.SHA256 > manifest-check.log
)

expected_commit="$(jq -r '.source.commit' "$pins")"
[[ "$(git -C "$product_root" rev-parse HEAD)" == "$expected_commit" ]] || {
  echo "qualification product source does not match live pins" >&2; exit 2;
}
while IFS=$'\t' read -r source_path archive_path expected_sha; do
  [[ "$(sha256sum "$product_root/$source_path" | cut -d' ' -f1)" == "$expected_sha" ]] || {
    echo "qualification source hash mismatch: $source_path" >&2; exit 2;
  }
  [[ "$(sha256sum "$evidence/$archive_path" | cut -d' ' -f1)" == "$expected_sha" ]] || {
    echo "qualification archive hash mismatch: $archive_path" >&2; exit 2;
  }
done < <(jq -r '.files[] | [.sourcePath,.archivePath,.sha256] | @tsv' "$pins")

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
adapter="$repo_root/examples/barc-fable-game/adapter/Client/barc-receiver.js"
grep -F 'barc-live-v1' "$adapter" >/dev/null
grep -F 'barc-preview-v1' "$adapter" >/dev/null
grep -F 'searchParams.get("barc-profile")' "$adapter" >/dev/null

archive_sha="$(sha256sum "$archive" | cut -d' ' -f1)"
pins_sha="$(sha256sum "$pins" | cut -d' ' -f1)"
jq -n --arg sourceCommit "$expected_commit" --arg archiveSha "$archive_sha" --arg pinsSha "$pins_sha" '
  {schema:"fsbar.barc-live-receiver-preparation/v1",disposition:"prepared",profile:"barc-live-v1",
   source:{commit:$sourceCommit},archive:{sha256:$archiveSha,pinsSha256:$pinsSha,manifestVerified:true},
   receiver:{route:"/barc/?barc-profile=barc-live-v1",previewRoutePreserved:true,
     publicScaffold:{templates:"0.15.0",sdd:"2.0.3"},pairingStorage:"memory-only"},
   claims:{generatedBuild:false,pointerJourney:false,keyboardJourney:false,customGuestNativeEffect:false,
     actualNativeRuntime:false,publication:false,milestoneComplete:false},
   pending:["joined Broker/Browser/native source","final live guest hashes","clean and retained receiver adoption","actual native pointer and keyboard journeys"]}' \
  > "$evidence/qualification.json"
chmod 0600 "$evidence/qualification.json"
echo "$evidence/qualification.json"
