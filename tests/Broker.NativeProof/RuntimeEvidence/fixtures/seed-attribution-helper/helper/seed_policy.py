"""Literal owned direct-apphost transport; inherited canonical infolog semantics.
Inert without the selected startup runner's concrete live custody context.
"""
import os,time,json,hashlib,selectors,signal,subprocess,pathlib,re
from growing_log import GrowingLog,_unique,_policy_observation,POLICY_TO_MECHANICAL,MAX_POLICY_INPUT
from private_io import need,Refused
from runtime_identity import mark_failure
def policy_argv(policy,invocation):
 need(re.fullmatch('[0-9a-f]{64}',invocation or ''),'exact policy invocation')
 need(policy['environment']=={'PATH':'/usr/bin:/bin'},'literal policy environment')
 return [policy['apphost'],'--closure-manifest',policy['closurePath'],'--closure-sha256',policy['closureSha256'],'--invocation-id',invocation]

def _entry(context):
 if type(context)is SeedPolicyContext:
  import startup_runner as entry
 elif type(context)is PolicyOnlyContext:
  import policy_transport_runner as entry
 else:raise Refused('closed concrete policy context')
 return entry

def _validate(context):
 import mechanics as m
 need(type(context.owner)is m.LinuxOwner,'concrete held Linux policy owner')
 entry=_entry(context);a=m.load(context.admission)
 entry.source_binding(a,context.profile)
 need(a['operation']==('seed-attribution-startup-only'if type(context)is SeedPolicyContext else 'policy-transport-qualification-only'),'matching admitted policy composition')
 need(context.profile==entry.profile(),'actual pinned concrete policy profile')
 need(context.evidence_root==pathlib.Path(entry.ROOT)/'evidence','literal bound evidence root')
 need(context.profile['policy']['environment']=={'PATH':'/usr/bin:/bin'},'literal bound policy environment')
 return entry,a

def launch_policy(context,invocation,deadline):
 import mechanics as m
 need(context.active is None and context.evaluations<3 and len(context.reaped)==context.evaluations,'one settled policy child before next evaluation')
 entry,a=_validate(context)
 command=policy_argv(context.profile['policy'],invocation)
 need(context.pump(deadline)==(1 if type(context)is SeedPolicyContext else 0),'exact prelaunch task CLR count')
 if type(context)is SeedPolicyContext:entry.runtime_socket().directory_check()
 context.evaluations+=1;name='policy-'+str(context.evaluations)
 end=min(deadline,context.deadline-8);rd,rw=os.pipe();ar,aw=os.pipe();child=None
 try:
  argv=[entry.PYTHON,'-I','-B',str(entry.HERE/entry.__file__.split('/')[-1]),'--shim','policy','--admission',str(context.admission),'--ready',str(rw),'--ack',str(ar),'--invocation',invocation]
  child=subprocess.Popen(argv,env=context.profile['policy']['environment'],pass_fds=(rw,ar),start_new_session=True,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,umask=0o077)
  context.active=child;context.children[name]=child;context.owner.leaders.add(child.pid)
  os.close(rw);rw=-1;os.close(ar);ar=-1
  with selectors.DefaultSelector()as sel:
   sel.register(rd,selectors.EVENT_READ)
   while True:
    context.pump(end)
    if sel.select(m.remaining(end,.02)):break
   need(os.read(rd,64)==b'BAR-POLICY-READY\n','policy preexec handshake')
  ident=m.identity(child.pid)
  need(ident['pgid']==ident['session']==child.pid and ident['ppid']==os.getpid()and ident['uid']==os.geteuid(),'actual owned policy identity')
  if child.pid not in context.owner.records:context.owner.acquire(ident)
  need(m.same(ident,context.owner.records[child.pid])and child.pid in context.owner.handles,'held policy pidfd before GO')
  need(os.sched_getaffinity(child.pid)=={a['cpu']},'policy serial affinity')
  m.write_new(context.evidence_root/(name+'.process.json'),dict(identity=ident,argv=command,environment=context.profile['policy']['environment'],heldPidfdBeforeGO=True,sourceSHA256=a['sourceSHA256'],profileSHA256=a['profileSHA256']))
  os.write(aw,b'GO\n');return child
 except BaseException:
  # Ownership is retained in the context even when the handshake failed.
  # Caller/outer cleanup records the first failure and held settlement.
  if child is not None and child.pid not in context.owner.records:
   context.owner.observe()
  raise
 finally:
  for fd in [rd,rw,ar,aw]:
   if fd>=0:
    try:os.close(fd)
    except OSError:pass

def policy_shim(args,entry,p,a):
 import mechanics as m
 import sys
 kind='startup_runner'if entry is sys.modules.get('startup_runner')else 'policy_transport_runner'if entry is sys.modules.get('policy_transport_runner')else None
 need(kind is not None,'literal policy shim caller')
 entry.source_binding(a,p)
 need(args.shim=='policy'and os.sched_getaffinity(0)=={a['cpu']},'literal policy shim and affinity')
 parent=m.load(pathlib.Path(entry.ROOT)/'evidence/worker-start.json')
 need(m.same(parent['worker'],m.identity(os.getppid()))and parent['admissionSHA256']==m.digest(args.admission),'source-bound actual policy parent')
 if kind=='startup_runner':entry.runtime_socket().directory_check()
 argv=policy_argv(p['policy'],args.invocation)
 os.write(args.ready,b'BAR-POLICY-READY\n');os.close(args.ready)
 need(os.read(args.ack,16)==b'GO\n','actual held policy release');os.close(args.ack)
 entry.source_binding(a,p)
 if kind=='startup_runner':entry.runtime_socket().directory_check()
 os.chdir(entry.ROOT);os.execve(argv[0],argv,p['policy']['environment'])

def settle_policy(context,child,deadline,force=False):
 import mechanics as m
 need(child is context.active,'exact policy child settlement')
 if child.pid not in context.owner.records:context.owner.observe()
 ident=context.owner.records[child.pid]
 if force and child.poll()is None:context.owner.send(ident,signal.SIGKILL)
 end=min(context.deadline,time.monotonic()+3)if force else deadline
 remaining=end-time.monotonic();need(remaining>0,'policy settlement Unknown: deadline')
 code=child.wait(timeout=remaining);context.owner.leaders.discard(child.pid)
 context.reaped.append({'identity':ident,'exitCode':code,'reaped':True,'forced':force});context.active=None;return code

class SeedPolicyContext:
 def __init__(self,profile,admission,owner,children,actor_selector,streams,counts,deadline):
  import startup_runner as runner
  self.profile=profile;self.admission=admission;self.owner=owner;self.children=children;self.actor_selector=actor_selector;self.streams=streams;self.counts=counts;self.deadline=deadline;self.evaluations=0;self.active=None;self.reaped=[];self.evidence_root=pathlib.Path(runner.ROOT)/'evidence'
 def pump(self,deadline):
  import startup_runner as runner
  need(time.monotonic()<min(deadline,self.deadline-8),'policy/whole lifecycle deadline')
  observed=self.owner.observe();runner.quota(self.owner);clr=_clr(observed)
  need(len(clr)<=2,'two task CLR cap')
  for key,_ in self.actor_selector.select(0):
   raw=os.read(key.fileobj.fileno(),65536)
   if not raw:self.actor_selector.unregister(key.fileobj);continue
   self.counts[key.data]+=len(raw);need(self.counts[key.data]<=33554432,'individual actor stream bound');self.streams[key.data].write(raw);self.streams[key.data].flush()
  for role in ['host','engine']:need(self.children[role].poll()is None,'native actor exited during policy')
  return len(clr)
 def launch(self,invocation,deadline):return launch_policy(self,invocation,deadline)
 def settle(self,child,deadline,force=False):return settle_policy(self,child,deadline,force)

class PolicyOnlyContext:
 def __init__(self,profile,admission,owner,deadline):
  import policy_transport_runner as runner
  self.profile=profile;self.admission=admission;self.owner=owner;self.deadline=deadline;self.children={};self.evaluations=0;self.active=None;self.reaped=[];self.evidence_root=pathlib.Path(runner.ROOT)/'evidence';self.control=None
 def pump(self,deadline):
  import mechanics as m
  need(time.monotonic()<min(deadline,self.deadline-8),'policy-only/whole lifecycle deadline')
  observed=self.owner.observe();need(not self.owner.uncertain,'policy-only ownership Unknown')
  known={c.pid for c in self.children.values()}
  need(all(x['pid']in known for x in observed),'unexpected policy-only descendant')
  q=m.quota(self.evidence_root.parent,134217728,phase='policy-only',known_owned=list(self.owner.records.values()),live_owned=observed)
  need(q['files']<=1024,'policy-only leaf bound');clr=_clr(observed)
  need(len(clr)<=1,'one policy-only task CLR cap')
  return len(clr)
 def launch(self,invocation,deadline):return launch_policy(self,invocation,deadline)
 def settle(self,child,deadline,force=False):return settle_policy(self,child,deadline,force)

def _clr(observed):
 import runtime_identity
 clr=[]
 for identity in observed:
  try:raw=runtime_identity.proc_bytes(identity['pid'],'maps',4194304)
  except FileNotFoundError:continue
  need(len(raw)<=4194304,'policy live maps cap')
  if b'libcoreclr.so'in raw:clr.append(identity)
 return clr
class SeedGrowingLog(GrowingLog):
 def bind(self,context):
  need(type(context)in [SeedPolicyContext,PolicyOnlyContext] and not hasattr(self,'context'),'closed concrete policy context');_validate(context);self.context=context;return self
 def _closure(self,path,digest,deadline):
  ctx=self.context;entry,a=_validate(ctx)
  # Both closed production contexts obtain the original pin from their sealed profile.
  roster=ctx.profile['physicalPins']if type(ctx)is PolicyOnlyContext else ctx.profile['policy']['physicalPins']
  need(type(roster)is list,'selected canonical physical roster')
  selected=[pin for pin in roster if pin['path']==path]
  need(len(selected)==1 and selected[0]['sha256']==digest,'exact unique prior closure pin')
  return GrowingLog._closure(path,digest,deadline,selected[0])
 def _run_policy(self,path,closure_path,closure_sha,encoded,deadline):
  ctx=self.context;p=ctx.profile['policy'];need((path,closure_path,closure_sha)==(p['apphost'],p['closurePath'],p['closureSha256']),'literal policy input mismatch');need(p['environment']=={'PATH':'/usr/bin:/bin'} and len(encoded)<=MAX_POLICY_INPUT,'literal policy environment/input cap')
  invocation=hashlib.sha256(os.urandom(32)).hexdigest();child=None;sel=None;diagnostic=bytearray();all_stdout=bytearray();output=bytearray();ready=None;offset=0;count=0;check='policy-child-start';stdin_open=True;input_registered=False
  try:
   child=ctx.launch(invocation,deadline);ident=dict(ctx.owner.records[child.pid]);ident['startTicks']=str(ident['startTicks'])
   inp,out,err=child.stdin.fileno(),child.stdout.fileno(),child.stderr.fileno()
   for fd in [inp,out,err]:os.set_blocking(fd,False)
   sel=selectors.DefaultSelector();sel.register(out,selectors.EVENT_READ,'stdout');sel.register(err,selectors.EVENT_READ,'stderr')
   while sel.get_map()or stdin_open:
    ctx.pump(deadline);left=deadline-time.monotonic();need(left>0,'policy five-second deadline');check='policy-ready'if ready is None else 'policy-transport'
    for key,_ in sel.select(min(.02,left)):
     if key.data=='stdin':
      try:written=os.write(inp,encoded[offset:offset+65536])
      except BrokenPipeError as e:raise Refused('policy request broken pipe')from e
      need(written>0,'policy stdin stalled');offset+=written
      if offset==len(encoded):sel.unregister(inp);child.stdin.close();stdin_open=False
     else:
      block=os.read(key.fd,min(65536,131073-count));count+=len(block);need(count<=131072,'combined policy output cap')
      if not block:
       sel.unregister(key.fd)
       if key.data=='stdout':
        need(ready is not None,'policy ready unavailable')
        need(not stdin_open,'policy output ended before complete request')
       continue
      if key.data=='stderr':diagnostic.extend(block);continue
      all_stdout.extend(block);output.extend(block)
      if ready is None and b'\n'in output:
       line,tail=bytes(output).split(b'\n',1);ready=json.loads(line.decode(),object_pairs_hook=_unique)
       expected={'schema':'fsbar.barc-runtime-evidence-policy-ready/v2','invocationId':invocation,'closureSha256':closure_sha,'pid':ident['pid'],'startTicks':ident['startTicks'],'uid':ident['uid'],'phase':'ready'}
       need(ready==expected,'policy exact ready/current-process join');output=bytearray(tail)
       if type(ctx)is not PolicyOnlyContext or ctx.control!='withheld-input':sel.register(inp,selectors.EVENT_WRITE,'stdin');input_registered=True
    if child.poll()is not None and stdin_open:raise Refused('policy exited before full ready/request')
   need(ready is not None and offset==len(encoded),'ready before exact request');code=ctx.settle(child,deadline);need(code in [0,2],'policy natural exit')
   check='policy-completion';final=json.loads(bytes(output).decode(),object_pairs_hook=_unique)
   need(set(final)==set(ready)|{'result'} and all(final[k]==ready[k]for k in ready if k not in ['schema','phase']) and final['schema']=='fsbar.barc-runtime-evidence-policy-completed/v2' and final['phase']=='completed','one completed/final-closure frame')
   self.last_policy_observation=_policy_observation(bytes(diagnostic))if diagnostic else None
   self.last_invocation={k:ready[k]for k in ['invocationId','closureSha256','pid','startTicks','uid']};self.last_invocation.update(readyPhase='ready',completedPhase='completed')
   from snapshot_publication import bytes_new,json_new
   root=ctx.evidence_root;n=ctx.evaluations
   frames=bytes_new(root/('policy-'+str(n)+'.stdout.raw'),bytes(all_stdout),131072)
   stderr=bytes_new(root/('policy-'+str(n)+'.stderr.raw'),bytes(diagnostic),131072)
   json_new(root/('policy-'+str(n)+'.transport.json'),{'requestSha256':hashlib.sha256(encoded).hexdigest(),'requestBytes':len(encoded),'ready':ready,'completed':final,'stdout':frames,'stderr':stderr,'ownedSettlement':ctx.reaped[-1],'deadlineMonotonic':deadline})
   return (json.dumps(final['result'],separators=(',',':'))+'\n').encode()
  except BaseException as error:
   from snapshot_publication import bytes_new,json_new
   root=ctx.evidence_root;n=ctx.evaluations
   try:
    stdout_ack=bytes_new(root/('policy-'+str(n)+'.failure.stdout.raw'),bytes(all_stdout),131072)
    stderr_ack=bytes_new(root/('policy-'+str(n)+'.failure.stderr.raw'),bytes(diagnostic),131072)
    json_new(root/('policy-'+str(n)+'.failure.json'),{'primaryError':str(error),'checkpoint':check,'ready':ready,'requestWrittenBytes':offset,'requestSha256':hashlib.sha256(encoded).hexdigest(),'requestBytes':len(encoded),'stdout':stdout_ack,'stderr':stderr_ack,'nativeAcceptance':False})
   except BaseException as publication:error._barc_secondary_publication_failure=str(publication)
   observation=_policy_observation(bytes(diagnostic))if diagnostic else None
   if observation is not None:check=POLICY_TO_MECHANICAL[observation['checkpoint']]
   if ctx.active is not None:
    child=ctx.active
    try:ctx.settle(child,deadline,force=True)
    except BaseException as settlement:error._barc_secondary_settlement_failure=str(settlement)
   raise mark_failure(error,check,None,observation)
  finally:
   if sel is not None:sel.close()
   if child is not None and ctx.active is None:
    for stream in [child.stdin,child.stdout,child.stderr]:
     if stream is not None and not stream.closed:stream.close()
