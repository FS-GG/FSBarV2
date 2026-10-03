import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile, mkdtemp, rm, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { basename, resolve } from "node:path";
import { tmpdir } from "node:os";
import vm from "node:vm";

const spec=await readFile(new URL("./tactical-native-journey.spec.js",import.meta.url),"utf8");
const readiness=spec.slice(spec.indexOf("const readinessState="),spec.indexOf("// End readiness source block."));
const client=await readFile(new URL("../../src/Broker.Browser.Client/live-runtime.js",import.meta.url),"utf8");
const guestSource=client.slice(client.indexOf("  async function initializeGuest()"),client.indexOf("\n\n  function handleEnvelope"));
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve}};
const turn=()=>new Promise(resolve=>setImmediate(resolve));
const bytes=Uint8Array.from([0,97,115,109,1,0,0,0]);
const hash=createHash("sha256").update(bytes).digest("hex");
function functions(expect){return vm.runInNewContext(`${readiness};({readinessState,loadSelectedGuest,writeArmFailure,safeArmText})`,{expect,createHash,readFile,writeFile,basename,URL});}
function harness({ok=true,pin=hash}={}){
  const fetchGate=deferred(),bodyGate=deferred(),published=deferred();let moduleText="No guest loaded — not armed",workerLoads=0,clicks=0;const reasons=[];
  const guest=vm.runInNewContext(`let moduleBytes=null,moduleName="No guest loaded",moduleIdentity=null,bootstrap={},observation={preview:{validity:{status:"VALIDITY_STATUS_CURRENT"}}},lifecycleEpoch=0,connectionGeneration=0,controllerStage="CONTROLLER_STAGE_UNSPECIFIED";
  ${guestSource};({loadBundled,initializeGuest})`,{URL,Uint8Array,MAX_MODULE:8*1024*1024,assetBase:new URL("https://example.invalid/"),fetch:()=>fetchGate.promise,revoke:reason=>reasons.push(reason),notify:()=>{},render:()=>{moduleText="manual-preview.wasm — not armed";published.resolve()},queue:{reset:()=>{}},supervisor:{load:async()=>{workerLoads++;return{state:"refused",phase:"load",reason:"controlled stop"}}}});
  const expect=value=>({toBe:expected=>assert.equal(value,expected),toHaveText:async expected=>{if(moduleText!==expected)await published.promise;assert.equal(moduleText,expected)}});
  const api=functions(expect),state=api.readinessState();
  const response={url:()=>"https://example.invalid/guests/manual-preview.wasm",ok:()=>ok,body:()=>bodyGate.promise,arrayBuffer:async()=>{const b=await bodyGate.promise;return b.buffer}};
  const page={waitForResponse:async predicate=>{await fetchGate.promise;assert.equal(predicate(response),true);return response}};
  const live={getByRole:()=>({click:async()=>{clicks++;void guest.loadBundled("manual")}}),locator:()=>({})};
  return{api,state,guest,fetchGate,bodyGate,published,response,page,live,j:{bundledGuestSha256:pin},workerLoads:()=>workerLoads,clicks:()=>clicks,reasons};
}
for(const phase of ["fetch","body"]){
  test(`actual selected-module wait prevents early arm during deferred ${phase}`,async()=>{
    const h=harness();const pending=h.api.loadSelectedGuest(h.page,h.live,h.j,"Manual guest",h.state);
    if(phase==="body")h.fetchGate.resolve(h.response);
    await turn();assert.equal(h.state.phase,"module-requested");assert.equal(h.workerLoads(),0);
    // Mutating away the readiness wait reproduces the original source refusal.
    await h.guest.initializeGuest();assert.equal(h.reasons[0],"A current live observation and loaded guest are required.");assert.equal(h.workerLoads(),0);
    h.fetchGate.resolve(h.response);h.bodyGate.resolve(bytes);await pending;
    assert.equal(h.state.phase,"module-ready");assert.equal(h.state.moduleSha256,hash);assert.equal(h.state.moduleName,"manual-preview.wasm");
    await h.guest.initializeGuest();assert.equal(h.workerLoads(),1);assert.equal(h.reasons.at(-1),"Module refused during load: controlled stop");
  });
}
test("unavailable bundled download refuses before arm",async()=>{
  const h=harness({ok:false});const pending=h.api.loadSelectedGuest(h.page,h.live,h.j,"Manual guest",h.state);h.fetchGate.resolve(h.response);
  await assert.rejects(pending,/download unavailable/);assert.equal(h.state.phase,"module-requested");assert.equal(h.workerLoads(),0);assert.equal(h.state.failureCode,"module-download-unavailable");
});
test("served bundled hash mismatch refuses before arm",async()=>{
  const h=harness({pin:"0".repeat(64)});const pending=h.api.loadSelectedGuest(h.page,h.live,h.j,"Manual guest",h.state);h.fetchGate.resolve(h.response);h.bodyGate.resolve(bytes);
  await assert.rejects(pending);assert.equal(h.state.phase,"module-requested");assert.equal(h.workerLoads(),0);
});
test("import hash mismatch refuses before upload or arm",async()=>{
  const dir=await mkdtemp(resolve(tmpdir(),"bar-import-mismatch-"));try{
    const path=resolve(dir,"policy.wasm");await writeFile(path,bytes);let clicks=0;
    const api=functions(value=>({toBe:expected=>assert.equal(value,expected)}));const state=api.readinessState();
    await assert.rejects(api.loadSelectedGuest({}, {getByRole:()=>({click:()=>{clicks++}})}, {guestPath:path,guestSha256:"0".repeat(64)},"Imported guest",state));assert.equal(clicks,0);assert.equal(state.phase,"module-requested");assert.equal(state.failureCode,"import-hash-mismatch");
  }finally{await rm(dir,{recursive:true,force:true})}
});
test("valid imported hash still waits for exact UI publication",async()=>{
  const dir=await mkdtemp(resolve(tmpdir(),"bar-import-ready-"));try{
    const path=resolve(dir,"independent-policy.wasm");await writeFile(path,bytes);const publish=deferred(),uploaded=deferred();let text="old.wasm — not armed",uploads=0;
    const api=functions(value=>({toBe:expected=>assert.equal(value,expected),toHaveText:async expected=>{await publish.promise;assert.equal(text,expected)}}));const state=api.readinessState();
    const live={getByRole:()=>({click:async()=>{}}),locator:selector=>selector==="[data-file]"?{setInputFiles:async p=>{assert.equal(p,path);uploads++;uploaded.resolve()}}:{}};
    const pending=api.loadSelectedGuest({},live,{guestPath:path,guestSha256:hash},"Imported guest",state);await uploaded.promise;assert.equal(state.phase,"module-requested");assert.equal(uploads,1);
    text="independent-policy.wasm — not armed";publish.resolve();await pending;assert.equal(state.phase,"module-ready");assert.equal(state.moduleSha256,hash);
  }finally{await rm(dir,{recursive:true,force:true})}
});
test("failure artifact is bounded, private, exclusive and excludes pairing/envelope data",async()=>{
  const dir=await mkdtemp(resolve(tmpdir(),"bar-arm-diagnostic-"));try{
    const api=functions(()=>{}),path=resolve(dir,"capture.arm-failure.json"),credential="secret-pairing",session="session-private",gateway="ws://127.0.0.1:3900/live";
    const live={locator:()=>({textContent:async()=>`${credential} ${session} ${gateway} ${"x".repeat(5000)}`})};const state=api.readinessState();state.phase="module-requested";
    await api.writeArmFailure(live,{armFailurePath:path,credential,expectedSessionId:session,gatewayUrl:gateway},state);
    const text=await readFile(path,"utf8"),value=JSON.parse(text);assert.equal((await stat(path)).mode&0o777,0o600);assert.ok(Buffer.byteLength(text)<4096);assert.equal(value.nativeAcceptance,false);
    for(const secret of [credential,session,gateway])assert.equal(text.includes(secret),false);assert.equal("envelope" in value,false);assert.equal(value.readiness.phase,"module-requested");
    await assert.rejects(api.writeArmFailure(live,{armFailurePath:path},state),/EEXIST/);
  }finally{await rm(dir,{recursive:true,force:true})}
});
test("canonical pair cannot click Arm until the selected-module wait resolves",async()=>{
  const pair=spec.slice(spec.indexOf("async function pair("),spec.indexOf("async function target("));const ready=deferred(),events=[];
  const state={moduleSha256:hash,armSha256:hash};const expect=()=>({not:{toContainText:async()=>{}},toContainText:async()=>{}});expect.poll=()=>({toBe:async()=>{}});
  const live={getByLabel:()=>({fill:async()=>{}}),getByRole:(_,o)=>({click:async()=>{events.push(o.name)}}),locator:()=>({})};
  const run=vm.runInNewContext(`${pair};pair`,{expect,loadSelectedGuest:()=>ready.promise,writeArmFailure:async()=>{throw new Error("unexpected failure")}});
  const pending=run({locator:()=>live,goto:async()=>{}},{},"Manual guest",{readiness:state});await turn();assert.deepEqual(events,["Pair"]);ready.resolve();await pending;assert.deepEqual(events,["Pair","Arm live"]);assert.equal(state.phase,"native-confirmed");
});
test("arm lifecycle records only module digest/count and controller stage outside accepted capture",async()=>{
  const captureSource=spec.slice(spec.indexOf("async function capture("),spec.indexOf("async function pair("));let onSocket;const callbacks={},journalRows=[];let envelope;
  const api=vm.runInNewContext(`${readiness};${captureSource};({capture})`,{createHash,readFile,writeFile,basename,URL,Buffer,Uint8Array,codec:{v1:{},canonicalObject:()=>envelope}});
  const rows=await api.capture({on:(_,fn)=>{onSocket=fn}},{append:(kind,value)=>journalRows.push({kind,value})});onSocket({on:(name,fn)=>{callbacks[name]=fn}});
  envelope={body:"arm",arm:{module:{sha256:Buffer.from(hash,"hex").toString("base64")},controller:{sessionId:"do-not-retain"}}};callbacks.framesent({payload:[]});
  assert.equal(rows.readiness.armCount,1);assert.equal(rows.readiness.armSha256,hash);assert.equal(rows.length,0);assert.equal(journalRows.length,0);assert.equal(JSON.stringify(rows.readiness).includes("do-not-retain"),false);
  envelope={body:"controllerState",controllerState:{stage:"CONTROLLER_STAGE_REFUSED",reason:"untrusted-private-reason"}};callbacks.framereceived({payload:[]});assert.equal(rows.readiness.controllerCount,1);assert.equal(rows.readiness.controllerStage,"CONTROLLER_STAGE_REFUSED");assert.equal(JSON.stringify(rows.readiness).includes("untrusted-private-reason"),false);
  assert.equal(journalRows[0].kind,"controllerState"); // Existing accepted trace behavior is retained.
});
test("canonical failed pair retains its safe refusal code and rethrows the original failure",async()=>{
  const dir=await mkdtemp(resolve(tmpdir(),"bar-pair-failure-"));try{
    const pair=spec.slice(spec.indexOf("async function pair("),spec.indexOf("async function target("));const failure=new Error("controlled download refusal"),state={phase:"module-requested",failureCode:"module-download-unavailable"};let arms=0;
    const expect=()=>({not:{toContainText:async()=>{}},toContainText:async()=>{}});
    const live={getByLabel:()=>({fill:async()=>{}}),getByRole:(_,o)=>({click:async()=>{if(o.name==="Arm live")arms++}}),locator:()=>({textContent:async()=>"Live gameplay input is fenced."})};
    // Swap only the external readiness operation; canonical catch and actual artifact writer execute.
    const context=vm.createContext({expect,createHash,readFile,writeFile,basename,URL});vm.runInContext(readiness,context);context.loadSelectedGuest=async()=>{throw failure};vm.runInContext(pair,context);
    const path=resolve(dir,"capture.arm-failure.json");await assert.rejects(context.pair({locator:()=>live,goto:async()=>{}},{armFailurePath:path},"Manual guest",{readiness:state}),e=>e===failure);assert.equal(arms,0);
    const value=JSON.parse(await readFile(path,"utf8"));assert.equal(value.readiness.failureCode,"module-download-unavailable");assert.equal(value.ui.diagnostic,"Live gameplay input is fenced.");assert.equal(value.nativeAcceptance,false);
  }finally{await rm(dir,{recursive:true,force:true})}
});
