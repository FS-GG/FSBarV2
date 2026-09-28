import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { decodeServerFrame, SerialGuestQueue } from "../../src/Broker.Browser.Client/runtime.js";
import { encodeObject, v1 } from "../../src/Broker.Browser.Contracts/generated/codec.js";
import { selectProductUrl } from "./product-topology.mjs";

const wire = name => readFile(`../../fixtures/barc-browser/wire/${name}.bin`);
const bootstrap = {
  game: "bar", protocolVersion: "1.0.0", profile: "barc-preview-v1",
  sessionId: "ABEiM0RVZneImaq7zN3u/w==", perspectiveId: "team-7", mode: "PREVIEW_MODE_READ_ONLY",
  validity: { status: "VALIDITY_STATUS_CURRENT", lastSequence: "0" },
  limits: { maxFrameBytes: 65536, authTimeoutMs: 3000, maxEntities: 4096 }
};

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
