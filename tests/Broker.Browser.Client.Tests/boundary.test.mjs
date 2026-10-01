import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { decodeServerFrame, projectGuestResponse, SerialGuestQueue } from "../../src/Broker.Browser.Client/runtime.js";
import { correlateLiveGuestResponse, LiveQueue, validateLiveControllerState } from "../../src/Broker.Browser.Client/live-runtime.js";
import { canonicalObject, encodeObject, v1 } from "../../src/Broker.Browser.Contracts/generated/codec.js";
import { selectProductUrl } from "./product-topology.mjs";

const wire = name => readFile(`../../fixtures/barc-browser/wire/${name}.bin`);
const bootstrap = {
  game: "bar", protocolVersion: "1.0.0", profile: "barc-preview-v1",
  sessionId: "ABEiM0RVZneImaq7zN3u/w==", perspectiveId: "team-7", mode: "PREVIEW_MODE_READ_ONLY",
  validity: { status: "VALIDITY_STATUS_CURRENT", lastSequence: "0" },
  limits: { maxFrameBytes: 65536, authTimeoutMs: 3000, maxEntities: 4096 }
};

test("stock queue scheme 2 and the legacy omitted scheme round trip distinctly", () => {
  const base={domain:"QUEUE_DOMAIN_FACTORY_PRODUCTION",revision:"9007199254742001",entries:[],complete:true};
  const stock=canonicalObject(v1.TacticalQueue,encodeObject(v1.TacticalQueue,{...base,evidenceScheme:"NATIVE_QUEUE_EVIDENCE_SCHEME_STOCK_LUA_SUPPORTED_FIELDS_V1"}));
  assert.equal(stock.evidenceScheme,"NATIVE_QUEUE_EVIDENCE_SCHEME_STOCK_LUA_SUPPORTED_FIELDS_V1");
  assert.equal(stock.revision,base.revision);
  const legacy=canonicalObject(v1.TacticalQueue,encodeObject(v1.TacticalQueue,base));
  assert.equal(Object.hasOwn(legacy,"evidenceScheme"),false);
});

test("lossless identities and absent optional values cross the strict gate", async () => {
  const decoded = decodeServerFrame(await wire("observation-optional-absent"), { bootstrap, negotiatedMaxFrameBytes: 65536 });
  assert.equal(decoded.observation.sequence, "9007199254740993");
  assert.equal(Object.hasOwn(decoded.observation.units[0], "teamId"), false);
  assert.equal(Object.hasOwn(decoded.observation.units[0].position, "elevation"), false);
});

test("present zero stays distinct from absent", async () => {
  const decoded = decodeServerFrame(await wire("observation-optional-present-zero"), { bootstrap, negotiatedMaxFrameBytes: 65536 });
  assert.equal(decoded.observation.units[0].teamId, 0);
  assert.equal(decoded.observation.units[0].position.elevation, 0);
  assert.equal(decoded.observation.units[0].generation, "0");
});

test("legitimate stale envelopes omit current-only perspective and capture fields", () => {
  const bytes = encodeObject(v1.ServerEnvelope, { observation: { sessionId: bootstrap.sessionId, sequence: "9007199254740994", validity: { status: "VALIDITY_STATUS_STALE", lastSequence: "9007199254740994", receivedSequence: "9007199254740996", detail: "gap" } } });
  const decoded = decodeServerFrame(bytes, { bootstrap, negotiatedMaxFrameBytes: 65536 });
  assert.equal(decoded.observation.validity.status, "VALIDITY_STATUS_STALE");
  assert.equal(Object.hasOwn(decoded.observation, "perspectiveId"), false);
  assert.equal(Object.hasOwn(decoded.observation, "capturedAtUnixMs"), false);
});

test("external receiver URL selection preserves the private ready handoff", () => {
  const ready = Object.freeze({ staticBaseUrl: "http://127.0.0.1:4100/barc/", gatewayWebSocketUrl: "ws://127.0.0.1:4200/barc-preview", sessionId: "session", credential: "secret" });
  assert.equal(selectProductUrl(ready, {}), ready.staticBaseUrl);
  assert.equal(selectProductUrl(ready, { BARC_EXTERNAL_READY_FILE: "/private/ready.json", BARC_EXTERNAL_PRODUCT_URL: "http://127.0.0.1:4300/barc/" }), "http://127.0.0.1:4300/barc/");
  assert.equal(ready.gatewayWebSocketUrl, "ws://127.0.0.1:4200/barc-preview");
  assert.equal(ready.sessionId, "session"); assert.equal(ready.credential, "secret");
  assert.throws(() => selectProductUrl(ready, { BARC_EXTERNAL_PRODUCT_URL: "http://127.0.0.1:4300/barc/" }), /requires BARC_EXTERNAL_READY_FILE/);
  assert.throws(() => selectProductUrl(ready, { BARC_EXTERNAL_READY_FILE: "/private/ready.json", BARC_EXTERNAL_PRODUCT_URL: "file:///tmp/barc/" }), /HTTP or HTTPS/);
});

test("raw independently-authored guest coordinates are not host-quantized", () => {
  const raw = { x: 1.234567, elevation: -7.654321, z: 9.876543 };
  const bytes = encodeObject(v1.GuestResponse, { requestId: "41", sessionId: bootstrap.sessionId, consumedSequence: "9007199254740993", acknowledgment: "GUEST_ACK_STATUS_CONSUMED", kind: "INTENT_KIND_MOVE", move: { unitIds: ["77"], groundTarget: raw } });
  const canonical = v1.GuestResponse.toObject(v1.GuestResponse.decode(bytes), { longs: String, enums: String, bytes: String, defaults: false, arrays: true, oneofs: true }).move;
  const projected = projectGuestResponse(bytes, { requestId: "41", contextSequence: "9007199254740993" }, bootstrap);
  assert.deepEqual(projected, canonical);
  assert.notEqual(projected.groundTarget.x, 1.25);
  assert.notEqual(projected.groundTarget.z, 10);
});

for (const [name, message] of [
  ["malformed-varint", /malformed/], ["truncated-observation", /malformed/],
  ["unknown-envelope-wire", /body/], ["observation-unknown-enum", /observation kind/],
  ["oversized-frame", /exceeds 65536/]
]) test(`${name} is refused before state`, async () => {
  const bytes = await wire(name);
  assert.throws(() => decodeServerFrame(bytes, { bootstrap, negotiatedMaxFrameBytes: 65536 }), message);
});

test("observation coalescing never crosses an ordered input", async () => {
  const calls = [], pending = [];
  const supervisor = {
    disarm() {},
    process(bytes) { calls.push(bytes); return new Promise(resolve => pending.push(resolve)); }
  };
  const queue = new SerialGuestQueue(supervisor, () => {}, error => { throw new Error(error); });
  queue.enqueue({ kind: "observation", bytes: "observation-1" });
  queue.enqueue({ kind: "observation", bytes: "observation-2" });
  queue.enqueue({ kind: "input", bytes: "select" });
  queue.enqueue({ kind: "observation", bytes: "observation-3" });
  queue.enqueue({ kind: "observation", bytes: "observation-4" });
  for (let index = 0; index < 4; index++) {
    pending[index]({ state: "completed", output: [] });
    await new Promise(resolve => setImmediate(resolve));
  }
  assert.deepEqual(calls, ["observation-1", "observation-2", "select", "observation-4"]);
});

const liveBasis = { token:"AQIDBAUGBwgJCgsMDQ4PEA==",stateSequence:"9007199254740993",nativeFrame:427,matchId:"qqqqqru7TMyN3e7u7u7u7g==",processIncarnation:"process-live-1",stateChannelIncarnation:"state-live-1" };
const liveRequest = { inputId:"AQIDBA==",sessionId:bootstrap.sessionId,moduleGeneration:"9007199254740995",basis:liveBasis };

test("live initialization requires an exact consumed acknowledgment without an action", () => {
  const response = { ...liveRequest, acknowledgment:"GUEST_ACK_STATUS_CONSUMED" };
  assert.equal(correlateLiveGuestResponse(encodeObject(v1.LiveGuestResponse,response),liveRequest,false).inputId,liveRequest.inputId);
  assert.throws(() => correlateLiveGuestResponse(encodeObject(v1.LiveGuestResponse,{...response,moduleGeneration:"9007199254740996"}),liveRequest,false),/identity mismatch/);
  assert.throws(() => correlateLiveGuestResponse(encodeObject(v1.LiveGuestResponse,{...response,intent:{actors:[{id:"7",lifetime:"9"}],stop:{}}}),liveRequest,false),/contained an action/);
});

test("live queue restarts new-epoch work after a delayed old process returns", async () => {
  const calls=[],pending=[],results=[];let disarms=0;
  const supervisor={disarm(){disarms++},process(value){calls.push(value);return new Promise(resolve=>pending.push(resolve))}};
  const queue=new LiveQueue(supervisor,(item)=>results.push(item.bytes),reason=>assert.fail(reason));
  queue.enqueue({kind:"input",bytes:"old"});queue.reset();queue.enqueue({kind:"input",bytes:"new"});
  pending[0]({state:"completed",output:[]});await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(calls,["old","new"]);assert.deepEqual(results,[]);
  pending[1]({state:"completed",output:[]});await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(results,["new"]);assert.equal(disarms,1);
});

test("live queue phase failure and overflow invoke authority failure exactly once", async () => {
  const failures=[];let disarms=0,resolveFirst;
  const supervisor={disarm(){disarms++},process(){return new Promise(resolve=>resolveFirst=resolve)}};
  let queue;queue=new LiveQueue(supervisor,()=>assert.fail("failed work must not complete"),reason=>{failures.push(reason);queue.reset()});
  queue.enqueue({kind:"input",bytes:"running"});for(let index=0;index<9;index++)queue.enqueue({kind:"input",bytes:`queued-${index}`});
  assert.deepEqual(failures,["Live guest input queue overflowed; explicit rearm is required."]);assert.equal(disarms,1);
  resolveFirst({state:"timed_out",reason:"old generation"});await new Promise(resolve=>setImmediate(resolve));
  assert.equal(failures.length,1);
  const phaseFailures=[];let phaseQueue;phaseQueue=new LiveQueue({disarm(){},process(){return Promise.resolve({state:"timed_out",reason:"watchdog"})}},()=>assert.fail("timed out work must not complete"),reason=>{phaseFailures.push(reason);phaseQueue.reset()});
  phaseQueue.enqueue({kind:"input",bytes:"phase"});await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(phaseFailures,["Guest timed_out: watchdog"]);
});

test("live controller state requires the full controller and module identity", () => {
  const controller={sessionId:bootstrap.sessionId,controllerId:"controller",controllerIncarnation:"incarnation",authorityEpoch:"7"};
  const module={sha256:"QkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkI=",generation:"9"};
  validateLiveControllerState({controller,module},{controller},module);
  assert.throws(()=>validateLiveControllerState({controller:{...controller,sessionId:"wrong"},module},{controller},module),/identity mismatch/);
  assert.throws(()=>validateLiveControllerState({controller,module:{...module,sha256:"Q0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0M="}},{controller},module),/identity mismatch/);
});
