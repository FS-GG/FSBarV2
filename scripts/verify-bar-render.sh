#!/usr/bin/env bash
# GAME-RENDER-ADOPT-01.8: the gates for the BAR renderer-selection client. The hosted workflow runs exactly this.
#   --no-browser   skip the Chromium journeys (they need `npx playwright install chromium` and its system libraries)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TESTS="$ROOT/tests/Broker.Browser.Render.Tests"
EXPECTED_CHECKS=76
BROWSER=1
[[ "${1:-}" == "--no-browser" ]] && BROWSER=0

cd "$ROOT"
python3 scripts/check-game-render-pin.py
dotnet tool restore
dotnet restore src/Broker.Browser.Render.Host/Broker.Browser.Render.Host.fsproj
dotnet restore tests/Broker.Browser.Render.Tests/Broker.Browser.Render.Tests.fsproj

cd "$TESTS"
npm ci --ignore-scripts
npm run test:dotnet
npm run test:fable
# One check list, two runtimes: the .NET and the emitted-Fable/Node output must be identical.
cmp output-dotnet.txt output-node.txt
# Pin the exact count so a silently skipped check fails the gate.
grep -qx "bar-render checks=$EXPECTED_CHECKS" output-dotnet.txt || { echo "expected bar-render checks=$EXPECTED_CHECKS" >&2; exit 1; }

if [[ "$BROWSER" == 1 ]]; then
  npm run test:browser
else
  npm run compile-host
fi
echo "GAME-RENDER-ADOPT-01.8: BAR renderer selection verified"
