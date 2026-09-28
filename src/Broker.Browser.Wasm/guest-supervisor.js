const DEFAULT_LIMITS = Object.freeze({
  maximumArtifactBytes: 8 * 1024 * 1024,
  maximumMemoryPages: 1024,
  maximumTableElements: 4096,
  maximumInputBytes: 64 * 1024,
  maximumOutputBytes: 64 * 1024,
  phaseTimeoutMilliseconds: 250,
});

export class GuestSupervisor {
  #workerUrl;
  #worker = null;
  #generation = 0;
  #nextId = 1;
  #pending = null;
  #limits;

  constructor({ workerUrl = new URL("./guest-worker.js", import.meta.url), limits = {} } = {}) {
    this.#workerUrl = workerUrl;
    this.#limits = Object.freeze({ ...DEFAULT_LIMITS, ...limits });
  }

  get generation() { return this.#generation; }
  get active() { return this.#worker !== null; }

  #destroy(reason = "guest generation was replaced") {
    this.#generation = (this.#generation + 1) >>> 0;
    this.#worker?.terminate();
    this.#worker = null;
    if (this.#pending !== null) {
      const pending = this.#pending;
      this.#pending = null;
      clearTimeout(pending.timer);
      pending.resolve({ state: "discarded", phase: pending.phase, reason, output: [], generation: pending.generation });
    }
  }

  disarm() { this.#destroy("guest was disarmed"); }
  dispose() { this.#destroy("guest supervisor was disposed"); }

  #request(message) {
    if (this.#worker === null) return Promise.resolve({ state: "faulted", phase: message.operation, reason: "guest is not active", output: [], generation: this.#generation });
    if (this.#pending !== null) return Promise.resolve({ state: "faulted", phase: message.operation, reason: "a guest operation is already active", output: [], generation: this.#generation });
    const id = this.#nextId++;
    const generation = this.#generation;
    return new Promise((resolve) => {
      const pending = { id, generation, phase: message.operation, resolve, timer: null };
      const arm = () => {
        clearTimeout(pending.timer);
        pending.timer = setTimeout(() => {
          if (this.#pending !== pending) return;
          this.#pending = null;
          const phase = pending.phase;
          this.#destroy(`guest timed out during ${phase}`);
          resolve({ state: "timed-out", phase, reason: `guest exceeded its ${this.#limits.phaseTimeoutMilliseconds} ms ${phase} budget`, output: [], generation });
        }, this.#limits.phaseTimeoutMilliseconds);
      };
      this.#pending = pending;
      arm();
      this.#worker.onmessage = (event) => {
        const result = event.data;
        if (this.#pending !== pending || result.id !== id || result.generation !== generation) return;
        if (result.state === "phase") {
          pending.phase = result.phase;
          arm();
          return;
        }
        this.#pending = null;
        clearTimeout(pending.timer);
        if (result.state !== "completed") this.#destroy("guest faulted");
        resolve(result);
      };
      this.#worker.onerror = (event) => {
        if (this.#pending !== pending) return;
        this.#pending = null;
        clearTimeout(pending.timer);
        this.#destroy("guest worker failed");
        resolve({ state: "faulted", phase: pending.phase, reason: event.message || "guest worker failed", output: [], generation });
      };
      this.#worker.postMessage({ ...message, id, generation });
    });
  }

  async load(bytesLike) {
    this.#destroy("guest generation was replaced");
    const generation = this.#generation;
    this.#worker = new Worker(this.#workerUrl, { type: "module", name: `barc-guest-${generation}` });
    const bytes = Uint8Array.from(bytesLike);
    return this.#request({ operation: "load", limits: this.#limits, bytes: bytes.buffer });
  }

  initialize(bytes) { return this.#request({ operation: "initialize", inputBytes: Array.from(bytes) }); }
  process(bytes) { return this.#request({ operation: "process", inputBytes: Array.from(bytes) }); }
  shutdown() { return this.#request({ operation: "shutdown" }); }
}

export { DEFAULT_LIMITS };
