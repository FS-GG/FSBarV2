"""Authenticate producers, freeze complete prefixes, invoke only pinned FSBar normalization."""
import base64,json,os,re,stat,subprocess,urllib.parse,uuid
from pathlib import Path
from private_io import Refused,atomic_bytes_new,atomic_new,components,digest,hash_artifact,need,read_bytes,read_json
from runtime_identity import proc_bytes,start_ticks,verify_capture_writer,verify_process
from stock_config import BRIDGE,HANDOFF_ROLES,PROFILE,beneath
READY_SCHEMA='fsbar.barc-stock-native-smoke-ready/v1';METADATA_SCHEMA='fsbar.barc-stock-native-smoke-metadata/v1';SETUP_SCHEMA='fsbar.barc-stock-native-smoke-setup/v1';HANDOFF_SCHEMA='fsbar.barc-stock-native-smoke-handoff/v1';TRACE_SCHEMA='highbar.barc-stock-queue-trace/v1';HOST_JOURNAL_SCHEMA='fsbar.barc-stock-host-journal/v1';CAPTURE_SCHEMA='fsbar.barc-stock-browser-capture/v1'
HEX64=re.compile(r'^[0-9a-f]{64}$');U64=re.compile(r'^(0|[1-9][0-9]*)$');RUN=re.compile(r'^[A-Za-z0-9._-]{1,64}$')
def exact(value,keys,label):need(isinstance(value,dict) and set(value)==set(keys),f'closed {label}')
def u64(value,positive=False):return isinstance(value,str) and U64.fullmatch(value) and int(value)<2**64 and (not positive or int(value)>0)
def _unique(pairs):
    out={}
    for key,value in pairs:need(key not in out,'duplicate JSON key');out[key]=value
    return out
def _decode(data,label):return json.loads(data.decode('utf-8'),object_pairs_hook=_unique,parse_constant=lambda _:(_ for _ in ()).throw(Refused(f'nonfinite {label} JSON')))
def canonical_b64(value,size=None):
    try:raw=base64.b64decode(value,validate=True)
    except Exception:return False
    return bool(raw) and (size is None or len(raw)==size) and base64.b64encode(raw).decode()==value
def _writer(value):exact(value,{'pid','startTicks','uid'},'writer');need(type(value['pid']) is int and value['pid']>1 and u64(value['startTicks']) and value['uid']==os.geteuid(),'writer identity')
def _writable_append_fd(pid,path):
    target=os.stat(path,follow_symlinks=False);names=os.listdir(f'/proc/{pid}/fd');need(len(names)<=256,'writer fd bound');found=False
    for name in names:
        try:
            current=os.stat(f'/proc/{pid}/fd/{name}')
            if (current.st_dev,current.st_ino)!=(target.st_dev,target.st_ino):continue
            info=proc_bytes(pid,f'fdinfo/{name}',16384).decode();match=re.search(r'^flags:\s+([0-7]+)$',info,re.MULTILINE)
            if match:
                flags=int(match.group(1),8);found=found or flags&os.O_ACCMODE==os.O_WRONLY and bool(flags&os.O_APPEND)
        except FileNotFoundError:continue
    need(found,'actual writable append FD unavailable')
def _same_process(writer,child):
    _writer(writer);need(child.poll() is None and writer['pid']==child.pid,'selected writer process');need(os.stat(f'/proc/{child.pid}').st_uid==os.geteuid() and start_ticks(child.pid)==writer['startTicks'],'writer PID/start mismatch')
def _loopback_url(value,schemes):
    parsed=urllib.parse.urlsplit(value);need(parsed.scheme in schemes and parsed.hostname=='127.0.0.1' and parsed.port and not parsed.username and not parsed.password and not parsed.fragment,'closed loopback URL')
def _validated_result(value,raw,path,return_snapshot):
    if not return_snapshot:return value
    return value,{'raw':raw,'sha256':digest(raw),'bytes':len(raw),'sourcePath':str(path),'writer':dict(value['writer']),'authentication':'Observed'}

def persist_authenticated_snapshots(directory,snapshots):
    """Publish only exact bytes already validated; never reread producer files."""
    from snapshot_publication import bytes_new,json_new
    receipts={}
    for label,(value,snapshot) in snapshots.items():
        need(label in ('ready','metadata','setup') and snapshot['authentication']=='Observed' and digest(snapshot['raw'])==snapshot['sha256'],'validated snapshot binding')
        raw_path=str(Path(directory)/('authenticated-'+label+'.raw'))
        need(bool(snapshot['raw']),'authenticated nonempty snapshot')
        raw_ack=bytes_new(raw_path,snapshot['raw'],1048576)
        parsed_ack=json_new(str(Path(directory)/('authenticated-'+label+'.json')),value,1048576)
        receipts[label]={k:v for k,v in snapshot.items() if k!='raw'}
        receipts[label].update(rawPath=raw_path,sha256=raw_ack['sha256'],rawPublication=raw_ack,parsedPublication=parsed_ack)
    json_new(str(Path(directory)/'ready-producer-authentication.json'),{'readyProducerAuthenticated':True,'startupAccepted':False,'snapshots':receipts})
    return receipts

def authenticate_ready(path,host,config,return_snapshot=False):
    raw=read_bytes(str(path),65536);ready=_decode(raw,'ready');exact(ready,{'schema','runId','writer','source','profile','tacticalRevision','queueEvidenceScheme','grpcAddress','gatewayUrl','allowedOrigin','receiverUrl','sessionId','credential','metadataPath','setupPath','hostTracePath'},'ready')
    need(ready['schema']==READY_SCHEMA and ready['runId']==config['runId'] and ready['source']==config['source'] and ready['profile']==PROFILE and ready['tacticalRevision']==2 and ready['queueEvidenceScheme']==2 and ready['receiverUrl']==config['bootstrap']['receiverUrl'],'ready binding');_same_process(ready['writer'],host)
    need(re.fullmatch(r'127\.0\.0\.1:[1-9][0-9]{0,4}',ready['grpcAddress']),'grpc address');_loopback_url(ready['gatewayUrl'],{'ws','wss'});_loopback_url(ready['allowedOrigin'],{'http','https'});_loopback_url(ready['receiverUrl'],{'http','https'})
    try:need(str(uuid.UUID(ready['sessionId']))==ready['sessionId'],'session UUID')
    except (ValueError,AttributeError):raise Refused('session UUID')
    need(HEX64.fullmatch(ready['credential']),'credential shape')
    for key in ('metadataPath','setupPath','hostTracePath'):beneath(ready[key],config['roots']['attemptRoot'])
    need(ready['hostTracePath']==config['paths']['hostTrace'],'host trace path mismatch');_writable_append_fd(host.pid,ready['hostTracePath']);need(start_ticks(host.pid)==ready['writer']['startTicks'],'host changed during ready authentication');return _validated_result(ready,raw,path,return_snapshot)
def _stable_private_json(path,maximum=1048576):return _decode(read_bytes(path,maximum),'private')
def authenticate_metadata(path,ready,return_snapshot=False):
    raw=read_bytes(str(path),1048576);value=_decode(raw,'private');exact(value,{'schema','runId','writer','basis','catalogue','actors'},'metadata');need(value['schema']==METADATA_SCHEMA and value['runId']==ready['runId'] and value['writer']==ready['writer'],'metadata identity')
    basis=value['basis'];exact(basis,{'token','stateSequence','nativeFrame','matchId','processIncarnation','stateChannelIncarnation'},'basis');need(canonical_b64(basis['token']) and u64(basis['stateSequence'],True) and type(basis['nativeFrame']) is int and 0<=basis['nativeFrame']<2**32 and canonical_b64(basis['matchId'],16),'basis values');need(all(isinstance(basis[k],str) and 0<len(basis[k].encode())<=256 for k in ('processIncarnation','stateChannelIncarnation')),'basis incarnation')
    cat=value['catalogue'];exact(cat,{'id','revision','contentSha256'},'catalogue');need(canonical_b64(cat['id'],16) and u64(cat['revision'],True) and HEX64.fullmatch(cat['contentSha256']),'catalogue values')
    exact(value['actors'],{'factory','builder','combatTarget'},'actors')
    for actor in value['actors'].values():exact(actor,{'id','lifetime'},'actor');need(u64(actor['id']) and int(actor['id'])<=31999 and u64(actor['lifetime'],True),'actor values')
    return _validated_result(value,raw,path,return_snapshot)
def authenticate_setup(path,ready,return_snapshot=False):
    raw=read_bytes(str(path),65536);value=_decode(raw,'private');exact(value,{'schema','runId','writer','existingProductionDefinitionId','productDefinitionId','positions'},'setup');need(value['schema']==SETUP_SCHEMA and value['runId']==ready['runId'] and value['writer']==ready['writer'],'setup identity')
    for key in ('existingProductionDefinitionId','productDefinitionId'):need(type(value[key]) is int and 0<value[key]<2**32,'definition id')
    exact(value['positions'],{'rally','move'},'positions')
    for pos in value['positions'].values():exact(pos,{'x','z'},'position');need(all(type(pos[k]) in (int,float) and abs(pos[k])<1e7 for k in ('x','z')),'finite position')
    return _validated_result(value,raw,path,return_snapshot)
def _bounded_raw(path,maximum=16*1024*1024):
    raw=read_bytes(path,maximum);need(raw.endswith(b'\n') and b'\x00' not in raw,'incomplete or NUL journal');lines=raw.splitlines(keepends=True);need(0<len(lines)<=4096 and all(len(x)<=32768 and x.endswith(b'\n') for x in lines),'journal bounds');return raw,lines
def _bounded_live_prefix(path,maximum=16*1024*1024):
    path=components(path);before=path.stat();need(stat.S_ISREG(before.st_mode) and before.st_uid==os.geteuid() and stat.S_IMODE(before.st_mode)==0o600 and before.st_nlink==1 and 0<before.st_size<=maximum,'live prefix custody/bound')
    fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW|os.O_NONBLOCK|os.O_CLOEXEC)
    try:
        first=os.fstat(fd);need((first.st_dev,first.st_ino,first.st_uid,first.st_mode)==(before.st_dev,before.st_ino,before.st_uid,before.st_mode) and 0<first.st_size<=maximum,'live prefix identity or bound changed')
        remaining=first.st_size;chunks=[]
        while remaining:
            block=os.read(fd,min(65536,remaining));need(bool(block),'live prefix truncated');chunks.append(block);remaining-=len(block)
        last=os.fstat(fd);need((last.st_dev,last.st_ino)==(first.st_dev,first.st_ino) and last.st_size>=first.st_size,'live prefix truncated or replaced')
    finally:os.close(fd)
    raw=b''.join(chunks);need(raw.endswith(b'\n') and b'\x00' not in raw,'incomplete or NUL live prefix');lines=raw.splitlines(keepends=True);need(0<len(lines)<=4096 and all(len(x)<=32768 and x.endswith(b'\n') for x in lines),'live prefix bounds');return raw,lines,first
def journal_complete(path,schema,run_id):
    try:
        _,lines=_bounded_raw(path);row=_decode(lines[-1],'journal');return row.get('schema')==schema and row.get('runId')==run_id and row.get('kind')=='complete'
    except (FileNotFoundError,Refused,OSError,ValueError,UnicodeError):return False
def _validate_journal(lines,schema,run_id,writer,source):
    rows=[]
    for index,line in enumerate(lines,1):
        row=_decode(line,'journal');exact(row,{'schema','runId','sequence','kind','writer','source','value'},'journal row');need(row['schema']==schema and row['runId']==run_id and u64(row['sequence'],True) and int(row['sequence'])==index and row['writer']==writer and row['source']==source,'journal binding');rows.append(row)
    need(rows[0]['kind']=='header' and rows[-1]['kind']=='complete','journal completion envelope')
    for row in (rows[0],rows[-1]):exact(row['value'],{'selectedCase'},'completion value');need(row['value']['selectedCase']=='stock-smoke-count1','selected case')
    return rows
def authenticate_capture_writer(path,browser,config):
    _,lines=_bounded_raw(path);header=_decode(lines[0],'capture header');exact(header,{'schema','runId','sequence','kind','writer','source','value'},'capture header');writer=header['writer'];exact(writer,{'pid','startTicks','uid','executable','sourcePath','sourceSha256'},'capture writer')
    pid=writer['pid'];need(type(pid) is int and pid>1 and os.getpgid(pid)==browser.pid and os.getsid(pid)==browser.pid and browser.poll() is None,'capture writer outside retained browser group');selected={'pid':pid,'startTicks':start_ticks(pid),'uid':os.stat(f'/proc/{pid}').st_uid};need(selected['startTicks']==writer['startTicks'],'capture writer changed')
    verify_capture_writer(selected,writer,config['artifacts']['captureRuntime'],config['artifacts']['captureSource']);_writable_append_fd(pid,path);_validate_journal(lines,CAPTURE_SCHEMA,config['runId'],writer,config['source']);return selected,writer
def authenticate_host_writer(path,host,ready,config):
    _same_process(ready['writer'],host);_writable_append_fd(host.pid,path);_,lines=_bounded_raw(path);_validate_journal(lines,HOST_JOURNAL_SCHEMA,config['runId'],ready['writer'],config['source']);return {'pid':host.pid,'startTicks':ready['writer']['startTicks'],'uid':ready['writer']['uid']}
def _freeze_prefix(path,target,verifier,schema,run_id,writer,source):
    before=verifier();raw,lines=_bounded_raw(path);rows=_validate_journal(lines,schema,run_id,writer,source);st=components(path).stat();need(stat.S_ISREG(st.st_mode) and st.st_uid==os.geteuid() and stat.S_IMODE(st.st_mode)==0o600 and st.st_nlink==1,'journal custody');after=verifier();need(before==after,'writer changed during freeze');sha=atomic_bytes_new(target,raw,16*1024*1024);return {'path':target,'sha256':sha,'bytes':len(raw),'records':len(rows),'firstSequence':'1','lastSequence':str(len(rows)),'sourcePath':path,'sourceDevice':st.st_dev,'sourceInode':st.st_ino,'sourceSize':st.st_size,'sourceMtimeNs':st.st_mtime_ns,'writer':after}
def freeze_host_prefix(path,target,host,ready,config):return _freeze_prefix(path,target,lambda:authenticate_host_writer(path,host,ready,config),HOST_JOURNAL_SCHEMA,config['runId'],ready['writer'],config['source'])
def freeze_capture_prefix(path,target,browser,config):
    _,writer=authenticate_capture_writer(path,browser,config);return _freeze_prefix(path,target,lambda:authenticate_capture_writer(path,browser,config)[0],CAPTURE_SCHEMA,config['runId'],writer,config['source'])
def freeze_trace_prefix(process,engine,plugin,trace_path,target,run_id):
    need(RUN.fullmatch(run_id),'run id');before=verify_process(process,engine,plugin,trace_path);raw,lines,st=_bounded_live_prefix(trace_path);sequence=0
    for line in lines:
        row=_decode(line,'trace');exact(row,{'schema','runId','sequence','phase','readFrame','perspectiveTeamId','nativeBasis','context','reader','queue','dispatch'},'trace record');need(row['schema']==TRACE_SCHEMA and row['runId']==run_id and u64(row['sequence'],True) and int(row['sequence'])==sequence+1 and row['phase'] in ('sample','final-read'),'trace sequence');sequence+=1
    after=verify_process(process,engine,plugin,trace_path);need(before==after,'process changed during trace freeze');sha=atomic_bytes_new(target,raw,16*1024*1024);return {'path':target,'sha256':sha,'bytes':len(raw),'records':len(lines),'firstSequence':'1','lastSequence':str(sequence),'sourcePath':trace_path,'sourceDevice':st.st_dev,'sourceInode':st.st_ino,'sourceSize':len(raw),'sourceMtimeNs':st.st_mtime_ns,'process':after}
def revalidate_growing_prefix(receipt,verifier):
    need(type(receipt.get('bytes')) is int and 0<receipt['bytes']<=16*1024*1024 and HEX64.fullmatch(receipt.get('sha256','')),'closed prefix receipt')
    before=verifier();path=components(receipt['sourcePath']);current=path.stat();need(stat.S_ISREG(current.st_mode) and current.st_uid==os.geteuid() and stat.S_IMODE(current.st_mode)==0o600 and current.st_nlink==1,'live prefix custody')
    need((current.st_dev,current.st_ino)==(receipt['sourceDevice'],receipt['sourceInode']) and receipt['bytes']<=current.st_size<=16*1024*1024,'live prefix replaced, truncated, or oversized')
    fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW|os.O_NONBLOCK|os.O_CLOEXEC)
    try:
        opened=os.fstat(fd);need((opened.st_dev,opened.st_ino)==(receipt['sourceDevice'],receipt['sourceInode']) and receipt['bytes']<=opened.st_size<=16*1024*1024,'live prefix identity changed')
        remaining=receipt['bytes'];chunks=[]
        while remaining:
            block=os.read(fd,min(65536,remaining));need(bool(block),'live prefix truncated');chunks.append(block);remaining-=len(block)
        final=os.fstat(fd);need((final.st_dev,final.st_ino)==(opened.st_dev,opened.st_ino) and receipt['bytes']<=final.st_size<=16*1024*1024,'live prefix changed during validation')
    finally:os.close(fd)
    need(digest(b''.join(chunks))==receipt['sha256'],'authenticated prefix bytes changed');after=verifier();need(before==after,'writer changed during prefix validation');return {'prefixBytes':receipt['bytes'],'observedBytes':final.st_size,'suffixBytes':final.st_size-receipt['bytes']}
def revalidate_frozen_source(receipt,verifier):
    current=components(receipt['sourcePath']).stat();need((current.st_dev,current.st_ino,current.st_size,current.st_mtime_ns)==(receipt['sourceDevice'],receipt['sourceInode'],receipt['sourceSize'],receipt['sourceMtimeNs']),'producer changed after freeze');verifier();return True
def materialize_stock_handoff(config,ready,metadata,setup,target):
    need(ready['runId']==metadata['runId']==setup['runId']==config['runId'],'cross-run handoff');packet=Path(config['roots']['packetRoot']);artifacts={role:{'path':str(Path(config['artifacts'][role]['path']).relative_to(packet)),'sha256':config['artifacts'][role]['sha256']} for role in HANDOFF_ROLES}
    expected={'profile':PROFILE,'tacticalRevision':2,'queueEvidenceScheme':2,'queueBridge':BRIDGE,'supportedQueueFields':['domain','id','options.coded','tag','float32params'],'actor':metadata['actors']['factory'],'catalogue':metadata['catalogue'],'source':{'matchId':metadata['basis']['matchId'],'processIncarnation':metadata['basis']['processIncarnation'],'stateChannelIncarnation':metadata['basis']['stateChannelIncarnation']}}
    handoff={'schema':HANDOFF_SCHEMA,'runId':config['runId'],'packetSha256':config['packetSha256'],'fixtureMode':False,'profile':PROFILE,'protocolVersion':2,'tacticalRevision':2,'queueEvidenceScheme':2,'queueBridge':BRIDGE,'guestAbiVersion':1,'selection':config['expected']['selection'],'source':config['source'],'artifacts':artifacts,'paths':config['paths'],'connection':{key:ready[key] for key in ('sessionId','credential','grpcAddress','gatewayUrl','allowedOrigin','receiverUrl')},'actors':metadata['actors'],'setup':{key:setup[key] for key in ('existingProductionDefinitionId','productDefinitionId','positions')},'expected':expected}
    encoded=(json.dumps(handoff,separators=(',',':'),allow_nan=False)+'\n').encode();need(len(encoded)<=65536,'handoff bound');sha=atomic_new(target,handoff);return {'path':target,'sha256':sha,'bytes':len(encoded)}
def invoke_pinned_normalizer(config,frozen_trace,frozen_host,frozen_capture,output,timeout=15):
    runtime=config['artifacts']['normalizerRuntime'];source=config['artifacts']['fsbarNormalizer'];hash_artifact(runtime['path'],runtime['sha256']);hash_artifact(source['path'],source['sha256']);need(not Path(output).exists(),'normalizer output must be absent');need(type(timeout) in (int,float) and 0<timeout<=15,'normalizer deadline')
    argv=[runtime['path'],source['path'],'--stock-trace',frozen_trace,'--host-snapshot',frozen_host,'--browser-observation',frozen_capture,'--output',output];result=subprocess.run(argv,env={'PATH':'/usr/bin:/bin'},stdin=subprocess.DEVNULL,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=timeout,check=False);need(result.returncode==0,'pinned FSBar normalizer failed');data=read_bytes(output,4*1024*1024);return {'path':output,'sha256':digest(data),'bytes':len(data)}

# Pre-Arm source-specific live prefixes: explicitly nonterminal, no invented footer.
def freeze_prearm_host_prefix(path,target,host,ready,config,deadline):
    return _freeze_prearm_owned(path,target,'host',host,ready,config,deadline)
def freeze_prearm_raw_prefix(path,target,host,ready,config,deadline):
    return _freeze_prearm_owned(path,target,'raw',host,ready,config,deadline)
def _freeze_prearm_owned(path,target,role,host,ready,config,deadline):
    import time
    from qualify_prearm import prefix_bytes,records,pin_keys
    from snapshot_publication import bytes_new
    need(time.monotonic()<deadline,'prearm prefix deadline');_same_process(ready['writer'],host);_writable_append_fd(host.pid,path)
    p=components(path);st=p.stat();maximum=4*1024*1024 if role=='raw' else 16*1024*1024
    need(stat.S_ISREG(st.st_mode) and st.st_uid==os.geteuid() and stat.S_IMODE(st.st_mode)==0o600 and st.st_nlink==1 and 0<st.st_size<=maximum,'prearm live prefix custody')
    # A placeholder digest is not accepted: read exact observed extent, then
    # revalidate it with the retained descriptor reader before publication.
    fd=os.open(p,os.O_RDONLY|os.O_NOFOLLOW|os.O_CLOEXEC|os.O_NONBLOCK)
    try:
        first=os.fstat(fd);need((first.st_dev,first.st_ino)==(st.st_dev,st.st_ino),'prefix opened identity');raw=[];offset=0
        while offset<first.st_size:
            need(time.monotonic()<deadline,'prefix finite read deadline');block=os.pread(fd,min(65536,first.st_size-offset),offset);need(block,'prefix truncated');raw.append(block);offset+=len(block)
        after=os.fstat(fd);need((after.st_dev,after.st_ino)==(first.st_dev,first.st_ino) and after.st_size>=first.st_size and after.st_size<=maximum,'prefix append identity')
    finally:os.close(fd)
    body=b''.join(raw);rows=records(body,role)
    for row in rows:
        if role=='host':
            exact(row,{'schema','runId','sequence','kind','writer','source','value'},'prearm host row');need(row['schema']==HOST_JOURNAL_SCHEMA and row['kind']!='complete','live host cannot claim completion')
        else:
            exact(row,{'schema','runId','sequence','kind','writer','source','acceptedGeneration','stateSequence','nativeFrame','disposition','value'},'prearm raw row');need(row['schema']=='fsbar.barc-one-unit-raw-state-journal/v1','raw schema')
        need(row['runId']==config['runId'] and row['writer']==ready['writer'] and row['source']==config['source'],'prefix exact producer origin')
    if role=='host':need(rows[0]['kind']=='header' and rows[0]['value']=={'selectedCase':'stock-smoke-count1'},'host real header')
    else:need(len({row['acceptedGeneration']for row in rows})==1 and rows[0]['acceptedGeneration'],'raw owning generation')
    live={'path':str(p),'sha256':digest(body),'bytes':len(body),'device':first.st_dev,'inode':first.st_ino,'uid':first.st_uid,'mode':stat.S_IMODE(first.st_mode),'nlink':first.st_nlink}
    need(prefix_bytes(live,maximum,deadline)==body,'prefix revalidation');_same_process(ready['writer'],host);_writable_append_fd(host.pid,path)
    ack=bytes_new(target,body,maximum);retained={k:ack[k]for k in ['path','sha256','bytes','device','inode','uid','mode','nlink']}
    measured=p.stat().st_size
    return {'schema':'bar.prearm-live-prefix-observation/v1','role':role,'livePin':live,'retainedPin':retained,'writer':dict(ready['writer']),'terminal':False,'observedBytes':measured,'suffixBytes':measured-len(body)}

def collect_prearm(p,ready,metadata,setup,host,engine,policy,deadline,started_ns):
    """Actual concrete producer joins; called once predicates are observed.
    No Node, browser, commands or approval records are generated here.
    """
    import time,copy
    import mechanics as m
    from snapshot_publication import json_new
    from loaded_custody import persist_loaded_custody
    from qualify_prearm import derive,prefix_bytes,records
    A=Path(p['attemptRoot']);root=A/'evidence';cfg=copy.deepcopy(p['seed']['configuration']);need(cfg['source']==p['source'] and cfg['runId']==p['runId'],'seed configuration source')
    cfg['commands']['engine']=__import__('startup_runner').commands(p)['engine']
    config_path=root/'seed-effective-launch-config.json';json_new(config_path,cfg);config_pin=m.physical(config_path)
    process={'pid':engine.pid,'startTicks':start_ticks(engine.pid),'uid':os.geteuid()}
    persist_loaded_custody(process,cfg,A,config_pin['sha256'])
    result=policy.consume('browser',cfg,deadline)
    json_new(root/'infolog-policy-result.json',result);json_new(root/'infolog-policy-effects.json',policy.settlement_effects)
    infolog={'result':m.physical(root/'infolog-policy-result.json'),'effects':m.physical(root/'infolog-policy-effects.json'),'config':cfg,'configPin':config_pin,'producer':m.physical(Path(__file__).parent/'growing_log.py'),'transports':[m.physical(root/('policy-'+str(n)+'.transport.json'))for n in range(1,policy.context.evaluations+1)]}
    prefixes={}
    for role in ['raw','host']:
        source=A/'host'/('raw.jsonl'if role=='raw'else 'host.jsonl');receipt=_freeze_prearm_owned(str(source),str(root/(role+'-prefix.raw')),role,host,ready,cfg,deadline)
        json_new(root/(role+'-prefix.json'),receipt);prefixes[role]=receipt
    stock=freeze_trace_prefix(process,cfg['artifacts']['engine'],cfg['artifacts']['plugin'],str(A/'engine/stock.jsonl'),str(root/'stock-prefix.raw'),cfg['runId'])
    st=Path(stock['sourcePath']).stat();live={k:stock[k]for k in ['sha256','bytes']};live.update(path=stock['sourcePath'],device=stock['sourceDevice'],inode=stock['sourceInode'],uid=st.st_uid,mode=stat.S_IMODE(st.st_mode),nlink=st.st_nlink)
    prefixes['stock']={'schema':'bar.prearm-live-prefix-observation/v1','role':'stock','livePin':live,'retainedPin':m.physical(stock['path']),'writer':process,'terminal':False,'observedBytes':st.st_size,'suffixBytes':st.st_size-stock['bytes']};json_new(root/'stock-prefix.json',prefixes['stock'])
    horizons={'schema':'bar.prearm-prefix-observations/v2','prefixes':{k:m.physical(root/(k+'-prefix.json'))for k in prefixes},'infolog':infolog};json_new(root/'prefix-evidence.json',horizons)
    inputs={k:prefixes[k]['livePin']for k in prefixes}
    for label in ['metadata','setup']:inputs[label]=m.physical(root/('authenticated-'+label+'.raw'))
    evidence=copy.deepcopy(p['seed']['configurationInputs']);evidence.update(loaded=m.physical(A/'runtime-closure-custody.json'),settings=m.physical(A/'engine-settings-copy.json'),configPin=config_pin,infolog=infolog);evidence['roles']['settings']=m.physical(A/'engine/springsettings.cfg');json_new(root/'native-evidence-inputs.json',evidence);inputs['configuration']=m.physical(root/'native-evidence-inputs.json')
    rows=records(prefix_bytes(inputs['raw'],4*1024*1024,deadline),'raw')
    contract={'schema':'bar.prearm-sealed-input-contract/v1','runId':cfg['runId'],'source':p['source'],'writer':ready['writer'],'acceptedGeneration':rows[0]['acceptedGeneration'],'factory':metadata['actors']['factory'],'setup':{'seedCount':3,'seedDefinitionId':setup['existingProductionDefinitionId'],'productDefinitionId':setup['productDefinitionId']},'inputs':inputs,'completeRecordEvidence':m.physical(root/'prefix-evidence.json'),'lifecycle':{'startedMonotonicNs':str(started_ns),'transitionDeadlineMonotonicNs':str(int(deadline*1e9)),'totalDeadlineMonotonicNs':str(started_ns+180_000_000_000)},'outputPath':str(root/'seed-qualification.json')}
    json_new(root/'seed-input-contract.json',contract);qualification=derive(contract,min(deadline,time.monotonic()+10));ack=json_new(root/'seed-qualification.json',qualification,65536)
    for role in prefixes:need(prefix_bytes(inputs[role],4*1024*1024 if role=='raw'else 16*1024*1024,deadline),'final live prefix')
    return {'qualification':qualification,'publication':ack,'canonicalPolicyConsumed':True,'contract':m.physical(root/'seed-input-contract.json'),'seedQualificationAccepted':True}
