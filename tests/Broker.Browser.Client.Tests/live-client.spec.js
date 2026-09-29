import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { WebSocketServer } from "ws";
import { canonicalObject, encodeObject, v1 } from "../../src/Broker.Browser.Contracts/generated/codec.js";

const root = resolve("../..");
const sessionUuid = "33221100-5544-7766-8899-aabbccddeeff", sessionId = "ABEiM0RVZneImaq7zN3u/w==";
const basis = { token:"AQIDBAUGBwgJCgsMDQ4PEA==", stateSequence:"9007199254740993", nativeFrame:427, matchId:"qqqqqru7TMyN3e7u7u7u7g==", processIncarnation:"process-live-1", stateChannelIncarnation:"state-live-1" };
const controller = { sessionId, controllerId:"ZmZmZnd3SIiJmaqqqqqqqg==", controllerIncarnation:"controller-live-1", authorityEpoch:"9007199254740995" };
const ref0 = { id:"0", lifetime:"9007199254740999" }, ref31999 = { id:"31999", lifetime:"9007199254741001" }, visual77 = { id:"77", lifetime:"9007199254741003" }, radar88 = { id:"88", lifetime:"9007199254741005" };
const bootstrap = { preview:{ game:"Beyond All Reason", protocolVersion:"barc.browser.v1", profile:"barc-live-v1", sessionId, perspectiveId:"team-0", mode:"PREVIEW_MODE_READ_ONLY" }, liveProfile:"barc-live-v1", controller, module:{ sha256:"QkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkI=", generation:"1" }, limits:{ maxActorCount:64,maxInputBytes:65536,maxOutputBytes:65536,maxFrameBytes:65536,maxPendingInputs:8,maxModuleBytes:8388608,guestPhaseTimeoutMs:250,maxObservationAgeMs:2000,liveSnapshotCadenceFrames:30,maxNativeUnitId:31999,maxPendingParents:8,maxRetainedResults:64 }, capabilities:{ stop:true,move:true,attackVisibleUnit:true,mapBounds:{ minX:0,maxX:8191,minZ:0,maxZ:8191,terrainElevationAvailable:true } } };
const catalogueId="UlJSUlJSUlJSUlJSUlJSUg==", catalogueRevision="9007199254741011", descriptorRevision="9007199254741013";
const tacticalCapabilities={profile:"barc-live-tactical-v1",revision:1,maxCatalogueEntries:4096,maxCataloguePageEntries:128,maxBuildOptionsPerActor:128,maxQueueEntriesPerActor:128,maxFeatureReferences:256,maxFactoryProductionCount:20,maxAreaRadiusWorldUnits:1024,maxCommandDescriptorsPerActor:32};
const tacticalBootstrap={...bootstrap,preview:{...bootstrap.preview,profile:"barc-live-tactical-v1"},liveProfile:"barc-live-tactical-v1",capabilities:{...bootstrap.capabilities,tactical:tacticalCapabilities},tacticalCatalogue:{profile:"barc-live-tactical-v1",revision:1,content:{engineVersion:"2025.06.19",gameName:"Beyond All Reason",gameVersion:"test-29926-0571aa8",gameContentSha256:"Y2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2M="},catalogueId,catalogueRevision,complete:true,definitions:[{definitionId:710,internalName:"armmex",displayName:"Metal Extractor",footprintXCells:2,footprintZCells:3,cost:{metal:75,energy:900,buildTime:1200},buildOptionDefinitionIds:[710]}]}};
const observation = refs => ({ preview:{ sessionId,sequence:basis.stateSequence,capturedAtUnixMs:"1770000000123",perspectiveId:"team-0",validity:{status:"VALIDITY_STATUS_CURRENT",lastSequence:basis.stateSequence},units:[
  { id:"0",definitionId:501,teamId:0,observation:"OBSERVATION_KIND_OWN",position:{x:1024,z:1024} },
  { id:"31999",definitionId:502,teamId:0,observation:"OBSERVATION_KIND_OWN",position:{x:2048,z:2048} },
  { id:"77",definitionId:601,teamId:1,observation:"OBSERVATION_KIND_VISUAL",position:{x:4096,z:4096} },
  { id:"88",observation:"OBSERVATION_KIND_RADAR",position:{x:6144,z:6144} },
],features:[]},basis,units:refs.map(([reference,kind])=>({reference,observation:kind})) });
const fullObservation = observation([[ref0,"OBSERVATION_KIND_OWN"],[ref31999,"OBSERVATION_KIND_OWN"],[visual77,"OBSERVATION_KIND_VISUAL"],[radar88,"OBSERVATION_KIND_RADAR"]]);
const descriptorKinds=["TACTICAL_DESCRIPTOR_BUILD","TACTICAL_DESCRIPTOR_GUARD","TACTICAL_DESCRIPTOR_REPAIR","TACTICAL_DESCRIPTOR_RECLAIM_UNIT","TACTICAL_DESCRIPTOR_RECLAIM_FEATURE","TACTICAL_DESCRIPTOR_RECLAIM_AREA","TACTICAL_DESCRIPTOR_FACTORY_PRODUCE","TACTICAL_DESCRIPTOR_QUEUE_INSERT","TACTICAL_DESCRIPTOR_QUEUE_REMOVE","TACTICAL_DESCRIPTOR_QUEUE_REPEAT"];
const actorTactical=actor=>({actor,descriptorRevision,descriptors:[...descriptorKinds.map(kind=>({kind,allowedDefinitionIds:["TACTICAL_DESCRIPTOR_BUILD","TACTICAL_DESCRIPTOR_FACTORY_PRODUCE"].includes(kind)?[710]:[],allowedModeValues:[]})),{kind:"TACTICAL_DESCRIPTOR_BAR_CONSTRUCTION_PRIORITY",allowedDefinitionIds:[],allowedModeValues:["TACTICAL_MODE_VALUE_DISABLED","TACTICAL_MODE_VALUE_ENABLED"],observedModeValue:"TACTICAL_MODE_VALUE_DISABLED"}],queue:[{domain:"QUEUE_DOMAIN_ACTOR_ORDER",revision:"9007199254741015",entries:[{nativeTag:41,action:"LIVE_ACTION_KIND_MOVE",position:{x:1,z:2}}],complete:true},{domain:"QUEUE_DOMAIN_FACTORY_PRODUCTION",revision:"9007199254741016",entries:[{nativeTag:42,action:"LIVE_ACTION_KIND_FACTORY_PRODUCE",definitionId:710}],complete:true,repeat:false},{domain:"QUEUE_DOMAIN_FACTORY_RALLY",revision:"9007199254741017",entries:[],complete:false}]});
const feature0={reference:{id:"0",lifetime:"9007199254741019"},definitionId:91,position:{x:1400,elevation:12.5,z:1600},reclaimLeft:.75};
const tacticalObservation={...fullObservation,tactical:{catalogueId,catalogueRevision,economy:{perspectiveId:"team-0",sampleFrame:basis.nativeFrame,metal:{resourceName:"metal",unit:"resource",current:500,storage:1000,incomePerSecond:8.5,usagePerSecond:4},energy:{resourceName:"energy",unit:"resource",current:2500,storage:5000}},actors:[actorTactical(ref0),actorTactical(ref31999)],features:[feature0]}};
let server, port, sockets, submissions, armRequests, auth, canonicalFeedback, heldFeedback, resultSequence, revocations;
const routes=[["/client/","src/Broker.Browser.Client/dist/"],["/src/Broker.Browser.Wasm/","src/Broker.Browser.Wasm/"],["/guests/","tests/Broker.Browser.Wasm.Tests/generated/"]];

test.beforeAll(async()=>{
  server=createServer(async(request,response)=>{try{if(request.url.startsWith("/?")){response.setHeader("content-type","text/html");response.end(await readFile(new URL("./harness.html",import.meta.url)));return}const route=routes.find(([prefix])=>request.url.startsWith(prefix));if(!route){response.statusCode=404;response.end();return}const path=resolve(root,route[1],request.url.slice(route[0].length));response.setHeader("content-type",extname(path)===".js"?"text/javascript":extname(path)===".css"?"text/css":"application/wasm");response.end(await readFile(path))}catch{response.statusCode=404;response.end()}});
  sockets=new WebSocketServer({noServer:true});server.on("upgrade",(request,socket,head)=>sockets.handleUpgrade(request,socket,head,ws=>sockets.emit("connection",ws)));
  sockets.on("connection",ws=>{ws.once("message",raw=>{
    auth=canonicalObject(v1.LiveClientEnvelope,raw);let currentController=controller,activeModule=null,stateSequence=0;
    const profile=auth.authenticate.profile, selectedBootstrap=profile==="barc-live-tactical-v1"?tacticalBootstrap:bootstrap, selectedObservation=profile==="barc-live-tactical-v1"?tacticalObservation:fullObservation;
    const negotiated=canonicalFeedback?{...selectedBootstrap,limits:{...selectedBootstrap.limits,maxPendingParents:2}}:selectedBootstrap;
    ws.send(encodeObject(v1.LiveServerEnvelope,{bootstrap:{...negotiated,controller:currentController}}));ws.send(encodeObject(v1.LiveServerEnvelope,{observation:selectedObservation}));
    ws.on("message",bytes=>{const message=canonicalObject(v1.LiveClientEnvelope,bytes);
      if(message.body==="arm"){armRequests.push(message.arm);activeModule=message.arm.module;ws.send(encodeObject(v1.LiveServerEnvelope,{controllerState:{stateSequence:String(++stateSequence),controller:currentController,module:activeModule,stage:"CONTROLLER_STAGE_ARM_NATIVE_CONFIRMED"}}))}
      else if(message.body==="submit"){submissions.push(message.submit);const intent=message.submit.intent;if(canonicalFeedback)heldFeedback.push({ws,submit:message.submit,controller:currentController});else ws.send(encodeObject(v1.LiveServerEnvelope,{result:{resultSequence:String(++resultSequence),parentId:message.submit.parentId,inputId:message.submit.inputId,module:message.submit.module,basis:message.submit.basis,controller:currentController,childIndex:0,childCount:intent.actors.length,actor:intent.actors[0],stage:"LIVE_RESULT_STAGE_NATIVE_DISPATCH",status:"LIVE_RESULT_STATUS_APPLIED",disposition:"LIVE_RESULT_DISPOSITION_RECORDED",nativeFrame:430,commandChannelIncarnation:"command-live-1"}}))}
      else if(message.body==="revoke"){
        revocations.push(message.revoke.reason);
        ws.send(encodeObject(v1.LiveServerEnvelope,{controllerState:{stateSequence:String(++stateSequence),controller:currentController,module:activeModule,stage:"CONTROLLER_STAGE_REVOKE_NATIVE_CONFIRMED",reason:message.revoke.reason}}));
        const nextEpoch=(BigInt(currentController.authorityEpoch)+1n).toString();currentController={sessionId,controllerId:Buffer.alloc(16,Number(BigInt(nextEpoch)%251n)+1).toString("base64"),controllerIncarnation:`controller-live-${nextEpoch}`,authorityEpoch:nextEpoch};activeModule=null;
        ws.send(encodeObject(v1.LiveServerEnvelope,{bootstrap:{...selectedBootstrap,controller:currentController}}));ws.send(encodeObject(v1.LiveServerEnvelope,{observation:selectedObservation}));
      }
    })
  })});
  await new Promise(resolveListen=>server.listen(0,"127.0.0.1",resolveListen));port=server.address().port;
});
test.beforeEach(()=>{submissions=[];armRequests=[];auth=null;canonicalFeedback=false;heldFeedback=[];resultSequence=0;revocations=[]});
test.afterAll(()=>new Promise(resolveClose=>server.close(resolveClose)));

async function arm(page, guest="Manual guest", profile="barc-live-v1") {
  await page.goto(`http://127.0.0.1:${port}/?profile=${profile}`);
  await page.getByLabel("Gateway").fill(`ws://127.0.0.1:${port}/live`);await page.getByLabel("Session UUID").fill(sessionUuid);await page.getByLabel("One-time credential").fill("live-credential");await page.getByRole("button",{name:"Pair"}).click();
  await expect(page.locator('[data-unit-id="0"]')).toBeVisible();expect(auth.authenticate.profile).toBe(profile);expect(auth.authenticate.expectedSessionId).toBe(sessionId);
  await page.getByRole("button",{name:guest}).click();await page.getByRole("button",{name:"Arm live"}).click();await expect(page.locator(".authority")).toContainText("arm native confirmed");
}

test("pointer and independent keyboard actions pass through the real guest before live submit",async({page})=>{
  await arm(page);
  await page.locator('[data-unit-id="0"]').click();await page.getByRole("button",{name:"Stop"}).click();
  await page.getByLabel("Target X").fill("512.5");await page.getByLabel("Target Z").fill("1024.25");await page.getByLabel("Move policy").selectOption("MOVE_POLICY_APPEND");await page.getByRole("button",{name:"Move",exact:true}).click();
  await page.locator('[data-unit-id="77"]').click();
  await expect.poll(()=>submissions.length).toBe(3);
  expect(submissions.map(value=>value.intent.action)).toEqual(["stop","move","attack"]);expect(submissions[1].intent.move.policy).toBe("MOVE_POLICY_APPEND");expect(submissions[2].intent.attack.target).toEqual(visual77);expect(submissions.every(value=>value.intent.actors[0].lifetime===ref0.lifetime)).toBe(true);

  const map=page.getByLabel(/Live tactical map/);await map.focus();await page.keyboard.press("Tab");await page.keyboard.press("s");await page.keyboard.press("ArrowRight");await page.keyboard.press("Enter");await page.keyboard.press("a");await page.keyboard.press("Enter");
  await expect.poll(()=>submissions.length).toBe(6);expect(submissions.slice(3).map(value=>value.intent.action)).toEqual(["stop","move","attack"]);expect(submissions.slice(3).every(value=>value.intent.actors[0].lifetime===ref31999.lifetime)).toBe(true);
});

test("two canonical result lifecycles cross the real Worker without revoking authority",async({page})=>{
  canonicalFeedback=true;await arm(page);await page.locator('[data-unit-id="0"]').click();await page.getByRole("button",{name:"Stop"}).click();await expect.poll(()=>submissions.length).toBe(1);
  await page.getByLabel("Target X").fill("512.5");await page.getByLabel("Target Z").fill("1024.25");await page.getByRole("button",{name:"Move",exact:true}).click();await expect.poll(()=>submissions.length).toBe(2);
  const before=await page.evaluate(()=>window.__barcWorkerCompletions.process);
  for(const pending of heldFeedback.splice(0,2))for(const [stage,status] of [["LIVE_RESULT_STAGE_BROKER_ADMISSION","LIVE_RESULT_STATUS_ACCEPTED"],["LIVE_RESULT_STAGE_NATIVE_ADMISSION","LIVE_RESULT_STATUS_ACCEPTED"],["LIVE_RESULT_STAGE_NATIVE_DISPATCH","LIVE_RESULT_STATUS_APPLIED"]]){
    const intent=pending.submit.intent;pending.ws.send(encodeObject(v1.LiveServerEnvelope,{result:{resultSequence:String(++resultSequence),parentId:pending.submit.parentId,inputId:pending.submit.inputId,module:pending.submit.module,basis:pending.submit.basis,controller:pending.controller,childIndex:0,childCount:intent.actors.length,actor:intent.actors[0],stage,status,disposition:"LIVE_RESULT_DISPOSITION_RECORDED",nativeFrame:stage==="LIVE_RESULT_STAGE_NATIVE_DISPATCH"?430:undefined,commandChannelIncarnation:"command-live-1"}}))
  }
  await expect.poll(()=>page.evaluate(()=>window.__barcWorkerCompletions.process)).toBe(before+6);
  await expect(page.locator(".authority")).toContainText("arm native confirmed");expect(revocations).toEqual([]);
  await page.getByRole("button",{name:"Stop"}).click();await expect.poll(()=>submissions.length).toBe(3);
});

test("custom imported policy filters ID0 and changes semantic Move policy",async({page})=>{
  await arm(page,"Custom guest");const map=page.getByLabel(/Live tactical map/);await map.focus();await page.keyboard.press("Tab");await page.keyboard.press("Tab");await page.keyboard.press("Enter");await expect.poll(()=>submissions.length).toBe(1);
  expect(submissions[0].intent.actors).toEqual([ref31999]);expect(submissions[0].intent.move.policy).toBe("MOVE_POLICY_APPEND");
  // The host requested REPLACE; the independently compiled guest changed it to APPEND.
  expect(await page.getByLabel("Move policy").inputValue()).toBe("MOVE_POLICY_REPLACE");
});

test("tactical pointer and keyboard controls cross the real Worker with exact bindings",async({page})=>{
  await arm(page,"Manual guest","barc-live-tactical-v1");
  await expect(page.locator(".catalogue")).toContainText(`revision ${catalogueRevision}`);
  await expect(page.locator(".economy")).toContainText("income 8.5");
  await page.locator('[data-unit-id="0"]').click();

  await page.getByLabel("Action").selectOption("build");
  await page.getByLabel("Facing").selectOption("BUILD_FACING_WEST");
  await page.getByLabel("Queue policy").selectOption("TACTICAL_QUEUE_POLICY_APPEND");
  await page.getByRole("button",{name:"Send tactical command"}).click();
  await expect.poll(()=>submissions.length).toBe(1);
  expect(submissions[0].intent.build).toMatchObject({definitionId:710,facing:"BUILD_FACING_WEST",queuePolicy:"TACTICAL_QUEUE_POLICY_APPEND",catalogueId,catalogueRevision});
  expect(submissions[0].intent.actorTacticalBindings).toEqual([{actor:{lifetime:ref0.lifetime},descriptorRevision,queueRevisions:[{domain:"QUEUE_DOMAIN_ACTOR_ORDER",revision:"9007199254741015"}]}]);

  await page.locator('[data-feature-id="0"]').click();
  await page.getByRole("button",{name:"Send tactical command"}).click();
  await expect.poll(()=>submissions.length).toBe(2);
  expect(submissions[1].intent.reclaimFeature.target).toEqual({lifetime:feature0.reference.lifetime});

  await page.getByLabel("Queue operation").selectOption("remove");
  const map=page.getByLabel(/Live tactical map/);await map.focus();await page.keyboard.press("q");await page.keyboard.press("Enter");
  await expect.poll(()=>submissions.length).toBe(3);
  expect(submissions[2].intent.queueEdit).toMatchObject({kind:"QUEUE_EDIT_KIND_REMOVE_TAG",domain:"QUEUE_DOMAIN_ACTOR_ORDER",expectedQueueRevision:"9007199254741015",removeNativeTag:41});

  await map.focus();await page.keyboard.press("m");await page.keyboard.press("Enter");
  await expect.poll(()=>submissions.length).toBe(4);
  expect(submissions[3].intent.tacticalMode).toEqual({kind:"TACTICAL_DESCRIPTOR_BAR_CONSTRUCTION_PRIORITY",value:"TACTICAL_MODE_VALUE_ENABLED"});

  await page.getByLabel("Action").selectOption("setRally");
  await expect(page.locator(".diagnostic")).toContainText("unavailable");
  await expect(page.getByRole("button",{name:"Send tactical command"})).toHaveAttribute("aria-disabled","");
  expect(submissions).toHaveLength(4);
});

test("pointer and keyboard multi-selection preserve ordered actors through the real tactical guest",async({page})=>{
  await arm(page,"Manual guest","barc-live-tactical-v1");
  await page.locator('[data-unit-id="0"]').click();
  await page.locator('[data-unit-id="31999"]').click({modifiers:["Control"]});
  await expect(page.locator(".selection")).toContainText("0:9007199254740999, 31999:9007199254741001");
  await page.getByLabel("Action").selectOption("build");
  await page.getByRole("button",{name:"Send tactical command"}).click();
  await expect.poll(()=>submissions.length).toBe(1);
  expect(submissions[0].intent.actors).toEqual([{lifetime:ref0.lifetime},ref31999]);
  expect(submissions[0].intent.actorTacticalBindings.map(value=>value.actor)).toEqual([{lifetime:ref0.lifetime},ref31999]);

  await page.reload();await arm(page,"Manual guest","barc-live-tactical-v1");
  submissions=[];const map=page.getByLabel(/Live tactical map/);await map.focus();
  await page.keyboard.press("Control+Tab");await page.keyboard.press("Control+Tab");
  await expect(page.locator(".selection")).toContainText("0:9007199254740999, 31999:9007199254741001");
  await page.keyboard.press("b");await page.keyboard.press("Enter");
  await expect.poll(()=>submissions.length).toBe(1);
  expect(submissions[0].intent.actors).toEqual([{lifetime:ref0.lifetime},ref31999]);

  await page.locator('[data-unit-id="31999"]').click({modifiers:["Control"]});
  await expect(page.locator(".selection")).not.toContainText("31999:9007199254741001");
  await page.getByRole("button",{name:"Send tactical command"}).click();
  await expect.poll(()=>submissions.length).toBe(2);
  expect(submissions[1].intent.actors).toEqual([{lifetime:ref0.lifetime}]);
});

test("keyboard target cycling preserves ordered actors and exact lifetime targets through the real guest",async({page})=>{
  await arm(page,"Manual guest","barc-live-tactical-v1");
  submissions=[];const map=page.getByLabel(/Live tactical map/);await map.focus();
  await page.keyboard.press("Control+Tab");await page.keyboard.press("Control+Tab");
  await expect(page.locator(".selection")).toContainText("0:9007199254740999, 31999:9007199254741001");

  await page.keyboard.press("g");await page.keyboard.press("Enter");
  await page.waitForTimeout(50);expect(submissions).toHaveLength(0);
  await page.keyboard.press("t");await page.keyboard.press("t");
  await expect(page.locator(".target")).toContainText(`Friendly 31999:${ref31999.lifetime}`);
  await page.keyboard.press("Enter");await expect.poll(()=>submissions.length).toBe(1);
  expect(submissions[0].intent.guard.target).toEqual(ref31999);

  await page.keyboard.press("r");await page.keyboard.press("Enter");await expect.poll(()=>submissions.length).toBe(2);
  expect(submissions[1].intent.repair.target).toEqual(ref31999);
  await page.keyboard.press("l");await page.keyboard.press("Enter");await expect.poll(()=>submissions.length).toBe(3);
  expect(submissions[2].intent.reclaimUnit.target).toEqual(ref31999);

  await page.keyboard.press("x");await page.keyboard.press("Enter");
  await page.waitForTimeout(50);expect(submissions).toHaveLength(3);
  await page.keyboard.press("f");
  await expect(page.locator(".target")).toContainText(`Feature 0:${feature0.reference.lifetime}`);
  await page.keyboard.press("Enter");await expect.poll(()=>submissions.length).toBe(4);
  expect(submissions[3].intent.reclaimFeature.target).toEqual({lifetime:feature0.reference.lifetime});
  expect(submissions.every(value=>JSON.stringify(value.intent.actors)===JSON.stringify([{lifetime:ref0.lifetime},ref31999]))).toBe(true);
  await expect(page.locator(".result")).not.toContainText("native effect complete");
});

test("independently compiled guest changes a tactical action rather than fabricating an effect",async({page})=>{
  await arm(page,"Custom guest","barc-live-tactical-v1");
  await page.locator('[data-unit-id="0"]').click();
  await page.getByRole("button",{name:"Send tactical command"}).click();
  await new Promise(resolveWait=>setTimeout(resolveWait,100));
  expect(submissions).toHaveLength(0);
  await expect(page.locator(".result")).not.toContainText("APPLIED");

  await page.locator('[data-unit-id="31999"]').click();
  await page.getByRole("button",{name:"Send tactical command"}).click();
  await expect.poll(()=>submissions.length).toBe(1);
  expect(submissions[0].intent.action).toBe("build");
  expect(submissions[0].intent.actors).toEqual([ref31999]);
});

test("explicit revoke receives a fresh broker identity before rearm",async({page})=>{
  await arm(page);const first={...armRequests[0].controller};await page.getByRole("button",{name:"Revoke"}).click();
  await expect(page.locator(".authority")).toContainText("unspecified");await expect(page.locator('[data-unit-id="0"]')).toBeVisible();
  await page.getByRole("button",{name:"Arm live"}).click();await expect(page.locator(".authority")).toContainText("arm native confirmed");
  expect(armRequests).toHaveLength(2);expect(BigInt(armRequests[1].controller.authorityEpoch)).toBeGreaterThan(BigInt(first.authorityEpoch));expect(armRequests[1].controller.controllerId).not.toBe(first.controllerId);
});

test("changed lifetimes, radar targets, stale state, and focus loss fail closed",async({page})=>{
  await arm(page);await page.locator('[data-unit-id="0"]').click();
  const ws=[...sockets.clients][0],changedBasis={...basis,stateSequence:"9007199254740994"};const changed={...fullObservation,basis:changedBasis,preview:{...fullObservation.preview,sequence:changedBasis.stateSequence,validity:{status:"VALIDITY_STATUS_CURRENT",lastSequence:changedBasis.stateSequence}},units:fullObservation.units.map(unit=>refId(unit.reference)==="0"?{...unit,reference:{id:"0",lifetime:"9007199254741999"}}:unit)};ws.send(encodeObject(v1.LiveServerEnvelope,{observation:changed}));
  await expect(page.locator(".selection")).toContainText("No lifetime-bound actor");await page.locator('[data-unit-id="88"]').click({force:true});expect(submissions).toHaveLength(0);
  const stale={...changed,basis:{...changedBasis,stateSequence:"9007199254740995"},preview:{...changed.preview,sequence:"9007199254740995",validity:{status:"VALIDITY_STATUS_STALE",lastSequence:changedBasis.stateSequence}}};ws.send(encodeObject(v1.LiveServerEnvelope,{observation:stale}));
  await expect(page.locator(".diagnostic")).toContainText("fenced");await expect(page.locator(".authority")).not.toContainText("arm native confirmed");
  await page.evaluate(()=>window.dispatchEvent(new Event("blur")));await expect(page.locator(".diagnostic")).toContainText("fenced");await expect(page.locator(".authority")).not.toContainText("arm native confirmed");
});

function refId(reference){return reference.id??"0"}
