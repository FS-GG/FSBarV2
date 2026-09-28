import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const fixture = (name) => readFile(path.join(root, "fixtures/barc-browser/wire", `${name}.bin`));
const generated = (name) => `/tests/Broker.Browser.Wasm.Tests/generated/${name}.wasm`;

async function install(page, moduleName, timeout = 75) {
  await page.goto("/tests/Broker.Browser.Wasm.Tests/harness.html");
  await page.waitForFunction(() => window.GuestSupervisor !== undefined);
  return page.evaluate(async ({ moduleName, timeout }) => {
    window.supervisor = new window.GuestSupervisor({ limits: { phaseTimeoutMilliseconds: timeout } });
    const bytes = new Uint8Array(await (await fetch(`/tests/Broker.Browser.Wasm.Tests/generated/${moduleName}.wasm`)).arrayBuffer());
    return window.supervisor.load(bytes);
  }, { moduleName, timeout });
}

async function call(page, operation, bytes) {
  return page.evaluate(({ operation, bytes }) => window.supervisor[operation](bytes), { operation, bytes: Array.from(bytes) });
}

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
const text = (number, value) => blob(number, new TextEncoder().encode(value));
const fixed32 = (number, value) => {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setFloat32(0, value, true);
  return field(number, 5, bytes);
};
const position = (value) => [
  ...fixed32(1, value.x),
  ...(Object.hasOwn(value, "elevation") ? fixed32(2, value.elevation) : []),
  ...fixed32(3, value.z),
];
const observedUnit = (value) => [
  ...field(1, 0, varint(value.id)),
  ...(value.definitionId === undefined ? [] : field(2, 0, varint(value.definitionId))),
  ...(value.teamId === undefined ? [] : field(3, 0, varint(value.teamId))),
  ...field(4, 0, varint(value.observation)),
  ...blob(5, position(value.position)),
];
const observation = (value) => [
  ...blob(1, value.sessionId),
  ...field(2, 0, varint(value.sequence)),
  ...field(3, 0, varint(value.capturedAtUnixMs)),
  ...text(4, value.perspectiveId),
  ...blob(5, [...field(1, 0, varint(1)), ...field(2, 0, varint(value.sequence))]),
  ...value.units.flatMap((unit) => blob(6, observedUnit(unit))),
];
function encodeGuestRequest(value) {
  const common = [
    ...field(1, 0, varint(value.requestId)),
    ...blob(2, value.sessionId),
    ...field(3, 0, varint(value.contextSequence)),
  ];
  if (value.observation) return Uint8Array.from([...common, ...blob(11, observation(value.observation))]);
  if (value.select) {
    const packed = value.select.unitIds.flatMap(varint);
    return Uint8Array.from([...common, ...blob(12, blob(1, packed))]);
  }
  throw new Error("unsupported test request");
}

function moveUnitIds(bytesLike) {
  const bytes = Uint8Array.from(bytesLike);
  let index = 0;
  const readVarint = () => {
    let value = 0n;
    for (let shift = 0n;; shift += 7n) {
      const byte = bytes[index++];
      value |= BigInt(byte & 0x7f) << shift;
      if ((byte & 0x80) === 0) return value;
    }
  };
  const readBlob = () => {
    const length = Number(readVarint());
    const value = bytes.subarray(index, index + length);
    index += length;
    return value;
  };
  let move;
  while (index < bytes.length) {
    const key = Number(readVarint());
    const fieldNumber = key >> 3;
    const wire = key & 7;
    if (fieldNumber === 10 && wire === 2) move = readBlob();
    else if (wire === 0) readVarint();
    else if (wire === 2) readBlob();
    else if (wire === 5) index += 4;
    else if (wire === 1) index += 8;
    else throw new Error("unsupported response wire");
  }
  if (!move) return [];
  index = 0;
  const nested = move;
  const ids = [];
  const nestedVarint = () => {
    let value = 0n;
    for (let shift = 0n;; shift += 7n) {
      const byte = nested[index++]; value |= BigInt(byte & 0x7f) << shift;
      if ((byte & 0x80) === 0) return value;
    }
  };
  while (index < nested.length) {
    const key = Number(nestedVarint());
    const fieldNumber = key >> 3; const wire = key & 7;
    if (fieldNumber === 1 && wire === 2) {
      const length = Number(nestedVarint());
      const end = index + length;
      while (index < end) ids.push(nestedVarint().toString());
    } else if (wire === 0) nestedVarint();
    else if (wire === 2) index += Number(nestedVarint());
    else if (wire === 5) index += 4;
    else if (wire === 1) index += 8;
  }
  return ids;
}

test("manual and independently compiled custom guests emit the typed Move preview without native submission", async ({ page }) => {
  const network = [];
  page.on("request", (request) => network.push({ method: request.method(), url: request.url() }));
  const expected = await fixture("guest-move-preview");
  const noAction = await fixture("guest-no-action-ack");
  const hashes = [];
  for (const moduleName of ["manual-preview", "custom-preview"]) {
    const loaded = await install(page, moduleName);
    expect(loaded.state).toBe("completed");
    hashes.push(loaded.hash);
    expect((await call(page, "initialize", await fixture("guest-initialize"))).state).toBe("completed");
    const observed = await call(page, "process", await fixture("guest-observation"));
    expect(observed.state).toBe("completed");
    expect(Buffer.from(observed.output)).toEqual(noAction);
    expect((await call(page, "process", await fixture("guest-select"))).state).toBe("completed");
    const move = await call(page, "process", await fixture("guest-ground-target"));
    expect(move.state).toBe("completed");
    expect(Buffer.from(move.output)).toEqual(expected);
    expect((await page.evaluate(() => window.supervisor.shutdown())).state).toBe("completed");
  }
  expect(hashes[0]).not.toBe(hashes[1]);
  expect(network.every((request) => request.method === "GET")).toBe(true);
});

test("selection survives current snapshots, drops lost ownership, and reapplies custom policy", async ({ page }) => {
  const sessionId = Array.from(Buffer.from("00112233445566778899aabbccddeeff", "hex"));
  const sequence = "9007199254740993";
  const observation = (units) => ({
    requestId: "5",
    sessionId,
    contextSequence: sequence,
    observation: {
      sessionId,
      sequence,
      capturedAtUnixMs: "1770000000123",
      perspectiveId: "team-7",
      validity: { status: "VALIDITY_STATUS_CURRENT", lastSequence: sequence },
      units,
      features: [],
    },
  });
  const own77 = { id: "77", definitionId: 501, teamId: 7, observation: 1, position: { x: 1, z: 2 } };
  const own78 = { id: "78", definitionId: 502, teamId: 7, observation: 1, position: { x: 3, z: 4 } };
  const visual77 = { ...own77, teamId: 9, observation: 2 };
  const selectBoth = { requestId: "6", sessionId, contextSequence: sequence, select: { unitIds: ["77", "78"] } };

  expect((await install(page, "manual-preview")).state).toBe("completed");
  expect((await call(page, "initialize", await fixture("guest-initialize"))).state).toBe("completed");
  expect((await call(page, "process", encodeGuestRequest(observation([own77, own78])))).state).toBe("completed");
  expect((await call(page, "process", encodeGuestRequest(selectBoth))).state).toBe("completed");
  // A newer complete snapshot with both units still owned must retain selection.
  expect((await call(page, "process", encodeGuestRequest(observation([own77, own78])))).state).toBe("completed");
  let target = await call(page, "process", await fixture("guest-ground-target"));
  expect(moveUnitIds(target.output)).toEqual(["77", "78"]);

  // Ownership loss removes 77 while the still-owned 78 remains.
  expect((await call(page, "process", encodeGuestRequest(observation([visual77, own78])))).state).toBe("completed");
  target = await call(page, "process", await fixture("guest-ground-target"));
  expect(moveUnitIds(target.output)).toEqual(["78"]);

  // The independent odd-ID policy retains only 77 across the same snapshot.
  expect((await install(page, "custom-preview")).state).toBe("completed");
  expect((await call(page, "initialize", await fixture("guest-initialize"))).state).toBe("completed");
  expect((await call(page, "process", encodeGuestRequest(observation([own77, own78])))).state).toBe("completed");
  expect((await call(page, "process", encodeGuestRequest(selectBoth))).state).toBe("completed");
  expect((await call(page, "process", encodeGuestRequest(observation([own77, own78])))).state).toBe("completed");
  target = await call(page, "process", await fixture("guest-ground-target"));
  expect(moveUnitIds(target.output)).toEqual(["77"]);

  // Reinitialization is the session boundary and cannot retain selection.
  expect((await call(page, "initialize", await fixture("guest-initialize"))).state).toBe("completed");
  expect((await call(page, "process", encodeGuestRequest(observation([own77, own78])))).state).toBe("completed");
  target = await call(page, "process", await fixture("guest-ground-target"));
  expect(moveUnitIds(target.output)).toEqual([]);
});

test("the host zeros the reused output descriptor before every guest call", async ({ page }) => {
  expect((await install(page, "require-zero-descriptor")).state).toBe("completed");
  expect((await call(page, "initialize", await fixture("guest-initialize"))).state).toBe("completed");
  expect((await call(page, "process", await fixture("guest-observation"))).state).toBe("completed");
  expect((await call(page, "process", await fixture("guest-select"))).state).toBe("completed");
});

for (const mode of ["hang", "trap"]) {
  for (const phase of ["alloc", "init", "process", "free", "shutdown"]) {
    test(`${mode} in ${phase} is contained by the external Worker watchdog`, async ({ page }) => {
      expect((await install(page, `${mode}-${phase}`, 50)).state).toBe("completed");
      if (phase === "process" || phase === "shutdown") {
        expect((await call(page, "initialize", await fixture("guest-initialize"))).state).toBe("completed");
      }
      if (phase === "process") {
        await page.evaluate((bytes) => { window.pending = window.supervisor.process(bytes); }, Array.from(await fixture("guest-observation")));
      } else if (phase === "shutdown") {
        await page.evaluate(() => { window.pending = window.supervisor.shutdown(); });
      } else {
        await page.evaluate((bytes) => { window.pending = window.supervisor.initialize(bytes); }, Array.from(await fixture("guest-initialize")));
      }
      const before = await page.evaluate(() => window.ticks);
      await page.locator("#responsive").click();
      const result = await page.evaluate(() => window.pending);
      expect(result.state).toBe(mode === "hang" ? "timed-out" : "faulted");
      expect(await page.evaluate(() => ({ ticks: window.ticks, clicks: window.clicks, active: window.supervisor.active }))).toEqual({
        ticks: expect.any(Number), clicks: 1, active: false,
      });
      expect(await page.evaluate(() => window.ticks)).toBeGreaterThan(before);
    });
  }
}

for (const invalid of ["guest-invalid-context", "guest-invalid-session"]) {
  test(`${invalid} is refused by the Rust guest before any preview`, async ({ page }) => {
    expect((await install(page, "manual-preview")).state).toBe("completed");
    expect((await call(page, "initialize", await fixture("guest-initialize"))).state).toBe("completed");
    expect((await call(page, "process", await fixture("guest-observation"))).state).toBe("completed");
    const result = await call(page, "process", await fixture(invalid));
    expect(result.state).toBe("faulted");
    expect(result.output).toEqual([]);
  });
}

for (const moduleName of ["oob-descriptor", "overlap-output", "malformed-output", "oversized-output"]) {
  test(`${moduleName} output is refused inside the Worker`, async ({ page }) => {
    expect((await install(page, moduleName)).state).toBe("completed");
    expect((await call(page, "initialize", await fixture("guest-initialize"))).state).toBe("completed");
    const result = await call(page, "process", await fixture("guest-observation"));
    expect(result.state).toBe("faulted");
    expect(await page.evaluate(() => window.supervisor.active)).toBe(false);
  });
}

for (const moduleName of ["invalid-import", "invalid-start", "unbounded-table", "invalid-export"]) {
  test(`${moduleName} is rejected by the real Worker before activation`, async ({ page }) => {
    const result = await install(page, moduleName);
    expect(result.state).toBe("faulted");
    expect(await page.evaluate(() => window.supervisor.active)).toBe(false);
  });
}

test("replacing a hung generation discards its pending output and accepts a fresh module", async ({ page }) => {
  expect((await install(page, "hang-process", 100)).state).toBe("completed");
  expect((await call(page, "initialize", await fixture("guest-initialize"))).state).toBe("completed");
  const result = await page.evaluate(async ({ observation, replacement }) => {
    const stale = window.supervisor.process(observation);
    const bytes = new Uint8Array(await (await fetch(replacement)).arrayBuffer());
    const fresh = await window.supervisor.load(bytes);
    return { stale: await stale, fresh, generation: window.supervisor.generation };
  }, { observation: Array.from(await fixture("guest-observation")), replacement: generated("manual-preview") });
  expect(result.stale.state).toBe("discarded");
  expect(result.fresh.state).toBe("completed");
  expect(result.fresh.generation).toBe(result.generation);
});

test("disarm stays responsive and discards a hung generation", async ({ page }) => {
  expect((await install(page, "hang-process", 500)).state).toBe("completed");
  expect((await call(page, "initialize", await fixture("guest-initialize"))).state).toBe("completed");
  await page.evaluate((observation) => { window.pending = window.supervisor.process(observation); }, Array.from(await fixture("guest-observation")));
  await page.locator("#responsive").click();
  const result = await page.evaluate(async () => { window.supervisor.disarm(); return window.pending; });
  expect(result.state).toBe("discarded");
  expect(await page.evaluate(() => ({ active: window.supervisor.active, clicks: window.clicks }))).toEqual({ active: false, clicks: 1 });
});
