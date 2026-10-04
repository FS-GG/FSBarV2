"""Actual /proc/self executable maps and tempfile receipt controls; no native launch."""
import hashlib,json,os,pathlib,sys,tempfile,unittest
from loaded_custody import persist_loaded_custody
from runtime_identity import start_ticks
from private_io import Refused

def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()

class LoadedCustody(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.root=pathlib.Path(self.tmp.name);self.root.chmod(0o700)
        raw=pathlib.Path('/proc/self/maps').read_text();paths=set()
        for line in raw.splitlines():
            f=line.split(None,5)
            if len(f)==6 and 'x' in f[1] and f[5].startswith('/'):paths.add(os.path.realpath(f[5]))
        self.engine=os.path.realpath('/proc/self/exe');self.plugin=next(p for p in paths if '/libc.so.' in p)
        self.value={'resolvedElfClosure':[{'resolvedPath':p,'sha256':sha(p)} for p in sorted(paths)],'binaries':[]};self.closure=self.root/'closure.json';self.save()
        self.config={'source':{'fixture':'actual-proc-self'},'roots':{'attemptRoot':str(self.root)},'artifacts':{'runtimeClosure':{'path':str(self.closure),'sha256':sha(self.closure)},'engine':{'path':self.engine,'sha256':sha(self.engine)},'plugin':{'path':self.plugin,'sha256':sha(self.plugin)}}}
        self.process={'pid':os.getpid(),'startTicks':start_ticks(os.getpid()),'uid':os.geteuid()}
    def save(self):self.closure.write_text(json.dumps(self.value));self.closure.chmod(0o600)
    def tearDown(self):self.tmp.cleanup()
    def test_actual_loaded_census_persisted(self):
        r=persist_loaded_custody(self.process,self.config,self.root,"a"*64)
        self.assertGreater(r['executableMapCount'],1);self.assertFalse(r['nativeAcceptance']);self.assertEqual(r['required']['plugin']['path'],self.plugin)
        stored=json.loads((self.root/'runtime-closure-custody.json').read_text());self.assertEqual(stored,r);self.assertEqual((self.root/'runtime-closure-custody.json').stat().st_mode&511,0o600)
    def test_unloaded_plugin_refused(self):
        p=self.root/'not-loaded.so';p.write_bytes(b'not a mapped plugin');self.config['artifacts']['plugin']={'path':str(p),'sha256':sha(p)}
        with self.assertRaises(Refused):persist_loaded_custody(self.process,self.config,self.root,"a"*64)
        self.assertFalse((self.root/'runtime-closure-custody.json').exists())
    def test_existing_receipt_not_overwritten(self):
        p=self.root/'runtime-closure-custody.json';p.write_bytes(b'preserved');p.chmod(0o600)
        with self.assertRaises((Refused,OSError)):persist_loaded_custody(self.process,self.config,self.root,"a"*64)
        self.assertEqual(p.read_bytes(),b'preserved')
    def test_unadmitted_actual_executable_map_refused(self):
        self.value['resolvedElfClosure']=[r for r in self.value['resolvedElfClosure'] if r['resolvedPath']!=self.plugin];self.save();self.config['artifacts']['runtimeClosure']['sha256']=sha(self.closure)
        with self.assertRaises(Refused):persist_loaded_custody(self.process,self.config,self.root,"a"*64)
        self.assertFalse((self.root/'runtime-closure-custody.json').exists())
    def test_wrong_process_generation_refused(self):
        self.process['startTicks']='1'
        with self.assertRaises(Refused):persist_loaded_custody(self.process,self.config,self.root,"a"*64)
        self.assertFalse((self.root/'runtime-closure-custody.json').exists())
    def test_required_digest_conflict_refused(self):
        self.config['artifacts']['plugin']['sha256']='0'*64
        with self.assertRaises(Refused):persist_loaded_custody(self.process,self.config,self.root,"a"*64)
        self.assertFalse((self.root/'runtime-closure-custody.json').exists())
    def test_attempt_escape_refused(self):
        self.config['roots']['attemptRoot']=str(self.root/'elsewhere')
        with self.assertRaises(Refused):persist_loaded_custody(self.process,self.config,self.root,"a"*64)
        self.assertFalse((self.root/'runtime-closure-custody.json').exists())

if __name__=='__main__':unittest.main()
