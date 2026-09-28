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
const observation = refs => ({ preview:{ sessionId,sequence:basis.stateSequence,capturedAtUnixMs:"1770000000123",perspectiveId:"team-0",validity:{status:"VALIDITY_STATUS_CURRENT",lastSequence:basis.stateSequence},units:[
  { id:"0",definitionId:501,teamId:0,observation:"OBSERVATION_KIND_OWN",position:{x:1024,z:1024} },
  { id:"31999",definitionId:502,teamId:0,observation:"OBSERVATION_KIND_OWN",position:{x:2048,z:2048} },
  { id:"77",definitionId:601,teamId:1,observation:"OBSERVATION_KIND_VISUAL",position:{x:4096,z:4096} },
  { id:"88",observation:"OBSERVATION_KIND_RADAR",position:{x:6144,z:6144} },
],features:[]},basis,units:refs.map(([reference,kind])=>({reference,observation:kind})) });
const fullObservation = observation([[ref0,"OBSERVATION_KIND_OWN"],[ref31999,"OBSERVATION_KIND_OWN"],[visual77,"OBSERVATION_KIND_VISUAL"],[radar88,"OBSERVATION_KIND_RADAR"]]);
let server, port, sockets, submissions, auth;
const routes=[["/client/","src/Broker.Browser.Client/dist/"],["/src/Broker.Browser.Wasm/","src/Broker.Browser.Wasm/"],["/guests/","tests/Broker.Browser.Wasm.Tests/generated/"]];

test.beforeAll(async()=>{
  server=createServer(async(request,response)=>{try{if(request.url.startsWith("/?")){response.setHeader("content-type","text/html");response.end(await readFile(new URL("./harness.html",import.meta.url)));return}const route=routes.find(([prefix])=>request.url.startsWith(prefix));if(!route){response.statusCode=404;response.end();return}const path=resolve(root,route[1],request.url.slice(route[0].length));response.setHeader("content-type",extname(path)===".js"?"text/javascript":extname(path)===".css"?"text/css":"application/wasm");response.end(await readFile(path))}catch{response.statusCode=404;response.end()}});
  sockets=new WebSocketServer({noServer:true});server.on("upgrade",(request,socket,head)=>sockets.handleUpgrade(request,socket,head,ws=>sockets.emit("connection",ws)));
  sockets.on("connection",ws=>{ws.once("message",raw=>{auth=canonicalObject(v1.LiveClientEnvelope,raw);ws.send(encodeObject(v1.LiveServerEnvelope,{bootstrap}));ws.send(encodeObject(v1.LiveServerEnvelope,{observation:fullObservation}));ws.on("message",bytes=>{const message=canonicalObject(v1.LiveClientEnvelope,bytes);if(message.body==="arm")ws.send(encodeObject(v1.LiveServerEnvelope,{controllerState:{stateSequence:"1",controller,module:message.arm.module,stage:"CONTROLLER_STAGE_ARM_NATIVE_CONFIRMED"}}));else if(message.body==="submit"){submissions.push(message.submit);const intent=message.submit.intent;ws.send(encodeObject(v1.LiveServerEnvelope,{result:{resultSequence:String(submissions.length),parentId:message.submit.parentId,inputId:message.submit.inputId,module:message.submit.module,basis:message.submit.basis,controller,childIndex:0,childCount:intent.actors.length,actor:intent.actors[0],stage:"LIVE_RESULT_STAGE_NATIVE_DISPATCH",status:"LIVE_RESULT_STATUS_APPLIED",disposition:"LIVE_RESULT_DISPOSITION_RECORDED",nativeFrame:430,commandChannelIncarnation:"command-live-1"}}))}else if(message.body==="revoke")ws.send(encodeObject(v1.LiveServerEnvelope,{controllerState:{stateSequence:"2",controller,module:bootstrap.module,stage:"CONTROLLER_STAGE_REVOKE_NATIVE_CONFIRMED",reason:message.revoke.reason}}))})})});
  await new Promise(resolveListen=>server.listen(0,"127.0.0.1",resolveListen));port=server.address().port;
});
test.beforeEach(()=>{submissions=[];auth=null});
test.afterAll(()=>new Promise(resolveClose=>server.close(resolveClose)));

async function arm(page, guest="Manual guest") {
  await page.goto(`http://127.0.0.1:${port}/?profile=barc-live-v1`);
  await page.getByLabel("Gateway").fill(`ws://127.0.0.1:${port}/live`);await page.getByLabel("Session UUID").fill(sessionUuid);await page.getByLabel("One-time credential").fill("live-credential");await page.getByRole("button",{name:"Pair"}).click();
  await expect(page.locator('[data-unit-id="0"]')).toBeVisible();expect(auth.authenticate.profile).toBe("barc-live-v1");expect(auth.authenticate.expectedSessionId).toBe(sessionId);
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

test("custom imported policy filters ID0 and changes semantic Move policy",async({page})=>{
  await arm(page,"Custom guest");const map=page.getByLabel(/Live tactical map/);await map.focus();await page.keyboard.press("Tab");await page.keyboard.press("Tab");await page.keyboard.press("Enter");await expect.poll(()=>submissions.length).toBe(1);
  expect(submissions[0].intent.actors).toEqual([ref31999]);expect(submissions[0].intent.move.policy).toBe("MOVE_POLICY_APPEND");
  // The host requested REPLACE; the independently compiled guest changed it to APPEND.
  expect(await page.getByLabel("Move policy").inputValue()).toBe("MOVE_POLICY_REPLACE");
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
