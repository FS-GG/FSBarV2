"""No process launch. Actual transport with controlled pipes and a finite thread.
The thread represents framed bytes only, never a CLR policy or native evidence.
"""
import unittest,os,json,time,tempfile,pathlib,threading,signal
from unittest.mock import patch
import seed_policy as s
import startup_runner as r
from private_io import Refused
class Child:
 def __init__(self):
  self.pid=345;ir,iw=os.pipe();out_r,out_w=os.pipe();err_r,err_w=os.pipe();self.stdin=os.fdopen(iw,'wb',0);self.stdout=os.fdopen(out_r,'rb',0);self.stderr=os.fdopen(err_r,'rb',0);self.peer=(ir,out_w,err_w);self.finished=False
 def poll(self):return 0 if self.finished else None
 def wait(self,timeout=None):
  end=time.monotonic()+timeout
  while not self.finished and time.monotonic()<end:time.sleep(.001)
  if not self.finished:raise TimeoutError('CONTROLLED peer not settled')
  return 0
class Transport(unittest.TestCase):
 def context(self):
  ctx=s.SeedPolicyContext({'policy':{'apphost':'/controlled/policy','closurePath':'/controlled/closure','closureSha256':'c'*64,'environment':{'PATH':'/usr/bin:/bin'}}},'/controlled/grant',None,{},None,{}, {},time.monotonic()+5)
  return ctx
 def test_mismatch_refuses_before_launch(self):
  ctx=self.context();log=object.__new__(s.SeedGrowingLog);log.bind(ctx)
  with patch.object(ctx,'launch')as launch:
   with self.assertRaises(Refused):log._run_policy('/different','/controlled/closure','c'*64,b'{}',time.monotonic()+1)
   launch.assert_not_called()
 def exercise(self,mutate=lambda x:x,mutate_final=lambda x:x):
  with tempfile.TemporaryDirectory()as d:
   root=pathlib.Path(d);(root/'evidence').mkdir(mode=0o700);child=Child();ctx=self.context();identity={'pid':345,'startTicks':'23','uid':os.getuid()};ctx.owner=type('Owner',(),{'records':{345:identity}})();threads=[];requests=[]
   def launch(invocation,deadline):
    ctx.evaluations+=1;ctx.active=child
    def peer():
     inp,out,err=child.peer
     try:
      ready={'schema':'fsbar.barc-runtime-evidence-policy-ready/v2','invocationId':invocation,'closureSha256':'c'*64,**identity,'phase':'ready'}
      os.write(out,(json.dumps(mutate(ready))+'\n').encode());requests.append(os.read(inp,4096))
      completed={**ready,'schema':'fsbar.barc-runtime-evidence-policy-completed/v2','phase':'completed','result':{'CONTROLLED':'not acceptance'}}
      os.write(out,(json.dumps(mutate_final(completed))+'\n').encode())
     except OSError:pass
     finally:
      for fd in child.peer:
       try:os.close(fd)
       except OSError:pass
      child.finished=True
    thread=threading.Thread(target=peer,daemon=True);threads.append(thread);thread.start();return child
   def settle(c,deadline,force=False):
    if force and not child.stdin.closed:child.stdin.close()
    code=c.wait(timeout=max(.001,deadline-time.monotonic()));ctx.active=None;ctx.reaped.append({'identity':identity,'exitCode':code,'reaped':True});return code
   log=object.__new__(s.SeedGrowingLog);log.bind(ctx)
   try:
    with patch.object(ctx,'launch',side_effect=launch),patch.object(ctx,'pump')as pump,patch.object(ctx,'settle',side_effect=settle),patch.object(r,'ROOT',d):
     result=log._run_policy('/controlled/policy','/controlled/closure','c'*64,b'{"CONTROLLED":true}',time.monotonic()+1)
     self.assertGreater(pump.call_count,0);self.assertEqual(requests,[b'{"CONTROLLED":true}']);self.assertTrue(ctx.reaped[0]['reaped']);return result
   finally:
    if not child.stdin.closed:child.stdin.close()
    for thread in threads:thread.join(1)
 def test_actual_transport_controlled_positive(self):self.assertIn(b'CONTROLLED',self.exercise())
 def test_ready_generation_refusals(self):
  for key,value in [('pid',999),('startTicks','24'),('uid',-1),('closureSha256','d'*64),('invocationId','e'*64),('phase','completed')]:
   with self.subTest(key=key),self.assertRaises(Refused):self.exercise(lambda row:{**row,key:value})
 def test_completed_generation_refusals(self):
  for key,value in [('pid',999),('startTicks','24'),('closureSha256','d'*64),('phase','ready'),('invocationId','e'*64)]:
   with self.subTest(key=key),self.assertRaises(Refused):self.exercise(mutate_final=lambda row:{**row,key:value})
 def test_no_second_or_fourth_evaluation(self):
  ctx=self.context();ctx.active=object()
  with self.assertRaises(Refused):ctx.launch('a'*64,time.monotonic()+1)
  ctx.active=None;ctx.evaluations=3;ctx.reaped=[1,2,3]
  with self.assertRaises(Refused):ctx.launch('a'*64,time.monotonic()+1)
if __name__=='__main__':unittest.main()
