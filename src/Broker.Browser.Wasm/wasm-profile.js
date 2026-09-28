const PAGE_BYTES = 64 * 1024;

const fail = (message) => { throw new Error(`invalid BARC guest module: ${message}`); };

class Reader {
  constructor(bytes, start = 0, end = bytes.length) {
    this.bytes = bytes;
    this.offset = start;
    this.end = end;
  }

  byte() {
    if (this.offset >= this.end) fail("unexpected end of module");
    return this.bytes[this.offset++];
  }

  bytesOf(length) {
    const end = this.offset + length;
    if (!Number.isSafeInteger(end) || end > this.end) fail("section extends beyond the module");
    const value = this.bytes.subarray(this.offset, end);
    this.offset = end;
    return value;
  }

  u32() {
    let value = 0;
    let shift = 0;
    for (let index = 0; index < 5; index += 1) {
      const byte = this.byte();
      if (index === 4 && (byte & 0xf0) !== 0) fail("u32 LEB128 overflow");
      value += (byte & 0x7f) * (2 ** shift);
      if ((byte & 0x80) === 0) return value >>> 0;
      shift += 7;
    }
    fail("unterminated u32 LEB128");
  }

  name() {
    const bytes = this.bytesOf(this.u32());
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      fail("export name is not valid UTF-8");
    }
  }

  done() { return this.offset === this.end; }
}

const vector = (reader, read) => {
  const length = reader.u32();
  const values = [];
  for (let index = 0; index < length; index += 1) values.push(read(reader));
  return values;
};

const limits = (reader, kind, maximum) => {
  const flags = reader.u32();
  if ((flags & ~0x03) !== 0) fail(`${kind} uses unsupported limits flags`);
  if ((flags & 0x02) !== 0) fail(`${kind} must not be shared`);
  const minimum = reader.u32();
  if ((flags & 0x01) === 0) fail(`${kind} must declare a finite maximum`);
  const declaredMaximum = reader.u32();
  if (minimum > declaredMaximum) fail(`${kind} minimum exceeds its maximum`);
  if (declaredMaximum > maximum) fail(`${kind} maximum exceeds ${maximum}`);
  return { minimum, maximum: declaredMaximum };
};

const functionType = (reader) => {
  if (reader.byte() !== 0x60) fail("unsupported type form");
  const parameters = vector(reader, (item) => item.byte());
  const results = vector(reader, (item) => item.byte());
  return { parameters, results };
};

const expectedFunctions = new Map([
  ["barc_abi_version", { parameters: [], results: [0x7f] }],
  ["barc_alloc", { parameters: [0x7f], results: [0x7f] }],
  ["barc_free", { parameters: [0x7f, 0x7f], results: [] }],
  ["barc_initialize", { parameters: [0x7f, 0x7f, 0x7f], results: [0x7f] }],
  ["barc_process", { parameters: [0x7f, 0x7f, 0x7f], results: [0x7f] }],
  ["barc_shutdown", { parameters: [], results: [0x7f] }],
]);

const sameType = (actual, expected) =>
  actual !== undefined
  && actual.parameters.length === expected.parameters.length
  && actual.results.length === expected.results.length
  && actual.parameters.every((value, index) => value === expected.parameters[index])
  && actual.results.every((value, index) => value === expected.results[index]);

export function validateGuestModule(bytesLike, profile = {}) {
  const bytes = bytesLike instanceof Uint8Array ? bytesLike : new Uint8Array(bytesLike);
  const maximumArtifactBytes = profile.maximumArtifactBytes ?? 8 * 1024 * 1024;
  const maximumMemoryPages = profile.maximumMemoryPages ?? 1024;
  const maximumTableElements = profile.maximumTableElements ?? 4096;
  if (bytes.byteLength === 0 || bytes.byteLength > maximumArtifactBytes) fail("artifact exceeds its byte limit");
  const reader = new Reader(bytes);
  const preamble = reader.bytesOf(8);
  if (![0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00].every((value, index) => preamble[index] === value)) {
    fail("magic or version is unsupported");
  }

  const types = [];
  const functions = [];
  const memories = [];
  const tables = [];
  const exports = new Map();
  const seen = new Set();
  let lastSection = 0;

  while (!reader.done()) {
    const id = reader.byte();
    const sectionLength = reader.u32();
    const sectionStart = reader.offset;
    const section = new Reader(bytes, sectionStart, sectionStart + sectionLength);
    reader.offset = section.end;
    if (section.end > reader.end) fail("section extends beyond the module");
    if (id !== 0) {
      if (id > 12 || seen.has(id) || id < lastSection) fail("standard sections are duplicated or out of order");
      seen.add(id);
      lastSection = id;
    }
    if (id === 1) types.push(...vector(section, functionType));
    else if (id === 2) {
      if (section.u32() !== 0) fail("imports are forbidden");
    } else if (id === 3) functions.push(...vector(section, (item) => item.u32()));
    else if (id === 4) {
      tables.push(...vector(section, (item) => {
        const referenceType = item.byte();
        if (referenceType !== 0x70 && referenceType !== 0x6f) fail("unsupported table reference type");
        return limits(item, "table", maximumTableElements);
      }));
    } else if (id === 5) memories.push(...vector(section, (item) => limits(item, "memory", maximumMemoryPages)));
    else if (id === 7) {
      for (const entry of vector(section, (item) => ({ name: item.name(), kind: item.byte(), index: item.u32() }))) {
        if (exports.has(entry.name)) fail(`duplicate export ${entry.name}`);
        exports.set(entry.name, entry);
      }
    } else if (id === 8) fail("a start function is forbidden");
    if (![0, 6, 9, 10, 11, 12].includes(id) && !section.done()) fail(`section ${id} contains trailing bytes`);
  }

  if (memories.length !== 1) fail("exactly one bounded memory is required");
  if (tables.length > 1) fail("at most one bounded table is allowed");
  const expectedNames = new Set(["memory", ...expectedFunctions.keys()]);
  const permittedToolchainGlobals = new Set(["__data_end", "__heap_base"]);
  for (const [name, entry] of exports) {
    if (!expectedNames.has(name) && !(permittedToolchainGlobals.has(name) && entry.kind === 3)) fail(`unexpected export ${name}`);
  }
  if ([...expectedNames].some((name) => !exports.has(name))) fail("the complete BARC export set is required");
  const memoryExport = exports.get("memory");
  if (memoryExport?.kind !== 2 || memoryExport.index !== 0) fail("memory export is missing or invalid");
  for (const [name, expected] of expectedFunctions) {
    const entry = exports.get(name);
    if (entry?.kind !== 0) fail(`function export ${name} is missing`);
    const actual = types[functions[entry.index]];
    if (!sameType(actual, expected)) fail(`function export ${name} has the wrong signature`);
  }
  return Object.freeze({ artifactBytes: bytes.byteLength, memory: memories[0], table: tables[0] ?? null });
}

export { PAGE_BYTES };
