import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalObject, encodeObject, v1 } from "../../../src/Broker.Browser.Contracts/generated/codec.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const semantic = resolve(root, "semantic");
const wire = resolve(root, "wire");
rmSync(semantic, { recursive: true, force: true });
rmSync(wire, { recursive: true, force: true });
mkdirSync(semantic, { recursive: true });
mkdirSync(wire, { recursive: true });

const uuid = value => Buffer.from(value.replaceAll("-", ""), "hex");
const basis = {
  token: Buffer.from("0102030405060708090a0b0c0d0e0f10", "hex"),
  stateSequence: "9007199254740993",
  nativeFrame: 427,
  matchId: uuid("aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee"),
  processIncarnation: "process-live-1",
  stateChannelIncarnation: "state-live-1"
};
const controller = {
  sessionId: uuid("11111111-2222-4333-8444-555555555555"),
  controllerId: uuid("66666666-7777-4888-8999-aaaaaaaaaaaa"),
  controllerIncarnation: "controller-live-1",
  authorityEpoch: "9007199254740995"
};
const moduleIdentity = {
  sha256: Buffer.from("42".repeat(32), "hex"),
  generation: "9007199254740997"
};
const inputId = uuid("bbbbbbbb-cccc-4ddd-8eee-ffffffffffff");

const cases = [
  ["live-bootstrap", v1.LiveServerEnvelope, {
    bootstrap: {
      preview: { game: "Beyond All Reason", protocolVersion: "barc.browser.v1", profile: "barc-live-v1", sessionId: controller.sessionId, perspectiveId: "team-0", mode: "PREVIEW_MODE_READ_ONLY" },
      liveProfile: "barc-live-v1", controller, module: moduleIdentity,
      limits: { maxActorCount: 64, maxInputBytes: 65536, maxOutputBytes: 65536, maxFrameBytes: 65536, maxPendingInputs: 8, maxModuleBytes: 8388608, guestPhaseTimeoutMs: 250, maxObservationAgeMs: 2000, liveSnapshotCadenceFrames: 30, maxNativeUnitId: 31999, maxPendingParents: 8, maxRetainedResults: 64 },
      capabilities: { stop: true, move: true, attackVisibleUnit: true, mapBounds: { minX: 0, maxX: 8191, minZ: 0, maxZ: 8191, terrainElevationAvailable: true } }
    }
  }],
  ["live-guest-id0-move-response", v1.LiveGuestResponse, {
    inputId, sessionId: controller.sessionId, moduleGeneration: moduleIdentity.generation, basis,
    acknowledgment: "GUEST_ACK_STATUS_CONSUMED",
    intent: { actors: [{ id: "0", lifetime: "9007199254740999" }, { id: "31999", lifetime: "9007199254741001" }], move: { position: { x: 512.5, elevation: 0, z: 1024.25 }, policy: "MOVE_POLICY_APPEND" } }
  }],
  ["live-guest-attack-response", v1.LiveGuestResponse, {
    inputId, sessionId: controller.sessionId, moduleGeneration: moduleIdentity.generation, basis,
    acknowledgment: "GUEST_ACK_STATUS_CONSUMED",
    intent: { actors: [{ id: "0", lifetime: "9007199254740999" }], attack: { target: { id: "77", lifetime: "9007199254741003" } } }
  }],
  ["live-result-feedback", v1.LiveGuestRequest, {
    inputId, sessionId: controller.sessionId, moduleGeneration: moduleIdentity.generation, basis,
    result: { resultSequence: "9007199254741005", parentId: uuid("12345678-1234-4234-8234-123456789abc"), inputId, module: moduleIdentity, basis, controller, batchSequence: "9007199254741007", correlationId: "9007199254741009", childIndex: 0, childCount: 2, actor: { id: "0", lifetime: "9007199254740999" }, stage: "LIVE_RESULT_STAGE_NATIVE_DISPATCH", status: "LIVE_RESULT_STATUS_APPLIED", disposition: "LIVE_RESULT_DISPOSITION_RECORDED", nativeFrame: 431, commandChannelIncarnation: "command-live-1" }
  }]
];

const entries = [];
for (const [name, type, value] of cases) {
  const bytes = Buffer.from(encodeObject(type, value));
  const decoded = type.decode(bytes);
  if (name === "live-guest-id0-move-response") {
    assert.equal(decoded.intent.actors.length, 2);
    assert.equal(decoded.intent.actors[0].id.toString(), "0");
    assert.equal(decoded.intent.actors[0].lifetime.toString(), "9007199254740999");
    assert.equal(decoded.moduleGeneration.toString(), moduleIdentity.generation);
    assert.deepEqual(Buffer.from(decoded.inputId), inputId);
    assert.deepEqual(Buffer.from(decoded.basis.token), basis.token);
  }
  if (name === "live-result-feedback") {
    assert.equal(decoded.result.actor.id.toString(), "0");
    assert.equal(decoded.result.resultSequence.toString(), "9007199254741005");
    assert.deepEqual(Buffer.from(decoded.result.inputId), inputId);
    assert.deepEqual(Buffer.from(decoded.result.basis.token), basis.token);
  }
  const canonical = canonicalObject(type, bytes);
  const semanticBytes = Buffer.from(`${JSON.stringify(canonical, null, 2)}\n`);
  writeFileSync(resolve(wire, `${name}.bin`), bytes);
  writeFileSync(resolve(semantic, `${name}.json`), semanticBytes);
  entries.push({ name, type: type.$type?.fullName ?? type.name, wireSha256: createHash("sha256").update(bytes).digest("hex"), semanticSha256: createHash("sha256").update(semanticBytes).digest("hex") });
}

const mapping = {
  contract: "barc-live-v1/native-command-mapping",
  rules: [
    { action: "STOP", command: "StopCommand", options: 0, conflictPolicy: "COMMAND_CONFLICT_REPLACE_CURRENT" },
    { action: "MOVE_REPLACE", command: "MoveUnitCommand", options: 0, conflictPolicy: "COMMAND_CONFLICT_REPLACE_CURRENT" },
    { action: "MOVE_APPEND", command: "MoveUnitCommand", options: 32, conflictPolicy: "COMMAND_CONFLICT_QUEUE_AFTER_CURRENT" },
    { action: "ATTACK_VISIBLE_UNIT", command: "AttackCommand", options: 0, conflictPolicy: "COMMAND_CONFLICT_REPLACE_CURRENT", attackAreaReachable: false }
  ],
  invalid: ["missing-unit-reference", "zero-lifetime", "duplicate-actor", "actor-is-attack-target", "basis-mismatch", "input-id-mismatch", "module-generation-mismatch", "non-visual-attack-target"]
};
const mappingBytes = Buffer.from(`${JSON.stringify(mapping, null, 2)}\n`);
writeFileSync(resolve(semantic, "native-command-mapping.json"), mappingBytes);

const negotiation = {
  contract: "barc-live-v1/negotiation",
  cases: [
    { peer: "preview-v1-client", requestedProfile: "barc-preview-v1", endpoint: "preview", outcome: "ACCEPT" },
    { peer: "preview-v1-client", requestedProfile: "barc-live-v1", endpoint: "live", outcome: "REFUSE_BEFORE_LIVE_ENVELOPE" },
    { peer: "live-v1-client", requestedProfile: "barc-live-v1", endpoint: "live", nativeProtocol: "LIVE_CONTROL_PROTOCOL_V1", outcome: "ACCEPT" },
    { peer: "live-v1-client", requestedProfile: "barc-live-v1", endpoint: "live", nativeProtocol: "LIVE_CONTROL_PROTOCOL_UNSPECIFIED", outcome: "REFUSE_BEFORE_ARM" }
  ]
};
const negotiationBytes = Buffer.from(`${JSON.stringify(negotiation, null, 2)}\n`);
writeFileSync(resolve(semantic, "negotiation.json"), negotiationBytes);

const schema = readFileSync(resolve(root, "../../src/Broker.Browser.Contracts/barc_live.proto"));
const manifest = {
  schema: "barc.browser.v1/barc-live-v1",
  schemaSha256: createHash("sha256").update(schema).digest("hex"),
  mappingSha256: createHash("sha256").update(mappingBytes).digest("hex"),
  negotiationSha256: createHash("sha256").update(negotiationBytes).digest("hex"),
  entries
};
const manifestBytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(resolve(root, "manifest.json"), manifestBytes);
console.log(createHash("sha256").update(manifestBytes).digest("hex"));
