import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { loadHandoff, readEngineTrace, readJsonl, verifyJourneyEvidence, distance } from "./live-native-evidence.mjs";

const enabled = process.env.BARC_RUN_LIVE_NATIVE_RECEIVER === "1";
const handoff = enabled ? await loadHandoff(process.env.BARC_LIVE_NATIVE_HANDOFF) : null;
const evidenceDir = process.env.BARC_LIVE_NATIVE_EVIDENCE;

test.setTimeout(180000);

async function pair(page, journey, clientSha256) {
  await page.goto(journey.receiverUrl);
  const live = page.locator(".barc-preview.barc-live");
  await expect(live).toBeVisible();
  const assetUrl = new URL("barc-preview/assets/barc-preview.js", journey.receiverUrl);
  const response = await page.request.get(assetUrl.href);
  expect(response.ok()).toBe(true);
  expect(createHash("sha256").update(await response.body()).digest("hex")).toBe(clientSha256);
  await live.getByLabel("Gateway").fill(journey.gatewayUrl);
  await live.getByLabel("Session UUID").fill(journey.expectedSessionId);
  await live.getByLabel("One-time credential").fill(journey.credential);
  await live.getByRole("button", { name:"Pair", exact:true }).click();
  await expect(live.locator(".status")).toContainText("current: live session");
  await expect(live.getByLabel("One-time credential")).toHaveValue("");
  return live;
}

async function armBundled(page, journey, clientSha256) {
  const live = await pair(page, journey, clientSha256);
  const moduleName = "Manual guest";
  await live.getByRole("button", { name:moduleName, exact:true }).click();
  await expect(live.locator(".module")).toContainText("manual-preview.wasm");
  await live.getByRole("button", { name:"Arm live", exact:true }).click();
  await expect(live.locator(".authority")).toContainText("arm native confirmed");
  return live;
}

async function captureSubmissions(page, product, journey) {
  const codecPath = `${product.receiverRoot}/Client/public/barc-preview/src/Broker.Browser.Contracts/generated/codec.js`;
  const { canonicalObject, v1 } = await import(pathToFileURL(codecPath)); const rows=[];
  page.on("websocket", socket => socket.on("framesent", event => {
    try { const payload=event?.payload; if(typeof payload==="string"||!payload)return; const value=canonicalObject(v1.LiveClientEnvelope,Uint8Array.from(payload)); if(value.body!=="submit")return; const i=value.submit.intent,a=i.actors[0],raw=Buffer.from(value.submit.module.sha256,"base64"); rows.push({schema:"fsbar.barc-live-browser-submit/v1",journeyId:journey.id,parentId:value.submit.parentId,inputId:value.submit.inputId,moduleSha256:raw.toString("hex"),moduleGeneration:value.submit.module.generation,controller:value.submit.controller,basis:value.submit.basis,actor:{id:a.id??"0",lifetime:a.lifetime},action:i.action==="move"?{kind:"Move",policy:i.move.policy,target:{x:i.move.position.x??0,z:i.move.position.z??0}}:i.action==="attack"?{kind:"Attack",targetActor:{id:i.attack.target.id??"0",lifetime:i.attack.target.lifetime}}:{kind:"Stop"}}) } catch {}
  })); return rows;
}
async function persistAndVerify(journey, rows) {
  const path=`${evidenceDir}/browser-${journey.id}.jsonl`; await writeFile(path,rows.map(x=>JSON.stringify(x)).join("\n")+"\n",{mode:0o600,flag:"wx"});
  await expect.poll(async () => {
    try { return verifyJourneyEvidence(journey,rows,await readJsonl(journey.nativeTracePath),await readEngineTrace(journey.engineTracePath)); } catch { return false; }
  }, { timeout:120000, intervals:[100,250,500,1000] }).toBe(true);
}
const close=(a,b,t)=>a&&distance(a,b)<=t;
async function waitMoveSequence(journey){await expect.poll(async()=>{const s=(await readEngineTrace(journey.engineTracePath)).filter(x=>x.actorId===journey.actor.id),a=s.find(x=>close(x.actorPosition,journey.targets.replace,journey.tolerance??24)),b=s.find(x=>a&&x.frame>a.frame&&close(x.actorPosition,journey.targets.append,journey.tolerance??24));return Boolean(a&&b)},{timeout:120000}).toBe(true)}
async function latestFrame(journey){return (await readEngineTrace(journey.engineTracePath)).at(-1)?.frame??0}
async function waitActive(journey,after){await expect.poll(async()=>(await readEngineTrace(journey.engineTracePath)).some(x=>x.frame>after&&x.actorId===journey.actor.id&&x.actorCommands.length),{timeout:30000}).toBe(true)}
async function waitStopped(journey,after){await expect.poll(async()=>{const s=(await readEngineTrace(journey.engineTracePath)).filter(x=>x.frame>after&&x.actorId===journey.actor.id&&!x.actorCommands.length).slice(-2);return s.length===2&&distance(s[0].actorPosition,s[1].actorPosition)<=(journey.maxStoppedDisplacement??2)},{timeout:30000}).toBe(true)}
async function waitAttack(journey,after){await expect.poll(async()=>{const s=(await readEngineTrace(journey.engineTracePath)).filter(x=>x.frame>after&&x.targetId===journey.attack.id);return s.some(x=>x.targetHealth<journey.attack.health)},{timeout:120000}).toBe(true)}

async function pointerJourney(page, journey, clientSha256) {
  const live = await armBundled(page, journey, clientSha256);
  const actor = live.locator(`[data-unit-id="${journey.actor.id}"][data-lifetime="${journey.actor.lifetime}"]`);
  await actor.click();
  for (const [policy, target] of [["MOVE_POLICY_REPLACE",journey.targets.replace],["MOVE_POLICY_APPEND",journey.targets.append]]) {
    await live.getByLabel("Target X").fill(String(target.x)); await live.getByLabel("Target Z").fill(String(target.z));
    await live.getByLabel("Move policy").selectOption(policy); await live.getByRole("button", { name:"Move", exact:true }).click();
  }
  await waitMoveSequence(journey); const beforeStopMove=await latestFrame(journey);
  await live.getByLabel("Target X").fill(String(journey.targets.stop.x)); await live.getByLabel("Target Z").fill(String(journey.targets.stop.z));
  await live.getByLabel("Move policy").selectOption("MOVE_POLICY_REPLACE"); await live.getByRole("button", { name:"Move", exact:true }).click();
  await waitActive(journey,beforeStopMove); const beforeStop=await latestFrame(journey);
  await live.getByRole("button", { name:"Stop", exact:true }).click();
  await waitStopped(journey,beforeStop); const beforeAttack=await latestFrame(journey);
  await live.locator(`[data-unit-id="${journey.attack.id}"][data-lifetime="${journey.attack.lifetime}"]`).click();
  await waitAttack(journey,beforeAttack);
}

async function keyboardJourney(page, journey, clientSha256) {
  const live = await armBundled(page, journey, clientSha256);
  const map = live.getByLabel(/Live tactical map/); await map.focus(); await page.keyboard.press("Tab");
  const policy = live.getByLabel("Move policy"); await policy.focus(); await page.keyboard.press("Home");
  await map.focus(); for (const key of journey.keys.replace) await page.keyboard.press(key); await page.keyboard.press("Enter");
  await policy.focus(); await page.keyboard.press("End");
  await map.focus(); for (const key of journey.keys.append) await page.keyboard.press(key); await page.keyboard.press("Enter");
  await waitMoveSequence(journey); const beforeStopMove=await latestFrame(journey);
  await policy.focus(); await page.keyboard.press("Home");
  await map.focus(); for (const key of journey.keys.stop) await page.keyboard.press(key); await page.keyboard.press("Enter");
  await waitActive(journey,beforeStopMove); const beforeStop=await latestFrame(journey); await page.keyboard.press("S"); await waitStopped(journey,beforeStop); const beforeAttack=await latestFrame(journey);
  await page.keyboard.press("A"); await page.keyboard.press("Enter"); await waitAttack(journey,beforeAttack);
}

async function customJourney(page, journey, clientSha256) {
  const live = await pair(page, journey, clientSha256);
  await live.getByRole("button", { name:"Import .wasm", exact:true }).click();
  await live.locator("[data-file]").setInputFiles(journey.custom.guestPath);
  await expect(live.locator(".module")).toContainText(journey.custom.guestPath.split("/").at(-1));
  await live.getByRole("button", { name:"Arm live", exact:true }).click();
  await expect(live.locator(".authority")).toContainText("arm native confirmed");
  await live.locator(`[data-unit-id="${journey.actor.id}"][data-lifetime="${journey.actor.lifetime}"]`).click();
  if(journey.custom.nativeKind==="Move"){await live.getByLabel("Target X").fill(String(journey.custom.target.x));await live.getByLabel("Target Z").fill(String(journey.custom.target.z));await live.getByLabel("Move policy").selectOption(journey.custom.inputPolicy??"MOVE_POLICY_APPEND")}
  await live.getByRole("button", { name:journey.custom.inputControl, exact:true }).click();
}

test.describe("actual live BAR receiver", () => {
  test.skip(!enabled, "requires parent-owned native host handoff");
  for (const product of handoff?.products ?? []) for (const journey of product.journeys) {
    test(`${product.id} ${journey.mode} reaches native effects`, async ({ page }) => {
      const rows=await captureSubmissions(page,product,journey);
      if (journey.mode === "pointer") await pointerJourney(page, journey, handoff.clientSha256);
      else if (journey.mode === "keyboard") await keyboardJourney(page, journey, handoff.clientSha256);
      else await customJourney(page, journey, handoff.clientSha256);
      await persistAndVerify(journey,rows);
    });
  }
});
