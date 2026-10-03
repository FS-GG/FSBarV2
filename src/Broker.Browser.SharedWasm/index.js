import * as bridge from "./fable/Adapter.js";
import { createHostTransport } from "./_content/FS.GG.Wasm.Browser/worker-client.mjs";
import { requestIdentity, validateGuestResponse } from "../Broker.Browser.Wasm/barc-wire.js";

const sha256 = async bytes => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), x => x.toString(16).padStart(2, "0")).join("");

export const DEFAULT_LIMITS = Object.freeze({ ...bridge.defaultLimits });

// Promise and byte conversion only; policy and retirement belong to the F# adapter/Host.
export class GuestSupervisor {
  #adapter;
  #request = 0;
  #waiting = new Map();
  constructor({ workerUrl, assetBase = new URL("./_content/FS.GG.Wasm.Browser/", import.meta.url), limits = {} } = {}) {
    if (workerUrl) assetBase = new URL("./", workerUrl);
    for (const [name, value] of Object.entries(limits)) {
      if (!(name in DEFAULT_LIMITS) || !Number.isSafeInteger(value) || value > 2147483647)
        throw new TypeError(`invalid BAR limit boundary: ${name}`);
    }
    this.#adapter = bridge.create(createHostTransport(assetBase), { ...DEFAULT_LIMITS, ...limits },
      (input, output) => { validateGuestResponse(output, requestIdentity(input)); },
      result => {
        const resolve = this.#waiting.get(result.request);
        this.#waiting.delete(result.request);
        resolve?.({ ...result, output: Array.from(result.output) });
      });
  }
  get generation() { return bridge.generation(this.#adapter); }
  get active() { return bridge.active(this.#adapter); }
  #send(operation, ...args) {
    const request = String(++this.#request);
    return new Promise((resolve, reject) => {
      this.#waiting.set(request, resolve);
      try { bridge[operation](this.#adapter, request, ...args); }
      catch (error) { this.#waiting.delete(request); reject(error); }
    });
  }
  async load(value) {
    const generation = bridge.beginLoad(this.#adapter);
    const bytes = Uint8Array.from(value);
    const digest = await sha256(bytes);
    const configurationDigest = await sha256(new TextEncoder().encode(bridge.configurationDocument(this.#adapter, digest)));
    return this.#send("load", bytes, digest, configurationDigest, generation);
  }
  initialize(bytes) { return this.#send("initialize", Uint8Array.from(bytes)); }
  process(bytes) { return this.#send("invoke", Uint8Array.from(bytes)); }
  shutdown() { return this.#send("shutdown"); }
  disarm() { bridge.retire(this.#adapter, "guest was disarmed"); }
  dispose() { bridge.retire(this.#adapter, "guest supervisor was disposed"); }
}
