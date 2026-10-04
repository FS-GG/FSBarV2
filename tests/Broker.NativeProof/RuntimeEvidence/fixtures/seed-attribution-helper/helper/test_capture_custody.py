import hashlib,json,os,pathlib,shutil,stat,sys,tempfile,time,unittest
from capture_custody import SPEC,prepare_capture_capsule,verify_capture_capsule,bind_capture_handoff,finish_capture_capsule
from private_io import Refused

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def dump(p,v):p.write_text(json.dumps(v));p.chmod(0o600)

class CaptureCustody(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.base=pathlib.Path(self.temp.name);self.base.chmod(0o700);self.packet=self.base/'packet';self.packet.mkdir(mode=0o700);self.seed=self.packet/'capture-capsule';self.seed.mkdir(mode=0o700);self.attempt=self.base/'attempt';self.attempt.mkdir(mode=0o700);(self.attempt/'browser').mkdir(mode=0o700)
        for name,data in [(SPEC,b'actual source bytes'),('tests/Broker.NativeProof/package.json',b'{"type":"module"}'),('src/Broker.Browser.Contracts/generated/codec.js',b'export const codec=1;')]:
            p=self.seed/name;p.parent.mkdir(mode=0o700,parents=True,exist_ok=True);p.write_bytes(data);p.chmod(0o400)
        self.manifest=self.packet/'capture-manifest.json';self.helper=self.packet/'helper-manifest.json'
        self.value={'schema':'fsbar.barc-capture-capsule-seed/v1','root':str(self.seed),'sourceCommit':'3d723bcab5b25efc8d3467dcbc63790936f2add6','specRelativePath':SPEC,'files':[{'path':str(p.relative_to(self.seed)),'bytes':p.stat().st_size,'sha256':sha(p)} for p in sorted(self.seed.rglob('*')) if p.is_file()]};self.value['fileCount']=len(self.value['files']);self.value['totalBytes']=sum(r['bytes'] for r in self.value['files'])
        self.config={'roots':{'packetRoot':str(self.packet),'attemptRoot':str(self.attempt)},'source':{'fsbarCommit':self.value['sourceCommit'],'highbarCommit':'e2a5a9cf6fdd187bcc82f701a755567db96c11c7'},'artifacts':{'helperManifest':{'path':str(self.helper),'sha256':''},'captureSource':{'path':str(self.seed/SPEC),'sha256':sha(self.seed/SPEC)},'captureRuntime':{'path':str(self.packet/'node'),'sha256':'f'*64}},'commands':{'browser':[str(self.packet/'node'),str(self.packet/'launcher.mjs'),str(self.attempt/'browser/test-results')]}}
        self.refresh()
    def refresh(self):
        dump(self.manifest,self.value);dump(self.helper,{'sourceRoles':{'privateCaptureCapsule':{'manifest':{'path':str(self.manifest),'sha256':sha(self.manifest)}}}});self.config['artifacts']['helperManifest']['sha256']=sha(self.helper)
        rows=[]
        for p in self.packet.rglob('*'):
            if p.is_file() and p.name!='packet-inventory.json':
                s=p.lstat();rows.append({'path':str(p.relative_to(self.packet)),'bytes':s.st_size,'sha256':sha(p),'inode':s.st_ino,'device':f'{os.major(s.st_dev)}:{os.minor(s.st_dev)}'})
        inv=self.packet/'packet-inventory.json';dump(inv,{'root':str(self.packet),'files':rows,'fileCount':len(rows)});self.config['packetSha256']=sha(inv)
    def tearDown(self):self.temp.cleanup()
    def prepare(self):return prepare_capture_capsule(self.config,self.attempt,'a'*64,time.monotonic()+5)
    def test_expired_deadline_does_not_publish_capsule(self):
        with self.assertRaises(Refused):prepare_capture_capsule(self.config,self.attempt,'a'*64,time.monotonic()-1)
        self.assertFalse((self.attempt/'browser/execution-capsule').exists())
    def test_deadline_cannot_extend_operation_budget(self):
        with self.assertRaises(Refused):prepare_capture_capsule(self.config,self.attempt,'a'*64,time.monotonic()+181)
        self.assertFalse((self.attempt/'browser/execution-capsule').exists())
    def test_exact_copy_and_derived_capture_pin(self):
        derived,r=self.prepare();self.assertEqual(r['fileCount'],3);self.assertEqual(derived['artifacts']['captureSource']['sha256'],self.config['artifacts']['captureSource']['sha256']);self.assertNotEqual(derived['artifacts']['captureSource']['path'],self.config['artifacts']['captureSource']['path']);self.assertEqual(self.config['artifacts']['captureSource']['path'],str(self.seed/SPEC));self.assertEqual(finish_capture_capsule(self.config,self.attempt,r),sha(self.attempt/'capture-capsule-post-use.json'))
    def test_incomplete_seed_census_refused(self):
        p=self.seed/'extra.js';p.write_bytes(b'extra');p.chmod(0o400);self.refresh()
        with self.assertRaises(Refused):self.prepare()
    def test_shared_parent_and_nested_npm_directories_are_private(self):
        for name in ['tests/Broker.NativeProof/node_modules/package/lib/index.js','tests/Broker.NativeProof/node_modules/package/package.json']:
            p=self.seed/name;p.parent.mkdir(mode=0o700,parents=True,exist_ok=True);p.write_bytes(b'package source');p.chmod(0o400);self.value['files'].append({'path':name,'bytes':p.stat().st_size,'sha256':sha(p)})
        self.value['fileCount']=len(self.value['files']);self.value['totalBytes']=sum(r['bytes'] for r in self.value['files']);self.refresh();_,r=self.prepare()
        for p in pathlib.Path(r['executionRoot']).rglob('*'):
            if p.is_dir():self.assertEqual(stat.S_IMODE(p.stat().st_mode),0o700)
    def test_duplicate_manifest_path_refused(self):
        self.value['files'].append(self.value['files'][0]);self.value['fileCount']+=1;self.refresh()
        with self.assertRaises(Refused):self.prepare()
    def test_source_bytes_mismatch_refused(self):
        p=self.seed/SPEC;p.chmod(0o600);p.write_bytes(b'changed');p.chmod(0o400)
        with self.assertRaises(Refused):self.prepare()
    def test_source_symlink_refused(self):
        p=self.seed/SPEC;p.unlink();p.symlink_to(self.seed/'tests/Broker.NativeProof/package.json')
        with self.assertRaises(Refused):self.prepare()
    def test_existing_output_preserved(self):
        p=self.attempt/'browser/execution-capsule';p.mkdir();(p/'existing').write_bytes(b'preserved')
        with self.assertRaises(Refused):self.prepare()
        self.assertEqual((p/'existing').read_bytes(),b'preserved')
    def test_output_symlink_refused(self):
        (self.attempt/'browser/execution-capsule').symlink_to(self.seed)
        with self.assertRaises(Refused):self.prepare()
    def test_attempt_escape_refused(self):
        self.config['roots']['attemptRoot']=str(self.base/'other')
        with self.assertRaises(Refused):self.prepare()
    def test_spec_pin_mismatch_refused(self):
        self.config['artifacts']['captureSource']['sha256']='f'*64
        with self.assertRaises(Refused):self.prepare()
    def test_argv_output_escape_refused(self):
        self.config['commands']['browser'][2]=str(self.base/'outside')
        with self.assertRaises(Refused):self.prepare()
    def test_post_copy_mutation_refused(self):
        _,r=self.prepare();p=pathlib.Path(r['actualCaptureSource']['path']);p.chmod(0o600);p.write_bytes(b'changed')
        with self.assertRaises(Refused):verify_capture_capsule(self.config,self.attempt,r)
    def test_codec_stage_is_owned_output_and_final_baseline_restored(self):
        _,r=self.prepare();p=pathlib.Path(r['executionRoot'])/'tests/Broker.NativeProof/node_modules/.barc-tactical-codec-test';p.mkdir(mode=0o700,parents=True);(p/'codec.js').write_bytes(b'owned temporary bytes');self.assertFalse((self.seed/'tests/Broker.NativeProof/node_modules').exists());shutil.rmtree(p);self.assertEqual(verify_capture_capsule(self.config,self.attempt,r),3)
    def test_handoff_digest_and_copy_join(self):
        _,r=self.prepare();p=self.attempt/'selected-stock-smoke-handoff.json';p.write_bytes(b'{"source":"no authority control"}');p.chmod(0o600);bind_capture_handoff(self.config,self.attempt,r,{'path':str(p),'sha256':sha(p)});v=json.loads((self.attempt/'capture-capsule-handoff.json').read_text());self.assertEqual(v['configSha256'],'a'*64);self.assertEqual(v['handoffSha256'],sha(p));self.assertFalse(v['nativeAcceptance'])

if __name__=='__main__':unittest.main()
