import { validateGuestModule } from "./wasm-profile.js";
import { requestIdentity, validateGuestResponse } from "./barc-wire.js";

const ABI_VERSION = 1;
let guest = null;
let generation = 0;
let limits = null;

const phase = (id, name) => self.postMessage({ id, generation, state: "phase", phase: name });
const checkedRange = (pointer, length, memoryLength, label) => {
  const start = pointer >>> 0;
  const size = length >>> 0;
  const end = start + size;
  if (!Number.isSafeInteger(end) || end > memoryLength) throw new Error(`${label} is outside guest memory`);
  return { start, end };
};
const overlaps = (left, right) => left.start < right.end && right.start < left.end;
const memory = () => {
  if (!(guest?.memory instanceof WebAssembly.Memory)) throw new Error("guest memory is unavailable");
  const byteLength = guest.memory.buffer.byteLength;
  if (byteLength > limits.maximumMemoryPages * 65536) throw new Error("guest memory exceeds its declared profile");
  return { bytes: new Uint8Array(guest.memory.buffer), byteLength };
};

const callFree = (id, pointer, length) => {
  if (pointer === 0 || length === 0) return;
  phase(id, "free");
  guest.barc_free(pointer, length);
};

const invoke = (id, name, inputBytes) => {
  const input = Uint8Array.from(inputBytes);
  const identity = requestIdentity(input);
  if (input.byteLength > limits.maximumInputBytes) throw new Error("guest input exceeds its byte limit");
  phase(id, "alloc-descriptor");
  const descriptorPointer = guest.barc_alloc(8) >>> 0;
  let inputPointer = 0;
  try {
    phase(id, "alloc-input");
    inputPointer = input.byteLength === 0 ? 0 : guest.barc_alloc(input.byteLength) >>> 0;
    let current = memory();
    const descriptor = checkedRange(descriptorPointer, 8, current.byteLength, "output descriptor");
    if (descriptorPointer === 0 || (descriptorPointer & 3) !== 0) throw new Error("output descriptor is null or unaligned");
    current.bytes.fill(0, descriptor.start, descriptor.end);
    const inputRange = checkedRange(inputPointer, input.byteLength, current.byteLength, "input");
    if (input.byteLength !== 0 && (inputPointer === 0 || (inputPointer & 3) !== 0)) throw new Error("input is null or unaligned");
    if (overlaps(descriptor, inputRange)) throw new Error("input overlaps its output descriptor");
    current.bytes.set(input, inputPointer);
    phase(id, name === "barc_initialize" ? "initialize" : "process");
    const status = guest[name](inputPointer, input.byteLength, descriptorPointer) | 0;
    if (status !== 0) throw new Error(`${name} rejected input (${status})`);
    current = memory();
    const descriptorAfter = checkedRange(descriptorPointer, 8, current.byteLength, "output descriptor");
    const view = new DataView(current.bytes.buffer, descriptorAfter.start, 8);
    const outputPointer = view.getUint32(0, true);
    const outputLength = view.getUint32(4, true);
    if (outputLength > limits.maximumOutputBytes) throw new Error("guest output exceeds its byte limit");
    if (outputLength === 0) throw new Error("successful guest output is empty");
    const output = checkedRange(outputPointer, outputLength, current.byteLength, "output");
    if ((outputPointer & 3) !== 0 || outputPointer === 0) throw new Error("output is null or unaligned");
    if (overlaps(output, descriptorAfter) || overlaps(output, inputRange)) throw new Error("output overlaps host-owned memory");
    const copied = Array.from(validateGuestResponse(current.bytes.slice(output.start, output.end), identity));
    callFree(id, outputPointer, outputLength);
    return copied;
  } finally {
    callFree(id, inputPointer, input.byteLength);
    callFree(id, descriptorPointer, 8);
  }
};

self.onmessage = async (event) => {
  const message = event.data;
  const { id } = message;
  generation = message.generation >>> 0;
  try {
    if (message.operation === "load") {
      limits = message.limits;
      const bytes = new Uint8Array(message.bytes);
      phase(id, "validate");
      validateGuestModule(bytes, limits);
      phase(id, "compile");
      const module = await WebAssembly.compile(bytes);
      if (WebAssembly.Module.imports(module).length !== 0) throw new Error("guest imports are forbidden");
      phase(id, "instantiate");
      const instance = await WebAssembly.instantiate(module, {});
      guest = instance.exports;
      phase(id, "abi-version");
      if ((guest.barc_abi_version() | 0) !== ABI_VERSION) throw new Error("unsupported BARC guest ABI version");
      memory();
      const digest = await crypto.subtle.digest("SHA-256", bytes);
      const hash = Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
      self.postMessage({ id, generation, state: "completed", phase: "load", output: [], hash });
      return;
    }
    if (guest === null) throw new Error("guest is not loaded");
    if (message.operation === "initialize" || message.operation === "process") {
      const output = invoke(id, `barc_${message.operation}`, message.inputBytes);
      self.postMessage({ id, generation, state: "completed", phase: message.operation, output });
      return;
    }
    if (message.operation === "shutdown") {
      phase(id, "shutdown");
      const status = guest.barc_shutdown() | 0;
      if (status !== 0) throw new Error(`barc_shutdown failed (${status})`);
      guest = null;
      self.postMessage({ id, generation, state: "completed", phase: "shutdown", output: [] });
      return;
    }
    throw new Error("unknown guest operation");
  } catch (error) {
    guest = null;
    self.postMessage({ id, generation, state: "faulted", phase: message.operation, reason: String(error?.message ?? error), output: [] });
  }
};
