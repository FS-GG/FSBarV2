import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { decodeServerFrame } from "../../src/Broker.Browser.Client/runtime.js";

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

for (const [name, message] of [
  ["malformed-varint", /malformed/], ["truncated-observation", /malformed/],
  ["unknown-envelope-wire", /body/], ["observation-unknown-enum", /observation kind/],
  ["oversized-frame", /exceeds 65536/]
]) test(`${name} is refused before state`, async () => {
  const bytes = await wire(name);
  assert.throws(() => decodeServerFrame(bytes, { bootstrap, negotiatedMaxFrameBytes: 65536 }), message);
});
