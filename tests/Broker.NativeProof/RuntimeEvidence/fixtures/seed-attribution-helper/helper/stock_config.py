"""Closed stock-smoke config. Templates retain null pins and must fail preflight."""
import os,re,stat,urllib.parse
from pathlib import Path
from private_io import Refused,SHA,canonical,components,hash_artifact,need,read_bytes,read_json

SCHEMA='fsbar.barc-stock-native-smoke-supervisor-config/v2'
PROFILE='barc-live-tactical-stock-v1';BRIDGE='barc-stock-queue-reader-v1'
EXPECTED_SOURCE={'fsbarCommit':'fb00d0f77b6c7d0998f85a2039931c0c5eed2472','highbarCommit':'b57f11f290dc3239d894b0285ae272b6b21bc25d'}
ARTIFACT_ROLES=('engine','plugin','stockOverlay','baseGame','map','passiveFixture','nativeHost','receiverArchive','client','guest','codecManifest','helperManifest','fsbarNormalizer','runtimeClosure','normalizerRuntime','captureRuntime','captureSource','runtimeEvidencePolicy','runtimeEvidencePolicyClosure')
NULL_AI_SHA256='cf72efb79a43b8242f0f505915dff5d900cffc721cc8667bb8da0e4aec4eb5ed'
HANDOFF_ROLES=ARTIFACT_ROLES[:12]
COMMAND_ROLES=('host','engine','receiver','browser')
TOP={'schema','runId','packetSha256','source','artifacts','roots','paths','commands','bootstrap','limits','expected'}
RUN=re.compile(r'^[A-Za-z0-9._-]{1,64}$');GIT=re.compile(r'^[0-9a-f]{40}$')

def exact(value,keys,label):need(isinstance(value,dict) and set(value)==set(keys),f'closed {label}')
def beneath(path,root):
    path=canonical(path);root=canonical(root)
    try:path.relative_to(root)
    except ValueError:raise Refused('path outside admitted root')
    return path

def loopback_endpoint(value,schemes,label):
    if schemes is None:
        need(isinstance(value,str) and re.fullmatch(r'127\.0\.0\.1:[1-9][0-9]{0,4}',value),f'fixed loopback {label}')
        port=int(value.rsplit(':',1)[1]);need(port<=65535,f'fixed loopback {label}');return (None,'127.0.0.1',port)
    try:
        parsed=urllib.parse.urlsplit(value or '');port=parsed.port
    except ValueError as error:raise Refused(f'fixed loopback {label}') from error
    need(parsed.scheme in schemes and parsed.hostname=='127.0.0.1' and port and port<=65535 and not parsed.username and not parsed.password and not parsed.fragment,f'fixed loopback {label}')
    return (parsed.scheme,parsed.hostname,port)

def coordinator_endpoint(value):
    _,host,port=loopback_endpoint(value['commands']['host'][2],None,'coordinator');return f'{host}:{port}'

def validate_template(value):
    exact(value,TOP,'config');need(value['schema']==SCHEMA and (value['runId'] is None or RUN.fullmatch(value['runId'])),'config identity')
    exact(value['source'],{'fsbarCommit','highbarCommit'},'source')
    exact(value['artifacts'],ARTIFACT_ROLES,'artifact roles')
    for role,item in value['artifacts'].items():
        exact(item,{'path','sha256'},f'artifact {role}');need(item['path'] is None or isinstance(item['path'],str),'artifact path');need(item['sha256'] is None or SHA.fullmatch(item['sha256']),'artifact hash')
    exact(value['roots'],{'packetRoot','attemptRoot'},'roots');exact(value['paths'],{'codecDirectory','receiverRoot','hostTrace','stockTrace','capture','output'},'paths')
    exact(value['commands'],COMMAND_ROLES,'commands')
    for argv in value['commands'].values():need(argv is None or isinstance(argv,list) and 1<=len(argv)<=32 and all(isinstance(x,str) and 0<len(x)<=4096 and '\x00' not in x for x in argv),'fixed command')
    exact(value['bootstrap'],{'receiverUrl'},'bootstrap');need(value['bootstrap']['receiverUrl'] is None or isinstance(value['bootstrap']['receiverUrl'],str),'receiver URL')
    exact(value['limits'],{'operationSeconds','termSeconds','killSeconds'},'limits');need(value['limits']=={'operationSeconds':180,'termSeconds':3,'killSeconds':3},'fixed finite limits')
    exact(value['expected'],{'fixtureMode','profile','protocolVersion','tacticalRevision','queueEvidenceScheme','queueBridge','guestAbiVersion','selection'},'expected')
    exact(value['expected']['selection'],{'product','mode','caseId','count'},'selection')
    need(value['expected']=={'fixtureMode':False,'profile':PROFILE,'protocolVersion':2,'tacticalRevision':2,'queueEvidenceScheme':2,'queueBridge':BRIDGE,'guestAbiVersion':1,'selection':{'product':'local','mode':'pointer','caseId':'stock-smoke-count1','count':1}},'fixed stock selection')
    return value

def validate_preflight(value):
    validate_template(value);need(RUN.fullmatch(value['runId'] or '') and SHA.fullmatch(value['packetSha256'] or ''),'unresolved packet identity')
    need(all(GIT.fullmatch(value['source'][x] or '') for x in ('fsbarCommit','highbarCommit')),'unresolved source identity')
    need(value['source']==EXPECTED_SOURCE,'protected source identity mismatch')
    roots=value['roots'];need(all(isinstance(roots[x],str) for x in roots),'unresolved roots');packet=canonical(roots['packetRoot']);parent=canonical(str(Path(roots['attemptRoot']).parent))
    pinfo=components(str(packet)).stat();ainfo=components(str(parent)).stat();need(pinfo.st_uid==os.geteuid() and stat.S_ISDIR(pinfo.st_mode) and stat.S_IMODE(pinfo.st_mode)==0o700,'packet root custody');need(ainfo.st_uid==os.geteuid() and stat.S_ISDIR(ainfo.st_mode) and stat.S_IMODE(ainfo.st_mode)==0o700,'attempt parent custody')
    need(not Path(roots['attemptRoot']).exists(),'attempt root must be absent before run')
    for role,item in value['artifacts'].items():
        need(isinstance(item['path'],str) and SHA.fullmatch(item['sha256'] or ''),f'unresolved {role} pin');beneath(item['path'],str(packet));hash_artifact(item['path'],item['sha256'])
    need(os.access(value['artifacts']['runtimeEvidencePolicy']['path'],os.X_OK),'runtime evidence policy must be executable')
    for key,path in value['paths'].items():
        need(isinstance(path,str),f'unresolved {key} path');root=str(packet) if key in ('codecDirectory','receiverRoot') else roots['attemptRoot'];beneath(path,root)
        if key=='output':need(not Path(path).exists(),'output must be absent')
    for role,argv in value['commands'].items():
        need(argv is not None and argv and argv[0].startswith('/'),'unresolved fixed command');canonical(argv[0])
    engine=value['commands']['engine'];need(engine[0]==value['artifacts']['engine']['path'],'engine command pin mismatch')
    need(len(engine)==9 and engine[1:3]==['--isolation','--isolation-dir'] and engine[4]=='--write-dir' and engine[6]=='--config','engine isolation argv mismatch')
    need(beneath(engine[3],str(packet))==canonical(engine[3]) and components(engine[3]).is_dir(),'engine data root mismatch')
    data_root=canonical(engine[3]);packages=data_root/'packages';pool=data_root/'pool'
    base=read_json(value['artifacts']['baseGame']['path'],value['artifacts']['baseGame']['sha256'])
    need(isinstance(base,dict) and base.get('runtimeDataRoot')==str(data_root) and base.get('poolRoot')==str(pool),'base game data-root join mismatch')
    descriptor=base.get('descriptor');need(isinstance(descriptor,dict) and set(descriptor)=={'path','sha256'},'closed base game descriptor')
    descriptor_path=canonical(descriptor['path']);need(descriptor_path.parent==packages and descriptor_path.suffix=='.sdp','base game descriptor outside recognized packages root')
    need(packages.is_dir() and pool.is_dir(),'recognized packages/pool roots unavailable')
    runtime=read_json(value['artifacts']['runtimeClosure']['path'],value['artifacts']['runtimeClosure']['sha256'])
    metadata=runtime.get('aiInterfaceMetadata') if isinstance(runtime,dict) else None
    exact(metadata,{'path','sha256'},'AI interface metadata')
    expected_metadata=data_root/'AI'/'Interfaces'/'C'/'0.1'/'InterfaceInfo.lua'
    need(canonical(metadata['path'])==expected_metadata,'AI interface metadata path mismatch')
    need(expected_metadata.is_file(),'AI interface metadata unavailable')
    hash_artifact(str(expected_metadata),metadata['sha256'])
    managed=runtime.get('nativeHostManagedAssembly') if isinstance(runtime,dict) else None
    exact(managed,{'path','sha256'},'native host managed assembly')
    expected_managed=packet/'artifacts'/'native-host'/'Broker.NativeProof.dll'
    need(canonical(managed['path'])==expected_managed and expected_managed.is_file(),'native host managed assembly path mismatch')
    hash_artifact(str(expected_managed),managed['sha256'])
    selected=re.findall(r'(?im)^\s*shortname\s*=\s*([A-Za-z0-9._-]+)\s*;',read_bytes(engine[8],65536).decode('utf-8'))
    need(len(selected)==2 and set(selected)=={'NullAI','highBar'},'selected AI set mismatch')
    binaries=runtime.get('binaries');need(isinstance(binaries,list) and len(binaries)<=16,'runtime binary closure')
    by_role={}
    for item in binaries:
        exact(item,{'path','role','sha256'},'runtime binary');need(item['role'] not in by_role,'duplicate runtime binary role');by_role[item['role']]=item
    expected_null=data_root/'AI'/'Skirmish'/'NullAI'/'0.1'/'libSkirmishAI.so'
    need(by_role.get('highBarPlugin')=={'path':value['artifacts']['plugin']['path'],'role':'highBarPlugin','sha256':value['artifacts']['plugin']['sha256']},'selected highBar binary mismatch')
    need(by_role.get('stockOpponentNullAI')=={'path':str(expected_null),'role':'stockOpponentNullAI','sha256':NULL_AI_SHA256},'selected NullAI binary mismatch')
    hash_artifact(str(expected_null),NULL_AI_SHA256)
    need(components(str(packages)).is_dir() and components(str(pool)).is_dir(),'recognized packages/pool roots unavailable')
    for directory in (data_root,packages,pool):
        info=directory.stat();need(info.st_uid==os.geteuid() and stat.S_ISDIR(info.st_mode) and stat.S_IMODE(info.st_mode)==0o700,'private engine content root')
    hash_artifact(str(descriptor_path),descriptor['sha256'])
    need(canonical(engine[5])==canonical(str(Path(roots['attemptRoot'])/'engine')),'engine write root mismatch')
    for path in (engine[7],engine[8]):
        need(beneath(path,str(packet))==canonical(path) and components(path).is_file(),'engine config or startscript pin mismatch')
    need(value['commands']['host'][0]==value['artifacts']['nativeHost']['path'],'host command pin mismatch')
    host=value['commands']['host']
    need(len(host)==7 and host[1]=='--stock-tactical-live-host' and host[5]==str(Path(roots['attemptRoot'])/'host') and host[6]==value['source']['fsbarCommit'],'host apphost argv mismatch')
    coordinator=loopback_endpoint(host[2],None,'coordinator')
    gateway=loopback_endpoint(host[3],{'http','https'},'gateway')
    origin=loopback_endpoint(host[4],{'http','https'},'allowed origin')
    receiver=loopback_endpoint(value['bootstrap']['receiverUrl'],{'http','https'},'receiver')
    need(len({coordinator[2],gateway[2],receiver[2]})==3,'coordinator, gateway, and receiver ports must be distinct')
    need(origin==receiver,'allowed origin must equal receiver origin')
    return value
