#!/usr/bin/env bash
set -euo pipefail
ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
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
quint test "$ROOT/GrowingLogEvidence_test.qnt" --main GrowingLogEvidence_test --match '^healthyBoundaries$' --out-itf "$TMP/trace_{test}_{seq}.itf.json" --seed 424242 --max-samples 1
python3 - "$TMP/trace_healthyBoundaries_0.itf.json" "$ROOT/GrowingLogEvidence.healthy.itf.json" <<'PY'
import json,pathlib,sys
value=json.loads(pathlib.Path(sys.argv[1]).read_text())
value['#meta'].pop('description',None);value['#meta'].pop('timestamp',None);value['#meta']['source']='GrowingLogEvidence_test.qnt'
actual=json.dumps(value,separators=(',',':'),sort_keys=True)+'\n'
expected=pathlib.Path(sys.argv[2]).read_text()
if actual != expected:raise SystemExit('normalized Quint trace drift')
PY
dotnet restore "$ROOT/RuntimeEvidence.Tests.fsproj" --locked-mode
dotnet build "$ROOT/RuntimeEvidence.Tests.fsproj" -c Release --no-restore -m:4
dotnet run --project "$ROOT/RuntimeEvidence.Tests.fsproj" -c Release --no-build
