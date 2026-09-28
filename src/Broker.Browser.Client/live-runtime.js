import { canonicalObject, encodeObject, v1 } from "../Broker.Browser.Contracts/generated/codec.js";
import { GuestSupervisor } from "../Broker.Browser.Wasm/index.js";

const PROFILE = "barc-live-v1";
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
function validateBootstrap(value, pairedSession) {
  if (!value || value.liveProfile !== PROFILE || value.preview?.profile !== PROFILE || value.preview?.sessionId !== pairedSession) throw new Error("live bootstrap identity/profile is invalid");
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
}
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
  } else if (intent.action !== "stop") throw new Error("guest live action is missing or unsupported");
}

class LiveQueue {
  constructor(supervisor, result, fault) { this.supervisor = supervisor; this.result = result; this.fault = fault; this.items = []; this.running = false; this.epoch = 0; }
  reset(reason) { this.epoch++; this.items.length = 0; this.supervisor.disarm(); this.fault(reason); }
  enqueue(item) {
    if (item.kind === "observation" && this.items.at(-1)?.kind === "observation") this.items[this.items.length - 1] = item; else this.items.push(item);
    if (this.items.length > MAX_QUEUE) return this.reset("Live guest input queue overflowed; explicit rearm is required.");
    void this.drain();
  }
  async drain() { if (this.running) return; this.running = true; const epoch = this.epoch;
    while (this.items.length && epoch === this.epoch) { const item = this.items.shift(); const result = await this.supervisor.process(item.bytes);
      if (epoch !== this.epoch) break; if (result.state !== "completed") { this.reset(`Guest ${result.state}: ${result.reason}`); break; } this.result(item, result); }
    this.running = false;
  }
}

const svg = (name, attributes = {}) => { const element = document.createElementNS("http://www.w3.org/2000/svg", name); for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value); return element; };

export function createLiveRuntime(root, options, emit) {
  if (!(root instanceof Element)) throw new Error("BARC live mount root must be an Element");
  const assetBase = new URL(options.assetBaseUrl); if (!assetBase.href.endsWith("/")) throw new Error("assetBaseUrl must end with /");
  const supervisor = new GuestSupervisor({ workerUrl: new URL("src/Broker.Browser.Wasm/guest-worker.js", assetBase), limits: { phaseTimeoutMilliseconds: 250 } });
  let socket = null, disposed = false, pairedSession = null, bootstrap = null, observation = null, moduleBytes = null, moduleName = "No guest loaded", moduleIdentity = null;
  let selected = [], target = { x: 0, z: 0 }, attackTarget = null, movePolicy = "MOVE_POLICY_REPLACE", controllerStage = "CONTROLLER_STAGE_UNSPECIFIED";
  let connectionGeneration = 0, lifecycleEpoch = 0, composing = false, pointerId = null, pointerUnit = null, protocolRefused = false;
  let lastObservationSequence = 0n, lastResultSequence = 0n; const pendingParents = new Map();

  root.classList.add("barc-preview", "barc-live");
  root.innerHTML = `<section class="barc-shell" aria-label="BARC live tactical control"><header><div><strong>BARC live tactical control</strong><span class="readonly">explicit authority</span></div><div class="status" role="status">unpaired</div></header>
  <form class="pairing"><label>Gateway <input name="gateway" type="url" autocomplete="off"></label><label>Session UUID <input name="session" autocomplete="off"></label><label>One-time credential <input name="credential" type="password" autocomplete="off"></label><button>Pair</button></form>
  <div class="toolbar"><button data-guest="manual">Manual guest</button><button data-guest="custom">Custom guest</button><button data-action="import">Import .wasm</button><input data-file type="file" accept=".wasm,application/wasm" hidden><button data-action="rearm">Arm live</button><button data-action="disarm">Revoke</button></div>
  <div class="module" aria-live="polite"></div><div class="target-controls"><label>Target X <input name="target-x" type="number" step="0.25" value="0"></label><label>Target Z <input name="target-z" type="number" step="0.25" value="0"></label><label>Move policy <select name="move-policy"><option value="MOVE_POLICY_REPLACE">Replace</option><option value="MOVE_POLICY_APPEND">Append</option></select></label><button data-action="move">Move</button><button data-action="stop">Stop</button><button data-action="attack">Attack visible target</button></div>
  <div class="stage"><svg viewBox="0 0 800 520" tabindex="0" aria-label="Live tactical map. Tab selects an own unit; arrows set target; Enter confirms Move; S stops; A selects a visual target then Enter attacks."><g class="units"></g><g class="intent"></g></svg><aside><div class="authority"></div><div class="selection"></div><div class="target"></div><div class="result"></div><div class="diagnostic"></div></aside></div></section>`;
  const q = selector => root.querySelector(selector), elements = { form:q("form"), gateway:q("[name=gateway]"), session:q("[name=session]"), credential:q("[name=credential]"), status:q(".status"), module:q(".module"), svg:q("svg"), units:q(".units"), authority:q(".authority"), selection:q(".selection"), target:q(".target"), result:q(".result"), diagnostic:q(".diagnostic"), file:q("[data-file]"), targetX:q("[name=target-x]"), targetZ:q("[name=target-z]"), policy:q("[name=move-policy]") };
  elements.gateway.value = options.initialGatewayUrl ?? ""; elements.session.value = options.initialExpectedSessionId ?? ""; elements.credential.value = options.initialCredential ?? "";
  const notify = (kind, detail = "", value = null) => emit({ kind, detail, value });
  const confirmed = () => controllerStage === "CONTROLLER_STAGE_ARM_NATIVE_CONFIRMED";
  const currentRefs = kind => observation?.units?.filter(unit => unit.observation === kind).map(unit => unit.reference) ?? [];
  const send = value => { if (!socket || socket.readyState !== WebSocket.OPEN) throw new Error("live socket is unavailable"); socket.send(encodeObject(v1.LiveClientEnvelope, value)); };
  const revoke = reason => {
    lifecycleEpoch++; selected = []; attackTarget = null;
    if (bootstrap && moduleIdentity && ["CONTROLLER_STAGE_ARM_REQUESTED", "CONTROLLER_STAGE_ARM_NATIVE_CONFIRMED"].includes(controllerStage)) {
      controllerStage = "CONTROLLER_STAGE_REVOKE_REQUESTED"; try { send({ revoke: { controller: bootstrap.controller, reason } }); } catch {}
    }
    queue.reset(reason); render(); notify("disarmed", reason);
  };
  const queue = new LiveQueue(supervisor, (item, result) => {
    if (item.connection !== connectionGeneration || item.generation !== supervisor.generation || item.epoch !== lifecycleEpoch) return;
    let response; try { response = canonicalObject(v1.LiveGuestResponse, Uint8Array.from(result.output)); }
    catch (error) { return revoke(`Guest live response malformed: ${error.message}`); }
    if (response.inputId !== item.request.inputId || response.sessionId !== item.request.sessionId || response.moduleGeneration !== item.request.moduleGeneration
        || JSON.stringify(response.basis) !== JSON.stringify(item.request.basis) || response.acknowledgment !== "GUEST_ACK_STATUS_CONSUMED") return revoke("Guest live response identity mismatch.");
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
  }, reason => { elements.diagnostic.textContent = reason; });

  const guestRequest = (input, kind = "input", identity = {}) => {
    if (!moduleIdentity || !bootstrap || !observation) return;
    const request = { inputId: identity.inputId ?? bytes(), sessionId: bootstrap.preview.sessionId, moduleGeneration: moduleIdentity.generation, basis: identity.basis ?? observation.basis, ...input };
    const encoded = encodeObject(v1.LiveGuestRequest, request);
    if (encoded.byteLength > bootstrap.limits.maxInputBytes) return revoke("Live guest input exceeds its negotiated byte limit.");
    queue.enqueue({ kind, bytes: encoded, request, connection: connectionGeneration, generation: supervisor.generation, epoch: lifecycleEpoch });
  };
  const select = (source, actors) => { if (!confirmed()) return; selected = actors.slice(0, MAX_ACTORS); guestRequest({ manualInput: { source, modifiers: {}, select: { actors: selected } } }); render(); };
  const action = (source, intent, modifiers = {}) => { if (!confirmed() || selected.length === 0) return; guestRequest({ manualInput: { source, modifiers, action: { actors: selected, ...intent } } }); };
  const move = (source, position, append = false) => { const b = bootstrap?.capabilities?.mapBounds; if (!b) return; const x = Math.min(b.maxX, Math.max(b.minX ?? 0, position.x)), z = Math.min(b.maxZ, Math.max(b.minZ ?? 0, position.z)); target = { x, z }; movePolicy = append ? "MOVE_POLICY_APPEND" : elements.policy.value; action(source, { move: { position: target, policy: movePolicy } }, { shift: movePolicy === "MOVE_POLICY_APPEND" }); render(); };
  const stop = source => action(source, { stop: {} });
  const attack = source => { if (attackTarget) action(source, { attack: { target: attackTarget } }); };

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
    controllerStage = "CONTROLLER_STAGE_ARM_REQUESTED"; send({ arm: { controller: bootstrap.controller, module: moduleIdentity } }); render();
    guestRequest({ observation }, "observation");
  }
  async function loadModule(name, value) { revoke("Module replacement revoked live authority."); if (value.byteLength > MAX_MODULE) return; moduleBytes = Uint8Array.from(value); moduleName = name; moduleIdentity = null; notify("module", name); render(); }
  async function loadBundled(name) { const response = await fetch(new URL(`guests/${name}-preview.wasm`, assetBase), { cache:"no-store" }); if (!response.ok) return revoke(`Bundled ${name} guest unavailable.`); await loadModule(`${name}-preview.wasm`, new Uint8Array(await response.arrayBuffer())); }

  function handleEnvelope(envelope) {
    if (envelope.body === "bootstrap") { validateBootstrap(envelope.bootstrap, pairedSession); bootstrap = envelope.bootstrap; controllerStage = "CONTROLLER_STAGE_UNSPECIFIED"; notify("streaming", "Authenticated live session; load a guest and request native authority."); render(); return; }
    if (envelope.body === "observation") {
      if (!bootstrap) throw new Error("live observation arrived before bootstrap"); validateObservation(envelope.observation, bootstrap);
      observation = envelope.observation; selected = selected.filter(actor => observation.units.some(unit => unit.observation === "OBSERVATION_KIND_OWN" && sameRef(unit.reference, actor)));
      if (attackTarget && !observation.units.some(unit => unit.observation === "OBSERVATION_KIND_VISUAL" && sameRef(unit.reference, attackTarget))) attackTarget = null;
      if (observation.preview.validity?.status !== "VALIDITY_STATUS_CURRENT") { revoke("A stale live observation revoked authority."); notify("snapshot", "stale", observation.preview); render(); return; }
      const stateSequence = BigInt(observation.basis.stateSequence);
      if (stateSequence <= lastObservationSequence) throw new Error("live observation sequence did not advance");
      lastObservationSequence = stateSequence;
      notify("snapshot", "current", observation.preview); if (supervisor.active) guestRequest({ observation }, "observation"); render(); return;
    }
    if (envelope.body === "controllerState") {
      const state = envelope.controllerState;
      if (!bootstrap || state.controller?.controllerIncarnation !== bootstrap.controller.controllerIncarnation || state.controller?.authorityEpoch !== bootstrap.controller.authorityEpoch
          || (moduleIdentity && state.module?.generation !== moduleIdentity.generation)) throw new Error("controller state identity mismatch");
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
    candidate.onopen = () => { if (!current()) return candidate.close(); send({ authenticate: { game:"bar", protocolVersion:"1.0.0", profile:PROFILE, credential, origin:location.origin, expectedSessionId:pairedSession } }); elements.credential.value = ""; credential = ""; };
    candidate.onmessage = event => { if (!current()) return; if (!(event.data instanceof ArrayBuffer)) return revoke("Text live frames are refused."); try { const raw = new Uint8Array(event.data); if (raw.byteLength > (bootstrap?.limits?.maxFrameBytes ?? MAX_FRAME)) throw new Error("live server frame exceeds byte limit"); handleEnvelope(canonicalObject(v1.LiveServerEnvelope, raw)); } catch (error) { protocolRefused = true; revoke(`Live server frame refused: ${error.message}`); notify("refused", error.message); candidate.close(1008,"invalid live frame"); } };
    candidate.onerror = () => current() && notify("refused", "Live gateway connection failed."); candidate.onclose = () => { if (current() && !disposed && !protocolRefused) { revoke("Live gateway disconnected."); notify("disconnected", "Live gateway disconnected."); } };
  }

  elements.form.addEventListener("submit", event => { event.preventDefault(); connect(elements.gateway.value,elements.session.value,elements.credential.value); });
  q("[data-guest=manual]").addEventListener("click",()=>loadBundled("manual")); q("[data-guest=custom]").addEventListener("click",()=>loadBundled("custom"));
  q("[data-action=import]").addEventListener("click",()=>{revoke("Opening a module dialog revoked live authority.");elements.file.click();}); q("[data-action=rearm]").addEventListener("click",initializeGuest); q("[data-action=disarm]").addEventListener("click",()=>revoke("Operator requested revocation."));
  q("[data-action=move]").addEventListener("click",()=>{const x=elements.targetX.valueAsNumber,z=elements.targetZ.valueAsNumber;if(finite(x)&&finite(z))move("LIVE_INPUT_SOURCE_POINTER",{x,z},elements.policy.value==="MOVE_POLICY_APPEND")});
  q("[data-action=stop]").addEventListener("click",()=>stop("LIVE_INPUT_SOURCE_POINTER")); q("[data-action=attack]").addEventListener("click",()=>attack("LIVE_INPUT_SOURCE_POINTER"));
  elements.policy.addEventListener("change",()=>movePolicy=elements.policy.value);
  elements.file.addEventListener("change",async()=>{const file=elements.file.files[0];if(file?.size>MAX_MODULE)revoke("Module exceeds its import bound.");else if(file)await loadModule(file.name,new Uint8Array(await file.arrayBuffer()));elements.file.value=""});
  elements.svg.addEventListener("compositionstart",()=>composing=true);elements.svg.addEventListener("compositionend",()=>composing=false);
  elements.svg.addEventListener("keydown",event=>{if(composing||event.isComposing||event.target.closest("input,textarea,[contenteditable=true],[role=dialog]"))return;if(event.key==="Escape"){revoke("Escape revoked live authority.");return}if(!confirmed())return;const own=currentRefs("OBSERVATION_KIND_OWN"),visual=currentRefs("OBSERVATION_KIND_VISUAL");
    if(event.key==="Tab"&&own.length){event.preventDefault();const index=Math.max(-1,own.findIndex(item=>selected.some(value=>sameRef(item,value))));select("LIVE_INPUT_SOURCE_KEYBOARD",[own[(index+1)%own.length]])}
    else if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(event.key)){event.preventDefault();const step=event.shiftKey?.25:10;if(event.key==="ArrowLeft")target.x-=step;if(event.key==="ArrowRight")target.x+=step;if(event.key==="ArrowUp")target.z-=step;if(event.key==="ArrowDown")target.z+=step;attackTarget=null;render()}
    else if(event.key.toLowerCase()==="s"){event.preventDefault();stop("LIVE_INPUT_SOURCE_KEYBOARD")}
    else if(event.key.toLowerCase()==="a"&&visual.length){event.preventDefault();const index=Math.max(-1,visual.findIndex(item=>attackTarget&&sameRef(item,attackTarget)));attackTarget=visual[(index+1)%visual.length];render()}
    else if(event.key==="Enter"||event.key===" "){event.preventDefault();if(attackTarget)attack("LIVE_INPUT_SOURCE_KEYBOARD");else move("LIVE_INPUT_SOURCE_KEYBOARD",target,event.shiftKey)} });
  elements.svg.addEventListener("pointerdown",event=>{if(!confirmed())return;pointerId=event.pointerId;pointerUnit=event.target.closest("[data-live-ref]")?.dataset.liveRef??null;elements.svg.setPointerCapture(pointerId)});
  elements.svg.addEventListener("lostpointercapture",()=>{pointerId=null;pointerUnit=null});elements.svg.addEventListener("pointerup",event=>{if(pointerId!==event.pointerId||!confirmed())return;pointerId=null;const unit=observation?.units.find(value=>refKey(value.reference)===pointerUnit);pointerUnit=null;if(unit?.observation==="OBSERVATION_KIND_OWN")select("LIVE_INPUT_SOURCE_POINTER",[unit.reference]);else if(unit?.observation==="OBSERVATION_KIND_VISUAL"){attackTarget=unit.reference;attack("LIVE_INPUT_SOURCE_POINTER")}else{const p=elements.svg.createSVGPoint();p.x=event.clientX;p.y=event.clientY;const local=p.matrixTransform(elements.svg.getScreenCTM().inverse()),b=bootstrap.capabilities.mapBounds;move("LIVE_INPUT_SOURCE_POINTER",{x:(b.minX??0)+local.x/800*(b.maxX-(b.minX??0)),z:(b.minZ??0)+local.y/520*(b.maxZ-(b.minZ??0))},event.shiftKey)}});
  const blur=()=>!disposed&&revoke("Window focus loss revoked live authority."),visibility=()=>document.hidden&&revoke("Hidden page revoked live authority.");window.addEventListener("blur",blur);document.addEventListener("visibilitychange",visibility);

  function render() {
    elements.status.textContent = bootstrap ? "current: live session" : "unpaired"; elements.module.textContent = `${moduleName} — ${moduleIdentity ? `generation ${moduleIdentity.generation}` : "not armed"}`;
    elements.authority.textContent = `Authority: ${controllerStage.replace("CONTROLLER_STAGE_", "").toLowerCase().replaceAll("_", " ")}`;
    elements.selection.textContent = selected.length ? `Actors ${selected.map(refKey).join(", ")}` : "No lifetime-bound actor selected";
    elements.target.textContent = attackTarget ? `Attack target ${refKey(attackTarget)}` : `Move target X ${target.x.toFixed(2)} · Z ${target.z.toFixed(2)} · ${movePolicy.replace("MOVE_POLICY_", "").toLowerCase()}`;
    elements.diagnostic.textContent = confirmed() ? "Native authority confirmed. All actions must return from the active guest." : "Live gameplay input is fenced.";
    elements.units.replaceChildren(); if (observation && bootstrap) { const b=bootstrap.capabilities.mapBounds; for(const unit of observation.units){const preview=observation.preview.units.find(value=>(value.id??"0")===refId(unit.reference));if(!preview?.position)continue;const x=(preview.position.x-(b.minX??0))/(b.maxX-(b.minX??0))*800,y=(preview.position.z-(b.minZ??0))/(b.maxZ-(b.minZ??0))*520;const own=unit.observation==="OBSERVATION_KIND_OWN";const shape=unit.observation==="OBSERVATION_KIND_RADAR"?svg("rect",{x:x-7,y:y-7,width:14,height:14}):svg("circle",{cx:x,cy:y,r:own?10:8});shape.dataset.liveRef=refKey(unit.reference);shape.dataset.unitId=refId(unit.reference);shape.dataset.lifetime=unit.reference.lifetime;shape.setAttribute("class",`unit ${own?"own":unit.observation==="OBSERVATION_KIND_VISUAL"?"visual":"radar"}${selected.some(value=>sameRef(value,unit.reference))?" selected":""}`);shape.setAttribute("role","img");shape.setAttribute("aria-label",`${unit.observation.replace("OBSERVATION_KIND_","").toLowerCase()} unit ${refId(unit.reference)} lifetime ${unit.reference.lifetime}`);elements.units.append(shape)}}
    for(const control of root.querySelectorAll("[data-action=move],[data-action=stop],[data-action=attack],svg"))control.toggleAttribute("aria-disabled",!confirmed());
  }
  render();
  return { start(){if(options.initialGatewayUrl&&options.initialExpectedSessionId&&options.initialCredential)connect(options.initialGatewayUrl,options.initialExpectedSessionId,options.initialCredential)},render(){render()},dispose(){disposed=true;revoke("Client disposed.");connectionGeneration++;socket?.close();window.removeEventListener("blur",blur);document.removeEventListener("visibilitychange",visibility);root.replaceChildren();root.classList.remove("barc-preview","barc-live")} };
}
