import { test, expect } from "@playwright/test";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createServer } from "node:net";
import { chmod, cp, mkdir, mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { selectProductUrl } from "./product-topology.mjs";

const enabled = process.env.BARC_RUN_ACTUAL_COMPANION === "1";
test.skip(!enabled, "set BARC_RUN_ACTUAL_COMPANION=1 after building the production client, guests, and companion");

const root = resolve("../..");
const source = relative => resolve(root, relative);
const wait = milliseconds => new Promise(resolveWait => setTimeout(resolveWait, milliseconds));
const sha256 = async path => createHash("sha256").update(await readFile(path)).digest("hex");

async function freePort() {
  const listener = createServer();
  await new Promise(resolveListen => listener.listen(0, "127.0.0.1", resolveListen));
  const port = listener.address().port;
  await new Promise(resolveClose => listener.close(resolveClose));
  return port;
}

async function waitForFile(path, timeoutMilliseconds = 10000) {
  const deadline = Date.now() + timeoutMilliseconds;
  while (Date.now() < deadline) {
    try { return JSON.parse(await readFile(path, "utf8")); }
    catch { await wait(25); }
  }
  throw new Error(`timed out waiting for private handoff ${path}`);
}

async function copyAssets(destination) {
  const copies = [
    ["src/Broker.Browser.Client/dist/assets", "assets"],
    ["src/Broker.Browser.Wasm", "src/Broker.Browser.Wasm"],
    ["src/Broker.Browser.Contracts/generated", "src/Broker.Browser.Contracts/generated"]
  ];
  for (const [from, to] of copies) {
    await mkdir(join(destination, dirname(to)), { recursive: true });
    await cp(source(from), join(destination, to), { recursive: true });
  }
  await mkdir(join(destination, "guests"), { recursive: true });
  for (const guest of ["manual-preview.wasm", "custom-preview.wasm"]) {
    await cp(source(`tests/Broker.Browser.Wasm.Tests/generated/${guest}`), join(destination, "guests", guest));
  }
}

async function stop(child) {
  const exited = new Promise((resolveExit, rejectExit) => {
    child.once("exit", (code, signal) => code === 0 ? resolveExit() : rejectExit(new Error(`companion exited with code ${code} signal ${signal}`)));
  });
  child.kill("SIGINT");
  await Promise.race([exited, wait(10000).then(() => { child.kill("SIGKILL"); throw new Error("companion did not stop cleanly"); })]);
}

async function chooseFile(page, barc, buttonName, path) {
  const chooser = page.waitForEvent("filechooser");
  await barc.getByRole("button", { name: buttonName }).click();
  await (await chooser).setFiles(path);
}

async function rearm(barc) {
  await barc.getByRole("button", { name: "Rearm" }).click();
  await expect(barc.locator(".module")).toContainText("armed at guest generation");
}

async function selectAndKeyboardTarget(page, barc) {
  const svg = barc.getByLabel(/Tactical map/);
  await svg.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(barc.locator(".selection")).toContainText("Selected 77");
  await barc.getByLabel("Target X").fill("128.25");
  await barc.getByLabel("Target Z").fill("-64.5");
  await barc.getByRole("button", { name: "Preview target" }).press("Enter");
  await expect(barc.locator(".move-preview")).toHaveAttribute("data-unit-ids", "77");
  await expect(barc.locator(".preview-detail")).toContainText("X 128.25 · Z -64.50");
}

test("actual companion preserves the complete read-only product boundary", async ({ page, browser }) => {
  test.setTimeout(45000);
  const temporary = await mkdtemp(join(tmpdir(), "barc-client-actual-"));
  await chmod(temporary, 0o700);
  const externalReady = process.env.BARC_EXTERNAL_READY_FILE;
  const assets = join(temporary, "assets-root");
  const readyPath = externalReady || join(temporary, "ready.json");
  const receiptPath = join(temporary, "qualification.json");
  let child = null;
  const output = [];
  if (!externalReady) {
    await mkdir(assets); await copyAssets(assets);
    const [grpcPort, gatewayPort, staticPort] = await Promise.all([freePort(), freePort(), freePort()]);
    const dll = source("src/Broker.Browser.Preview/bin/Release/net10.0/Broker.Browser.Preview.dll");
    child = spawn("dotnet", [dll, "--fixture", "--assets-root", assets, "--base-path", "/barc/", "--grpc-port", String(grpcPort), "--gateway-port", String(gatewayPort), "--static-port", String(staticPort), "--ready-file", readyPath, "--qualification-receipt", receiptPath], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
    child.stdout.on("data", value => output.push(value)); child.stderr.on("data", value => output.push(value));
  }
  let stopped = false;
  try {
    const ready = await waitForFile(readyPath);
    expect(ready.schema).toBe("barc.preview.ready/v1"); expect(ready.fixtureMode).toBe(true);
    await page.goto(selectProductUrl(ready));
    const barc = page.locator(".barc-preview");
    await expect(barc).toBeVisible();
    await barc.getByLabel("Gateway").fill(ready.gatewayWebSocketUrl);
    await barc.getByLabel("Session UUID").fill(ready.sessionId);
    await barc.getByLabel("One-time credential").fill(ready.credential);
    await barc.getByRole("button", { name: "Pair" }).click();
    await expect(barc.locator(".age")).toContainText("9007199254740993");
    await expect(barc.getByLabel("One-time credential")).toHaveValue("");

    await expect(barc.locator('.unit.own[data-unit-id="77"]')).toBeVisible();
    await expect(barc.locator('.unit.own[data-unit-id="78"]')).toBeVisible();
    await expect(barc.locator('.unit.visual[data-unit-id="88"]')).toBeVisible();
    await expect(barc.locator('.unit.radar[data-unit-id="99"]')).toBeVisible();
    await expect(barc.locator('.feature[data-feature-id="77"][data-definition-id="909"]')).toBeVisible();
    await expect(barc.locator('.unit.own[data-unit-id="77"]')).toHaveAttribute("aria-label", /team 7 · elevation 403.5 · health 123.5 of 800/);
    await expect(barc.locator('.unit.radar[data-unit-id="99"]')).toHaveAttribute("aria-label", /type unknown · team unknown · elevation 0 · health unavailable/);
    await expect(barc.locator('.feature[data-feature-id="77"]')).toHaveAttribute("aria-label", /elevation 222.25/);
    await expect(barc.locator(".economy")).toContainText("Metal 42.5 · Energy 0");

    await chooseFile(page, barc, "Import .wasm", source("tests/Broker.Browser.Wasm.Tests/generated/custom-preview.wasm"));
    await expect(barc.locator(".module")).toContainText("custom-preview.wasm");
    await rearm(barc);
    await barc.locator('[data-unit-id="78"]').click();
    await barc.getByLabel("Target X").fill("128.25"); await barc.getByLabel("Target Z").fill("-64.5"); await barc.getByRole("button", { name: "Preview target" }).click();
    await expect(barc.locator(".move-preview")).toHaveCount(0);
    await barc.locator('[data-unit-id="77"]').click();
    await expect(barc.locator(".selection")).toContainText("Selected 77");
    await expect(barc.locator(".age")).toContainText("9007199254740994");
    await expect(barc.locator(".selection")).toContainText("Selected 77");

    const svg = barc.getByLabel(/Tactical map/);
    const screen = await svg.evaluate(element => {
      const point = element.createSVGPoint(); point.x = 656.5; point.y = 131;
      const value = point.matrixTransform(element.getScreenCTM()); return { x: value.x, y: value.y };
    });
    await page.mouse.click(screen.x, screen.y);
    const pointerMove = await barc.locator(".move-preview").evaluate(element => ({ x: Number(element.dataset.x), z: Number(element.dataset.z), units: element.dataset.unitIds }));
    expect(pointerMove).toEqual({ x: 128.25, z: -64.5, units: "77" });
    await page.evaluate(() => window.__barcPointerPreview = document.querySelector(".barc-preview .move-preview"));
    await selectAndKeyboardTarget(page, barc);
    await page.waitForFunction(() => document.querySelector(".barc-preview .move-preview") !== window.__barcPointerPreview);
    const keyboardMove = await barc.locator(".move-preview").evaluate(element => ({ x: Number(element.dataset.x), z: Number(element.dataset.z), units: element.dataset.unitIds }));
    expect(keyboardMove).toEqual(pointerMove);

    await expect(barc.getByRole("status")).toContainText("stale");
    await expect(barc.locator(".age")).toContainText("capture time unavailable");
    await expect(barc.locator(".diagnostic")).toContainText("disarmed");
    await expect(barc.locator(".move-preview")).toHaveCount(0);
    await expect(barc.locator(".age")).toContainText("9007199254740997");
    await expect(barc.getByRole("status")).toContainText("current");

    await barc.getByRole("button", { name: "Manual guest" }).click(); await expect(barc.locator(".module")).toContainText("manual-preview.wasm"); await rearm(barc); await selectAndKeyboardTarget(page, barc);
    await barc.getByRole("button", { name: "Custom guest" }).click(); await expect(barc.locator(".module")).toContainText("custom-preview.wasm"); await rearm(barc); await selectAndKeyboardTarget(page, barc);
    await page.evaluate(() => window.dispatchEvent(new Event("blur")));
    await expect(barc.locator(".diagnostic")).toContainText("disarmed");
    await rearm(barc);
    await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); Object.defineProperty(document, "hidden", { configurable: true, value: false }); });
    await expect(barc.locator(".diagnostic")).toContainText("disarmed");

    await chooseFile(page, barc, "Import .wasm", source("tests/Broker.Browser.Wasm.Tests/generated/trap-process.wasm"));
    await barc.getByRole("button", { name: "Rearm" }).click();
    await expect(barc.locator(".module")).toContainText(/faulted|trap/i);
    await expect(barc.getByRole("button", { name: "Pair" })).toBeEnabled();
    await chooseFile(page, barc, "Import .wasm", source("tests/Broker.Browser.Wasm.Tests/generated/hang-process.wasm"));
    await barc.getByRole("button", { name: "Rearm" }).click();
    await expect(barc.locator(".module")).toContainText(/timed-out|timed out/);
    await expect(barc.getByRole("button", { name: "Pair" })).toBeEnabled();
    await expect(barc.getByLabel("Target X")).toBeEditable();

    await expect(barc.getByRole("status")).toContainText("disconnected", { timeout: 15000 });
    const timings = await page.evaluate(() => ({
      frames: performance.getEntriesByName("barc-preview-frame").map(entry => entry.duration),
      guests: performance.getEntriesByName("barc-preview-guest-process").map(entry => entry.duration),
      userAgent: navigator.userAgent, platform: navigator.platform
    }));
    expect(timings.frames.length).toBeGreaterThanOrEqual(4); expect(timings.guests.length).toBeGreaterThan(0);
    const summary = values => { const ordered = values.toSorted((left, right) => left - right); return { count: values.length, p95Milliseconds: Number(ordered[Math.ceil(ordered.length * 0.95) - 1].toFixed(3)), maxMilliseconds: Number(ordered.at(-1).toFixed(3)) }; };
    const evidence = {
      chromium: browser.version(), node: process.version, userAgent: timings.userAgent, platform: timings.platform,
      serverFrameDecodeSemanticRender: summary(timings.frames), guestWorkerRoundTrip: summary(timings.guests),
      bundleSha256: externalReady ? "external-receiver-owned" : await sha256(join(assets, "assets/barc-preview.js")),
      manualGuestSha256: await sha256(source("tests/Broker.Browser.Wasm.Tests/generated/manual-preview.wasm")), customGuestSha256: await sha256(source("tests/Broker.Browser.Wasm.Tests/generated/custom-preview.wasm"))
    };
    console.log("BARC actual companion evidence", JSON.stringify(evidence));

    if (child) {
      await stop(child); stopped = true;
      const receiptMode = (await stat(receiptPath)).mode & 0o777;
      expect(receiptMode).toBe(0o600);
      const receipt = JSON.parse(await readFile(receiptPath, "utf8"));
      expect(receipt).toEqual({ schema: "barc.preview.qualification/v1", nativeSubmissionCount: 0, cleanShutdown: true });
      await expect(readFile(readyPath, "utf8")).rejects.toThrow();
    }
  } finally {
    if (!stopped && child?.exitCode === null) child.kill("SIGKILL");
    await rm(temporary, { recursive: true, force: true });
  }
});
