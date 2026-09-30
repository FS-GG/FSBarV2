import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalObject, encodeObject, v1 } from "../../../src/Broker.Browser.Contracts/generated/codec.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const semantic = resolve(root, "semantic");
const wire = resolve(root, "wire");
const native = resolve(root, "native");
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
const selectInputId = uuid("cccccccc-dddd-4eee-8fff-000000000001");
const catalogueId = Buffer.from("52".repeat(16), "hex");
const catalogueRevision = "9007199254741011";
const descriptorRevision = "9007199254741013";
const queueRevision = "9007199254741015";
const featureLifetime = "9007199254741017";

const cases = [
  ["live-bootstrap", v1.LiveServerEnvelope, {
    bootstrap: {
      preview: { game: "Beyond All Reason", protocolVersion: "barc.browser.v1", profile: "barc-live-v1", sessionId: controller.sessionId, perspectiveId: "team-0", mode: "PREVIEW_MODE_READ_ONLY" },
      liveProfile: "barc-live-v1", controller, module: moduleIdentity,
      limits: { maxActorCount: 64, maxInputBytes: 65536, maxOutputBytes: 65536, maxFrameBytes: 65536, maxPendingInputs: 8, maxModuleBytes: 8388608, guestPhaseTimeoutMs: 250, maxObservationAgeMs: 2000, liveSnapshotCadenceFrames: 30, maxNativeUnitId: 31999, maxPendingParents: 8, maxRetainedResults: 64 },
      capabilities: { stop: true, move: true, attackVisibleUnit: true, mapBounds: { minX: 0, maxX: 8191, minZ: 0, maxZ: 8191, terrainElevationAvailable: true } }
    }
  }],
  ["live-guest-manual-select-request", v1.LiveGuestRequest, {
    inputId: selectInputId, sessionId: controller.sessionId, moduleGeneration: moduleIdentity.generation, basis,
    manualInput: { source: "LIVE_INPUT_SOURCE_POINTER", modifiers: {}, select: { actors: [{ id: "0", lifetime: "9007199254740999" }, { id: "31999", lifetime: "9007199254741001" }] } }
  }],
  ["live-guest-manual-move-request", v1.LiveGuestRequest, {
    inputId, sessionId: controller.sessionId, moduleGeneration: moduleIdentity.generation, basis,
    manualInput: { source: "LIVE_INPUT_SOURCE_KEYBOARD", modifiers: { shift: true }, action: { actors: [{ id: "0", lifetime: "9007199254740999" }], move: { position: { x: 512.5, elevation: 0, z: 1024.25 }, policy: "MOVE_POLICY_APPEND" } } }
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
  }],
  ["tactical-bootstrap", v1.LiveServerEnvelope, {
    bootstrap: {
      preview: { game: "Beyond All Reason", protocolVersion: "barc.browser.v1", profile: "barc-live-tactical-v1", sessionId: controller.sessionId, perspectiveId: "team-0", mode: "PREVIEW_MODE_READ_ONLY" },
      liveProfile: "barc-live-tactical-v1", controller, module: moduleIdentity,
      limits: { maxActorCount: 64, maxInputBytes: 65536, maxOutputBytes: 65536, maxFrameBytes: 65536, maxPendingInputs: 8, maxModuleBytes: 8388608, guestPhaseTimeoutMs: 250, maxObservationAgeMs: 2000, liveSnapshotCadenceFrames: 30, maxNativeUnitId: 31999, maxPendingParents: 8, maxRetainedResults: 64 },
      capabilities: {
        stop: true, move: true, attackVisibleUnit: true,
        mapBounds: { minX: 0, maxX: 8191, minZ: 0, maxZ: 8191, terrainElevationAvailable: true },
        tactical: { profile: "barc-live-tactical-v1", revision: 1, maxCatalogueEntries: 4096, maxCataloguePageEntries: 128, maxBuildOptionsPerActor: 128, maxQueueEntriesPerActor: 128, maxFeatureReferences: 256, maxFactoryProductionCount: 20, maxAreaRadiusWorldUnits: 1024, maxCommandDescriptorsPerActor: 32 }
      },
      tacticalCatalogue: {
        profile: "barc-live-tactical-v1", revision: 1,
        content: { engineVersion: "2025.06.19", gameName: "Beyond All Reason", gameVersion: "test-29926-0571aa8", gameContentSha256: Buffer.from("63".repeat(32), "hex") },
        catalogueId, catalogueRevision, complete: true,
        definitions: [{ definitionId: 710, internalName: "armmex", displayName: "Metal Extractor", footprintXCells: 2, footprintZCells: 3, cost: { metal: 75, energy: 900, buildTime: 1200 }, buildOptionDefinitionIds: [710] }]
      }
    }
  }],
  ["tactical-observation", v1.LiveServerEnvelope, {
    observation: {
      preview: { sessionId: controller.sessionId, sequence: basis.stateSequence, capturedAtUnixMs: "0", perspectiveId: "team-0", validity: { status: "VALIDITY_STATUS_CURRENT", lastSequence: basis.stateSequence }, units: [], features: [] },
      basis,
      units: [{ reference: { id: "0", lifetime: "9007199254740999" }, observation: "OBSERVATION_KIND_OWN" }],
      tactical: {
        catalogueId, catalogueRevision,
        economy: { perspectiveId: "team-0", sampleFrame: 427, metal: { resourceName: "metal", unit: "resource", current: 500, storage: 1000, incomePerSecond: 8.5, usagePerSecond: 4 }, energy: { resourceName: "energy", unit: "resource", current: 2500, storage: 5000 } },
        actors: [{
          actor: { id: "0", lifetime: "9007199254740999" }, descriptorRevision,
          descriptors: [
            { kind: "TACTICAL_DESCRIPTOR_BUILD", allowedDefinitionIds: [710] },
            { kind: "TACTICAL_DESCRIPTOR_BAR_CONSTRUCTION_PRIORITY", allowedModeValues: ["TACTICAL_MODE_VALUE_DISABLED", "TACTICAL_MODE_VALUE_ENABLED"], observedModeValue: "TACTICAL_MODE_VALUE_ENABLED" }
          ],
          queue: [{ domain: "QUEUE_DOMAIN_FACTORY_PRODUCTION", revision: queueRevision, entries: [{ nativeTag: 2147483647, action: "LIVE_ACTION_KIND_FACTORY_PRODUCE", definitionId: 710 }], complete: true, repeat: false }]
        }],
        features: [{ reference: { id: "0", lifetime: featureLifetime }, definitionId: 91, position: { x: 1400, elevation: 12.5, z: 1600 }, reclaimLeft: 0.75 }]
      }
    }
  }],
  ["tactical-guest-build-response", v1.LiveGuestResponse, {
    inputId, sessionId: controller.sessionId, moduleGeneration: moduleIdentity.generation, basis,
    acknowledgment: "GUEST_ACK_STATUS_CONSUMED",
    intent: {
      actors: [{ id: "0", lifetime: "9007199254740999" }],
      actorTacticalBindings: [{ actor: { id: "0", lifetime: "9007199254740999" }, descriptorRevision, queueRevisions: [{ domain: "QUEUE_DOMAIN_ACTOR_ORDER", revision: queueRevision }] }],
      build: { definitionId: 710, position: { x: 1024.25, elevation: 17.5, z: 2048.5 }, facing: "BUILD_FACING_WEST", queuePolicy: "TACTICAL_QUEUE_POLICY_APPEND", catalogueId, catalogueRevision }
    }
  }],
  ["tactical-guest-feature-reclaim-response", v1.LiveGuestResponse, {
    inputId, sessionId: controller.sessionId, moduleGeneration: moduleIdentity.generation, basis,
    acknowledgment: "GUEST_ACK_STATUS_CONSUMED",
    intent: {
      actors: [{ id: "0", lifetime: "9007199254740999" }],
      actorTacticalBindings: [{ actor: { id: "0", lifetime: "9007199254740999" }, descriptorRevision, queueRevisions: [{ domain: "QUEUE_DOMAIN_ACTOR_ORDER", revision: queueRevision }] }],
      reclaimFeature: { target: { id: "0", lifetime: featureLifetime }, queuePolicy: "TACTICAL_QUEUE_POLICY_REJECT_IF_BUSY" }
    }
  }],
  ["tactical-guest-queue-remove-response", v1.LiveGuestResponse, {
    inputId, sessionId: controller.sessionId, moduleGeneration: moduleIdentity.generation, basis,
    acknowledgment: "GUEST_ACK_STATUS_CONSUMED",
    intent: {
      actors: [{ id: "0", lifetime: "9007199254740999" }],
      actorTacticalBindings: [{ actor: { id: "0", lifetime: "9007199254740999" }, descriptorRevision, queueRevisions: [{ domain: "QUEUE_DOMAIN_FACTORY_PRODUCTION", revision: queueRevision }] }],
      queueEdit: { expectedQueueRevision: queueRevision, kind: "QUEUE_EDIT_KIND_REMOVE_TAG", domain: "QUEUE_DOMAIN_FACTORY_PRODUCTION", removeNativeTag: 2147483647 }
    }
  }],
  ["tactical-guest-unknown-action-response", v1.LiveGuestResponse, {
    inputId, sessionId: controller.sessionId, moduleGeneration: moduleIdentity.generation, basis,
    acknowledgment: "GUEST_ACK_STATUS_CONSUMED",
    intent: {
      actors: [{ id: "0", lifetime: "9007199254740999" }],
      actorTacticalBindings: [{ actor: { id: "0", lifetime: "9007199254740999" }, descriptorRevision, queueRevisions: [{ domain: "QUEUE_DOMAIN_ACTOR_ORDER", revision: queueRevision }] }],
      queueEdit: { expectedQueueRevision: queueRevision, kind: "QUEUE_EDIT_KIND_INSERT", domain: "QUEUE_DOMAIN_ACTOR_ORDER", insert: { beforeNativeTag: 41, action: 99, position: { x: 1, z: 2 } } }
    }
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
  if (name === "live-guest-manual-select-request") {
    assert.equal(decoded.manualInput.select.actors[0].id.toString(), "0");
    assert.equal(decoded.manualInput.select.actors[1].id.toString(), "31999");
  }
  if (name === "live-guest-manual-move-request") {
    assert.equal(decoded.manualInput.action.actors.length, 1);
    assert.equal(decoded.manualInput.action.actors[0].id.toString(), "0");
    assert.deepEqual(Buffer.from(decoded.inputId), inputId);
    assert.deepEqual(Buffer.from(decoded.basis.token), basis.token);
    assert.equal(decoded.moduleGeneration.toString(), moduleIdentity.generation);
  }
  if (name === "live-result-feedback") {
    assert.equal(decoded.result.actor.id.toString(), "0");
    assert.equal(decoded.result.resultSequence.toString(), "9007199254741005");
    assert.deepEqual(Buffer.from(decoded.result.inputId), inputId);
    assert.deepEqual(Buffer.from(decoded.result.basis.token), basis.token);
  }
  if (name === "tactical-observation") {
    assert.equal(decoded.observation.tactical.features[0].reference.id.toString(), "0");
    assert.equal(decoded.observation.tactical.features[0].reference.lifetime.toString(), featureLifetime);
    assert.equal(decoded.observation.tactical.actors[0].queue[0].revision.toString(), queueRevision);
    assert.equal(decoded.observation.tactical.economy.energy._incomePerSecond, undefined);
  }
  if (name === "tactical-guest-build-response") {
    assert.equal(decoded.intent.build.definitionId, 710);
    assert.equal(decoded.intent.build.facing, v1.BuildFacing.BUILD_FACING_WEST);
    assert.equal(decoded.intent.actorTacticalBindings[0].descriptorRevision.toString(), descriptorRevision);
  }
  if (name === "tactical-guest-feature-reclaim-response") {
    assert.equal(decoded.intent.reclaimFeature.target.id.toString(), "0");
    assert.equal(decoded.intent.reclaimFeature.target.lifetime.toString(), featureLifetime);
  }
  if (name === "tactical-guest-unknown-action-response") {
    assert.equal(decoded.intent.queueEdit.insert.action, 99);
  }
  const canonical = canonicalObject(type, bytes);
  const semanticBytes = Buffer.from(`${JSON.stringify(canonical, null, 2)}\n`);
  writeFileSync(resolve(wire, `${name}.bin`), bytes);
  writeFileSync(resolve(semantic, `${name}.json`), semanticBytes);
  entries.push({ name, type: type.$type?.fullName ?? type.name, wireSha256: createHash("sha256").update(bytes).digest("hex"), semanticSha256: createHash("sha256").update(semanticBytes).digest("hex") });
}

const mapping = {
  contract: "barc-live-tactical-v1/native-command-mapping",
  rules: [
    { action: "STOP", command: "StopCommand", options: 0, conflictPolicy: "COMMAND_CONFLICT_REPLACE_CURRENT" },
    { action: "MOVE_REPLACE", command: "MoveUnitCommand", options: 0, conflictPolicy: "COMMAND_CONFLICT_REPLACE_CURRENT" },
    { action: "MOVE_APPEND", command: "MoveUnitCommand", options: 32, conflictPolicy: "COMMAND_CONFLICT_QUEUE_AFTER_CURRENT" },
    { action: "ATTACK_VISIBLE_UNIT", command: "AttackCommand", options: 0, conflictPolicy: "COMMAND_CONFLICT_REPLACE_CURRENT", attackAreaReachable: false },
    { action: "BUILD", command: "Unit.Build", typed: true },
    { action: "GUARD", command: "Unit.Guard", typed: true },
    { action: "REPAIR", command: "Unit.Repair", typed: true },
    { action: "RECLAIM_UNIT", command: "Unit.ReclaimUnit", typed: true },
    { action: "RECLAIM_FEATURE", command: "Unit.ReclaimFeature", typed: true, rawCustomCommandForbidden: true },
    { action: "RECLAIM_AREA", command: "Unit.ReclaimInArea", typed: true },
    { action: "FACTORY_PRODUCE", command: "Unit.Build", perChildCount: 1, modifierMultipliersForbidden: true },
    { action: "SET_RALLY", command: "factory-produced-unit Move", distinctFromBuild: true },
    { action: "QUEUE_REMOVE_TAG", command: "CMD_REMOVE", exactNativeTag: true },
    { action: "BAR_CONSTRUCTION_PRIORITY", descriptorCommandId: 34571, values: [0, 1], runtimeDescriptorRequired: true },
    { action: "BAR_CLOAK_DESIRE", descriptorCommandId: 37382, values: [0, 1], runtimeDescriptorRequired: true }
  ],
  invalid: ["missing-unit-reference", "zero-lifetime", "duplicate-actor", "actor-is-attack-target", "basis-mismatch", "input-id-mismatch", "module-generation-mismatch", "non-visual-attack-target", "live-wrapper-with-zero-or-multiple-native-commands", "unreserved-worst-case-child-results", "unknown-tactical-action", "unknown-queue-domain", "incomplete-catalogue", "descriptor-or-queue-revision-mismatch"]
};
const mappingBytes = Buffer.from(`${JSON.stringify(mapping, null, 2)}\n`);
writeFileSync(resolve(semantic, "native-command-mapping.json"), mappingBytes);

const negotiation = {
  contract: "barc-live-v1/negotiation",
  cases: [
    { peer: "preview-v1-client", requestedProfile: "barc-preview-v1", endpoint: "preview", outcome: "ACCEPT" },
    { peer: "preview-v1-client", requestedProfile: "barc-live-v1", endpoint: "live", outcome: "REFUSE_BEFORE_LIVE_ENVELOPE" },
    { peer: "live-v1-client", requestedProfile: "barc-live-v1", endpoint: "live", nativeProtocol: "LIVE_CONTROL_PROTOCOL_V1", outcome: "ACCEPT" },
    { peer: "live-v1-client", requestedProfile: "barc-live-v1", endpoint: "live", nativeProtocol: "LIVE_CONTROL_PROTOCOL_UNSPECIFIED", outcome: "REFUSE_BEFORE_ARM" },
    { peer: "live-v1-client", requestedProfile: "barc-live-tactical-v1", endpoint: "live", nativeProtocol: "LIVE_CONTROL_PROTOCOL_V1", outcome: "REFUSE_TACTICAL_BEFORE_ARM" },
    { peer: "tactical-v1-client", requestedProfile: "barc-live-tactical-v1", endpoint: "live", nativeProtocol: "LIVE_CONTROL_PROTOCOL_TACTICAL_V1", tacticalRevision: 1, catalogueComplete: true, outcome: "ACCEPT" },
    { peer: "tactical-v1-client", requestedProfile: "barc-live-tactical-v1", endpoint: "live", nativeProtocol: "LIVE_CONTROL_PROTOCOL_TACTICAL_V1", tacticalRevision: 1, catalogueComplete: false, outcome: "REFUSE_TACTICAL_ACTIONS" }
  ]
};
const negotiationBytes = Buffer.from(`${JSON.stringify(negotiation, null, 2)}\n`);
writeFileSync(resolve(semantic, "negotiation.json"), negotiationBytes);

const schema = readFileSync(resolve(root, "../../src/Broker.Browser.Contracts/barc_live.proto"));
const nativeProto = resolve(root, "../../src/Broker.Contracts/highbar/live_control.proto");
const protoc = resolve(root, "../../eng/protoc");
const nativeEntries = ["live-capabilities", "live-snapshot-metadata", "tactical-catalogue", "tactical-snapshot"].map(name => {
  const text = readFileSync(resolve(native, `${name}.textproto`));
  const bytes = execFileSync(protoc, [
    `--proto_path=${resolve(root, "../../src/Broker.Contracts")}`,
    "--encode=highbar.v1.LiveStateReport",
    nativeProto
  ], { input: text });
  writeFileSync(resolve(wire, `${name}.bin`), bytes);
  return {
    name,
    type: "highbar.v1.LiveStateReport",
    wireSha256: createHash("sha256").update(bytes).digest("hex"),
    semanticSha256: createHash("sha256").update(text).digest("hex")
  };
});
const manifest = {
  schema: "barc.browser.v1/barc-live-tactical-v1",
  schemaSha256: createHash("sha256").update(schema).digest("hex"),
  mappingSha256: createHash("sha256").update(mappingBytes).digest("hex"),
  negotiationSha256: createHash("sha256").update(negotiationBytes).digest("hex"),
  legacyWirePins: {
    liveBootstrap: "a6b26c69ef7257123dc18435ad8600ea3c06d0ce077c5d9d5a5e66ec417e9c55",
    liveGuestManualSelectRequest: "83a4315dc11e6250749f46121710388a13feaab10b5bdfe21a1c04cffa0b2bd8",
    liveGuestManualMoveRequest: "7aae04dc94eaf89b79a129fe4c741105e5cb18b83c0eacf08610eee6c75fda84",
    liveGuestId0MoveResponse: "56633725cd25c6c7846f3615f33e4608135a23756de27e34ac5d80d7c3bba121",
    liveGuestAttackResponse: "047284d0f5f865300b7fc89f28a7d5b29731229ae19f68f768f19d5fd4a50930",
    liveResultFeedback: "cebf475de2e710f5c0809c973045bdaa5f556f0a3fce667dc4f601ef041b0dbe"
  },
  entries: [...entries, ...nativeEntries]
};
for (const [legacyName, expected] of Object.entries(manifest.legacyWirePins)) {
  const entryName = legacyName.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
  const entry = manifest.entries.find(value => value.name === entryName);
  assert.equal(entry?.wireSha256, expected, `${entryName} legacy wire bytes changed`);
}
const manifestBytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(resolve(root, "manifest.json"), manifestBytes);
console.log(createHash("sha256").update(manifestBytes).digest("hex"));
