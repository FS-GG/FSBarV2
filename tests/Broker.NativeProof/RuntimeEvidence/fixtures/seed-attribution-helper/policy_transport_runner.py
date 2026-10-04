"""Finite NO-GAME qualification of the same owned apphost transport as startup.
Inert until fresh exact source/profile/closure/control-input root admission.
The Python worker is explicitly the controlled file writer, never a game actor.
"""
import sys
sys.dont_write_bytecode=True
import os,json,pathlib,time,datetime,argparse,subprocess,selectors,ctypes,hashlib,stat
HERE=pathlib.Path(__file__).resolve().parent;sys.path[:0]=[str(HERE),str(HERE/'helper')]
import mechanics as m,outer_custody as outer
from seed_policy import SeedGrowingLog,PolicyOnlyContext,policy_shim
from runtime_identity import start_ticks
from snapshot_publication import bytes_new,json_new
ROOT='/tmp/bar-policy-transport-qualification-20261004';PYTHON='/usr/bin/python3.14'
CASES=['stable-consume','malformed-request','withheld-input']
LIMITS=dict(wholeSeconds=180,cleanupReserve=8,termSeconds=3,killSeconds=3,attemptBytes=134217728,attemptFiles=1024,mapsBytes=4194304,ownedIdentities=128,maximumEvaluations=3,boundarySeconds=5,outputBytes=131072)
need=m.need

def reviewed_source():
 s=m.load(HERE/'review-packet.json');need(s['schema']=='bar.seed-attribution-source-review/v2','complete source schema')
 need(len(s['files'])==len({x['path']for x in s['files']}),'unique source roster')
 need(set(x['path']for x in s['files'])=={str(f.relative_to(HERE))for f in HERE.rglob('*')if f.is_file()and f.name!='review-packet.json'},'complete sealed source')
 for x in s['files']:
  need(set(x)=={'path','bytes','sha256','mode'}and not pathlib.PurePosixPath(x['path']).is_absolute()and '..'not in pathlib.PurePosixPath(x['path']).parts,'safe source pin')
  f=HERE/x['path'];need(not f.is_symlink()and f.stat().st_size==x['bytes']and stat.S_IMODE(f.stat().st_mode)==x['mode']and m.digest(f)==x['sha256'],'exact sealed source pin')
 return m.digest(HERE/'review-packet.json')

def profile():
 p=m.load(HERE/'policy-transport-profile.json')
 need(set(p)=={'schema','preparationReady','operation','attemptRoot','limits','cases','policy','controlInput','physicalPins','sourceHelperPins'},'closed policy-only profile fields')
 need(p['schema']=='bar.policy-transport-profile/v1'and p['preparationReady']is True and p['operation']=='policy-transport-qualification-only'and p['attemptRoot']==ROOT,'prepared policy-only profile')
 need(p['limits']==LIMITS and p['cases']==CASES,'literal policy-only caps/cases')
 need(set(p['policy'])=={'apphost','closurePath','closureSha256','environment'}and p['policy']['environment']=={'PATH':'/usr/bin:/bin'},'literal policy-only apphost/environment')
 need(set(p['controlInput'])=={'schema','label','logBase64','sha256','configuration'}and p['controlInput']['schema']=='bar.controlled-log-input/v1'and p['controlInput']['label']=='controlled worker FD; no engine identity','explicit controlled input')
 import base64
 raw=base64.b64decode(p['controlInput']['logBase64'],validate=True);need(len(raw)<=10485760 and hashlib.sha256(raw).hexdigest()==p['controlInput']['sha256'],'exact finite controlled log')
 config=p['controlInput']['configuration'];need(config['roots']=={'attemptRoot':ROOT}and config['commands']['engine']==['controlled-descriptive-fixture','--isolation','--isolation-dir',ROOT+'/fixture/data','--write-dir',ROOT+'/fixture/write','--config','not-executed','not-executed'],'descriptive fixture fields are never executable')
 need(config['artifacts']['runtimeEvidencePolicy']=={'path':p['policy']['apphost'],'sha256':next(x['sha256']for x in p['physicalPins']if x['path']==p['policy']['apphost'])}and config['artifacts']['runtimeEvidencePolicyClosure']=={'path':p['policy']['closurePath'],'sha256':p['policy']['closureSha256']},'control input exact actual apphost/closure')
 need(0<len(p['physicalPins'])<=1024 and sum(x['bytes']for x in p['physicalPins'])<=1073741824,'finite physical policy roster')
 need(set(p['sourceHelperPins'])=={'helper/seed_policy.py','helper/growing_log.py','mechanics.py','outer_custody.py','helper/runtime_identity.py','helper/private_io.py','helper/snapshot_publication.py','policy_transport_runner.py'},'closed no-game modules')
 for name,sha in p['sourceHelperPins'].items():need(m.digest(HERE/name)==sha,'exact policy-only helper source')
 return p

def source_binding(a,p):
 need(a['schema']=='bar.policy-transport-admission/v1'and a['operation']=='policy-transport-qualification-only','policy-only admission separation')
 need(a['sourceSHA256']==reviewed_source()and a['profileSHA256']==m.digest(HERE/'policy-transport-profile.json')and a['policy']==p['policy']and a['controlInputSHA256']==p['controlInput']['sha256']and a['cases']==CASES,'exact policy-only source/profile/input')

def admission(a,p,operator,now,root_absent,affinity):
 need(set(a)=={'schema','operation','sourceSHA256','profileSHA256','operator','cpu','expiresUTC','root','oneUse','policy','controlInputSHA256','cases','capacity'},'closed policy-only admission')
 source_binding(a,p)
 need(a['root']==ROOT and a['oneUse']is True and root_absent and m.same(a['operator'],operator),'fresh admitted operator/root')
 need(type(a['cpu'])is int and a['cpu']in affinity,'one admitted CPU')
 expiry=datetime.datetime.fromisoformat(a['expiresUTC']);need(expiry.tzinfo is not None and 0<(expiry-now).total_seconds()<=600,'finite fresh admission')
 c=a['capacity'];need(c['maximumTaskCLR']==2 and c['maximumInfrastructureCLR']==2 and c['cpu']==a['cpu']and c['reservationSource'],'actual reservation required');m.checked_pin(c['currentCensusPin'])
 return a

def originals(p,deadline):
 for pin in p['physicalPins']:m.remaining(deadline,1);m.checked_pin(pin)
 return {'pinsChecked':len(p['physicalPins'])}

def quota(owner=None):
 live=owner.observe()if owner else[]
 return m.quota(pathlib.Path(ROOT),134217728,phase='policy-only',known_owned=list(owner.records.values())if owner else[],live_owned=live)

def shim(args):
 p=profile();a=m.load(args.admission);source_binding(a,p)
 return policy_shim(args,sys.modules['policy_transport_runner'],p,a)

def run_cases(p,a_path,owner,deadline):
 import base64
 A=pathlib.Path(ROOT);f=A/'fixture';f.mkdir(mode=0o700)
 for name in ['data','write']:(f/name).mkdir(mode=0o700)
 # Keep exactly one genuine writable worker descriptor for inherited census.
 fd=os.open(f/'infolog.txt',os.O_WRONLY|os.O_APPEND|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 log=None;ctx=PolicyOnlyContext(p,a_path,owner,deadline);results=[]
 try:
  raw=base64.b64decode(p['controlInput']['logBase64'],validate=True)
  need(os.write(fd,raw)==len(raw),'complete controlled log write');os.fsync(fd)
  writer={'pid':os.getpid(),'startTicks':start_ticks(os.getpid()),'uid':os.geteuid()}
  json_new(A/'evidence/controlled-writer.json',{'label':'controlled input, not engine infolog','identity':writer,'openWritableDescriptor':fd,'logSha256':hashlib.sha256(raw).hexdigest()})
  log=SeedGrowingLog.acquire(str(f/'infolog.txt'),writer).bind(ctx)
  start=time.monotonic();positive=log.consume('browser',p['controlInput']['configuration'],min(deadline-8,start+5))
  need(ctx.evaluations==1 and ctx.active is None and len(ctx.reaped)==1 and ctx.reaped[0]['exitCode']==0,'positive must settle exactly one natural successful invocation')
  need(log.state['phase']=='consumed','inherited consumed state required')
  json_new(A/'evidence/positive-consume.json',{'controlledInput':True,'result':positive,'lastInvocation':log.last_invocation,'ownedSettlement':ctx.reaped[0],'canonicalCurrentProcessQualified':True,'actorEligible':False})
  results.append({'case':CASES[0],'qualified':True,'evaluations':1})
  for case,encoded in [('malformed-request',b'{malformed'),('withheld-input',b'{}')]:
   ctx.control=case;before=ctx.evaluations;error=None
   try:log._run_policy(p['policy']['apphost'],p['policy']['closurePath'],p['policy']['closureSha256'],encoded,min(deadline-8,time.monotonic()+5))
   except BaseException as caught:error=caught
   need(error is not None and ctx.evaluations==before+1 and ctx.active is None and len(ctx.reaped)==ctx.evaluations,'negative requires actual one invocation and held settlement')
   retained=m.load(A/'evidence'/('policy-'+str(ctx.evaluations)+'.failure.json'))
   need(retained['ready']is not None,'negative control ready-before-failure coverage required')
   if case=='withheld-input':need(retained['requestWrittenBytes']==0 and ctx.reaped[-1]['forced']and 'deadline'in str(error),'withheld-input deadline must force held settlement')
   else:need(retained['requestWrittenBytes']==len(encoded)and ctx.reaped[-1]['exitCode']==2 and not ctx.reaped[-1]['forced'],'malformed request must naturally refuse after full request')
   need(not getattr(error,'_barc_secondary_settlement_failure',None)and not getattr(error,'_barc_secondary_publication_failure',None),'negative cleanup/publication complete')
   json_new(A/'evidence'/('control-'+case+'.json'),{'case':case,'expectedFailure':str(error),'firstFailure':retained,'observedSettlement':ctx.reaped[-1],'failureIsNotNaturalSuccess':True,'actorEligible':False})
   results.append({'case':case,'qualified':True,'expectedNegative':True})
  need(ctx.evaluations==3 and ctx.active is None,'exact three sequential evaluations')
  return {'cases':results,'evaluations':ctx.evaluations,'transportQualified':True,'controlledInput':True,'nativeSeedQualified':False,'actorEligible':False,'nativeUsefulPlay':'0/6'}
 finally:
  if log is not None:log.close()
  os.close(fd)

def worker(args):
 p=profile();a=m.load(args.admission);source_binding(a,p);os.sched_setaffinity(0,{a['cpu']});A=pathlib.Path(ROOT);start=m.load(A/'evidence/outer-start.json')
 need(m.same(start['outer'],m.identity(os.getppid()))and start['admissionSHA256']==m.digest(args.admission),'independent outer identity')
 os.write(args.ready,b'BAR-POLICY-WORKER\n');os.close(args.ready);need(os.read(args.ack,16)==b'GO\n','independent worker release');os.close(args.ack)
 json_new(A/'evidence/worker-start.json',dict(worker=m.identity(os.getpid()),admissionSHA256=m.digest(args.admission)))
 owner=m.LinuxOwner();result={'transportQualified':False,'failure':None,'secondaryFailures':[]}
 try:result.update(run_cases(p,pathlib.Path(args.admission),owner,start['deadline']))
 except BaseException as error:result['failure']=str(error)
 finally:
  try:result['innerCleanup']=m.settle(owner,start['deadline']);need(result['innerCleanup']['status']=='settled','inner settlement Unknown')
  except BaseException as error:result['secondaryFailures'].append(str(error))
  result['transportQualified']=bool(result.get('transportQualified')and not result['failure']and not result['secondaryFailures']);owner.close();json_new(A/'evidence/transport-result.json',result)
 return 0 if result['transportQualified']else 3

def execute(a_path):
 info=a_path.lstat();need(stat.S_ISREG(info.st_mode)and stat.S_IMODE(info.st_mode)==0o600 and info.st_uid==os.geteuid()and info.st_nlink==1,'private single-link actual admission')
 consumed=a_path.parent/(a_path.name+'.consumed');need(not os.path.lexists(consumed),'one-use grant already consumed')
 started=time.monotonic();deadline=started+180;p=profile();a=m.load(a_path)
 admission(a,p,m.identity(os.getppid()),datetime.datetime.now(datetime.timezone.utc),not os.path.lexists(ROOT),os.sched_getaffinity(0));os.sched_setaffinity(0,{a['cpu']});pre=originals(p,deadline-8)
 json_new(consumed,{'sourceSHA256':a['sourceSHA256'],'profileSHA256':a['profileSHA256'],'operationRoot':ROOT,'operator':a['operator'],'noRetry':True})
 A=pathlib.Path(ROOT);A.mkdir(mode=0o700)
 for name in ['logs','evidence']:(A/name).mkdir(mode=0o700)
 json_new(A/'evidence/outer-start.json',dict(outer=m.identity(os.getpid()),admissionSHA256=m.digest(a_path),deadline=deadline,preOriginals=pre))
 need(ctypes.CDLL(None,use_errno=True).prctl(36,1,0,0,0)==0,'outer subreaper')
 rd,rw=os.pipe();ar,aw=os.pipe();proc=None;owned=None;failure=None;result={'transportQualified':False,'secondaryFailures':[]};buffers={'stdout':bytearray(),'stderr':bytearray()}
 def fail(check,error):
  nonlocal failure
  observation={'check':check,'errorType':type(error).__name__,'error':str(error)}
  if failure is None:failure=error;result['firstFailure']=observation
  else:result['secondaryFailures'].append(observation)
 try:
  proc=subprocess.Popen([PYTHON,'-I','-B',str(HERE/'policy_transport_runner.py'),'--worker','--admission',str(a_path),'--ready',str(rw),'--ack',str(ar)],env={'PATH':'/usr/bin:/bin','PYTHONDONTWRITEBYTECODE':'1'},pass_fds=(rw,ar),start_new_session=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE,umask=0o077)
  os.close(rw);rw=-1;os.close(ar);ar=-1;owned=outer.OwnedChild(proc,adopted=True)
  with selectors.DefaultSelector()as sel:
   sel.register(rd,selectors.EVENT_READ);need(sel.select(m.remaining(deadline,5,8))and os.read(rd,64)==b'BAR-POLICY-WORKER\n','real independent worker handshake')
  need(os.sched_getaffinity(proc.pid)=={a['cpu']},'independent worker affinity');json_new(A/'evidence/worker-independent-identity.json',{'leader':owned.leader,'cpu':a['cpu'],'heldPidfdBeforeGO':True});os.write(aw,b'GO\n');os.close(aw);aw=-1
  with selectors.DefaultSelector()as sel:
   for name in buffers:sel.register(getattr(proc,name),selectors.EVENT_READ,name)
   while sel.get_map()or owned.exited()is None:
    m.remaining(deadline,1,8);owned.observe();quota()
    for key,_ in sel.select(.02):
     raw=os.read(key.fileobj.fileno(),65536)
     if not raw:sel.unregister(key.fileobj);continue
     buffers[key.data].extend(raw);need(len(buffers[key.data])<=524288,'outer output cap')
  status=owned.exited();result['workerExitCode']=status.si_status if status.si_code==os.CLD_EXITED else-status.si_status
 except BaseException as error:fail('outer-supervision',error)
 finally:
  for fd in [rd,rw,ar,aw]:
   if fd>=0:
    try:os.close(fd)
    except OSError:pass
  if owned:
   try:result['independentCustody']=owned.settle(deadline);need(result['independentCustody']['leaderReaped']and not result['independentCustody']['remaining']and not result['independentCustody']['errors'],'independent complete settlement')
   except BaseException as error:fail('outer-cleanup',error)
  else:fail('outer-cleanup',m.CleanupUnknown('independent owner unavailable'))
  try:
   result['postOriginals']=originals(p,deadline);inner=m.load(A/'evidence/transport-result.json');result['inner']=inner
   need(inner['transportQualified']and inner['innerCleanup']['status']=='settled'and result.get('workerExitCode')==0,'inner transport and cleanup required')
  except BaseException as error:fail('inner/pins',error)
  for name,raw in buffers.items():
   try:bytes_new(A/'logs'/('outer-'+name+'.raw'),bytes(raw),524288)
   except BaseException as error:fail('raw-publication',error)
  try:json_new(A/'evidence/full-output-census.json',{'files':m.census(A),'scope':'before final outer receipt; root final census required'});result['finalQuota']=quota()
  except BaseException as error:fail('final-census',error)
  result.update(transportQualified=failure is None and not result['secondaryFailures'],failure=str(failure)if failure else None,elapsedSeconds=time.monotonic()-started,operationCount=1,noRetry=True,nativeSeedQualified=False,actorEligible=False,nativeUsefulPlay='0/6',noGameBrowserArmOrCommands=True,sourceLinkRemoteContent='Unknown',rootVerdict='Pending root full review')
  encoded=(json.dumps(result,sort_keys=True,separators=(',',':'))+'\n').encode();q=result.get('finalQuota',{})
  if 'files'not in q or q['files']+1>1024 or q['bytes']+len(encoded)>134217728:result.update(transportQualified=False,failure=result.get('failure')or'final receipt quota reserve')
  json_new(A/'evidence/outer-result.json',result,1048576)
 return 0 if result['transportQualified']else 3

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--admission',required=True);parser.add_argument('--worker',action='store_true');parser.add_argument('--shim',choices=['policy']);parser.add_argument('--ready',type=int);parser.add_argument('--ack',type=int);parser.add_argument('--invocation');args=parser.parse_args()
 need(not(args.worker and args.shim),'one closed entry')
 if args.shim:return shim(args)
 if args.worker:return worker(args)
 need(args.ready is None and args.ack is None and args.invocation is None,'no outer command/payload selection');return execute(pathlib.Path(args.admission))
if __name__=='__main__':
 sys.modules['policy_transport_runner']=sys.modules[__name__]
 raise SystemExit(main())
