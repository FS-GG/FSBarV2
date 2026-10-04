"""One source-bound stock UDS. No connection/token/RPC or arbitrary special-file allowance."""
import os,pathlib,stat,time,json,sys
sys.path.insert(0,str(pathlib.Path(__file__).resolve().parent/"helper"))
import mechanics as m
from runtime_identity import proc_bytes
need=m.need
class RuntimeSocket:
 def __init__(self,contract,directory_pin,engine_identity):
  self.contract=contract;self.directory=pathlib.Path(contract['directory']);self.path=pathlib.Path(contract['socket']);self.engine_identity=engine_identity;self.pin=directory_pin;self.first=None;self.last=None;self.owner=None;self.pending=None
  need(set(contract)=={'directory','socket','role','aiId','mode'}and contract['role']=='engine'and contract['aiId']==0 and contract['mode']==0o700,'closed one engine UDS')
  need(self.path==self.directory/'highbar-0.sock'and len(os.fsencode(self.path))+1<108,'literal UDS expansion/no fallback')
  parent=self.directory
  while True:
   st=parent.lstat();need(stat.S_ISDIR(st.st_mode)and not stat.S_ISLNK(st.st_mode),'runtime directory ancestor type')
   if parent==parent.parent:break
   parent=parent.parent
  self.fd=os.open(self.directory,os.O_RDONLY|os.O_DIRECTORY|os.O_NOFOLLOW|os.O_CLOEXEC)
  try:self.directory_check()
  except BaseException:os.close(self.fd);raise
 def directory_check(self):
  held=os.fstat(self.fd);current=self.directory.lstat();need(stat.S_ISDIR(current.st_mode)and stat.S_IMODE(current.st_mode)==0o700 and current.st_uid==os.geteuid(),'private0700 runtime directory')
  for key in ['st_dev','st_ino','st_uid','st_mode']:need(getattr(held,key)==getattr(current,key),'held runtime directory replaced')
  need(held.st_dev==self.pin['device']and held.st_ino==self.pin['inode']and held.st_uid==self.pin['uid']and stat.S_IMODE(held.st_mode)==self.pin['mode'],'admitted runtime directory identity')
 def socket_stat(self):
  self.directory_check();s=os.stat('highbar-0.sock',dir_fd=self.fd,follow_symlinks=False);need(stat.S_ISSOCK(s.st_mode)and s.st_uid==os.geteuid()and s.st_nlink==1 and stat.S_IMODE(s.st_mode)==0o700,'typed socket mode/uid/type/link')
  row=dict(path=str(self.path),device=s.st_dev,inode=s.st_ino,uid=s.st_uid,mode=stat.S_IMODE(s.st_mode),nlink=s.st_nlink,bytes=s.st_size,kind='unix-socket',sha256=None)
  if self.first:need(all(row[k]==self.first[k]for k in ['path','device','inode','uid','mode','nlink']),'socket replacement')
  else:self.first=dict(row,firstObservedMonotonic=time.monotonic())
  self.last=dict(row,lastObservedMonotonic=time.monotonic());return row
 def observe(self,join=False):
  row=self.socket_stat();ident=self.engine_identity();need(ident is not None and ident['uid']==os.geteuid()and m.same(ident,m.identity(ident['pid'])),'live actual engine generation for socket')
  if join:
   raw=proc_bytes(ident['pid'],'net/unix',4194304);need(len(raw)<=4194304,'net/unix bound');matches=[]
   for line in raw.decode('ascii').splitlines()[1:]:
    fields=line.split(maxsplit=7)
    if len(fields)==8 and fields[7]==str(self.path):
     need(fields[6].isdigit()and int(fields[6])>0 and fields[4]=='0001','literal Unix stream kernel row');matches.append(fields)
   need(len(matches)==1,'one exact pathname net/unix row');kernel=matches[0][6]
   names=os.listdir(f"/proc/{ident['pid']}/fd");need(len(names)<=256,'engine FD bound');fds=[]
   for name in names:
    need(name.isdigit(),'numeric engine FD')
    try:target=os.readlink(f"/proc/{ident['pid']}/fd/{name}")
    except FileNotFoundError:continue
    if target=='socket:['+kernel+']':fds.append(int(name))
   need(bool(fds),'actual engine held socket FD');need(m.same(ident,m.identity(ident['pid'])),'engine generation drift during socket join');self.socket_stat()
   self.owner=dict(schema='bar.typed-stock-runtime-socket/v1',filesystem=row,kernelSocketInode=kernel,engine=ident,engineFDs=sorted(fds),netUnixRawSHA256=m.hashlib.sha256(raw).hexdigest(),directory=self.pin,ownership='Observed',inodeDomains='kernel socket inode and filesystem dentry inode are distinct; never equated');self.pending=None
  return dict(row,ownership='Observed'if self.owner else 'Pending',firstObservedMonotonic=self.first['firstObservedMonotonic'],lastObservedMonotonic=self.last['lastObservedMonotonic'])
 def inspect_for_quota(self,path):
  need(pathlib.Path(path)==self.path,'only literal admitted socket path');row=self.observe(False)
  if not self.owner:
   try:self.observe(True)
   except BaseException as e:self.pending=type(e).__name__+':'+str(e)
  return dict(row,ownership='Observed'if self.owner else 'Pending',ownerJoinUnknown=self.pending)
 def cleanup(self,settled):
  self.directory_check()
  try:self.socket_stat()
  except FileNotFoundError:return dict(status='ObservedAbsent',removed=False,owner=self.owner,first=self.first,last=self.last)
  need(settled and self.owner is not None,'socket cleanup requires observed owner and settled engine generations');engine=self.owner['engine']
  try:current=m.identity(engine['pid'])
  except (FileNotFoundError,ProcessLookupError):current=None
  need(current is None,'engine numeric PID must be absent before leftover unlink');self.socket_stat();os.unlink('highbar-0.sock',dir_fd=self.fd)
  try:os.stat('highbar-0.sock',dir_fd=self.fd,follow_symlinks=False)
  except FileNotFoundError:return dict(status='ObservedAbsent',removed=True,owner=self.owner,first=self.first,last=self.last)
  raise m.CleanupUnknown('socket remains after exact held-FD unlink')
 def close(self):os.close(self.fd)
