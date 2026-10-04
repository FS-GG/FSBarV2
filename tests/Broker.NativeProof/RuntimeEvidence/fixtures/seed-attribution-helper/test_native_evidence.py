"""Controlled bytes/process mocks only. Not native evidence."""
import unittest,time,os,pathlib,tempfile,json
import native_evidence as n
import qualify_prearm as q
class Evidence(unittest.TestCase):
 def test_observation_closed_and_unsynced_identity(self):
  line=b'prefix BARC_PREARM_V1 kind=ai nonce=controlled frame=1 team=0 id=0 name=78 host=0 short=68696768426172 version=31 options=-\n'
  row=n.observations(line,'controlled')[0];self.assertEqual(n.text(row['short']),'highBar');self.assertEqual(n.text(row['options']),'')
  for body in [line.replace(b'nonce=controlled',b'nonce=foreign'),line.replace(b' id=0',b' id=0 id=0'),line+b'BARC_PREARM_V1 kind=refused nonce=controlled frame=1 reason=vfs\n',line.replace(b' options=-',b' options=- passed=true')]:
   with self.assertRaises(q.Refused):n.observations(body,'controlled')
 def test_prefix_append_is_not_completion(self):
  with tempfile.TemporaryDirectory()as d:
   p=pathlib.Path(d)/'live';body=b'{"sequence":"1"}\n';p.write_bytes(body);p.chmod(0o600);s=p.stat();pin={'path':str(p),'sha256':q.sha(body),'bytes':len(body),'device':s.st_dev,'inode':s.st_ino,'uid':s.st_uid,'mode':0o600,'nlink':1}
   with p.open('ab')as f:f.write(b'{"sequence":"2"}\n')
   self.assertEqual(q.prefix_bytes(pin,1024,time.monotonic()+1),body)
   with self.assertRaises(q.Refused):q.held_bytes(pin,1024,time.monotonic()+1)
   p.write_bytes(body[:-1]);
   with self.assertRaises(q.Refused):q.prefix_bytes(pin,1024,time.monotonic()+1)
   p.write_bytes(body.replace(b'1',b'3'))
   with self.assertRaises(q.Refused):q.prefix_bytes(pin,1024,time.monotonic()+1)
   p.unlink();p.write_bytes(body)
   with self.assertRaises(q.Refused):q.prefix_bytes(pin,1024,time.monotonic()+1)
 def test_policy_is_distinct_and_mandatory(self):
  with self.assertRaises(q.Refused):n.infolog({'canonicalReceipt':'fabricated'}, {},time.monotonic()+1)
  with self.assertRaises(q.Refused):n.horizons({'schema':'bar.root-accepted-complete-record-horizons/v1'}, {},{},time.monotonic()+1)
 def test_schema_does_not_assert_open_lua_files(self):
  with self.assertRaises(q.Refused):n.configuration({'schema':'bar.root-accepted-loaded-configuration-custody/v1'}, {},time.monotonic()+1)
if __name__=='__main__':unittest.main()
