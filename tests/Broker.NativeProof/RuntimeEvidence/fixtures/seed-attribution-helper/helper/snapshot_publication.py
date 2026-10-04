"""Exclusive single-name private receipts; partial failed writes remain unaccepted."""
import os,stat,json,hashlib
from pathlib import Path
from private_io import components,canonical,need

def bytes_new(path,raw,maximum):
    path=canonical(str(path));components(str(path.parent));anchor=path.parent.stat()
    need(anchor.st_uid==os.geteuid() and stat.S_IMODE(anchor.st_mode)==0o700,'snapshot publication anchor')
    need(type(raw) is bytes and 0<=len(raw)<=maximum,'snapshot publication byte bound')
    fd=os.open(path,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW|os.O_CLOEXEC,0o600)
    try:
        os.fchmod(fd,0o600);before=os.fstat(fd)
        need(stat.S_ISREG(before.st_mode) and before.st_uid==os.geteuid() and before.st_nlink==1 and before.st_size==0,'snapshot initial custody')
        offset=0
        while offset<len(raw):
            written=os.write(fd,raw[offset:]);need(type(written) is int and 0<written<=len(raw)-offset,'snapshot full write');offset+=written
        os.fsync(fd);after=os.fstat(fd)
        need((before.st_dev,before.st_ino)==(after.st_dev,after.st_ino) and after.st_size==len(raw) and after.st_uid==os.geteuid() and stat.S_IMODE(after.st_mode)==0o600 and after.st_nlink==1,'snapshot completed custody')
    finally:os.close(fd)
    directory=os.open(path.parent,os.O_DIRECTORY|os.O_NOFOLLOW|os.O_CLOEXEC)
    try:os.fsync(directory)
    finally:os.close(directory)
    current=path.lstat()
    need((after.st_dev,after.st_ino,after.st_size,after.st_mtime_ns,after.st_ctime_ns,after.st_mode,after.st_uid,after.st_nlink)==(current.st_dev,current.st_ino,current.st_size,current.st_mtime_ns,current.st_ctime_ns,current.st_mode,current.st_uid,current.st_nlink),'snapshot acknowledgement custody')
    return {'path':str(path),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw),'device':after.st_dev,'inode':after.st_ino,'uid':after.st_uid,'mode':stat.S_IMODE(after.st_mode),'nlink':after.st_nlink,'mtimeNs':after.st_mtime_ns,'ctimeNs':after.st_ctime_ns,'fullWriteFsyncAcknowledged':True}

def json_new(path,value,maximum=16*1024*1024):
    raw=(json.dumps(value,sort_keys=True,separators=(',',':'),allow_nan=False)+'\n').encode()
    return bytes_new(path,raw,maximum)
