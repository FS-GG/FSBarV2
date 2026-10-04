"""Real libc FILE controls for the selected Recoil FileSink protocol."""
import ctypes, hashlib, json, pathlib, tempfile, unittest

libc=ctypes.CDLL(None)
libc.fopen.argtypes=[ctypes.c_char_p,ctypes.c_char_p];libc.fopen.restype=ctypes.c_void_p
libc.setvbuf.argtypes=[ctypes.c_void_p,ctypes.c_void_p,ctypes.c_int,ctypes.c_size_t]
libc.fprintf.restype=ctypes.c_int
libc.fflush.argtypes=[ctypes.c_void_p];libc.fclose.argtypes=[ctypes.c_void_p]

class FileFlush(unittest.TestCase):
    def write(self,stream,record,flush):
        self.assertGreater(libc.fprintf(ctypes.c_void_p(stream),b'%s%s\n',b'[t=00:00:00.000000][f=0000000] ',record),0)
        if flush:self.assertEqual(libc.fflush(stream),0)
    def test_buffered_full_record_can_expose_incomplete_tail(self):
        with tempfile.TemporaryDirectory() as td:
            p=pathlib.Path(td)/'infolog.txt';stream=libc.fopen(str(p).encode(),b'wb');buffer=ctypes.create_string_buffer(8192)
            try:
                self.assertEqual(libc.setvbuf(stream,buffer,0,8192),0)
                self.write(stream,b'a'*8100,False);self.write(stream,b'Skirmish AI full record '+b'b'*300,False)
                before=p.read_bytes();self.assertEqual(len(before),8192);self.assertFalse(before.endswith(b'\n'))
                self.assertEqual(libc.fflush(stream),0);after=p.read_bytes();self.assertTrue(after.startswith(before));self.assertTrue(after.endswith(b'\n'))
                self.assertGreater(len(after),len(before))
            finally:libc.fclose(stream)
    def test_official_all_level_flush_publishes_complete_records(self):
        with tempfile.TemporaryDirectory() as td:
            p=pathlib.Path(td)/'infolog.txt';stream=libc.fopen(str(p).encode(),b'wb');buffer=ctypes.create_string_buffer(8192)
            try:
                self.assertEqual(libc.setvbuf(stream,buffer,0,8192),0)
                previous=b''
                for level in [20,30,35,40,50]:
                    self.write(stream,b'record-'+str(level).encode()+b'x'*300,level>=0)
                    current=p.read_bytes();self.assertTrue(current.startswith(previous));self.assertTrue(current.endswith(b'\n'));self.assertGreater(len(current),len(previous));previous=current
            finally:libc.fclose(stream)
    def test_error_default_does_not_flush_info_but_error_flushes(self):
        with tempfile.TemporaryDirectory() as td:
            p=pathlib.Path(td)/'infolog.txt';stream=libc.fopen(str(p).encode(),b'wb');buffer=ctypes.create_string_buffer(8192)
            try:
                self.assertEqual(libc.setvbuf(stream,buffer,0,8192),0)
                self.write(stream,b'info',30>=50);self.assertEqual(p.read_bytes(),b'')
                self.write(stream,b'error',50>=50);self.assertTrue(p.read_bytes().endswith(b'error\n'))
            finally:libc.fclose(stream)

if __name__=='__main__':unittest.main()
