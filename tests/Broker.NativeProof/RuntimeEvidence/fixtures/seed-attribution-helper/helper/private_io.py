"""Bounded nonsecret preparation inputs; no auth, home or environment discovery."""
import hashlib, json, os, re, stat
from pathlib import Path
SHA=re.compile(r'^[0-9a-f]{64}$')
class Refused(ValueError): pass
class Unavailable(Refused): pass
def need(ok,message):
    if not ok: raise Refused(message)
def canonical(path):
    need(isinstance(path,str) and path.startswith('/') and not path.startswith('//') and str(Path(path))==path and '..' not in Path(path).parts,'noncanonical path')
    return Path(path)
def components(path):
    path=canonical(path)
    for part in [path,*path.parents]:
        item=part.lstat();need(not stat.S_ISLNK(item.st_mode),'symlink component')
    return path

def read_bytes(path,maximum=1048576,private=True):
    path=components(path);before=path.lstat()
    need(stat.S_ISREG(before.st_mode),'nonregular input')
    need(before.st_uid==os.geteuid() if private else before.st_uid in (0,os.geteuid()),'input ownership')
    if private:
        anchor=path.parent.stat();need(anchor.st_uid==os.geteuid() and stat.S_IMODE(anchor.st_mode)==0o700,'private anchor')
        need(stat.S_IMODE(before.st_mode)==0o600,'private file mode')
    else: need(not before.st_mode&0o022,'writable public artifact')
    need(0<before.st_size<=maximum,'input byte bound')
    fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW|os.O_NONBLOCK|os.O_CLOEXEC)
    try:
        first=os.fstat(fd);need(stat.S_ISREG(first.st_mode) and (first.st_dev,first.st_ino,first.st_uid,first.st_mode)==(before.st_dev,before.st_ino,before.st_uid,before.st_mode),'input identity changed')
        chunks=[];length=0
        while length<=maximum:
            chunk=os.read(fd,min(65536,maximum+1-length))
            if not chunk: break
            chunks.append(chunk);length+=len(chunk)
        last=os.fstat(fd)
        need(length<=maximum and (first.st_size,first.st_mtime_ns,first.st_ctime_ns)==(last.st_size,last.st_mtime_ns,last.st_ctime_ns),'input changed or grew')
        return b''.join(chunks)
    finally: os.close(fd)
def digest(data): return hashlib.sha256(data).hexdigest()
def read_json(path,expected=None,maximum=1048576):
    data=read_bytes(path,maximum)
    if expected is not None: need(bool(SHA.fullmatch(expected)) and digest(data)==expected,'input hash mismatch')
    def unique(pairs):
        result={}
        for key,value in pairs:
            need(key not in result,'duplicate JSON key');result[key]=value
        return result
    return json.loads(data.decode('utf-8'),object_pairs_hook=unique,parse_constant=lambda _: (_ for _ in ()).throw(Refused('nonfinite JSON')))
def hash_artifact(path,expected,maximum=1073741824):
    path=components(path);before=path.stat()
    need(stat.S_ISREG(before.st_mode) and before.st_uid in (0,os.geteuid()) and not before.st_mode&0o022,'unsafe artifact')
    need(before.st_size<=maximum and bool(SHA.fullmatch(expected)),'artifact bound/pin')
    fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW|os.O_NONBLOCK|os.O_CLOEXEC)
    try:
        first=os.fstat(fd);need(stat.S_ISREG(first.st_mode) and (first.st_dev,first.st_ino)==(before.st_dev,before.st_ino),'artifact identity changed')
        h=hashlib.sha256();size=0
        while True:
            block=os.read(fd,65536)
            if not block: break
            size+=len(block);need(size<=maximum,'artifact grew');h.update(block)
        last=os.fstat(fd);need((first.st_size,first.st_mtime_ns,first.st_ctime_ns)==(last.st_size,last.st_mtime_ns,last.st_ctime_ns) and h.hexdigest()==expected,'artifact pin/change')
    finally: os.close(fd)
    return before

def atomic_new(path,value):
    path=canonical(path);components(str(path.parent));anchor=path.parent.stat()
    need(anchor.st_uid==os.geteuid() and stat.S_IMODE(anchor.st_mode)==0o700,'publication anchor')
    encoded=(json.dumps(value,separators=(',',':'),allow_nan=False)+'\n').encode();need(len(encoded)<=1048576,'publication bound')
    # CREATE_EXCL gives immutable publication and never overwrites a receipt.
    temporary=path.with_name(path.name+'.publication-'+os.urandom(8).hex())
    fd=os.open(temporary,os.O_CREAT|os.O_EXCL|os.O_WRONLY|os.O_NOFOLLOW|os.O_CLOEXEC,0o600)
    try:
        os.fchmod(fd,0o600);offset=0
        while offset<len(encoded): offset+=os.write(fd,encoded[offset:])
        os.fsync(fd)
    finally: os.close(fd)
    try:
        os.link(temporary,path,follow_symlinks=False)
        directory=os.open(path.parent,os.O_DIRECTORY|os.O_NOFOLLOW);os.fsync(directory);os.close(directory)
    finally: temporary.unlink()
    return digest(encoded)

def atomic_bytes_new(path,encoded,maximum):
    path=canonical(path);components(str(path.parent));anchor=path.parent.stat()
    need(anchor.st_uid==os.geteuid() and stat.S_IMODE(anchor.st_mode)==0o700,'publication anchor')
    need(isinstance(encoded,bytes) and 0<len(encoded)<=maximum,'publication byte bound')
    temporary=path.with_name(path.name+'.publication-'+os.urandom(8).hex())
    fd=os.open(temporary,os.O_CREAT|os.O_EXCL|os.O_WRONLY|os.O_NOFOLLOW|os.O_CLOEXEC,0o600)
    try:
        os.fchmod(fd,0o600);offset=0
        while offset<len(encoded):offset+=os.write(fd,encoded[offset:])
        os.fsync(fd)
    finally:os.close(fd)
    try:
        os.link(temporary,path,follow_symlinks=False)
        directory=os.open(path.parent,os.O_DIRECTORY|os.O_NOFOLLOW);os.fsync(directory);os.close(directory)
    finally:temporary.unlink()
    return digest(encoded)

def read_immutable_closure(path,expected_sha256,physical_pin,maximum=1048576):
    """Read the prior-bound canonical0400 closure under its immutable0500 root.
    This entry accepts only the full already-selected physical pin; no mode relaxation.
    """
    need(type(maximum)is int and 0<maximum<=1048576,'immutable closure read bound')
    fields={'path','sha256','bytes','device','inode','uid','mode','nlink'}
    need(type(physical_pin)is dict and set(physical_pin)==fields and physical_pin['path']==path and physical_pin['sha256']==expected_sha256 and SHA.fullmatch(expected_sha256 or ''),'full prior canonical closure pin')
    path=components(path);anchor=path.parent.lstat()
    need(stat.S_ISDIR(anchor.st_mode)and anchor.st_uid==os.geteuid()and stat.S_IMODE(anchor.st_mode)==0o500,'immutable closure anchor')
    before=path.lstat()
    need(stat.S_ISREG(before.st_mode)and before.st_uid==os.geteuid()and stat.S_IMODE(before.st_mode)==0o400 and before.st_nlink==1 and 0<before.st_size<=maximum,'immutable closure custody')
    def matches(info):
        return all(physical_pin[k]==v for k,v in {'bytes':info.st_size,'device':info.st_dev,'inode':info.st_ino,'uid':info.st_uid,'mode':stat.S_IMODE(info.st_mode),'nlink':info.st_nlink}.items())
    need(matches(before),'prior immutable closure physical identity')
    fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW|os.O_NONBLOCK|os.O_CLOEXEC)
    try:
        first=os.fstat(fd);need(matches(first),'opened immutable closure identity')
        chunks=[];length=0
        while length<=maximum:
            block=os.read(fd,min(65536,maximum+1-length))
            if not block:break
            chunks.append(block);length+=len(block)
        last=os.fstat(fd);after=path.lstat();parent=path.parent.lstat()
        attrs=('st_dev','st_ino','st_uid','st_mode','st_nlink','st_size','st_mtime_ns','st_ctime_ns')
        need(length==before.st_size and length<=maximum and all(getattr(before,k)==getattr(first,k)==getattr(last,k)==getattr(after,k)for k in attrs),'immutable closure changed during read')
        need(all(getattr(anchor,k)==getattr(parent,k)for k in ('st_dev','st_ino','st_uid','st_mode')),'immutable closure parent generation drift')
        raw=b''.join(chunks);need(digest(raw)==expected_sha256,'immutable closure byte pin');return raw
    finally:os.close(fd)
