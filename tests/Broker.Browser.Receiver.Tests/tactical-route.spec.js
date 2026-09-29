import { expect, test } from "@playwright/test";
import { createServer } from "node:http";
import { cp, mkdtemp, rm } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { WebSocketServer } from "ws";

const receiverUrl = process.env.BARC_RECEIVER_URL;
const receiverRoot = process.env.BARC_RECEIVER_ROOT;
if (!receiverUrl || !receiverRoot) throw new Error("BARC_RECEIVER_URL and BARC_RECEIVER_ROOT are required");

// Keep the staged generated module below this package so its bare imports
// resolve to the test's exact protobufjs/long dependencies.
const stage = await mkdtemp(resolve(import.meta.dirname, "node_modules/.barc-receiver-tactical-codec-"));
await cp(resolve(receiverRoot, "Client/public/barc-preview/src/Broker.Browser.Contracts/generated"), resolve(stage, "generated"), { recursive: true });
const { canonicalObject, encodeObject, v1 } = await import(pathToFileURL(resolve(stage, "generated/codec.js")).href);

const sessionUuid = "33221100-5544-7766-8899-aabbccddeeff", sessionId = "ABEiM0RVZneImaq7zN3u/w==";
const actor0 = { id:"0", lifetime:"9007199254740999" }, actor31999 = { id:"31999", lifetime:"9007199254741001" };
const basis = { token:"AQIDBAUGBwgJCgsMDQ4PEA==", stateSequence:"9007199254740993", nativeFrame:427, matchId:"qqqqqru7TMyN3e7u7u7u7g==", processIncarnation:"process-live-1", stateChannelIncarnation:"state-live-1" };
const controller = { sessionId, controllerId:"ZmZmZnd3SIiJmaqqqqqqqg==", controllerIncarnation:"controller-live-1", authorityEpoch:"9007199254740995" };
const catalogueId="UlJSUlJSUlJSUlJSUlJSUg==", catalogueRevision="9007199254741011", descriptorRevision="9007199254741013";
const descriptorKinds=["TACTICAL_DESCRIPTOR_BUILD","TACTICAL_DESCRIPTOR_GUARD","TACTICAL_DESCRIPTOR_REPAIR","TACTICAL_DESCRIPTOR_RECLAIM_UNIT","TACTICAL_DESCRIPTOR_RECLAIM_FEATURE","TACTICAL_DESCRIPTOR_RECLAIM_AREA","TACTICAL_DESCRIPTOR_FACTORY_PRODUCE","TACTICAL_DESCRIPTOR_QUEUE_INSERT","TACTICAL_DESCRIPTOR_QUEUE_REMOVE","TACTICAL_DESCRIPTOR_QUEUE_REPEAT"];
const actorTactical=actor=>({actor,descriptorRevision,descriptors:[...descriptorKinds.map(kind=>({kind,allowedDefinitionIds:["TACTICAL_DESCRIPTOR_BUILD","TACTICAL_DESCRIPTOR_FACTORY_PRODUCE"].includes(kind)?[710]:[],allowedModeValues:[]})),{kind:"TACTICAL_DESCRIPTOR_BAR_CONSTRUCTION_PRIORITY",allowedDefinitionIds:[],allowedModeValues:["TACTICAL_MODE_VALUE_DISABLED","TACTICAL_MODE_VALUE_ENABLED"],observedModeValue:"TACTICAL_MODE_VALUE_DISABLED"}],queue:[{domain:"QUEUE_DOMAIN_ACTOR_ORDER",revision:"9007199254741015",entries:[{nativeTag:41,action:"LIVE_ACTION_KIND_MOVE",position:{x:1,z:2}}],complete:true},{domain:"QUEUE_DOMAIN_FACTORY_PRODUCTION",revision:"9007199254741016",entries:[],complete:true,repeat:false},{domain:"QUEUE_DOMAIN_FACTORY_RALLY",revision:"9007199254741017",entries:[],complete:false}]});
const bootstrap={preview:{game:"Beyond All Reason",protocolVersion:"barc.browser.v1",profile:"barc-live-tactical-v1",sessionId,perspectiveId:"team-0",mode:"PREVIEW_MODE_READ_ONLY"},liveProfile:"barc-live-tactical-v1",controller,module:{sha256:"QkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkI=",generation:"1"},limits:{maxActorCount:64,maxInputBytes:65536,maxOutputBytes:65536,maxFrameBytes:65536,maxPendingInputs:8,maxModuleBytes:8388608,guestPhaseTimeoutMs:250,maxObservationAgeMs:2000,liveSnapshotCadenceFrames:30,maxNativeUnitId:31999,maxPendingParents:8,maxRetainedResults:64},capabilities:{stop:true,move:true,attackVisibleUnit:true,mapBounds:{minX:0,maxX:8191,minZ:0,maxZ:8191,terrainElevationAvailable:true},tactical:{profile:"barc-live-tactical-v1",revision:1,maxCatalogueEntries:4096,maxCataloguePageEntries:128,maxBuildOptionsPerActor:128,maxQueueEntriesPerActor:128,maxFeatureReferences:256,maxFactoryProductionCount:20,maxAreaRadiusWorldUnits:1024,maxCommandDescriptorsPerActor:32}},tacticalCatalogue:{profile:"barc-live-tactical-v1",revision:1,content:{engineVersion:"2025.06.19",gameName:"Beyond All Reason",gameVersion:"test",gameContentSha256:"Y2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2NjY2M="},catalogueId,catalogueRevision,complete:true,definitions:[{definitionId:710,internalName:"armmex",displayName:"Metal Extractor",footprintXCells:2,footprintZCells:3,cost:{metal:75,energy:900,buildTime:1200},buildOptionDefinitionIds:[710]}]}};
const preview={sessionId,sequence:basis.stateSequence,capturedAtUnixMs:"1770000000123",perspectiveId:"team-0",validity:{status:"VALIDITY_STATUS_CURRENT",lastSequence:basis.stateSequence},units:[{id:"0",definitionId:501,teamId:0,observation:"OBSERVATION_KIND_OWN",position:{x:1024,z:1024}},{id:"31999",definitionId:502,teamId:0,observation:"OBSERVATION_KIND_OWN",position:{x:2048,z:2048}}],features:[]};
const observation={preview,basis,units:[actor0,actor31999].map(reference=>({reference,observation:"OBSERVATION_KIND_OWN"})),tactical:{catalogueId,catalogueRevision,economy:{perspectiveId:"team-0",sampleFrame:427,metal:{resourceName:"metal",unit:"resource",current:500,storage:1000,incomePerSecond:8.5,usagePerSecond:4},energy:{resourceName:"energy",unit:"resource",current:2500,storage:5000}},actors:[actorTactical(actor0),actorTactical(actor31999)],features:[]}};

let gateway, port, auth, submissions;
test.beforeAll(async()=>{gateway=createServer();const sockets=new WebSocketServer({noServer:true});gateway.on("upgrade",(request,socket,head)=>sockets.handleUpgrade(request,socket,head,ws=>sockets.emit("connection",ws)));sockets.on("connection",ws=>ws.once("message",raw=>{auth=canonicalObject(v1.LiveClientEnvelope,raw);ws.send(encodeObject(v1.LiveServerEnvelope,{bootstrap}));ws.send(encodeObject(v1.LiveServerEnvelope,{observation}));ws.on("message",bytes=>{const message=canonicalObject(v1.LiveClientEnvelope,bytes);if(message.body==="arm")ws.send(encodeObject(v1.LiveServerEnvelope,{controllerState:{stateSequence:"1",controller,module:message.arm.module,stage:"CONTROLLER_STAGE_ARM_NATIVE_CONFIRMED"}}));else if(message.body==="submit")submissions.push(message.submit)})}));await new Promise(done=>gateway.listen(0,"127.0.0.1",done));port=gateway.address().port});
test.beforeEach(()=>{auth=null;submissions=[]});
test.afterAll(async()=>{await new Promise(done=>gateway.close(done));await rm(stage,{recursive:true})});

async function arm(page, guest) {
  await page.goto(`${receiverUrl}?barc-profile=barc-live-tactical-v1`);
  await page.getByLabel("Gateway").fill(`ws://127.0.0.1:${port}/live`);
  await page.getByLabel("Session UUID").fill(sessionUuid);
  await page.getByLabel("One-time credential").fill("receiver-tactical-credential");
  await page.getByRole("button",{name:"Pair"}).click();
  await expect(page.locator('[data-unit-id="0"]')).toBeVisible();
  expect(auth.authenticate.profile).toBe("barc-live-tactical-v1");
  await page.getByRole("button",{name:guest}).click();
  await page.getByRole("button",{name:"Arm live"}).click();
  await expect(page.locator(".authority")).toContainText("arm native confirmed");
}

test("generated receiver routes tactical pointer and keyboard controls through archived Worker and guest",async({page})=>{
  await arm(page,"Manual guest");
  await page.locator('[data-unit-id="0"]').click();
  await page.getByLabel("Action").selectOption("build");
  await page.getByRole("button",{name:"Send tactical command"}).click();
  await expect.poll(()=>submissions.length).toBe(1);
  expect(submissions[0].intent.build).toMatchObject({definitionId:710,catalogueId,catalogueRevision});
  expect(submissions[0].intent.actorTacticalBindings[0]).toMatchObject({actor:{lifetime:actor0.lifetime},descriptorRevision});
  await page.getByLabel("Queue operation").selectOption("remove");
  const map=page.getByLabel(/Live tactical map/);await map.focus();await page.keyboard.press("q");await page.keyboard.press("Enter");
  await expect.poll(()=>submissions.length).toBe(2);
  expect(submissions[1].intent.queueEdit).toMatchObject({domain:"QUEUE_DOMAIN_ACTOR_ORDER",expectedQueueRevision:"9007199254741015",removeNativeTag:41});
  await page.getByLabel("Action").selectOption("setRally");
  await expect(page.locator(".diagnostic")).toContainText("unavailable");
  expect(submissions).toHaveLength(2);
});

test("generated receiver imports the separate custom guest policy without claiming an effect",async({page})=>{
  await arm(page,"Custom guest");
  await page.locator('[data-unit-id="0"]').click();
  await page.getByRole("button",{name:"Send tactical command"}).click();
  await page.waitForTimeout(100);
  expect(submissions).toHaveLength(0);
  await page.locator('[data-unit-id="31999"]').click();
  await page.getByRole("button",{name:"Send tactical command"}).click();
  await expect.poll(()=>submissions.length).toBe(1);
  expect(submissions[0].intent.actors).toEqual([actor31999]);
  await expect(page.locator(".result")).not.toContainText("APPLIED");
});
