"""Portable file-custody controls; no policy/compiler/process effects."""
import unittest,tempfile,pathlib,os,hashlib,stat
from unittest.mock import patch
import private_io as p
class ImmutableClosure(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.root=pathlib.Path(self.tmp.name);self.file=self.root/'closure.json';self.file.write_bytes(b'{"canonical":"controlled"}\n');self.file.chmod(0o400);self.root.chmod(0o500)
  s=self.file.stat();self.pin=dict(path=str(self.file),sha256=hashlib.sha256(self.file.read_bytes()).hexdigest(),bytes=s.st_size,device=s.st_dev,inode=s.st_ino,uid=s.st_uid,mode=stat.S_IMODE(s.st_mode),nlink=s.st_nlink)
 def tearDown(self):self.root.chmod(0o700);self.tmp.cleanup()
 def read(self,pin=None):return p.read_immutable_closure(str(self.file),self.pin['sha256'],self.pin if pin is None else pin)
 def refused(self,fn):
  with self.assertRaises(p.Refused):fn()
 def test_exact_prior_pin_readonly(self):self.assertEqual(self.read(),b'{"canonical":"controlled"}\n')
 def test_parent_must_be_immutable(self):self.root.chmod(0o700);self.refused(self.read)
 def test_file_must_be_immutable(self):self.file.chmod(0o600);self.refused(self.read)
 def test_full_pin_required(self):self.refused(lambda:self.read({'path':str(self.file)}))
 def test_inode_drift(self):self.refused(lambda:self.read(dict(self.pin,inode=self.pin['inode']+1)))
 def test_uid_drift(self):self.refused(lambda:self.read(dict(self.pin,uid=self.pin['uid']+1)))
 def test_byte_drift(self):self.file.chmod(0o600);self.file.write_bytes(b'X'*self.pin['bytes']);self.file.chmod(0o400);self.refused(self.read)
 def test_link_refuses(self):self.root.chmod(0o700);os.link(self.file,self.root/'alias');self.root.chmod(0o500);self.refused(self.read)
 def test_symlink_refuses(self):self.root.chmod(0o700);self.file.rename(self.root/'real');self.file.symlink_to(self.root/'real');self.root.chmod(0o500);self.refused(self.read)
 def test_generic_private_reader_unchanged(self):self.refused(lambda:p.read_bytes(str(self.file)))
if __name__=='__main__':unittest.main()
