import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { requestIdentity, validateGuestResponse } from "../../src/Broker.Browser.Wasm/barc-wire.js";
import { encodeObject, v1 } from "../../src/Broker.Browser.Contracts/generated/codec.js";

const wire = (name) => readFile(new URL(`../../fixtures/barc-browser/wire/${name}.bin`, import.meta.url));
const liveWire = (name) => readFile(new URL(`../../fixtures/barc-live/wire/${name}.bin`, import.meta.url));
const liveSemantic = async name => JSON.parse(await readFile(new URL(`../../fixtures/barc-live/semantic/${name}.json`, import.meta.url), "utf8"));
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

test("tactical ABI output retains exact actor and catalogue revisions", async () => {
  const responseValue = await liveSemantic("tactical-guest-build-response");
  const expected = requestIdentity(encodeObject(v1.LiveGuestRequest, {
    inputId: responseValue.inputId, sessionId: responseValue.sessionId, moduleGeneration: responseValue.moduleGeneration,
    basis: responseValue.basis, manualInput:{source:"LIVE_INPUT_SOURCE_KEYBOARD",modifiers:{},action:responseValue.intent},
  }));
  const bytes = new Uint8Array(await liveWire("tactical-guest-build-response"));
  assert.deepEqual(validateGuestResponse(bytes, expected), bytes);
});

test("unknown tactical queue insertion actions are refused inside the Worker", async () => {
  const responseValue = await liveSemantic("tactical-guest-unknown-action-response");
  const expected = requestIdentity(encodeObject(v1.LiveGuestRequest, {
    inputId: responseValue.inputId, sessionId: responseValue.sessionId, moduleGeneration: responseValue.moduleGeneration,
    basis: responseValue.basis, manualInput:{source:"LIVE_INPUT_SOURCE_KEYBOARD",modifiers:{},action:responseValue.intent},
  }));
  const bytes = new Uint8Array(await liveWire("tactical-guest-unknown-action-response"));
  assert.throws(() => validateGuestResponse(bytes, expected), /insertion action is unknown/);
});
