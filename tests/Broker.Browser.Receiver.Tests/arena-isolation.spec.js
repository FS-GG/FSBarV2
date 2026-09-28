import { expect, test } from "@playwright/test";
import { createServer } from "node:http";
import { cp, mkdtemp, readFile, rm } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { WebSocketServer } from "ws";

const receiverUrl = process.env.BARC_RECEIVER_URL;
const receiverRoot = process.env.BARC_RECEIVER_ROOT;
if (!receiverUrl || !receiverRoot) throw new Error("BARC_RECEIVER_URL and BARC_RECEIVER_ROOT are required");

const sourceRoot = resolve(import.meta.dirname, "../..");
const archivedGenerated = resolve(
  receiverRoot,
  "Client/public/barc-preview/src/Broker.Browser.Contracts/generated"
);
const codecStage = await mkdtemp(resolve(import.meta.dirname, ".receiver-codec-"));
await cp(archivedGenerated, resolve(codecStage, "generated"), { recursive: true });
const codecUrl = pathToFileURL(resolve(codecStage, "generated/codec.js"));
const { canonicalObject, encodeObject, v1 } = await import(codecUrl.href);
const sessionUuid = "33221100-5544-7766-8899-aabbccddeeff";
const sessionBase64 = "ABEiM0RVZneImaq7zN3u/w==";

let gateway;
let gatewayPort;
let connections;
let authentications;
let lastAuthentication;

test.beforeAll(async () => {
  connections = 0;
  authentications = 0;
  gateway = createServer();
  const sockets = new WebSocketServer({ noServer: true });
  gateway.on("upgrade", (request, socket, head) =>
    sockets.handleUpgrade(request, socket, head, ws => sockets.emit("connection", ws)));
  sockets.on("connection", ws => {
    connections++;
    ws.once("message", async bytes => {
      authentications++;
      lastAuthentication = canonicalObject(v1.ClientEnvelope, bytes).authenticate;
      ws.send(encodeObject(v1.ServerEnvelope, {
        bootstrap: {
          game: "bar",
          protocolVersion: "1.0.0",
          profile: "barc-preview-v1",
          sessionId: sessionBase64,
          perspectiveId: "team-7",
          mode: "PREVIEW_MODE_READ_ONLY",
          validity: { status: "VALIDITY_STATUS_CURRENT", lastSequence: "0" },
          limits: { maxFrameBytes: 65536, authTimeoutMs: 3000, maxEntities: 4096 }
        }
      }));
      ws.send(await readFile(resolve(sourceRoot, "fixtures/barc-browser/wire/observation-asymmetric.bin")));
    });
  });
  await new Promise(resolveListen => gateway.listen(0, "127.0.0.1", resolveListen));
  gatewayPort = gateway.address().port;
});

test.afterAll(async () => {
  await new Promise(resolveClose => gateway.close(resolveClose));
  await rm(codecStage, { recursive: true });
});

test("arena credentials, host messages, and ticks cannot grant or mutate BAR state", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("credential", "arena-storage-credential");
    localStorage.setItem("roomAuthorityCredential", "arena-room-grant");
  });
  await page.goto(`${receiverUrl}?credential=arena-url-credential&session=${sessionUuid}`);

  const bar = page.locator("#barc-preview-root");
  await expect(bar.getByRole("status")).toContainText("unpaired");
  await expect(bar.getByLabel("Gateway")).toHaveValue("");
  await expect(bar.getByLabel("Session UUID")).toHaveValue("");
  await expect(bar.getByLabel("One-time credential")).toHaveValue("");

  await page.evaluate(() => {
    const grant = { type: "RoomAuthorityCredential", credential: "arena-message-credential", tick: 17 };
    window.postMessage(grant, location.origin);
    window.dispatchEvent(new CustomEvent("arena:credential", { detail: grant }));
    window.dispatchEvent(new CustomEvent("arena:tick", { detail: { tick: 17 } }));
    window.dispatchEvent(new CustomEvent("RoomAuthority", { detail: grant }));
  });
  await page.waitForTimeout(100);
  expect(connections).toBe(0);
  await expect(bar.getByRole("status")).toContainText("unpaired");

  await bar.getByLabel("Gateway").fill(`ws://127.0.0.1:${gatewayPort}/barc-preview`);
  await bar.getByLabel("Session UUID").fill(sessionUuid);
  await bar.getByLabel("One-time credential").fill("bar-private-credential");
  await bar.getByRole("button", { name: "Pair" }).click();
  await expect(bar.getByRole("status")).toContainText("current");
  await expect(bar.locator(".age")).toContainText("9007199254740993");
  expect(lastAuthentication.credential).toBe("bar-private-credential");
  expect(lastAuthentication.expectedSessionId).toBe(sessionBase64);
  await expect(bar.getByLabel("One-time credential")).toHaveValue("");

  await bar.getByRole("button", { name: "Manual guest" }).click();
  await bar.getByRole("button", { name: "Rearm" }).click();
  await expect(bar.locator(".module")).toContainText("armed at guest generation");
  const before = await bar.evaluate(node => node.innerHTML);

  await page.evaluate(() => {
    for (let tick = 18; tick < 68; tick++) {
      const message = { type: "arena-tick", tick, credential: `arena-${tick}` };
      window.postMessage(message, location.origin);
      window.dispatchEvent(new CustomEvent("arena:tick", { detail: message }));
      window.dispatchEvent(new CustomEvent("RoomAuthority", { detail: message }));
    }
  });
  await page.waitForTimeout(100);

  expect(connections).toBe(1);
  expect(authentications).toBe(1);
  expect(await bar.evaluate(node => node.innerHTML)).toBe(before);
  expect(lastAuthentication.credential).toBe("bar-private-credential");
});
