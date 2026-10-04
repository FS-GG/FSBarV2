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
            prior=pins.get(pin['path']);need(prior is None or prior['sha256']==pin['sha256'],'mapping original pin ambiguity');pins[pin['path']]=pin
    return pins

SUCCESSOR_BASE_ALLOWED_SHA=None # Must be selected as an exact source literal after fresh placement.
SUCCESSOR_MAPPING_DELTA_SHA=None

def validate_schema(p):
    need(p.get('preparationReady') is True and SUCCESSOR_BASE_ALLOWED_SHA is not None and SUCCESSOR_MAPPING_DELTA_SHA is not None,'fresh finite mapping delta not yet selected')
    need(hashlib.sha256(json.dumps(p['mappingDelta'],sort_keys=True,separators=(',',':')).encode()).hexdigest()==SUCCESSOR_MAPPING_DELTA_SHA,'literal successor delta')

    table=p['executableMappingIdentities'];need(set(table)=={'schema','baseAllowed','clrPinCount','rows'} and table['schema']==SCHEMA and table['clrPinCount']==len(p['clrPins'])==335,'closed mapping identity table')
    digest=lambda value:hashlib.sha256(json.dumps(value,sort_keys=True,separators=(',',':')).encode()).hexdigest()
    need(digest(table['baseAllowed'])==SUCCESSOR_BASE_ALLOWED_SHA and digest(p['clrPins'])==CLR_PINS_SHA,'mapping immutable inherited table and CLR pin set')
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
