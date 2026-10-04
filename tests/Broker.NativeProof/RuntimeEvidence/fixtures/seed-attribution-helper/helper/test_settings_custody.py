import hashlib,json,os,pathlib,stat,sys,tempfile,unittest,shutil
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent))
import settings_custody as m
class Controls(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.r=pathlib.Path(self.tmp.name);self.r.chmod(0o700);self.p=self.r/'packet';self.a=self.r/'attempt';self.p.mkdir(mode=0o700);self.a.mkdir(mode=0o700);(self.a/'engine').mkdir(mode=0o700);self.seed=self.p/'seed.cfg';self.seed.write_bytes(b'Fullscreen=0\n');self.seed.chmod(0o400);self.output=self.a/'engine/springsettings.cfg';self.c={'roots':{'packetRoot':str(self.p),'attemptRoot':str(self.a)},'commands':{'engine':['engine','--isolation','--isolation-dir',str(self.p),'--write-dir',str(self.a/'engine'),'--config',str(self.seed),'script']}};self.pin()
 def pin(self):
  s=self.seed.stat();row={'path':'seed.cfg','sha256':hashlib.sha256(self.seed.read_bytes()).hexdigest(),'bytes':s.st_size,'device':f'{os.major(s.st_dev)}:{os.minor(s.st_dev)}','inode':s.st_ino,'ownerUid':s.st_uid,'mode':f'{stat.S_IMODE(s.st_mode):04o}','links':s.st_nlink};raw=(json.dumps({'root':str(self.p),'files':[row],'fileCount':1})+'\n').encode();p=self.p/'packet-inventory.json';p.write_bytes(raw);p.chmod(0o600);self.c['packetSha256']=hashlib.sha256(raw).hexdigest()
 def tearDown(self):self.tmp.cleanup()
 def refused(self):
  with self.assertRaises((m.Refused,OSError)):m.prepare_engine_settings(self.c,self.a)
 def test_exact_copy_output_write_and_post_use_seed_preservation(self):
  argv,r=m.prepare_engine_settings(self.c,self.a);self.assertEqual(argv[7],str(self.output));self.assertEqual(self.seed.read_bytes(),self.output.read_bytes());self.output.write_bytes(b'Fullscreen=0\nWindowed=1\n');v=m.finish_engine_settings(self.c,self.a,r);self.assertTrue(v['packetUnchanged']);self.assertNotEqual(v['afterRunOutputSha256'],v['seedSha256'])
 def test_mismatched_seed(self):self.seed.chmod(0o600);self.seed.write_bytes(b'changed');self.seed.chmod(0o400);self.refused();self.assertFalse(self.output.exists())
 def test_existing_output(self):self.output.write_bytes(b'existing');self.refused();self.assertEqual(self.output.read_bytes(),b'existing')
 def test_output_symlink(self):self.output.symlink_to(self.seed);self.refused();self.assertTrue(self.output.is_symlink())
 def test_seed_symlink(self):alias=self.p/'alias.cfg';alias.symlink_to(self.seed);self.c['commands']['engine'][7]=str(alias);self.refused()
 def test_seed_escape(self):outside=self.r/'outside.cfg';outside.write_bytes(b'outside');outside.chmod(0o400);self.c['commands']['engine'][7]=str(outside);self.refused()
 def test_attempt_escape(self):self.c['roots']['attemptRoot']=str(self.r/'other');self.refused()
 def test_argv_difference(self):actual=list(self.c['commands']['engine']);actual[7]=str(self.output);actual[5]='different';self.assertRaises(m.Refused,m.validate_engine_argv,self.c['commands']['engine'],actual,self.a)
 def test_derived_path_escape(self):actual=list(self.c['commands']['engine']);actual[7]=str(self.r/'escape.cfg');self.assertRaises(m.Refused,m.validate_engine_argv,self.c['commands']['engine'],actual,self.a)
 def test_packet_change_post_use_refuses(self):argv,r=m.prepare_engine_settings(self.c,self.a);self.seed.chmod(0o600);self.seed.write_bytes(b'changed');self.seed.chmod(0o400);self.assertRaises(m.Refused,m.finish_engine_settings,self.c,self.a,r)
 def test_new_packet_file_post_use_refuses(self):argv,r=m.prepare_engine_settings(self.c,self.a);(self.p/'unexpected').write_bytes(b'x');self.assertRaises(m.Refused,m.finish_engine_settings,self.c,self.a,r)
 def test_duplicate_census_refuses(self):p=self.p/'packet-inventory.json';v=json.loads(p.read_text());v['files']*=2;v['fileCount']=2;raw=json.dumps(v).encode();p.write_bytes(raw);self.c['packetSha256']=hashlib.sha256(raw).hexdigest();self.refused()
 def test_hardlinked_seed_refuses(self):os.link(self.seed,self.p/'hardlink');self.refused()
if __name__=='__main__':unittest.main(verbosity=2)
