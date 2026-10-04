import io,os,pathlib,unittest
from unittest.mock import patch
from runtime_identity import proc_bytes
from private_io import Refused

class Chunked(io.BytesIO):
    def read(self,n=-1):return super().read(min(n,7))

class ProcBytes(unittest.TestCase):
    def test_actual_proc_maps_reads_to_eof(self):
        expected=pathlib.Path('/proc/self/maps').read_bytes();actual=proc_bytes(os.getpid(),'maps',4*1024*1024)
        # Address mappings are read twice; assert full stable path census, not addresses.
        paths=lambda b:{l.split(None,5)[5] for l in b.splitlines() if len(l.split(None,5))==6}
        self.assertEqual(paths(actual),paths(expected));self.assertIn(b'libc.so.',actual);self.assertGreater(len(actual),4096)
    def test_short_reads_continue_to_eof(self):
        data=b'x'*100
        with patch('builtins.open',return_value=Chunked(data)):self.assertEqual(proc_bytes(os.getpid(),'maps',100),data)
    def test_maximum_plus_one_refused_after_short_reads(self):
        with patch('builtins.open',return_value=Chunked(b'x'*101)):
            with self.assertRaises(Refused):proc_bytes(os.getpid(),'maps',100)
    def test_empty_proc_file(self):
        with patch('builtins.open',return_value=Chunked(b'')):self.assertEqual(proc_bytes(os.getpid(),'maps',100),b'')
    def test_nonpositive_bound_refused(self):
        with self.assertRaises(Refused):proc_bytes(os.getpid(),'maps',0)

if __name__=='__main__':unittest.main()
