import { canonicalObject, encodeObject, v1 } from "../Broker.Browser.Contracts/generated/codec.js";
import { GuestSupervisor } from "../Broker.Browser.Wasm/index.js";

const LEGACY_PROFILE = "barc-live-v1", TACTICAL_PROFILE = "barc-live-tactical-v1";
const MAX_FRAME = 64 * 1024, MAX_ACTORS = 64, MAX_MODULE = 8 * 1024 * 1024, MAX_QUEUE = 8;
const finite = value => typeof value === "number" && Number.isFinite(value);
const decimal = value => typeof value === "string" && /^(?:0|[1-9][0-9]*)$/.test(value);
const refId = reference => reference?.id ?? "0";
const refKey = reference => `${refId(reference)}:${reference?.lifetime ?? ""}`;
const sameRef = (left, right) => refKey(left) === refKey(right);
const presentRef = (reference, limit) => reference && decimal(refId(reference)) && decimal(reference.lifetime)
  && reference.lifetime !== "0" && BigInt(refId(reference)) <= BigInt(limit);
const bytes = (length = 16) => { const value = crypto.getRandomValues(new Uint8Array(length)); let binary = ""; for (const byte of value) binary += String.fromCharCode(byte); return btoa(binary); };
const hexBase64 = hex => { const value = Uint8Array.from(hex.match(/../g), pair => Number.parseInt(pair, 16)); let binary = ""; for (const byte of value) binary += String.fromCharCode(byte); return btoa(binary); };

function uuidBytesBase64(value) {
  const match = /^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})$/i.exec(value.trim());
  if (!match) throw new Error("Session must be a canonical UUID.");
  const groups = match.slice(1), ordered = [groups[0].match(/../g).reverse(), groups[1].match(/../g).reverse(), groups[2].match(/../g).reverse(), groups[3].match(/../g), groups[4].match(/../g)].flat();
  let binary = ""; for (const pair of ordered) binary += String.fromCharCode(Number.parseInt(pair, 16)); return btoa(binary);
}

function validateBasis(value) {
  if (!value?.token || !decimal(value.stateSequence) || !Number.isInteger(value.nativeFrame) || !value.matchId
      || !value.processIncarnation || !value.stateChannelIncarnation) throw new Error("live observation basis is incomplete");
}
function validateTacticalBootstrap(value) {
  const caps = value.capabilities?.tactical, catalogue = value.tacticalCatalogue;
  if (!caps || caps.profile !== TACTICAL_PROFILE || caps.revision !== 1 || caps.maxCatalogueEntries < 1 || caps.maxCataloguePageEntries < 1
      || caps.maxBuildOptionsPerActor < 1 || caps.maxQueueEntriesPerActor < 1 || caps.maxFeatureReferences < 1
      || caps.maxFactoryProductionCount < 1 || caps.maxAreaRadiusWorldUnits < 1 || caps.maxCommandDescriptorsPerActor < 1) throw new Error("tactical capabilities are incomplete");
  if (!catalogue || catalogue.profile !== TACTICAL_PROFILE || catalogue.revision !== 1 || !catalogue.complete || !catalogue.catalogueId
      || !decimal(catalogue.catalogueRevision) || catalogue.catalogueRevision === "0" || !catalogue.content?.engineVersion
      || !catalogue.content?.gameName || !catalogue.content?.gameVersion || !catalogue.content?.gameContentSha256
      || !Array.isArray(catalogue.definitions) || catalogue.definitions.length > caps.maxCatalogueEntries) throw new Error("tactical catalogue is incomplete");
  const ids = new Set();
  for (const definition of catalogue.definitions) {
    if (!Number.isInteger(definition.definitionId) || definition.definitionId < 1 || ids.has(definition.definitionId)
        || !definition.internalName || !definition.displayName || definition.footprintXCells < 1 || definition.footprintZCells < 1
        || !Array.isArray(definition.buildOptionDefinitionIds) || definition.buildOptionDefinitionIds.length > caps.maxBuildOptionsPerActor) throw new Error("tactical definition is invalid or duplicated");
    ids.add(definition.definitionId);
  }
}
function validateBootstrap(value, pairedSession, requestedProfile) {
  if (!value || value.liveProfile !== requestedProfile || value.preview?.profile !== requestedProfile || value.preview?.sessionId !== pairedSession
      || ![LEGACY_PROFILE, TACTICAL_PROFILE].includes(requestedProfile)) throw new Error("live bootstrap identity/profile is invalid");
  const limits = value.limits, caps = value.capabilities, bounds = caps?.mapBounds;
  if (!limits || limits.maxActorCount < 1 || limits.maxActorCount > MAX_ACTORS || limits.maxInputBytes < 1 || limits.maxInputBytes > MAX_FRAME
      || limits.maxOutputBytes < 1 || limits.maxOutputBytes > MAX_FRAME || limits.maxFrameBytes < 1 || limits.maxFrameBytes > MAX_FRAME
      || limits.maxPendingInputs < 1 || limits.maxPendingInputs > MAX_QUEUE || limits.maxModuleBytes < 1 || limits.maxModuleBytes > MAX_MODULE
      || limits.guestPhaseTimeoutMs !== 250 || limits.maxObservationAgeMs < 250 || limits.liveSnapshotCadenceFrames < 1
      || limits.maxNativeUnitId !== 31999 || limits.maxPendingParents < 1 || limits.maxRetainedResults < 1) throw new Error("live limits are unsupported");
  if (!caps.stop || !caps.move || !caps.attackVisibleUnit || !bounds || !finite(bounds.minX ?? 0) || !finite(bounds.maxX)
      || !finite(bounds.minZ ?? 0) || !finite(bounds.maxZ) || bounds.maxX <= (bounds.minX ?? 0) || bounds.maxZ <= (bounds.minZ ?? 0)) throw new Error("live capabilities or map bounds are invalid");
  if (!value.controller?.sessionId || value.controller.sessionId !== pairedSession || !value.controller.controllerId
      || !value.controller.controllerIncarnation || !decimal(value.controller.authorityEpoch) || value.controller.authorityEpoch === "0") throw new Error("live controller identity is invalid");
  if (requestedProfile === TACTICAL_PROFILE) validateTacticalBootstrap(value);
}
function validateObservation(value, bootstrap) {
  if (!value?.preview || value.preview.sessionId !== bootstrap.preview.sessionId) throw new Error("live observation session mismatch");
  validateBasis(value.basis);
  if (!Array.isArray(value.preview.units) || value.preview.units.length > bootstrap.limits.maxActorCount
      || !Array.isArray(value.units) || value.units.length > bootstrap.limits.maxActorCount) throw new Error("live observation exceeds its unit bound");
  const previewIds = new Map();
  for (const unit of value.preview.units) {
    const id = unit.id ?? "0";
    if (!decimal(id) || BigInt(id) > BigInt(bootstrap.limits.maxNativeUnitId) || previewIds.has(id)
        || !unit.position || !finite(unit.position.x ?? 0) || !finite(unit.position.z ?? 0)) throw new Error("preview observation unit is invalid or duplicated");
    previewIds.set(id, unit);
  }
  const ids = new Set();
  for (const unit of value.units) {
    if (!presentRef(unit.reference, bootstrap.limits.maxNativeUnitId) || ids.has(refId(unit.reference))) throw new Error("live observation reference is invalid or duplicated");
    ids.add(refId(unit.reference));
    if (!["OBSERVATION_KIND_OWN", "OBSERVATION_KIND_VISUAL", "OBSERVATION_KIND_RADAR"].includes(unit.observation)) throw new Error("live observation kind is invalid");
    const preview = previewIds.get(refId(unit.reference));
    if (!preview || preview.observation !== unit.observation) throw new Error("live and preview observation units disagree");
  }
  if (bootstrap.liveProfile === TACTICAL_PROFILE) {
    const tactical = value.tactical, caps = bootstrap.capabilities.tactical, catalogue = bootstrap.tacticalCatalogue;
    if (!tactical || tactical.catalogueId !== catalogue.catalogueId || tactical.catalogueRevision !== catalogue.catalogueRevision
        || !Array.isArray(tactical.actors) || tactical.actors.length > bootstrap.limits.maxActorCount
        || !Array.isArray(tactical.features) || tactical.features.length > caps.maxFeatureReferences) throw new Error("tactical observation catalogue or bounds are invalid");
    if (tactical.economy) {
      if (tactical.economy.perspectiveId !== value.preview.perspectiveId || tactical.economy.sampleFrame !== value.basis.nativeFrame) throw new Error("tactical economy basis is invalid");
      for (const resource of [tactical.economy.metal, tactical.economy.energy]) if (resource && (!resource.resourceName || !resource.unit)) throw new Error("tactical economy units are missing");
    }
    const actorKeys = new Set();
    for (const actor of tactical.actors) {
      if (!presentRef(actor.actor, bootstrap.limits.maxNativeUnitId) || actorKeys.has(refKey(actor.actor)) || !decimal(actor.descriptorRevision) || actor.descriptorRevision === "0"
          || !value.units.some(unit => unit.observation === "OBSERVATION_KIND_OWN" && sameRef(unit.reference, actor.actor))
          || !Array.isArray(actor.descriptors) || actor.descriptors.length > caps.maxCommandDescriptorsPerActor || !Array.isArray(actor.queue)) throw new Error("tactical actor binding is invalid");
      actorKeys.add(refKey(actor.actor)); const domains = new Set();
      for (const queue of actor.queue) {
        if (!decimal(queue.revision) || (queue.complete && queue.revision === "0") || domains.has(queue.domain)
            || !["QUEUE_DOMAIN_ACTOR_ORDER","QUEUE_DOMAIN_FACTORY_PRODUCTION","QUEUE_DOMAIN_FACTORY_RALLY"].includes(queue.domain)
            || !Array.isArray(queue.entries) || queue.entries.length > caps.maxQueueEntriesPerActor) throw new Error("tactical queue metadata is invalid");
        domains.add(queue.domain);
      }
    }
    const featureKeys = new Set();
    for (const feature of tactical.features) {
      if (!feature.reference || !decimal(feature.reference.id ?? "0") || !decimal(feature.reference.lifetime) || feature.reference.lifetime === "0"
          || featureKeys.has(refKey(feature.reference)) || !feature.position || !finite(feature.position.x ?? 0) || !finite(feature.position.z ?? 0)) throw new Error("tactical feature reference is invalid or duplicated");
      featureKeys.add(refKey(feature.reference));
    }
  }
}
function descriptorFor(observation, actor, kind) {
  return observation.tactical?.actors?.find(value => sameRef(value.actor, actor))?.descriptors?.find(value => value.kind === kind && !value.disabled);
}
const tacticalKind = action => ({build:"TACTICAL_DESCRIPTOR_BUILD",guard:"TACTICAL_DESCRIPTOR_GUARD",repair:"TACTICAL_DESCRIPTOR_REPAIR",reclaimUnit:"TACTICAL_DESCRIPTOR_RECLAIM_UNIT",reclaimFeature:"TACTICAL_DESCRIPTOR_RECLAIM_FEATURE",reclaimArea:"TACTICAL_DESCRIPTOR_RECLAIM_AREA",factoryProduce:"TACTICAL_DESCRIPTOR_FACTORY_PRODUCE",setRally:"TACTICAL_DESCRIPTOR_SET_RALLY",tacticalMode:null}[action]);
function validateIntent(intent, observation, bootstrap) {
  if (!intent || !Array.isArray(intent.actors) || intent.actors.length < 1 || intent.actors.length > bootstrap.limits.maxActorCount) throw new Error("guest live intent actor count is invalid");
  const keys = new Set();
  for (const actor of intent.actors) {
    if (!presentRef(actor, bootstrap.limits.maxNativeUnitId) || keys.has(refId(actor))) throw new Error("guest live actor is invalid or duplicated");
    keys.add(refId(actor));
    if (!observation.units.some(unit => unit.observation === "OBSERVATION_KIND_OWN" && sameRef(unit.reference, actor))) throw new Error("guest live actor is not owned at its acknowledged basis");
  }
  if (intent.action === "move") {
    const p = intent.move?.position, b = bootstrap.capabilities.mapBounds;
    if (!p || !finite(p.x ?? 0) || !finite(p.z ?? 0) || (Object.hasOwn(p, "elevation") && !finite(p.elevation))
        || (p.x ?? 0) < (b.minX ?? 0) || (p.x ?? 0) > b.maxX || (p.z ?? 0) < (b.minZ ?? 0) || (p.z ?? 0) > b.maxZ
        || !["MOVE_POLICY_REPLACE", "MOVE_POLICY_APPEND"].includes(intent.move.policy)) throw new Error("guest live Move is invalid or outside map bounds");
  } else if (intent.action === "attack") {
    const target = intent.attack?.target;
    if (!presentRef(target, bootstrap.limits.maxNativeUnitId) || keys.has(refId(target))
        || !observation.units.some(unit => unit.observation === "OBSERVATION_KIND_VISUAL" && sameRef(unit.reference, target))) throw new Error("guest live Attack target is not currently visual");
  } else if (intent.action === "stop") return;
  else {
    if (bootstrap.liveProfile !== TACTICAL_PROFILE || !observation.tactical) throw new Error("guest tactical action was not negotiated");
    if (!Array.isArray(intent.actorTacticalBindings) || intent.actorTacticalBindings.length !== intent.actors.length) throw new Error("guest tactical actor bindings are incomplete");
    for (let i = 0; i < intent.actors.length; i++) {
      const actor = intent.actors[i], binding = intent.actorTacticalBindings[i], state = observation.tactical.actors.find(value => sameRef(value.actor, actor));
      if (!state || !sameRef(binding?.actor, actor) || binding.descriptorRevision !== state.descriptorRevision) throw new Error("guest tactical descriptor binding is stale");
      for (const queue of binding.queueRevisions ?? []) if (!state.queue.some(value => value.domain === queue.domain && value.revision === queue.revision && value.complete)) throw new Error("guest tactical queue binding is stale");
      const kind = intent.action === "queueEdit" ? ({QUEUE_EDIT_KIND_INSERT:"TACTICAL_DESCRIPTOR_QUEUE_INSERT",QUEUE_EDIT_KIND_REMOVE_TAG:"TACTICAL_DESCRIPTOR_QUEUE_REMOVE",QUEUE_EDIT_KIND_SET_REPEAT:"TACTICAL_DESCRIPTOR_QUEUE_REPEAT"}[intent.queueEdit?.kind])
        : intent.action === "tacticalMode" ? intent.tacticalMode?.kind : tacticalKind(intent.action);
      if (!kind || !descriptorFor(observation, actor, kind)) throw new Error("guest tactical action is unavailable for an actor");
    }
    const catalogue = bootstrap.tacticalCatalogue;
    if (["build","factoryProduce"].includes(intent.action)) {
      const value = intent[intent.action], definition = catalogue.definitions.find(item => item.definitionId === value?.definitionId);
      if (!definition || value.catalogueId !== catalogue.catalogueId || value.catalogueRevision !== catalogue.catalogueRevision
          || intent.actors.some(actor => !descriptorFor(observation, actor, tacticalKind(intent.action))?.allowedDefinitionIds?.includes(value.definitionId))) throw new Error("guest tactical definition or catalogue binding is invalid");
    }
    if (intent.action === "reclaimFeature" && !observation.tactical.features.some(value => refKey(value.reference) === refKey(intent.reclaimFeature?.target))) throw new Error("guest tactical feature lifetime is stale");
    if (["guard","repair","reclaimUnit"].includes(intent.action) && !observation.units.some(value => value.observation === "OBSERVATION_KIND_OWN" && sameRef(value.reference,intent[intent.action]?.target))) throw new Error("guest tactical friendly target is stale");
    if (intent.action === "tacticalMode" && intent.actors.some(actor => !descriptorFor(observation, actor, intent.tacticalMode.kind)?.allowedModeValues?.includes(intent.tacticalMode.value))) throw new Error("guest tactical mode value is unavailable");
    if (intent.action === "queueEdit") { const edit=intent.queueEdit,state=observation.tactical.actors.find(value=>sameRef(value.actor,intent.actors[0])),queue=state?.queue?.find(value=>value.domain===edit?.domain); if(!["QUEUE_EDIT_KIND_INSERT","QUEUE_EDIT_KIND_REMOVE_TAG","QUEUE_EDIT_KIND_SET_REPEAT"].includes(edit?.kind)||!queue?.complete||queue.revision!==edit.expectedQueueRevision) throw new Error("guest tactical queue edit is unknown or stale"); }
  }
}

export function correlateLiveGuestResponse(bytes, request, allowIntent = true) {
  const response = canonicalObject(v1.LiveGuestResponse, Uint8Array.from(bytes));
  if (response.inputId !== request.inputId || response.sessionId !== request.sessionId || response.moduleGeneration !== request.moduleGeneration
      || JSON.stringify(response.basis) !== JSON.stringify(request.basis) || response.acknowledgment !== "GUEST_ACK_STATUS_CONSUMED") throw new Error("Guest live response identity mismatch.");
  if (!allowIntent && response.intent) throw new Error("Guest initialization acknowledgment contained an action.");
  return response;
}

export function validateLiveControllerState(state, bootstrap, moduleIdentity) {
  if (!bootstrap || !moduleIdentity || JSON.stringify(state?.controller) !== JSON.stringify(bootstrap.controller)
      || JSON.stringify(state?.module) !== JSON.stringify(moduleIdentity)) throw new Error("controller state identity mismatch");
}

export class LiveQueue {
  constructor(supervisor, result, failure) { this.supervisor = supervisor; this.result = result; this.failure = failure; this.items = []; this.running = false; this.epoch = 0; }
  reset() { this.epoch++; this.items.length = 0; this.supervisor.disarm(); }
  fail(reason) { this.failure(reason); }
  enqueue(item) {
    if (item.kind === "observation" && this.items.at(-1)?.kind === "observation") this.items[this.items.length - 1] = item; else this.items.push(item);
    if (this.items.length > MAX_QUEUE) return this.fail("Live guest input queue overflowed; explicit rearm is required.");
    void this.drain();
  }
  async drain() { if (this.running) return; this.running = true;
    try {
      while (this.items.length) { const item = this.items.shift(), epoch = this.epoch; const result = await this.supervisor.process(item.bytes);
        if (epoch !== this.epoch) continue; if (result.state !== "completed") { this.fail(`Guest ${result.state}: ${result.reason}`); break; } this.result(item, result); }
    } finally { this.running = false; if (this.items.length) void this.drain(); }
  }
}

const svg = (name, attributes = {}) => { const element = document.createElementNS("http://www.w3.org/2000/svg", name); for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value); return element; };

export function createLiveRuntime(root, options, emit) {
  if (!(root instanceof Element)) throw new Error("BARC live mount root must be an Element");
  const assetBase = new URL(options.assetBaseUrl); if (!assetBase.href.endsWith("/")) throw new Error("assetBaseUrl must end with /");
  const requestedProfile = options.profile ?? LEGACY_PROFILE, tacticalProfile = requestedProfile === TACTICAL_PROFILE;
  const supervisor = new GuestSupervisor({ workerUrl: new URL("src/Broker.Browser.Wasm/guest-worker.js", assetBase), limits: { phaseTimeoutMilliseconds: 250 } });
  let socket = null, disposed = false, pairedSession = null, bootstrap = null, observation = null, moduleBytes = null, moduleName = "No guest loaded", moduleIdentity = null;
  let selected = [], target = { x: 0, z: 0 }, attackTarget = null, friendlyTarget = null, featureTarget = null, movePolicy = "MOVE_POLICY_REPLACE", controllerStage = "CONTROLLER_STAGE_UNSPECIFIED";
  let connectionGeneration = 0, lifecycleEpoch = 0, composing = false, pointerId = null, pointerUnit = null, pointerCycle = null, selectionCursor = -1, protocolRefused = false;
  let lastObservationSequence = 0n, lastResultSequence = 0n; const pendingParents = new Map();

  root.classList.add("barc-preview", "barc-live");
  root.innerHTML = `<section class="barc-shell" aria-label="BARC live tactical control"><header><div><strong>BARC live tactical control</strong><span class="readonly">explicit authority</span></div><div class="status" role="status">unpaired</div></header>
  <form class="pairing"><label>Gateway <input name="gateway" type="url" autocomplete="off"></label><label>Session UUID <input name="session" autocomplete="off"></label><label>One-time credential <input name="credential" type="password" autocomplete="off"></label><button>Pair</button></form>
  <div class="toolbar"><button data-guest="manual">Manual guest</button><button data-guest="custom">Custom guest</button><button data-action="import">Import .wasm</button><input data-file type="file" accept=".wasm,application/wasm" hidden><button data-action="rearm">Arm live</button><button data-action="disarm">Revoke</button></div>
  <div class="module" aria-live="polite"></div><div class="target-controls"><label>Target X <input name="target-x" type="number" step="0.25" value="0"></label><label>Target Z <input name="target-z" type="number" step="0.25" value="0"></label><label>Move policy <select name="move-policy"><option value="MOVE_POLICY_REPLACE">Replace</option><option value="MOVE_POLICY_APPEND">Append</option></select></label><button data-action="move">Move</button><button data-action="stop">Stop</button><button data-action="attack">Attack visible target</button></div>
  <fieldset class="tactical-controls" ${tacticalProfile ? "" : "hidden"}><legend>Tactical command</legend><label>Action <select name="tactical-action"><option value="build">Build</option><option value="guard">Guard friendly</option><option value="repair">Repair friendly</option><option value="reclaimUnit">Reclaim unit</option><option value="reclaimFeature">Reclaim feature</option><option value="reclaimArea">Reclaim area</option><option value="factoryProduce">Factory produce</option><option value="setRally">Set rally</option><option value="queueEdit">Queue edit</option><option value="tacticalMode">BAR mode</option></select></label><label>Definition <select name="definition"></select></label><label>Facing <select name="facing"><option>BUILD_FACING_NORTH</option><option>BUILD_FACING_EAST</option><option>BUILD_FACING_SOUTH</option><option>BUILD_FACING_WEST</option></select></label><label>Queue policy <select name="queue-policy"><option>TACTICAL_QUEUE_POLICY_REPLACE</option><option>TACTICAL_QUEUE_POLICY_APPEND</option><option>TACTICAL_QUEUE_POLICY_REJECT_IF_BUSY</option></select></label><label>Count <input name="production-count" type="number" min="1" value="1"></label><label>Area radius <input name="area-radius" type="number" min="0.25" step="0.25" value="64"></label><label>Queue domain <select name="queue-domain"><option>QUEUE_DOMAIN_ACTOR_ORDER</option><option>QUEUE_DOMAIN_FACTORY_PRODUCTION</option><option>QUEUE_DOMAIN_FACTORY_RALLY</option></select></label><label>Queue operation <select name="queue-operation"><option value="insert">Insert Move before selected tag</option><option value="remove">Remove selected tag</option><option value="repeat-on">Repeat on</option><option value="repeat-off">Repeat off</option></select></label><label>Queue entry <select name="queue-entry"></select></label><label>Mode <select name="mode-kind"><option value="TACTICAL_DESCRIPTOR_BAR_CONSTRUCTION_PRIORITY">Construction priority</option><option value="TACTICAL_DESCRIPTOR_BAR_CLOAK_DESIRE">Cloak desire</option></select></label><label>Mode value <select name="mode-value"><option>TACTICAL_MODE_VALUE_ENABLED</option><option>TACTICAL_MODE_VALUE_DISABLED</option></select></label><button data-action="tactical">Send tactical command</button></fieldset>
  <div class="stage"><svg viewBox="0 0 800 520" tabindex="0" aria-label="Live tactical map. Repeated clicks cycle overlapping own actors; Tab selects an own actor; Ctrl plus Tab toggles actors; T cycles a friendly target; F cycles a feature target; arrows set the ground target; Enter confirms the chosen command; S stops; A attacks; B builds; G guards; R repairs; L or U reclaims a unit; X reclaims a feature; C reclaims an area; P produces; Y sets rally; Q edits queue; M changes BAR mode."><g class="features"></g><g class="units"></g><g class="intent"></g></svg><aside><div class="authority"></div><div class="selection"></div><div class="target" aria-live="polite"></div><div class="catalogue"></div><div class="economy"></div><div class="queue-state"></div><div class="result"></div><div class="diagnostic"></div></aside></div></section>`;
  const q = selector => root.querySelector(selector), elements = { form:q("form"), gateway:q("[name=gateway]"), session:q("[name=session]"), credential:q("[name=credential]"), status:q(".status"), module:q(".module"), svg:q("svg"), units:q(".units"), features:q(".features"), authority:q(".authority"), selection:q(".selection"), target:q(".target"), catalogue:q(".catalogue"), economy:q(".economy"), queueState:q(".queue-state"), result:q(".result"), diagnostic:q(".diagnostic"), file:q("[data-file]"), targetX:q("[name=target-x]"), targetZ:q("[name=target-z]"), policy:q("[name=move-policy]"), tacticalAction:q("[name=tactical-action]"), definition:q("[name=definition]"), facing:q("[name=facing]"), queuePolicy:q("[name=queue-policy]"), productionCount:q("[name=production-count]"), areaRadius:q("[name=area-radius]"), queueDomain:q("[name=queue-domain]"), queueOperation:q("[name=queue-operation]"), queueEntry:q("[name=queue-entry]"), modeKind:q("[name=mode-kind]"), modeValue:q("[name=mode-value]") };
  elements.gateway.value = options.initialGatewayUrl ?? ""; elements.session.value = options.initialExpectedSessionId ?? ""; elements.credential.value = options.initialCredential ?? "";
  const notify = (kind, detail = "", value = null) => emit({ kind, detail, value });
  const confirmed = () => controllerStage === "CONTROLLER_STAGE_ARM_NATIVE_CONFIRMED";
  const currentRefs = kind => observation?.units?.filter(unit => unit.observation === kind).map(unit => unit.reference) ?? [];
  const send = value => { if (!socket || socket.readyState !== WebSocket.OPEN) throw new Error("live socket is unavailable"); socket.send(encodeObject(v1.LiveClientEnvelope, value)); };
  const revoke = reason => {
    lifecycleEpoch++; selected = []; selectionCursor = -1; attackTarget = null; friendlyTarget = null; featureTarget = null;
    if (bootstrap && moduleIdentity && ["CONTROLLER_STAGE_ARM_REQUESTED", "CONTROLLER_STAGE_ARM_NATIVE_CONFIRMED"].includes(controllerStage)) {
      controllerStage = "CONTROLLER_STAGE_REVOKE_REQUESTED"; try { send({ revoke: { controller: bootstrap.controller, reason } }); } catch {}
    }
    queue.reset(reason); render(); notify("disarmed", reason);
  };
  const queue = new LiveQueue(supervisor, (item, result) => {
    if (item.connection !== connectionGeneration || item.generation !== supervisor.generation || item.epoch !== lifecycleEpoch) return;
    let response; try { response = correlateLiveGuestResponse(result.output, item.request); }
    catch (error) { return revoke(`Guest live response malformed: ${error.message}`); }
    if (response.intent) {
      try { validateIntent(response.intent, observation, bootstrap); }
      catch (error) { return revoke(error.message); }
      if (!confirmed()) return revoke("Guest produced an action before native authority confirmation.");
      if (pendingParents.size >= bootstrap.limits.maxPendingParents) { elements.result.textContent = "Live parent capacity is full; action was not submitted."; return; }
      const parentId = bytes();
      pendingParents.set(parentId, { inputId:item.request.inputId, controller:bootstrap.controller, module:moduleIdentity, basis:item.request.basis, actors:response.intent.actors, childCount:null, terminalChildren:new Set() });
      try { send({ submit: { parentId, inputId: item.request.inputId, controller: bootstrap.controller, module: moduleIdentity, basis: item.request.basis, intent: response.intent } }); }
      catch (error) { pendingParents.delete(parentId); return revoke(`Live submission failed: ${error.message}`); }
      elements.result.textContent = `Submitted ${response.intent.action} · parent ${parentId}`;
    }
  }, reason => revoke(reason));

  const guestRequest = (input, kind = "input", identity = {}) => {
    if (!moduleIdentity || !bootstrap || !observation) return;
    const request = { inputId: identity.inputId ?? bytes(), sessionId: bootstrap.preview.sessionId, moduleGeneration: moduleIdentity.generation, basis: identity.basis ?? observation.basis, ...input };
    const encoded = encodeObject(v1.LiveGuestRequest, request);
    if (encoded.byteLength > bootstrap.limits.maxInputBytes) return revoke("Live guest input exceeds its negotiated byte limit.");
    queue.enqueue({ kind, bytes: encoded, request, connection: connectionGeneration, generation: supervisor.generation, epoch: lifecycleEpoch });
  };
  const select = (source, actors, modifiers = {}) => { if (!confirmed()) return; selected = actors.slice(0, MAX_ACTORS); guestRequest({ manualInput: { source, modifiers, select: { actors: selected } } }); render(); };
  const toggleSelection = (source, actor, modifiers) => {
    const index=selected.findIndex(value=>sameRef(value,actor));
    const next=index>=0?selected.filter((_,candidate)=>candidate!==index):selected.length<MAX_ACTORS?[...selected,actor]:selected;
    if(next.length!==selected.length)select(source,next,modifiers);
  };
  const pointerActor = (event, fallback) => {
    if (fallback?.observation !== "OBSERVATION_KIND_OWN") { pointerCycle = null; return fallback; }
    const point = elements.svg.createSVGPoint(); point.x = event.clientX; point.y = event.clientY;
    const local = point.matrixTransform(elements.svg.getScreenCTM().inverse());
    const candidates = [...elements.units.querySelectorAll("circle.unit.own")]
      .filter(shape => Math.hypot(Number(shape.getAttribute("cx")) - local.x, Number(shape.getAttribute("cy")) - local.y) <= Number(shape.getAttribute("r")))
      .map(shape => observation?.units.find(value => refKey(value.reference) === shape.dataset.liveRef))
      .filter(Boolean)
      .sort((left,right) => BigInt(refId(left.reference)) < BigInt(refId(right.reference)) ? -1
        : BigInt(refId(left.reference)) > BigInt(refId(right.reference)) ? 1
        : BigInt(left.reference.lifetime) < BigInt(right.reference.lifetime) ? -1
        : BigInt(left.reference.lifetime) > BigInt(right.reference.lifetime) ? 1 : 0);
    if (candidates.length < 2) { pointerCycle = null; return fallback; }
    const key = candidates.map(value => refKey(value.reference)).join("|");
    const prior = pointerCycle?.key === key ? candidates.findIndex(value => refKey(value.reference) === pointerCycle.reference) : -1;
    const next = prior >= 0 ? candidates[(prior + 1) % candidates.length] : fallback;
    pointerCycle = { key, reference:refKey(next.reference) };
    return next;
  };
  const action = (source, intent, modifiers = {}) => { if (!confirmed() || selected.length === 0) return; guestRequest({ manualInput: { source, modifiers, action: { actors: selected, ...intent } } }); };
  const move = (source, position, append = false) => { const b = bootstrap?.capabilities?.mapBounds; if (!b) return; const x = Math.min(b.maxX, Math.max(b.minX ?? 0, position.x)), z = Math.min(b.maxZ, Math.max(b.minZ ?? 0, position.z)); target = { x, z }; movePolicy = append ? "MOVE_POLICY_APPEND" : elements.policy.value; action(source, { move: { position: target, policy: movePolicy } }, { shift: movePolicy === "MOVE_POLICY_APPEND" }); render(); };
  const stop = source => action(source, { stop: {} });
  const attack = source => { if (attackTarget) action(source, { attack: { target: attackTarget } }); };
  const actorState = actor => observation?.tactical?.actors?.find(value => sameRef(value.actor, actor));
  const domainFor = kind => kind === "factoryProduce" ? "QUEUE_DOMAIN_FACTORY_PRODUCTION" : kind === "setRally" ? "QUEUE_DOMAIN_FACTORY_RALLY" : kind === "queueEdit" ? elements.queueDomain.value : "QUEUE_DOMAIN_ACTOR_ORDER";
  const tacticalBindings = domain => selected.map(actor => { const state = actorState(actor), queue = state?.queue?.find(value => value.domain === domain); return { actor, descriptorRevision: state?.descriptorRevision, queueRevisions: queue ? [{ domain, revision: queue.revision }] : [] }; });
  const tacticalAction = source => {
    if (!tacticalProfile || !confirmed() || selected.length === 0) return;
    const kind = elements.tacticalAction.value, domain = domainFor(kind), base = { actorTacticalBindings:tacticalBindings(domain) }, definitionId = Number(elements.definition.value), queuePolicy = elements.queuePolicy.value;
    const required=kind==="tacticalMode"?elements.modeKind.value:kind==="queueEdit"?(elements.queueOperation.value==="insert"?"TACTICAL_DESCRIPTOR_QUEUE_INSERT":elements.queueOperation.value==="remove"?"TACTICAL_DESCRIPTOR_QUEUE_REMOVE":"TACTICAL_DESCRIPTOR_QUEUE_REPEAT"):tacticalKind(kind);
    if(!required||selected.some(actor=>!descriptorFor(observation,actor,required))){elements.result.textContent=`${kind} unavailable: current actor descriptor does not enable it.`;render();return}
    let body;
    if (kind === "build") body = { build:{ definitionId, position:target, facing:elements.facing.value, queuePolicy, catalogueId:bootstrap.tacticalCatalogue.catalogueId, catalogueRevision:bootstrap.tacticalCatalogue.catalogueRevision } };
    else if (["guard","repair","reclaimUnit"].includes(kind)) { if (!friendlyTarget) return; body = { [kind]:{ target:friendlyTarget, queuePolicy } }; }
    else if (kind === "reclaimFeature") { if (!featureTarget) return; body = { reclaimFeature:{ target:featureTarget, queuePolicy } }; }
    else if (kind === "reclaimArea") body = { reclaimArea:{ center:target, radiusWorldUnits:elements.areaRadius.valueAsNumber, queuePolicy } };
    else if (kind === "factoryProduce") body = { factoryProduce:{ definitionId, count:elements.productionCount.valueAsNumber, queuePolicy, catalogueId:bootstrap.tacticalCatalogue.catalogueId, catalogueRevision:bootstrap.tacticalCatalogue.catalogueRevision } };
    else if (kind === "setRally") body = { setRally:{ position:target } };
    else if (kind === "queueEdit") { const state=actorState(selected[0]), queue=state?.queue?.find(value=>value.domain===domain); if(!queue?.complete)return; const op=elements.queueOperation.value, selectedEntry=queue.entries.find(entry=>String(entry.nativeTag)===elements.queueEntry.value); if(op==="remove"&&!selectedEntry)return; body={queueEdit:{expectedQueueRevision:queue.revision,kind:op==="insert"?"QUEUE_EDIT_KIND_INSERT":op==="remove"?"QUEUE_EDIT_KIND_REMOVE_TAG":"QUEUE_EDIT_KIND_SET_REPEAT",domain,...(op==="insert"?{insert:{beforeNativeTag:selectedEntry?.nativeTag??0,action:"LIVE_ACTION_KIND_MOVE",position:target},edit:"insert"}:op==="remove"?{removeNativeTag:selectedEntry.nativeTag,edit:"removeNativeTag"}:{repeat:op==="repeat-on",edit:"repeat"})}}; }
    else if (kind === "tacticalMode") body = { tacticalMode:{ kind:elements.modeKind.value, value:elements.modeValue.value } };
    if (body) action(source, { ...base, ...body });
  };

  async function initializeGuest() {
    if (!moduleBytes || !bootstrap || !observation || observation.preview.validity?.status !== "VALIDITY_STATUS_CURRENT") return revoke("A current live observation and loaded guest are required.");
    queue.reset("Guest generation replaced for explicit live arm."); lifecycleEpoch++; const epoch = lifecycleEpoch, connection = connectionGeneration;
    const loaded = await supervisor.load(moduleBytes); if (loaded.state !== "completed") return revoke(`Module refused during ${loaded.phase}: ${loaded.reason}`);
    if (epoch !== lifecycleEpoch || connection !== connectionGeneration) return supervisor.disarm();
    moduleIdentity = { sha256: hexBase64(loaded.hash), generation: String(supervisor.generation) };
    const request = { inputId: bytes(), sessionId: bootstrap.preview.sessionId, moduleGeneration: moduleIdentity.generation, basis: observation.basis, initialize: { ...bootstrap, module: moduleIdentity } };
    const initialized = await supervisor.initialize(encodeObject(v1.LiveGuestRequest, request));
    if (epoch !== lifecycleEpoch || connection !== connectionGeneration) return supervisor.disarm();
    if (initialized.state !== "completed") return revoke(`Live guest initialization ${initialized.state}: ${initialized.reason}`);
    try { correlateLiveGuestResponse(initialized.output, request, false); }
    catch (error) { return revoke(`Guest initialization acknowledgment refused: ${error.message}`); }
    controllerStage = "CONTROLLER_STAGE_ARM_REQUESTED"; send({ arm: { controller: bootstrap.controller, module: moduleIdentity } }); render();
    guestRequest({ observation }, "observation");
  }
  async function loadModule(name, value) { revoke("Module replacement revoked live authority."); if (value.byteLength > MAX_MODULE) return; moduleBytes = Uint8Array.from(value); moduleName = name; moduleIdentity = null; notify("module", name); render(); }
  async function loadBundled(name) { const response = await fetch(new URL(`guests/${name}-preview.wasm`, assetBase), { cache:"no-store" }); if (!response.ok) return revoke(`Bundled ${name} guest unavailable.`); await loadModule(`${name}-preview.wasm`, new Uint8Array(await response.arrayBuffer())); }

  function handleEnvelope(envelope) {
    if (envelope.body === "bootstrap") {
      const replacement = envelope.bootstrap, isReplacement = Boolean(bootstrap); validateBootstrap(replacement, pairedSession, requestedProfile);
      if (bootstrap) {
        if (!["CONTROLLER_STAGE_REVOKE_NATIVE_CONFIRMED","CONTROLLER_STAGE_EXPIRED","CONTROLLER_STAGE_REFUSED","CONTROLLER_STAGE_UNAVAILABLE"].includes(controllerStage)
            || JSON.stringify(replacement.preview) !== JSON.stringify(bootstrap.preview) || replacement.liveProfile !== bootstrap.liveProfile
            || JSON.stringify(replacement.limits) !== JSON.stringify(bootstrap.limits) || JSON.stringify(replacement.capabilities) !== JSON.stringify(bootstrap.capabilities)
            || replacement.controller.sessionId !== bootstrap.controller.sessionId
            || BigInt(replacement.controller.authorityEpoch) <= BigInt(bootstrap.controller.authorityEpoch)
            || replacement.controller.controllerId === bootstrap.controller.controllerId
            || replacement.controller.controllerIncarnation === bootstrap.controller.controllerIncarnation) throw new Error("replacement live bootstrap identity or negotiation is invalid");
        lifecycleEpoch++; queue.reset(); selected = []; selectionCursor = -1; attackTarget = null; friendlyTarget = null; featureTarget = null; observation = null; moduleIdentity = null; pendingParents.clear(); lastObservationSequence = 0n; lastResultSequence = 0n;
      }
      bootstrap = replacement; controllerStage = "CONTROLLER_STAGE_UNSPECIFIED"; notify("streaming", isReplacement ? "Fresh live authority identity received." : "Authenticated live session; load a guest and request native authority."); render(); return;
    }
    if (envelope.body === "observation") {
      if (!bootstrap) throw new Error("live observation arrived before bootstrap"); validateObservation(envelope.observation, bootstrap);
      observation = envelope.observation; selected = selected.filter(actor => observation.units.some(unit => unit.observation === "OBSERVATION_KIND_OWN" && sameRef(unit.reference, actor)));
      if (attackTarget && !observation.units.some(unit => unit.observation === "OBSERVATION_KIND_VISUAL" && sameRef(unit.reference, attackTarget))) attackTarget = null;
      if (friendlyTarget && !observation.units.some(unit => unit.observation === "OBSERVATION_KIND_OWN" && sameRef(unit.reference, friendlyTarget))) friendlyTarget = null;
      if (featureTarget && !observation.tactical?.features?.some(value => sameRef(value.reference, featureTarget))) featureTarget = null;
      if (observation.preview.validity?.status !== "VALIDITY_STATUS_CURRENT") { revoke("A stale live observation revoked authority."); notify("snapshot", "stale", observation.preview); render(); return; }
      const stateSequence = BigInt(observation.basis.stateSequence);
      if (stateSequence <= lastObservationSequence) throw new Error("live observation sequence did not advance");
      lastObservationSequence = stateSequence;
      notify("snapshot", "current", observation.preview); if (supervisor.active) guestRequest({ observation }, "observation"); render(); return;
    }
    if (envelope.body === "controllerState") {
      const state = envelope.controllerState;
      validateLiveControllerState(state, bootstrap, moduleIdentity);
      controllerStage = state.stage; if (state.stage === "CONTROLLER_STAGE_ARM_NATIVE_CONFIRMED") notify("armed", `Native authority confirmed for epoch ${state.controller.authorityEpoch}.`);
      if (["CONTROLLER_STAGE_REVOKE_NATIVE_CONFIRMED", "CONTROLLER_STAGE_EXPIRED", "CONTROLLER_STAGE_REFUSED", "CONTROLLER_STAGE_UNAVAILABLE"].includes(state.stage)) { queue.reset(state.reason || state.stage); notify("disarmed", state.reason || state.stage); }
      render(); return;
    }
    if (envelope.body === "result") {
      const result = envelope.result, resultSequence = BigInt(result.resultSequence ?? "0"), childIndex = result.childIndex ?? 0, pending = pendingParents.get(result.parentId);
      if (resultSequence <= lastResultSequence || !pending || result.inputId !== pending.inputId || JSON.stringify(result.module) !== JSON.stringify(pending.module)
          || JSON.stringify(result.basis) !== JSON.stringify(pending.basis) || JSON.stringify(result.controller) !== JSON.stringify(pending.controller)
          || result.childCount !== pending.actors.length || result.childCount < 1 || result.childCount > bootstrap.limits.maxActorCount || childIndex >= result.childCount
          || !presentRef(result.actor, bootstrap.limits.maxNativeUnitId) || !sameRef(pending.actors[childIndex],result.actor)
          || !["LIVE_RESULT_STAGE_BROKER_ADMISSION","LIVE_RESULT_STAGE_NATIVE_ADMISSION","LIVE_RESULT_STAGE_NATIVE_DISPATCH","LIVE_RESULT_STAGE_UNKNOWN"].includes(result.stage)
          || !["LIVE_RESULT_DISPOSITION_RECORDED","LIVE_RESULT_DISPOSITION_DUPLICATE","LIVE_RESULT_DISPOSITION_LATE"].includes(result.disposition)
          || (result.stage === "LIVE_RESULT_STAGE_BROKER_ADMISSION" && !["LIVE_RESULT_STATUS_ACCEPTED","LIVE_RESULT_STATUS_REJECTED"].includes(result.status))
          || (result.stage === "LIVE_RESULT_STAGE_NATIVE_ADMISSION" && !["LIVE_RESULT_STATUS_ACCEPTED","LIVE_RESULT_STATUS_REJECTED"].includes(result.status))
          || (result.stage === "LIVE_RESULT_STAGE_NATIVE_DISPATCH" && !["LIVE_RESULT_STATUS_APPLIED","LIVE_RESULT_STATUS_SKIPPED"].includes(result.status))
          || (result.stage === "LIVE_RESULT_STAGE_UNKNOWN" && !["LIVE_RESULT_STATUS_EXPIRED","LIVE_RESULT_STATUS_UNKNOWN"].includes(result.status))) throw new Error("live result identity, order, or bounds are invalid");
      if (pending.childCount !== null && pending.childCount !== result.childCount) throw new Error("live result child count changed");
      pending.childCount = result.childCount;
      lastResultSequence = resultSequence; elements.result.textContent = `${result.stage}: ${result.status} · child ${childIndex + 1}/${result.childCount}${result.reason ? ` · ${result.reason}` : ""}`;
      if (supervisor.active) guestRequest({ result }, "input", { inputId:result.inputId, basis:result.basis });
      if (result.disposition === "LIVE_RESULT_DISPOSITION_RECORDED"
          && (result.stage === "LIVE_RESULT_STAGE_NATIVE_DISPATCH" || result.stage === "LIVE_RESULT_STAGE_UNKNOWN" || result.status === "LIVE_RESULT_STATUS_REJECTED")) {
        pending.terminalChildren.add(childIndex);
        if (pending.terminalChildren.size === pending.childCount) pendingParents.delete(result.parentId);
      }
      render(); return;
    }
    if (envelope.body === "guestInput") {
      const request = envelope.guestInput; if (!moduleIdentity || request.moduleGeneration !== moduleIdentity.generation || request.sessionId !== bootstrap?.preview?.sessionId
          || !["observation","result"].includes(request.input)) throw new Error("server guest input identity or kind mismatch");
      validateBasis(request.basis); const encoded = encodeObject(v1.LiveGuestRequest, request); queue.enqueue({ kind: request.input === "observation" ? "observation" : "input", bytes: encoded, request, connection: connectionGeneration, generation: supervisor.generation, epoch: lifecycleEpoch }); return;
    }
    throw new Error("live server envelope body is unsupported");
  }

  function connect(url, expectedSession, credential) {
    socket?.close(); revoke("Pairing replaced the prior live session."); bootstrap = null; observation = null; moduleIdentity = null; pendingParents.clear(); lastObservationSequence = 0n; lastResultSequence = 0n; connectionGeneration++; protocolRefused = false;
    let endpoint; try { endpoint = new URL(url); if (!["ws:","wss:"].includes(endpoint.protocol)) throw new Error(); pairedSession = uuidBytesBase64(expectedSession); } catch { return notify("refused", "Gateway/session pairing values are invalid."); }
    notify("connecting", "Connecting to live gateway…"); const generation = connectionGeneration, candidate = new WebSocket(endpoint); socket = candidate; candidate.binaryType = "arraybuffer";
    const current = () => socket === candidate && generation === connectionGeneration;
    candidate.onopen = () => { if (!current()) return candidate.close(); send({ authenticate: { game:"bar", protocolVersion:"1.0.0", profile:requestedProfile, credential, origin:location.origin, expectedSessionId:pairedSession } }); elements.credential.value = ""; credential = ""; };
    candidate.onmessage = event => { if (!current()) return; if (!(event.data instanceof ArrayBuffer)) return revoke("Text live frames are refused."); try { const raw = new Uint8Array(event.data); if (raw.byteLength > (bootstrap?.limits?.maxFrameBytes ?? MAX_FRAME)) throw new Error("live server frame exceeds byte limit"); handleEnvelope(canonicalObject(v1.LiveServerEnvelope, raw)); } catch (error) { protocolRefused = true; revoke(`Live server frame refused: ${error.message}`); notify("refused", error.message); candidate.close(1008,"invalid live frame"); } };
    candidate.onerror = () => current() && notify("refused", "Live gateway connection failed."); candidate.onclose = () => { if (current() && !disposed && !protocolRefused) { revoke("Live gateway disconnected."); notify("disconnected", "Live gateway disconnected."); } };
  }

  elements.form.addEventListener("submit", event => { event.preventDefault(); connect(elements.gateway.value,elements.session.value,elements.credential.value); });
  q("[data-guest=manual]").addEventListener("click",()=>loadBundled("manual")); q("[data-guest=custom]").addEventListener("click",()=>loadBundled("custom"));
  q("[data-action=import]").addEventListener("click",()=>{revoke("Opening a module dialog revoked live authority.");elements.file.click();}); q("[data-action=rearm]").addEventListener("click",initializeGuest); q("[data-action=disarm]").addEventListener("click",()=>revoke("Operator requested revocation."));
  q("[data-action=move]").addEventListener("click",()=>{const x=elements.targetX.valueAsNumber,z=elements.targetZ.valueAsNumber;if(finite(x)&&finite(z))move("LIVE_INPUT_SOURCE_POINTER",{x,z},elements.policy.value==="MOVE_POLICY_APPEND")});
  q("[data-action=stop]").addEventListener("click",()=>stop("LIVE_INPUT_SOURCE_POINTER")); q("[data-action=attack]").addEventListener("click",()=>attack("LIVE_INPUT_SOURCE_POINTER"));
  q("[data-action=tactical]").addEventListener("click",()=>tacticalAction("LIVE_INPUT_SOURCE_POINTER"));
  const updateTargetFromControls=()=>{const x=elements.targetX.valueAsNumber,z=elements.targetZ.valueAsNumber;if(finite(x)&&finite(z)){target={x,z};render()}};
  elements.targetX.addEventListener("input",updateTargetFromControls);elements.targetZ.addEventListener("input",updateTargetFromControls);
  elements.policy.addEventListener("change",()=>movePolicy=elements.policy.value);
  for (const control of [elements.tacticalAction,elements.definition,elements.facing,elements.queuePolicy,elements.productionCount,elements.areaRadius,elements.queueDomain,elements.queueEntry,elements.queueOperation,elements.modeKind,elements.modeValue]) control.addEventListener("change",render);
  elements.file.addEventListener("change",async()=>{const file=elements.file.files[0];if(file?.size>MAX_MODULE)revoke("Module exceeds its import bound.");else if(file)await loadModule(file.name,new Uint8Array(await file.arrayBuffer()));elements.file.value=""});
  elements.svg.addEventListener("compositionstart",()=>composing=true);elements.svg.addEventListener("compositionend",()=>composing=false);
  elements.svg.addEventListener("keydown",event=>{if(composing||event.isComposing||event.target.closest("input,textarea,[contenteditable=true],[role=dialog]"))return;if(event.key==="Escape"){revoke("Escape revoked live authority.");return}if(!confirmed())return;const own=currentRefs("OBSERVATION_KIND_OWN"),visual=currentRefs("OBSERVATION_KIND_VISUAL"),features=observation?.tactical?.features?.map(value=>value.reference)??[];
    if(event.key==="Tab"&&own.length){event.preventDefault();if(selectionCursor<0)selectionCursor=Math.max(-1,own.findIndex(item=>selected.some(value=>sameRef(item,value))));selectionCursor=(selectionCursor+1)%own.length;const actor=own[selectionCursor];if(event.ctrlKey||event.metaKey)toggleSelection("LIVE_INPUT_SOURCE_KEYBOARD",actor,{control:true});else select("LIVE_INPUT_SOURCE_KEYBOARD",[actor])}
    else if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key)){event.preventDefault();const step=event.shiftKey?.25:10;if(event.key==="ArrowLeft")target.x-=step;if(event.key==="ArrowRight")target.x+=step;if(event.key==="ArrowUp")target.z-=step;if(event.key==="ArrowDown")target.z+=step;attackTarget=null;render()}
    else if(event.key.toLowerCase()==="s"){event.preventDefault();stop("LIVE_INPUT_SOURCE_KEYBOARD")}
    else if(event.key.toLowerCase()==="a"&&visual.length){event.preventDefault();const index=Math.max(-1,visual.findIndex(item=>attackTarget&&sameRef(item,attackTarget)));attackTarget=visual[(index+1)%visual.length];render()}
    else if(tacticalProfile&&event.key.toLowerCase()==="t"&&own.length){event.preventDefault();const index=Math.max(-1,own.findIndex(item=>friendlyTarget&&sameRef(item,friendlyTarget)));friendlyTarget=own[(index+1)%own.length];render()}
    else if(tacticalProfile&&event.key.toLowerCase()==="f"&&features.length){event.preventDefault();const index=Math.max(-1,features.findIndex(item=>featureTarget&&sameRef(item,featureTarget)));featureTarget=features[(index+1)%features.length];render()}
    else if(tacticalProfile&&"bgrluxcpyqm".includes(event.key.toLowerCase())){event.preventDefault();const kinds={b:"build",g:"guard",r:"repair",l:"reclaimUnit",u:"reclaimUnit",x:"reclaimFeature",c:"reclaimArea",p:"factoryProduce",y:"setRally",q:"queueEdit",m:"tacticalMode"};elements.tacticalAction.value=kinds[event.key.toLowerCase()];render()}
    else if(event.key==="Enter"||event.key===" "){event.preventDefault();if(tacticalProfile&&elements.tacticalAction.matches(":focus, :hover"))tacticalAction("LIVE_INPUT_SOURCE_KEYBOARD");else if(attackTarget)attack("LIVE_INPUT_SOURCE_KEYBOARD");else if(tacticalProfile)tacticalAction("LIVE_INPUT_SOURCE_KEYBOARD");else move("LIVE_INPUT_SOURCE_KEYBOARD",target,event.shiftKey)} });
  elements.svg.addEventListener("pointerdown",event=>{if(!confirmed())return;pointerId=event.pointerId;pointerUnit=event.target.closest("[data-live-ref]")?.dataset.liveRef??null;elements.svg.setPointerCapture(pointerId)});
  const clearPointer=()=>{pointerId=null;pointerUnit=null};elements.svg.addEventListener("lostpointercapture",clearPointer);elements.svg.addEventListener("pointercancel",clearPointer);elements.svg.addEventListener("pointerup",event=>{if(pointerId!==event.pointerId||!confirmed())return;pointerId=null;let unit=observation?.units.find(value=>refKey(value.reference)===pointerUnit);const feature=observation?.tactical?.features?.find(value=>refKey(value.reference)===pointerUnit);pointerUnit=null;unit=pointerActor(event,unit);if(feature){featureTarget=feature.reference;elements.tacticalAction.value="reclaimFeature";render()}else if(unit?.observation==="OBSERVATION_KIND_OWN"&&event.shiftKey){friendlyTarget=unit.reference;render()}else if(unit?.observation==="OBSERVATION_KIND_OWN"&&(event.ctrlKey||event.metaKey))toggleSelection("LIVE_INPUT_SOURCE_POINTER",unit.reference,{control:true}) ;else if(unit?.observation==="OBSERVATION_KIND_OWN")select("LIVE_INPUT_SOURCE_POINTER",[unit.reference]);else if(unit?.observation==="OBSERVATION_KIND_VISUAL"){attackTarget=unit.reference;attack("LIVE_INPUT_SOURCE_POINTER")}else{const p=elements.svg.createSVGPoint();p.x=event.clientX;p.y=event.clientY;const local=p.matrixTransform(elements.svg.getScreenCTM().inverse()),b=bootstrap.capabilities.mapBounds;target={x:(b.minX??0)+local.x/800*(b.maxX-(b.minX??0)),z:(b.minZ??0)+local.y/520*(b.maxZ-(b.minZ??0))};if(tacticalProfile)tacticalAction("LIVE_INPUT_SOURCE_POINTER");else move("LIVE_INPUT_SOURCE_POINTER",target,event.shiftKey)}});
  const blur=()=>!disposed&&revoke("Window focus loss revoked live authority."),visibility=()=>document.hidden&&revoke("Hidden page revoked live authority.");window.addEventListener("blur",blur);document.addEventListener("visibilitychange",visibility);

  function render() {
    elements.status.textContent = bootstrap ? "current: live session" : "unpaired"; elements.module.textContent = `${moduleName} — ${moduleIdentity ? `generation ${moduleIdentity.generation}` : "not armed"}`;
    elements.authority.textContent = `Authority: ${controllerStage.replace("CONTROLLER_STAGE_", "").toLowerCase().replaceAll("_", " ")}`;
    elements.selection.textContent = selected.length ? `Actors ${selected.map(refKey).join(", ")} · Repeated clicks cycle overlapping actors · Ctrl-click or Ctrl+Tab toggles actors` : "No lifetime-bound actor selected · Repeated clicks cycle overlapping actors · Ctrl-click or Ctrl+Tab toggles actors";
    elements.target.textContent = `${attackTarget ? `Attack ${refKey(attackTarget)} · ` : ""}${friendlyTarget ? `Friendly ${refKey(friendlyTarget)} · ` : ""}${featureTarget ? `Feature ${refKey(featureTarget)} · ` : ""}Target X ${target.x.toFixed(2)} · Z ${target.z.toFixed(2)}`;
    const tactical = observation?.tactical;
    elements.catalogue.textContent = tacticalProfile ? (bootstrap?.tacticalCatalogue ? `Catalogue ${bootstrap.tacticalCatalogue.content.gameName} ${bootstrap.tacticalCatalogue.content.gameVersion} · revision ${bootstrap.tacticalCatalogue.catalogueRevision} · ${bootstrap.tacticalCatalogue.definitions.length} definitions` : "Tactical catalogue unavailable") : "Legacy live profile";
    const resource=value=>value?`${value.resourceName}: ${value.current??"unknown"} / ${value.storage??"unknown"} ${value.unit}; income ${value.incomePerSecond??"unknown"}; use ${value.usagePerSecond??"unknown"}`:"unavailable";
    elements.economy.textContent=tacticalProfile?`Economy · ${resource(tactical?.economy?.metal)} · ${resource(tactical?.economy?.energy)}`:"Economy unavailable in legacy live profile";
    const selectedState=selected[0]&&actorState(selected[0]), domain=elements.queueDomain.value, queue=selectedState?.queue?.find(value=>value.domain===domain);
    elements.queueState.textContent=tacticalProfile?(queue?.complete?`${domain} revision ${queue.revision} · ${queue.entries.length} entries · repeat ${queue.repeat??"unknown"}`:`${domain} unavailable or incomplete`):"Queues unavailable in legacy live profile";
    const priorQueueEntry=elements.queueEntry.value;elements.queueEntry.replaceChildren(...(queue?.entries??[]).map(entry=>{const option=document.createElement("option");option.value=String(entry.nativeTag);option.textContent=`tag ${entry.nativeTag} · ${entry.action}${entry.definitionId?` · definition ${entry.definitionId}`:""}`;return option}));if([...elements.queueEntry.options].some(option=>option.value===priorQueueEntry))elements.queueEntry.value=priorQueueEntry;
    const selectedKind=elements.tacticalAction.value, descriptorKind=selectedKind==="tacticalMode"?elements.modeKind.value:selectedKind==="queueEdit"?(elements.queueOperation.value==="insert"?"TACTICAL_DESCRIPTOR_QUEUE_INSERT":elements.queueOperation.value==="remove"?"TACTICAL_DESCRIPTOR_QUEUE_REMOVE":"TACTICAL_DESCRIPTOR_QUEUE_REPEAT"):tacticalKind(selectedKind), available=selected.length>0&&selected.every(actor=>descriptorKind&&descriptorFor(observation,actor,descriptorKind));
    elements.diagnostic.textContent = confirmed() ? (tacticalProfile ? (available?"Current descriptor and queue bindings available. Commands return through the active guest; dispatch is not completion.":`${selectedKind} is unavailable for the current selection. Missing or disabled producer metadata is never guessed.`) : "Native authority confirmed. All actions must return from the active guest.") : "Live gameplay input is fenced.";
    const buildIds=selected.length?bootstrap?.tacticalCatalogue?.definitions?.filter(definition=>selected.every(actor=>descriptorFor(observation,actor,selectedKind==="factoryProduce"?"TACTICAL_DESCRIPTOR_FACTORY_PRODUCE":"TACTICAL_DESCRIPTOR_BUILD")?.allowedDefinitionIds?.includes(definition.definitionId)))??[]:[];
    const prior=elements.definition.value;elements.definition.replaceChildren(...buildIds.map(definition=>{const option=document.createElement("option");option.value=String(definition.definitionId);option.textContent=`${definition.displayName} (${definition.definitionId}) · ${definition.footprintXCells}×${definition.footprintZCells} · M ${definition.cost?.metal??"?"} E ${definition.cost?.energy??"?"}`;return option}));if([...elements.definition.options].some(option=>option.value===prior))elements.definition.value=prior;
    elements.units.replaceChildren(); if (observation && bootstrap) { const b=bootstrap.capabilities.mapBounds; for(const unit of observation.units){const preview=observation.preview.units.find(value=>(value.id??"0")===refId(unit.reference));if(!preview?.position)continue;const x=(preview.position.x-(b.minX??0))/(b.maxX-(b.minX??0))*800,y=(preview.position.z-(b.minZ??0))/(b.maxZ-(b.minZ??0))*520;const own=unit.observation==="OBSERVATION_KIND_OWN";const shape=unit.observation==="OBSERVATION_KIND_RADAR"?svg("rect",{x:x-7,y:y-7,width:14,height:14}):svg("circle",{cx:x,cy:y,r:own?10:8});shape.dataset.liveRef=refKey(unit.reference);shape.dataset.unitId=refId(unit.reference);shape.dataset.lifetime=unit.reference.lifetime;shape.setAttribute("class",`unit ${own?"own":unit.observation==="OBSERVATION_KIND_VISUAL"?"visual":"radar"}${selected.some(value=>sameRef(value,unit.reference))?" selected":""}`);shape.setAttribute("role","img");const health=Object.hasOwn(preview,"health")?` health ${preview.health}/${preview.maxHealth??"unknown"}`:" health unknown";shape.setAttribute("aria-label",`${unit.observation.replace("OBSERVATION_KIND_","").toLowerCase()} unit ${refId(unit.reference)} lifetime ${unit.reference.lifetime}${health}`);elements.units.append(shape)}}
    elements.features.replaceChildren();if(observation&&bootstrap)for(const feature of observation.tactical?.features??[]){const b=bootstrap.capabilities.mapBounds,x=(feature.position.x-(b.minX??0))/(b.maxX-(b.minX??0))*800,y=(feature.position.z-(b.minZ??0))/(b.maxZ-(b.minZ??0))*520,shape=svg("path",{d:`M${x-7},${y} L${x},${y-7} L${x+7},${y} L${x},${y+7} Z`});shape.dataset.liveRef=refKey(feature.reference);shape.dataset.featureId=refId(feature.reference);shape.setAttribute("class",`feature${featureTarget&&sameRef(featureTarget,feature.reference)?" selected":""}`);shape.setAttribute("aria-label",`feature ${refId(feature.reference)} lifetime ${feature.reference.lifetime} reclaim ${feature.reclaimLeft??"unknown"}`);elements.features.append(shape)}
    for(const control of root.querySelectorAll("[data-action=move],[data-action=stop],[data-action=attack],[data-action=tactical],svg"))control.toggleAttribute("aria-disabled",!confirmed()||(control.matches("[data-action=tactical]")&&!available));
  }
  render();
  return { start(){if(options.initialGatewayUrl&&options.initialExpectedSessionId&&options.initialCredential)connect(options.initialGatewayUrl,options.initialExpectedSessionId,options.initialCredential)},render(){render()},dispose(){disposed=true;revoke("Client disposed.");connectionGeneration++;socket?.close();window.removeEventListener("blur",blur);document.removeEventListener("visibilitychange",visibility);root.replaceChildren();root.classList.remove("barc-preview","barc-live")} };
}
