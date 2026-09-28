import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { validateGuestModule } from "../../src/Broker.Browser.Wasm/wasm-profile.js";

const moduleBytes = () => readFile(new URL("./generated/manual-preview.wasm", import.meta.url));

const sections = (bytes) => {
  const result = [];
  let offset = 8;
  const u32 = () => {
    let value = 0, shift = 0, byte;
    do { byte = bytes[offset++]; value += (byte & 0x7f) * (2 ** shift); shift += 7; } while (byte & 0x80);
    return value;
  };
  while (offset < bytes.length) {
    const start = offset;
    const id = bytes[offset++];
    const length = u32();
    const content = offset;
    offset += length;
    result.push({ id, start, content, end: offset });
  }
  return result;
};

const insertBefore = (bytes, beforeId, added) => {
  const target = sections(bytes).find((section) => section.id >= beforeId && section.id !== 0);
  return Uint8Array.from([...bytes.subarray(0, target.start), ...added, ...bytes.subarray(target.start)]);
};

test("the exact Rust module has finite memory and the candidate export signatures", async () => {
  const profile = validateGuestModule(await moduleBytes());
  assert.equal(profile.memory.maximum, 1024);
  assert.equal(profile.table, null);
});

test("imports, start functions, unbounded tables, and unexpected exports are refused", async () => {
  const original = Uint8Array.from(await moduleBytes());
  const imported = insertBefore(original, 2, [2, 1, 1]);
  assert.throws(() => validateGuestModule(imported), /imports are forbidden/);
  const started = insertBefore(original, 8, [8, 1, 0]);
  assert.throws(() => validateGuestModule(started), /start function is forbidden/);
  const table = insertBefore(original, 4, [4, 4, 1, 0x70, 0, 1]);
  assert.throws(() => validateGuestModule(table), /finite maximum/);
  const exportName = new TextEncoder().encode("__heap_base");
  const replacement = new TextEncoder().encode("evil_export");
  const changed = Uint8Array.from(original);
  outer: for (let index = 0; index <= changed.length - exportName.length; index += 1) {
    for (let at = 0; at < exportName.length; at += 1) if (changed[index + at] !== exportName[at]) continue outer;
    changed.set(replacement, index);
    break;
  }
  assert.throws(() => validateGuestModule(changed), /unexpected export evil_export/);
});
