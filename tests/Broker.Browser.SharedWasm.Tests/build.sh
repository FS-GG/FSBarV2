#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "$here/../.." && pwd)"
project="$root/src/Broker.Browser.SharedWasm"
export NUGET_PACKAGES="$here/.nuget"
export NUGET_HTTP_CACHE_PATH="$here/.nuget-http"
app="$here/public/sub/app"
deploy=
if [[ $# -gt 0 ]]; then
  [[ $# -eq 2 && "$1" == --deploy ]] || { echo "usage: $0 [--deploy <adapter-assets-directory>]" >&2; exit 64; }
  deploy="$(realpath -e "$2")"
  [[ "$deploy" == "$project" ]] || { echo "deployment must be the joined SharedWasm source directory" >&2; exit 2; }
fi
# Regenerate both trees together; stale package assets must not survive a build.
rm -rf -- "$app/src/Broker.Browser.SharedWasm/fable" "$app/src/Broker.Browser.SharedWasm/_content" "$app/_content"
dotnet restore "$project/Broker.Browser.SharedWasm.fsproj" --configfile "$project/NuGet.Config" --locked-mode --disable-parallel
dotnet build "$project/Broker.Browser.SharedWasm.fsproj" --no-restore -m:1 -nr:false -p:UseSharedCompilation=false
(cd "$project"; dotnet tool restore --configfile NuGet.Config; dotnet fable Broker.Browser.SharedWasm.fsproj --noRestore --outDir "$app/src/Broker.Browser.SharedWasm/fable")
mkdir -p "$app/src/Broker.Browser.Wasm" "$app/src/Broker.Browser.SharedWasm"
cp "$project/index.js" "$app/src/Broker.Browser.SharedWasm/"
cp -r "$app/_content" "$app/src/Broker.Browser.SharedWasm/"
test -f "$app/src/Broker.Browser.SharedWasm/_content/FS.GG.Wasm.Browser/policy/Host.js"
cp "$root/src/Broker.Browser.Wasm/barc-wire.js" "$app/src/Broker.Browser.Wasm/"
cp "$here/harness.html" "$app/"

mkdir -p "$here/.codec"
cp "$root/src/Broker.Browser.Contracts/generated/"*.js "$here/.codec/"

if [[ -n "$deploy" ]]; then
  rm -rf -- "$deploy/fable" "$deploy/_content"
  cp -r "$app/src/Broker.Browser.SharedWasm/fable" "$deploy/fable"
  cp -r "$app/src/Broker.Browser.SharedWasm/_content" "$deploy/_content"
  python3 "$root/scripts/check-barc-shared-closure.py" "$root"
fi
