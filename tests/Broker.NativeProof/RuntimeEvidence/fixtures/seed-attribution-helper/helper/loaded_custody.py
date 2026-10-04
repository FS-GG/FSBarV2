"""Persist an exact positive executable-map census before browser authority."""
import hashlib,os,time
from pathlib import Path
from private_io import SHA,atomic_new,components,hash_artifact,need,read_json
from growing_log import _source_set
from runtime_identity import proc_bytes,start_ticks,verify_executable_map_lines,verify_runtime_closure,mark_failure

def persist_loaded_custody(process,config,attempt,config_sha256):
    begin=time.monotonic_ns()
    try:
        need(isinstance(config_sha256,str) and SHA.fullmatch(config_sha256),'loaded configuration digest')
        attempt=components(str(attempt));need(str(attempt)==config['roots']['attemptRoot'],'loaded custody attempt escape')
        artifact=config['artifacts']['runtimeClosure'];value=read_json(artifact['path'],artifact['sha256'],4*1024*1024)
        allowed={}
        for item in value['resolvedElfClosure']:
            path=os.path.realpath(item['resolvedPath']);need(path==item['resolvedPath'],'loaded closure resolved path drift');need(path not in allowed or allowed[path]['sha256']==item['sha256'],'loaded duplicate digest conflict');allowed[path]=item
        for item in value['binaries']:
            path=os.path.realpath(item['path']);need(path not in allowed or allowed[path]['sha256']==item['sha256'],'loaded binary digest conflict');allowed[path]={'sha256':item['sha256']}
        first=verify_runtime_closure(process,artifact,attempt/'runtime-closure-diagnostic.json')
        raw=proc_bytes(process['pid'],'maps',4*1024*1024);lines=raw.decode().splitlines()
        seen=verify_executable_map_lines(lines,allowed,attempt/'runtime-closure-diagnostic.json')
        need(seen==first,'loaded executable census changed')
        required={}
        for role in ('engine','plugin'):
            item=config['artifacts'][role];path=str(components(item['path']));need(path in seen,'required loaded '+role+' absent');need(allowed[path]['sha256']==item['sha256'],'required loaded '+role+' digest conflict');hash_artifact(path,item['sha256'],268435456);required[role]={'path':path,'sha256':item['sha256']}
        need(os.path.realpath(os.readlink(f"/proc/{process['pid']}/exe"))==required['engine']['path'],'loaded actual engine mismatch')
        need(os.stat(f"/proc/{process['pid']}").st_uid==process['uid']==os.geteuid() and start_ticks(process['pid'])==process['startTicks'],'loaded final process identity')
        mappings=[]
        for line in lines:
            fields=line.split(None,5)
            if len(fields)==6 and 'x' in fields[1] and fields[5].startswith('/'):
                path=os.path.realpath(fields[5]);mappings.append({'path':path,'permissions':fields[1],'mappedDevice':fields[3],'mappedInode':fields[4],'sha256':allowed[path]['sha256']})
        receipt={'schema':'fsbar.barc-stock-loaded-custody/v1','status':'verified-snapshot','nativeAcceptance':False,'beforeBrowserEffect':True,'configSha256':config_sha256,'sourceSetSha256':_source_set(config),'process':dict(process),'runtimeClosureSha256':artifact['sha256'],'rawMapsSha256':hashlib.sha256(raw).hexdigest(),'mapsBytes':len(raw),'executableMapCount':len(mappings),'uniqueExecutableFiles':len(seen),'required':required,'mappings':mappings,'observationBeginMonotonicNs':begin,'observationEndMonotonicNs':time.monotonic_ns()}
        atomic_new(str(attempt/'runtime-closure-custody.json'),receipt)
        return receipt
    except BaseException as error:raise mark_failure(error,'runtime-positive-custody')
