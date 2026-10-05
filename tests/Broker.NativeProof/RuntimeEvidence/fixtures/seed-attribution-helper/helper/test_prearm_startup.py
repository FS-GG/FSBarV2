"""Controlled source checks; Popen and process ownership are explicitly mocked."""
import unittest,pathlib,tempfile,os,json,time
from unittest.mock import patch,Mock
from seed_policy import SeedPolicyContext
import seed_policy as s
import startup_runner as r
import mechanics as m
import stock_bootstrap as b
class Startup(unittest.TestCase):
 def p(self):return {'source':{'fsbarCommit':'2e332259c5db590be63bb628e6c4de4b3c8e2291','highbarCommit':'b'*40},'proposedPorts':{'grpc':5021,'gateway':3900,'unusedReceiverOrigin':3800},'runId':'controlled','nativeHost':'/controlled/host','engine':'/controlled/engine','dataRoot':'/controlled/data','startscript':'/controlled/startscript','runtimeEnvironment':{'DOTNET_EnableDiagnostics':'0'},'engineRuntimeEnvironment':{'XDG_RUNTIME_DIR':r.ROOT+'/engine/run'},'policy':{'apphost':'/controlled/policy','closurePath':'/controlled/closure','closureSha256':'c'*64,'environment':{'PATH':'/usr/bin:/bin'}}}
 def test_closed_raw_path_and_policy_environment(self):
  p=self.p();self.assertEqual(r.environment(p,'host')['BARC_ONE_UNIT_RAW_EVENTS'],r.ROOT+'/host/raw.jsonl');self.assertEqual(r.environment(p,'policy'),{'PATH':'/usr/bin:/bin'});self.assertEqual(set(r.commands(p)),{'host','engine'});self.assertEqual(len(r.commands(p,'d'*64)['policy']),7)
  for role in ['browser','receiver','actor']:
   with self.assertRaises(m.Refused):r.launch(role,p,'/controlled/a',None,time.monotonic()+1,{})
 def test_held_identity_before_go_and_literal_policy_command(self):
  events=[];owner=Mock();owner.leaders=set();owner.records={};owner.handles={}
  def acquire(x):owner.records[x['pid']]=x;owner.handles[x['pid']]=1;events.append('held-pidfd')
  owner.acquire.side_effect=acquire;child=Mock(pid=456);identity={'pid':456,'ppid':os.getpid(),'pgid':456,'session':456,'uid':os.getuid(),'startTicks':'12','state':'S'}
  original_write=os.write
  def write(fd,body):
   if body==b'GO\n':events.append('GO');return len(body)
   return original_write(fd,body)
  def popen(argv,**kw):original_write(kw['pass_fds'][0],b'BAR-POLICY-READY\n');events.append('shim');return child
  with patch.object(r,'runtime_socket',return_value=Mock()),patch.object(r.subprocess,'Popen',side_effect=popen)as launch,patch.object(m,'identity',return_value=identity),patch.object(m,'load',return_value={'cpu':1}),patch.object(m,'write_new'),patch.object(os,'sched_getaffinity',return_value={1}),patch.object(os,'write',side_effect=write),patch.object(s,'_validate',side_effect=lambda ctx:(r,{'cpu':1,'sourceSHA256':'a'*64,'profileSHA256':'b'*64})):
   ctx=SeedPolicyContext(self.p(),'/controlled/grant',owner,{},None,{}, {},time.monotonic()+10);ctx.pump=Mock(return_value=1);registry=ctx.children;result=r.launch('policy',ctx.profile,'/controlled/grant',owner,time.monotonic()+1,registry,invocation='d'*64,evaluation=1,cleanup_reserve=0,policy_context=ctx)
   self.assertIs(result,child);self.assertEqual(events,['shim','held-pidfd','GO']);self.assertIn('policy-1',registry);self.assertEqual(launch.call_args.kwargs['env'],{'PATH':'/usr/bin:/bin'});self.assertIs(launch.call_args.kwargs['stdin'],r.subprocess.PIPE)
 def test_ready_is_not_seed_predicate(self):
  with tempfile.TemporaryDirectory()as d:
   A=pathlib.Path(d);(A/'host').mkdir();(A/'engine').mkdir();self.assertFalse(r.seed_predicates(A,{'runId':'controlled'}))
 def test_old_profile_and_unprepared_profile_refuse(self):
  with self.assertRaises(m.Refused):r.profile()
 def test_host_live_prefix_not_fake_completion(self):
  with tempfile.TemporaryDirectory()as d:
   A=pathlib.Path(d);p=A/'host';target=A/'prefix';writer={'pid':99,'uid':os.getuid(),'startTicks':'123'};config={'runId':'controlled','source':self.p()['source']};row={'schema':b.HOST_JOURNAL_SCHEMA,'runId':'controlled','sequence':'1','kind':'header','writer':writer,'source':config['source'],'value':{'selectedCase':'stock-smoke-count1'}};p.write_text(json.dumps(row)+'\n');p.chmod(0o600)
   with patch.object(b,'_same_process'),patch.object(b,'_writable_append_fd'):
    receipt=b.freeze_prearm_host_prefix(str(p),str(target),Mock(pid=99),{'writer':writer},config,time.monotonic()+1);self.assertFalse(receipt['terminal']);self.assertEqual(receipt['observedBytes'],p.stat().st_size)
    row.update(sequence='2',kind='complete');p.write_text(p.read_text()+json.dumps(row)+'\n')
    with self.assertRaises(Exception):b.freeze_prearm_host_prefix(str(p),str(A/'refused'),Mock(pid=99),{'writer':writer},config,time.monotonic()+1)
if __name__=='__main__':unittest.main()
