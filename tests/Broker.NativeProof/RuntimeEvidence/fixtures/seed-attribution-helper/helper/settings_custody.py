"""Root-selected immutable settings seed and attempt-scoped engine output."""
import hashlib,json,os,stat
from pathlib import Path
from private_io import SHA,Refused,atomic_bytes_new,atomic_new,canonical,components,hash_artifact,need,read_bytes,read_json
MAX_SETTINGS=65536
MAX_INVENTORY=16*1024*1024
MAX_FILES=65536

def external_inventory(config,root,root_before):
    pin=config['packetInventory'];fields={'path','sha256','bytes','device','inode','uid','mode','nlink'}
    need(type(pin)is dict and set(pin)==fields,'closed external inventory pin')
    need(type(pin['sha256'])is str and SHA.fullmatch(pin['sha256']) and pin['sha256']==config['packetSha256'],'external inventory digest join')
    need(all(type(pin[k])is int for k in fields-{'path','sha256'}),'external inventory physical pin types')
    path=components(pin['path']);need(not path.is_relative_to(root),'external inventory outside packet root')
    anchor=path.parent.lstat();before=path.lstat()
    need(stat.S_ISDIR(anchor.st_mode) and anchor.st_uid==os.geteuid() and stat.S_IMODE(anchor.st_mode)==0o700,'private external inventory anchor')
    need(stat.S_ISREG(before.st_mode) and before.st_uid==os.geteuid() and stat.S_IMODE(before.st_mode)in(0o400,0o600) and before.st_nlink==1 and 0<before.st_size<=MAX_INVENTORY,'external inventory custody/bound')
    def matches(info):
        return all(pin[k]==v for k,v in {'bytes':info.st_size,'device':info.st_dev,'inode':info.st_ino,'uid':info.st_uid,'mode':stat.S_IMODE(info.st_mode),'nlink':info.st_nlink}.items())
    need(matches(before),'external inventory physical identity')
    fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW|os.O_NONBLOCK|os.O_CLOEXEC)
    try:
        opened=os.fstat(fd);need(matches(opened) and stat.S_ISREG(opened.st_mode),'opened external inventory identity')
        chunks=[];length=0
        while length<=MAX_INVENTORY:
            block=os.read(fd,min(65536,MAX_INVENTORY+1-length))
            if not block:break
            chunks.append(block);length+=len(block)
        after=os.fstat(fd);current=components(str(path)).lstat();parent=path.parent.lstat();root_after=components(str(root)).lstat()
        attrs=('st_dev','st_ino','st_size','st_uid','st_mode','st_nlink','st_mtime_ns','st_ctime_ns')
        need(length==before.st_size and length<=MAX_INVENTORY and all(getattr(before,k)==getattr(opened,k)==getattr(after,k)==getattr(current,k)for k in attrs),'external inventory changed during read')
        need(all(getattr(anchor,k)==getattr(parent,k)for k in ('st_dev','st_ino','st_uid','st_mode')) and all(getattr(root_before,k)==getattr(root_after,k)for k in ('st_dev','st_ino','st_uid','st_mode')),'external inventory directory/root generation drift')
    finally:os.close(fd)
    raw=b''.join(chunks);need(hashlib.sha256(raw).hexdigest()==pin['sha256'],'external inventory bytes mismatch')
    def unique(pairs):
        value={}
        for key,item in pairs:need(key not in value,'duplicate external inventory JSON key');value[key]=item
        return value
    return json.loads(raw.decode('utf-8'),object_pairs_hook=unique,parse_constant=lambda _: (_ for _ in ()).throw(Refused('nonfinite external inventory JSON')))

def inventory(config):
    root=components(config['roots']['packetRoot']);info=root.lstat();required_mode=0o500 if 'packetInventory'in config else 0o700
    need(stat.S_ISDIR(info.st_mode) and info.st_uid==os.geteuid() and stat.S_IMODE(info.st_mode)==required_mode,'private packet root')
    value=external_inventory(config,root,info) if 'packetInventory'in config else read_json(str(root/'packet-inventory.json'),config['packetSha256'],MAX_INVENTORY)
    need(value['root']==str(root) and isinstance(value['files'],list) and len(value['files'])<=MAX_FILES,'bounded packet census')
    need(value['fileCount']==len(value['files']),'packet census count')
    names=set()
    for row in value['files']:
        path=row['path'];need(isinstance(path,str) and not path.startswith('/') and all(part not in ('','.','..') for part in path.split('/')),'packet census relative path')
        need(path not in names,'duplicate packet census path');names.add(path)
    return root,value

def validate_engine_argv(original,actual,attempt):
    need(isinstance(original,list) and isinstance(actual,list) and len(original)==len(actual)==9,'closed engine argv')
    need(all(actual[i]==original[i] for i in range(9) if i!=7),'unexpected engine argv change')
    need(actual[7]==str(canonical(str(attempt))/'engine'/'springsettings.cfg'),'derived config path mismatch')
    need(actual[7]!=original[7],'engine settings must be isolated from seed')
    return actual

def prepare_engine_settings(config,attempt):
    attempt=components(str(attempt));need(str(attempt)==config['roots']['attemptRoot'],'attempt output escape')
    need(attempt.stat().st_uid==os.geteuid() and stat.S_IMODE(attempt.stat().st_mode)==0o700,'private attempt root')
    root,value=inventory(config);original=list(config['commands']['engine']);need(len(original)==9,'closed seed engine argv')
    seed=components(original[7]);need(seed.is_relative_to(root),'seed escapes packet')
    rel=str(seed.relative_to(root));row=next((x for x in value['files'] if x['path']==rel),None);need(row is not None,'seed absent from admitted census')
    before=hash_artifact(str(seed),row['sha256'],MAX_SETTINGS);need(before.st_nlink==1 and before.st_uid==os.geteuid() and stat.S_IMODE(before.st_mode)==0o400,'immutable single-linked seed')
    data=read_bytes(str(seed),MAX_SETTINGS,private=False);digest=hashlib.sha256(data).hexdigest();need(digest==row['sha256'] and len(data)==row['bytes'],'seed bytes mismatch')
    output=canonical(str(attempt/'engine'/'springsettings.cfg'));parent=components(str(output.parent));need(parent.is_relative_to(attempt) and parent.stat().st_uid==os.geteuid() and stat.S_IMODE(parent.stat().st_mode)==0o700,'private engine output parent')
    # Exclusive publication refuses an existing file or symlink without following it.
    copied=atomic_bytes_new(str(output),data,MAX_SETTINGS);after=output.lstat();need(after.st_nlink==1 and stat.S_IMODE(after.st_mode)==0o600 and after.st_uid==os.geteuid() and (after.st_dev,after.st_ino)!=(before.st_dev,before.st_ino),'fresh single-linked writable output')
    hash_artifact(str(seed),digest,MAX_SETTINGS);need(copied==digest,'exact seed copy')
    actual=list(original);actual[7]=str(output);validate_engine_argv(original,actual,attempt)
    receipt={'schema':'fsbar.barc-stock-engine-settings-copy/v1','seedPath':str(seed),'seedSha256':digest,'outputPath':str(output),'copiedSha256':copied,'actualEngineArgv':actual,'originalEngineArgv':original,'packetSha256':config['packetSha256'],'seedDevice':before.st_dev,'seedInode':before.st_ino,'outputDevice':after.st_dev,'outputInode':after.st_ino,'nativeAcceptance':False}
    atomic_new(str(attempt/'engine-settings-copy.json'),receipt);return actual,receipt

def verify_packet_unchanged(config):
    root,value=inventory(config);expected={row['path']:row for row in value['files']};actual=set()
    for base,dirs,files in os.walk(root,followlinks=False):
        for name in dirs:need(not (Path(base)/name).is_symlink(),'packet symlink directory')
        for name in files:
            p=Path(base)/name;need(not p.is_symlink(),'packet symlink file');rel=str(p.relative_to(root))
            if 'packetInventory'not in config and rel=='packet-inventory.json':continue
            need(len(actual)<MAX_FILES,'bounded packet file census');actual.add(rel);need(rel in expected,'unadmitted packet file')
            row=expected[rel];before=hash_artifact(str(p),row['sha256']);need(before.st_nlink==1 and before.st_uid==row['ownerUid'] and before.st_ino==row['inode'] and f'{os.major(before.st_dev)}:{os.minor(before.st_dev)}'==row['device'] and before.st_size==row['bytes'] and stat.S_IMODE(before.st_mode)==int(row['mode'],8),'packet custody changed')
    need(actual==set(expected),'packet file census changed');return len(actual)

def finish_engine_settings(config,attempt,receipt):
    output=components(receipt['outputPath']);after=output.lstat();need(after.st_uid==os.geteuid() and after.st_nlink==1 and stat.S_ISREG(after.st_mode) and stat.S_IMODE(after.st_mode)==0o600,'settings output custody')
    need((after.st_dev,after.st_ino)==(receipt['outputDevice'],receipt['outputInode']),'settings output identity changed')
    data=read_bytes(str(output),MAX_SETTINGS);count=verify_packet_unchanged(config)
    value={'schema':'fsbar.barc-stock-engine-settings-post-use/v1','packetUnchanged':True,'packetFileCount':count,'seedSha256':receipt['seedSha256'],'copiedSha256':receipt['copiedSha256'],'afterRunOutputSha256':hashlib.sha256(data).hexdigest(),'afterRunOutputBytes':len(data),'actualEngineArgv':receipt['actualEngineArgv'],'nativeAcceptance':False}
    atomic_new(str(Path(attempt)/'engine-settings-post-use.json'),value);return value
