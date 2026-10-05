import hashlib,json,os,pathlib,stat,sys,tempfile,unittest,shutil
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent))
import settings_custody as m
from unittest.mock import patch
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

class ExternalControls(unittest.TestCase):
 setUp=Controls.setUp
 pin=Controls.pin
 tearDown=Controls.tearDown
 refused=Controls.refused
 def external(self):
  self.external_root=self.r/'external';self.external_root.mkdir(mode=0o700);self.external_file=self.external_root/'projection.json';(self.p/'packet-inventory.json').rename(self.external_file);self.external_file.chmod(0o400);self.p.chmod(0o500);self.repin()
 def repin(self):
  s=self.external_file.lstat();self.c['packetInventory']={'path':str(self.external_file),'sha256':hashlib.sha256(self.external_file.read_bytes()).hexdigest(),'bytes':s.st_size,'device':s.st_dev,'inode':s.st_ino,'uid':s.st_uid,'mode':stat.S_IMODE(s.st_mode),'nlink':s.st_nlink};self.c['packetSha256']=self.c['packetInventory']['sha256']
 def rewrite(self,value):
  self.external_file.chmod(0o600);self.external_file.write_text(json.dumps(value));self.external_file.chmod(0o400);self.repin()
 def test_exact_external_copy_and_post_use(self):
  self.external();argv,r=m.prepare_engine_settings(self.c,self.a);self.assertEqual(argv[7],str(self.output));self.assertEqual(self.output.read_bytes(),self.seed.read_bytes());self.assertEqual(m.finish_engine_settings(self.c,self.a,r)['packetFileCount'],1);self.assertFalse((self.p/'packet-inventory.json').exists())
 def test_external_mode0600(self):
  self.external();self.external_file.chmod(0o600);self.repin();self.assertEqual(m.inventory(self.c)[1]['fileCount'],1)
 def test_missing_external_no_legacy_fallback(self):
  self.external();self.p.chmod(0o700);self.external_file.rename(self.p/'packet-inventory.json');self.p.chmod(0o500);self.refused();self.assertFalse(self.output.exists())
 def test_digest_join(self):self.external();self.c['packetSha256']='0'*64;self.refused()
 def test_byte_digest(self):
  self.external();self.external_file.chmod(0o600);raw=self.external_file.read_bytes();self.external_file.write_bytes(raw.replace(b'seed.cfg',b'fake.cfg'));self.external_file.chmod(0o400);self.refused()
 def test_closed_pin(self):self.external();self.c['packetInventory']['unreviewed']=True;self.refused()
 def test_pin_types(self):self.external();self.c['packetInventory']['nlink']=True;self.refused()
 def test_pin_identity(self):self.external();self.c['packetInventory']['inode']+=1;self.refused()
 def test_root_join(self):self.external();value=json.loads(self.external_file.read_text());value['root']=str(self.r);self.rewrite(value);self.refused()
 def test_same_bytes_replaced_inode(self):
  self.external();old=self.external_file.with_name('retained');self.external_file.rename(old);self.external_file.write_bytes(old.read_bytes());self.external_file.chmod(0o400);self.refused()
 def test_alias(self):
  self.external();alias=self.r/'alias';alias.symlink_to(self.external_root);self.c['packetInventory']['path']=str(alias/'projection.json');self.refused()
 def test_hardlinked_inventory(self):self.external();os.link(self.external_file,self.r/'hardlink');self.refused()
 def test_inventory_inside_packet_refuses(self):
  self.external();self.p.chmod(0o700);self.external_file.rename(self.p/'projection.json');self.p.chmod(0o500);self.external_file=self.p/'projection.json';self.repin();self.refused()
 def test_writable_anchor(self):self.external();self.external_root.chmod(0o777);self.refused()
 def test_unlisted_inroot_inventory_not_exempt(self):
  self.external();argv,r=m.prepare_engine_settings(self.c,self.a);self.p.chmod(0o700);(self.p/'packet-inventory.json').write_bytes(b'unlisted');self.p.chmod(0o500);self.assertRaises(m.Refused,m.finish_engine_settings,self.c,self.a,r)
 def test_post_use_seed_drift(self):
  self.external();argv,r=m.prepare_engine_settings(self.c,self.a);self.seed.chmod(0o600);self.seed.write_bytes(b'changed');self.seed.chmod(0o400);self.assertRaises(m.Refused,m.finish_engine_settings,self.c,self.a,r)
 def test_path_replacement_during_read(self):
  self.external();read=os.read;changed=False
  def replace(fd,size):
   nonlocal changed
   raw=read(fd,size)
   if not changed:
    changed=True;old=self.external_file.with_name('retained');self.external_file.rename(old);self.external_file.write_bytes(old.read_bytes());self.external_file.chmod(0o400)
   return raw
  with patch.object(m.os,'read',replace):self.refused()
 def test_root_replacement_during_read(self):
  self.external();read=os.read;changed=False
  def replace(fd,size):
   nonlocal changed
   raw=read(fd,size)
   if not changed:changed=True;self.p.rename(self.r/'retained-packet');self.p.mkdir(mode=0o500)
   return raw
  with patch.object(m.os,'read',replace):self.refused()
 def test_external_packet_root0700_refuses(self):self.external();self.p.chmod(0o700);self.refused()
 def test_external_packet_root_shared_writable_refuses(self):self.external();self.p.chmod(0o777);self.refused()
 def test_root_replacement_before_external_read(self):
  self.external();components=m.components;changed=False
  def replace(path):
   nonlocal changed
   if path==str(self.external_file) and not changed:changed=True;self.p.rename(self.r/'retained-packet');self.p.mkdir(mode=0o500)
   return components(path)
  with patch.object(m,'components',replace):self.refused()
 def test_duplicate_external_json(self):
  self.external();self.external_file.chmod(0o600);self.external_file.write_text('{"root":"a","root":"b"}');self.external_file.chmod(0o400);self.repin();self.refused()
 def test_external_file_byte_bound(self):
  self.external();self.external_file.chmod(0o600)
  with self.external_file.open('r+b')as stream:stream.truncate(m.MAX_INVENTORY+1)
  self.external_file.chmod(0o400);self.c['packetInventory']['bytes']=m.MAX_INVENTORY+1;self.refused()
 def test_opened_identity_replacement(self):
  self.external();open_fd=os.open
  def replace(path,*args,**kwargs):
   if pathlib.Path(path)==self.external_file:
    old=self.external_file.with_name('retained');self.external_file.rename(old);self.external_file.write_bytes(old.read_bytes());self.external_file.chmod(0o400)
   return open_fd(path,*args,**kwargs)
  with patch.object(m.os,'open',replace):self.refused()
 def test_content_change_during_read(self):
  self.external();read=os.read;changed=False
  def replace(fd,size):
   nonlocal changed
   raw=read(fd,size)
   if not changed:
    changed=True;self.external_file.chmod(0o600);self.external_file.write_bytes(self.external_file.read_bytes().replace(b'seed.cfg',b'fake.cfg'));self.external_file.chmod(0o400)
   return raw
  with patch.object(m.os,'read',replace):self.refused()
 def test_parent_replacement_during_read(self):
  self.external();read=os.read;changed=False
  def replace(fd,size):
   nonlocal changed
   raw=read(fd,size)
   if not changed:
    changed=True;old=self.r/'retained-external';self.external_root.rename(old);self.external_root.mkdir(mode=0o700);(old/'projection.json').rename(self.external_file)
   return raw
  with patch.object(m.os,'read',replace):self.refused()
if __name__=='__main__':unittest.main(verbosity=2)
