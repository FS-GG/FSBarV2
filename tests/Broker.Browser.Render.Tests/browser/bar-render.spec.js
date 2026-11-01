import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

// GAME-RENDER-ADOPT-01.8 and -01.9: the Fable-compiled BAR host in a real browser, on the published FS.GG.Game.Render 0.18.0
// and FS.GG.Game.Render.Browser 0.18.0. SVG, Pixi and Babylon are registered for the BAR game state, SVG by default, and
// the player switches between them at run time without losing game state. Unit selection (pointer, keyboard and the
// accessible mirror) is the published interaction contract on all three, and the published conformance kit runs on the
// registry. The WebGL backends run on software WebGL (SwiftShader) unless fdev-chromium-env supplies GPU flags.
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
  // The conformance kit's interaction section plays REAL input (trusted pointer and keyboard events, real focus): the
  // page asks the test driver for each click, move and key, as FS.GG.Game's own browser smoke does.
  await page.exposeFunction("__fsggInput", async request => {
    if (request.kind === "click") await page.mouse.click(request.x, request.y);
    else if (request.kind === "move") await page.mouse.move(request.x, request.y);
    else if (request.kind === "key") await page.keyboard.press(request.key === " " ? "Space" : request.key);
    else throw new Error("unknown input request " + JSON.stringify(request));
  });
  page.on("pageerror", error => errors.push(String(error)));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(`http://127.0.0.1:${port}/`);
  await page.waitForFunction(() => window.BAR_READY === true);
  return errors;
}

// Only drawn shapes are counted: the selectables layer holds transparent hit shapes (fill-opacity 0) for the pointer.
const counts = page => page.evaluate(() => {
  const svg = document.querySelector("#stage svg");
  const drawn = selector => [...svg.querySelectorAll(selector)].filter(e => e.getAttribute("fill-opacity") !== "0").length;
  return svg ? { circles: drawn("circle"), rects: drawn("rect"), svgs: document.querySelectorAll("#stage svg").length } : null;
});
const circleX = page => page.evaluate(() => [...document.querySelectorAll("#stage svg circle")].filter(c => c.getAttribute("fill-opacity") !== "0").map(c => Number(c.getAttribute("cx"))));

test("the default SVG adapter draws the synthetic state and a step moves it", async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => { window.handle = window.BAR_HOST.mountSynthetic(document.querySelector("#stage"), 6, 0); });
  const first = await page.evaluate(() => window.handle.observe());
  expect(first).toMatchObject({ selected: "svg", status: "active", available: ["svg", "pixi", "babylon"], refusal: "", sequence: "1", validity: "current", units: 4, features: 3, presented: 1, remaining: 5 });
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

test("the three backends switch at runtime and keep the game state, and an unknown token is refused", async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => {
    window.handle = window.BAR_HOST.mountSynthetic(document.querySelector("#stage"), 4, 0);
    window.handle.step(); window.handle.step();
  });
  const observe = () => page.evaluate(() => window.handle.observe());
  const waitFor = (backend) => page.waitForFunction(backend => window.handle.observe().selected === backend && window.handle.observe().status === "active", backend);
  const before = await observe();
  expect(before).toMatchObject({ selected: "svg", sequence: "3", available: ["svg", "pixi", "babylon"] });
  // Select a unit first: the selection is game state and must survive every switch.
  await page.click("#stage [data-scene-control-id='2']");
  expect((await observe()).selectedUnit).toBe("2");
  for (const backend of ["pixi", "babylon", "svg", "babylon", "pixi", "svg"]) {
    expect(await page.evaluate(token => window.handle.select(token), backend)).toBe(true);
    await waitFor(backend);
    const now = await observe();
    expect(now).toMatchObject({ selected: backend, status: "active", refusal: "", sequence: "3", units: 4, selectedUnit: "2" });
    // Exactly one backend holds the page: one SVG root, or one canvas of the backend.
    const held = await page.evaluate(() => ({ svg: document.querySelectorAll("#stage svg").length, pixi: document.querySelectorAll("#stage canvas[data-renderer=pixi]").length, babylon: document.querySelectorAll("#stage canvas[data-renderer=babylon]").length, mirrors: document.querySelectorAll("#stage [data-scene-controls]").length }));
    expect(held).toEqual({ svg: backend === "svg" ? 1 : 0, pixi: backend === "pixi" ? 1 : 0, babylon: backend === "babylon" ? 1 : 0, mirrors: 1 });
    // Every backend's accessible mirror shows the kept selection.
    expect(await page.evaluate(() => [...document.querySelectorAll("#stage [data-scene-control-id][aria-pressed='true']")].map(b => b.dataset.sceneControlId))).toEqual(["2"]);
  }
  // A step while a canvas is mounted presents on it, without a remount.
  await page.evaluate(() => window.handle.select("pixi"));
  await waitFor("pixi");
  await page.evaluate(() => { document.querySelector("#stage canvas").dataset.probe = "same-canvas"; window.handle.step(); });
  expect(await observe()).toMatchObject({ sequence: "4", selected: "pixi", selectedUnit: "2" });
  expect(await page.evaluate(() => document.querySelector("#stage canvas").dataset.probe)).toBe("same-canvas");
  // An unknown token is refused without a change.
  expect(await page.evaluate(() => window.handle.select("canvas2d"))).toBe(false);
  expect(await observe()).toMatchObject({ selected: "pixi", sequence: "4" });
  await page.evaluate(() => window.handle.dispose());
  expect(await page.evaluate(() => document.querySelector("#stage").children.length)).toBe(0);
  expect(errors).toEqual([]);
});

// A real pointer press on a drawn unit selects it on the backend that is mounted, whichever it is.
for (const backend of ["svg", "pixi", "babylon"]) {
  test(`a real pointer press on a unit selects it on ${backend}, and the keyboard clears it`, async ({ page }) => {
    const errors = await open(page);
    await page.evaluate(() => { window.handle = window.BAR_HOST.mountSynthetic(document.querySelector("#stage"), 3, 0); });
    await page.evaluate(token => window.handle.select(token), backend);
    await page.waitForFunction(backend => window.handle.observe().selected === backend && window.handle.observe().status === "active", backend);
    const target = backend === "svg" ? "#stage svg" : `#stage canvas[data-renderer=${backend}]`;
    // Own unit 1 of the first synthetic frame is drawn at viewport (160, 180) of the 800 by 520 scene.
    const box = await page.locator(target).boundingBox();
    await page.mouse.click(box.x + 160, box.y + 180);
    await page.waitForFunction(() => window.handle.observe().selectedUnit === "1");
    expect(await page.evaluate(() => window.handle.observe())).toMatchObject({ selected: backend, selectedUnit: "1" });
    expect(await page.evaluate(() => [...document.querySelectorAll("#stage [data-scene-control-id][aria-pressed='true']")].map(b => b.dataset.sceneControlId))).toEqual(["1"]);
    // A press on empty ground asks for nothing.
    await page.mouse.click(box.x + 20, box.y + 20);
    expect((await page.evaluate(() => window.handle.observe())).selectedUnit).toBe("1");
    // Escape on the focused surface clears the selection.
    await page.focus(target);
    await page.keyboard.press("Escape");
    await page.waitForFunction(() => window.handle.observe().selectedUnit === "");
    expect(errors).toEqual([]);
  });
}

test("a Pixi mount whose initialisation fails after it returned falls back to SVG with the state intact", async ({ page }) => {
  const errors = await open(page);
  await page.evaluate(() => {
    window.handle = window.BAR_HOST.mountSynthetic(document.querySelector("#stage"), 3, 0);
    window.handle.step();
    window.BAR_HOST.armPixiInitFailure();
    window.handle.select("pixi");
  });
  await page.waitForFunction(() => window.handle.observe().selected === "svg" && window.handle.observe().refusal.startsWith("mount-failed:pixi"));
  expect(await page.evaluate(() => window.handle.observe())).toMatchObject({ selected: "svg", status: "active", sequence: "2", units: 4 });
  expect(await page.evaluate(() => ({ svg: document.querySelectorAll("#stage svg").length, canvases: document.querySelectorAll("#stage canvas").length }))).toEqual({ svg: 1, canvases: 0 });
  // The fallback is not final: Pixi mounts when the failure is not armed.
  await page.evaluate(() => window.handle.select("pixi"));
  await page.waitForFunction(() => window.handle.observe().selected === "pixi" && window.handle.observe().status === "active");
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

// Live-slice decode strictness, in the browser: a live feed is bound to its bootstrap (the existing client's
// validateBootstrap / validateObservation rules), and nothing is presented before that.
test("a live feed is refused before its bootstrap and bound to its session and perspective after it", async ({ page }) => {
  const errors = await open(page);
  const text = name => page.evaluate(name => fetch(`/fixtures/${name}.json`).then(r => r.text()), name);
  const observation = await text("observation-asymmetric");
  const initialize = await text("guest-initialize");
  await page.evaluate(() => { window.handle = window.BAR_HOST.mountLive(document.querySelector("#stage")); });
  const observe = () => page.evaluate(() => window.handle.observe());
  await page.evaluate(json => window.handle.observeJson(json), observation);
  expect(await observe()).toMatchObject({ presented: 0, units: 0, bootstrapSession: "" });
  expect((await observe()).rejected).toEqual(["observation arrived before bootstrap"]);
  // A bootstrap that violates the rules binds nothing.
  await page.evaluate(json => window.handle.bootstrapJson(json), initialize.replace('"game": "bar"', '"game": "sc2"'));
  expect((await observe()).bootstrapSession).toBe("");
  await page.evaluate(json => window.handle.bootstrapJson(json), initialize);
  expect((await observe()).bootstrapSession).toBe("ABEiM0RVZneImaq7zN3u/w==");
  // Another perspective, another session, and a current observation without a capture time are all refused.
  for (const bad of [
    observation.replace('"perspectiveId": "team-7"', '"perspectiveId": "team-8"'),
    observation.replace("ABEiM0RVZneImaq7zN3u/w==", "AAAAAAAAAAAAAAAAAAAAAA=="),
    observation.replace('"capturedAtUnixMs": "1770000000123",', ""),
    observation.replace('"sequence": "9007199254740993",', '"sequence": "9007199254740993", "sequence": "9007199254740994",')
  ]) {
    await page.evaluate(json => window.handle.observeJson(json), bad);
    expect(await observe()).toMatchObject({ presented: 0, units: 0 });
  }
  expect((await observe()).rejected.length).toBe(6);
  await page.evaluate(json => window.handle.observeJson(json), observation);
  expect(await observe()).toMatchObject({ presented: 1, units: 3, sequence: "9007199254740993", validity: "current", guestPreviewable: true });
  expect(await counts(page)).toEqual({ circles: 2, rects: 3, svgs: 1 });
  expect(errors).toEqual([]);
});

// The published conformance kit (FS.GG.Game.Render 0.18.0 `RendererConformance`) on the BAR registry, in the real browser.
test("the published conformance kit passes on the BAR registry", async ({ page }) => {
  const errors = await open(page);
  const results = await page.evaluate(() => window.BAR_HOST.runConformance(document.querySelector("#stage")));
  console.log(`bar-render kit results=${results.length} failed=${results.filter(r => !r.passed).length}`);
  console.log(results.map(r => `${r.passed ? "pass" : "FAIL"} ${r.check}${r.passed ? "" : " :: " + r.detail}`).join("\n"));
  expect(results.filter(r => !r.passed)).toEqual([]);
  // The kit's pixels section (FS.GG.Game 0.19.0, #753) reads back what each backend drew: 1 + 3 + 3 requirements.
  expect(results.filter(r => r.check.startsWith("pixels")).length).toBe(7);
  expect(results.length).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
