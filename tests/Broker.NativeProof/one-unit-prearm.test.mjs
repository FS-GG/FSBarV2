// Controlled source checks only. No native handoff, browser, Arm or production effect.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
const source=readFileSync(new URL("./tactical-native-journey.spec.js",import.meta.url),"utf8");
const start=source.indexOf("// ONE_UNIT_SOURCE_BEGIN"),end=source.indexOf("if(oneUnitEnabled)oneUnitHandoff=",start);
assert.ok(start>=0&&end>start);
const context=vm.createContext({Buffer,Set,BigInt,Number,Object,JSON,Error,Array,String,
  key:r=>`${r.id}:${r.lifetime}`,sameRef:(a,b)=>a?.id===b?.id&&a?.lifetime===b?.lifetime,
  queue:(o,f)=>o?.productionQueue});
vm.runInContext(source.slice(start,end).replace("export function assertOneProducedUnit","function assertOneProducedUnit")+"\n globalThis.api={validateOneQualification,assertOnePreArm,assertOneProducedUnit};",context);
const {api}=context;
function fixture(){
  const factory={id:"10",lifetime:"5"},seed={id:"11",lifetime:"6"},writer={pid:99,startTicks:"123",uid:1000},source={fsbarCommit:"a".repeat(40),highbarCommit:"b".repeat(40)};
  const h={runId:"controlled",source,actors:{factory},setup:{seedDefinitionId:2,productDefinitionId:3},paths:{nativeEvents:"/controlled/raw",stockTrace:"/controlled/stock"},attribution:{writer,acceptedGeneration:"G",processIncarnation:"P",stateChannelIncarnation:"C"}};
  const pin=path=>({path,sha256:"c".repeat(64),bytes:1,device:1,inode:1,uid:1000,mode:0o600,nlink:1});
  const q={schema:"bar.one-unit-attribution-source-qualification/v1",actualPassed:true,noAutonomousOrders:true,runId:h.runId,source,writer,acceptedGeneration:"G",processIncarnation:"P",stateChannelIncarnation:"C",matchIncarnation:"M",noAutonomousConfigurationEvidenceSha256:"c".repeat(64),seedEvidence:{factory,seedDefinitionId:2,productDefinitionId:3,seedCount:1,initialRawSequence:"1",nonemptyStockSequence:"1",terminalRawSequence:"4",terminalStateSequence:"8",terminalNativeFrame:40,emptyStockSequence:"2",products:[{reference:seed,createdSequence:"2",finishedSequence:"3"}]},inputCustody:{raw:pin("/controlled/raw"),host:pin("/controlled/host"),stock:pin("/controlled/stock"),metadata:pin("/controlled/metadata"),setup:pin("/controlled/setup"),configuration:pin("/controlled/config")},liveProcesses:[{...writer,role:"host"}],completeRecordEvidence:pin("/controlled/policy"),lifecycle:{startedMonotonicNs:"1",transitionDeadlineMonotonicNs:"1000000000",totalDeadlineMonotonicNs:"2000000000"}};
  const before={basis:{processIncarnation:"P",stateChannelIncarnation:"C",matchId:"M",stateSequence:"10",nativeFrame:50},units:[{reference:factory,definitionId:1},{reference:seed,definitionId:2}],productionQueue:{complete:true,repeat:false,entries:[]}};
  const native=[{kind:"baseline",stateSequence:"10",value:{units:[{unitId:10,underConstruction:false,buildProgress:1},{unitId:11,underConstruction:false,buildProgress:1}]}}];
  return {h,q,before,native,rows:[]};
}
test("retained earlier nonempty history permits a fresh current empty baseline",()=>{
  const f=fixture();assert.equal(api.assertOnePreArm(f.h,f.q,f.rows,f.before,f.native),f.before);
});
test("qualification tampering and foreign owning identity refuse before Arm",()=>{
  const changes=[f=>f.q.actualPassed=false,f=>f.q.noAutonomousOrders=false,f=>f.q.runId="foreign",f=>f.q.acceptedGeneration="foreign",f=>f.q.stateChannelIncarnation="foreign",f=>f.q.source={...f.q.source,fsbarCommit:"d".repeat(40)},f=>f.q.seedEvidence.finishedSequence="0",f=>f.q.seedEvidence.products[0].finishedSequence="2",f=>f.q.seedEvidence.seedCount=2,f=>f.q.seedEvidence.emptyStockSequence="1",f=>f.q.inputCustody.raw.path="/other",f=>f.q.liveProcesses[0].startTicks="999",f=>f.q.extra=true];
  for(const change of changes){const f=fixture();change(f);let armCount=0;assert.throws(()=>{api.assertOnePreArm(f.h,f.q,f.rows,f.before,f.native);armCount++},/one-unit refused/);assert.equal(armCount,0)}
});
test("current stale/nonempty/unfinished baseline and later dispatch refuse",()=>{
  const changes=[f=>f.before.basis.stateSequence="6",f=>f.before.basis.stateChannelIncarnation="other",f=>f.before.productionQueue.entries=[{definitionId:2}],f=>f.before.productionQueue.repeat=true,f=>f.before.productionQueue.complete=false,f=>f.native[0].value.units[1].underConstruction=true,f=>f.before.units.pop(),f=>f.rows.push({kind:"submit"}),f=>f.native.push({kind:"command-dispatch"}),f=>f.native.push({kind:"unit-created"}),f=>f.native.push({kind:"unit-finished"}),f=>f.native.push({kind:"snapshot",disposition:"gap"}),f=>f.native[0].stateSequence="9"];
  for(const change of changes){const f=fixture();change(f);assert.throws(()=>api.assertOnePreArm(f.h,f.q,f.rows,f.before,f.native),/one-unit refused/)}
});
test("production source checks late extra creation and dispatch before freezing baseline",()=>{
  assert.match(source,/production or gap after seed qualification before baseline/);
  assert.match(source,/\["unit-created","unit-finished","command-dispatch"\]\.includes\(r.kind\)/);
  assert.match(source,/assertOnePreArm\(h,qualified,rows,before,nativeOneEvents/);
  assert.ok(source.indexOf("recheckOneQualification(h);return h")>0);
});
test("single-submit assertion rejects a retry before lifecycle evaluation",()=>{
  assert.throws(()=>api.assertOneProducedUnit([{kind:"submit",value:{}},{kind:"submit",value:{}}],{},[],{}),/exactly one submission required, no retry/);
});

test("handoff qualification initializes after lexical validators and before registration",()=>{
  assert.ok(source.indexOf("let oneUnitHandoff=null")<start);
  assert.ok(source.indexOf("const qualificationOneKeys")<end);
  assert.ok(end<source.indexOf("test.describe(oneUnitCase",end));
});
