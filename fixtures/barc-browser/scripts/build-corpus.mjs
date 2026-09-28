import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalObject, encodeObject, v1 } from "../../../src/Broker.Browser.Contracts/generated/codec.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const wireDir = resolve(root, "wire");
const semanticDir = resolve(root, "semantic");
mkdirSync(wireDir, { recursive: true });
mkdirSync(semanticDir, { recursive: true });
const session = Buffer.from("00112233445566778899aabbccddeeff", "hex");
const seq = "9007199254740993";

const cases = [
  {
    name: "observation-optional-absent",
    type: v1.ServerEnvelope,
    value: { observation: { sessionId: session, sequence: seq, capturedAtUnixMs: "1770000000123", perspectiveId: "team-7", validity: { status: "VALIDITY_STATUS_CURRENT", lastSequence: seq }, units: [{ id: "77", definitionId: 501, observation: "OBSERVATION_KIND_RADAR", position: { x: 11.25, z: -37.5 } }], features: [] } },
    expect: "decode"
  },
  {
    name: "observation-optional-present-zero",
    type: v1.ServerEnvelope,
    value: { observation: { sessionId: session, sequence: seq, capturedAtUnixMs: "1770000000123", perspectiveId: "team-7", validity: { status: "VALIDITY_STATUS_CURRENT", lastSequence: seq, receivedSequence: "0" }, units: [{ id: "77", definitionId: 501, teamId: 0, observation: "OBSERVATION_KIND_OWN", position: { x: 11.25, elevation: 0, z: -37.5 }, health: 0, maxHealth: 0, generation: "0" }], features: [{ id: "77", definitionId: 909, position: { x: -5.5, elevation: 0, z: 91.75 } }], teamEconomy: { teamId: 0, metal: { current: 0, storage: 0, income: 0, expenditure: 0 }, energy: { current: 0 } } } },
    expect: "decode"
  },
  {
    name: "observation-asymmetric",
    type: v1.ServerEnvelope,
    value: { observation: { sessionId: session, sequence: seq, capturedAtUnixMs: "1770000000123", perspectiveId: "team-7", validity: { status: "VALIDITY_STATUS_CURRENT", lastSequence: seq, receivedSequence: seq }, units: [{ id: "77", definitionId: 501, teamId: 7, observation: "OBSERVATION_KIND_OWN", position: { x: 11.25, elevation: 403.5, z: -37.5 }, health: 123.5, maxHealth: 800 }, { id: "88", definitionId: 502, teamId: 9, observation: "OBSERVATION_KIND_VISUAL", position: { x: -19.5, elevation: 17.25, z: 61.75 } }, { id: "99", definitionId: 0, observation: "OBSERVATION_KIND_RADAR", position: { x: 73.25, z: -8.5 } }], features: [{ id: "77", definitionId: 909, position: { x: -5.5, elevation: 222.25, z: 91.75 } }], teamEconomy: { teamId: 7, metal: { current: 42.5, storage: 1000, income: 7.25, expenditure: 3.5 }, energy: { current: 0, storage: 5000, income: 91.5, expenditure: 87.25 } } } },
    expect: "decode"
  },
  { name: "guest-initialize", type: v1.GuestRequest, value: { requestId: "1", sessionId: session, contextSequence: "0", initialize: { game: "bar", protocolVersion: "1.0.0", profile: "barc-preview-v1", sessionId: session, perspectiveId: "team-7", mode: "PREVIEW_MODE_READ_ONLY", validity: { status: "VALIDITY_STATUS_CURRENT", lastSequence: "0" }, limits: { maxFrameBytes: 65536, authTimeoutMs: 3000, maxEntities: 4096 } } }, expect: "decode" },
  { name: "guest-observation", type: v1.GuestRequest, value: { requestId: "2", sessionId: session, contextSequence: seq, observation: { sessionId: session, sequence: seq, capturedAtUnixMs: "1770000000123", perspectiveId: "team-7", validity: { status: "VALIDITY_STATUS_CURRENT", lastSequence: seq }, units: [{ id: "77", definitionId: 501, teamId: 7, observation: "OBSERVATION_KIND_OWN", position: { x: 11.25, elevation: 403.5, z: -37.5 }, health: 123.5, maxHealth: 800 }, { id: "99", observation: "OBSERVATION_KIND_RADAR", position: { x: 73.25, z: -8.5 } }], features: [], teamEconomy: { teamId: 7, metal: { current: 42.5, storage: 1000, income: 7.25 }, energy: { current: 0, storage: 5000, income: 91.5 } } } }, expect: "decode" },
  { name: "guest-no-action-ack", type: v1.GuestResponse, value: { requestId: "2", sessionId: session, consumedSequence: seq, acknowledgment: "GUEST_ACK_STATUS_CONSUMED", kind: "INTENT_KIND_UNSPECIFIED" }, expect: "decode:no-action-ack" },
  { name: "guest-invalid-context", type: v1.GuestRequest, value: { requestId: "3", sessionId: session, contextSequence: "9007199254740992", select: { unitIds: ["77"] } }, expect: "semantic-refusal:stale-context-sequence" },
  { name: "guest-invalid-session", type: v1.GuestRequest, value: { requestId: "4", sessionId: Buffer.alloc(16, 0xee), contextSequence: seq, groundTarget: { position: { x: 1, z: 2 } } }, expect: "semantic-refusal:wrong-session" },
  { name: "guest-select", type: v1.GuestRequest, value: { requestId: seq, sessionId: session, contextSequence: seq, select: { unitIds: ["77"] } }, expect: "decode" },
  { name: "guest-ground-target", type: v1.GuestRequest, value: { requestId: "9007199254740994", sessionId: session, contextSequence: seq, groundTarget: { position: { x: 123.25, elevation: 456.5, z: -789.75 } } }, expect: "decode" },
  { name: "guest-move-preview", type: v1.GuestResponse, value: { requestId: "9007199254740994", sessionId: session, consumedSequence: seq, acknowledgment: "GUEST_ACK_STATUS_CONSUMED", kind: "INTENT_KIND_MOVE", move: { unitIds: ["77"], groundTarget: { x: 123.25, elevation: 456.5, z: -789.75 } } }, expect: "decode" },
  { name: "auth-wrong-game", type: v1.ClientEnvelope, value: { authenticate: { game: "arena", protocolVersion: "1.0.0", profile: "barc-preview-v1", credential: "fixture-credential", origin: "http://127.0.0.1:4173", expectedSessionId: session } }, expect: "semantic-refusal:wrong-game" },
  { name: "auth-wrong-origin", type: v1.ClientEnvelope, value: { authenticate: { game: "bar", protocolVersion: "1.0.0", profile: "barc-preview-v1", credential: "fixture-credential", origin: "https://hostile.invalid", expectedSessionId: session } }, expect: "semantic-refusal:wrong-origin" }
  ,{ name: "auth-stale-credential", type: v1.ClientEnvelope, value: { authenticate: { game: "bar", protocolVersion: "1.0.0", profile: "barc-preview-v1", credential: "expired-fixture-credential", origin: "http://127.0.0.1:4173", expectedSessionId: session } }, expect: "semantic-refusal:stale-credential" }
  ,{ name: "auth-wrong-session", type: v1.ClientEnvelope, value: { authenticate: { game: "bar", protocolVersion: "1.0.0", profile: "barc-preview-v1", credential: "fixture-credential", origin: "http://127.0.0.1:4173", expectedSessionId: Buffer.alloc(16, 0xee) } }, expect: "semantic-refusal:wrong-session" }
  ,{ name: "auth-incomplete", type: v1.ClientEnvelope, value: { authenticate: { game: "bar", protocolVersion: "1.0.0" } }, expect: "semantic-refusal:incomplete-metadata" }
  ,{ name: "observation-unknown-enum", type: v1.ServerEnvelope, value: { observation: { sessionId: session, sequence: seq, capturedAtUnixMs: "1770000000123", perspectiveId: "team-7", validity: { status: "VALIDITY_STATUS_CURRENT", lastSequence: seq }, units: [{ id: "77", definitionId: 501, observation: 99, position: { x: 1, z: 2 } }] } }, expect: "semantic-refusal:unknown-enum" }
];

const manifestCases = [];
for (const item of cases) {
  const bytes = Buffer.from(encodeObject(item.type, item.value));
  const wireName = `${item.name}.bin`;
  const semanticName = `${item.name}.json`;
  writeFileSync(resolve(wireDir, wireName), bytes);
  writeFileSync(resolve(semanticDir, semanticName), JSON.stringify(canonicalObject(item.type, bytes), null, 2) + "\n");
  manifestCases.push({ name: item.name, wire: `wire/${wireName}`, semantic: `semantic/${semanticName}`, expected: item.expect, sha256: createHash("sha256").update(bytes).digest("hex") });
}

const base = readFileSync(resolve(wireDir, "observation-asymmetric.bin"));
const unknown = Buffer.concat([base, Buffer.from([0xf8, 0x07, 0x01])]);
writeFileSync(resolve(wireDir, "observation-unknown-field.bin"), unknown);
writeFileSync(resolve(semanticDir, "observation-unknown-field.json"), JSON.stringify(canonicalObject(v1.ServerEnvelope, unknown), null, 2) + "\n");
manifestCases.push({ name: "observation-unknown-field", wire: "wire/observation-unknown-field.bin", semantic: "semantic/observation-unknown-field.json", expected: "decode-and-drop-unknown-on-reencode", sha256: createHash("sha256").update(unknown).digest("hex") });
assert.deepEqual(Buffer.from(encodeObject(v1.ServerEnvelope, canonicalObject(v1.ServerEnvelope, unknown))), base, "unknown fields must be dropped on canonical re-encode");

const invalid = [
  ["malformed-varint", Buffer.from([0xff]), "decode-refusal"],
  ["truncated-observation", base.subarray(0, base.length - 1), "decode-refusal"],
  ["oversized-frame", Buffer.alloc(65537, 0), "size-refusal:max-65536"],
  ["unknown-envelope-wire", Buffer.from([0x08, 0x63]), "semantic-refusal:unknown-envelope-body"]
];
for (const [name, bytes, expected] of invalid) {
  const wireName = `${name}.bin`;
  writeFileSync(resolve(wireDir, wireName), bytes);
  manifestCases.push({ name, wire: `wire/${wireName}`, expected, sha256: createHash("sha256").update(bytes).digest("hex") });
}

for (const name of ["malformed-varint", "truncated-observation"]) {
  const bytes = readFileSync(resolve(wireDir, `${name}.bin`));
  assert.throws(() => v1.ServerEnvelope.decode(bytes), undefined, `${name} must fail protobuf decode`);
}
assert.equal(readFileSync(resolve(wireDir, "oversized-frame.bin")).length, 65537);
const absent = JSON.parse(readFileSync(resolve(semanticDir, "observation-optional-absent.json"), "utf8"));
const zero = JSON.parse(readFileSync(resolve(semanticDir, "observation-optional-present-zero.json"), "utf8"));
assert.equal(Object.hasOwn(absent.observation.units[0].position, "elevation"), false);
assert.equal(Object.hasOwn(zero.observation.units[0].position, "elevation"), true);
assert.equal(zero.observation.units[0].generation, "0");
assert.equal(JSON.parse(readFileSync(resolve(semanticDir, "observation-unknown-enum.json"), "utf8")).observation.units[0].observation, 99);

manifestCases.sort((a, b) => a.name.localeCompare(b.name));
const bundle = createHash("sha256");
for (const item of manifestCases) {
  bundle.update(item.name); bundle.update(Buffer.from([0])); bundle.update(readFileSync(resolve(root, item.wire)));
}
const schema = readFileSync(resolve(root, "../../src/Broker.Browser.Contracts/barc_browser.proto"));
const manifest = { schema: "barc.browser.corpus/v1", protoPackage: "barc.browser.v1", protocolVersion: "1.0.0", profile: "barc-preview-v1", generator: { protobufjs: "8.8.0", protobufjsCli: "2.7.0", long: "5.3.2" }, maxFrameBytes: 65536, protoSha256: createHash("sha256").update(schema).digest("hex"), orderedBundleSha256: bundle.digest("hex"), cases: manifestCases };
writeFileSync(resolve(root, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(manifest.orderedBundleSha256);
