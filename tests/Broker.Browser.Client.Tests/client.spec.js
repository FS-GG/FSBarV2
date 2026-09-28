import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { WebSocketServer } from "ws";
import { canonicalObject, encodeObject, v1 } from "../../src/Broker.Browser.Contracts/generated/codec.js";

const root = resolve("../..");
// .NET Guid.ToByteArray("33221100-5544-7766-8899-aabbccddeeff")
// is 00 11 22 33 44 55 66 77 88 99 aa bb cc dd ee ff.
const sessionUuid = "33221100-5544-7766-8899-aabbccddeeff";
const sessionBase64 = "ABEiM0RVZneImaq7zN3u/w==";
let server, port, lastAuth, lastSocket;

const routes = [
  ["/client/", "src/Broker.Browser.Client/dist/"],
  ["/src/Broker.Browser.Wasm/", "src/Broker.Browser.Wasm/"],
  ["/guests/", "tests/Broker.Browser.Wasm.Tests/generated/"]
];

test.beforeAll(async () => {
  server = createServer(async (request, response) => {
    try {
      if (request.url === "/") { response.setHeader("content-type", "text/html"); response.end(await readFile(new URL("./harness.html", import.meta.url))); return; }
      const route = routes.find(([prefix]) => request.url.startsWith(prefix));
      if (!route) { response.statusCode = 404; response.end(); return; }
      const path = resolve(root, route[1], request.url.slice(route[0].length));
      response.setHeader("content-type", extname(path) === ".js" ? "text/javascript" : extname(path) === ".css" ? "text/css" : "application/wasm");
      response.end(await readFile(path));
    } catch { response.statusCode = 404; response.end(); }
  });
  const sockets = new WebSocketServer({ noServer: true });
  server.on("upgrade", (request, socket, head) => sockets.handleUpgrade(request, socket, head, ws => sockets.emit("connection", ws, request)));
  sockets.on("connection", (ws, request) => ws.once("message", bytes => {
    lastSocket = ws;
    lastAuth = canonicalObject(v1.ClientEnvelope, bytes);
    const bootstrap = { game: "bar", protocolVersion: "1.0.0", profile: "barc-preview-v1", sessionId: sessionBase64, perspectiveId: "team-7", mode: "PREVIEW_MODE_READ_ONLY", validity: { status: "VALIDITY_STATUS_CURRENT", lastSequence: "0" }, limits: { maxFrameBytes: 65536, authTimeoutMs: 3000, maxEntities: 4096 } };
    ws.send(encodeObject(v1.ServerEnvelope, { bootstrap }));
    setTimeout(async () => ws.send(await readFile(resolve(root, "fixtures/barc-browser/wire/observation-asymmetric.bin"))), 10);
  }));
  await new Promise(resolveListen => server.listen(0, "127.0.0.1", resolveListen));
  port = server.address().port;
});

test.afterAll(() => new Promise(resolveClose => server.close(resolveClose)));

test("visible pairing, real guest, and pointer/keyboard inputs stay read-only", async ({ page }) => {
  await page.goto(`http://127.0.0.1:${port}/`);
  await page.getByLabel("Gateway").fill(`ws://127.0.0.1:${port}/gateway`);
  await page.getByLabel("Session UUID").fill(sessionUuid);
  await page.getByLabel("One-time credential").fill("fixture-credential");
  await page.getByRole("button", { name: "Pair" }).click();
  await expect(page.getByRole("status")).toContainText("current");
  await expect(page.locator(".age")).toContainText("9007199254740993");
  expect(lastAuth.authenticate.expectedSessionId).toBe(sessionBase64);
  expect(lastAuth.authenticate.credential).toBe("fixture-credential");
  await expect(page.getByLabel("One-time credential")).toHaveValue("");

  await page.getByRole("button", { name: "Manual guest" }).click();
  await expect(page.locator(".module")).toContainText("staged");
  await page.getByRole("button", { name: "Rearm" }).click();
  await expect(page.locator(".module")).toContainText("armed at guest generation");

  const own = page.locator('[data-unit-id="77"]');
  await own.click();
  const svg = page.getByLabel(/Tactical map/);
  const box = await svg.boundingBox();
  await page.mouse.click(box.x + box.width * (656.5 / 800), box.y + box.height * (131 / 520));
  await expect(page.locator(".move-preview")).toBeVisible();
  await expect(page.locator(".diagnostic")).toContainText("no native authority");

  await svg.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.locator(".move-preview")).toBeVisible();
});

test("unknown enum is refused without replacing the current snapshot", async ({ page }) => {
  await page.goto(`http://127.0.0.1:${port}/`);
  await page.getByLabel("Gateway").fill(`ws://127.0.0.1:${port}/gateway`);
  await page.getByLabel("Session UUID").fill(sessionUuid);
  await page.getByLabel("One-time credential").fill("invalid-fixture");
  await page.getByRole("button", { name: "Pair" }).click();
  await expect(page.locator(".age")).toContainText("9007199254740993");
  lastSocket.send(await readFile(resolve(root, "fixtures/barc-browser/wire/observation-unknown-enum.bin")));
  await expect(page.getByRole("status")).toContainText("refused");
  await expect(page.locator(".age")).toContainText("9007199254740993");
  await expect(page.locator(".diagnostic")).toContainText("disarmed");
});
