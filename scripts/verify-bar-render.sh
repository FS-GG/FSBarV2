#!/usr/bin/env bash
# GAME-RENDER-ADOPT-01.8: the gates for the BAR renderer-selection client. The hosted workflow runs exactly this.
#   --no-browser   skip the Chromium journeys (they need `npx playwright install chromium` and its system libraries)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TESTS="$ROOT/tests/Broker.Browser.Render.Tests"
EXPECTED_CHECKS=104
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
# One check list, two runtimes: the output of both (the decoded-value digest and the check count) must be identical.
cmp output-dotnet.txt output-node.txt
# Pin the exact count so a silently skipped check fails the gate.
grep -qx "bar-render checks=$EXPECTED_CHECKS" output-dotnet.txt && grep -qx "bar-render checks=$EXPECTED_CHECKS" output-node.txt || { echo "expected bar-render checks=$EXPECTED_CHECKS from both runtimes" >&2; exit 1; }
grep -Eq "^bar-render digest=[0-9a-f]{16} over=[0-9]+$" output-dotnet.txt || { echo "missing the bar-render digest line" >&2; exit 1; }

if [[ "$BROWSER" == 1 ]]; then
  npm run test:browser
else
  npm run compile-host
fi
echo "GAME-RENDER-ADOPT-01.8: BAR renderer selection verified"
