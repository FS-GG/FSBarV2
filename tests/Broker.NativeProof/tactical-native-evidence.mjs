import { lstat, readFile } from "node:fs/promises";
const insist=(value,detail)=>{if(!value)throw Error(detail)},sha=/^[0-9a-f]{64}$/,commit=/^[0-9a-f]{40}$/;
const loop=(value,protocols)=>{const u=new URL(value);insist(protocols.includes(u.protocol)&&["127.0.0.1","localhost"].includes(u.hostname),"endpoint must be loopback");return u};
export async function readPrivateJson(path){const stat=await lstat(path);insist(stat.isFile()&&!stat.isSymbolicLink()&&(stat.mode&0o777)===0o600,"handoff must be a regular mode-0600 file");return JSON.parse(await readFile(path,"utf8"))}
const reference=(value,label)=>insist(value&&/^\d+$/.test(value.id)&&/^[1-9]\d*$/.test(value.lifetime),`${label} requires a presence-bearing lifetime reference`);
export function validateTacticalHandoff(value){
  insist(value?.schema==="fsbar.barc-tactical-native-browser-handoff/v1"&&value.fixtureMode===false,"real tactical handoff required");
  insist(commit.test(value.sourceCommit)&&sha.test(value.archiveSha256)&&sha.test(value.clientSha256)&&sha.test(value.pluginSha256)&&sha.test(value.engineSha256),"exact source/archive/client/plugin/engine pins required");
  insist(value.profile==="barc-live-tactical-v1"&&value.protocolVersion===2&&value.tacticalRevision===1&&value.guestAbiVersion===1,"frozen tactical negotiation required");
  insist(value.codecDirectory?.startsWith("/")&&value.products?.length===2&&new Set(value.products.map(x=>x.id)).size===2,"local/generated products and codec required");
  insist(value.products.some(x=>x.id==="local")&&value.products.some(x=>x.id==="generated"),"local and generated products required");
  const ids=new Set(),credentials=new Set();
  for(const product of value.products){
    insist(product.receiverRoot?.startsWith("/")&&product.journeys?.length===3,"each product requires retained receiver and three journeys");
    insist(new Set(product.journeys.map(x=>x.mode)).size===3,"pointer, keyboard and importedGuest journeys required");
    for(const journey of product.journeys){
      insist(["pointer","keyboard","importedGuest"].includes(journey.mode)&&/^[\w.-]+$/.test(journey.id)&&!ids.has(journey.id),"safe unique journey id required");ids.add(journey.id);
      const receiver=loop(journey.receiverUrl,["http:"]),origin=loop(journey.allowedOrigin,["http:"]);insist(receiver.origin===origin.origin&&receiver.searchParams.get("barc-profile")===value.profile,"receiver origin/profile mismatch");loop(journey.gatewayUrl,["ws:","wss:"]);
      insist(journey.credential&&!credentials.has(journey.credential)&&journey.expectedSessionId,"unique private pairing required");credentials.add(journey.credential);
      insist(journey.nativeTracePath?.startsWith("/")&&journey.engineTracePath?.startsWith("/")&&journey.outputPath?.startsWith("/"),"private trace paths required");
      reference(journey.builder,"builder");reference(journey.repairTarget,"repair target");reference(journey.factory,"factory");reference(journey.combatTarget,"combat target");reference(journey.feature,"feature");
      insist(Number.isInteger(journey.buildDefinitionId)&&journey.buildDefinitionId>0&&Number.isInteger(journey.productDefinitionId)&&journey.productDefinitionId>0,"definition identities required");
      insist(journey.positions&&Object.values(journey.positions).every(p=>Number.isFinite(p.x)&&Number.isFinite(p.z)),"finite world positions required");
      if(journey.mode==="keyboard")insist(Number.isInteger(journey.factoryTabCount)&&journey.factoryTabCount>0,"keyboard factory cursor required");
      if(journey.mode==="importedGuest")insist(journey.guestPath?.startsWith("/")&&sha.test(journey.guestSha256)&&journey.mixedActors?.length>=2,"independent guest and mixed actors required");
    }
  }
  return value;
}
export async function loadTacticalHandoff(path){return validateTacticalHandoff(await readPrivateJson(path))}
export function assertCanonicalLifecycle(rows,expectedParents){
  for(const parent of expectedParents){const result=rows.filter(x=>x.kind==="result"&&x.parentId===parent.id);for(let child=0;child<parent.childCount;child++){const stages=result.filter(x=>x.childIndex===child).map(x=>`${x.stage}/${x.status}`);insist(stages.includes("BrokerAdmission/Accepted")&&stages.includes("NativeAdmission/Accepted")&&stages.includes("NativeDispatch/Applied"),`parent ${parent.id} child ${child} lacks canonical lifecycle`)}}
  return true;
}
const refId=value=>String(value?.id??0),unit=(observation,reference)=>observation?.preview?.units?.find(value=>String(value.id??0)===reference.id),feature=(observation,reference)=>observation?.tactical?.features?.find(value=>refId(value.reference)===reference.id&&String(value.reference.lifetime)===reference.lifetime);
const near=(position,target,tolerance=32)=>position&&Math.hypot(position.x-target.x,position.z-target.z)<=tolerance;
export function assertObservedEffects(rows,journey){
  const observations=rows.filter(x=>x.kind==="observation").map(x=>x.value),first=observations[0],last=observations.at(-1);insist(observations.length>=2,"later tactical observations required");
  if(journey.mode==="pointer"){
    const beforeBuild=first.preview.units.filter(x=>x.definitionId===journey.buildDefinitionId).length,afterBuild=last.preview.units.filter(x=>x.definitionId===journey.buildDefinitionId).length;insist(afterBuild>beforeBuild,"constructed definition was not observed");
    const health=observations.map(x=>unit(x,journey.repairTarget)?.health).filter(Number.isFinite);insist(health.length>=2&&Math.max(...health)>health[0],"repair health increase was not observed");
    const reclaim=observations.map(x=>feature(x,journey.feature)?.reclaimLeft).filter(Number.isFinite);insist(!feature(last,journey.feature)||(reclaim.length>=2&&reclaim.at(-1)<reclaim[0]),"feature reclaim was not observed");
    const resources=observations.map(x=>x.tactical?.economy?.metal?.current).filter(Number.isFinite);insist(resources.some((value,index)=>index&&value>resources[index-1]),"reclaimed-resource increase was not observed");
  }else if(journey.mode==="keyboard"){
    const products=last.preview.units.filter(x=>x.definitionId===journey.productDefinitionId);insist(products.length>=Number(journey.productionCount??2),"factory production count was not observed");insist(products.some(x=>near(x.position,journey.positions.rally,journey.rallyTolerance??64)),"produced unit did not reach rally target");
    const actorStates=observations.map(x=>x.tactical?.actors?.find(a=>refId(a.actor)===journey.factory.id)).filter(Boolean),queues=actorStates.map(x=>x.queue?.find(q=>q.domain==="QUEUE_DOMAIN_FACTORY_PRODUCTION")).filter(Boolean);insist(new Set(queues.map(x=>x.revision)).size>1,"factory queue revision did not change");insist(queues.some(x=>x.repeat===true),"factory repeat state was not observed");insist(actorStates.some(x=>x.descriptors?.some(d=>d.kind==="TACTICAL_DESCRIPTOR_BAR_CONSTRUCTION_PRIORITY"&&d.observedModeValue==="TACTICAL_MODE_VALUE_ENABLED")),"selected BAR mode was not observed");
  }else{
    const submits=rows.filter(x=>x.kind==="submit"),mixed=submits.find(x=>x.value.intent?.actors?.length>=2);insist(mixed,"imported guest did not submit a mixed-actor parent");const parent=mixed.value.parentId,dispatch=rows.filter(x=>x.kind==="result"&&x.value.parentId===parent&&x.value.stage==="LIVE_RESULT_STAGE_NATIVE_DISPATCH"&&x.value.status==="LIVE_RESULT_STATUS_APPLIED");insist(dispatch.length===mixed.value.intent.actors.length,"mixed parent did not retain every child outcome");
    const health=observations.map(x=>unit(x,journey.combatTarget)?.health).filter(Number.isFinite);insist(health.length>=2&&Math.min(...health)<health[0],"combat health loss was not observed");
  }
  return true;
}
