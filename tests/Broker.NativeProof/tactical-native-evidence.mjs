import { lstat, readFile } from "node:fs/promises";
const insist=(value,detail)=>{if(!value)throw Error(detail)},sha=/^[0-9a-f]{64}$/,commit=/^[0-9a-f]{40}$/;
const loop=(value,protocols)=>{const u=new URL(value);insist(protocols.includes(u.protocol)&&["127.0.0.1","localhost"].includes(u.hostname),"endpoint must be loopback");return u};
export async function readPrivateJson(path){const stat=await lstat(path);insist(stat.isFile()&&!stat.isSymbolicLink()&&(stat.mode&0o777)===0o600,"handoff must be a regular mode-0600 file");return JSON.parse(await readFile(path,"utf8"))}
const reference=(value,label)=>insist(value&&/^\d+$/.test(value.id)&&/^[1-9]\d*$/.test(value.lifetime),`${label} requires a presence-bearing lifetime reference`);
export const requiredManualFamilies=["construction","economy","guard","repair","reclaimUnit","reclaimFeature","reclaimArea","factoryAppendQuantity","factoryReplaceNonemptySafety","rally","queueInsert","queueRemove","queueRepeat","rejectBusy","staleRevision","barConstructionPriority","barCloakDesire","mixedChildren","combat"];
export const pendingRequiredCoverage=["factoryReplaceNonemptyPositive"];
export function validateTacticalHandoff(value){
  insist(value?.schema==="fsbar.barc-tactical-native-browser-handoff/v1"&&value.fixtureMode===false,"real tactical handoff required");
  insist(commit.test(value.sourceCommit)&&sha.test(value.archiveSha256)&&sha.test(value.clientSha256)&&sha.test(value.pluginSha256)&&sha.test(value.engineSha256),"exact source/archive/client/plugin/engine pins required");
  insist(value.profile==="barc-live-tactical-v1"&&value.protocolVersion===2&&value.tacticalRevision===1&&value.guestAbiVersion===1,"frozen tactical negotiation required");
  insist(value.codecDirectory?.startsWith("/")&&value.products?.length===2&&new Set(value.products.map(x=>x.id)).size===2,"local/generated products and codec required");
  insist(value.products.some(x=>x.id==="local")&&value.products.some(x=>x.id==="generated"),"local and generated products required");
  insist(JSON.stringify(value.requiredCoverageGaps)===JSON.stringify(pendingRequiredCoverage),"positive nonempty factory Replace must remain an explicit pending native dependency");
  const ids=new Set(),credentials=new Set();
  for(const product of value.products){
    insist(product.receiverRoot?.startsWith("/")&&product.journeys?.length===3,"each product requires retained receiver and three journeys");
    insist(new Set(product.journeys.map(x=>x.mode)).size===3,"pointer, keyboard and importedGuest journeys required");
    for(const journey of product.journeys){
      insist(["pointer","keyboard","importedGuest"].includes(journey.mode)&&/^[\w.-]+$/.test(journey.id)&&!ids.has(journey.id),"safe unique journey id required");ids.add(journey.id);
      const receiver=loop(journey.receiverUrl,["http:"]),origin=loop(journey.allowedOrigin,["http:"]);insist(receiver.origin===origin.origin&&receiver.searchParams.get("barc-profile")===value.profile,"receiver origin/profile mismatch");loop(journey.gatewayUrl,["ws:","wss:"]);
      insist(journey.credential&&!credentials.has(journey.credential)&&journey.expectedSessionId,"unique private pairing required");credentials.add(journey.credential);
      insist(journey.nativeTracePath?.startsWith("/")&&journey.engineTracePath?.startsWith("/")&&journey.outputPath?.startsWith("/"),"private trace paths required");
      reference(journey.builder,"builder");reference(journey.repairTarget,"repair target");reference(journey.reclaimUnitTarget,"reclaim unit target");reference(journey.factory,"factory");reference(journey.combatTarget,"combat target");reference(journey.feature,"feature");reference(journey.areaFeature,"area feature");insist(journey.mixedActors?.length>=2,"mixed actors required");journey.mixedActors.forEach((x,index)=>reference(x,`mixed actor ${index}`));
      reference(journey.modeActors?.constructionPriority,"construction priority actor");reference(journey.modeActors?.cloakDesire,"cloak actor");reference(journey.mixedAppliedActor,"mixed applied actor");reference(journey.mixedRefusedActor,"mixed refused actor");
      insist(journey.mixedAction==="guard"&&journey.mixedActors.some(x=>x.id===journey.mixedAppliedActor.id&&x.lifetime===journey.mixedAppliedActor.lifetime)&&journey.mixedActors.some(x=>x.id===journey.mixedRefusedActor.id&&x.lifetime===journey.mixedRefusedActor.lifetime),"mixed fixture must name two admissible actors and its native-only divergence");
      insist(Number.isInteger(journey.buildDefinitionId)&&journey.buildDefinitionId>0&&Number.isInteger(journey.productDefinitionId)&&journey.productDefinitionId>0,"definition identities required");
      if(journey.mode!=="importedGuest")insist(Number.isInteger(journey.productionCount)&&journey.productionCount>=2&&Number.isInteger(journey.existingProductionDefinitionId)&&journey.existingProductionDefinitionId>0&&journey.existingProductionDefinitionId!==journey.productDefinitionId,"manual factory evidence requires distinct nonempty AppendN fixtures");
      insist(journey.positions&&Object.values(journey.positions).every(p=>Number.isFinite(p.x)&&Number.isFinite(p.z)),"finite world positions required");
      if(journey.mode==="keyboard")insist(journey.keyboardTargets==="t/f/l-v1","exact keyboard target-control revision required");
      if(journey.mode==="importedGuest")insist(journey.guestPath?.startsWith("/")&&sha.test(journey.guestSha256)&&journey.importedExpectedAction==="build"&&journey.importedActors?.length>0,"independent guest bytes, actors and exact effect required");
      const families=new Set((journey.steps??[]).map(x=>x.family));
      if(journey.mode!=="importedGuest")for(const family of requiredManualFamilies)insist(families.has(family),`${journey.mode} journey lacks ${family}`);
      else insist(families.has("importedPolicyEffect")&&families.has("zeroWriteRefusal"),"imported guest needs a distinct effect and zero-write refusal");
    }
  }
  return value;
}
export async function loadTacticalHandoff(path){return validateTacticalHandoff(await readPrivateJson(path))}
export function assertCanonicalLifecycle(rows,expectedParents){
  for(const parent of expectedParents){const result=rows.filter(x=>x.kind==="result"&&x.parentId===parent.id);insist(result.length,"parent result missing");const reported=new Set(result.map(x=>x.childCount));insist(reported.size===1&&reported.has(parent.childCount),`parent ${parent.id} child count changed`);for(let child=0;child<parent.childCount;child++){const childRows=result.filter(x=>x.childIndex===child),stages=childRows.map(x=>`${x.stage}/${x.status}`);insist(stages.includes("BrokerAdmission/Accepted")||stages.includes("BrokerAdmission/Rejected"),`parent ${parent.id} child ${child} lacks broker terminal admission`);if(parent.requireMixed)insist(stages.includes("BrokerAdmission/Accepted"),`parent ${parent.id} child ${child} was refused before the native mixed fence`);const brokerRejected=stages.includes("BrokerAdmission/Rejected"),nativeRejected=stages.includes("NativeAdmission/Rejected"),dispatch=stages.includes("NativeDispatch/Applied")||stages.includes("NativeDispatch/Skipped"),unknown=childRows.some(x=>x.stage==="Unknown"&&(x.status==="Expired"||x.status==="Unknown"));insist(brokerRejected||nativeRejected||dispatch||unknown,`parent ${parent.id} child ${child} lacks terminal outcome`);if(parent.requireApplied)insist(stages.includes("BrokerAdmission/Accepted")&&stages.includes("NativeAdmission/Accepted")&&stages.includes("NativeDispatch/Applied"),`parent ${parent.id} child ${child} was not applied`)}const terminal=result.filter(x=>["BrokerAdmission","NativeAdmission","NativeDispatch","Unknown"].includes(x.stage)).map(x=>x.status);if(parent.requireMixed)insist(terminal.includes("Applied")&&terminal.some(x=>["Rejected","Skipped","Expired","Unknown"].includes(x)),`parent ${parent.id} lacks mixed applied/refused outcomes`);if(parent.requireNonApplied)insist(!terminal.includes("Applied")&&terminal.some(x=>["Rejected","Skipped","Expired","Unknown"].includes(x)),`parent ${parent.id} unexpectedly applied`)}
  return true;
}
export function isExactStaleBasisRefusal(rows,submit){
  const expected="broker refused stale tactical observation basis; refresh the current observation",count=plannedChildCount(submit?.intent),results=rows.filter(x=>x.kind==="result"&&x.value?.parentId===submit?.parentId).map(x=>x.value);
  return count>0&&results.length===count&&results.every((value,index)=>value.childCount===count&&value.childIndex===index&&value.stage==="LIVE_RESULT_STAGE_BROKER_ADMISSION"&&value.status==="LIVE_RESULT_STATUS_REJECTED"&&value.disposition==="LIVE_RESULT_DISPOSITION_RECORDED"&&value.reason===expected&&JSON.stringify(value.basis)===JSON.stringify(submit.basis));
}
export function isFreshPhysicalReplacement(stale,fresh,observations){
  const sameSource=(left,right)=>left?.matchId===right?.matchId&&left?.processIncarnation===right?.processIncarnation&&left?.stateChannelIncarnation===right?.stateChannelIncarnation;
  return Boolean(stale?.parentId&&fresh?.parentId&&stale?.inputId&&fresh?.inputId&&fresh.parentId!==stale.parentId&&fresh.inputId!==stale.inputId&&JSON.stringify(fresh.controller)===JSON.stringify(stale.controller)&&JSON.stringify(fresh.module)===JSON.stringify(stale.module)&&sameSource(stale.basis,fresh.basis)&&BigInt(fresh.basis.stateSequence)>BigInt(stale.basis.stateSequence)&&fresh.intent?.action===stale.intent?.action&&JSON.stringify(fresh.intent?.actors)===JSON.stringify(stale.intent?.actors)&&observations.some(value=>JSON.stringify(value.basis)===JSON.stringify(fresh.basis)));
}
const refId=value=>String(value?.id??0),sameRef=(a,b)=>refId(a)===b.id&&String(a?.lifetime??0)===b.lifetime;
const observedRef=(observation,reference)=>observation?.units?.find(value=>sameRef(value.reference,reference));
const unit=(observation,reference)=>observedRef(observation,reference)&&observation?.preview?.units?.find(value=>String(value.id??0)===reference.id);
const feature=(observation,reference)=>observation?.tactical?.features?.find(value=>sameRef(value.reference,reference));
const near=(position,target,tolerance=32)=>position&&Math.hypot(position.x-target.x,position.z-target.z)<=tolerance;
const exactJson=(left,right)=>JSON.stringify(left)===JSON.stringify(right);
const positiveNativeTag=entry=>/^[1-9]\d*$/.test(String(entry?.nativeTag??""));
const queueState=(observation,actor,domain)=>observation?.tactical?.actors?.find(value=>sameRef(value.actor,actor))?.queue?.find(value=>value.domain===domain);
const productionQueue=(observation,journey)=>queueState(observation,journey.factory,"QUEUE_DOMAIN_FACTORY_PRODUCTION");
const rallyQueue=(observation,journey)=>queueState(observation,journey.factory,"QUEUE_DOMAIN_FACTORY_RALLY");
export const exactObservedUnit=(observation,reference)=>unit(observation,reference);
export function newlyCompletedUnits(before,after,definitionId){const prior=new Set((before?.units??[]).map(x=>`${refId(x.reference)}:${x.reference.lifetime}`));return(after?.units??[]).filter(x=>!prior.has(`${refId(x.reference)}:${x.reference.lifetime}`)).map(x=>unit(after,{id:refId(x.reference),lifetime:String(x.reference.lifetime)})).filter(x=>x?.definitionId===definitionId&&Number.isFinite(x.health)&&Number.isFinite(x.maxHealth)&&x.health>=x.maxHealth)}
export function exactHealthDecreased(before,after,reference){const a=unit(before,reference)?.health,b=unit(after,reference)?.health;return Number.isFinite(a)&&Number.isFinite(b)&&b<a}
export function causalActionWindow(rows,family){
  const actionIndex=rows.findIndex(x=>x.kind==="action"&&x.family===family),next=rows.findIndex((x,index)=>index>actionIndex&&x.kind==="action");
  insist(actionIndex>=0,`${family} action missing`);const end=next<0?rows.length:next,action=rows[actionIndex],before=action.beforeObservation;
  insist(before,`${family} lacks an exact pre-action observation`);const submits=rows.slice(actionIndex+1,end).filter(x=>x.kind==="submit"),submit=submits[action.causalSubmitOrdinal??0]?.value;insist(submit,`${family} lacks a submission inside its causal window`);
  const frames=rows.slice(actionIndex+1,end).filter(x=>x.kind==="result"&&x.value.parentId===submit.parentId&&x.value.stage==="LIVE_RESULT_STAGE_NATIVE_DISPATCH"&&Number.isInteger(x.value.nativeFrame)).map(x=>x.value.nativeFrame);insist(frames.length,`${family} lacks a native dispatch frame`);
  const frame=Math.max(...frames),basis=submit.basis,sameSource=x=>x.basis?.matchId===basis?.matchId&&x.basis?.processIncarnation===basis?.processIncarnation&&x.basis?.stateChannelIncarnation===basis?.stateChannelIncarnation;
  const after=rows.slice(actionIndex+1,end).filter(x=>x.kind==="observation").map(x=>x.value).filter(x=>sameSource(x)&&BigInt(x.basis.stateSequence)>BigInt(basis.stateSequence)&&Number(x.basis.nativeFrame)>frame);
  insist(after.length,`${family} lacks a bounded later same-source observation after native frame ${frame}`);return{action,before,after,last:after.at(-1),submit,frame};
}
function actionRows(rows,family){const actionIndex=rows.findIndex(x=>x.kind==="action"&&x.family===family),next=rows.findIndex((x,index)=>index>actionIndex&&x.kind==="action");insist(actionIndex>=0,`${family} action missing`);return{action:rows[actionIndex],rows:rows.slice(actionIndex+1,next<0?rows.length:next)}}
function exactFactoryIntent(submit,journey,policy,count){insist(submit?.intent?.action==="factoryProduce",`factory ${policy} evidence lacks FactoryProduce intent`);insist(submit.intent.actors?.length===1&&sameRef(submit.intent.actors[0],journey.factory),`factory ${policy} actor changed`);insist(submit.intent.factoryProduce?.queuePolicy===policy&&Number(submit.intent.factoryProduce.count)===count,`factory ${policy} policy or count changed`)}
function exactAppliedChildren(rows,submit,count){for(let index=0;index<count;index++){const child=rows.filter(x=>x.kind==="result"&&x.value.parentId===submit.parentId&&x.value.childIndex===index&&x.value.childCount===count).map(x=>`${x.value.stage}/${x.value.status}`);insist(child.includes("LIVE_RESULT_STAGE_BROKER_ADMISSION/LIVE_RESULT_STATUS_ACCEPTED")&&child.includes("LIVE_RESULT_STAGE_NATIVE_ADMISSION/LIVE_RESULT_STATUS_ACCEPTED")&&child.includes("LIVE_RESULT_STAGE_NATIVE_DISPATCH/LIVE_RESULT_STATUS_APPLIED"),`factory Append child ${index} lacks its count1 applied lifecycle`)}}
export function assertFactoryProductionEvidence(rows,journey){
  const count=Number(journey.productionCount);insist(Number.isInteger(count)&&count>=2,"factory Append quantity requires N >= 2");
  const append=causalActionWindow(rows,"factoryAppendQuantity"),beforeQueue=productionQueue(append.before,journey),beforeRally=rallyQueue(append.before,journey);
  exactFactoryIntent(append.submit,journey,"TACTICAL_QUEUE_POLICY_APPEND",count);exactAppliedChildren(rows,append.submit,count);
  insist(beforeQueue?.complete&&beforeQueue.repeat===false&&beforeQueue.entries?.length>0,"factory Append quantity requires a complete nonempty Repeat=false production queue");
  insist(beforeQueue.entries.some(entry=>Number(entry.definitionId)===journey.existingProductionDefinitionId&&positiveNativeTag(entry)),"factory Append quantity lacks a distinguishable existing production order");
  insist(beforeRally?.complete,"factory Append quantity requires a complete rally queue baseline");
  const queueEvidence=append.after.find(observation=>{const current=productionQueue(observation,journey),rally=rallyQueue(observation,journey);if(!current?.complete||current.repeat!==false||current.entries?.length!==beforeQueue.entries.length+count||!exactJson(rally,beforeRally))return false;const added=current.entries.slice(beforeQueue.entries.length),tags=new Set(added.map(entry=>String(entry.nativeTag)));return beforeQueue.entries.every((entry,index)=>exactJson(entry,current.entries[index]))&&added.every(entry=>Number(entry.definitionId)===journey.productDefinitionId&&positiveNativeTag(entry))&&tags.size===count});
  insist(queueEvidence,"factory Append did not preserve the existing ordered queue and append exactly N requested count1 entries");
  const completed=append.after.map(observation=>newlyCompletedUnits(append.before,observation,journey.productDefinitionId));
  insist(completed.some(value=>value.length===count)&&completed.every(value=>value.length<=count),"factory Append did not produce exactly N new requested lifetime identities");
  insist(append.after.every(observation=>productionQueue(observation,journey)?.repeat===false),"factory Append changed Repeat=false");
  insist(append.after.every(observation=>exactJson(rallyQueue(observation,journey),beforeRally)),"factory Append mutated the rally queue");

  const replace=actionRows(rows,"factoryReplaceNonemptySafety"),submit=replace.rows.find(x=>x.kind==="submit")?.value,replaceBefore=replace.action.beforeObservation,replaceQueue=productionQueue(replaceBefore,journey),replaceRally=rallyQueue(replaceBefore,journey);
  exactFactoryIntent(submit,journey,"TACTICAL_QUEUE_POLICY_REPLACE",count);
  insist(replaceQueue?.complete&&replaceQueue.repeat===false&&replaceQueue.entries?.length>0,"factory Replace safety requires a complete nonempty Repeat=false production queue");
  insist(replaceQueue.entries.some(entry=>Number(entry.definitionId)===journey.existingProductionDefinitionId&&positiveNativeTag(entry)),"factory Replace safety lacks a distinguishable existing production order");
  insist(replaceRally?.complete,"factory Replace safety requires a complete rally queue baseline");
  const results=replace.rows.filter(x=>x.kind==="result"&&x.value.parentId===submit.parentId).map(x=>x.value);
  insist(results.length===count,"factory Replace safety lacks one correlated refusal per child");
  for(let index=0;index<count;index++){const child=results.filter(value=>value.childIndex===index&&value.childCount===count);insist(child.length===1&&child[0].stage==="LIVE_RESULT_STAGE_BROKER_ADMISSION"&&child[0].status==="LIVE_RESULT_STATUS_REJECTED"&&child[0].disposition==="LIVE_RESULT_DISPOSITION_RECORDED"&&exactJson(child[0].basis,submit.basis),`factory Replace child ${index} is not an exact correlated broker refusal`)}
  insist(!replace.rows.some(x=>x.kind==="result"&&x.value.parentId===submit.parentId&&["LIVE_RESULT_STAGE_NATIVE_ADMISSION","LIVE_RESULT_STAGE_NATIVE_DISPATCH"].includes(x.value.stage)),"factory Replace safety reached native admission or dispatch");
  const later=replace.rows.filter(x=>x.kind==="observation").map(x=>x.value).filter(value=>value.basis?.matchId===submit.basis?.matchId&&value.basis?.processIncarnation===submit.basis?.processIncarnation&&value.basis?.stateChannelIncarnation===submit.basis?.stateChannelIncarnation&&BigInt(value.basis.stateSequence)>BigInt(submit.basis.stateSequence));
  insist(later.length&&later.some(observation=>exactJson(productionQueue(observation,journey),replaceQueue)&&exactJson(rallyQueue(observation,journey),replaceRally)),"factory Replace refusal lacks a later complete unchanged production/rally observation");
  insist(later.every(observation=>newlyCompletedUnits(replaceBefore,observation,journey.productDefinitionId).length===0),"factory Replace refusal was followed by a requested production effect");
  return{factoryAppendNonemptyQuantity:"observed",factoryReplaceNonemptySafety:"observed-refusal",factoryReplaceNonemptyPositive:"pending-native-dependency"};
}
export function assertObservedEffects(rows,journey){
  const observations=rows.filter(x=>x.kind==="observation").map(x=>x.value);insist(observations.length>=2,"later tactical observations required");
  if(journey.mode==="importedGuest"){
    const policy=rows.find(x=>x.kind==="submit")?.value;insist(policy?.intent?.action===journey.importedExpectedAction,"imported guest did not produce its pinned distinct action");insist(policy.intent.actors.length===journey.importedActors.length&&policy.intent.actors.every((x,i)=>sameRef(x,journey.importedActors[i])),"imported guest actor policy changed");
    const imported=causalActionWindow(rows,"importedPolicyEffect");insist(imported.after.some(x=>newlyCompletedUnits(imported.before,x,journey.buildDefinitionId).length>0),"imported Build did not cause a new completed building in its own action window");
    return true;
  }
  const actionWindow=family=>causalActionWindow(rows,family);
  const completed=actionWindow("construction"),beforeCount=completed.before.preview.units.filter(x=>x.definitionId===journey.buildDefinitionId).length,newBuildings=completed.after.flatMap(x=>x.preview.units.filter(u=>u.definitionId===journey.buildDefinitionId)).filter(u=>Number.isFinite(u.health)&&Number.isFinite(u.maxHealth)&&u.health>=u.maxHealth);insist(completed.last.preview.units.filter(x=>x.definitionId===journey.buildDefinitionId).length>beforeCount&&newBuildings.length,"new construction never reached complete health/progress");
  const guard=actionWindow("guard"),guardQueues=guard.after.map(x=>x.tactical?.actors?.find(a=>refId(a.actor)===journey.builder.id)?.queue?.find(q=>q.domain==="QUEUE_DOMAIN_ACTOR_ORDER")).filter(Boolean);insist(guardQueues.some(q=>q.entries?.some(e=>e.action==="LIVE_ACTION_KIND_GUARD"&&refId(e.unitTarget)===journey.repairTarget.id)),"guard command was not observed in the post-dispatch queue");
  const repair=actionWindow("repair"),repairBefore=unit(repair.before,journey.repairTarget)?.health,repairAfter=repair.after.map(x=>unit(x,journey.repairTarget)?.health).filter(Number.isFinite);insist(Number.isFinite(repairBefore)&&repairAfter.some(x=>x>repairBefore),"repair health increase was not observed after dispatch");
  for(const[family,targetRef,isFeature]of[["reclaimUnit",journey.reclaimUnitTarget,false],["reclaimFeature",journey.feature,true],["reclaimArea",journey.areaFeature,true]]){const window=actionWindow(family),present=x=>isFeature?feature(x,targetRef):unit(x,targetRef),initial=present(window.before),later=window.after.map(present);insist(initial&&later.some(x=>!x||(isFeature?Number.isFinite(x.reclaimLeft)&&x.reclaimLeft<initial.reclaimLeft:Number.isFinite(x.health)&&x.health<initial.health)),`${family} target did not diminish or disappear`);const beforeMetal=window.before.tactical?.economy?.metal,current=beforeMetal?.current,after=window.after.find(x=>Number.isFinite(x.tactical?.economy?.metal?.current)&&x.tactical.economy.metal.current>current);insist(Number.isFinite(current)&&after,"reclaim resource increase was not observed");const elapsed=Math.max(0,(Number(after.preview.capturedAtUnixMs)-Number(window.before.preview.capturedAtUnixMs))/1000),passive=(beforeMetal.incomePerSecond??0)*elapsed;insist(after.tactical.economy.metal.current-current>passive+(journey.resourceAttributionTolerance??0.01),`${family} resource delta is explainable by unrelated income`)}
  const factory=actionWindow("factoryAppendQuantity"),beforeProductRefs=new Set(factory.before.units.filter(x=>unit(factory.before,{id:refId(x.reference),lifetime:String(x.reference.lifetime)})?.definitionId===journey.productDefinitionId).map(x=>`${refId(x.reference)}:${x.reference.lifetime}`)),newProducts=factory.last.units.filter(x=>unit(factory.last,{id:refId(x.reference),lifetime:String(x.reference.lifetime)})?.definitionId===journey.productDefinitionId&&!beforeProductRefs.has(`${refId(x.reference)}:${x.reference.lifetime}`));insist(newProducts.length===Number(journey.productionCount),"factory did not produce exactly the requested new lifetime identities");insist(newProducts.every(x=>near(unit(factory.last,{id:refId(x.reference),lifetime:String(x.reference.lifetime)}).position,journey.positions.rally,journey.rallyTolerance??64)),"each new factory unit did not reach the preinstalled rally target");const factoryCoverage=assertFactoryProductionEvidence(rows,journey);
  const rally=actionWindow("rally"),rallyQueue=x=>x.tactical?.actors?.find(a=>sameRef(a.actor,journey.factory))?.queue?.find(q=>q.domain==="QUEUE_DOMAIN_FACTORY_RALLY");insist(rally.after.some(x=>rallyQueue(x)?.complete&&rallyQueue(x).revision!==rallyQueue(rally.before)?.revision),"rally did not advance the complete native rally queue before production");
  const queueState=(x,actor,domain)=>x.tactical?.actors?.find(a=>sameRef(a.actor,actor))?.queue?.find(q=>q.domain===domain),insert=actionWindow("queueInsert"),remove=actionWindow("queueRemove"),repeat=actionWindow("queueRepeat"),repeatOff=actionWindow("queueRepeatOff");insist(insert.after.some(x=>queueState(x,journey.builder,"QUEUE_DOMAIN_ACTOR_ORDER")?.entries?.some(e=>String(e.nativeTag)===String(insert.action.observedNativeTag))),"queue insert did not expose its exact native tag");insist(remove.action.observedNativeTag===insert.action.observedNativeTag&&remove.after.some(x=>!queueState(x,journey.builder,"QUEUE_DOMAIN_ACTOR_ORDER")?.entries?.some(e=>String(e.nativeTag)===String(remove.action.observedNativeTag))),"queue remove did not remove the exact observed tag");insist(repeat.before&&queueState(repeat.before,journey.factory,"QUEUE_DOMAIN_FACTORY_PRODUCTION")?.entries?.length===0&&repeat.after.some(x=>queueState(x,journey.factory,"QUEUE_DOMAIN_FACTORY_PRODUCTION")?.repeat===true)&&repeatOff.after.some(x=>queueState(x,journey.factory,"QUEUE_DOMAIN_FACTORY_PRODUCTION")?.repeat===false),"factory repeat was not bounded on then off from an empty queue");const finalProducts=observations.at(-1).units.filter(x=>unit(observations.at(-1),{id:refId(x.reference),lifetime:String(x.reference.lifetime)})?.definitionId===journey.productDefinitionId&&!beforeProductRefs.has(`${refId(x.reference)}:${x.reference.lifetime}`));insist(finalProducts.length===Number(journey.productionCount??2),"repeat created uncontrolled additional production");
  for(const[family,kind,actor]of[["barConstructionPriority","TACTICAL_DESCRIPTOR_BAR_CONSTRUCTION_PRIORITY",journey.modeActors.constructionPriority],["barCloakDesire","TACTICAL_DESCRIPTOR_BAR_CLOAK_DESIRE",journey.modeActors.cloakDesire]]){const window=actionWindow(family);insist(window.after.some(x=>x.tactical?.actors?.find(a=>sameRef(a.actor,actor))?.descriptors?.some(d=>d.kind===kind&&d.observedModeValue==="TACTICAL_MODE_VALUE_ENABLED")),`${family} mode value was not observed on its advertised actor`)}
  const combat=actionWindow("combat"),combatBefore=unit(combat.before,journey.combatTarget)?.health;insist(Number.isFinite(combatBefore)&&combat.after.some(x=>Number.isFinite(unit(x,journey.combatTarget)?.health)&&unit(x,journey.combatTarget).health<combatBefore),"combat health loss was not observed after dispatch");
  return factoryCoverage;
}
export function plannedChildCount(intent){const actors=intent?.actors?.length??0,count=intent?.factoryProduce?.count??1;return actors*count}

const stockFields=["domain","id","options.coded","tag","float32params"];
const stockDomains=new Set(["QUEUE_DOMAIN_ACTOR_ORDER","QUEUE_DOMAIN_FACTORY_PRODUCTION","QUEUE_DOMAIN_FACTORY_RALLY"]),u64Max=18446744073709551615n,i32Min=-2147483648,i32Max=2147483647;
const boundedU64=(value,positive=false)=>typeof value==="string"&&/^(?:0|[1-9]\d*)$/.test(value)&&BigInt(value)<=u64Max&&(!positive||value!=="0");
const finiteFloat32Bits=value=>typeof value==="string"&&/^[0-9a-f]{8}$/.test(value)&&((Number.parseInt(value,16)>>>23)&0xff)!==0xff;
export function assertStockQueueEvidence(rows,expected){
  insist(expected?.profile==="barc-live-tactical-stock-v1"&&expected.tacticalRevision===2&&expected.queueEvidenceScheme===2&&expected.queueBridge==="barc-stock-queue-reader-v1","exact stock tactical negotiation and bridge are required");
  insist(JSON.stringify(expected.supportedQueueFields)===JSON.stringify(stockFields),"stock queue supported-field contract changed");
  insist(expected.actor&&boundedU64(String(expected.actor.id))&&boundedU64(String(expected.actor.lifetime),true),"stock expected actor identity is invalid");
  insist(expected.catalogue?.id&&boundedU64(String(expected.catalogue.revision),true)&&sha.test(expected.catalogue.contentSha256),"stock expected catalogue/content identity is incomplete");
  insist(expected.source?.matchId&&expected.source.processIncarnation&&expected.source.stateChannelIncarnation,"stock expected source identity is incomplete");
  const evidence=rows.filter(row=>row.kind==="stockQueueEvidence").map(row=>row.value);insist(evidence.length&&evidence.length<=3,"actual stock queue evidence trace is missing or exceeds its domain bound");
  const actor=`${expected.actor.id}:${expected.actor.lifetime}`, evidenceKeys=new Set();let entryTotal=0,paramTotal=0;
  for(const value of evidence){
    const seen=new Set();
    insist(value.profile===expected.profile&&value.tacticalRevision===2&&value.queueEvidenceScheme===2&&value.queueBridge===expected.queueBridge,"stock queue trace profile or evidence scheme changed");
    insist(value.actor&&`${value.actor.id}:${value.actor.lifetime}`===actor,"stock queue trace actor lifetime changed");
    insist(stockDomains.has(value.domain)&&boundedU64(value.queueRevision,true)&&value.complete===true,"stock queue trace domain, revision or completeness is unavailable");
    insist(value.timeout==="unavailable"&&JSON.stringify(value.supportedQueueFields)===JSON.stringify(stockFields),"stock queue trace claimed timeout or a non-supported field");
    insist(value.catalogueId===expected.catalogue.id&&value.catalogueRevision===String(expected.catalogue.revision)&&value.contentSha256===expected.catalogue.contentSha256,"stock queue trace catalogue/content identity changed");
    insist(value.basis&&boundedU64(value.basis.stateSequence,true)&&Number.isInteger(value.basis.nativeFrame)&&value.basis.nativeFrame>=0&&value.basis.nativeFrame<=0xffffffff&&value.basis.matchId===expected.source.matchId&&value.basis.processIncarnation===expected.source.processIncarnation&&value.basis.stateChannelIncarnation===expected.source.stateChannelIncarnation,"stock queue trace lacks the exact current source basis");
    insist(Array.isArray(value.entries)&&value.entries.length<=64,"stock queue trace entries are missing or exceed the 64-row bound");
    const evidenceKey=`${actor}:${value.domain}:${value.queueRevision}`;insist(!evidenceKeys.has(evidenceKey),"stock queue trace duplicated an actor/domain/revision observation");evidenceKeys.add(evidenceKey);entryTotal+=value.entries.length;
    for(const entry of value.entries){
      insist(Number.isInteger(entry.id)&&entry.id>=i32Min&&entry.id<=i32Max&&Number.isInteger(entry.codedOptions)&&entry.codedOptions>=0&&entry.codedOptions<=65535&&Number.isInteger(entry.tag)&&entry.tag>=i32Min&&entry.tag<=i32Max,"stock queue trace type/id/options/tag is outside its wire bound");
      insist(Array.isArray(entry.float32params)&&entry.float32params.length<=16&&entry.float32params.every(finiteFloat32Bits),"stock queue trace float32 parameter bits are not exact finite lowercase binary32");
      insist(!Object.hasOwn(entry,"timeout"),"stock queue trace fabricated timeout");
      paramTotal+=entry.float32params.length;insist(paramTotal<=256,"stock queue trace exceeds the 256-parameter bound");
      const key=`${value.domain}:${entry.tag}`;insist(!seen.has(key),"stock queue trace duplicated a current domain/tag identity");seen.add(key);
    }
  }
  const joinedEvidence=submit=>{
    insist(submit?.intent?.actors?.length===1&&sameRef(submit.intent.actors[0],expected.actor),"stock submission actor/lifetime does not match the observed actor");
    const factory=submit.intent.factoryProduce;insist(factory?.catalogueId===expected.catalogue.id&&String(factory.catalogueRevision)===String(expected.catalogue.revision),"stock submission catalogue identity does not match the observation");
    const bindings=submit.intent.actorTacticalBindings;insist(Array.isArray(bindings)&&bindings.length===1&&sameRef(bindings[0].actor,expected.actor)&&bindings[0].queueRevisions?.length===1,"stock submission lacks one exact actor queue binding");
    const queue=bindings[0].queueRevisions[0],match=evidence.find(value=>value.domain===queue.domain&&value.queueRevision===String(queue.revision)&&exactJson(value.basis,submit.basis));
    insist(match&&match.domain==="QUEUE_DOMAIN_FACTORY_PRODUCTION","stock submission has no same-source production queue evidence history");return match;
  };
  const exactResults=(submit,count,lifecycle)=>{
    const parent=rows.filter(row=>row.kind==="result"&&row.value?.parentId===submit.parentId).map(row=>row.value);
    insist(parent.length===count*lifecycle.length,"stock submission has a missing, duplicate, or contradictory lifecycle result");
    for(const value of parent)insist(Number.isInteger(value.childIndex)&&value.childIndex>=0&&value.childIndex<count&&value.childCount===count&&sameRef(value.actor,expected.actor)&&exactJson(value.basis,submit.basis),"stock submission result is not exactly correlated to its parent, child, actor, and source basis");
    for(let child=0;child<count;child++){
      const result=parent.filter(value=>value.childIndex===child);
      insist(result.length===lifecycle.length,`stock submission child ${child} lacks its exact correlated lifecycle`);
      for(let index=0;index<lifecycle.length;index++){const [stage,status]=lifecycle[index];insist(result[index].stage===stage&&result[index].status===status,`stock submission child ${child} lacks its exact ordered ${stage} outcome`)}
    }
  };
  const appends=rows.filter(row=>row.kind==="submit"&&row.value?.intent?.action==="factoryProduce"&&row.value.intent.factoryProduce?.queuePolicy==="TACTICAL_QUEUE_POLICY_APPEND").map(row=>row.value);insist(appends.length,"stock factory Append submission is missing");
  let appliedChildren=0;
  for(const submit of appends){joinedEvidence(submit);const count=plannedChildCount(submit.intent);insist(Number.isInteger(count)&&count>=1&&count<=20,"stock factory Append child count is outside its bound");exactResults(submit,count,[["LIVE_RESULT_STAGE_BROKER_ADMISSION","LIVE_RESULT_STATUS_ACCEPTED"],["LIVE_RESULT_STAGE_NATIVE_ADMISSION","LIVE_RESULT_STATUS_ACCEPTED"],["LIVE_RESULT_STAGE_NATIVE_DISPATCH","LIVE_RESULT_STATUS_APPLIED"]]);appliedChildren+=count}
  const replaces=rows.filter(row=>row.kind==="submit"&&row.value?.intent?.action==="factoryProduce"&&row.value.intent.factoryProduce?.queuePolicy==="TACTICAL_QUEUE_POLICY_REPLACE").map(row=>row.value);insist(replaces.length,"stock factory Replace refusal submission is missing");
  for(const submit of replaces){joinedEvidence(submit);const count=plannedChildCount(submit.intent);insist(Number.isInteger(count)&&count>=1&&count<=20,"stock factory Replace child count is outside its bound");exactResults(submit,count,[["LIVE_RESULT_STAGE_BROKER_ADMISSION","LIVE_RESULT_STATUS_REJECTED"]])}
  return{schema:"fsbar.barc-stock-tactical-oracle/v1",profile:expected.profile,tacticalRevision:2,queueEvidenceScheme:2,queueBridge:expected.queueBridge,supportedQueueFields:[...stockFields],timeout:"unavailable",actorLifetime:"observed",currentTag:entryTotal>0?"observed":"unknown",supportedFieldFreshness:"source-basis-catalogue-queue-revision-joined",appliedChildCount:appliedChildren,factoryReplace:"broker-refused",rollback:"unknown",peerService:"unknown"};
}

export function sanitizedLifecycle(rows, connection={closed:false,error:false}){
  const results=rows.filter(x=>x.kind==="result").map(x=>x.value);
  return {schema:"fsbar.barc-tactical-partial/v1",submitCount:rows.filter(x=>x.kind==="submit").length,resultCount:results.length,brokerAdmissionCount:results.filter(x=>x.stage==="LIVE_RESULT_STAGE_BROKER_ADMISSION").length,nativeAdmissionCount:results.filter(x=>x.stage==="LIVE_RESULT_STAGE_NATIVE_ADMISSION").length,nativeDispatchCount:results.filter(x=>x.stage==="LIVE_RESULT_STAGE_NATIVE_DISPATCH").length,unknownCount:results.filter(x=>x.stage==="LIVE_RESULT_STAGE_UNKNOWN").length,socketClosed:Boolean(connection.closed),socketError:Boolean(connection.error)};
}

export async function waitForTerminalOrClose(rows,connection,parentId,count,{timeoutMs=30000,intervalMs=25}={}){
  const deadline=Date.now()+timeoutMs;
  while(Date.now()<=deadline){
    const terminal=new Set(rows.filter(x=>x.kind==="result"&&x.value.parentId===parentId&&(x.value.status==="LIVE_RESULT_STATUS_REJECTED"||x.value.stage==="LIVE_RESULT_STAGE_NATIVE_DISPATCH"||x.value.stage==="LIVE_RESULT_STAGE_UNKNOWN")).map(x=>x.value.childIndex)).size;
    if(terminal===count)return terminal;
    if(connection.closed||connection.error)throw new Error("live websocket closed before terminal result");
    await new Promise(resolve=>setTimeout(resolve,intervalMs));
  }
  throw new Error("timed out waiting for terminal result");
}
