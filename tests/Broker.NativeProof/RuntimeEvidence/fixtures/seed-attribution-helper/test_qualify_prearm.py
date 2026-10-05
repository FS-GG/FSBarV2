"""Controlled source fixtures only; never actual/native qualification evidence."""
import unittest,tempfile,pathlib,json,os,time,copy
from unittest.mock import patch
import qualify_prearm as q
import prepare_policy_closure as policy
class Controlled(unittest.TestCase):
 def setUp(self):self.tmp=tempfile.TemporaryDirectory();self.root=pathlib.Path(self.tmp.name);self.count=0
 def tearDown(self):self.tmp.cleanup()
 def pin(self,v,raw=False):
  self.count+=1;p=self.root/str(self.count);b=v if raw else json.dumps(v,separators=(',',':')).encode();p.write_bytes(b);p.chmod(0o600);s=p.stat();return {'path':str(p),'sha256':q.sha(b),'bytes':len(b),'device':s.st_dev,'inode':s.st_ino,'uid':s.st_uid,'mode':0o600,'nlink':1}
 def framed(self,magic,rows):
  text='\n'.join([magic,'length=00000000',*rows,'end'])+'\n';return text.replace('length=00000000','length='+str(len(text)).zfill(8))
 def fixture(self):
  source={'fsbarCommit':'a'*40,'highbarCommit':'b'*40};writer={'pid':99,'startTicks':'123','uid':os.getuid()};factory={'id':'10','lifetime':'5'};products=[{'id':'11','lifetime':'6'}];base={'token':'eA==','matchIncarnation':'AAAAAAAAAAAAAAAAAAAAAA==','processIncarnation':'P','stateChannelIncarnation':'C','snapshotSendMonotonicNs':'1','effectiveCadenceFrames':1}
  def basis(n):return {**base,'stateSequence':str(n*2),'frame':n*10}
  context={'profile':'barc-live-tactical-stock-v1','tacticalRevision':2,'queueEvidenceScheme':2,'actor':factory,'catalogueId':base['matchIncarnation'],'catalogueRevision':'1','engineVersion':'2026.07.04','gameName':'controlled','gameVersion':'1','contentSha256':'c'*64,'domain':'production'}
  raw=[];host=[];stock=[]
  def hr(kind,value):host.append({'schema':'fsbar.barc-stock-host-journal/v1','runId':'controlled','source':source,'writer':writer,'sequence':str(len(host)+1),'kind':kind,'value':value})
  for n,kind,value in [(1,'snapshot',{'units':[{'unitId':10,'definitionId':1,'underConstruction':False,'buildProgress':1}]}),(2,'unit-created',{'unitId':11,'builderId':10}),(3,'snapshot',{'units':[{'unitId':10,'definitionId':1,'underConstruction':False,'buildProgress':1},{'unitId':11,'definitionId':2,'underConstruction':True,'buildProgress':0.5}]}),(4,'unit-finished',{'unitId':11}),(5,'snapshot',{'units':[{'unitId':10,'definitionId':1,'underConstruction':False,'buildProgress':1},{'unitId':11,'definitionId':2,'underConstruction':False,'buildProgress':1}]})]:
   entries=[{'id':-2,'codedOptions':0,'tag':8,'float32params':[]}]if n==3 else []
   revision=q.stock_revision(context,[{'domain':'production',**x}for x in entries]);actors=[{'actor':factory,'queue':[{'domain':2,'revision':revision,'entries':[{'definitionId':2,'nativeTag':8}]if entries else [],'repeat':False,'complete':True,'evidenceScheme':2}]}]+([{'actor':products[0],'queue':[]}]if n in [3,5] else [])
   if n in [1,3,5]:hr('live-metadata',{'tactical':{'basis':basis(n),'actors':actors}})
   raw.append({'schema':'fsbar.barc-one-unit-raw-state-journal/v1','runId':'controlled','source':source,'writer':writer,'acceptedGeneration':'G','sequence':str(n),'kind':kind,'stateSequence':str(n*2),'nativeFrame':n*10,'disposition':'materialized'if kind=='snapshot'else 'invalidated','value':value})
   if n in [2,4]:hr('stale',{'receivedSequence':str(n*2)})
   if n==5:hr('observation',{'stateSequence':'10'})
   if n in [1,3,5]:
    req=self.framed('BARC_QUEUE_REQUEST/1',['bridge=barc-stock-queue-reader-v1','domain=production','unit=10']);response=self.framed('BARC_QUEUE_RESPONSE/1',['bridge=barc-stock-queue-reader-v1','request-sha256='+q.sha(req.encode()),'status=ok','domain=production','unit=10','count='+str(len(entries)),*['row='+q.row_text({'domain':'production',**x})for x in entries]])
    stock.append({'schema':'highbar.barc-stock-queue-trace/v1','runId':'controlled','sequence':str(len(stock)+1),'phase':'sample','readFrame':n*10,'perspectiveTeamId':0,'nativeBasis':basis(n),'context':context,'reader':{'kind':'CallRules','status':'complete','request':req,'response':response},'queue':{'revision':revision,'entries':entries},'dispatch':None})
  inputs={k:self.pin(b''.join(json.dumps(r,separators=(',',':')).encode()+b'\n'for r in rows),True)for k,rows in [('raw',raw),('host',host),('stock',stock)]}
  inputs['metadata']=self.pin({'schema':'fsbar.barc-stock-native-smoke-metadata/v1','runId':'controlled','writer':writer,'actors':{'factory':factory},'basis':{'processIncarnation':'P','stateChannelIncarnation':'C','matchId':base['matchIncarnation']}});inputs['setup']=self.pin({'schema':'fsbar.barc-stock-native-smoke-setup/v1','runId':'controlled','writer':writer,'existingProductionDefinitionId':2,'productDefinitionId':3})
  inputs['configuration']=self.pin({'CONTROLLED':'native adapter tested separately'})
  record=self.pin({'CONTROLLED':'prefix custody tested separately'});now=time.monotonic_ns()
  return {'schema':'bar.prearm-sealed-input-contract/v1','runId':'controlled','source':source,'writer':writer,'acceptedGeneration':'G','factory':factory,'setup':{'seedCount':1,'seedDefinitionId':2,'productDefinitionId':3},'inputs':inputs,'completeRecordEvidence':record,'lifecycle':{'startedMonotonicNs':str(now),'transitionDeadlineMonotonicNs':str(now+60_000_000_000),'totalDeadlineMonotonicNs':str(now+120_000_000_000)},'outputPath':str(self.root/'qualification')}
 def derive(self,c):
  with patch.object(q,'configuration_evidence',return_value={'processes':[{**c['writer'],'role':'host'}],'setupCompletion':{'completionNativeFrame':15}}),patch('native_evidence.horizons'):return q.derive(c,time.monotonic()+10)
 def mutate_raw(self,c,change):
  rows=[json.loads(x)for x in pathlib.Path(c['inputs']['raw']['path']).read_bytes().splitlines()];change(rows);pin=self.pin(b''.join(json.dumps(x,separators=(',',':')).encode()+b'\n'for x in rows),True);c['inputs']['raw']=pin
 def test_controlled_positive_nonconsecutive_native_sequences(self):
  c=self.fixture();r=self.derive(c);self.assertEqual(r['seedEvidence']['seedCount'],1);q.publish(r,c['outputPath']);self.assertEqual(pathlib.Path(c['outputPath']).stat().st_mode&0o777,0o600)
  with self.assertRaises(FileExistsError):q.publish(r,c['outputPath'])
 def test_lifecycle_mutants_refuse(self):
  changes=[lambda r:r[1]['value'].update(builderId=0),lambda r:r[3].update(kind='unit-created'),lambda r:r[3].update(disposition='materialized'),lambda r:r[2].update(acceptedGeneration='foreign'),lambda r:r[2].update(kind='command-dispatch'),lambda r:r[4]['value']['units'][1].update(underConstruction=True),lambda r:r[4]['value']['units'].append({'unitId':12,'definitionId':2,'underConstruction':False,'buildProgress':1}),lambda r:r[1].update(sequence='3'),lambda r:r[1].update(disposition='gap'),lambda r:r[3].update(stateSequence='6')]
  for change in changes:
   with self.subTest(change=change):c=self.fixture();self.mutate_raw(c,change)
   with self.assertRaises((q.Refused,KeyError,StopIteration)):self.derive(c)
 def test_json_and_record_bounds(self):
  for body in [b'{"a":1,"a":2}',b'{"a":NaN}',b'{"a":1}\0']:
   with self.assertRaises(q.Refused):q.parse(body)
  for body in [b'{"sequence":"1"}',b'{"sequence":"2"}\n',b'{"sequence":"1","x":"'+b'x'*32768+b'"}\n']:
   with self.assertRaises(q.Refused):q.records(body,'controlled')
 def test_physical_mutants(self):
  p=self.pin(b'controlled',True);path=pathlib.Path(p['path']);path.write_bytes(b'tampering')
  with self.assertRaises(q.Refused):q.held_bytes(p,100,time.monotonic()+1)
  p=self.pin(b'controlled',True);os.link(p['path'],self.root/'link')
  with self.assertRaises(q.Refused):q.held_bytes(p,100,time.monotonic()+1)
  p=self.pin(b'controlled',True);path=pathlib.Path(p['path']);path.unlink();path.symlink_to(self.root/'link')
  with self.assertRaises(OSError):q.held_bytes(p,100,time.monotonic()+1)
 def test_expiry_and_missing_config(self):
  c=self.fixture();c['lifecycle']['transitionDeadlineMonotonicNs']='1'
  with self.assertRaises(q.Refused):self.derive(c)
  c=self.fixture();del c['inputs']['configuration']
  with self.assertRaises(q.Refused):self.derive(c)
 def test_stock_response_revision_not_boolean(self):
  c=self.fixture();rows=[json.loads(x)for x in pathlib.Path(c['inputs']['stock']['path']).read_bytes().splitlines()];rows[1]['queue']['revision']='1'
  with self.assertRaises(q.Refused):q.stock_record(rows[1])
 def test_actual_pid_generation_inspector(self):
  text=pathlib.Path('/proc/self/stat').read_text();ticks=text[text.rfind(')')+2:].split()[19];q.live_process({'pid':os.getpid(),'startTicks':ticks,'uid':os.getuid()})
  with self.assertRaises(q.Refused):q.live_process({'pid':os.getpid(),'startTicks':str(int(ticks)+1),'uid':os.getuid()})
 def test_exact_record_limits_and_partial_tail(self):
  base=b'{"sequence":"1","padding":""}';padding=q.MAX_ROW-len(base)-1;exact=base.replace(b'"padding":""',b'"padding":"'+b'x'*padding+b'"')+b'\n';self.assertEqual(len(exact),q.MAX_ROW);q.records(exact,'raw')
  with self.assertRaises(q.Refused):q.records(exact[:-2]+b'x"\n','raw')
  with self.assertRaises(q.Refused):q.records(exact[:-1],'raw')
  body=b''.join(json.dumps({'sequence':str(i+1)}).encode()+b'\n'for i in range(q.MAX_ROWS));q.records(body,'raw')
  with self.assertRaises(q.Refused):q.records(body+b'{"sequence":"8193"}\n','raw')
 def test_snapshot_join_and_generation_refusal(self):
  c=self.fixture();self.mutate_raw(c,lambda rows:rows[0].update(nativeFrame=11))
  with self.assertRaises(q.Refused):self.derive(c)
  c=self.fixture();self.mutate_raw(c,lambda rows:rows[4].update(stateSequence='8'))
  with self.assertRaises(q.Refused):self.derive(c)
 def test_reported_host_gap_and_lifetime_refusals(self):
  for mutant in ['gap','detach','lifetime']:
   c=self.fixture();rows=[json.loads(x)for x in pathlib.Path(c['inputs']['host']['path']).read_bytes().splitlines()]
   if mutant in ['gap','detach']:next(x for x in rows if x['kind']=='stale')['value']['detail']='state sequence gap'if mutant=='gap'else 'coordinator detached'
   else:
    tactical=[x['value']['tactical']for x in rows if x['kind']=='live-metadata'];tactical[1]['actors'][1]['actor']['lifetime']='99'
   c['inputs']['host']=self.pin(b''.join(json.dumps(x,separators=(',',':')).encode()+b'\n'for x in rows),True)
   with self.assertRaises(q.Refused):self.derive(c)
 def test_host_invalidation_after_terminal_snapshot_refuses(self):
  # A terminal snapshot does not erase a later generation failure in the sealed extent.
  for kind in ['gap','detach','identity-conflict']:
   with self.subTest(kind=kind):
    c=self.fixture();rows=[json.loads(x)for x in pathlib.Path(c['inputs']['host']['path']).read_bytes().splitlines()]
    row=copy.deepcopy(rows[-1]);row.update(sequence=str(len(rows)+1),kind=kind,value={'detail':'controlled terminal failure'})
    rows.append(row);c['inputs']['host']=self.pin(b''.join(json.dumps(x,separators=(',',':')).encode()+b'\n'for x in rows),True)
    with self.assertRaisesRegex(q.Refused,'host-generation-refusal'):self.derive(c)
 def test_stale_generation_failure_after_terminal_snapshot_refuses(self):
  for detail in ['state sequence gap','coordinator detached','identity changed','process incarnation changed']:
   with self.subTest(detail=detail):
    c=self.fixture();rows=[json.loads(x)for x in pathlib.Path(c['inputs']['host']['path']).read_bytes().splitlines()]
    row=copy.deepcopy(rows[-1]);row.update(sequence=str(len(rows)+1),kind='stale',value={'receivedSequence':'10','detail':detail})
    rows.append(row);c['inputs']['host']=self.pin(b''.join(json.dumps(x,separators=(',',':')).encode()+b'\n'for x in rows),True)
    with self.assertRaisesRegex(q.Refused,'host-generation-refusal'):self.derive(c)
 def test_no_fabricated_boolean_contract(self):
  with self.assertRaises(q.Refused):q.derive({'actualPassed':True,'noAutonomousOrders':True},time.monotonic()+1)
  c=self.fixture();pin=c['inputs']['raw'];body=pathlib.Path(pin['path']).read_bytes();pathlib.Path(pin['path']).write_bytes(body+b'{')
  self.derive(c) # Later append is legal; the captured complete extent stays unchanged.
 def test_policy_preparation_is_obstructed(self):
  roles=lambda names:[{'role':x,'path':'/controlled/'+x,'sha256':'a'*64}for x in names]
  original={'schema':'fsbar.barc-runtime-evidence-policy-closure/v3','custodyRoot':'/controlled','managedRoot':'/controlled/m','provenanceRoot':'/controlled/p','runtimeRoots':['/controlled/r'],'searchLayout':[],'managed':roles(policy.MANAGED),'provenance':roles(policy.PROVENANCE),'runtime':[{'path':'/controlled/lib'}],'runtimeRoles':{x:'/controlled/'+x for x in policy.RUNTIME},'source':{'productCommit':'a'*40,'productTree':'b'*40},'custody':{}}
  result=policy.prepare(self.pin(original),{'productCommit':'c'*40,'productTree':'d'*40,'highbarCommit':'e'*40},str(self.root/'fresh'),time.monotonic()+5);self.assertFalse(result['ready']);self.assertIn('productCommit-mismatch',result['obstructions']);self.assertFalse((self.root/'fresh').exists())
if __name__=='__main__':unittest.main()
