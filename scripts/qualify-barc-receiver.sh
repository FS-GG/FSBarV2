#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "usage: $0 --evidence <new-directory> [--baseline <scaffold-only-evidence>] (--scaffold-only | --archive <barc-preview.tar.gz>)" >&2
  exit 64
}

evidence=
archive=
scaffold_only=false
baseline=
while [[ $# -gt 0 ]]; do
  case "$1" in
    --evidence) [[ $# -ge 2 ]] || usage; evidence="$2"; shift 2 ;;
    --archive) [[ $# -ge 2 ]] || usage; archive="$2"; shift 2 ;;
    --baseline) [[ $# -ge 2 ]] || usage; baseline="$2"; shift 2 ;;
    --scaffold-only) scaffold_only=true; shift ;;
    *) usage ;;
  esac
done
[[ -n "$evidence" ]] || usage
if [[ "$scaffold_only" == true ]]; then
  [[ -z "$archive" ]] || usage
else
  [[ -n "$archive" ]] || usage
fi
[[ ! -e "$evidence" ]] || { echo "evidence path must not exist: $evidence" >&2; exit 1; }

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
template_version=0.15.0
sdd_version=2.0.3
template_sha=b822e77d4046a81c453d983a78cc6f319c67a2d3cbd3ec354d7038687416ec3e
sdd_sha=b950bf4fc46a09554a51b6b31f920830c8811bb6580b2724c500b8317bcfa9d7
provider_sha=16326925cd728a833cc2a1febc0ab2865ea5120047fe8a1d56ee499aed68161a
public=https://api.nuget.org/v3-flatcontainer

mkdir -p "$evidence/feed" "$evidence/home" "$evidence/packages" "$evidence/http" "$evidence/tools"
export DOTNET_CLI_HOME="$evidence/home"
export NUGET_PACKAGES="$evidence/packages"
export NUGET_HTTP_CACHE_PATH="$evidence/http"
export DOTNET_CLI_TELEMETRY_OPTOUT=1

initial_entries="$(find "$evidence/home" "$evidence/packages" "$evidence/http" -mindepth 1 -print -quit | wc -l)"
[[ "$initial_entries" -eq 0 ]] || { echo "selected caches were not empty" >&2; exit 1; }

generation_mode=fresh-public-empty-cache
baseline_receipt=
if [[ -n "$baseline" ]]; then
  baseline="$(cd "$baseline" && pwd)"
  baseline_receipt="$baseline/qualification.json"
  jq -e --arg templateSha "$template_sha" --arg sddSha "$sdd_sha" --arg providerSha "$provider_sha" \
    '.result == "passed" and .mode == "scaffold-only" and .selectedCachesInitialEntries == 0 and
     .public.templates.sha256 == $templateSha and .public.sdd.sha256 == $sddSha and .public.provider.sha256 == $providerSha' \
    "$baseline_receipt" >/dev/null
  baseline_receiver="$(jq -r '.retainedReceiver' "$baseline_receipt")"
  [[ -d "$baseline_receiver/.git" ]] || { echo "verified baseline receiver is missing" >&2; exit 2; }
  mkdir "$evidence/receiver"
  tar -C "$baseline_receiver" -cf - . | tar -C "$evidence/receiver" -xf -
  cp "$baseline/scaffold-result.json" "$evidence/scaffold-result.json"
  generation_mode=verified-public-baseline-copy
else
  mkdir -p "$evidence/receiver/.fsgg"
  template="$evidence/feed/FS.GG.Workspace.Template.$template_version.nupkg"
  sdd_package="$evidence/feed/FS.GG.SDD.Cli.$sdd_version.nupkg"
  provider="$evidence/receiver/.fsgg/providers.yml"
  curl -fsSL --retry 6 "$public/fs.gg.workspace.template/$template_version/fs.gg.workspace.template.$template_version.nupkg" -o "$template"
  curl -fsSL --retry 6 "$public/fs.gg.sdd.cli/$sdd_version/fs.gg.sdd.cli.$sdd_version.nupkg" -o "$sdd_package"
  curl -fsSL --retry 6 \
    "https://raw.githubusercontent.com/FS-GG/FS.GG.Templates/fs-gg-templates/v$template_version/providers/fable-game.providers.yml" \
    -o "$provider"
  [[ "$(sha256sum "$template" | cut -d' ' -f1)" == "$template_sha" ]] || { echo "public Templates package drift" >&2; exit 1; }
  [[ "$(sha256sum "$sdd_package" | cut -d' ' -f1)" == "$sdd_sha" ]] || { echo "public SDD package drift" >&2; exit 1; }
  [[ "$(sha256sum "$provider" | cut -d' ' -f1)" == "$provider_sha" ]] || { echo "public provider drift" >&2; exit 1; }

  printf '%s\n' '<configuration><packageSources><clear/><add key="public" value="https://api.nuget.org/v3/index.json"/></packageSources></configuration>' \
    > "$evidence/NuGet.Config"
  dotnet tool install FS.GG.SDD.Cli --version "$sdd_version" --tool-path "$evidence/tools" \
    --configfile "$evidence/NuGet.Config" --no-cache > "$evidence/sdd-install.log"

  "$evidence/tools/fsgg-sdd" scaffold --root "$evidence/receiver" --provider fable-game \
    --no-update --json --param productName=BarcFableGame --param rootNamespace=BarcFableGame \
    > "$evidence/scaffold-result.json"
fi
jq -e '.outcome == "succeeded" and .scaffold.providerInvoked == true' "$evidence/scaffold-result.json" >/dev/null
printf '%s\n' '<configuration><packageSources><clear/><add key="public" value="https://api.nuget.org/v3/index.json"/></packageSources></configuration>' \
  > "$evidence/NuGet.Config"
jq -e '.generator.version == "2.0.3" and .providerName == "fable-game" and
  (.effectiveParameters | any(.key == "lifecycle" and .value == "typed-sdd"))' \
  "$evidence/receiver/.fsgg/scaffold-provenance.json" >/dev/null
(
  cd "$evidence/receiver"
  sha256sum --check "$repo_root/examples/barc-fable-game/public-scaffold.SHA256" \
    > "$evidence/public-scaffold-hashes.log"
)

bash "$repo_root/tests/Broker.Browser.Receiver.Tests/package-archive.test.sh" \
  > "$evidence/package-test.log"

if [[ "$scaffold_only" == false ]]; then
  archive_sha="$(sha256sum "$archive" | cut -d' ' -f1)"
  bash "$repo_root/tests/Broker.Browser.Receiver.Tests/adoption.test.sh" "$evidence/receiver" "$archive" \
    > "$evidence/adoption-test.log"
  "$repo_root/scripts/adopt-barc-preview.sh" "$archive" "$evidence/receiver" \
    > "$evidence/adoption.log"

  (
    cd "$evidence/receiver"
    dotnet restore BarcFableGame.slnx --locked-mode --configfile "$evidence/NuGet.Config"
    npm ci --prefix Client
    BARC_BASE_PATH=/barc/ npm run build --prefix Client
    dotnet build BarcFableGame.slnx --no-restore
    dotnet test BarcFableGame.slnx --no-restore --no-build
    dotnet publish Server/Server.fsproj --configuration Release --no-restore \
      --output "$evidence/publish"
  ) > "$evidence/build-and-test.log" 2>&1

  port="$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1",0)); print(s.getsockname()[1]); s.close()')"
  (cd "$evidence/publish" && exec dotnet Server.dll --urls "http://127.0.0.1:$port" --BasePath=/barc) \
    > "$evidence/server.log" 2>&1 &
  server_pid=$!
  stop_server() { kill "$server_pid" 2>/dev/null || true; wait "$server_pid" 2>/dev/null || true; }
  trap stop_server EXIT
  ready=false
  for _ in $(seq 1 100); do
    if curl -fsS "http://127.0.0.1:$port/barc/healthz" > "$evidence/health.json"; then
      ready=true
      break
    fi
    sleep 0.1
  done
  [[ "$ready" == true ]] || { echo "receiver production server did not become ready" >&2; exit 1; }
  curl -fsS "http://127.0.0.1:$port/barc/" > "$evidence/index.html"
  grep -F 'src="/barc/assets/' "$evidence/index.html" >/dev/null
  receiver_profile=barc-preview-v1
  asset_paths=(
    src/Broker.Browser.Client/dist/assets/barc-preview.js \
    src/Broker.Browser.Client/dist/assets/barc-preview.css \
    src/Broker.Browser.Wasm/guest-worker.js
  )
  live_pins="$evidence/receiver/Client/public/barc-preview/src/BARC-LIVE-PINS.json"
  if [[ -f "$live_pins" ]]; then
    receiver_profile="$(jq -r '.profile' "$live_pins")"
    manual_path="$(jq -r '.files[] | select(.role == "manualGuest") | .archivePath' "$live_pins")"
    custom_path="$(jq -r '.files[] | select(.role == "customGuest") | .archivePath' "$live_pins")"
    asset_paths+=("$manual_path" "$custom_path")
  else
    manual_path=guests/manual-preview.wasm
    custom_path=guests/custom-preview.wasm
    asset_paths+=("$manual_path" "$custom_path")
  fi
  for asset in "${asset_paths[@]}"; do
    served="$evidence/served-${asset//\//_}"
    curl -fsS "http://127.0.0.1:$port/barc/barc-preview/$asset" > "$served"
    cmp "$served" "$evidence/receiver/Client/public/barc-preview/$asset"
  done
  npm ci --ignore-scripts --prefix "$repo_root/tests/Broker.Browser.Receiver.Tests" \
    > "$evidence/receiver-browser-install.log"
  BARC_RECEIVER_URL="http://127.0.0.1:$port/barc/" \
  BARC_RECEIVER_ROOT="$evidence/receiver" \
  BARC_RECEIVER_PROFILE="$receiver_profile" \
    npm test --prefix "$repo_root/tests/Broker.Browser.Receiver.Tests" \
    > "$evidence/receiver-browser.log"
  stop_server
  trap - EXIT

  manifest="$evidence/receiver/Client/public/barc-preview/BARC-PREVIEW.SHA256"
  client_js_sha="$(awk '$2 == "src/Broker.Browser.Client/dist/assets/barc-preview.js" { print $1 }' "$manifest")"
  client_css_sha="$(awk '$2 == "src/Broker.Browser.Client/dist/assets/barc-preview.css" { print $1 }' "$manifest")"
  worker_sha="$(awk '$2 == "src/Broker.Browser.Wasm/guest-worker.js" { print $1 }' "$manifest")"
  manual_sha="$(awk -v path="$manual_path" '$2 == path { print $1 }' "$manifest")"
  custom_sha="$(awk -v path="$custom_path" '$2 == path { print $1 }' "$manifest")"
fi

jq -n \
  --arg mode "$(if [[ "$scaffold_only" == true ]]; then echo scaffold-only; else echo joined-archive; fi)" \
  --arg receiver "$evidence/receiver" \
  --arg templateSha "$template_sha" \
  --arg sddSha "$sdd_sha" \
  --arg providerSha "$provider_sha" \
  --arg generationMode "$generation_mode" \
  --arg baselineReceipt "$baseline_receipt" \
  --arg archiveSha "${archive_sha:-}" \
  --arg clientJsSha "${client_js_sha:-}" \
  --arg clientCssSha "${client_css_sha:-}" \
  --arg workerSha "${worker_sha:-}" \
  --arg manualSha "${manual_sha:-}" \
  --arg customSha "${custom_sha:-}" \
  --arg profile "${receiver_profile:-}" \
  '{schema:"fsbar.barc-receiver-qualification/v1",result:"passed",mode:$mode,
    retainedReceiver:$receiver,selectedCachesInitialEntries:0,
    generation:{mode:$generationMode,baselineReceipt:(if $baselineReceipt == "" then null else $baselineReceipt end)},
    public:{templates:{version:"0.15.0",sha256:$templateSha},sdd:{version:"2.0.3",sha256:$sddSha},provider:{sha256:$providerSha}},
    preAdoptionHashes:"public-scaffold.SHA256",
    consumed:(if $mode == "joined-archive" then {archiveSha256:$archiveSha,profile:$profile,assets:{clientJs:$clientJsSha,clientCss:$clientCssSha,worker:$workerSha,manualGuest:$manualSha,customGuest:$customSha}} else null end),
    finalJourney:(if $mode == "joined-archive" then "build-and-tests-passed; production assets and receiver arena-isolation browser passed at /barc/; actual companion journey evaluated separately" else "pending joined BARC-01.3c archive" end)}' \
  > "$evidence/qualification.json"

echo "$evidence/qualification.json"
