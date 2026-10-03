import {test, expect} from "@playwright/test";
import {readFile} from "node:fs/promises";
const wire = async name => Array.from(await readFile(new URL(`../../fixtures/barc-browser/wire/${name}.bin`,import.meta.url)));
async function setup(page, name) {
  await page.goto('/sub/app/harness.html');
  await page.waitForFunction(()=>window.GuestSupervisor);
  return page.evaluate(async name => {
    window.supervisor = new window.GuestSupervisor();
    return window.supervisor.load(new Uint8Array(await (await fetch(`./modules/${name}.wasm`)).arrayBuffer()));
  }, name);
}
for(const name of ['foreign-output','empty-output','unaligned-output']) {
  test(`${name} retires host and permits no later effect`,async ({page})=>{
    expect((await setup(page,name)).state).toBe('completed');
    const init=await wire('guest-initialize'), observation=await wire('guest-observation');
    expect((await page.evaluate(bytes=>window.supervisor.initialize(bytes),init)).state).toBe('completed');
    const result=await page.evaluate(bytes=>window.supervisor.process(bytes),observation);
    expect(result.state).toBe('faulted'); expect(result.output).toEqual([]);
    expect(await page.evaluate(()=>window.supervisor.active)).toBe(false);
    const late=await page.evaluate(bytes=>window.supervisor.process(bytes),observation);
    expect(late.state).toBe('faulted'); expect(late.output).toEqual([]);
  });
}
test('ABI 2 is refused by BAR ABI 1',async ({page})=>{
  expect((await setup(page,'bad-abi')).state).toBe('faulted');
  expect(await page.evaluate(()=>window.supervisor.active)).toBe(false);
});
test('busy refusal and repeated disposal settle pending request once',async ({page})=>{
  expect((await setup(page,'hang-process')).state).toBe('completed');
  expect((await page.evaluate(bytes=>window.supervisor.initialize(bytes),await wire('guest-initialize'))).state).toBe('completed');
  const result=await page.evaluate(async bytes=>{
    let settlements=0;
    const pending=window.supervisor.process(bytes).then(result=>{settlements++;return result;});
    const busy=await window.supervisor.process(bytes);
    window.supervisor.dispose(); window.supervisor.dispose();
    const retired=await pending;
    await new Promise(resolve=>setTimeout(resolve,300));
    return {busy,retired,settlements,active:window.supervisor.active};
  },await wire('guest-observation'));
  expect(result.busy.state).toBe('faulted'); expect(result.busy.reason).toContain('Busy');
  expect(result.retired.state).toBe('discarded');expect(result.settlements).toBe(1);expect(result.active).toBe(false);
});
test('complete package Worker policy loads beneath non-root URL',async ({page})=>{
  const requests=[];page.on('request',r=>requests.push(new URL(r.url()).pathname));
  expect((await setup(page,'manual-preview')).state).toBe('completed');
  expect(requests.some(p=>p.endsWith('/policy/WorkerEntry.js'))).toBe(true);
  expect(requests.filter(p=>p.includes('FS.GG.Wasm.Browser')).every(p=>p.startsWith('/sub/app/'))).toBe(true);
});
test('disarm discards in-flight compile and fresh load advances generation',async ({page})=>{
  await page.goto('/sub/app/harness.html'); await page.waitForFunction(()=>window.GuestSupervisor);
  const result=await page.evaluate(async()=>{
    const bytes=new Uint8Array(await (await fetch('./modules/manual-preview.wasm')).arrayBuffer());
    window.supervisor=new window.GuestSupervisor();
    const first=window.supervisor.load(bytes);window.supervisor.disarm();
    const discarded=await first;
    const fresh=await window.supervisor.load(bytes);
    return {discarded,fresh,generation:window.supervisor.generation};
  });
  expect(result.discarded.state).toBe('discarded');expect(result.fresh.state).toBe('completed');
  expect(result.fresh.generation).toBe(result.generation);
});
test('load is immediately active and refuses concurrent calls while hashing identity',async ({page})=>{
  await page.goto('/sub/app/harness.html');await page.waitForFunction(()=>window.GuestSupervisor);
  const result=await page.evaluate(async bytes=>{
    const artifact=new Uint8Array(await (await fetch('./modules/manual-preview.wasm')).arrayBuffer());
    window.supervisor=new window.GuestSupervisor();
    const pending=window.supervisor.load(artifact);
    const active=window.supervisor.active;
    const busy=await window.supervisor.initialize(bytes);
    return {active,busy,loaded:await pending};
  },await wire('guest-initialize'));
  expect(result.active).toBe(true);expect(result.busy.state).toBe('faulted');expect(result.busy.reason).toContain('Busy');expect(result.loaded.state).toBe('completed');
});
test('deadline reports guest cleanup phase and advances generation once',async ({page})=>{
  const loaded=await setup(page,'hang-free');expect(loaded.state).toBe('completed');
  const result=await page.evaluate(bytes=>window.supervisor.initialize(bytes),await wire('guest-initialize'));
  expect(result.state).toBe('timed-out');expect(result.phase).toBe('free');
  expect(result.output).toEqual([]);
  expect(await page.evaluate(()=>window.supervisor.generation)).toBe(loaded.generation+1);
});
test('invalid limit boundaries and unsupported table overrides refuse before Worker creation',async ({page})=>{
  await page.goto('/sub/app/harness.html');await page.waitForFunction(()=>window.GuestSupervisor);
  const results=await page.evaluate(()=>[NaN,Infinity,1.5,0,251].map(value=>{
    try {new window.GuestSupervisor({limits:{phaseTimeoutMilliseconds:value}});return false;}catch{return true;}
  }).concat((()=>{try{new window.GuestSupervisor({limits:{maximumTableElements:2048}});return false;}catch{return true;}})()));
  expect(results).toEqual([true,true,true,true,true,true]);
});
