import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { requestIdentity, validateGuestResponse } from "../../src/Broker.Browser.Wasm/barc-wire.js";

const wire = (name) => readFile(new URL(`../../fixtures/barc-browser/wire/${name}.bin`, import.meta.url));
const varint = (value) => {
  const bytes = [];
  for (let current = BigInt(value);;) {
    let byte = Number(current & 0x7fn);
    current >>= 7n;
    if (current !== 0n) byte |= 0x80;
    bytes.push(byte);
    if (current === 0n) return bytes;
  }
};
const field = (number, wireType, bytes) => [(number << 3) | wireType, ...bytes];
const blob = (number, bytes) => field(number, 2, [...varint(bytes.length), ...bytes]);

const response = (identity, move) => Uint8Array.from([
  ...field(1, 0, varint(identity.requestId)),
  ...blob(2, identity.sessionId),
  ...field(3, 0, varint(identity.contextSequence)),
  ...field(4, 0, [1]),
  ...field(6, 0, [1]),
  ...blob(10, move),
]);

test("the shared corpus Move response passes bounded typed validation", async () => {
  const identity = requestIdentity(await wire("guest-ground-target"));
  assert.deepEqual(validateGuestResponse(await wire("guest-move-preview"), identity), new Uint8Array(await wire("guest-move-preview")));
});

test("malformed nested Move bytes are refused", async () => {
  const identity = requestIdentity(await wire("guest-ground-target"));
  assert.throws(() => validateGuestResponse(response(identity, [0x0a, 0x80]), identity), /truncated|unterminated/);
});

test("non-finite Move coordinates are refused", async () => {
  const identity = requestIdentity(await wire("guest-ground-target"));
  const nan = [0x00, 0x00, 0xc0, 0x7f];
  const position = [...field(1, 5, nan), ...field(3, 5, [0, 0, 0, 0])];
  const move = [...blob(1, [77]), ...blob(2, position)];
  assert.throws(() => validateGuestResponse(response(identity, move), identity), /non-finite coordinate/);
});

test("empty and zero Move unit identities are refused", async () => {
  const identity = requestIdentity(await wire("guest-ground-target"));
  for (const packed of [[], [0]]) {
    const move = [...blob(1, packed), ...blob(2, [])];
    assert.throws(() => validateGuestResponse(response(identity, move), identity), /nonzero unit identities/);
  }
});
