#!/usr/bin/env bash
set -euo pipefail
ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
export DOTNET_PROCESSOR_COUNT="${DOTNET_PROCESSOR_COUNT:-4}"
test "$(quint --version)" = "0.32.0"
quint typecheck "$ROOT/GrowingLogEvidence.qnt"
quint typecheck "$ROOT/GrowingLogEvidence_test.qnt"
quint test "$ROOT/GrowingLogEvidence_test.qnt" --main GrowingLogEvidence_test --match '^(healthyBoundaries|rewriteIsSticky|unavailableCannotGrant|unavailableAfterValidationRevokesCurrentAuthority|unavailableAfterConsumptionPreservesHistoryOnly|staleBoundaryCannotConsume|pendingTailHasNoAuthority|closeRevokesCurrentAuthority|truncateIsSticky|replacementIsSticky|wrongWriterIsSticky|wrongGenerationIsSticky|wrongSourceIsSticky|contradictorySuffixIsSticky)$' --seed 424242 --max-samples 1
quint run "$ROOT/GrowingLogEvidence.qnt" --seed 424242 --max-samples 500 --max-steps 16 --invariant invariant --verbosity 1
TMP=$(mktemp -d)
trap 'python3 - "$TMP" <<'"'"'PY'"'"'
import pathlib,shutil,sys
p=pathlib.Path(sys.argv[1])
if p.exists():shutil.rmtree(p)
PY
' EXIT
while IFS='|' read -r scenario fixture; do
  quint test "$ROOT/GrowingLogEvidence_test.qnt" --main GrowingLogEvidence_test \
    --match "^${scenario}$" --out-itf "$TMP/trace_{test}_{seq}.itf.json" \
    --seed 424242 --max-samples 1
  python3 - "$TMP/trace_${scenario}_0.itf.json" "$ROOT/$fixture" <<'PY'
import json,pathlib,sys
value=json.loads(pathlib.Path(sys.argv[1]).read_text())
value['#meta'].pop('description',None);value['#meta'].pop('timestamp',None);value['#meta']['source']='GrowingLogEvidence_test.qnt'
actual=json.dumps(value,separators=(',',':'),sort_keys=True)+'\n'
expected=pathlib.Path(sys.argv[2]).read_text()
if actual != expected:raise SystemExit('normalized Quint trace drift')
PY
done <<'EOF'
healthyBoundaries|GrowingLogEvidence.healthy.itf.json
unavailableAfterValidationRevokesCurrentAuthority|GrowingLogEvidence.unavailableAfterValidationRevokesCurrentAuthority.itf.json
unavailableAfterConsumptionPreservesHistoryOnly|GrowingLogEvidence.unavailableAfterConsumptionPreservesHistoryOnly.itf.json
pendingTailHasNoAuthority|GrowingLogEvidence.pendingTailHasNoAuthority.itf.json
staleBoundaryCannotConsume|GrowingLogEvidence.staleBoundaryCannotConsume.itf.json
closeRevokesCurrentAuthority|GrowingLogEvidence.closeRevokesCurrentAuthority.itf.json
EOF
dotnet restore "$ROOT/RuntimeEvidence.Tests.fsproj" --locked-mode
dotnet build "$ROOT/RuntimeEvidence.Tests.fsproj" -c Release --no-restore -m:4
dotnet run --project "$ROOT/RuntimeEvidence.Tests.fsproj" -c Release --no-build

POLICY_OUTPUT="$ROOT/bin/RuntimeEvidence/Release/net10.0"
for artifact in RuntimeEvidence RuntimeEvidence.dll RuntimeEvidence.deps.json RuntimeEvidence.runtimeconfig.json FSharp.Core.dll; do
  test -f "$POLICY_OUTPUT/$artifact" || {
    echo "missing runtime evidence policy artifact: $POLICY_OUTPUT/$artifact" >&2
    exit 1
  }
done
test -x "$POLICY_OUTPUT/RuntimeEvidence" || {
  echo "runtime evidence apphost is not executable" >&2
  exit 1
}
sha256sum \
  "$POLICY_OUTPUT/RuntimeEvidence" \
  "$POLICY_OUTPUT/RuntimeEvidence.dll" \
  "$POLICY_OUTPUT/RuntimeEvidence.deps.json" \
  "$POLICY_OUTPUT/RuntimeEvidence.runtimeconfig.json" \
  "$POLICY_OUTPUT/FSharp.Core.dll"
