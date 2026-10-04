"""Exact immutable capture inputs copied to the fresh owned execution capsule."""
import copy,hashlib,math,os,stat,time
from pathlib import Path
from private_io import SHA,atomic_bytes_new,atomic_new,canonical,components,hash_artifact,need,read_bytes,read_json
from settings_custody import inventory
from growing_log import _source_set
MAX_FILES=8192
MAX_TOTAL=128*1024*1024
MAX_FILE=64*1024*1024
SPEC='tests/Broker.NativeProof/tactical-native-journey.spec.js'

def _names(root):
    names=set()
    for base,dirs,files in os.walk(root,followlinks=False):
        for name in dirs:need(not (Path(base)/name).is_symlink(),'capture symlink directory')
        for name in files:
            p=Path(base)/name;need(not p.is_symlink(),'capture symlink file');names.add(str(p.relative_to(root)));need(len(names)<=MAX_FILES,'capture file census cap')
    return names

def _target(config,attempt):
    attempt=components(str(attempt));need(str(attempt)==config['roots']['attemptRoot'],'capture attempt escape')
    need(attempt.stat().st_uid==os.geteuid() and stat.S_IMODE(attempt.stat().st_mode)==0o700,'capture attempt custody')
    browser=components(str(attempt/'browser'));need(browser.stat().st_uid==os.geteuid() and stat.S_IMODE(browser.stat().st_mode)==0o700,'capture browser root custody')
    return browser/'execution-capsule'

def prepare_capture_capsule(config,attempt,config_sha256,deadline):
    need(type(deadline) in (int,float) and math.isfinite(deadline) and deadline<=time.monotonic()+180,'capture fixed operation deadline')
    def checkpoint():need(time.monotonic()<deadline,'capture capsule operation deadline')
    checkpoint()
    need(isinstance(config_sha256,str) and SHA.fullmatch(config_sha256),'capture configuration digest')
    packet,packet_value=inventory(config);admitted={r['path']:r for r in packet_value['files']}
    helper=read_json(config['artifacts']['helperManifest']['path'],config['artifacts']['helperManifest']['sha256'],16*1024*1024)
    pin=helper['sourceRoles']['privateCaptureCapsule'].get('manifest')
    need(isinstance(pin,dict) and set(pin)=={'path','sha256'} and isinstance(pin['path'],str) and isinstance(pin['sha256'],str) and SHA.fullmatch(pin['sha256']),'capture resolved manifest pin')
    manifest_path=components(pin['path']);need(manifest_path.is_relative_to(packet),'capture manifest escape')
    manifest=read_json(str(manifest_path),pin['sha256'],16*1024*1024);need(manifest['schema']=='fsbar.barc-capture-capsule-seed/v1' and manifest['sourceCommit']==config['source']['fsbarCommit'] and manifest['specRelativePath']==SPEC,'capture source manifest join')
    root=components(manifest['root']);need(root.is_relative_to(packet),'capture seed escape')
    rows=manifest['files'];need(isinstance(rows,list) and 0<len(rows)<=MAX_FILES and manifest['fileCount']==len(rows),'capture source census bound')
    names=set();total=0
    for row in rows:
        checkpoint()
        name=row['path'];need(isinstance(name,str) and not name.startswith('/') and all(p not in ('','.','..') for p in name.split('/')),'capture relative source path')
        need(name not in names,'capture duplicate source path');names.add(name);need(type(row['bytes']) is int and 0<row['bytes']<=MAX_FILE and SHA.fullmatch(row['sha256']),'capture source row bound');total+=row['bytes']
        source=root/name;need(str(source.relative_to(packet)) in admitted,'capture unadmitted source');selected=admitted[str(source.relative_to(packet))];need(selected['sha256']==row['sha256'] and selected['bytes']==row['bytes'],'capture census source disagreement')
        st=hash_artifact(str(source),row['sha256'],MAX_FILE);need(st.st_nlink==1 and st.st_uid==os.geteuid() and stat.S_IMODE(st.st_mode)==0o400 and st.st_size==row['bytes'] and st.st_ino==selected['inode'] and f'{os.major(st.st_dev)}:{os.minor(st.st_dev)}'==selected['device'],'capture seed custody')
    need(total==manifest['totalBytes'] and total<=MAX_TOTAL and _names(root)==names,'capture complete seed census')
    source=config['artifacts']['captureSource'];need(source['path']==str(root/SPEC) and source['sha256']==next(r['sha256'] for r in rows if r['path']==SPEC),'capture exact original spec join')
    browser_argv=config['commands']['browser'];need(len(browser_argv)==3 and browser_argv[0]==config['artifacts']['captureRuntime']['path'] and browser_argv[2]==str(Path(attempt)/'browser/test-results'),'capture exact browser argv')
    target=_target(config,attempt);need(not os.path.lexists(target),'capture output already exists');target.mkdir(mode=0o700)
    copied=[]
    for row in rows:
        checkpoint()
        output=target/row['path'];parent=target
        for part in Path(row['path']).parts[:-1]:
            parent=parent/part;parent.mkdir(mode=0o700,exist_ok=True);st=parent.lstat();need(stat.S_ISDIR(st.st_mode) and st.st_uid==os.geteuid() and stat.S_IMODE(st.st_mode)==0o700,'capture copied directory custody')
        data=read_bytes(str(root/row['path']),MAX_FILE,private=False);need(len(data)==row['bytes'] and hashlib.sha256(data).hexdigest()==row['sha256'],'capture source changed before copy')
        digest=atomic_bytes_new(str(output),data,MAX_FILE);output.chmod(0o400);st=output.lstat();need(digest==row['sha256'] and st.st_nlink==1 and st.st_uid==os.geteuid(),'capture exact fresh copy')
        original=(root/row['path']).lstat();need((st.st_dev,st.st_ino)!=(original.st_dev,original.st_ino),'capture output shares source inode');copied.append({**row,'device':st.st_dev,'inode':st.st_ino,'ownerUid':st.st_uid,'mode':'0400'});checkpoint()
    derived=copy.deepcopy(config);derived['artifacts']['captureSource']={'path':str(target/SPEC),'sha256':source['sha256']}
    proof=target/'tests/Broker.NativeProof';driver=[browser_argv[0],str(proof/'node_modules/playwright/cli.js'),'test','--config',str(proof/'playwright.config.js'),'--grep','selected stock Count1 smoke','--workers=1','--output',browser_argv[2]]
    receipt={'schema':'fsbar.barc-capture-capsule-copy/v1','configSha256':config_sha256,'sourceSetSha256':_source_set(config),'packetSha256':config['packetSha256'],'seedManifestSha256':pin['sha256'],'seedRoot':str(root),'executionRoot':str(target),'originalCaptureSource':source,'actualCaptureSource':derived['artifacts']['captureSource'],'actualBrowserArgv':browser_argv,'actualPlaywrightArgv':driver,'fileCount':len(copied),'totalBytes':total,'files':copied,'nativeAcceptance':False}
    verify_capture_capsule(config,attempt,receipt);checkpoint();atomic_new(str(Path(attempt)/'capture-capsule-copy.json'),receipt);return derived,receipt

def verify_capture_capsule(config,attempt,receipt):
    target=_target(config,attempt);need(receipt['executionRoot']==str(target) and receipt['sourceSetSha256']==_source_set(config) and receipt['packetSha256']==config['packetSha256'],'capture copied scope join')
    expected={r['path']:r for r in receipt['files']};need(len(expected)==receipt['fileCount'] and _names(target)==set(expected),'capture execution file census changed')
    for name,row in expected.items():
        st=hash_artifact(str(target/name),row['sha256'],MAX_FILE);need((st.st_dev,st.st_ino,st.st_uid,stat.S_IMODE(st.st_mode),st.st_nlink,st.st_size)==(row['device'],row['inode'],row['ownerUid'],0o400,1,row['bytes']),'capture execution custody changed')
    return len(expected)

def bind_capture_handoff(config,attempt,receipt,handoff):
    verify_capture_capsule(config,attempt,receipt);p=components(handoff['path']);need(p==Path(attempt)/'selected-stock-smoke-handoff.json','capture handoff escape');hash_artifact(str(p),handoff['sha256'],65536)
    return atomic_new(str(Path(attempt)/'capture-capsule-handoff.json'),{'schema':'fsbar.barc-capture-capsule-handoff/v1','configSha256':receipt['configSha256'],'sourceSetSha256':receipt['sourceSetSha256'],'copyReceiptSha256':hashlib.sha256(read_bytes(str(Path(attempt)/'capture-capsule-copy.json'),16*1024*1024)).hexdigest(),'handoffSha256':handoff['sha256'],'actualCaptureSource':receipt['actualCaptureSource'],'actualBrowserArgv':receipt['actualBrowserArgv'],'nativeAcceptance':False})

def finish_capture_capsule(config,attempt,receipt):
    count=verify_capture_capsule(config,attempt,receipt)
    return atomic_new(str(Path(attempt)/'capture-capsule-post-use.json'),{'schema':'fsbar.barc-capture-capsule-post-use/v1','configSha256':receipt['configSha256'],'sourceSetSha256':receipt['sourceSetSha256'],'filesUnchanged':count,'nativeAcceptance':False})
