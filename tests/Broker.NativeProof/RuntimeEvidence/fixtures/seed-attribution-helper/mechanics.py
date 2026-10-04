"""INERT unless a separately reviewed exact root admission is supplied. Linux only."""
import argparse,base64,ctypes,datetime,hashlib,importlib.util,json,os,pathlib,selectors,signal,stat,struct,subprocess,sys,tarfile,time,zipfile
HERE=pathlib.Path(__file__).resolve().parent
class Refused(RuntimeError):pass
class CustodyRefused(Refused):
 def __init__(self,message,observation):super().__init__(message);self.observation=observation
class CleanupUnknown(Refused):pass
class Deadline(Refused):pass

def need(ok,message):
 if not ok:raise Refused(message)
def digest(path):
 h=hashlib.sha256()
 with open(path,'rb') as f:
  for b in iter(lambda:f.read(65536),b''):h.update(b)
 return h.hexdigest()
def load(path):
 p=pathlib.Path(path);need(p.is_file() and not p.is_symlink() and p.stat().st_size<=16*1024*1024,'closed JSON input')
 def unique(pairs):
  d={}
  for k,v in pairs:need(k not in d,'duplicate key');d[k]=v
  return d
 return json.loads(p.read_text(),object_pairs_hook=unique)
def physical(path):
 p=pathlib.Path(path);need(not p.is_symlink(),'physical input symlink');s=p.stat();need(stat.S_ISREG(s.st_mode),'regular input required');return {'path':str(p),'sha256':digest(p),'bytes':s.st_size,'device':s.st_dev,'inode':s.st_ino,'uid':s.st_uid,'mode':stat.S_IMODE(s.st_mode),'nlink':s.st_nlink}
def checked_pin(pin):
 p=pathlib.Path(pin['path'])
 if 'symlinkCustody' in pin:
  expected=pin['symlinkCustody'];st=p.lstat();need(stat.S_ISLNK(st.st_mode) and os.readlink(p)==expected['linkText'] and str(p.resolve())==expected['resolvedPath'] and st.st_dev==expected['device'] and st.st_ino==expected['inode'] and st.st_uid==expected['uid'] and st.st_nlink==expected['nlink'],'closed SDK symlink binding drift');now=physical(expected['resolvedPath']);now['effectiveOriginalPath']=pin['path']
 else:now=physical(p)
 need(all(now[k]==pin[k] for k in ['sha256','bytes','device','inode','uid','mode','nlink']),'original input byte or custody drift');return now
def clock():return time.monotonic()
def remaining(deadline,cap,reserve=0,now=None):
 left=deadline-(clock() if now is None else now)-reserve
 if left<=0:raise Deadline('finite deadline exhausted')
 return min(cap,left)
def write_new(path,value):
 p=pathlib.Path(path);raw=(json.dumps(value,sort_keys=True,separators=(',',':'))+'\n').encode();need(len(raw)<=16*1024*1024,'receipt bound')
 fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 with os.fdopen(fd,'wb') as f:f.write(raw);f.flush();os.fsync(f.fileno())
def identity(pid):
 p=pathlib.Path('/proc')/str(pid);uid=p.stat().st_uid;raw=(p/'stat').read_text();v=raw.rsplit(') ',1)[1].split();return {'pid':pid,'ppid':int(v[1]),'pgid':int(v[2]),'session':int(v[3]),'startTicks':int(v[19]),'uid':uid,'state':v[0]}
def same(a,b):return all(k in a and k in b and a[k]==b[k] for k in ['pid','startTicks','uid','session'])

class LinuxOwner:
 def __init__(self,limit=128):
  need(hasattr(os,'pidfd_open') and hasattr(signal,'pidfd_send_signal'),'pidfd cleanup unsupported')
  if ctypes.CDLL(None,use_errno=True).prctl(36,1,0,0,0)!=0:raise CleanupUnknown('subreaper unavailable')
  self.anchor=identity(os.getpid());self.records={};self.handles={};self.limit=limit;self.uncertain=False;self.leaders=set()
 def acquire(self,ident):
  need(ident['uid']==self.anchor['uid'] and ident['pid']!=self.anchor['pid'],'foreign owner')
  need(len(self.records)<self.limit,'owned descendant bound')
  fd=os.pidfd_open(ident['pid'],0)
  try:need(same(ident,identity(ident['pid'])),'owned identity changed during pidfd acquisition')
  except BaseException:os.close(fd);raise
  self.records[ident['pid']]=ident;self.handles[ident['pid']]=fd
 def observe(self):
  snap={}
  for q in pathlib.Path('/proc').iterdir():
   if not q.name.isdigit():continue
   try:
    if q.stat().st_uid==self.anchor['uid']:snap[int(q.name)]=identity(int(q.name))
   except (FileNotFoundError,ProcessLookupError):continue
   except (PermissionError,OSError,ValueError):self.uncertain=True
  need(same(self.anchor,snap.get(self.anchor['pid'],{})),'cleanup anchor drift')
  owned={self.anchor['pid']}|{p for p,x in self.records.items() if p in snap and same(x,snap[p])}
  changed=True
  while changed:
   changed=False
   for p,x in snap.items():
    if p not in owned and x['ppid'] in owned:owned.add(p);changed=True
  for p in owned-{self.anchor['pid']}:
   x=snap[p]
   if p in self.records:
    if not same(x,self.records[p]):self.uncertain=True;raise CleanupUnknown('owned identity conflict')
   else:
    try:self.acquire(x)
    except (OSError,Refused):self.uncertain=True;raise CleanupUnknown('descendant identity unavailable')
  self.reap()
  live=[]
  for p,x in self.records.items():
   if p in snap:
    if not same(x,snap[p]):self.uncertain=True;raise CleanupUnknown('retained PID reused')
    if snap[p]['state']!='Z':live.append(x)
  if self.uncertain:raise CleanupUnknown('owned membership Unknown')
  return live
 def send(self,x,sig):
  try:
   current=identity(x['pid']);need(same(current,x),'refuse foreign signal');signal.pidfd_send_signal(self.handles[x['pid']],sig,None,0)
  except (FileNotFoundError,ProcessLookupError):return
  except (OSError,Refused):self.uncertain=True;raise CleanupUnknown('owned signal Unknown')
 def reap(self):
  # Popen alone reaps its leader and retains its actual exit status; adopted descendants are separate.
  for pid in list(self.records):
   if pid in self.leaders:continue
   try:os.waitpid(pid,os.WNOHANG)
   except ChildProcessError:pass
 def close(self):
  for fd in self.handles.values():os.close(fd)
  self.handles.clear()

def held_live(owner,errors):
 live=[]
 for pid,x in list(owner.records.items()):
  try:
   current=identity(pid)
   if not same(x,current):errors.add('held PID identity drift');continue
   if current['state']!='Z':live.append(x)
  except (FileNotFoundError,ProcessLookupError):pass
  except BaseException as e:errors.add('held identity Unknown:'+type(e).__name__)
 return live

def settle(owner,deadline,now=clock,sleep=time.sleep):
 counts={'TERM':0,'KILL':0};errors=set()
 for sig,label,seconds in [(signal.SIGTERM,'TERM',3),(signal.SIGKILL,'KILL',3)]:
  phase_end=min(deadline,now()+seconds);signalled=set()
  while True:
   try:owner.observe()
   except BaseException as e:errors.add('discovery Unknown:'+type(e).__name__+':'+str(e))
   live=held_live(owner,errors)
   for x in live:
    key=(x['pid'],x['startTicks'])
    if key not in signalled:
     try:owner.send(x,sig);counts[label]+=1;signalled.add(key)
     except BaseException as e:errors.add('held signal Unknown:'+type(e).__name__+':'+str(e))
   try:owner.reap()
   except BaseException as e:errors.add('held reap Unknown:'+type(e).__name__)
   if not held_live(owner,errors):break
   if now()>=phase_end:break
   sleep(min(.02,max(0,phase_end-now())))
  if not held_live(owner,errors):break
 # Discovery errors survive even if every held PID settled. Never signal unseen IDs.
 remaining_held=held_live(owner,errors)
 if remaining_held:errors.add('held processes remain after finite cleanup')
 return {'status':'Unknown'if errors else 'settled','signals':counts,'ownedLive':len(remaining_held),'remainingHeld':remaining_held,'errors':sorted(errors),'discoveryComplete':not bool(errors),'heldIdentities':list(owner.records.values())}

def custody_observation(path,root,reason,phase,known_owned,live_owned,lstat=None,error=None):
 p=pathlib.Path(path);observation={'schema':'bar.stage-custody-refusal/v1','reason':reason,'absolutePath':str(p),'relativePath':str(p.relative_to(root)),'phase':phase,'observerIdentity':identity(os.getpid()),'knownOwnedProcessIdentities':known_owned,'observedLiveOwnedProcessIdentities':live_owned,'processCausedObjectClaim':False,'observedMonotonicSeconds':clock()}
 if lstat is None:observation['lstat']={'status':'Unknown','errorType':type(error).__name__,'errno':getattr(error,'errno',None)}
 else:
  kind=stat.S_IFMT(lstat.st_mode);types={stat.S_IFREG:'regular',stat.S_IFDIR:'directory',stat.S_IFLNK:'symlink',stat.S_IFSOCK:'socket',stat.S_IFIFO:'fifo',stat.S_IFCHR:'character-device',stat.S_IFBLK:'block-device'}
  observation['lstat']={'status':'Observed','type':types.get(kind,'unknown'),'typeBits':kind,'mode':stat.S_IMODE(lstat.st_mode),'rawMode':lstat.st_mode,'device':lstat.st_dev,'inode':lstat.st_ino,'uid':lstat.st_uid,'gid':lstat.st_gid,'nlink':lstat.st_nlink,'bytes':lstat.st_size,'mtimeNs':lstat.st_mtime_ns,'ctimeNs':lstat.st_ctime_ns}
 return observation

def quota(root,maximum,phase=None,known_owned=(),live_owned=(),runtime_socket=None):
 total=0;files=0
 for base,dirs,names in os.walk(root,followlinks=False):
  for name in dirs+names:
   p=pathlib.Path(base)/name
   try:st=p.lstat()
   except OSError as e:raise CustodyRefused('stage lstat unavailable',custody_observation(p,root,'stage lstat unavailable',phase,known_owned,live_owned,error=e)) from e
   reason=None
   if name in dirs:
    if stat.S_ISLNK(st.st_mode):reason='stage symlink directory'
   elif stat.S_ISSOCK(st.st_mode)and runtime_socket is not None:
    runtime_socket.inspect_for_quota(p)
   elif not (stat.S_ISREG(st.st_mode) and st.st_uid==os.geteuid() and st.st_nlink==1):reason='stage file custody'
   if reason:raise CustodyRefused(reason,custody_observation(p,root,reason,phase,known_owned,live_owned,lstat=st))
   if name in names:files+=1;total+=st.st_size;need(files<=1024 and total<=maximum,'stage output census bound')
 return {'files':files,'bytes':total}
def census(root,runtime_socket=None):
 result=[]
 if pathlib.Path(root).exists():
  for p in sorted(pathlib.Path(root).rglob('*')):
   s=p.lstat()
   if stat.S_ISSOCK(s.st_mode):need(runtime_socket is not None,'unknown census socket');result.append(runtime_socket.inspect_for_quota(p))
   elif p.is_file():need(not p.is_symlink(),'census symlink');result.append(physical(p))
 return result

