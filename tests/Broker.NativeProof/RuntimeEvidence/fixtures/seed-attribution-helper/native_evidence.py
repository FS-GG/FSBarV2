"""Read-only joins over actual custody outputs. No authority or command producer.
New tagged Lua observations are parsed from the policy-authenticated Recoil infolog.
Source tests may supply controlled records; those are never native acceptance.
"""
import hashlib,json,re,base64,os,stat
from qualify_prearm import need,exact,held_bytes,prefix_bytes,parse,sha,dec,live_process,mapped_roles
PREFIX=b'BARC_PREARM_V1 '
FIELDS={
 'content':{'path','bytes','sha512'},
 'archives':{'map','game','map_sha512','game_sha512'},
 'ai':{'team','id','name','host','short','version','options'},
 'config':{'key','type','value'},
 'vfs':{'path','archive','absolute'},
 'actors':{'team','enemy','factory','builder','target','seed','product'},
 'empty':{'factory','observed_frame'},
 'order':{'factory','ordinal','definition','count','options'},
 'queue':{'factory','ordinal','definition','tag','options'},
 'complete':{'factory','count','empty_frame'},
 'refused':{'reason'},
}
def text(value):
 if value=='-':return ''
 need(type(value)is str and re.fullmatch(r'(?:[0-9a-f]{2}){1,4096}',value),'lua-hex-text');return bytes.fromhex(value).decode('utf8')
def observations(raw,nonce):
 need(type(raw)is bytes and len(raw)<=10*1024*1024,'infolog-bound');out=[]
 for line in raw.splitlines():
  at=line.find(PREFIX)
  if at<0:continue
  line=line[at+len(PREFIX):];need(len(line)<=16384 and b'\0'not in line,'lua-line-bound')
  fields={}
  for item in line.decode('ascii').split(' '):
   need(item.count('=')==1,'lua-token');key,value=item.split('=');need(key not in fields and value,'lua-duplicate-or-empty');fields[key]=value
  kind=fields.get('kind');need(kind in FIELDS,'lua-kind');exact(fields,{'kind','nonce','frame'}|FIELDS[kind],'lua-'+kind)
  need(fields['nonce']==nonce and re.fullmatch('[A-Za-z0-9._-]{1,64}',nonce),'lua-nonce');need(dec(fields['frame'])<=2**32-1,'lua-frame')
  need(kind!='refused','lua-runtime-refusal');out.append(fields)
 need(0<len(out)<=128,'lua-observation-count');return out

def infolog(value,contract,deadline):
 exact(value,['result','effects','config','configPin','producer','transports'],'infolog-input')
 config=parse(held_bytes(value['configPin'],65536,deadline));need(config==value['config'],'infolog-config-pin');need(config['runId']==contract['runId'] and config['source']==contract['source'],'infolog-run-source')
 held_bytes(value['producer'],2*1024*1024,deadline)
 result=parse(held_bytes(value['result'],65536,deadline));exact(result,['boundary','revision','bytes','sha256','state'],'actual-infolog-result');need(result['boundary']=='browser','infolog-boundary')
 effects=parse(held_bytes(value['effects'],16*1024*1024,deadline));need(type(effects)is list and 1<=len(effects)<=256,'infolog-effects-bound')
 policies=[x for x in effects if x.get('kind')=='policy' and x.get('boundary')=='browser'];consumes=[x for x in effects if x.get('kind')=='consume'];need(1<=len(policies)<=3 and len(consumes)==1,'infolog-policy-evaluation-bound')
 need(type(value['transports'])is list and len(value['transports'])==len(policies),'actual-transport-per-evaluation')
 for effect,pin in zip(policies,value['transports']):
  transport=parse(held_bytes(pin,262144,deadline));exact(transport,['requestSha256','requestBytes','ready','completed','stdout','stderr','ownedSettlement','deadlineMonotonic'],'owned-policy-transport')
  ready=transport['ready'];completed=transport['completed'];exact(ready,['schema','invocationId','closureSha256','pid','startTicks','uid','phase'],'policy-ready');exact(completed,set(ready)|{'result'},'policy-completed')
  need(ready['schema']=='fsbar.barc-runtime-evidence-policy-ready/v2' and ready['phase']=='ready' and completed['schema']=='fsbar.barc-runtime-evidence-policy-completed/v2' and completed['phase']=='completed' and all(ready[k]==completed[k]for k in ['invocationId','closureSha256','pid','startTicks','uid']),'actual-framed-closure-join')
  expected_invocation={k:ready[k]for k in ['invocationId','closureSha256','pid','startTicks','uid']};expected_invocation.update(readyPhase='ready',completedPhase='completed');need(effect['invocation']==expected_invocation and ready['closureSha256']==config['artifacts']['runtimeEvidencePolicyClosure']['sha256'],'actual-effect-invocation')
  need(completed['result']=={'schema':'fsbar.barc-growing-log-policy-result/v3','status':effect['status'],'state':effect['afterState']},'actual-canonical-policy-result')
  settled=transport['ownedSettlement'];need(settled['reaped']is True and settled['exitCode']in [0,2] and all(settled['identity'][k]==ready[k]for k in ['pid','startTicks','uid']),'exact-policy-generation-reaped')
  stdout=held_bytes({k:transport['stdout'][k]for k in ['path','sha256','bytes','device','inode','uid','mode','nlink']},131072,deadline)
  # Empty stderr is allowed; its physical identity/digest remains checked.
  stderr_pin={k:transport['stderr'][k]for k in ['path','sha256','bytes','device','inode','uid','mode','nlink']}
  if stderr_pin['bytes']:stderr=held_bytes(stderr_pin,131072,deadline)
  else:
   st=os.lstat(stderr_pin['path']);need(stat.S_ISREG(st.st_mode) and st.st_size==0 and st.st_nlink==1 and st.st_ino==stderr_pin['inode'] and st.st_dev==stderr_pin['device'] and sha(b'')==stderr_pin['sha256'],'empty-policy-stderr-custody');stderr=b''
  need(len(stdout)+len(stderr)<=131072 and [parse(line)for line in stdout.splitlines()]==[ready,completed],'actual-transport-exact-frames')
 policy=policies[-1];need(policy['status']=='accepted','infolog-not-accepted');raw=base64.b64decode(policy['rawBase64'],validate=True);need(len(raw)==result['bytes'] and sha(raw)==result['sha256'],'infolog-actual-extent')
 expected={'runId':config['runId'],'sourceSetSha256':sha(json.dumps(config['source'],sort_keys=True,separators=(',',':')).encode()),'apphostSha256':config['artifacts']['runtimeEvidencePolicy']['sha256'],'closureSha256':config['artifacts']['runtimeEvidencePolicyClosure']['sha256'],'writeRoot':config['commands']['engine'][5],'dataRoot':config['commands']['engine'][3]}
 need(policy['expected']==expected,'infolog-policy-source-closure')
 from growing_log import _closed_state
 observation=policy['observation'];identity={**expected,**{k:observation[k]for k in ['pid','startTicks','uid','device','inode','path']}}
 candidate=_closed_state(policy['afterState'],'accepted','browser',identity,result['revision'],len(raw),sha(raw),policy['beforeState'],raw)
 state=result['state'];need(consumes[0]['beforeState']==candidate,'actual-policy-consumption-predecessor');need(all(state[k]==candidate[k] for k in candidate if k not in ['phase','consumedRevision','consumedBoundary','consumedPrefix','consumption']),'policy-state-preserved-through-consumption');need(state==effects[-1].get('state') and effects[-1].get('outcome')=='accepted' and state['phase']=='consumed' and state['stickyInvalid']is False and state['consumedBoundary']=='browser' and state['consumedRevision']==result['revision'],'infolog-consumption')
 obs=consumes[0]['observation'];need(obs==state['consumption'] and 0<=obs['readStartMicroseconds']<=obs['readEndMicroseconds']<=obs['linearizedMicroseconds']<=obs['releasedMicroseconds']<obs['deadlineMicroseconds']<=5000000,'infolog-five-second-bound')
 need(0<state['probeCount']<=32 and 0<state['evaluationCount']<=3 and state['prefix']['rawSha256']==sha(raw) and state['prefix']['rawBytes']==len(raw),'infolog-finite-prefix')
 for role in ['runtimeEvidencePolicy','runtimeEvidencePolicyClosure']:need(config['artifacts'][role]['sha256']==expected['apphostSha256' if role=='runtimeEvidencePolicy'else 'closureSha256'],'infolog-artifact')
 need(state['consumedPrefix']==candidate['prefix'],'consumed-actual-prefix')
 return raw,config

def horizons(value,contract,bodies,deadline):
 exact(value,['schema','prefixes','infolog'],'prefix-evidence');need(value['schema']=='bar.prearm-prefix-observations/v2','prefix-schema');exact(value['prefixes'],['raw','host','stock'],'prefix-roles')
 for role,pin in value['prefixes'].items():
  receipt=parse(held_bytes(pin,65536,deadline));exact(receipt,['schema','role','livePin','retainedPin','writer','terminal','observedBytes','suffixBytes'],'prefix-observation')
  need(receipt['schema']=='bar.prearm-live-prefix-observation/v1' and receipt['role']==role and receipt['terminal']is False and receipt['livePin']==contract['inputs'][role],'actual-prefix-join')
  need(receipt['writer']==contract['writer'] if role!='stock' else set(receipt['writer'])=={'pid','startTicks','uid'},'prefix-writer')
  raw=held_bytes(receipt['retainedPin'],4*1024*1024 if role=='raw'else 16*1024*1024,deadline);need(raw==bodies[role] and receipt['livePin']['bytes']==len(raw) and receipt['observedBytes']>=len(raw) and receipt['suffixBytes']==receipt['observedBytes']-len(raw),'prefix-byte-observation')
  # Authenticate an actual writable O_APPEND FD in the exact live writer generation.
  live_process(receipt['writer']);writable=False
  names=os.listdir('/proc/'+str(receipt['writer']['pid'])+'/fd');need(len(names)<=256,'writer-fd-bound')
  for name in names:
   fdpath='/proc/'+str(receipt['writer']['pid'])+'/fd/'+name
   try:
    st=os.stat(fdpath);info=open('/proc/'+str(receipt['writer']['pid'])+'/fdinfo/'+name).read(4096);m=re.search(r'^flags:\s+([0-7]+)$',info,re.M)
   except FileNotFoundError:continue
   if (st.st_dev,st.st_ino)==(receipt['livePin']['device'],receipt['livePin']['inode']) and m:
    flags=int(m[1],8);writable=writable or bool(flags&os.O_APPEND and flags&os.O_ACCMODE in [os.O_WRONLY,os.O_RDWR])
  need(writable,'actual-prefix-writable-append-fd');live_process(receipt['writer'])
 infolog(value['infolog'],contract,deadline)

def configuration(value,contract,deadline):
 exact(value,['schema','source','roles','loaded','settings','configPin','infolog','review','archiveInventory','producerSource'],'native-evidence')
 need(value['schema']=='bar.prearm-native-evidence-inputs/v2' and value['source']==contract['source'],'native-evidence-source')
 roles=value['roles'];exact(roles,['engine','plugin','passivePlugin','fixture','observer','gameInventory','mapInventory','settings','setupScript','nullAiSource'],'native-roles')
 for pin in roles.values():held_bytes(pin,128*1024*1024,deadline)
 raw,config=infolog(value['infolog'],contract,deadline);need(value['configPin']==value['infolog']['configPin'],'configuration-policy-join')
 loaded=parse(held_bytes(value['loaded'],1024*1024,deadline));exact(loaded,['schema','status','nativeAcceptance','beforeBrowserEffect','configSha256','sourceSetSha256','process','runtimeClosureSha256','rawMapsSha256','mapsBytes','executableMapCount','uniqueExecutableFiles','required','mappings','observationBeginMonotonicNs','observationEndMonotonicNs'],'loaded')
 need(loaded['schema']=='fsbar.barc-stock-loaded-custody/v1' and loaded['status']=='verified-snapshot' and loaded['nativeAcceptance']is False and loaded['beforeBrowserEffect']is True and loaded['configSha256']==value['configPin']['sha256'] and loaded['sourceSetSha256']==sha(json.dumps(contract['source'],sort_keys=True,separators=(',',':')).encode()) and loaded['runtimeClosureSha256']==config['artifacts']['runtimeClosure']['sha256'],'actual-loaded-inputs')
 policy_result=parse(held_bytes(value['infolog']['result'],65536,deadline));need(all(policy_result['state']['identity'][k]==loaded['process'][k]for k in ['pid','startTicks','uid']),'actual-infolog-engine-generation')
 for role in ['engine','plugin','passivePlugin']:
  need(any(x['path']==roles[role]['path'] and x['sha256']==roles[role]['sha256'] and 'x'in x['permissions'] and int(x['mappedInode'])==roles[role]['inode'] and os.makedev(*[int(part,16) for part in x['mappedDevice'].split(':')])==roles[role]['device'] for x in loaded['mappings']),'actual-mapped-'+role)
  if role!='passivePlugin':need(loaded['required'][role]=={k:roles[role][k]for k in ['path','sha256']},'required-map-join')
 settings=parse(held_bytes(value['settings'],65536,deadline));exact(settings,['schema','seedPath','seedSha256','outputPath','copiedSha256','actualEngineArgv','originalEngineArgv','packetSha256','seedDevice','seedInode','outputDevice','outputInode','nativeAcceptance'],'settings')
 need(settings['schema']=='fsbar.barc-stock-engine-settings-copy/v1' and settings['nativeAcceptance']is False and settings['actualEngineArgv']==config['commands']['engine'] and settings['outputPath']==roles['settings']['path'] and settings['copiedSha256']==settings['seedSha256']==roles['settings']['sha256'] and (settings['outputDevice'],settings['outputInode'])==(roles['settings']['device'],roles['settings']['inode']),'actual-settings-copy')
 review=parse(held_bytes(value['review'],65536,deadline));exact(review,['schema','source','rolesSha256','setupOnlyOrderSites','postSetupOrderSites','competingControllers','aiSlots','effectiveConfig','vfs','archives','sourceReceiptPins'],'static-source-review')
 need(review['schema']=='bar.prearm-static-source-review/v2' and review['source']==contract['source'] and review['rolesSha256']==sha(json.dumps({role:{k:pin[k] for k in ['path','sha256']} for role,pin in roles.items()},sort_keys=True,separators=(',',':')).encode()) and review['postSetupOrderSites']==[] and review['competingControllers']==[],'static-order-closure')
 need(review['setupOnlyOrderSites']==[{'fixtureSha256':roles['fixture']['sha256'],'count':contract['setup']['seedCount'],'definition':contract['setup']['seedDefinitionId'],'options':0}],'static-finite-order-site')
 need(type(review['sourceReceiptPins'])is list and 1<=len(review['sourceReceiptPins'])<=32,'source-receipt-closure')
 for pin in review['sourceReceiptPins']:held_bytes(pin,16*1024*1024,deadline)
 sources=value['producerSource'];exact(sources,['CircuitAI.h','CircuitAI.cpp'],'source');h=held_bytes(sources['CircuitAI.h'],2*1024*1024,deadline);cpp=held_bytes(sources['CircuitAI.cpp'],2*1024*1024,deadline);need(b'bool enableBuiltin = false;'in h and b'if (enableBuiltin)'in cpp and b'modules.push_back(grpcGateway);'in cpp and b'built-in Circuit decision modules cannot be re-enabled'in cpp,'external-control-source')
 null=held_bytes(roles['nullAiSource'],2*1024*1024,deadline);need(re.search(rb'EXPORT\(int\) handleEvent\([^)]*\)\s*\{\s*// TODO: do something\s*// signal: ok\s*return 0;\s*\}',null) is not None,'passive-null-source')
 obs=observations(raw,contract['runId']);contents=[r for r in obs if r['kind']=='content'];need(len(contents)==2,'two-vfs-contents')
 for role,path in [('fixture','LuaRules/Gadgets/barc_stock_queue_fixture.lua'),('observer','LuaRules/Gadgets/barc_stock_queue_reader.lua')]:
  matches=[r for r in contents if text(r['path'])==path];need(len(matches)==1,'vfs-path');body=held_bytes(roles[role],131072,deadline);need(dec(matches[0]['bytes'])==len(body) and matches[0]['sha512']==hashlib.sha512(body).hexdigest(),'vfs-actual-content-sha512')
 actors=[r for r in obs if r['kind']=='actors'];need(len(actors)==1 and actors[0]['factory']==contract['factory']['id'] and dec(actors[0]['seed'])==contract['setup']['seedDefinitionId'] and dec(actors[0]['product'])==contract['setup']['productDefinitionId'],'actual-setup-actors')
 actual_ai=[r for r in obs if r['kind']=='ai'];need(len(actual_ai)==len(review['aiSlots'])==2,'all-two-ai-slots')
 for row in actual_ai:
  expected=next((x for x in review['aiSlots'] if x['team']==int(row['team'])),None);need(expected is not None and text(row['short'])==expected['shortName'] and text(row['version'])==expected['version'] and text(row['options'])==expected['options'] and expected['mode']in ['external-control','passive-null'],'actual-ai-identity')
 need({x['shortName']for x in review['aiSlots']}=={'highBar','NullAI'} and len({x['team']for x in review['aiSlots']})==2,'known-ai-slots-only')
 actual_config={text(r['key']):{'type':r['type'],'value':text(r['value'])}for r in obs if r['kind']=='config'};need(len([r for r in obs if r['kind']=='config'])==len(actual_config)==len(review['effectiveConfig']) and actual_config==review['effectiveConfig'],'actual-effective-settings')
 actual_vfs=[{k:text(r[k])for k in ['path','archive','absolute']}for r in obs if r['kind']=='vfs'];need(actual_vfs==review['vfs'],'actual-vfs-search-selection')
 archives=[r for r in obs if r['kind']=='archives'];need(len(archives)==1,'archive-observation');archive={k:(archives[0][k] if k.endswith('sha512')else text(archives[0][k]))for k in ['map','game','map_sha512','game_sha512']};need(archive==review['archives'] and all(re.fullmatch('[0-9a-f]{128}',archive[k])for k in ['map_sha512','game_sha512']),'native-complete-archive-sha512')
 inventory=parse(held_bytes(value['archiveInventory'],16*1024*1024,deadline));exact(inventory,['schema','archives','gameInventory','mapInventory','searchClosure'],'archive-inventory');need(inventory['schema']=='bar.prearm-selected-archive-inventory/v1' and inventory['archives']==archive and inventory['gameInventory']==roles['gameInventory'] and inventory['mapInventory']==roles['mapInventory'],'complete-package-inventory');need(type(inventory['searchClosure'])is list and inventory['searchClosure'],'archive-search-closure')
 for pin in inventory['searchClosure']:held_bytes(pin,128*1024*1024,deadline)
 complete=[r for r in obs if r['kind']=='complete'];empty=[r for r in obs if r['kind']=='empty'];orders=[r for r in obs if r['kind']=='order'];queues=[r for r in obs if r['kind']=='queue'];need(len(complete)==len(empty)==1 and len(orders)==len(queues)==contract['setup']['seedCount'],'finite-observed-setup')
 c=complete[0];need(c['factory']==contract['factory']['id'] and dec(c['count'])==contract['setup']['seedCount'] and dec(c['empty_frame'])==dec(empty[0]['observed_frame']) and dec(empty[0]['frame'])<dec(c['frame']),'observed-empty-before-enqueue')
 for i,(order,queue)in enumerate(zip(orders,queues),1):
  need(order['factory']==queue['factory']==c['factory'] and dec(order['ordinal'])==dec(queue['ordinal'])==i and dec(order['definition'])==dec(queue['definition'])==contract['setup']['seedDefinitionId'] and order['count']=='1' and order['options']==queue['options']=='0' and dec(order['frame'])==dec(queue['frame'])==dec(c['frame']),'actual-three-plain-orders')
 processes=[{**contract['writer'],'role':'host'},{**loaded['process'],'role':'engine'}];need(processes[0]['pid']!=processes[1]['pid'],'distinct-owned-processes');mapped_roles(processes,roles)
 # Passive plugin must also remain mapped in the current live engine generation.
 mapped_roles(processes,{'engine':roles['engine'],'plugin':roles['passivePlugin']})
 for process in processes:live_process(process)
 return {'processes':processes,'setupCompletion':{'completionNativeFrame':int(c['frame'])}}
