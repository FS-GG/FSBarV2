"""Finite original-pin mapping identities and bounded lexical ancestor custody."""
import os,stat,hashlib,json
from pathlib import Path
from private_io import need,hash_artifact
SCHEMA='bar.original-pin-executable-mapping-identities/v1'
HISTORICAL_BASE_ALLOWED_SHA='4662360a308ae48a54220882c1b940f196cee7ff48256be93f61d853f2d636a9'
CLR_PINS_SHA='124e6c4a49d70791939c8b32c525ec765eb243ba8c82b7e0f787a584070afea1'
PIN_FIELDS=('path','sha256','bytes','device','inode','uid','mode','nlink')

def ancestor_links(path):
    leaf=Path(path);parts=[leaf,*leaf.parents];need(len(parts)<=32,'mapping ancestor component bound');links=[]
    for component in parts:
        info=component.lstat()
        if not stat.S_ISLNK(info.st_mode):continue
        text=os.readlink(component);resolved=os.path.realpath(component);need(len(os.fsencode(text))<=4096 and len(os.fsencode(resolved))<=4096,'mapping ancestor link bound')
        target=os.stat(component)
        links.append({'path':str(component),'linkText':text,'resolvedPath':resolved,'device':info.st_dev,'inode':info.st_ino,'uid':info.st_uid,'mode':stat.S_IMODE(info.st_mode),'nlink':info.st_nlink,'targetDevice':target.st_dev,'targetInode':target.st_ino,'targetUid':target.st_uid,'targetMode':target.st_mode,'targetNlink':target.st_nlink})
        need(len(links)<=8,'mapping ancestor link count bound')
    return links

def admitted_pins(p):
    pins={}
    for name in ['originalDataPins','hostPins','clrPins','elfPins','pythonPins','authorityPins']:
        for pin in p[name]:
            prior=pins.get(pin['path']);need(prior is None or prior==pin,'mapping original pin ambiguity');pins[pin['path']]=pin
    return pins

HISTORICAL_PROFILE_SHA='b2d3dd34b88a838a073fa64aa514681c01f1dfee0bd4388fea8441a87bc93dcf'
BASELINE_SHA='11224181c3b33d6894a35cc7e32f655b2087442e4ba4958ef7700dc2c333cad0'
HISTORICAL_ROWS_SHA='8b5d4e2c59978b2e5f0d3d6457a3276935de52859279a0047102017ebd11324c'
RESULT_ROWS_SHA='b9da4fff63926901802580850fcc91888455d5584cdc4e9d38daff1ed807031a'
SUCCESSOR_BASE_ALLOWED_SHA='2e15d85a1ea33e9f2bca9f24f10046e9a10ea1c28645c4faf4fe9376dd816546'
SUCCESSOR_MAPPING_DELTA_SHA='7851f21c579ca183d7c5a7641dcc114213ffa7d67e18187b2b93da5fceea1741'
RETAINED_PHYSICAL_ROWS_SHA='33f0adb4e40baf2da15d1794e46311b66ecb1bbb2c80cf517ce98d2f83d0d07a'
BASE='/home/developer/.local/share/fs-gg-private'
HISTORICAL_DATA=BASE+'/bar-stock-policy968-private-input-successor-20261003/packet/runtime-data'
DATA=BASE+'/bar-native-seed-data-preparation-20261005-v2/packet/runtime-data'
HOST=BASE+'/bar-native-seed-input-preparation-20261005-v1/native-host/Broker.NativeProof'
POLICY=BASE+'/bar-native-seed-policy-adoption-root-operation-20261005-v1/placement/managed/RuntimeEvidence'
OLD_HOST='/tmp/bar-stock-fb00-managed-artifact-preparation-synthetic-pdb-successor-20261004/native-host/Broker.NativeProof'
AI={'officialCInterface':'AI/Interfaces/C/0.1/libAIInterface.so','highBarPlugin':'AI/Skirmish/highBar/stable/libSkirmishAI.so','stockOpponentNullAI':'AI/Skirmish/NullAI/0.1/libSkirmishAI.so'}
SEMANTIC_FIELDS={'declaredPath','canonicalPath','kind','baseAllowedKey','sha256','bytes'}
def semantic_digest(value):
    return hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':'),ensure_ascii=True,allow_nan=False).encode()).hexdigest()
def semantic_row(row):
    return {**{k:row[k]for k in ['declaredPath','canonicalPath','kind','baseAllowedKey']},'sha256':row['pin']['sha256'],'bytes':row['pin']['bytes']}
def unique(pairs):
    result={}
    for k,v in pairs:need(k not in result,'duplicate mapping JSON key');result[k]=v
    return result
def nonfinite(value):raise ValueError('nonfinite mapping JSON value')
def load_profile(path):
    # Read one exact bounded private regular file; duplicate/nonfinite JSON refuses.
    p=Path(path);before=p.lstat();need(stat.S_ISREG(before.st_mode)and before.st_nlink==1 and before.st_uid==os.geteuid()and stat.S_IMODE(before.st_mode)==0o600 and before.st_size<=16777216,'closed mapping profile custody')
    fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW|os.O_CLOEXEC)
    try:
        opened=os.fstat(fd);body=b''
        while len(body)<=16777216:
            chunk=os.read(fd,min(65536,16777217-len(body)))
            if not chunk:break
            body+=chunk
        after=os.fstat(fd)
    finally:os.close(fd)
    fields=['st_dev','st_ino','st_mode','st_uid','st_nlink','st_size','st_mtime_ns','st_ctime_ns'];current=p.lstat()
    need(len(body)==before.st_size and all(getattr(before,k)==getattr(opened,k)==getattr(after,k)==getattr(current,k)for k in fields),'stable complete mapping profile')
    return json.loads(body,object_pairs_hook=unique,parse_constant=nonfinite)
def semantic_delta(baseline):
    need(set(baseline)=={'schema','historicalProfileSha256','baseAllowed','rows'}and baseline['schema']=='bar.native-seed-semantic-mapping-baseline/v1'and baseline['historicalProfileSha256']==HISTORICAL_PROFILE_SHA and semantic_digest(baseline)==BASELINE_SHA,'exact historical semantic baseline')
    rows=baseline['rows'];need(type(rows)is list and len(rows)==457 and rows==sorted(rows,key=lambda r:r['declaredPath'])and all(set(r)==SEMANTIC_FIELDS for r in rows)and semantic_digest(rows)==HISTORICAL_ROWS_SHA and semantic_digest(baseline['baseAllowed'])==HISTORICAL_BASE_ALLOWED_SHA,'complete ordered historical mapping rows')
    by={r['declaredPath']:r for r in rows};need(len(by)==457,'unique baseline rows')
    roles={'host':OLD_HOST,**{k:HISTORICAL_DATA+'/'+v for k,v in AI.items()}}
    removed=[{'role':role,'row':by[path]}for role,path in sorted(roles.items())]
    new_roles={k:{**by[HISTORICAL_DATA+'/'+suffix],'declaredPath':DATA+'/'+suffix,'canonicalPath':DATA+'/'+suffix,'baseAllowedKey':DATA+'/'+suffix}for k,suffix in AI.items()}
    for role,path,sha in [('host',HOST,'0f11cb2012771c17a3f191ac912633586ee5f35a1969e2f8bfaa6d54ff7aec28'),('policy',POLICY,'0dc6787b588acf19b07f1cd80aab98cbd9c250dbba2b5e00c382706bcfefbd84')]:new_roles[role]=dict(declaredPath=path,canonicalPath=path,kind='existingExecutable',baseAllowedKey=path,sha256=sha,bytes=78256)
    added=[{'role':role,'row':row}for role,row in sorted(new_roles.items())];engine={'role':'engine','row':by[HISTORICAL_DATA+'/spring-headless']}
    result=sorted([r for r in rows if r['declaredPath']not in roles.values()]+list(new_roles.values()),key=lambda r:r['declaredPath']);base={r['baseAllowedKey']:r['sha256']for r in result if r['kind']=='existingExecutable'}
    delta=dict(schema='bar.native-seed-semantic-mapping-delta/v2',historicalProfileSha256=HISTORICAL_PROFILE_SHA,historicalBaseAllowedSha256=HISTORICAL_BASE_ALLOWED_SHA,historicalRowsSha256=HISTORICAL_ROWS_SHA,retainedClrPinsSha256=CLR_PINS_SHA,removed=removed,added=added,retainedEngine=engine,retainedRows=453,resultRowCount=458,resultExistingExecutableCount=145,resultClrPECount=313,resultRowsSha256=semantic_digest(result),resultBaseAllowedSha256=semantic_digest(base))
    need(delta['resultRowsSha256']==RESULT_ROWS_SHA and delta['resultBaseAllowedSha256']==SUCCESSOR_BASE_ALLOWED_SHA and semantic_digest(delta)==SUCCESSOR_MAPPING_DELTA_SHA,'independent closed semantic golden join')
    return delta,result,base

def validate_schema(p):
    need(p.get('preparationReady') is True,'actual mapping preparation remains required')
    delta,projection,base=semantic_delta(p['mappingBaseline']);need(p['mappingDelta']==delta,'exact closed semantic delta')
    physical=p['executableMappingIdentities']['rows'];need(len(physical)==458 and sorted(map(semantic_row,physical),key=lambda r:r['declaredPath'])==projection,'complete actual physical→semantic projection')
    removed={x['row']['declaredPath']for x in delta['removed']};added={x['row']['declaredPath']for x in delta['added']}
    unchanged=sorted((r for r in physical if r['declaredPath']not in added),key=lambda r:r['declaredPath']);need(len(unchanged)==453 and semantic_digest(unchanged)==RETAINED_PHYSICAL_ROWS_SHA,'original retained physical row/ancestor custody')
    need(p['nativeHost']==HOST and p['policy']['apphost']==POLICY and p['dataRoot']==DATA and p['engine']==HISTORICAL_DATA+'/spring-headless','exact selected native paths')
    need(p['requiredHostMappings']==[HOST]+[x for x in p['allowedExecutableMappings']if Path(x).name in('libcoreclr.so','libclrjit.so')],'exact three required host maps')
    need(set(p['requiredEngineMappings'])=={'engine',*AI},'closed four native engine roles')
    for role,path in {'engine':p['engine'],**{k:DATA+'/'+v for k,v in AI.items()}}.items():
        entry=p['requiredEngineMappings'][role];selected=delta['retainedEngine']['row']if role=='engine'else next(x['row']for x in delta['added']if x['role']==role)
        need(entry=={'path':path,'role':role,'sha256':selected['sha256']},'source-bound required engine role')
    need(any(x['path']==p['engine']for x in p['authorityPins']),'retained original engine explicitly admitted outside fresh data')
    table=p['executableMappingIdentities'];need(set(table)=={'schema','baseAllowed','clrPinCount','rows'} and table['schema']==SCHEMA and table['clrPinCount']==len(p['clrPins'])==335,'closed mapping identity table')
    digest=semantic_digest
    need(table['baseAllowed']==base and digest(table['baseAllowed'])==SUCCESSOR_BASE_ALLOWED_SHA and digest(p['clrPins'])==CLR_PINS_SHA,'mapping immutable inherited table and CLR pin set')
    rows=table['rows'];need(type(rows) is list and len(rows)<=len(table['baseAllowed'])+335,'finite mapping identity rows')
    pins=admitted_pins(p);declared=set();allowed={};clr={pin['path'] for pin in p['clrPins']}
    for row in rows:
        need(set(row)=={'declaredPath','canonicalPath','pin','kind','ancestorLinks','baseAllowedKey'},'closed mapping identity row');path=row['declaredPath'];need(path in pins and row['pin']=={key:pins[path][key] for key in PIN_FIELDS},'mapping existing original pin only')
        need(path not in declared,'mapping duplicate declared path');declared.add(path)
        if row['kind']=='existingExecutable':
            key=row['baseAllowedKey'];need(table['baseAllowed'].get(key)==row['pin']['sha256'] and (key==path or pins[path].get('symlinkCustody',{}).get('resolvedPath')==key),'mapping inherited executable only')
        else:need(row['kind']=='clrPE' and path in clr and path not in table['baseAllowed'] and row['baseAllowedKey'] is None,'mapping finite original CLR PE only')
        canonical=row['canonicalPath'];need(type(canonical) is str and canonical.startswith('/') and len(os.fsencode(canonical))<=4096 and '..' not in Path(canonical).parts,'mapping canonical path shape')
        prior=allowed.get(canonical);need(prior is None or prior==row['pin']['sha256'],'mapping canonical collision');allowed[canonical]=row['pin']['sha256']
        need(type(row['ancestorLinks']) is list and len(row['ancestorLinks'])<=8,'mapping finite ancestor custody')
    need(set(table['baseAllowed'])=={row['baseAllowedKey'] for row in rows if row['kind']=='existingExecutable'} and p['allowedExecutableMappings']==allowed,'mapping exact finite table projection')
    return rows

def revalidate(p,remaining):
    rows=validate_schema(p)
    for row in rows:
        remaining();path=row['declaredPath'];pin=row['pin'];need(os.path.realpath(path)==row['canonicalPath'] and ancestor_links(path)==row['ancestorLinks'],'mapping ancestor identity drift')
        current=os.stat(row['canonicalPath'],follow_symlinks=False)
        need(stat.S_ISREG(current.st_mode),'mapping regular file')
        need((current.st_dev,current.st_ino,current.st_size,current.st_uid,stat.S_IMODE(current.st_mode),current.st_nlink)==(pin['device'],pin['inode'],pin['bytes'],pin['uid'],pin['mode'],pin['nlink']),'mapping original target identity drift')
        verified=hash_artifact(row['canonicalPath'],pin['sha256'],268435456)
        need((verified.st_dev,verified.st_ino,verified.st_size)==(pin['device'],pin['inode'],pin['bytes']) and ancestor_links(path)==row['ancestorLinks'],'mapping target changed during hash')
        if row['kind']=='clrPE':
            with open(row['canonicalPath'],'rb') as stream:need(stream.read(2)==b'MZ','mapping original CLR PE magic drift')
    return {'schema':SCHEMA,'verifiedRows':len(rows),'clrOriginalPins':335,'allIOProof':False}
