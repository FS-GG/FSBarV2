"""Pure closed-composition/source-routing controls; no policy/CLR/native execution."""
import unittest,time,pathlib,tempfile,os,ast
from unittest.mock import patch,Mock
import seed_policy as s
import policy_transport_runner as r
import startup_runner as native
import mechanics as m
from private_io import Refused
class Composition(unittest.TestCase):
 def context(self):return s.PolicyOnlyContext({'policy':{'apphost':'/controlled/apphost','closurePath':'/controlled/closure','closureSha256':'c'*64,'environment':{'PATH':'/usr/bin:/bin'}}},'/controlled/a',Mock(),time.monotonic()+20)
 def test_outer_one_use_and_private_grant_before_effects(self):
  source=pathlib.Path(r.__file__).read_text();self.assertIn("stat.S_IMODE(info.st_mode)==0o600",source);self.assertIn("info.st_nlink==1",source);self.assertLess(source.index('json_new(consumed,'),source.index('A.mkdir(mode=0o700)'))
  with tempfile.TemporaryDirectory()as d:
   grant=pathlib.Path(d)/'grant';grant.write_text('{}');grant.chmod(0o600);(grant.parent/(grant.name+'.consumed')).write_text('{}')
   with patch.object(r,'profile')as profile,patch.object(r.subprocess,'Popen')as process:
    with self.assertRaises(m.Refused):r.execute(grant)
    profile.assert_not_called();process.assert_not_called()
 def test_closed_binding(self):
  with patch.object(s,'_validate')as validation:
   for kind in [s.SeedPolicyContext,s.PolicyOnlyContext]:
    log=object.__new__(s.SeedGrowingLog);ctx=object.__new__(kind);self.assertIs(log.bind(ctx),log)
    with self.assertRaises(Refused):log.bind(ctx)
   validation.assert_called()
  class Extension(s.PolicyOnlyContext):pass
  for ctx in [object.__new__(Extension),object()]:
   with self.assertRaises(Refused):object.__new__(s.SeedGrowingLog).bind(ctx)
 def test_exact_seven_element_argv(self):
  ctx=self.context();argv=s.policy_argv(ctx.profile['policy'],'d'*64)
  self.assertEqual(argv,['/controlled/apphost','--closure-manifest','/controlled/closure','--closure-sha256','c'*64,'--invocation-id','d'*64])
  for invocation in ['',None,'d'*63,'d'*64+';']:
   with self.assertRaises(Refused):s.policy_argv(ctx.profile['policy'],invocation)
 def test_unsettled_and_fourth_refuse_before_source_or_launch(self):
  ctx=self.context()
  with patch.object(s,'_validate')as validate,patch.object(s.subprocess,'Popen')as process:
   ctx.active=object()
   with self.assertRaises(Refused):ctx.launch('a'*64,time.monotonic()+1)
   ctx.active=None;ctx.evaluations=3;ctx.reaped=[1,2,3]
   with self.assertRaises(Refused):ctx.launch('a'*64,time.monotonic()+1)
   validate.assert_not_called();process.assert_not_called()
 def test_native_and_policy_only_delegate_same_launch_settlement(self):
  ctx=self.context();native_ctx=object.__new__(s.SeedPolicyContext)
  with patch.object(s,'launch_policy',return_value='CONTROLLED')as launch:
   self.assertEqual(ctx.launch('a'*64,1),'CONTROLLED');self.assertEqual(native_ctx.launch('a'*64,1),'CONTROLLED');self.assertEqual(launch.call_count,2)
  with patch.object(s,'settle_policy',return_value=0)as settle:
   self.assertEqual(ctx.settle('child',1),0);self.assertEqual(native_ctx.settle('child',1),0);self.assertEqual(settle.call_count,2)
 def test_policy_only_does_not_import_or_invoke_native_profile_socket_commands(self):
  tree=ast.parse(pathlib.Path(r.__file__).read_text());names={x.module for x in ast.walk(tree)if isinstance(x,ast.ImportFrom)}|{a.name for x in ast.walk(tree)if isinstance(x,ast.Import)for a in x.names}
  self.assertNotIn('startup_runner',names);self.assertNotIn('runtime_socket',names)
  source=pathlib.Path(r.__file__).read_text();self.assertNotIn('nativeHost',source);self.assertNotIn('engineRuntimeEnvironment',source)
 def test_native_shim_and_policy_only_shim_use_shared_function(self):
  for module in [native,r]:
   tree=ast.parse(pathlib.Path(module.__file__).read_text());shim=next(x for x in tree.body if isinstance(x,ast.FunctionDef)and x.name=='shim')
   self.assertTrue(any(isinstance(x,ast.Call)and isinstance(x.func,ast.Name)and x.func.id=='policy_shim'for x in ast.walk(shim)))
 def test_wrong_admission_does_not_cross_composition(self):
  with self.assertRaises(m.Refused):r.source_binding({'schema':'bar.seed-attribution-admission/v2','operation':'seed-attribution-startup-only'}, {})
  ctx=self.context();ctx.owner=object.__new__(m.LinuxOwner)
  with patch.object(m,'load',return_value={'operation':'seed-attribution-startup-only'}),patch.object(r,'source_binding'):
   with self.assertRaises(Refused):s._validate(ctx)
 def test_unprepared_profile_refuses(self):
  with self.assertRaises(m.Refused):r.profile()
 def test_policy_only_quota_has_no_socket_exception_and_rejects_foreign_descendant(self):
  ctx=self.context();ctx.owner.uncertain=False;ctx.owner.records={};ctx.owner.observe.return_value=[]
  with patch.object(m,'quota',return_value={'files':0})as quota,patch.object(s,'_clr',return_value=[]):
   self.assertEqual(ctx.pump(time.monotonic()+1),0);self.assertNotIn('runtime_socket',quota.call_args.kwargs)
   ctx.owner.observe.return_value=[{'pid':999}]
   with self.assertRaises(Refused):ctx.pump(time.monotonic()+1)
 def test_one_policy_clr_cap(self):
  ctx=self.context();ctx.owner.uncertain=False;ctx.owner.records={};ctx.owner.observe.return_value=[]
  with patch.object(m,'quota',return_value={'files':0}),patch.object(s,'_clr',return_value=[1,2]):
   with self.assertRaises(Refused):ctx.pump(time.monotonic()+1)
 def test_native_pump_still_requires_both_live_actors(self):
  owner=Mock();owner.observe.return_value=[];selector=Mock();selector.select.return_value=[]
  children={'host':Mock(),'engine':Mock()}
  ctx=s.SeedPolicyContext({'policy':{}},'/controlled/a',owner,children,selector,{}, {},time.monotonic()+20)
  with patch.object(native,'quota'),patch.object(s,'_clr',return_value=[]):
   for role in ['host','engine']:
    for child in children.values():child.poll.return_value=None
    children[role].poll.return_value=1
    with self.subTest(role=role),self.assertRaises(Refused):ctx.pump(time.monotonic()+1)
 def test_exact_policy_source_profile_required(self):
  ctx=self.context();ctx.owner=object.__new__(m.LinuxOwner)
  with patch.object(m,'load',return_value={'operation':'policy-transport-qualification-only'}),patch.object(r,'source_binding'),patch.object(r,'profile',return_value={'different':'CONTROLLED'}):
   with self.assertRaises(Refused):s._validate(ctx)
 def test_controlled_worker_writer_and_exact_case_order_are_source_wired(self):
  source=pathlib.Path(r.__file__).read_text();self.assertIn('os.O_WRONLY|os.O_APPEND|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW',source);self.assertIn("start_ticks(os.getpid())",source);self.assertIn("log.consume('browser'",source);self.assertIn("ctx.evaluations==1",source);self.assertIn("ctx.evaluations==3",source)
  self.assertEqual(r.CASES,['stable-consume','malformed-request','withheld-input'])
if __name__=='__main__':unittest.main()
