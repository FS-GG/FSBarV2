"""Authenticate root-selected owned producer process without reading auth/env."""
import hashlib,os,re,stat
from pathlib import Path
from private_io import Refused,atomic_new,need,hash_artifact

class RuntimeClosureRefused(Refused):
    def __init__(self,code):
        self.code=code
        super().__init__(code)

def mark_failure(error,check,outcome=None,policy_observation=None):
    if not hasattr(error,'_barc_failure_observation'):
        if outcome is None:
            outcome=('os-unavailable' if isinstance(error,OSError) else 'refused' if isinstance(error,Refused) else 'malformed' if isinstance(error,(KeyError,TypeError,ValueError,UnicodeError)) else 'unexpected')
        error._barc_failure_observation={'check':check,'outcome':outcome,'policyObservation':policy_observation}
    return error

def proc_bytes(pid,name,maximum):
    # The only proc files read are nonsecret stat/maps/fdinfo, never environ/cmdline.
    need(type(maximum) is int and maximum>0,'proc positive byte bound')
    chunks=[];length=0
    with open(f'/proc/{pid}/{name}','rb',buffering=0) as stream:
        while length<=maximum:
            block=stream.read(min(65536,maximum+1-length))
            if not block:break
            chunks.append(block);length+=len(block)
    need(length<=maximum,'proc byte bound');return b''.join(chunks)

def start_ticks(pid):
    value=proc_bytes(pid,'stat',16384).decode();return value.rsplit(') ',1)[1].split()[19]
def verify_process(process,engine,plugin,producer_path=None):
    need(set(process)=={'pid','startTicks','uid'},'closed process identity')
    pid=process['pid'];need(type(pid) is int and pid>1 and process['uid']==os.geteuid(),'owned selected process')
    need(os.stat(f'/proc/{pid}').st_uid==os.geteuid() and start_ticks(pid)==process['startTicks'],'PID/start mismatch')
    need(os.readlink(f'/proc/{pid}/exe')==engine['path'],'runtime executable mismatch')
    actual_exe=os.stat(f'/proc/{pid}/exe');expected_exe=os.stat(engine['path'],follow_symlinks=False)
    need((actual_exe.st_dev,actual_exe.st_ino)==(expected_exe.st_dev,expected_exe.st_ino),'runtime executable inode mismatch')
    hash_artifact(engine['path'],engine['sha256']);info=hash_artifact(plugin['path'],plugin['sha256'])
    lines=proc_bytes(pid,'maps',1048576).decode().splitlines();matches=[]
    for line in lines:
        fields=line.split(None,5)
        if len(fields)==6 and fields[5]==plugin['path']:
            matches.append(fields)
    need(matches and all(int(fields[4])==info.st_ino and fields[3]==f'{os.major(info.st_dev):02x}:{os.minor(info.st_dev):02x}' for fields in matches),'mapped module inode mismatch')
    if producer_path is not None:
        target=os.stat(producer_path,follow_symlinks=False);names=os.listdir(f'/proc/{pid}/fd');need(len(names)<=256,'producer fd bound')
        found=False
        for name in names:
            try:
                current=os.stat(f'/proc/{pid}/fd/{name}')
                if (current.st_dev,current.st_ino)==(target.st_dev,target.st_ino):
                    info=proc_bytes(pid,f"fdinfo/{name}",4096).decode()
                    flags=re.search(r"^flags:\s+([0-7]+)$",info,re.MULTILINE)
                    if flags:
                        value=int(flags[1],8)
                        if value&os.O_ACCMODE==os.O_WRONLY and value&os.O_APPEND: found=True
            except FileNotFoundError: continue
        need(found,'actual producer open fd unavailable')
    need(start_ticks(pid)==process['startTicks'],'process changed during validation')
    return {'pid':pid,'startTicks':process['startTicks'],'engineSha256':engine['sha256'],'pluginSha256':plugin['sha256']}

def verify_capture_writer(expected,writer,node,source):
    need(set(expected)=={'pid','startTicks','uid'} and set(writer)=={'pid','startTicks','uid','executable','sourcePath','sourceSha256'},'closed capture writer identity')
    need({key:writer[key] for key in expected}==expected,'root-selected capture writer mismatch')
    pid=expected['pid'];need(type(pid) is int and pid>1 and expected['uid']==os.geteuid(),'owned capture writer')
    need(os.stat(f'/proc/{pid}').st_uid==os.geteuid() and start_ticks(pid)==expected['startTicks'],'capture PID/start mismatch')
    need(os.readlink(f'/proc/{pid}/exe')==node['path'] and writer['executable']==node['path'],'capture executable mismatch')
    hash_artifact(node['path'],node['sha256']);hash_artifact(source['path'],source['sha256'])
    need(writer['sourcePath']==source['path'] and writer['sourceSha256']==source['sha256'],'capture source mismatch')
    need(start_ticks(pid)==expected['startTicks'],'capture process changed during validation')
    return {'pid':pid,'startTicks':expected['startTicks'],'sourceSha256':source['sha256']}

def _observed_file(path,maximum=268435456):
    try:
        before=os.stat(path,follow_symlinks=False)
        if not stat.S_ISREG(before.st_mode) or before.st_size>maximum:return {'available':False,'reason':'nonregular-or-oversized'}
        fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW|os.O_NONBLOCK|os.O_CLOEXEC)
        try:
            first=os.fstat(fd);h=hashlib.sha256();size=0
            while True:
                block=os.read(fd,65536)
                if not block:break
                size+=len(block)
                if size>maximum:return {'available':False,'reason':'oversized'}
                h.update(block)
            last=os.fstat(fd)
            if (first.st_dev,first.st_ino,first.st_size,first.st_mtime_ns,first.st_ctime_ns)!=(last.st_dev,last.st_ino,last.st_size,last.st_mtime_ns,last.st_ctime_ns):return {'available':False,'reason':'changed-during-read'}
            return {'available':True,'device':first.st_dev,'inode':first.st_ino,'bytes':size,'sha256':h.hexdigest()}
        finally:os.close(fd)
    except OSError:return {'available':False,'reason':'unavailable'}

def _closure_refuse(code,diagnostic_path,fields,allowed_count,executable_count):
    document={'schema':'fsbar.barc-stock-runtime-map-diagnostic/v1','status':'refused','failureCode':code,'allowedCount':allowed_count,'executableMapCount':executable_count,'candidate':fields}
    if diagnostic_path is not None:
        try:atomic_new(str(diagnostic_path),document)
        except Exception:pass
    raise RuntimeClosureRefused(code)

def verify_executable_map_lines(lines,allowed,diagnostic_path=None):
    """Require every file-backed executable map to match one pinned path/inode."""
    seen=set();executable=[]
    for line in lines:
        fields=line.split(None,5)
        if len(fields)!=6 or 'x' not in fields[1] or not fields[5].startswith('/'):continue
        executable.append(fields)
    need(len(executable)<=512,'executable mapping count bound')
    for fields in executable:
        raw=fields[5];deleted=raw.endswith(' (deleted)');candidate_raw=raw[:-10] if deleted else raw
        path=os.path.realpath(candidate_raw);need(len(path.encode())<=4096,'executable mapping path bound')
        admitted=allowed.get(path);candidate={'path':path,'mappedDevice':fields[3],'mappedInode':fields[4],'deleted':deleted,'admitted':admitted is not None,'expectedSha256':None if admitted is None else admitted['sha256'],'observed':_observed_file(path)}
        if deleted:_closure_refuse('runtime-map-deleted',diagnostic_path,candidate,len(allowed),len(executable))
        if admitted is None:_closure_refuse('runtime-map-unadmitted',diagnostic_path,candidate,len(allowed),len(executable))
        try:info=os.stat(path,follow_symlinks=False)
        except OSError:_closure_refuse('runtime-map-missing',diagnostic_path,candidate,len(allowed),len(executable))
        if int(fields[4])!=info.st_ino or fields[3]!=f'{os.major(info.st_dev):02x}:{os.minor(info.st_dev):02x}':_closure_refuse('runtime-map-identity-drift',diagnostic_path,candidate,len(allowed),len(executable))
        try:hash_artifact(path,admitted['sha256'],268435456)
        except (Refused,OSError):_closure_refuse('runtime-map-content-drift',diagnostic_path,candidate,len(allowed),len(executable))
        seen.add(path)
    if not seen:_closure_refuse('runtime-map-none',diagnostic_path,{},len(allowed),len(executable))
    return seen

def verify_runtime_closure(process,libraries_artifact,diagnostic_path=None):
    try:
        need(set(process)=={'pid','startTicks','uid'},'closed runtime process identity')
        pid=process['pid'];need(os.stat(f'/proc/{pid}').st_uid==os.geteuid() and start_ticks(pid)==process['startTicks'],'runtime closure PID/start mismatch')
    except BaseException as error:raise mark_failure(error,'runtime-closure-process')
    try:
        from private_io import read_json
        value=read_json(libraries_artifact['path'],libraries_artifact['sha256'],4*1024*1024)
    except BaseException as error:raise mark_failure(error,'runtime-closure-input')
    try:
        allowed={}
        for item in value['resolvedElfClosure']:
            resolved=os.path.realpath(item['resolvedPath']);need(resolved==item['resolvedPath'],'closure resolved path drift');allowed[resolved]=item
        for item in value['binaries']:
            resolved=os.path.realpath(item['path']);allowed[resolved]={'sha256':item['sha256']}
    except BaseException as error:raise mark_failure(error,'runtime-closure-resolve')
    try:lines=proc_bytes(pid,'maps',4*1024*1024).decode().splitlines()
    except BaseException as error:raise mark_failure(error,'runtime-map-census')
    try:seen=verify_executable_map_lines(lines,allowed,diagnostic_path)
    except BaseException as error:raise mark_failure(error,'runtime-map-validation')
    try:
        if os.path.realpath(os.readlink(f'/proc/{pid}/exe')) not in seen:_closure_refuse('runtime-engine-map-missing',diagnostic_path,{},len(allowed),len(seen))
    except BaseException as error:raise mark_failure(error,'runtime-executable-map')
    try:
        if start_ticks(pid)!=process['startTicks']:_closure_refuse('runtime-process-identity-drift',diagnostic_path,{},len(allowed),len(seen))
    except BaseException as error:raise mark_failure(error,'runtime-final-generation')
    return seen

def acquire_data_root_evidence(log_path,process):
    """Acquire the held log descriptor; typed F# owns all root parsing and decisions."""
    from growing_log import GrowingLog
    try:
        need(set(process)=={'pid','startTicks','uid'},'closed runtime process identity')
        pid=process['pid'];need(os.stat(f'/proc/{pid}').st_uid==os.geteuid() and process['uid']==os.geteuid() and start_ticks(pid)==process['startTicks'],'data-root PID/start mismatch')
    except BaseException as error:raise mark_failure(error,'infolog-process')
    try:return GrowingLog.acquire(log_path,process)
    except BaseException as error:raise mark_failure(error,getattr(error,'_barc_failure_observation',{}).get('check','infolog-path'))
