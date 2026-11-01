import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

// GAME-RENDER-ADOPT-01.8: the Fable-compiled BAR host in a real browser, on the published FS.GG.Game.Render 0.18.0
// and FS.GG.Game.Render.Browser 0.18.0. The default adapter is the retained SVG surface: it draws the recorded and
// synthetic state with one selectable, labelled object per unit. Pixi and Babylon are not registered yet (01.9), so
// selecting them is refused with the surface and game state intact. The published conformance kit runs on the registry.
const hostRoot = resolve("host-output");
const fixtures = resolve("../../fixtures/barc-browser/semantic");
let server, port;

test.beforeAll(async () => {
  server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://127.0.0.1");
      let path;
      if (url.pathname === "/") path = new URL("./harness.html", import.meta.url).pathname;
      else if (url.pathname.startsWith("/host/")) path = resolve(hostRoot, url.pathname.slice("/host/".length));
      else if (url.pathname.startsWith("/npm/")) path = resolve("node_modules", url.pathname.slice("/npm/".length));
      else if (url.pathname.startsWith("/fixtures/")) path = resolve(fixtures, url.pathname.slice("/fixtures/".length));
      else { response.statusCode = 404; response.end(); return; }
      response.setHeader("content-type", extname(path) === ".html" ? "text/html" : extname(path) === ".json" ? "application/json" : "text/javascript");
      response.end(await readFile(path));
    } catch { response.statusCode = 404; response.end(); }
  });
  await new Promise(done => server.listen(0, "127.0.0.1", done));
  port = server.address().port;
});
test.afterAll(() => server.close());

async function open(page) {
  const errors = [];
  page.on("pageerror", error => errors.push(String(error)));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(`http://127.0.0.1:${port}/`);
  await page.waitForFunction(() => window.BAR_READY === true);
  return errors;
}

const counts = page => page.evaluate(() => {
  const svg = document.querySelector("#stage svg");
  return svg ? { circles: svg.querySelectorAll("circle").length, rects: svg.querySelectorAll("rect").length, svgs: document.querySelectorAll("#stage svg").length } : null;
});
const circleX = page => page.evaluate(() => [...document.querySelectorAll("#stage svg circle")].map(c => Number(c.getAttribute("cx"))));

test("the default SVG adapter draws the synthetic state and a step moves it", async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => { window.handle = window.BAR_HOST.mountSynthetic(document.querySelector("#stage"), 6, 0); });
  const first = await page.evaluate(() => window.handle.observe());
  expect(first).toMatchObject({ selected: "svg", status: "active", available: ["svg"], refusal: "", sequence: "1", validity: "current", units: 4, features: 3, presented: 1, remaining: 5 });
  // 2 own and 1 visual unit are circles; the backdrop, 3 features and 1 radar blip are rectangles.
  expect(await counts(page)).toEqual({ circles: 3, rects: 5, svgs: 1 });
  const before = await circleX(page);
  await page.evaluate(() => window.handle.step());
  expect(await page.evaluate(() => window.handle.observe().sequence)).toBe("2");
  const after = await circleX(page);
  expect(after).not.toEqual(before);
  expect(await counts(page)).toEqual({ circles: 3, rects: 5, svgs: 1 });
  expect(errors).toEqual([]);
});

const unitObjects = page => page.evaluate(() => [...document.querySelectorAll("#stage svg [data-scene-object-id]")]
  .filter(node => /^[0-9]+$/.test(node.dataset.sceneObjectId))
  .map(node => ({ id: node.dataset.sceneObjectId, label: node.getAttribute("aria-label"), selected: node.dataset.selected })));

test("every observed unit is a selectable, labelled object, and a selection from the accessible mirror is game state", async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => { window.handle = window.BAR_HOST.mountSynthetic(document.querySelector("#stage"), 4, 0); });
  const units = await unitObjects(page);
  expect(units.map(u => u.id).sort()).toEqual(["1", "2", "3", "4"]);
  expect(units.find(u => u.id === "1").label).toBe("Own unit 1, team 0, health 800 of 800");
  expect(units.find(u => u.id === "4").label).toBe("Radar unit 4");
  expect(await page.evaluate(() => [...document.querySelectorAll("#stage [data-scene-control-id]")].map(b => b.textContent))).toHaveLength(4);
  // A real click on the accessible mirror's button for unit 2 selects it as game state.
  await page.click("#stage [data-scene-control-id='2']");
  expect(await page.evaluate(() => window.handle.observe().selectedUnit)).toBe("2");
  expect((await unitObjects(page)).filter(u => u.selected === "true").map(u => u.id)).toEqual(["2"]);
  // The selection follows the unit through the next observation, and the surface is not rebuilt.
  await page.evaluate(() => { document.querySelector("#stage svg").dataset.probe = "same-node"; window.handle.step(); });
  expect(await page.evaluate(() => window.handle.observe())).toMatchObject({ sequence: "2", selectedUnit: "2" });
  expect(await page.evaluate(() => document.querySelector("#stage svg").dataset.probe)).toBe("same-node");
  expect((await unitObjects(page)).filter(u => u.selected === "true").map(u => u.id)).toEqual(["2"]);
  // The keyboard: Escape clears it through the surface.
  await page.focus("#stage svg");
  await page.keyboard.press("Escape");
  expect(await page.evaluate(() => window.handle.observe().selectedUnit)).toBe("");
  expect((await unitObjects(page)).filter(u => u.selected === "true")).toEqual([]);
  expect(errors).toEqual([]);
});

test("Pixi, Babylon and unknown tokens are refused with the surface and state intact", async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => {
    window.handle = window.BAR_HOST.mountSynthetic(document.querySelector("#stage"), 4, 0);
    window.handle.step(); window.handle.step();
    document.querySelector("#stage svg").dataset.probe = "same-node";
  });
  const sequence = await page.evaluate(() => window.handle.observe().sequence);
  expect(sequence).toBe("3");
  const xs = await circleX(page);
  for (const token of ["pixi", "babylon"]) {
    expect(await page.evaluate(token => window.handle.select(token), token)).toBe(true);
    expect(await page.evaluate(() => window.handle.observe())).toMatchObject({ selected: "svg", status: "active", refusal: `unavailable:${token}`, sequence: "3" });
  }
  expect(await page.evaluate(() => window.handle.select("canvas2d"))).toBe(false);
  expect(await page.evaluate(() => document.querySelector("#stage svg").dataset.probe)).toBe("same-node");
  expect(await circleX(page)).toEqual(xs);
  expect(errors).toEqual([]);
});

test("recorded fixture state decodes, draws and refuses a bad frame without losing the surface", async ({ page }) => {
  const errors = await open(page);
  const text = name => page.evaluate(name => fetch(`/fixtures/${name}.json`).then(r => r.text()), name);
  const asymmetric = await text("observation-asymmetric");
  const unknownEnum = await text("observation-unknown-enum");
  await page.evaluate(json => { window.handle = window.BAR_HOST.mountRecorded(document.querySelector("#stage"), [json], 0); }, asymmetric);
  expect(await page.evaluate(() => window.handle.observe())).toMatchObject({ selected: "svg", sequence: "9007199254740993", units: 3, features: 1, presented: 1 });
  // own 77 and visual 88 are circles; the backdrop, the feature and the radar blip are rectangles.
  expect(await counts(page)).toEqual({ circles: 2, rects: 3, svgs: 1 });
  await page.evaluate(json => window.handle.observeJson(json), unknownEnum);
  const observed = await page.evaluate(() => window.handle.observe());
  expect(observed.rejected.length).toBe(1);
  expect(observed.sequence).toBe("9007199254740993");
  expect(await counts(page)).toEqual({ circles: 2, rects: 3, svgs: 1 });
  expect(errors).toEqual([]);
});

// The broker's stale observation (Gateway.fs `envelope`): the session, the LAST sequence and a stale validity, with no
// units, no features, no economy, no perspective and no capture time.
const brokerStale = (sequence, session = "ABEiM0RVZneImaq7zN3u/w==") => JSON.stringify({
  body: "observation",
  observation: { sessionId: session, sequence, validity: { status: "VALIDITY_STATUS_STALE", lastSequence: sequence, receivedSequence: "9007199254740999", detail: "feed expired" } }
});

test("the broker's stale observation veils the retained units, and dispose releases the surface", async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => fetch("/fixtures/observation-asymmetric.json").then(r => r.text()).then(json => { window.handle = window.BAR_HOST.mountRecorded(document.querySelector("#stage"), [json], 0); }));
  expect(await counts(page)).toEqual({ circles: 2, rects: 3, svgs: 1 });
  await page.evaluate(json => window.handle.observeJson(json), brokerStale("9007199254740993"));
  const observed = await page.evaluate(() => window.handle.observe());
  expect(observed).toMatchObject({ validity: "stale", sequence: "9007199254740993", units: 3, features: 1, presented: 2 });
  expect(observed.rejected).toEqual([]);
  // The retained units are still drawn, under one more rectangle: the veil.
  expect(await counts(page)).toEqual({ circles: 2, rects: 4, svgs: 1 });
  // The same stale frame again is a replay and is refused without touching the surface.
  await page.evaluate(json => window.handle.observeJson(json), brokerStale("9007199254740993"));
  expect((await page.evaluate(() => window.handle.observe())).rejected.length).toBe(1);
  expect(await counts(page)).toEqual({ circles: 2, rects: 4, svgs: 1 });
  await page.evaluate(() => window.handle.dispose());
  expect(await page.evaluate(() => document.querySelectorAll("#stage svg").length)).toBe(0);
  expect(errors).toEqual([]);
});

// The published conformance kit (FS.GG.Game.Render 0.18.0 `RendererConformance`) on the BAR registry, in the real browser.
test("the published conformance kit passes on the BAR registry", async ({ page }) => {
  const errors = await open(page);
  const results = await page.evaluate(() => window.BAR_HOST.runConformance(document.querySelector("#stage")));
  console.log(`bar-render kit results=${results.length} failed=${results.filter(r => !r.passed).length}`);
  console.log(results.map(r => `${r.passed ? "pass" : "FAIL"} ${r.check}`).join("\n"));
  expect(results.filter(r => !r.passed)).toEqual([]);
  expect(results.length).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
