#!/usr/bin/env bash
set -euo pipefail
ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
export DOTNET_PROCESSOR_COUNT="${DOTNET_PROCESSOR_COUNT:-1}"
test "$(dotnet --version)" = "10.0.401"
test "$(quint --version)" = "0.32.0"
quint typecheck "$ROOT/GrowingLogEvidence.qnt"
quint typecheck "$ROOT/GrowingLogEvidence_test.qnt"
TMP=$(mktemp -d)
trap 'python3 - "$TMP" <<'"'"'PY'"'"'
import pathlib,shutil,sys
p=pathlib.Path(sys.argv[1])
if p.exists():shutil.rmtree(p)
PY
' EXIT
if [[ -z "${BAR_GROWING_LOG_HELPER:-}" ]]; then
  BAR_GROWING_LOG_HELPER="$TMP/complete-record-helper"
  mkdir -p "$BAR_GROWING_LOG_HELPER"
  cp "$ROOT/fixtures/complete-record-helper/"*.py "$BAR_GROWING_LOG_HELPER/"
  python3 - "$BAR_GROWING_LOG_HELPER" "$ROOT/../../.." <<'PY'
import hashlib,json,pathlib,subprocess,sys
helper=pathlib.Path(sys.argv[1]);source=pathlib.Path(sys.argv[2])
head=subprocess.check_output(['git','-C',source,'rev-parse','HEAD'],text=True).strip()
tree=subprocess.check_output(['git','-C',source,'rev-parse','HEAD^{tree}'],text=True).strip()
base=subprocess.check_output(['git','-C',source,'rev-parse','HEAD^'],text=True).strip()
files=[]
for path in sorted(helper.glob('*.py')):
    raw=path.read_bytes();files.append({'bytes':len(raw),'path':path.name,'sha256':hashlib.sha256(raw).hexdigest()})
manifest={'schema':'fsgg.private.barc-selected-framework-census-work-bound-helper-source/v4','configuredPacketIncluded':False,'nativeEffectPerformed':False,'publicBase':base,'publicHead':head,'publicTree':tree,'files':files}
(helper/'source-manifest.json').write_text(json.dumps(manifest,separators=(',',':'),sort_keys=True))
PY
fi
export BAR_GROWING_LOG_HELPER
dotnet restore "$ROOT/RuntimeEvidence.Tests.fsproj" --locked-mode
dotnet build "$ROOT/RuntimeEvidence.Tests.fsproj" -c Release --no-restore -m:1
test -f "$BAR_GROWING_LOG_HELPER/growing_log.py"
(cd "$BAR_GROWING_LOG_HELPER" && \
  BAR_RUNTIME_EVIDENCE_BUILD="$ROOT/bin/RuntimeEvidence/Release/net10.0" \
  BAR_RUNTIME_EVIDENCE_SOURCE="$(cd "$ROOT/../../.." && pwd)" \
  python3 -m unittest -v test_growing_log.GrowingLogTests.test_staged_runtime_policy_readiness_preflight)
(cd "$BAR_GROWING_LOG_HELPER" && python3 -m unittest -v test_buffered_writer)
(cd "$BAR_GROWING_LOG_HELPER" && \
  BAR_RUNTIME_EVIDENCE_BUILD="$ROOT/bin/RuntimeEvidence/Release/net10.0" \
  BAR_RUNTIME_EVIDENCE_SOURCE="$(cd "$ROOT/../../.." && pwd)" \
  python3 -m unittest -v \
    test_growing_log.GrowingLogTests.test_three_accepted_growth_samples_report_mechanical_exhaustion \
    test_growing_log.GrowingLogTests.test_full_buffered_writer_growth_after_real_policy_exhausts_three_evaluations)
quint test "$ROOT/GrowingLogEvidence_test.qnt" --backend=typescript --main GrowingLogEvidence_test --match '^(healthyBoundaries|rewriteIsSticky|unavailableCannotGrant|unavailableAfterValidationRevokesCurrentAuthority|unavailableAfterConsumptionPreservesHistoryOnly|staleBoundaryCannotConsume|pendingTailHasNoAuthority|closeRevokesCurrentAuthority|truncateIsSticky|replacementIsSticky|wrongWriterIsSticky|wrongGenerationIsSticky|wrongSourceIsSticky|contradictorySuffixIsSticky|policyInvocationCompletesSameClosure|policyClosureDriftIsSticky|completeRecordWaitThenConsume|completeRecordWaitExhausted|zeroBudgetCannotProbe|completeRecordWaitDeadline|waitAfterConsumptionHasNoNewAuthority|pendingThenCompleteResample|sharedBudgetAcrossEvaluations|lastProbeCandidateThenExhausted|candidateCannotRenewBudget|terminalSettlementCannotConsume|retriesShareOneProbeBudget|rp2SafeTailConsumesExactHorizon|rp2PostLAppendRemainsUnvalidated|rp2NextBoundaryCannotReusePriorConsumption|rp2ObservedGrowthRequiresReevaluation|rp2PolicyAppendRequiresReevaluation|rp2RelevantTailCannotValidate|rp2PartialUtf8CannotValidate|rp2NoRecordsCannotValidate|rp2InventedLAndLateReleaseCannotConsume|rp2StaleBoundaryCannotConsume|rp2OneConsumptionPerCandidate)$' --seed 424242 --max-samples 1
quint run "$ROOT/GrowingLogEvidence.qnt" --backend=typescript --seed 424242 --max-samples 500 --max-steps 16 --invariant invariant --verbosity 1
while IFS='|' read -r scenario fixture; do
  quint test "$ROOT/GrowingLogEvidence_test.qnt" --backend=typescript --main GrowingLogEvidence_test \
    --match "^${scenario}$" --out-itf "$TMP/trace_{test}_{seq}.itf.json" \
    --seed 424242 --max-samples 1
  python3 - "$TMP/trace_${scenario}_0.itf.json" "$ROOT/$fixture" <<'PY'
import json,pathlib,sys
value=json.loads(pathlib.Path(sys.argv[1]).read_text())
value['#meta'].pop('description',None);value['#meta'].pop('timestamp',None);value['#meta']['source']='GrowingLogEvidence_test.qnt'
value['#meta']['status']='ok'
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
policyClosureDriftIsSticky|GrowingLogEvidence.policyClosureDriftIsSticky.itf.json
completeRecordWaitThenConsume|GrowingLogEvidence.completeRecordWaitThenConsume.itf.json
completeRecordWaitExhausted|GrowingLogEvidence.completeRecordWaitExhausted.itf.json
completeRecordWaitDeadline|GrowingLogEvidence.completeRecordWaitDeadline.itf.json
waitAfterConsumptionHasNoNewAuthority|GrowingLogEvidence.waitAfterConsumptionHasNoNewAuthority.itf.json
pendingThenCompleteResample|GrowingLogEvidence.pendingThenCompleteResample.itf.json
sharedBudgetAcrossEvaluations|GrowingLogEvidence.sharedBudgetAcrossEvaluations.itf.json
lastProbeCandidateThenExhausted|GrowingLogEvidence.lastProbeCandidateThenExhausted.itf.json
EOF
TRANSCRIPT="$TMP/complete-record-correspondence.json"
(cd "$BAR_GROWING_LOG_HELPER" && \
  BAR_RUNTIME_EVIDENCE_BUILD="$ROOT/bin/RuntimeEvidence/Release/net10.0" \
  BAR_RUNTIME_EVIDENCE_SOURCE="$(cd "$ROOT/../../.." && pwd)" \
  BAR_SETTLEMENT_TRANSCRIPT="$TRANSCRIPT" \
  python3 -m unittest -v test_growing_log.GrowingLogTests.test_required_complete_record_correspondence_bundle)
BAR_GROWING_LOG_HELPER="$BAR_GROWING_LOG_HELPER" BAR_SETTLEMENT_TRANSCRIPT="$TRANSCRIPT" dotnet run --project "$ROOT/RuntimeEvidence.Tests.fsproj" -c Release --no-build
python3 - "$TRANSCRIPT" "$TMP" <<'PY'
import copy,json,pathlib,sys
value=json.loads(pathlib.Path(sys.argv[1]).read_text());root=pathlib.Path(sys.argv[2])
def rows(v,name):return next(row for row in v['scenarios'] if row['name']==name)['timeline']
def item(v,name,kind):return next(row for row in rows(v,name) if row['kind']==kind)
for name in ['dropped-policy','duplicate-policy','reordered-policy','wrong-raw-hash','wrong-prefix-hash','wrong-tail-hash','invented-L','stale-terminal','budget-renewal','reordered-final','duplicate-consume','missing-growth','wrong-status']:
    v=copy.deepcopy(value);safe=rows(v,'rp2SafeTailConsume')
    if name=='dropped-policy':safe.remove(item(v,'rp2SafeTailConsume','policy'))
    elif name=='duplicate-policy':safe.insert(2,copy.deepcopy(item(v,'rp2SafeTailConsume','policy')))
    elif name=='reordered-policy':
        r=rows(v,'rp2SafeTailExtend');policies=[x for x in r if x['kind']=='policy'];r.remove(policies[1]);r.insert(r.index(policies[0])+1,policies[1])
    elif name=='wrong-raw-hash':item(v,'rp2SafeTailConsume','policy')['observation']['sha256']='0'*64
    elif name=='wrong-prefix-hash':item(v,'rp2SafeTailConsume','policy')['prefix']['completeSha256']='0'*64
    elif name=='wrong-tail-hash':item(v,'rp2SafeTailConsume','policy')['prefix']['tailSha256']='0'*64
    elif name=='invented-L':
        item(v,'rp2SafeTailConsume','final-observation')['linearizedMicroseconds']=0
        item(v,'rp2SafeTailConsume','consume')['observation']['linearizedMicroseconds']=0
        item(v,'rp2SafeTailConsume','consume')['afterState']['consumption']['linearizedMicroseconds']=0
    elif name=='stale-terminal':item(v,'rp2SafeTailConsume','terminal')['state']['consumedRevision']=0
    elif name=='budget-renewal':
        p=[x for x in rows(v,'rp2ContradictionDuringPolicy') if x['kind']=='policy'][1];p['observation']['deadlineMicroseconds']-=1
    elif name=='reordered-final':
        final=item(v,'rp2SafeTailConsume','final-observation');safe.remove(final);safe.insert(1,final)
    elif name=='duplicate-consume':safe.insert(len(safe)-1,copy.deepcopy(item(v,'rp2SafeTailConsume','consume')))
    elif name=='missing-growth':
        r=rows(v,'rp2ContradictionDuringPolicy');r.remove(next(x for x in r if x['kind']=='growth'))
    elif name=='wrong-status':item(v,'rp2SafeTailConsume','policy')['status']='pending'
    (root/f'{name}.json').write_text(json.dumps(v,separators=(',',':'),sort_keys=True)+'\n')
PY
for mutation in dropped-policy duplicate-policy reordered-policy wrong-raw-hash wrong-prefix-hash wrong-tail-hash invented-L stale-terminal budget-renewal reordered-final duplicate-consume missing-growth wrong-status; do
  if BAR_GROWING_LOG_HELPER="$BAR_GROWING_LOG_HELPER" BAR_SETTLEMENT_TRANSCRIPT="$TMP/$mutation.json" dotnet "$ROOT/bin/RuntimeEvidence.Tests/Release/net10.0/RuntimeEvidence.Tests.dll" >/dev/null 2>&1; then
    echo "RP2 semantic mutation accepted: $mutation" >&2
    exit 1
  fi
done

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
