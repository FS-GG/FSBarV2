#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

bash "$repo_root/tests/Broker.Browser.Receiver.Tests/package-archive.test.sh"

receiver="$repo_root/examples/barc-fable-game"
jq -e '
  .receiver.templateIdentity == "fs-gg-fable-game" and
  .receiver.effectiveLifecycle == "typed-sdd" and
  .receiver.effectiveBundle == "player" and
  .canonicalPins.fableCompiler == "5.18.0" and
  .canonicalPins.fableCore == "5.3.0" and
  .canonicalPins.elmish == "5.0.2" and
  .canonicalPins.fableBrowserDom == "2.20.0" and
  .canonicalPins.vite == "7.3.6" and
  .barcAdoption.status == "awaiting-joined-barc-01.3c-archive"
' "$receiver/BARC_RECEIVER_PROVENANCE.json" >/dev/null

jq -e '
  .generator.id == "FS.GG.SDD.Artifacts" and
  .generator.version == "2.0.3" and
  .providerName == "fable-game" and
  (.effectiveParameters | any(.key == "lifecycle" and .value == "typed-sdd"))
' "$receiver/.fsgg/scaffold-provenance.json" >/dev/null

jq -e '.tools.fable.version == "5.18.0" and .tools["fs.gg.sdd.cli"].version == "2.0.3"' \
  "$receiver/.config/dotnet-tools.json" >/dev/null
grep -F '<PackageReference Include="Fable.Core" Version="[5.3.0]" />' "$receiver/Client/Client.fsproj" >/dev/null
grep -F '<PackageReference Include="Fable.Elmish" Version="[5.0.2]" />' "$receiver/Client/Client.fsproj" >/dev/null
grep -F '<PackageReference Include="Fable.Browser.Dom" Version="[2.20.0]" />' "$receiver/Client/Client.fsproj" >/dev/null
jq -e '.devDependencies.vite == "7.3.6"' "$receiver/Client/package.json" >/dev/null

echo "receiver scaffold/provenance qualification: passed"
echo "receiver BAR journey qualification: pending joined BARC-01.3c archive"
