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
