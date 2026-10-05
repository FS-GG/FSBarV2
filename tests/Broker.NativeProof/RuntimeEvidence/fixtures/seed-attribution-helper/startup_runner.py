"""Literal host+engine seed-only startup and one sequential direct policy child. Inert without fresh exact root admission."""
import sys
sys.dont_write_bytecode=True
import os,json,pathlib,time,datetime,argparse,subprocess,selectors,ctypes,hashlib,stat,re
HERE=pathlib.Path(__file__).resolve().parent;sys.path[:0]=[str(HERE),str(HERE/'helper')]
import mechanics as m,outer_custody as outer
from runtime_socket import RuntimeSocket
from stock_bootstrap import authenticate_ready,authenticate_metadata,authenticate_setup,persist_authenticated_snapshots
from runtime_identity import proc_bytes,start_ticks,verify_executable_map_lines,verify_host_dynamic_map_lines
ROOT='/tmp/bar-stock-seed-attribution-20261005-v1';PYTHON='/usr/bin/python3.14'
need=m.need;clock=m.clock
RUNTIME_SOCKET=None

def profile():
 from mapping_profile import load_profile
 need((HERE/'startup-profile.json').is_file()and not(HERE/'startup-profile.json').is_symlink(),'closed JSON input')
 p=load_profile(HERE/'startup-profile.json');need(p['schema']=='bar.seed-attribution-profile/v2' and p['preparationReady'] is True and p['attemptRoot']==ROOT and p['roles']==['host','engine'],'closed startup profile')
 need(p['source']=={'fsbarCommit':'2e332259c5db590be63bb628e6c4de4b3c8e2291','highbarCommit':'b57f11f290dc3239d894b0285ae272b6b21bc25d'} and p['engineSource']=='de69361239d8c8b1012dba3f5aa3122954ea4da3','literal source roles')
 need(p['limits']==dict(wholeSeconds=180,hostReadinessSeconds=60,cleanupReserve=8,termSeconds=3,killSeconds=3,streamBytes=33554432,attemptBytes=134217728,attemptFiles=1024,mapsBytes=4194304,ownedIdentities=128),'literal diagnostic caps')
 need(p['runtimeEnvironment']['DOTNET_EnableDiagnostics']=='0' and p['diagnosticConfigRootSourceDecision']=='Root approved SOURCE profile only; runtime diagnostic admission must bind this exact environment','explicit preparation-independent runtime configuration')
 need(p['runtimeObjects']==dict(directory=ROOT+'/engine/run',socket=ROOT+'/engine/run/highbar-0.sock',role='engine',aiId=0,mode=448)and p['engineRuntimeEnvironment']=={'XDG_RUNTIME_DIR':ROOT+'/engine/run'},'literal reviewed runtime object/environment')
 need(len(os.fsencode(p['runtimeObjects']['socket']))+1<108,'no UDS fallback')
 from dynamic_mapping import PROFILE
 need(p['dynamicMappingProfile']==PROFILE,'closed host-only dynamic metadata profile')
 required=[p['nativeHost']]+[path for path in p['allowedExecutableMappings'] if pathlib.Path(path).name in ('libcoreclr.so','libclrjit.so')]
 from mapping_profile import validate_schema
 validate_schema(p)
 need(p['requiredHostMappings']==required and len(required)==3,'literal pinned apphost/coreclr/clrjit')
 need(p['policy']['environment']=={'PATH':'/usr/bin:/bin'} and p['policy']['maximumSimultaneousChildren']==1 and p['policy']['maximumEvaluations']==3 and p['policy']['deadlineSeconds']==5 and p['policy']['inputBytes']==16777216 and p['policy']['outputBytes']==131072,'literal closed policy caps')
 need(set(p['sourceHelperPins'])=={'helper/runtime_identity.py','helper/stock_bootstrap.py','helper/dynamic_mapping.py','helper/snapshot_publication.py','helper/mapping_profile.py','helper/seed_policy.py','helper/growing_log.py','helper/loaded_custody.py','helper/settings_custody.py','qualify_prearm.py','native_evidence.py','policy_transport_runner.py'},'closed successor source helpers')
 for path,sha in p['sourceHelperPins'].items():need(m.digest(HERE/path)==sha,'exact profile helper byte pin')
 return p

def reviewed_source():
 s=m.load(HERE/'review-packet.json');need(s['schema']=='bar.seed-attribution-source-review/v2','source schema')
 need(len(s['files'])==len({x['path']for x in s['files']}),'unique sealed source rows')
 need(set(x['path']for x in s['files'])=={str(f.relative_to(HERE))for f in HERE.rglob('*')if f.is_file()and f.name!='review-packet.json'},'complete source leaf roster')
 for x in s['files']:
  need(set(x)=={'path','bytes','sha256','mode'}and not pathlib.PurePosixPath(x['path']).is_absolute()and '..'not in pathlib.PurePosixPath(x['path']).parts,'closed safe source row')
  f=HERE/x['path'];need(f.is_file()and not f.is_symlink()and f.stat().st_size==x['bytes']and stat.S_IMODE(f.stat().st_mode)==x['mode']and m.digest(f)==x['sha256'],'all source leaf pins')
 return m.digest(HERE/'review-packet.json')

def admission(a,p,source,operator,now,root_absent,affinity):
 need(set(a)=={'schema','operation','sourceSHA256','profileSHA256','operator','cpu','expiresUTC','root','oneUse','runtimeEnvironment','engineRuntimeEnvironment','runtimeObjects','source','ports','policy','capacity','seedInputsSHA256'},'closed seed admission')
 need(a['schema']=='bar.seed-attribution-admission/v2'and a['operation']=='seed-attribution-startup-only'and a['root']==ROOT and a['oneUse']is True,'startup-only one-use operation')
 need(a['sourceSHA256']==source and a['profileSHA256']==m.digest(HERE/'startup-profile.json'),'exact admitted source/profile')
 need(m.same(a['operator'],operator)and a['operator']['pid']==operator['pid'],'actual admitted operator')
 need(type(a['cpu'])is int and a['cpu']in affinity and root_absent,'fresh absent root and one allowed CPU')
 expires=datetime.datetime.fromisoformat(a['expiresUTC']);need(expires.tzinfo is not None and 0<(expires-now).total_seconds()<=600,'fresh finite admission')
 need(a['engineRuntimeEnvironment']==p['engineRuntimeEnvironment']and a['runtimeObjects']==p['runtimeObjects'],'exact UDS and engine environment admission')
 need(a['runtimeEnvironment']==p['runtimeEnvironment']and a['source']==p['source']and a['ports']==p['proposedPorts'],'closed semantic role/environment/port pins')
 need(a['policy']==p['policy'] and a['seedInputsSHA256']==hashlib.sha256(json.dumps(p['seed'],sort_keys=True,separators=(',',':')).encode()).hexdigest(),'admitted closed seed/policy inputs')
 need(a['capacity']['maximumTaskCLR']==2 and a['capacity']['maximumInfrastructureCLR']==2 and a['capacity']['cpu']==a['cpu'] and a['capacity']['reservationSource'] and a['capacity']['currentCensusPin'],'actual capacity reservation binding required')
 m.checked_pin(a['capacity']['currentCensusPin'])
 return a

def originals(p,deadline):
 rows=p['originalDataPins']+p['hostPins']+p['clrPins']+p['elfPins']+p['pythonPins']+p['authorityPins']
 for x in rows:m.remaining(deadline,1);m.checked_pin(x)
 from mapping_profile import revalidate
 mapping=revalidate(p,lambda:m.remaining(deadline,1))
 return {'mappingIdentities':mapping,'observedPins':len(rows),'originalDataFiles':len(p['originalDataPins']),'acceptedHostMembers':len(p['hostPins'])}

def environment(p,role):
 if role=='policy':return {'PATH':'/usr/bin:/bin'}
 A=pathlib.Path(ROOT);env={'PATH':'/usr/bin:/bin','HOME':str(A/role),'TMPDIR':str(A/role/'tmp'),'LANG':'C.UTF-8','LC_ALL':'C.UTF-8','PYTHONDONTWRITEBYTECODE':'1'}
 if role=='host':
  env.update(p['runtimeEnvironment']);env.update(BARC_ONE_UNIT_RAW_EVENTS=str(A/'host/raw.jsonl'),BARC_STOCK_SMOKE_RUN_ID=p['runId'],BARC_STOCK_SMOKE_READY=str(A/'host/ready.json'),BARC_STOCK_SMOKE_METADATA=str(A/'host/metadata.json'),BARC_STOCK_SMOKE_SETUP=str(A/'host/setup.json'),BARC_STOCK_SMOKE_HOST_TRACE=str(A/'host/host.jsonl'),BARC_STOCK_SMOKE_SOURCE_JSON=json.dumps(p['source'],sort_keys=True,separators=(',',':')),BARC_STOCK_SMOKE_RECEIVER_URL=f"http://127.0.0.1:{p['proposedPorts']['unusedReceiverOrigin']}/barc/?barc-profile=barc-live-tactical-stock-v1")
 if role=='engine':env.update(p['engineRuntimeEnvironment']);env.update(HIGHBAR_COORDINATOR=f"127.0.0.1:{p['proposedPorts']['grpc']}",HIGHBAR_STOCK_QUEUE_TRACE=str(A/'engine/stock.jsonl'),HIGHBAR_STOCK_QUEUE_TRACE_RUN_ID=p['runId'])
 return env

def commands(p,invocation=None):
 ports=p['proposedPorts'];A=pathlib.Path(ROOT)
 result={'host':[p['nativeHost'],'--stock-tactical-live-host',f"127.0.0.1:{ports['grpc']}",f"http://127.0.0.1:{ports['gateway']}",f"http://127.0.0.1:{ports['unusedReceiverOrigin']}",str(A/'host'),p['source']['fsbarCommit']], 'engine':[p['engine'],'--isolation','--isolation-dir',p['dataRoot'],'--write-dir',str(A/'engine'),'--config',str(A/'engine/springsettings.cfg'),p['startscript']]}
 if invocation is not None:
  from seed_policy import policy_argv
  result['policy']=policy_argv(p['policy'],invocation)
 return result

def runtime_socket():
 global RUNTIME_SOCKET
 if RUNTIME_SOCKET is None:
  p=profile();pin=m.load(pathlib.Path(ROOT)/'evidence/runtime-directory.json')
  def engine_identity():
   f=pathlib.Path(ROOT)/'evidence/engine.process.json'
   if not f.exists():return None
   row=m.load(f);need(row['argv']==commands(p)['engine']and row['environment']==environment(p,'engine'),'source-bound observed engine receipt');return row['identity']
  RUNTIME_SOCKET=RuntimeSocket(p['runtimeObjects'],pin,engine_identity)
 return RUNTIME_SOCKET

def validate_startscript(raw):
 text=raw.decode('ascii');slots=re.findall(r'\[ai([0-9]+)\]\s*\{([^{}]*)\}',text,re.I);highbar=[int(i)for i,body in slots if re.search(r'\bshortname\s*=\s*highBar\s*;',body,re.I)]
 need(highbar==[0]and len(slots)==2 and any(re.search(r'\bshortname\s*=\s*NullAI\s*;',body,re.I)for _,body in slots)and len({i for i,body in slots})==len(slots),'exact single HighBar AI ID0 startscript')

def quota(owner=None):
 q=m.quota(pathlib.Path(ROOT),134217728,phase='startup',known_owned=list(owner.records.values())if owner else[],live_owned=owner.observe()if owner else[],runtime_socket=runtime_socket());need(q['files']<=1024,'startup leaf bound');return q

def ready_config(p):return {'runId':p['runId'],'source':p['source'],'bootstrap':{'receiverUrl':environment(p,'host')['BARC_STOCK_SMOKE_RECEIVER_URL']},'roots':{'attemptRoot':ROOT},'paths':{'hostTrace':ROOT+'/host/host.jsonl'}}

def maps(role,child,p,phase,require_complete=False):
 held=m.load(pathlib.Path(ROOT)/'evidence'/(role+'.process.json'))['identity'];ident=m.identity(child.pid)
 need(child.poll() is None and child.pid==held['pid'] and m.same(held,ident),'held map snapshot process drift')
 from dynamic_mapping import held_process
 executable=p['nativeHost'] if role=='host' else p['engine'];before=held_process(held,executable)
 raw=proc_bytes(child.pid,'maps',4194304);target=pathlib.Path(ROOT)/'evidence'/(role+'.'+phase+'.maps.raw')
 from snapshot_publication import bytes_new
 raw_ack=bytes_new(str(target),raw,4194304)
 receipt={'role':role,'phase':phase,'process':ident,'rawSHA256':hashlib.sha256(raw).hexdigest(),'rawBytes':len(raw),'rawPublication':raw_ack,'completeMapsReadThroughEOF':True,'notExhaustiveManagedModuleOrIOProof':True,'status':'Unknown','dynamicMappingMetadata':'Unknown' if role=='host' else 'NotApplicable','dynamicContentSHA256':None,'dynamicContentProvenance':'Unknown','creatorAttribution':'Inference','exhaustiveMemoryOrIOProof':False}
 try:
  allowed={path:{'sha256':sha}for path,sha in p['allowedExecutableMappings'].items()};lines=raw.decode().splitlines()
  if role=='host':
   seen,dynamic=verify_host_dynamic_map_lines(lines,allowed,held,executable,p['dynamicMappingProfile']);receipt['dynamicMapping']=dynamic;receipt['dynamicMappingMetadata']=dynamic['dynamicMappingMetadata']
  else:
   for line in lines:
    fields=line.split(None,5);name=fields[5] if len(fields)==6 else '';need(not name.startswith('/memfd:') and not name.endswith(' (deleted)'),'engine-dynamic-map-refused')
   seen=verify_executable_map_lines(lines,allowed)
  required=[x['path']for x in p['requiredEngineMappings'].values()]if role=='engine'else p['requiredHostMappings'];missing=[x for x in required if x not in seen]
  need(m.same(held,m.identity(child.pid)) and before==held_process(held,executable),'map snapshot process drift');receipt.update(executableFiles=sorted(seen),missingRequired=missing,fileBackedExecutableIdentity='Observed',status='Pending'if missing else 'Observed')
  if require_complete:need(not missing,'actual required loaded role identities')
 except BaseException as e:receipt.update(status='Unknown',error=str(e));m.write_new(target.with_suffix('.json'),receipt);raise
 m.write_new(target.with_suffix('.json'),receipt);return receipt

def content_checkpoint(path):
 path=pathlib.Path(path)
 if not path.is_file()or path.is_symlink():return {'status':'Unknown','reason':'no emitted engine log'}
 need(path.stat().st_size<=33554432,'content log bound');raw=path.read_bytes();text=raw.decode('utf-8')
 patterns={'map':r'\[PreGame::AddMapArchivesToVFS\]\[server=[^\]\r\n]+\] using map "Avalanche 3\.4" \(loaded=1 cached=[01]\)', 'game':r'\[PreGame::AddModArchivesToVFS\]\[server=[^\]\r\n]+\] using game "HighBar BARC Stock Queue Fixture 2" \(loaded=[01] cached=[01]\)'}
 matches={k:re.search(v,text)for k,v in patterns.items()}
 if not all(matches.values()):return {'status':'Unknown','reason':'literal selected map/game emitted joins absent','logSHA256':hashlib.sha256(raw).hexdigest()}
 return {'status':'Observed','scope':'loaded-map emission plus selected-game emission only; game Lua/fixture and authenticated native readiness are separate joins','map':'Avalanche 3.4','game':'HighBar BARC Stock Queue Fixture 2','logSHA256':hashlib.sha256(raw).hexdigest(),'matchedRecords':{k:{'record':v.group(0),'byteOffset':len(text[:v.start()].encode('utf8'))}for k,v in matches.items()}}

def checkpoint_report(observed):
 order=['launch','engine-loader','content/map','game-Lua/stock-reader','fixture-ready','local-service-bind','native-channel','catalogue/basis','stock-selection','authenticated-ready'];known=[x for x in order if x in observed]
 return {'order':order,'observed':known,'lastPositive':known[-1]if known else None,'firstUnmet':next((x for x in order if x not in observed),None),'silenceMeans':'Unknown, not guessed map failure','nativeUsefulPlay':'0/6','ArmAuthority':False}

def record_tail(path,label):
 path=pathlib.Path(path)
 if not path.is_file()or path.is_symlink():return {'label':label,'status':'Unknown','reason':'absent'}
 s=path.stat();need(stat.S_ISREG(s.st_mode)and s.st_uid==os.geteuid()and s.st_nlink==1,'failure log custody');need(s.st_size<=33554432,'individual runtime log bound')
 with path.open('rb')as f:f.seek(max(0,s.st_size-65536));raw=f.read(65536)
 target=pathlib.Path(ROOT)/'evidence'/(label+'.tail.raw');target.write_bytes(raw);target.chmod(0o600)
 return {'label':label,'status':'Observed','sourceBytes':s.st_size,'offset':max(0,s.st_size-len(raw)),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}

def launch(role,p,a_path,owner,deadline,registered,invocation=None,evaluation=None,cleanup_reserve=8,policy_context=None):
 need(role in ['host','engine','policy'],'literal launch role')
 if role=='policy':
  from seed_policy import SeedPolicyContext,launch_policy
  need(type(policy_context)is SeedPolicyContext and policy_context.owner is owner and policy_context.children is registered and policy_context.profile is p and str(policy_context.admission)==str(a_path),'exact native policy caller')
  return launch_policy(policy_context,invocation,deadline)
 need(role in ['host','engine']and invocation is None and evaluation is None,'literal native actor launch')
 name=role
 end=min(deadline-cleanup_reserve,clock()+5);rd,rw=os.pipe();ar,aw=os.pipe();child=None
 try:
  runtime_socket().directory_check()
  shim_argv=[PYTHON,'-I','-B',str(HERE/'startup_runner.py'),'--shim',role,'--admission',str(a_path),'--ready',str(rw),'--ack',str(ar)]
  child=subprocess.Popen(shim_argv,env=environment(p,role),pass_fds=(rw,ar),start_new_session=True,stdin=None,stdout=subprocess.PIPE,stderr=subprocess.PIPE,umask=0o077)
  registered[name]=child;owner.leaders.add(child.pid);os.close(rw);rw=-1;os.close(ar);ar=-1
  with selectors.DefaultSelector()as sel:
   sel.register(rd,selectors.EVENT_READ)
   while True:
    if sel.select(m.remaining(end,5)):break
   need(os.read(rd,64)==b'BAR-STARTUP-READY\n','actor preexec handshake')
  ident=m.identity(child.pid);need(ident['pgid']==ident['session']==child.pid and ident['ppid']==os.getpid(),'actual owned actor identity');owner.acquire(ident);need(os.sched_getaffinity(child.pid)=={m.load(a_path)['cpu']},'actor serial affinity')
  m.write_new(pathlib.Path(ROOT)/'evidence'/(name+'.process.json'),dict(identity=ident,argv=commands(p)[role],environment=environment(p,role)));os.write(aw,b'GO\n');return child
 finally:
  for fd in [rd,rw,ar,aw]:
   if fd>=0:
    try:os.close(fd)
    except OSError:pass

def diagnostic_checkpoints(A,observed):
 reports=[]
 for label,path in [('infolog',A/'engine/infolog.txt'),('stderr',A/'logs/engine.stderr.raw')]:
  if not path.is_file():continue
  need(path.stat().st_size<=33554432,'checkpoint log bound');raw=path.read_bytes();text=raw.decode('utf8')
  patterns={'game-Lua/stock-reader':r'^.*Loaded synced gadget:  BARC Stock Queue Reader  <barc_stock_queue_reader\.lua>.*$', 'fixture-ready':r'^.*highbar_barc_stock_fixture kind=ready frame=([0-9]+) team=0 enemy_team=1 .*$', 'local-service-fault':r'^.*(?:Failed to add port to server:.*unix:|\[hb-gateway\] fault subsystem=callback reason=rpc_internal detail="frame_tick_threw").*$'}
  for key,pattern in patterns.items():
   found=re.search(pattern,text,re.MULTILINE)
   if found:
    record=dict(status='Observed',log=label,logSHA256=hashlib.sha256(raw).hexdigest(),byteOffset=len(text[:found.start()].encode('utf8')),matchedRecord=found.group(0),frame=(re.search(r'(?:frame[=: ]+)([0-9]+)',found.group(0),re.I).group(1)if re.search(r'(?:frame[=: ]+)([0-9]+)',found.group(0),re.I)else None))
    observed.setdefault(key,record);reports.append(record)
 content=content_checkpoint(A/'engine/infolog.txt')
 if content['status']=='Observed':observed.setdefault('content/map',content)
 return reports

def seed_predicates(A,ready):
 from qualify_prearm import records
 import native_evidence
 raw_path=A/'host/raw.jsonl';stock_path=A/'engine/stock.jsonl';log_path=A/'engine/infolog.txt'
 if not all(x.is_file() for x in [raw_path,stock_path,log_path]):return False
 for path,cap in [(raw_path,4194304),(stock_path,16777216),(log_path,10485760)]:need(path.stat().st_size<=cap,'seed predicate input cap')
 raw=records(raw_path.read_bytes(),'raw');stock=records(stock_path.read_bytes(),'stock')
 completed=[r for r in raw if r['kind']=='unit-finished'];snapshots=[r for r in raw if r['kind']=='snapshot']
 if len(completed)<3 or not snapshots:return False
 later=snapshots[-1]
 if int(later['sequence'])<=max(int(r['sequence']) for r in completed):return False
 observed=native_evidence.observations(log_path.read_bytes(),ready['runId'])
 return any(r['kind']=='complete'for r in observed) and any(r.get('queue') is not None and r.get('reader',{}).get('status')=='complete' and r.get('context',{}).get('domain')=='production' and not r['queue']['entries'] and int(r['nativeBasis']['stateSequence'])>=int(later['stateSequence'])for r in stock)

def supervise(p,a_path,deadline):
 owner=m.LinuxOwner();children={};streams={};counts={};observed={};failure=None;secondary=[];result={'readyProducerAuthenticated':False,'startupAccepted':False,'seedQualificationAccepted':False,'canonicalPolicyConsumed':False};first_join=None;A=pathlib.Path(ROOT);captured=set();socket=runtime_socket();next_scan=0
 def capture_maps(role,phase,required=False):
  key=(role,phase)
  if key in captured:return None
  captured.add(key)
  try:
   receipt=maps(role,children[role],p,phase,required)
   if role=='engine'and receipt['status']=='Observed':observed.setdefault('engine-loader',{'basis':'actual full engine/plugin/NullAI/interface executable mappings','phase':phase,'rawSHA256':receipt['rawSHA256']})
   return receipt
  except BaseException as e:
   secondary.append(dict(kind='maps',role=role,phase=phase,error=str(e)))
   if required:raise
   return {'status':'Unknown','error':str(e)}
 def drain(sel,seconds):
  end=min(deadline-8,clock()+seconds)
  while sel.get_map()and clock()<end:
   any_raw=False
   for key,_ in sel.select(0):
    raw=os.read(key.fileobj.fileno(),65536)
    if not raw:sel.unregister(key.fileobj);continue
    any_raw=True;counts[key.data]+=len(raw);need(counts[key.data]<=33554432,'individual actor stream bound');streams[key.data].write(raw);streams[key.data].flush()
   if not any_raw:break
 try:
  for role in ['host','engine']:children[role]=launch(role,p,a_path,owner,deadline,children)
  observed['launch']={'processes':[m.identity(x.pid)for x in children.values()]};end=min(deadline-8,clock()+60)
  with selectors.DefaultSelector()as sel:
   for role,child in children.items():
    for kind in ['stdout','stderr']:
     key=role+'.'+kind;streams[key]=(A/'logs'/(key+'.raw')).open('xb');counts[key]=0;sel.register(getattr(child,kind),selectors.EVENT_READ,key)
   try:
    while True:
     m.remaining(end,1);owner.observe();quota(owner)
     for key,_ in sel.select(.02):
      raw=os.read(key.fileobj.fileno(),65536)
      if not raw:sel.unregister(key.fileobj);continue
      counts[key.data]+=len(raw);need(counts[key.data]<=33554432,'individual actor stream bound');streams[key.data].write(raw);streams[key.data].flush()
     for log in [A/'engine/infolog.txt',A/'host/host.jsonl',A/'engine/stock.jsonl']:
      if log.exists():need(log.stat().st_size<=33554432,'individual runtime log bound')
     if clock()>=next_scan:
      diagnostic_checkpoints(A,observed);next_scan=clock()+.2
      if 'game-Lua/stock-reader'in observed or 'fixture-ready'in observed or 'local-service-fault'in observed:
       for role in ['host','engine']:capture_maps(role,'early')
     if (A/'host/ready.json').is_file():
      first_join='ready-producer-authentication'
      ready,ready_snapshot=authenticate_ready(A/'host/ready.json',children['host'],ready_config(p),return_snapshot=True);metadata,metadata_snapshot=authenticate_metadata(ready['metadataPath'],ready,return_snapshot=True);setup,setup_snapshot=authenticate_setup(ready['setupPath'],ready,return_snapshot=True);need(ready['grpcAddress']==f"127.0.0.1:{p['proposedPorts']['grpc']}"and ready['allowedOrigin']==f"http://127.0.0.1:{p['proposedPorts']['unusedReceiverOrigin']}",'actual ready ports')
      result.update(readyProducerAuthenticated=True,readySnapshotsPublicationAcknowledged=False)
      first_join='authenticated-snapshot-publication'
      authenticated=persist_authenticated_snapshots(A/'evidence',{'ready':(ready,ready_snapshot),'metadata':(metadata,metadata_snapshot),'setup':(setup,setup_snapshot)});result.update(readyProducerAuthenticated=True,readySnapshotsPublicationAcknowledged=True,authenticatedSnapshots=authenticated);observed['authenticated-ready']={'basis':'authenticated producer exact retained snapshots','readySHA256':ready_snapshot['sha256']}
      first_join='owned-socket'
      owned_socket=socket.observe(True);need(owned_socket['ownership']=='Observed','actual owned stock UDS');m.write_new(A/'evidence/runtime-socket-owner.json',socket.owner);observed['local-service-bind']={'basis':'actual owned UDS kernel/fd receipt plus authenticated stock readiness','socket':socket.owner}
      joined=[]
      for role in ['engine','host']:
       first_join=role+'-maps'
       receipt=capture_maps(role,'terminal',True);need(receipt and receipt['status']=='Observed','complete actual loaded role joins at ready');joined.append(receipt)
      for label in ['engine-loader','Lua/AI-init','native-channel','catalogue/basis','stock-selection','authenticated-ready']:observed[label]={'basis':'authenticated producer + full actual role maps + owned UDS','readySHA256':ready_snapshot['sha256']}
      first_join='stock-reader-and-fixture'
      diagnostic_checkpoints(A,observed);need('game-Lua/stock-reader'in observed and 'fixture-ready'in observed,'actual emitted stock reader and fixture readiness checkpoints');content=content_checkpoint(A/'engine/infolog.txt')
      first_join='selected-content'
      result.update(authenticatedReady=True,mapLoadCheckpoint=content,hostSourceUnchanged=p['source'],maps=joined,ownedSocket=socket.owner);need(content['status']=='Observed','authenticated ready but loaded selected map/game log join Unknown')
      first_join='finite-seed-observation'
      # Ready is a prerequisite, never the success predicate. Continue draining
      # the actual actor selector until real retained lifecycle predicates exist.
      from seed_policy import SeedGrowingLog,SeedPolicyContext
      from stock_bootstrap import collect_prearm
      import native_evidence,qualify_prearm
      policy_context=SeedPolicyContext(p,a_path,owner,children,sel,streams,counts,deadline)
      while not seed_predicates(A,ready):
       m.remaining(deadline,1,8);policy_context.pump(deadline-8);time.sleep(min(.02,m.remaining(deadline,.02,8)))
      first_join='canonical-infolog-and-native-seed-qualification'
      policy=SeedGrowingLog.acquire(str(A/'engine/infolog.txt'),{'pid':children['engine'].pid,'startTicks':start_ticks(children['engine'].pid),'uid':os.geteuid()}).bind(policy_context)
      try:seed=collect_prearm(p,ready,metadata,setup,children['host'],children['engine'],policy,deadline-8,int((deadline-180)*1e9))
      finally:policy.close()
      need(seed['seedQualificationAccepted'] and seed['canonicalPolicyConsumed'] and seed['publication']['fullWriteFsyncAcknowledged'],'real seed/policy/publication joins')
      result.update(seedQualificationAccepted=True,canonicalPolicyConsumed=True,qualificationPublicationAcknowledged=True,seedQualification=seed)
      break
     for role,child in children.items():need(child.poll()is None,role+' exited before authenticated readiness')
   finally:
    try:drain(sel,.1)
    except BaseException as e:secondary.append(dict(kind='pipe-drain',error=str(e)))
 except BaseException as e:
  failure=e;result['firstFailedJoin']=str(e) if str(e).startswith('host-dynamic-') else first_join
 finally:
  snapshots={}
  for role,child in children.items():
   try:snapshots[role]={'identity':m.identity(child.pid),'state':'Observed'}
   except BaseException as e:snapshots[role]={'state':'Unknown','reason':type(e).__name__}
   if role in ['host','engine']:capture_maps(role,'terminal')
  try:diagnostic_checkpoints(A,observed)
  except BaseException as e:secondary.append(dict(kind='checkpoint',error=str(e)))
  try:
   if socket.path.exists():socket.observe(True)
  except BaseException as e:secondary.append(dict(kind='socket-owner',error=str(e)))
  try:
   tails=[record_tail(A/'engine/infolog.txt','engine-infolog')]
   for key in streams:tails.append(record_tail(A/'logs'/(key+'.raw'),key))
   m.write_new(A/'evidence/precleanup-observation.json',{'processes':snapshots,'tails':tails,'checkpoint':checkpoint_report(observed),'firstFailure':str(failure)if failure else None,'secondaryFailures':secondary})
  except BaseException as e:secondary.append(dict(kind='precleanup-capture',error=str(e)))
  try:result['cleanup']=m.settle(owner,deadline);need(result['cleanup']['status']=='settled','discovery/cleanup Unknown')
  except BaseException as e:secondary.append(dict(kind='cleanup',error=str(e)));result.setdefault('cleanup',{'status':'Unknown','reason':str(e)})
  for role,child in children.items():
   try:child.wait(timeout=max(.01,min(1,deadline-clock())))
   except BaseException as e:secondary.append(dict(kind='actor-reap',error=str(e)))
   owner.leaders.discard(child.pid)
   for stream in [child.stdin,child.stdout,child.stderr]:
    if stream is not None and not stream.closed:stream.close()
  try:result['socketLifecycle']=socket.cleanup(result.get('cleanup',{}).get('status')=='settled')
  except BaseException as e:secondary.append(dict(kind='socket-cleanup',error=str(e)));result['socketLifecycle']={'status':'Unknown','error':str(e)}
  for stream in streams.values():stream.close()
  result['precleanupSeedQualificationAccepted']=result.get('seedQualificationAccepted',False)
  result['seedQualificationAccepted']=bool(result.get('seedQualificationAccepted') and failure is None and not secondary and result.get('cleanup',{}).get('status')=='settled')
  result.update(actorEligible=False,nativeUsefulPlay='0/6',dynamicContentProvenance='Unknown',creatorAttribution='Inference',exhaustiveMemoryOrIOProof=False,seedProofScope='Bounded through last captured complete snapshot; post-snapshot disconnect coverage unavailable',failure=str(failure)if failure else None,firstObservedNativeFault=observed.get('local-service-fault'),secondaryFailures=secondary,checkpoint=checkpoint_report(observed),checkpointRecords=observed,ownedIdentities=list(owner.records.values()),browserLoaded=False,Arm=False,commandsSubmitted=0);owner.close();m.write_new(A/'evidence/diagnostic-result.json',result);socket.close()
 return 3 if failure or secondary else 0

def source_binding(a,p):
 need(a['sourceSHA256']==reviewed_source()and a['profileSHA256']==m.digest(HERE/'startup-profile.json'),'shim/worker exact source')

def shim(args):
 p=profile();a=m.load(args.admission);source_binding(a,p)
 if args.shim=='policy':
  from seed_policy import policy_shim
  return policy_shim(args,sys.modules[__name__],p,a)
 need(args.shim in ['host','engine','policy'],'literal roles');need((args.shim=='policy' and re.fullmatch('[0-9a-f]{64}',args.invocation or ''))or(args.shim!='policy' and args.invocation is None),'shim literal invocation');need(os.sched_getaffinity(0)=={a['cpu']},'shim affinity')
 parent=m.load(pathlib.Path(ROOT)/'evidence/worker-start.json');need(m.same(parent['worker'],m.identity(os.getppid()))and parent['admissionSHA256']==m.digest(args.admission),'owned source-bound parent')
 os.write(args.ready,b'BAR-STARTUP-READY\n');os.close(args.ready);need(os.read(args.ack,16)==b'GO\n','actual preexec observer release');os.close(args.ack);runtime_socket().directory_check();os.chdir(ROOT);c=commands(p,args.invocation)[args.shim];os.execve(c[0],c,environment(p,args.shim))

def worker(args):
 p=profile();a=m.load(args.admission);source_binding(a,p);os.sched_setaffinity(0,{a['cpu']});start=m.load(pathlib.Path(ROOT)/'evidence/outer-start.json');need(m.same(start['outer'],m.identity(os.getppid()))and start['admissionSHA256']==m.digest(args.admission),'independent actual outer')
 os.write(args.ready,b'BAR-STARTUP-WORKER\n');os.close(args.ready);need(os.read(args.ack,16)==b'GO\n','independent release');os.close(args.ack);m.write_new(pathlib.Path(ROOT)/'evidence/worker-start.json',dict(worker=m.identity(os.getpid()),admissionSHA256=m.digest(args.admission)))
 return supervise(p,pathlib.Path(args.admission),start['deadline'])

def finish_outer(A,result,buffers,started,failure):
 """Retain an exclusive failure receipt even if final census/quota refuses."""
 from snapshot_publication import bytes_new,json_new
 def failed(check,error):
  nonlocal failure
  value={'check':check,'errorType':type(error).__name__,'error':str(error),'custodyObservation':getattr(error,'observation',None)}
  if failure is None:failure=error;result['firstFailure']=value
  else:result.setdefault('secondaryFailures',[]).append(value)
 for name,raw in buffers.items():
  try:bytes_new(A/'logs'/('outer-'+name+'.raw'),bytes(raw),524288)
  except BaseException as e:failed('outer-output-publication',e)
 try:json_new(A/'evidence/full-output-census.json',{'files':m.census(A,runtime_socket=runtime_socket()),'scope':'stage leaves before census and outer-result; independent root final census required'})
 except BaseException as e:result['finalCensus']={'status':'Unknown','reason':str(e)};failed('final-census',e)
 try:result['finalQuota']=quota()
 except BaseException as e:result['finalQuota']={'status':'Unknown','reason':str(e)};failed('final-quota',e)
 try:runtime_socket().close()
 except BaseException as e:failed('runtime-socket-close',e)
 result.update(failure=str(failure)if failure else None,elapsedSeconds=clock()-started,operationCount=1,noRetry=True,actorEligible=False,dynamicContentProvenance='Unknown',creatorAttribution='Inference',exhaustiveMemoryOrIOProof=False,seedProofScope='Bounded through last captured complete snapshot; post-snapshot disconnect coverage unavailable',rootVerdict='Pending independent root full actual receipt review',nativeUsefulPlay='0/6',noBrowserGuestArmOrCommands=True)
 settled=bool(result.get('independentCustody',{}).get('leaderReaped') and not result.get('independentCustody',{}).get('remaining') and not result.get('independentCustody',{}).get('errors') and result.get('innerCleanup',{}).get('status')=='settled')
 result['cleanupStatus']='settled' if settled else 'Unknown'
 result['seedQualificationAccepted']=bool(failure is None and result.get('innerSeedAccepted') and settled and not result.get('secondaryFailures'))
 result['startupAccepted']=bool(result['seedQualificationAccepted'] and failure is None and settled and result.get('innerJoinsAccepted') and not result.get('secondaryFailures'))
 # Reserve exactly this final receipt's bytes/leaf against the unchanged quota.
 encoded=(json.dumps(result,sort_keys=True,separators=(',',':'),allow_nan=False)+'\n').encode();q=result.get('finalQuota',{})
 if 'files' in q and (q['files']+1>1024 or q['bytes']+len(encoded)>134217728):
  failed('outer-receipt-reserve',m.Refused('stage output census bound'));result.update(startupAccepted=False,seedQualificationAccepted=False,failure=str(failure))
 # Failure recording deliberately follows the failing checks, without replacing them.
 json_new(A/'evidence/outer-result.json',result,1048576)
 return failure

def execute(a_path):
 started=clock();deadline=started+180;p=profile();source=reviewed_source();a=m.load(a_path);admission(a,p,source,m.identity(os.getppid()),datetime.datetime.now(datetime.timezone.utc),not os.path.lexists(ROOT),os.sched_getaffinity(0));os.sched_setaffinity(0,{a['cpu']});pre=originals(p,deadline-8)
 A=pathlib.Path(ROOT);A.mkdir(mode=0o700)
 for n in ['host','engine','logs','evidence']:(A/n).mkdir(mode=0o700)
 for role in ['host','engine']:(A/role/'tmp').mkdir(mode=0o700)
 validate_startscript(pathlib.Path(p['startscript']).read_bytes());run=A/'engine/run';run.mkdir(mode=0o700);need(not os.path.lexists(p['runtimeObjects']['socket']),'new socket must be absent');ds=run.lstat();m.write_new(A/'evidence/runtime-directory.json',dict(path=str(run),device=ds.st_dev,inode=ds.st_ino,uid=ds.st_uid,mode=stat.S_IMODE(ds.st_mode)));runtime_socket().directory_check()
 from settings_custody import prepare_engine_settings
 seed_argv,settings_receipt=prepare_engine_settings(p['seed']['configuration'],A);need(seed_argv==commands(p)['engine'],'actual isolated settings argv')
 m.write_new(A/'evidence/outer-start.json',dict(outer=m.identity(os.getpid()),admissionSHA256=m.digest(a_path),deadline=deadline,preOriginals=pre));need(ctypes.CDLL(None,use_errno=True).prctl(36,1,0,0,0)==0,'outer subreaper')
 rd,rw=os.pipe();ar,aw=os.pipe();proc=None;owned=None;failure=None;result={'startupAccepted':False,'firstFailure':None,'secondaryFailures':[]};buffers={'stdout':bytearray(),'stderr':bytearray()}
 def fail(check,error):
  nonlocal failure
  observation={'check':check,'errorType':type(error).__name__,'error':str(error),'custodyObservation':getattr(error,'observation',None)}
  if failure is None:failure=error;result['firstFailure']=observation
  else:result['secondaryFailures'].append(observation)
 try:
  env={'PATH':'/usr/bin:/bin','HOME':str(A/'host'),'PYTHONDONTWRITEBYTECODE':'1'}
  proc=subprocess.Popen([PYTHON,'-I','-B',str(HERE/'startup_runner.py'),'--worker','--admission',str(a_path),'--ready',str(rw),'--ack',str(ar)],env=env,pass_fds=(rw,ar),start_new_session=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,umask=0o077);os.close(rw);rw=-1;os.close(ar);ar=-1;owned=outer.OwnedChild(proc,adopted=True)
  with selectors.DefaultSelector()as sel:sel.register(rd,selectors.EVENT_READ);need(sel.select(m.remaining(deadline,5,8))and os.read(rd,64)==b'BAR-STARTUP-WORKER\n','independent actual worker handshake')
  need(os.sched_getaffinity(proc.pid)=={a['cpu']},'independent actual affinity');m.write_new(A/'evidence/worker-independent-identity.json',dict(leader=owned.leader,cpu=a['cpu']));os.write(aw,b'GO\n');os.close(aw);aw=-1
  with selectors.DefaultSelector()as sel:
   for name in buffers:sel.register(getattr(proc,name),selectors.EVENT_READ,name)
   while sel.get_map()or owned.exited()is None:
    m.remaining(deadline,1,8);owned.observe();quota()
    for key,_ in sel.select(.02):
     raw=os.read(key.fileobj.fileno(),65536)
     if not raw:sel.unregister(key.fileobj);continue
     buffers[key.data].extend(raw);need(len(buffers[key.data])<=524288,'outer output bound')
  status=owned.exited();result['workerExitCode']=status.si_status if status.si_code==os.CLD_EXITED else-status.si_status
 except BaseException as e:fail('outer-supervision',e)
 finally:
  for fd in [rd,rw,ar,aw]:
   if fd>=0:
    try:os.close(fd)
    except OSError:pass
  if owned:
   try:
    if runtime_socket().path.exists():runtime_socket().observe(True)
   except BaseException as e:fail('outer-socket-owner',e)
   try:result['independentCustody']=owned.settle(deadline);need(result['independentCustody']['leaderReaped']and not result['independentCustody']['remaining']and not result['independentCustody']['errors'],'independent settled cleanup')
   except BaseException as e:result.setdefault('independentCustody',{'status':'Unknown','reason':str(e)});fail('independent-cleanup',e)
  else:fail('independent-cleanup',m.CleanupUnknown('independent observer absent'));result['independentCustody']={'status':'Unknown','reason':'independent observer absent'}
  try:result['socketLifecycle']=runtime_socket().cleanup(bool(result.get('independentCustody',{}).get('leaderReaped')and not result.get('independentCustody',{}).get('remaining')and not result.get('independentCustody',{}).get('errors')))
  except BaseException as e:result['socketLifecycle']={'status':'Unknown','reason':str(e)};fail('outer-socket-cleanup',e)
  try:result['postOriginals']=originals(p,deadline)
  except BaseException as e:fail('post-originals',e)
  try:
   inner=m.load(A/'evidence/diagnostic-result.json');result['readyProducerAuthenticated']=inner.get('readyProducerAuthenticated',False);result['firstFailedJoin']=inner.get('firstFailedJoin');result['innerCleanup']=inner.get('cleanup',{'status':'Unknown'});result['innerSecondaryFailures']=inner.get('secondaryFailures',[])
   result['innerSeedAccepted']=bool(inner.get('seedQualificationAccepted') and inner.get('canonicalPolicyConsumed') and inner.get('qualificationPublicationAcknowledged'))
   result['innerJoinsAccepted']=bool(result['innerSeedAccepted'] and result.get('workerExitCode')==0 and inner.get('authenticatedReady') and inner.get('readySnapshotsPublicationAcknowledged') and inner.get('cleanup',{}).get('status')=='settled' and not inner.get('secondaryFailures'))
   if inner.get('failure'):fail(inner.get('firstFailedJoin')or 'inner-operation',m.Refused(inner['failure']))
   elif result.get('workerExitCode')!=0:fail('inner-operation',m.Refused('worker failed; retained secondary failures' if inner.get('secondaryFailures') else 'worker failed'))
  except BaseException as e:result.update(innerCleanup={'status':'Unknown','reason':'inner result unavailable'},innerJoinsAccepted=False,readyProducerAuthenticated=False,readyProducerAuthentication='Unknown');fail('inner-result',e)
  failure=finish_outer(A,result,buffers,started,failure)

 return 0 if failure is None and result.get('workerExitCode')==0 else 3

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--admission',required=True);parser.add_argument('--worker',action='store_true');parser.add_argument('--shim',choices=['host','engine','policy']);parser.add_argument('--ready',type=int);parser.add_argument('--ack',type=int);parser.add_argument('--invocation');a=parser.parse_args()
 if a.shim:return shim(a)
 if a.worker:return worker(a)
 return execute(pathlib.Path(a.admission))
if __name__=='__main__':
 sys.modules['startup_runner']=sys.modules[__name__]
 raise SystemExit(main())
