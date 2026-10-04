"""Literal owned direct-apphost transport; inherited canonical infolog semantics.
Inert without the selected startup runner's concrete live custody context.
"""
import os,time,json,hashlib,selectors,signal,subprocess,pathlib
from growing_log import GrowingLog,_unique,_policy_observation,POLICY_TO_MECHANICAL,MAX_POLICY_INPUT
from private_io import need,Refused
from runtime_identity import mark_failure
class SeedPolicyContext:
 def __init__(self,profile,admission,owner,children,actor_selector,streams,counts,deadline):
  self.profile=profile;self.admission=admission;self.owner=owner;self.children=children;self.actor_selector=actor_selector;self.streams=streams;self.counts=counts;self.deadline=deadline;self.evaluations=0;self.active=None;self.reaped=[]
 def pump(self,deadline):
  # This is the real actor selector/owner/quota, not an injected success callback.
  import startup_runner as runner
  need(time.monotonic()<min(deadline,self.deadline-8),'policy/whole lifecycle deadline')
  observed=self.owner.observe();runner.quota(self.owner)
  clr=[]
  for identity in observed:
   try:
    raw=__import__('runtime_identity').proc_bytes(identity['pid'],'maps',4194304)
   except FileNotFoundError:continue
   need(len(raw)<=4194304,'policy live maps cap')
   if b'libcoreclr.so'in raw:clr.append(identity)
  need(len(clr)<=2,'two task CLR cap')
  for key,_ in self.actor_selector.select(0):
   raw=os.read(key.fileobj.fileno(),65536)
   if not raw:self.actor_selector.unregister(key.fileobj);continue
   self.counts[key.data]+=len(raw);need(self.counts[key.data]<=33554432,'individual actor stream bound');self.streams[key.data].write(raw);self.streams[key.data].flush()
  for role in ['host','engine']:need(self.children[role].poll()is None,'native actor exited during policy')
  return len(clr)
 def launch(self,invocation,deadline):
  import startup_runner as runner
  need(self.active is None and self.evaluations<3 and len(self.reaped)==self.evaluations,'one settled policy child before next evaluation');need(self.pump(deadline)==1,'one host CLR before policy launch')
  # Host is one CLR. Before policy GO, task ownership census is checked above;
  # source/admission must separately reserve the two infrastructure CLR.
  self.evaluations+=1
  child=runner.launch('policy',self.profile,self.admission,self.owner,min(deadline,self.deadline),self.children,invocation=invocation,evaluation=self.evaluations,cleanup_reserve=0,policy_context=self)
  self.active=child;return child
 def settle(self,child,deadline,force=False):
  import mechanics as m
  need(child is self.active,'exact policy child settlement');ident=self.owner.records[child.pid]
  if force and child.poll()is None:self.owner.send(ident,signal.SIGKILL)
  remaining=deadline-time.monotonic();need(remaining>0,'policy settlement Unknown: deadline')
  code=child.wait(timeout=remaining);self.owner.leaders.discard(child.pid);self.reaped.append({'identity':ident,'exitCode':code,'reaped':True});self.active=None;return code
class SeedGrowingLog(GrowingLog):
 def bind(self,context):
  need(type(context)is SeedPolicyContext and not hasattr(self,'context'),'closed concrete policy context');self.context=context;return self
 def _run_policy(self,path,closure_path,closure_sha,encoded,deadline):
  ctx=self.context;p=ctx.profile['policy'];need((path,closure_path,closure_sha)==(p['apphost'],p['closurePath'],p['closureSha256']),'literal policy input mismatch');need(p['environment']=={'PATH':'/usr/bin:/bin'} and len(encoded)<=MAX_POLICY_INPUT,'literal policy environment/input cap')
  invocation=hashlib.sha256(os.urandom(32)).hexdigest();child=None;sel=None;diagnostic=bytearray();all_stdout=bytearray();output=bytearray();ready=None;offset=0;count=0;check='policy-child-start';stdin_open=True;input_registered=False
  try:
   child=ctx.launch(invocation,deadline);ident=ctx.owner.records[child.pid]
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
       need(ready==expected,'policy exact ready/current-process join');output=bytearray(tail);sel.register(inp,selectors.EVENT_WRITE,'stdin');input_registered=True
    if child.poll()is not None and stdin_open:raise Refused('policy exited before full ready/request')
   need(ready is not None and offset==len(encoded),'ready before exact request');code=ctx.settle(child,deadline);need(code in [0,2],'policy natural exit')
   check='policy-completion';final=json.loads(bytes(output).decode(),object_pairs_hook=_unique)
   need(set(final)==set(ready)|{'result'} and all(final[k]==ready[k]for k in ready if k not in ['schema','phase']) and final['schema']=='fsbar.barc-runtime-evidence-policy-completed/v2' and final['phase']=='completed','one completed/final-closure frame')
   self.last_policy_observation=_policy_observation(bytes(diagnostic))if diagnostic else None
   self.last_invocation={k:ready[k]for k in ['invocationId','closureSha256','pid','startTicks','uid']};self.last_invocation.update(readyPhase='ready',completedPhase='completed')
   from snapshot_publication import bytes_new,json_new
   import startup_runner as runner
   root=pathlib.Path(runner.ROOT)/'evidence';n=ctx.evaluations
   frames=bytes_new(root/('policy-'+str(n)+'.stdout.raw'),bytes(all_stdout),131072)
   stderr=bytes_new(root/('policy-'+str(n)+'.stderr.raw'),bytes(diagnostic),131072)
   json_new(root/('policy-'+str(n)+'.transport.json'),{'requestSha256':hashlib.sha256(encoded).hexdigest(),'requestBytes':len(encoded),'ready':ready,'completed':final,'stdout':frames,'stderr':stderr,'ownedSettlement':ctx.reaped[-1],'deadlineMonotonic':deadline})
   return (json.dumps(final['result'],separators=(',',':'))+'\n').encode()
  except BaseException as error:
   from snapshot_publication import bytes_new,json_new
   import startup_runner as runner
   root=pathlib.Path(runner.ROOT)/'evidence';n=ctx.evaluations
   try:
    stdout_ack=bytes_new(root/('policy-'+str(n)+'.failure.stdout.raw'),bytes(all_stdout),131072)
    stderr_ack=bytes_new(root/('policy-'+str(n)+'.failure.stderr.raw'),bytes(diagnostic),131072)
    json_new(root/('policy-'+str(n)+'.failure.json'),{'primaryError':str(error),'checkpoint':check,'requestSha256':hashlib.sha256(encoded).hexdigest(),'requestBytes':len(encoded),'stdout':stdout_ack,'stderr':stderr_ack,'nativeAcceptance':False})
   except BaseException as publication:error._barc_secondary_publication_failure=str(publication)
   observation=_policy_observation(bytes(diagnostic))if diagnostic else None
   if observation is not None:check=POLICY_TO_MECHANICAL[observation['checkpoint']]
   if child is not None and ctx.active is child:
    try:ctx.settle(child,deadline,force=True)
    except BaseException as settlement:raise mark_failure(Refused('policy held child settlement Unknown'),check,'unexpected',observation)from settlement
   raise mark_failure(error,check,None,observation)
  finally:
   if sel is not None:sel.close()
   if child is not None and ctx.active is None:
    for stream in [child.stdin,child.stdout,child.stderr]:
     if stream is not None and not stream.closed:stream.close()
