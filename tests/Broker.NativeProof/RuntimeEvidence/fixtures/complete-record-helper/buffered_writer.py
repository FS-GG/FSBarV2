"""Public Recoil2639 FileSink-style libc full-buffered ordinary-file writer.
FileSink.cpp:123-130,214-223: fopen(w), setvbuf(_IOFBF,8192), fprintf newline.
No severity-triggered fflush, engine, content, or private inputs.
"""
import base64,ctypes,os,sys
ATLAS=(b'CTextureRenderAtlas::CreateAtlasTexture()[0] atlas=IconsAtlas_0 FBO::ready=1',b'CTextureRenderAtlas::CreateAtlasTexture()[1] atlas=IconsAtlas_0 atlasRendered=0')
ROOTS=(b'[DataDirLocater::Check] Using read-write data directory: /public/write/',b'[DataDirLocater::Check] Using read-only data directory: /public/data/',b'[DataDirLocater::Check] Isolation Mode!',b'[SpringApp::Init] Spring writeable configuration directory: /public/write/')
class BufferedWriter:
    def __init__(self,path):
        self.libc=ctypes.CDLL(None)
        self.libc.fopen.argtypes=(ctypes.c_char_p,ctypes.c_char_p);self.libc.fopen.restype=ctypes.c_void_p
        self.libc.setvbuf.argtypes=(ctypes.c_void_p,ctypes.c_void_p,ctypes.c_int,ctypes.c_size_t)
        self.libc.fprintf.argtypes=(ctypes.c_void_p,ctypes.c_char_p)
        self.libc.fflush.argtypes=(ctypes.c_void_p,);self.libc.fclose.argtypes=(ctypes.c_void_p,)
        self.stream=self.libc.fopen(os.fsencode(path),b'w');assert self.stream
        os.chmod(path,0o600)
        assert self.libc.setvbuf(self.stream,None,0,8192)==0 # Linux _IOFBF
        self.path=path;self.records=0
    def record(self,text):
        assert b'\x00' not in text and b'\n' not in text
        assert self.libc.fprintf(self.stream,b'%s\n',ctypes.c_char_p(text))>0
        self.records+=1
    def partial_eof(self):
        previous=os.stat(self.path).st_size
        for index in range(512): # <=64KiB public records per command
            self.record(ATLAS[self.records%2]);size=os.stat(self.path).st_size
            if size>previous:
                with open(self.path,'rb') as reader:reader.seek(-1,2);last=reader.read(1)
                if last!=b'\n':return size
                previous=size
        raise RuntimeError('no partial EOF in bounded public replay')
    def close(self):self.libc.fclose(self.stream)
def main():
    os.umask(0o077);writer=BufferedWriter(sys.argv[1])
    try:
        records=ROOTS if len(sys.argv)==2 else base64.b64decode(sys.argv[2]).splitlines()
        for record in records:writer.record(record)
        writer.partial_eof()
        if len(sys.argv)>2:assert writer.libc.fflush(writer.stream)==0
        print('ready',flush=True)
        for command in sys.stdin:
            command=command.strip()
            if command=='grow':writer.partial_eof()
            elif command=='growflush':
                writer.partial_eof();assert writer.libc.fflush(writer.stream)==0
            elif command=='flush':assert writer.libc.fflush(writer.stream)==0
            elif command=='close':break
            else:raise RuntimeError('closed writer command')
            print('done',flush=True)
    finally:writer.close()
if __name__=='__main__':main()
