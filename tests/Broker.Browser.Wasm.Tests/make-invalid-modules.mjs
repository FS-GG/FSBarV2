import { readFile, writeFile } from "node:fs/promises";

const directory = new URL("./generated/", import.meta.url);
const original = Uint8Array.from(await readFile(new URL("manual-preview.wasm", directory)));

const readU32 = (bytes, start) => {
  let value = 0, shift = 0, index = start, byte;
  do { byte = bytes[index++]; value += (byte & 0x7f) * (2 ** shift); shift += 7; } while (byte & 0x80);
  return { value, end: index };
};

const sections = (bytes) => {
  const result = [];
  let offset = 8;
  while (offset < bytes.length) {
    const start = offset;
    const id = bytes[offset++];
    const length = readU32(bytes, offset);
    offset = length.end;
    const content = offset;
    offset += length.value;
    result.push({ id, start, content, end: offset });
  }
  return result;
};

const insertBefore = (beforeId, added) => {
  const target = sections(original).find((section) => section.id >= beforeId && section.id !== 0);
  return Uint8Array.from([...original.subarray(0, target.start), ...added, ...original.subarray(target.start)]);
};

await writeFile(new URL("invalid-import.wasm", directory), insertBefore(2, [2, 1, 1]));
await writeFile(new URL("invalid-start.wasm", directory), insertBefore(8, [8, 1, 0]));
await writeFile(new URL("unbounded-table.wasm", directory), insertBefore(4, [4, 4, 1, 0x70, 0, 1]));

const changedExport = Uint8Array.from(original);
const from = new TextEncoder().encode("__heap_base");
const to = new TextEncoder().encode("evil_export");
outer: for (let index = 0; index <= changedExport.length - from.length; index += 1) {
  for (let at = 0; at < from.length; at += 1) if (changedExport[index + at] !== from[at]) continue outer;
  changedExport.set(to, index);
  break;
}
await writeFile(new URL("invalid-export.wasm", directory), changedExport);
