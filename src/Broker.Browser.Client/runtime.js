import { canonicalObject, encodeObject, v1 } from "../Broker.Browser.Contracts/generated/codec.js";
import { GuestSupervisor } from "../Broker.Browser.Wasm/index.js";

const PROFILE = "barc-preview-v1";
const PROTOCOL = "1.0.0";
const GAME = "bar";
const CONFIGURED_MAX_FRAME = 1024 * 1024;
const MAX_GUEST_ENTITIES = 64;
const MAX_QUEUE = 8;

const bytesEqual = (left, right) => left === right;
const finite = (value) => typeof value === "number" && Number.isFinite(value);
const nonzeroId = (value) => typeof value === "string" && /^(?:[1-9][0-9]*)$/.test(value);
const sequence = (value) => typeof value === "string" && /^(?:0|[1-9][0-9]*)$/.test(value);
const known = (value, values) => values.includes(value);

function uuidBytesBase64(value) {
  const match = /^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})$/i.exec(value.trim());
  if (!match) throw new Error("Session must be a canonical UUID.");
  const groups = match.slice(1);
  const ordered = [groups[0].match(/../g).reverse(), groups[1].match(/../g).reverse(), groups[2].match(/../g).reverse(), groups[3].match(/../g), groups[4].match(/../g)].flat();
  const bytes = Uint8Array.from(ordered, pair => Number.parseInt(pair, 16));
  let binary = ""; for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function assertPosition(value, name) {
  if (!value || !finite(value.x) || !finite(value.z) || (Object.hasOwn(value, "elevation") && !finite(value.elevation))) {
    throw new Error(`${name} has non-finite or missing coordinates`);
  }
}

function validateValidity(value, allowStale) {
  if (!value || !known(value.status, allowStale
    ? ["VALIDITY_STATUS_CURRENT", "VALIDITY_STATUS_STALE"]
    : ["VALIDITY_STATUS_CURRENT"])) throw new Error("unsupported validity status");
  if (!sequence(value.lastSequence ?? "0") || (Object.hasOwn(value, "receivedSequence") && !sequence(value.receivedSequence))) {
    throw new Error("invalid validity sequence");
  }
}

function validateBootstrap(value) {
  if (!value || value.game !== GAME || value.protocolVersion !== PROTOCOL || value.profile !== PROFILE) {
    throw new Error("unsupported game, protocol, or browser profile");
  }
  if (!value.sessionId || !value.perspectiveId || value.mode !== "PREVIEW_MODE_READ_ONLY") {
    throw new Error("bootstrap identity or read-only mode is missing");
  }
  validateValidity(value.validity, true);
  const limits = value.limits;
  if (!limits || !Number.isInteger(limits.maxFrameBytes) || limits.maxFrameBytes < 1 || !Number.isInteger(limits.maxEntities) || limits.maxEntities < 1) {
    throw new Error("bootstrap limits are invalid");
  }
}

function validateObservation(value, bootstrap) {
  if (!value || !bytesEqual(value.sessionId, bootstrap.sessionId) || value.perspectiveId !== bootstrap.perspectiveId) {
    throw new Error("observation session or perspective does not match bootstrap");
  }
  if (!nonzeroId(value.sequence)) throw new Error("observation identity is invalid");
  validateValidity(value.validity, true);
  const stale = value.validity.status === "VALIDITY_STATUS_STALE";
  if (!stale && !sequence(value.capturedAtUnixMs)) throw new Error("current observation capture time is invalid");
  if (!Array.isArray(value.units) || !Array.isArray(value.features)) throw new Error("observation collections are missing");
  if (value.units.length + value.features.length > bootstrap.limits.maxEntities) throw new Error("observation exceeds negotiated entity limit");
  const identities = new Set();
  for (const unit of value.units) {
    if (!nonzeroId(unit.id) || identities.has(`u:${unit.id}`)) throw new Error("unit identity is zero or duplicated");
    identities.add(`u:${unit.id}`);
    if (!known(unit.observation, ["OBSERVATION_KIND_OWN", "OBSERVATION_KIND_VISUAL", "OBSERVATION_KIND_RADAR"])) throw new Error("unsupported observation kind");
    assertPosition(unit.position, "unit position");
    for (const field of ["health", "maxHealth"]) if (Object.hasOwn(unit, field) && !finite(unit[field])) throw new Error(`unit ${field} is non-finite`);
    if (Object.hasOwn(unit, "generation") && !sequence(unit.generation)) throw new Error("unit generation is invalid");
  }
  for (const feature of value.features) {
    if (!nonzeroId(feature.id) || identities.has(`f:${feature.id}`) || !Number.isInteger(feature.definitionId) || feature.definitionId === 0) throw new Error("feature identity or type is invalid");
    identities.add(`f:${feature.id}`);
    assertPosition(feature.position, "feature position");
  }
  if (Object.hasOwn(value, "teamEconomy")) {
    for (const resourceName of ["metal", "energy"]) {
      const resource = value.teamEconomy?.[resourceName];
      if (!resource) throw new Error(`economy ${resourceName} is missing`);
      for (const field of ["current", "storage", "income", "expenditure"]) {
        if (Object.hasOwn(resource, field) && !finite(resource[field])) throw new Error(`economy ${resourceName}.${field} is non-finite`);
      }
    }
  }
}

export function decodeServerFrame(bytesLike, context = {}) {
  const bytes = new Uint8Array(bytesLike);
  const limit = Math.min(CONFIGURED_MAX_FRAME, context.negotiatedMaxFrameBytes ?? CONFIGURED_MAX_FRAME);
  if (bytes.byteLength > limit) throw new Error(`server frame exceeds ${limit} byte limit`);
  let envelope;
  try { envelope = canonicalObject(v1.ServerEnvelope, bytes); }
  catch (error) { throw new Error(`server frame is malformed: ${error.message}`); }
  if (!known(envelope.body, ["bootstrap", "observation"])) throw new Error("server envelope body is missing or unsupported");
  if (envelope.body === "bootstrap") validateBootstrap(envelope.bootstrap);
  else {
    if (!context.bootstrap) throw new Error("observation arrived before bootstrap");
    validateObservation(envelope.observation, context.bootstrap);
  }
  return envelope;
}

export class SerialGuestQueue {
  constructor(supervisor, onResult, onFault) {
    this.supervisor = supervisor;
    this.onResult = onResult;
    this.onFault = onFault;
    this.items = [];
    this.running = false;
    this.epoch = 0;
  }
  reset(reason) {
    this.epoch++;
    this.items.length = 0;
    this.supervisor.disarm();
    this.onFault(reason);
  }
  enqueue(item) {
    if (item.kind === "observation") {
      const pending = this.items.length - 1;
      if (pending >= 0 && this.items[pending].kind === "observation") this.items[pending] = item;
      else this.items.push(item);
    } else this.items.push(item);
    if (this.items.length > MAX_QUEUE) return this.reset("Guest input queue overflowed; explicit rearm is required.");
    this.drain();
  }
  async drain() {
    if (this.running) return;
    this.running = true;
    const epoch = this.epoch;
    while (this.items.length && epoch === this.epoch) {
      const item = this.items.shift();
      let result;
      try { result = await this.supervisor.process(item.bytes); }
      catch (error) { this.reset(`Guest call failed: ${error.message}`); break; }
      if (epoch !== this.epoch) break;
      if (result.state !== "completed") { this.reset(`Guest ${result.state}: ${result.reason}`); break; }
      this.onResult(item, result);
    }
    this.running = false;
  }
}

function svgElement(name, attributes = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  return element;
}

export function createRuntime(root, options, emit) {
  if (!(root instanceof Element)) throw new Error("BARC preview mount root must be an Element");
  const assetBase = new URL(options.assetBaseUrl);
  if (!assetBase.href.endsWith("/")) throw new Error("assetBaseUrl must end with /");
  const supervisor = new GuestSupervisor({ workerUrl: new URL("src/Broker.Browser.Wasm/guest-worker.js", assetBase) });
  let socket = null;
  let disposed = false;
  let bootstrap = null;
  let pairedSession = null;
  let snapshot = null;
  let moduleBytes = null;
  let moduleName = "No guest loaded";
  let requestId = 0n;
  let connectionGeneration = 0;
  let projection = {};
  let selected = [];
  let target = { x: 0, z: 0 };
  let composing = false;
  let pointerId = null;
  let pointerUnitId = null;
  let protocolRefused = false;
  let lifecycleEpoch = 0;
  let frameMeasureCount = 0;

  root.classList.add("barc-preview");
  root.innerHTML = `<section class="barc-shell" aria-label="BARC tactical preview">
    <header><div><strong>BARC tactical preview</strong><span class="readonly">read-only</span></div><div class="status" role="status"></div></header>
    <form class="pairing"><label>Gateway <input name="gateway" type="url" spellcheck="false" autocomplete="off"></label><label>Session UUID <input name="session" spellcheck="false" autocomplete="off"></label><label>One-time credential <input name="credential" type="password" autocomplete="off"></label><button>Pair</button></form>
    <div class="toolbar"><button data-guest="manual">Manual guest</button><button data-guest="custom">Custom guest</button><button data-action="import">Import .wasm</button><input data-file type="file" accept=".wasm,application/wasm" hidden><button data-action="rearm">Rearm</button><button data-action="disarm">Disarm</button></div>
    <div class="module" aria-live="polite"></div>
    <div class="target-controls"><label>Target X <input name="target-x" type="number" step="0.25" value="0"></label><label>Target Z <input name="target-z" type="number" step="0.25" value="0"></label><button data-action="target">Preview target</button></div>
    <div class="stage"><svg viewBox="0 0 800 520" tabindex="0" aria-label="Tactical map. Tab selects an own unit; arrows move the target; Enter confirms."><g class="grid"></g><g class="features"></g><g class="units"></g><g class="preview"></g></svg><aside><div class="age"></div><div class="selection"></div><div class="target"></div><div class="preview-detail"></div><div class="economy"></div><div class="diagnostic"></div></aside></div>
  </section>`;
  const elements = {
    form: root.querySelector("form"), gateway: root.querySelector("[name=gateway]"), session: root.querySelector("[name=session]"), credential: root.querySelector("[name=credential]"),
    status: root.querySelector(".status"), module: root.querySelector(".module"), svg: root.querySelector("svg"), units: root.querySelector(".units"),
    features: root.querySelector(".features"), preview: root.querySelector(".preview"), age: root.querySelector(".age"), selection: root.querySelector(".selection"),
    target: root.querySelector(".target"), previewDetail: root.querySelector(".preview-detail"), economy: root.querySelector(".economy"), diagnostic: root.querySelector(".diagnostic"), file: root.querySelector("[data-file]"),
    targetX: root.querySelector("[name=target-x]"), targetZ: root.querySelector("[name=target-z]")
  };
  elements.gateway.value = options.initialGatewayUrl ?? "";
  elements.session.value = options.initialExpectedSessionId ?? "";
  elements.credential.value = options.initialCredential ?? "";

  for (let i = 0; i <= 8; i++) {
    elements.svg.querySelector(".grid").append(svgElement("path", { d: `M ${i * 100} 0 V 520 M 0 ${i * 65} H 800` }));
  }

  const notify = (kind, detail = "", value = null) => emit({ kind, detail, value });
  const clearInteraction = () => { selected = []; target = { x: 0, z: 0 }; pointerId = null; pointerUnitId = null; };
  const disarm = (reason) => {
    queue.reset(reason);
  };
  const fault = (reason) => { lifecycleEpoch++; clearInteraction(); notify("disarmed", reason); };

  const queue = new SerialGuestQueue(supervisor, (item, result) => {
    if (!projection.armed || item.connectionGeneration !== connectionGeneration || item.guestGeneration !== supervisor.generation) return;
    try {
      const response = canonicalObject(v1.GuestResponse, result.output);
      if (response.requestId !== item.requestId || response.sessionId !== bootstrap.sessionId || response.consumedSequence !== item.contextSequence || response.acknowledgment !== "GUEST_ACK_STATUS_CONSUMED") {
        throw new Error("guest response identity did not match queued input");
      }
      if (response.kind === "INTENT_KIND_MOVE" && response.preview === "move") notify("preview", "", response.move);
      else if (!response.kind && !response.preview) notify("preview", "", null);
      else throw new Error("guest response preview and kind disagree");
    } catch (error) { disarm(`Guest output refused: ${error.message}`); }
  }, fault);

  function request(input, contextSequence, kind) {
    if (!projection.armed || !bootstrap || !snapshot || projection.connection !== "current") return;
    requestId += 1n;
    const value = { requestId: requestId.toString(), sessionId: bootstrap.sessionId, contextSequence, [kind]: input };
    const bytes = encodeObject(v1.GuestRequest, value);
    if (bytes.byteLength > 64 * 1024) return disarm("Guest request exceeds its 64 KiB input boundary.");
    queue.enqueue({ kind: kind === "observation" ? "observation" : "input", bytes, requestId: requestId.toString(), contextSequence, connectionGeneration, guestGeneration: supervisor.generation });
  }

  const sendObservation = observation => request(observation, observation.sequence, "observation");
  const select = ids => {
    if (!projection.armed || !snapshot || snapshot.validity.status !== "VALIDITY_STATUS_CURRENT") return;
    selected = [...ids];
    request({ unitIds: selected }, snapshot.sequence, "select");
    render(projection);
  };
  const groundTarget = position => {
    if (!projection.armed || selected.length === 0 || !snapshot) return;
    target = position;
    request({ position }, snapshot.sequence, "groundTarget");
    render(projection);
  };

  async function initializeGuest() {
    if (!moduleBytes || !bootstrap || !snapshot || snapshot.validity.status !== "VALIDITY_STATUS_CURRENT") return fault("A current snapshot and loaded guest are required to rearm.");
    if (snapshot.units.length > MAX_GUEST_ENTITIES) return fault("Snapshot exceeds the 64-unit guest preview limit; no units were truncated.");
    queue.reset("Guest generation replaced for explicit rearm.");
    const epoch = lifecycleEpoch;
    const connection = connectionGeneration;
    let loaded;
    try { loaded = await supervisor.load(moduleBytes); }
    catch (error) { return fault(`Module load failed: ${error.message}`); }
    if (epoch !== lifecycleEpoch || connection !== connectionGeneration || snapshot?.validity?.status !== "VALIDITY_STATUS_CURRENT") { supervisor.disarm(); return; }
    if (loaded.state !== "completed") return fault(`Module refused during ${loaded.phase}: ${loaded.reason}`);
    requestId += 1n;
    const init = encodeObject(v1.GuestRequest, { requestId: requestId.toString(), sessionId: bootstrap.sessionId, contextSequence: "0", initialize: bootstrap });
    const initialized = await supervisor.initialize(init);
    if (epoch !== lifecycleEpoch || connection !== connectionGeneration || snapshot?.validity?.status !== "VALIDITY_STATUS_CURRENT") { supervisor.disarm(); return; }
    if (initialized.state !== "completed") return fault(`Module initialization ${initialized.state}: ${initialized.reason}`);
    notify("armed", `${moduleName} armed at guest generation ${supervisor.generation}.`);
    queueMicrotask(() => sendObservation(snapshot));
  }

  async function loadModule(name, bytes) {
    disarm("Module replacement disarmed the previous guest.");
    moduleBytes = Uint8Array.from(bytes);
    moduleName = name;
    notify("module", name);
  }

  async function loadBundled(name) {
    const response = await fetch(new URL(`guests/${name}-preview.wasm`, assetBase), { cache: "no-store" });
    if (!response.ok) return fault(`Bundled ${name} guest could not be loaded (${response.status}).`);
    await loadModule(`${name}-preview.wasm`, new Uint8Array(await response.arrayBuffer()));
  }

  function handleEnvelope(envelope) {
    if (envelope.body === "bootstrap") {
      if (!pairedSession || envelope.bootstrap.sessionId !== pairedSession) throw new Error("bootstrap session does not match the paired session");
      if (bootstrap && bootstrap.sessionId !== envelope.bootstrap.sessionId) disarm("Session was replaced; explicit rearm is required.");
      bootstrap = envelope.bootstrap;
      notify(envelope.bootstrap.validity.status === "VALIDITY_STATUS_STALE" ? "stale" : "streaming", "Authenticated read-only session.");
      return;
    }
    snapshot = envelope.observation;
    const stale = snapshot.validity.status === "VALIDITY_STATUS_STALE";
    if (stale) disarm("Snapshot became stale; explicit rearm is required after current state returns.");
    notify("snapshot", stale ? "stale" : "current", snapshot);
    if (!stale && snapshot.units.length > MAX_GUEST_ENTITIES) disarm("Snapshot exceeds the 64-unit guest preview limit; no units were truncated.");
    else if (!stale && projection.armed) sendObservation(snapshot);
  }

  function connect(url, expectedSessionId, credential) {
    if (socket) socket.close();
    disarm("Pairing replaced the prior session.");
    bootstrap = null; snapshot = null; connectionGeneration++; protocolRefused = false;
    notify("connecting", "Connecting to loopback gateway…");
    let candidate, expectedSession;
    try { candidate = new URL(url); if (!known(candidate.protocol, ["ws:", "wss:"])) throw new Error(); }
    catch { notify("refused", "Gateway must be an absolute ws:// or wss:// URL."); return; }
    try { expectedSession = uuidBytesBase64(expectedSessionId); }
    catch (error) { notify("refused", error.message); return; }
    pairedSession = expectedSession;
    const generation = connectionGeneration;
    const candidateSocket = new WebSocket(candidate);
    socket = candidateSocket;
    candidateSocket.binaryType = "arraybuffer";
    const current = () => socket === candidateSocket && connectionGeneration === generation;
    candidateSocket.onopen = () => {
      if (!current()) { candidateSocket.close(); return; }
      const auth = encodeObject(v1.ClientEnvelope, { authenticate: { game: GAME, protocolVersion: PROTOCOL, profile: PROFILE, credential, origin: location.origin, expectedSessionId: expectedSession } });
      candidateSocket.send(auth);
      credential = "";
      elements.credential.value = "";
    };
    candidateSocket.onmessage = event => {
      if (!current()) return;
      const started = performance.now();
      if (!(event.data instanceof ArrayBuffer)) return disarm("Text server frames are not accepted.");
      try { handleEnvelope(decodeServerFrame(event.data, { bootstrap, negotiatedMaxFrameBytes: bootstrap?.limits?.maxFrameBytes })); }
      catch (error) { protocolRefused = true; disarm(`Server frame refused: ${error.message}`); notify("refused", error.message); candidateSocket.close(1008, "invalid preview frame"); }
      finally {
        performance.measure("barc-preview-frame", { start: started, end: performance.now() });
        frameMeasureCount++;
        if (frameMeasureCount > 128) { performance.clearMeasures("barc-preview-frame"); frameMeasureCount = 0; }
      }
    };
    candidateSocket.onerror = () => { if (current()) notify("refused", "Gateway connection failed."); };
    candidateSocket.onclose = () => { if (current() && !disposed && !protocolRefused) { disarm("Gateway disconnected; pair again and explicitly rearm."); notify("disconnected", "Gateway disconnected."); } };
  }

  elements.form.addEventListener("submit", event => { event.preventDefault(); connect(elements.gateway.value, elements.session.value, elements.credential.value); });
  root.querySelector("[data-guest=manual]").addEventListener("click", () => loadBundled("manual"));
  root.querySelector("[data-guest=custom]").addEventListener("click", () => loadBundled("custom"));
  root.querySelector("[data-action=import]").addEventListener("click", () => { disarm("Opening a file dialog disarmed the guest."); elements.file.click(); });
  root.querySelector("[data-action=rearm]").addEventListener("click", initializeGuest);
  root.querySelector("[data-action=disarm]").addEventListener("click", () => disarm("Guest explicitly disarmed."));
  root.querySelector("[data-action=target]").addEventListener("click", () => {
    const x = elements.targetX.valueAsNumber, z = elements.targetZ.valueAsNumber;
    if (!Number.isFinite(x) || !Number.isFinite(z)) return fault("Target coordinates must be finite numbers.");
    groundTarget({ x, z });
  });
  elements.file.addEventListener("change", async () => { const file = elements.file.files[0]; if (file) await loadModule(file.name, new Uint8Array(await file.arrayBuffer())); elements.file.value = ""; });
  elements.svg.addEventListener("compositionstart", () => composing = true);
  elements.svg.addEventListener("compositionend", () => composing = false);
  elements.svg.addEventListener("keydown", event => {
    if (composing || event.isComposing || event.target.closest("input,textarea,[contenteditable=true],[role=dialog]")) return;
    const own = snapshot?.units?.filter(unit => unit.observation === "OBSERVATION_KIND_OWN") ?? [];
    if (event.key === "Escape") { disarm("Escape disarmed the guest."); return; }
    if (!projection.armed) return;
    if (event.key === "Tab" && own.length) {
      event.preventDefault(); const index = Math.max(0, own.findIndex(unit => selected.includes(unit.id))); const next = own[(index + (event.shiftKey ? own.length - 1 : 1)) % own.length]; select([next.id]);
    } else if (known(event.key, ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"])) {
      event.preventDefault(); const step = event.shiftKey ? 0.25 : 10; if (event.key === "ArrowLeft") target.x -= step; if (event.key === "ArrowRight") target.x += step; if (event.key === "ArrowUp") target.z -= step; if (event.key === "ArrowDown") target.z += step; render(projection);
    } else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); groundTarget({ x: target.x, z: target.z }); }
  });
  elements.svg.addEventListener("pointerdown", event => { if (!projection.armed) return; pointerId = event.pointerId; pointerUnitId = event.target.closest("[data-unit-id]")?.dataset.unitId ?? null; elements.svg.setPointerCapture(pointerId); });
  elements.svg.addEventListener("lostpointercapture", () => { pointerId = null; pointerUnitId = null; });
  elements.svg.addEventListener("pointerup", event => {
    if (pointerId !== event.pointerId || !projection.armed) return; pointerId = null;
    const unit = pointerUnitId ? snapshot?.units?.find(candidate => candidate.id === pointerUnitId) : null;
    pointerUnitId = null;
    if (unit?.observation === "OBSERVATION_KIND_OWN") select([unit.id]);
    else { const point = elements.svg.createSVGPoint(); point.x = event.clientX; point.y = event.clientY; const local = point.matrixTransform(elements.svg.getScreenCTM().inverse()); groundTarget({ x: (local.x - 400) / 2, z: (local.y - 260) / 2 }); }
  });

  const suspend = reason => { if (!disposed) disarm(reason); };
  const blur = () => suspend("Window focus was lost; explicit rearm is required.");
  const visibility = () => { if (document.hidden) suspend("Page became hidden; explicit rearm is required."); };
  window.addEventListener("blur", blur); document.addEventListener("visibilitychange", visibility);

  function coordinates(position) { return { x: 400 + position.x * 2, y: 260 + position.z * 2 }; }
  function render(model) {
    projection = model;
    elements.status.textContent = `${model.connection}: ${model.detail}`;
    elements.status.dataset.state = model.connection;
    elements.module.textContent = `${model.moduleName} — ${model.moduleDetail}`;
    elements.diagnostic.textContent = model.armed ? "Guest armed. Preview output has no native authority." : "Guest disarmed. Rearm explicitly after reviewing state.";
    const observation = model.snapshot;
    elements.units.replaceChildren(); elements.features.replaceChildren(); elements.preview.replaceChildren();
    if (observation) {
      for (const feature of observation.features) { const p = coordinates(feature.position); const shape = svgElement("rect", { x: p.x - 5, y: p.y - 5, width: 10, height: 10, class: "feature" }); shape.dataset.featureId = feature.id; shape.dataset.definitionId = feature.definitionId; elements.features.append(shape); }
      for (const unit of observation.units) {
        const p = coordinates(unit.position); const own = unit.observation === "OBSERVATION_KIND_OWN";
        const shape = unit.observation === "OBSERVATION_KIND_RADAR" ? svgElement("rect", { x: p.x - 7, y: p.y - 7, width: 14, height: 14 }) : svgElement("circle", { cx: p.x, cy: p.y, r: own ? 10 : 8 });
        shape.setAttribute("class", `unit ${own ? "own" : unit.observation === "OBSERVATION_KIND_RADAR" ? "radar" : "visual"}${selected.includes(unit.id) ? " selected" : ""}`);
        shape.dataset.unitId = unit.id; shape.dataset.own = String(own); const title = svgElement("title"); title.textContent = `${unit.observation.replace("OBSERVATION_KIND_", "").toLowerCase()} unit ${unit.id}${Object.hasOwn(unit, "definitionId") ? ` type ${unit.definitionId}` : " type unknown"}`; shape.append(title); elements.units.append(shape);
      }
      const captured = Object.hasOwn(observation, "capturedAtUnixMs") ? ` · captured ${new Date(Number(observation.capturedAtUnixMs)).toISOString()}` : " · capture time unavailable";
      elements.age.textContent = `Snapshot ${observation.sequence}${captured}`;
      elements.selection.textContent = selected.length ? `Selected ${selected.join(", ")}` : "No own unit selected";
      elements.target.textContent = `Target X ${target.x.toFixed(2)} · Z ${target.z.toFixed(2)}`;
      const economy = observation.teamEconomy; elements.economy.textContent = economy ? `Metal ${economy.metal?.current ?? "—"} · Energy ${economy.energy?.current ?? "—"}` : "Economy unavailable";
    } else { elements.age.textContent = "No snapshot"; elements.selection.textContent = "No selection"; elements.target.textContent = "No target"; elements.economy.textContent = "Economy unavailable"; }
    if (model.preview?.groundTarget) {
      const p = coordinates(model.preview.groundTarget); const shape = svgElement("path", { d: `M ${p.x - 12} ${p.y} H ${p.x + 12} M ${p.x} ${p.y - 12} V ${p.y + 12}`, class: "move-preview" });
      shape.dataset.x = String(model.preview.groundTarget.x); shape.dataset.z = String(model.preview.groundTarget.z); shape.dataset.unitIds = model.preview.unitIds.join(","); elements.preview.append(shape);
      elements.previewDetail.textContent = `Guest Move · units ${model.preview.unitIds.join(", ")} · X ${model.preview.groundTarget.x.toFixed(2)} · Z ${model.preview.groundTarget.z.toFixed(2)}`;
    } else elements.previewDetail.textContent = "No guest preview";
    for (const control of root.querySelectorAll("[data-action=rearm], [data-action=disarm], [data-guest], svg")) control.toggleAttribute("aria-disabled", model.connection !== "current");
  }

  return {
    start() { if (options.initialGatewayUrl && options.initialExpectedSessionId && options.initialCredential) connect(options.initialGatewayUrl, options.initialExpectedSessionId, options.initialCredential); },
    render,
    dispose() { disposed = true; connectionGeneration++; queue.reset("Client disposed."); socket?.close(); window.removeEventListener("blur", blur); document.removeEventListener("visibilitychange", visibility); root.replaceChildren(); root.classList.remove("barc-preview"); }
  };
}
