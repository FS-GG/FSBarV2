#!/usr/bin/env bash
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "$here/../.." && pwd)"
project="$root/src/Broker.Browser.SharedWasm"
export NUGET_PACKAGES="$here/.nuget"
export NUGET_HTTP_CACHE_PATH="$here/.nuget-http"
app="$here/public/sub/app"
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
