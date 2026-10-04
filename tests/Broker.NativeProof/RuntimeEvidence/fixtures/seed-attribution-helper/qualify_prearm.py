"""Bounded SOURCE pre-Arm reducer. Controlled tests are not native evidence.
No process/tool/network/command effects. Genuine originals and canonical policy
receipts are supplied by a separately admitted owning supervisor, never made here.
"""
import os, stat, json, hashlib, pathlib, re, time, sys, base64, struct, math
MAX_RAW=4*1024*1024; MAX_ROWS=8192; MAX_ROW=32768; MAX_OUTPUT=65536
class Refused(Exception): pass
def need(ok,code):
 if not ok:raise Refused(code)
def exact(v,keys,label):need(type(v)is dict and set(v)==set(keys),label+'-fields')
def unique(pairs):
 d={}
 for k,v in pairs:need(k not in d,'duplicate-json-key');d[k]=v
 return d
def finite(value):
 result=float(value);need(math.isfinite(result),'nonfinite-json');return result
def parse(body):
 need(b'\0'not in body,'nul');return json.loads(body.decode('utf8'),object_pairs_hook=unique,parse_float=finite,parse_constant=lambda _:(_ for _ in()).throw(Refused('nonfinite-json')))
def sha(body):return hashlib.sha256(body).hexdigest()
def dec(v):need(type(v)is str and re.fullmatch(r'0|[1-9][0-9]*',v)and int(v)<=2**64-1,'decimal');return int(v)
def pin_keys(p):exact(p,['path','sha256','bytes','device','inode','uid','mode','nlink'],'pin');need(type(p['path'])is str and pathlib.Path(p['path']).is_absolute()and str(pathlib.Path(p['path']))==p['path']and re.fullmatch('[0-9a-f]{64}',p['sha256']),'pin-format')
def held_bytes(pin,limit,deadline):
 pin_keys(pin);need(type(pin['bytes'])is int and 0<pin['bytes']<=limit,'input-byte-bound')
 path=pathlib.Path(pin['path'])
 for parent in path.parents:need(stat.S_ISDIR(parent.lstat().st_mode)and not parent.is_symlink(),'ancestor-link')
 fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW|os.O_CLOEXEC)
 try:
  def identity():
   s=os.fstat(fd);need(stat.S_ISREG(s.st_mode)and s.st_nlink==1,'input-file-custody');need(all(getattr(s,k)==pin[v]for k,v in [('st_size','bytes'),('st_dev','device'),('st_ino','inode'),('st_uid','uid'),('st_nlink','nlink')])and stat.S_IMODE(s.st_mode)==pin['mode'],'input-physical-drift');need(path.lstat().st_ino==s.st_ino and path.lstat().st_dev==s.st_dev and not path.is_symlink(),'input-path-replacement')
  identity();parts=[];left=pin['bytes'];offset=0
  while left:
   need(time.monotonic()<deadline,'reducer-deadline');chunk=os.pread(fd,min(left,65536),offset);need(chunk,'short-input');parts.append(chunk);offset+=len(chunk);left-=len(chunk)
  need(not os.pread(fd,1,offset),'input-grew');body=b''.join(parts);need(sha(body)==pin['sha256'],'input-body-drift');identity();return body
 finally:os.close(fd)
def prefix_bytes(pin,limit,deadline):
 pin_keys(pin);need(type(pin['bytes'])is int and 0<pin['bytes']<=limit,'prefix-byte-bound')
 path=pathlib.Path(pin['path'])
 for parent in path.parents:need(stat.S_ISDIR(parent.lstat().st_mode) and not parent.is_symlink(),'ancestor-link')
 fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW|os.O_CLOEXEC)
 try:
  def check():
   s=os.fstat(fd);named=path.lstat();need(stat.S_ISREG(s.st_mode) and s.st_nlink==1 and s.st_size>=pin['bytes'] and s.st_size<=limit and s.st_uid==pin['uid'] and stat.S_IMODE(s.st_mode)==pin['mode'] and (s.st_dev,s.st_ino)==(pin['device'],pin['inode']) and (named.st_dev,named.st_ino)==(s.st_dev,s.st_ino),'prefix-custody-drift');return s
  check();parts=[];offset=0
  while offset<pin['bytes']:
   need(time.monotonic()<deadline,'reducer-deadline');part=os.pread(fd,min(65536,pin['bytes']-offset),offset);need(part,'short-prefix');parts.append(part);offset+=len(part)
  body=b''.join(parts);need(sha(body)==pin['sha256'],'prefix-mutation');check();return body
 finally:os.close(fd)
def records(body,label):
 need(body.endswith(b'\n'),'partial-record-'+label);lines=body.splitlines(keepends=True);need(0<len(lines)<=(MAX_ROWS if label=='raw'else 4096),'record-count-'+label);need(all(len(x)<=MAX_ROW for x in lines),'record-byte-'+label);rows=[parse(x)for x in lines]
 need(all(dec(x['sequence'])==i+1 for i,x in enumerate(rows)),'record-order-'+label);return rows
def same(a,b):return a==b
def reference(v):exact(v,['id','lifetime'],'reference');need(dec(v['id'])>0 and dec(v['lifetime'])>0,'reference-positive');return v
def b64(v,lo,hi):
 need(type(v)is str,'base64-type')
 try:raw=base64.b64decode(v,validate=True)
 except Exception:raise Refused('base64')
 need(lo<=len(raw)<=hi and base64.b64encode(raw).decode()==v,'base64-canonical');return raw
def basis(v):
 exact(v,['token','stateSequence','frame','matchIncarnation','processIncarnation','stateChannelIncarnation','snapshotSendMonotonicNs','effectiveCadenceFrames'],'native-basis')
 b64(v['token'],1,64);b64(v['matchIncarnation'],16,16);need(dec(v['stateSequence'])>0 and dec(v['snapshotSendMonotonicNs'])>0,'basis-positive')
 need(type(v['frame'])is int and 0<=v['frame']<=2**32-1 and type(v['effectiveCadenceFrames'])is int and 0<v['effectiveCadenceFrames']<=2**32-1,'basis-frame-cadence')
 need(all(type(v[k])is str and 0<len(v[k].encode())<=256 for k in ['processIncarnation','stateChannelIncarnation']),'native-basis-identity');return v
def live_process(process):
 # pidfd pins this generation during the two /proc reads; no signal is sent.
 fd=os.pidfd_open(process['pid'],0)
 try:
  def read():
   text=pathlib.Path('/proc/'+str(process['pid'])+'/stat').read_text();tail=text[text.rfind(')')+2:].split();uid=pathlib.Path('/proc/'+str(process['pid'])+'/status').read_text();m=re.search(r'^Uid:\s+(\d+)\s+',uid,re.M)
   need(len(tail)>19 and tail[0] not in ['Z','X']and m and tail[19]==process['startTicks']and int(m[1])==process['uid'],'live-pid-generation')
  read();read()
 finally:os.close(fd)
def mapped_roles(processes,roles):
 engines=[p for p in processes if p['role']=='engine'];need(len(engines)==1,'engine-process-custody')
 with open('/proc/'+str(engines[0]['pid'])+'/maps','rb')as stream:body=stream.read(1024*1024+1)
 need(len(body)<=1024*1024,'loaded-maps-bound');lines=body.decode().splitlines()
 for role in ['engine','plugin']:
  pin=roles[role];found=False
  for line in lines:
   fields=line.split(None,5)
   if len(fields)==6 and fields[5]==pin['path']:
    dev=fields[3].split(':');found=found or (int(fields[4])==pin['inode']and os.makedev(int(dev[0],16),int(dev[1],16))==pin['device'])
  need(found,'current-engine-plugin-mapping')
def framed(value,magic):
 need(type(value)is str and value.isascii()and '\0'not in value and len(value)<=8192 and value.endswith('\n'),'stock-frame')
 lines=value[:-1].split('\n');need(len(lines)>=3 and lines[0]==magic and lines[-1]=='end'and all(len(x)<=512 for x in lines),'stock-framing');need(re.fullmatch(r'length=[0-9]{8}',lines[1])and int(lines[1][7:])==len(value),'stock-frame-length');return lines
def field(value,name):need(value.startswith(name+'='),'stock-field');return value[len(name)+1:]
def row_text(row):return row['domain']+'|'+str(row['id'])+'|'+str(row['codedOptions'])+'|'+str(row['tag'])+'|'+','.join(row['float32params'])
def stock_revision(c,rows):
 parts=[b'barc-stock-queue-revision/1\0']
 def add(tag,v):parts.append(bytes([tag])+struct.pack('>I',len(v))+v)
 u32=lambda v:struct.pack('>I',v);u64=lambda v:struct.pack('>Q',int(v))
 values=[u32(2),c['profile'].encode(),u32(2),b64(c['catalogueId'],16,16),u64(c['catalogueRevision']),c['engineVersion'].encode(),c['gameName'].encode(),c['gameVersion'].encode(),bytes.fromhex(c['contentSha256']),u32(int(c['actor']['id'])),u64(c['actor']['lifetime']),c['domain'].encode(),u32(len(rows))]
 for n,v in enumerate(values,1):add(n,v)
 for row in rows:add(14,row_text(row).encode('ascii'))
 return str(int.from_bytes(hashlib.sha256(b''.join(parts)).digest()[:8],'big')or 1)
def stock_record(r):
 exact(r,['schema','runId','sequence','phase','readFrame','perspectiveTeamId','nativeBasis','context','reader','queue','dispatch'],'stock-row');basis(r['nativeBasis']);need(type(r['readFrame'])is int and 0<=r['readFrame']<=2**32-1 and type(r['perspectiveTeamId'])is int and 0<=r['perspectiveTeamId']<=255,'stock-envelope')
 c=r['context'];exact(c,['profile','tacticalRevision','queueEvidenceScheme','actor','catalogueId','catalogueRevision','engineVersion','gameName','gameVersion','contentSha256','domain'],'stock-context');reference(c['actor']);b64(c['catalogueId'],16,16)
 need(c['profile']=='barc-live-tactical-stock-v1'and c['tacticalRevision']==2 and c['queueEvidenceScheme']==2 and c['engineVersion']=='2026.07.04'and c['domain']in ['production','rally']and int(c['actor']['id'])<=31999 and dec(c['catalogueRevision'])>0 and re.fullmatch('[0-9a-f]{64}',c['contentSha256'])and all(type(c[k])is str and 0<len(c[k].encode())<=256 for k in ['gameName','gameVersion']),'stock-context-identity')
 reader=r['reader'];exact(reader,['kind','status','request','response'],'stock-reader');need(reader['kind']=='CallRules'and reader['status']in ['complete','unavailable','malformed'],'stock-reader-kind')
 req=framed(reader['request'],'BARC_QUEUE_REQUEST/1');need(len(req)==6 and field(req[2],'bridge')=='barc-stock-queue-reader-v1'and field(req[3],'domain')==c['domain']and field(req[4],'unit')==c['actor']['id'],'stock-request')
 if reader['status']!='complete':need(reader['response']is None and r['queue']is None,'unavailable-stock-fabrication');return
 response=framed(reader['response'],'BARC_QUEUE_RESPONSE/1');need(len(response)>=9 and response[2]==req[2]and field(response[3],'request-sha256')==sha(reader['request'].encode())and field(response[4],'status')=='ok'and response[5]=='domain='+c['domain']and response[6]=='unit='+c['actor']['id'],'stock-response-echo')
 count=dec(field(response[7],'count'));need(count<=64 and len(response)==count+9,'stock-response-count');q=r['queue'];exact(q,['revision','entries'],'stock-queue');need(type(q['entries'])is list and len(q['entries'])==count and dec(q['revision'])>0,'stock-queue-count');expanded=[];params=0
 for row,line in zip(q['entries'],response[8:-1]):
  exact(row,['id','codedOptions','tag','float32params'],'stock-entry');need(all(type(row[k])is int and -2**31<=row[k]<2**31 for k in ['id','tag'])and type(row['codedOptions'])is int and 0<=row['codedOptions']<=65535 and type(row['float32params'])is list and len(row['float32params'])<=16,'stock-entry-bound')
  for bits in row['float32params']:need(type(bits)is str and re.fullmatch('[0-9a-f]{8}',bits)and ((int(bits,16)>>23)&255)!=255,'stock-float32')
  params+=len(row['float32params']);x={'domain':c['domain'],**row};need(field(line,'row')==row_text(x),'stock-response-row');expanded.append(x)
 need(params<=256 and q['revision']==stock_revision(c,expanded),'stock-revision')

def configuration_evidence(cfg,contract,deadline):
 from native_evidence import configuration
 return configuration(cfg,contract,deadline)

def derive(contract,deadline):
 exact(contract,['schema','runId','source','writer','acceptedGeneration','factory','setup','inputs','completeRecordEvidence','lifecycle','outputPath'],'contract')
 need(contract['schema']=='bar.prearm-sealed-input-contract/v1','contract-schema');lifecycle=contract['lifecycle'];exact(lifecycle,['startedMonotonicNs','transitionDeadlineMonotonicNs','totalDeadlineMonotonicNs'],'lifecycle');start,transition,total=(dec(lifecycle[k])for k in ['startedMonotonicNs','transitionDeadlineMonotonicNs','totalDeadlineMonotonicNs']);need(start<=time.monotonic_ns()<transition<=total and total-start<=180_000_000_000,'owned-lifecycle-expired-or-unbounded');exact(contract['source'],['fsbarCommit','highbarCommit'],'source');need(all(re.fullmatch('[0-9a-f]{40}',v)for v in contract['source'].values()),'source-commit')
 need(re.fullmatch('[A-Za-z0-9._-]{1,64}',contract['runId'])and type(contract['acceptedGeneration'])is str and contract['acceptedGeneration'],'run-generation');exact(contract['writer'],['pid','startTicks','uid'],'writer');dec(contract['writer']['startTicks']);reference(contract['factory'])
 exact(contract['setup'],['seedCount','seedDefinitionId','productDefinitionId'],'setup');setup=contract['setup'];need(type(setup['seedCount'])is int and 1<=setup['seedCount']<=16 and type(setup['seedDefinitionId'])is int and setup['seedDefinitionId']>0 and type(setup['productDefinitionId'])is int and setup['productDefinitionId']>0 and setup['seedDefinitionId']!=setup['productDefinitionId'],'finite-distinct-seeds')
 exact(contract['inputs'],['raw','host','stock','metadata','setup','configuration'],'inputs');limits={'raw':MAX_RAW,'host':16*1024*1024,'stock':16*1024*1024,'metadata':65536,'setup':65536,'configuration':65536};bodies={k:(prefix_bytes(v,limits[k],deadline) if k in ['raw','host','stock'] else held_bytes(v,limits[k],deadline)) for k,v in contract['inputs'].items()}
 from native_evidence import horizons
 horizons(parse(held_bytes(contract['completeRecordEvidence'],65536,deadline)),contract,bodies,deadline)
 raw=records(bodies['raw'],'raw');host=records(bodies['host'],'host');stock=records(bodies['stock'],'stock');metadata=parse(bodies['metadata']);setup_record=parse(bodies['setup']);loaded=configuration_evidence(parse(bodies['configuration']),contract,deadline)
 need(metadata.get('schema')=='fsbar.barc-stock-native-smoke-metadata/v1'and metadata.get('runId')==contract['runId']and metadata.get('writer')==contract['writer']and metadata.get('actors',{}).get('factory')==contract['factory'],'actual-metadata-origin')
 need(setup_record.get('schema')=='fsbar.barc-stock-native-smoke-setup/v1'and setup_record.get('runId')==contract['runId']and setup_record.get('writer')==contract['writer']and setup_record.get('existingProductionDefinitionId')==setup['seedDefinitionId']and setup_record.get('productDefinitionId')==setup['productDefinitionId'],'actual-setup-origin')
 origin={k:contract[k]for k in ['runId','source','writer','acceptedGeneration']};previous_state=0;previous_frame=0
 for row in raw:
  exact(row,['schema','runId','sequence','kind','writer','source','acceptedGeneration','stateSequence','nativeFrame','disposition','value'],'raw-row');need(row['schema']=='fsbar.barc-one-unit-raw-state-journal/v1'and all(row[k]==v for k,v in origin.items()),'raw-origin');seq=dec(row['stateSequence']);need(seq>=previous_state and type(row['nativeFrame'])is int and row['nativeFrame']>=previous_frame,'raw-state-frame-order');previous_state=seq;previous_frame=row['nativeFrame'];need(row['disposition']in ['materialized','invalidated','liveness-only']and row['kind']in ['snapshot','unit-created','unit-finished','command-dispatch'],'gap-or-raw-kind');need(row['kind']!='command-dispatch','prearm-dispatch')
 for row in host:
  exact(row,['schema','runId','sequence','kind','writer','source','value'],'host-row');need(row.get('schema')=='fsbar.barc-stock-host-journal/v1'and all(row.get(k)==contract[k]for k in ['runId','writer','source']),'host-origin');need(row.get('kind')!='result','prearm-broker-result');need(row.get('kind') not in ['gap','detach','identity-conflict'],'host-generation-refusal');need(not (row.get('kind')=='stale' and any(x in str(row['value'].get('detail','')).lower() for x in ['gap','detach','identity','incarnation'])),'host-generation-refusal')
 process=metadata['basis']['processIncarnation'];channel=metadata['basis']['stateChannelIncarnation'];match=metadata['basis']['matchId'];need(process and channel and match,'metadata-incarnations')
 snapshots={};metadata_rows=[]
 for row in host:
  if row['kind']=='live-metadata'and type(row['value'].get('tactical'))is dict:
   t=row['value']['tactical'];b=basis(t['basis']);need(b['processIncarnation']==process and b['stateChannelIncarnation']==channel and b['matchIncarnation']==match,'metadata-generation-basis');need(type(t.get('actors'))is list and len(t['actors'])<=4096,'metadata-actor-bound');refs=[reference(a['actor'])for a in t['actors']if a.get('actor')];need(len({a['id']for a in refs})==len(refs),'metadata-actor-lifetime-ambiguity');metadata_rows.append(t)
 def joined(row):
  found=[t for t in metadata_rows if t['basis']['stateSequence']==row['stateSequence']and t['basis']['frame']==row['nativeFrame']];need(len(found)>=1,'same-basis-native-metadata-missing');need(all(t==found[0]for t in found),'contradictory-metadata');return found[0]
 for row in raw:
  if row['kind']=='snapshot':
   need(row['disposition']=='materialized','snapshot-not-materialized');t=joined(row);units=row['value']['units'];need(type(units)is list and len(units)<=4096 and len({str(u['unitId'])for u in units})==len(units),'snapshot-unit-set');snapshots[dec(row['sequence'])]=(row,t)
 seed_created=[r for r in raw if r['kind']=='unit-created'and str(r['value'].get('builderId'))==contract['factory']['id']];need(len(seed_created)==setup['seedCount'],'seed-creation-count');ids=[str(r['value']['unitId'])for r in seed_created];need(len(set(ids))==len(ids)and '0'not in ids,'seed-creation-identities')
 seed_finished=[r for r in raw if r['kind']=='unit-finished'and str(r['value'].get('unitId'))in ids];need(len(seed_finished)==len(ids)and len({str(r['value']['unitId'])for r in seed_finished})==len(ids),'seed-finish-count')
 completion=loaded['setupCompletion'];need(completion['completionNativeFrame']<min(r['nativeFrame'] for r in seed_created),'setup-after-creation')
 first_created=min(dec(r['sequence'])for r in seed_created);initials=[v for n,v in snapshots.items()if n<first_created];need(initials,'preseed-complete-baseline-missing');initial,t0=initials[-1];known={str(u['unitId'])for u in initial['value']['units']};need(contract['factory'] in [reference(a['actor'])for a in t0['actors']if a.get('actor')],'preseed-factory-lifetime');need(not known.intersection(ids),'seed-already-in-baseline')
 initial_empty=[r for r in stock if r.get('reader',{}).get('status')=='complete' and r.get('context',{}).get('domain')=='production' and not r.get('queue',{}).get('entries') and dec(r['nativeBasis']['stateSequence'])==dec(initial['stateSequence'])];need(initial_empty,'preseed-empty-observation-missing')
 last_finish=max(dec(r['sequence'])for r in seed_finished);terminals=[v for n,v in snapshots.items()if n>last_finish];need(len(terminals)>=1,'later-complete-replacement-missing');terminal,t=terminals[-1];need(dec(terminal['stateSequence'])>max(dec(r['stateSequence'])for r in seed_finished)and terminal['nativeFrame']>=max(r['nativeFrame']for r in seed_finished),'replacement-after-invalidation')
 units=terminal['value']['units'];need(all(u.get('underConstruction')is False and u.get('buildProgress')==1 for u in units),'unfinished-terminal');need(known.issubset({str(u['unitId'])for u in units}),'setup-actor-disappeared');fresh={str(u['unitId'])for u in units}-known;need(fresh==set(ids),'unexplained-extra-products');actors={a['actor']['id']:reference(a['actor'])for a in t['actors']if a.get('actor')};products=[]
 for created in seed_created:
  ident=str(created['value']['unitId']);finished=next(r for r in seed_finished if str(r['value']['unitId'])==ident);need(created['disposition']=='invalidated'and finished['disposition']=='invalidated'and dec(finished['sequence'])>dec(created['sequence'])and finished['nativeFrame']>=created['nativeFrame'],'seed-lifecycle-invalidation-order')
  for event in [created,finished]:
   need(any(h['kind']=='stale'and str(h['value'].get('receivedSequence'))==event['stateSequence']for h in host),'actual-stale-evidence-missing')
  need(any(h['kind']=='observation'and str(h['value'].get('stateSequence'))==terminal['stateSequence']for h in host),'actual-replacement-projection-missing')
  u=next(u for u in units if str(u['unitId'])==ident);need(u.get('definitionId')==setup['seedDefinitionId']and ident in actors,'seed-definition-lifetime-missing');need(all(a['actor']==actors[ident]for mt in metadata_rows for a in mt['actors']if a.get('actor',{}).get('id')==ident),'seed-lifetime-changed');products.append({'reference':actors[ident],'createdSequence':created['sequence'],'finishedSequence':finished['sequence']})
 for row in raw:
  if dec(row['sequence'])<dec(initial['sequence']) and row['kind']=='unit-created':need(str(row['value'].get('unitId'))in known and str(row['value'].get('builderId'))=='0','unexpected-prebaseline-creation')
  if dec(row['sequence'])>=dec(initial['sequence']) and row['kind']=='unit-created':need(str(row['value'].get('unitId'))in ids and str(row['value'].get('builderId'))==contract['factory']['id'],'extra-or-direct-spawn')
  if dec(row['sequence'])>=first_created and row['kind']=='unit-finished':need(str(row['value'].get('unitId'))in ids,'extra-finish')
 samples=[]
 for r in stock:
  stock_record(r);need(r.get('schema')=='highbar.barc-stock-queue-trace/v1'and r.get('runId')==contract['runId'],'stock-origin');b=basis(r['nativeBasis']);need(b['processIncarnation']==process and b['stateChannelIncarnation']==channel and b['matchIncarnation']==match,'stock-basis-incarnation');need(r['phase']=='sample'and r['dispatch']is None,'prearm-stock-dispatch');need(r['context']['actor']==contract['factory'],'stock-factory');
  if r['context']['domain']=='production'and r['reader']['status']=='complete':
   fake={'stateSequence':b['stateSequence'],'nativeFrame':b['frame']};tm=joined(fake);actor=next((a for a in tm['actors']if a.get('actor')==contract['factory']),None);need(actor,'stock-host-actor');queues=[z for z in actor.get('queue',[])if z.get('domain')in ['NATIVE_QUEUE_DOMAIN_FACTORY_PRODUCTION','FactoryProduction',2]];need(len(queues)==1,'production-projection');queue=queues[0];need(all(str(z.get('definitionId'))==str(-e['id'])and z.get('nativeTag',0)==e['tag'] for z,e in zip(queue.get('entries',[]),r['queue']['entries'])),'stock-host-entry-projection');need(queue.get('complete')is True and queue.get('repeat')is False and queue.get('evidenceScheme')in [2,'NATIVE_QUEUE_EVIDENCE_SCHEME_STOCK_LUA_SUPPORTED_FIELDS_V1']and str(queue.get('revision'))==r['queue']['revision']and len(queue.get('entries',[]))==len(r['queue']['entries']),'same-basis-complete-stock-queue');samples.append(r)
 nonempty=[r for r in samples if len(r['queue']['entries'])==setup['seedCount']and all(e['id']==-setup['seedDefinitionId']and e['codedOptions']==0 and e['float32params']==[] for e in r['queue']['entries'])];need(nonempty,'actual-finite-nonempty-seed-queue-missing')
 empty=[r for r in samples if not r['queue']['entries']and dec(r['nativeBasis']['stateSequence'])>=dec(terminal['stateSequence'])and r['readFrame']>=terminal['nativeFrame']];need(empty,'actual-terminal-empty-queue-missing');need(empty[-1]['readFrame']>nonempty[0]['readFrame']and dec(empty[-1]['sequence'])>dec(nonempty[0]['sequence'])and dec(nonempty[0]['nativeBasis']['stateSequence'])<min(dec(r['stateSequence']) for r in seed_finished),'seed-drain-causality')
 evidence={'factory':contract['factory'],'seedDefinitionId':setup['seedDefinitionId'],'productDefinitionId':setup['productDefinitionId'],'seedCount':setup['seedCount'],'initialRawSequence':initial['sequence'],'nonemptyStockSequence':nonempty[0]['sequence'],'terminalRawSequence':terminal['sequence'],'terminalStateSequence':terminal['stateSequence'],'terminalNativeFrame':terminal['nativeFrame'],'emptyStockSequence':empty[-1]['sequence'],'products':products}
 result={'schema':'bar.one-unit-attribution-source-qualification/v1','actualPassed':True,'noAutonomousOrders':True,**origin,'processIncarnation':process,'stateChannelIncarnation':channel,'matchIncarnation':match,'noAutonomousConfigurationEvidenceSha256':contract['inputs']['configuration']['sha256'],'seedEvidence':evidence,'inputCustody':contract['inputs'],'liveProcesses':loaded['processes'],'completeRecordEvidence':contract['completeRecordEvidence'],'lifecycle':contract['lifecycle']}
 need(time.monotonic_ns()<transition and time.monotonic()<deadline,'reducer-or-transition-deadline');need(len(json.dumps(result,separators=(',',':')).encode())<=MAX_OUTPUT,'qualification-byte-bound');return result

def publish(result,path):
 for parent in pathlib.Path(path).parents:need(stat.S_ISDIR(parent.lstat().st_mode)and not parent.is_symlink(),'output-ancestor-link')
 body=(json.dumps(result,separators=(',',':'))+'\n').encode();need(len(body)<=MAX_OUTPUT,'qualification-byte-bound');p=pathlib.Path(path);need(p.is_absolute()and p.parent.is_dir()and not p.parent.is_symlink(),'output-root');fd=os.open(p,os.O_WRONLY|os.O_CREAT|os.O_EXCL|os.O_NOFOLLOW,0o600)
 try:
  need(os.fstat(fd).st_nlink==1,'output-link');offset=0
  while offset<len(body):offset+=os.write(fd,body[offset:])
  os.fsync(fd)
 finally:os.close(fd)
if __name__=='__main__':
 need(len(sys.argv)==3,'exact-contract-and-sha-arguments');fd=os.open(sys.argv[1],os.O_RDONLY|os.O_NOFOLLOW|os.O_CLOEXEC)
 try:
  initial=os.fstat(fd);need(stat.S_ISREG(initial.st_mode)and initial.st_nlink==1 and stat.S_IMODE(initial.st_mode)==0o600 and 0<initial.st_size<=65536,'contract-physical-bound');body=os.pread(fd,65537,0);after=os.fstat(fd);need(all(getattr(initial,k)==getattr(after,k)for k in ['st_dev','st_ino','st_uid','st_mode','st_size','st_nlink','st_mtime_ns','st_ctime_ns'])and len(body)==initial.st_size and sha(body)==sys.argv[2],'contract-body-pin')
 finally:os.close(fd)
 contract=parse(body);publish(derive(contract,time.monotonic()+10),contract['outputPath'])
