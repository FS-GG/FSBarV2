"""Held-FD adapter for one source-bound, growing Recoil infolog."""
import base64,hashlib,json,os,re,selectors,stat,subprocess,time
from pathlib import Path
from private_io import Refused,SHA,atomic_bytes_new,atomic_new,canonical,components,hash_artifact,need,read_bytes
from runtime_identity import mark_failure,proc_bytes,start_ticks
MAX_LOG=4*1024*1024
MAX_POLICY_INPUT=6*1024*1024
MAX_FDS=256
MAX_SAMPLES=3
MAX_SETTLEMENT_PROBES=32
MAX_PREAD_CALLS=128
SETTLEMENT_PAUSE_SECONDS=0.01
BOUNDARIES=('browser','normalization','release')
CLOSURE_SCHEMA='fsbar.barc-runtime-evidence-policy-closure/v3'
POLICY_OBSERVATION_SCHEMA='fsbar.barc-runtime-evidence-failure-observation/v1'
POLICY_CHECKPOINTS={'initial-closure','current-process','invocation-ready','request-read','request-evaluation','final-closure','invocation-completion'}
POLICY_KINDS={'exception','pending','refused','unknown'}
POLICY_TO_MECHANICAL={'initial-closure':'policy-closure-precheck','current-process':'policy-artifact','invocation-ready':'policy-ready','request-read':'policy-transport','request-evaluation':'policy-result-join','final-closure':'policy-final-precheck','invocation-completion':'policy-completion'}

def _unique(pairs):
    value={}
    for key,item in pairs:need(key not in value,'duplicate policy JSON key');value[key]=item
    return value

def _source_set(config):
    encoded=json.dumps(config['source'],sort_keys=True,separators=(',',':')).encode()
    return hashlib.sha256(encoded).hexdigest()

def _policy_observation(raw):
    try:
        need(isinstance(raw,bytes) and len(raw)<=2048,'policy diagnostic bound')
        lines=raw.splitlines();need(len(lines)==1,'single policy diagnostic frame')
        value=json.loads(lines[0].decode('utf-8'),object_pairs_hook=_unique)
        need(isinstance(value,dict) and set(value)=={'schema','checkpoint','kind'} and value['schema']==POLICY_OBSERVATION_SCHEMA and value['checkpoint'] in POLICY_CHECKPOINTS and value['kind'] in POLICY_KINDS,'closed policy diagnostic frame')
        return value
    except Exception:return None

def _closed_state(value,status,boundary,identity,revision,sample_bytes,sample_sha256,prior):
    fields={'phase','identity','observedRevision','validatedRevision','validatedBoundary','consumedRevision','consumedBoundary','bytes','sha256','stickyInvalid','reason'}
    need(isinstance(value,dict) and set(value)==fields,'closed growing log state')
    expected_identity={'runId':identity['runId'],'sourceSetSha256':identity['sourceSetSha256'],'apphostSha256':identity['apphostSha256'],'closureSha256':identity['closureSha256'],'pid':identity['pid'],'startTicks':identity['startTicks'],'uid':identity['uid'],'device':identity['device'],'inode':identity['inode'],'path':identity['path']}
    need(value['identity']==expected_identity and type(value['phase']) is str and type(value['stickyInvalid']) is bool and type(value['observedRevision']) is int and type(value['validatedRevision']) is int and type(value['consumedRevision']) is int and type(value['bytes']) is int and type(value['sha256']) is str,'growing log state binding')
    need(value['validatedBoundary'] in (None,)+BOUNDARIES and value['consumedBoundary'] in (None,)+BOUNDARIES and (value['reason'] is None or type(value['reason']) is str),'closed growing log state values')
    need(min(value['observedRevision'],value['validatedRevision'],value['consumedRevision'],value['bytes'])>=0 and value['consumedRevision']<=value['validatedRevision']<=value['observedRevision'],'coherent growing log counters')
    phases={'accepted':'consumed','pending':'sampled','refused':'invalid','unknown':'unknown'}
    need(status in phases and value['phase']==phases[status],'growing log status/phase mismatch')
    if status=='accepted':
        need(value['observedRevision']==value['validatedRevision']==value['consumedRevision']==revision and value['validatedBoundary']==value['consumedBoundary']==boundary and value['bytes']==sample_bytes and value['sha256']==sample_sha256 and value['stickyInvalid'] is False and value['reason'] is None,'fresh growing log decision')
    elif status=='pending':
        previous=prior or {'validatedRevision':0,'validatedBoundary':None,'consumedRevision':0,'consumedBoundary':None}
        need(value['observedRevision']==revision and value['bytes']==sample_bytes and value['sha256']==sample_sha256 and value['stickyInvalid'] is False and type(value['reason']) is str and len(value['reason'])>0,'fresh pending growing log decision')
        need(value['validatedRevision']==previous['validatedRevision'] and value['validatedBoundary']==previous['validatedBoundary'] and value['consumedRevision']==previous['consumedRevision'] and value['consumedBoundary']==previous['consumedBoundary'],'pending growing log history mismatch')
    else:
        need(value['stickyInvalid'] is True and type(value['reason']) is str and len(value['reason'])>0,'terminal growing log state mismatch')
    return value

class GrowingLog:
    def __init__(self,path,process,fd,opened,writer):
        self.path=str(path);self.process=dict(process);self.fd=fd;self.device=opened.st_dev;self.inode=opened.st_ino
        self.previous=b'';self.revision=0;self.state=None;self.revoked=False;self.writer=writer;self.closure_sha256=None;self.failure_checkpoint='policy-scope-join';self.last_policy_observation=None;self.settlement_transcript=[];self.settlement_effects=[];self._reset_counters(None)
    def _reset_counters(self,boundary):
        self.counter_started=time.monotonic();self.counter_cause=None;self.counter_deadline=None
        self.counters={'boundary':boundary,'probesBegun':0,'probesCompleted':0,'readOperations':0,'readCalls':0,'readCallsInOperation':0,'requestedReadBytes':0,'bytesReadInOperation':0,'evaluationsBegun':0,'evaluationsCompleted':0,'growthAfterEvaluation':0,'maximumObservedBytes':0,'sampleBytes':0,'completePrefixBytes':0,'tailBytes':0}
    def _counter_observation(self,check):
        elapsed=max(0,int((time.monotonic()-self.counter_started)*1000000))
        return {'schema':'fsbar.barc-infolog-mechanical-observation/v1',**self.counters,'elapsedMicroseconds':elapsed,'settlementBudgetMicroseconds':None if self.counter_deadline is None else max(0,int((self.counter_deadline-self.counter_started)*1000000)),'terminalCheck':check,'terminalCause':self.counter_cause or ('settlement-deadline' if check=='infolog-record-settlement-deadline' else 'other'),'sampleSha256':hashlib.sha256(self.previous).hexdigest(),'nativeAcceptance':False}
    def _retain_counter_observation(self,error,config):
        check=getattr(error,'_barc_failure_observation',{}).get('check',self.failure_checkpoint)
        observation=self._counter_observation(check)
        error._barc_infolog_mechanical_observation=observation
        # Separate mechanical evidence: never alters the typed failure projection
        # or acceptance. Missing publication is explicitly visible on the error.
        try:
            need(self.counters['boundary'] in BOUNDARIES,'closed counter boundary')
            name='infolog-mechanical-'+self.counters['boundary']+'.json'
            root=components(config['roots']['attemptRoot'])
            encoded=(json.dumps(observation,separators=(',',':'),allow_nan=False)+'\n').encode()
            atomic_bytes_new(str(root/name),encoded,4096)
            atomic_new(str(root/(name+'.receipt.json')),{'schema':'fsbar.barc-infolog-mechanical-receipt/v1','file':name,'bytes':len(encoded),'sha256':hashlib.sha256(encoded).hexdigest(),'sourceSetSha256':_source_set(config),'nativeAcceptance':False})
            error._barc_infolog_mechanical_retained=True
        except Exception:error._barc_infolog_mechanical_retained=False
    @classmethod
    def acquire(cls,path,process):
        check='infolog-path';fd=None
        try:
            path=components(str(canonical(str(path))));before=path.lstat()
            check='infolog-parent';parent=path.parent.stat()
            need(parent.st_uid==os.geteuid() and stat.S_ISDIR(parent.st_mode) and stat.S_IMODE(parent.st_mode)==0o700,'growing log private parent')
            check='infolog-file-custody';need(stat.S_ISREG(before.st_mode) and before.st_uid==os.geteuid() and stat.S_IMODE(before.st_mode)==0o600 and before.st_nlink==1 and before.st_size<=MAX_LOG,'growing log custody/bound')
            check='infolog-process';need(set(process)=={'pid','startTicks','uid'} and process['uid']==os.geteuid() and start_ticks(process['pid'])==process['startTicks'],'growing log producer identity')
            check='infolog-open';fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW|os.O_CLOEXEC|os.O_NONBLOCK)
            check='infolog-descriptor-identity'
            opened=os.fstat(fd);need((opened.st_dev,opened.st_ino,opened.st_uid,stat.S_IMODE(opened.st_mode),opened.st_nlink)==(before.st_dev,before.st_ino,before.st_uid,0o600,1),'growing log identity changed')
            writer=cls._writer(process,path,opened)
            check='infolog-final-generation'
            need(start_ticks(process['pid'])==process['startTicks'],'growing log producer changed')
            return cls(path,process,fd,opened,writer)
        except BaseException as error:
            failure=mark_failure(error,check)
            if fd is not None:
                try:os.close(fd)
                except OSError:setattr(failure,'_barc_cleanup_unknown',True)
            raise failure
    @staticmethod
    def _writer(process,path,opened,deadline=None):
        def check_deadline():
            if deadline is not None:GrowingLog._deadline(deadline)
        try:
            check_deadline();pid=process['pid'];names=os.listdir(f'/proc/{pid}/fd');check_deadline();need(len(names)<=MAX_FDS,'growing log writer fd bound');matches=[]
            for name in names:
                check_deadline()
                if not name.isdigit():continue
                try:
                    current=os.stat(f'/proc/{pid}/fd/{name}')
                    check_deadline()
                    if (current.st_dev,current.st_ino)!=(opened.st_dev,opened.st_ino):continue
                    value=proc_bytes(pid,f'fdinfo/{name}',4096).decode('ascii')
                    check_deadline()
                    flags=re.search(r'^flags:\s+([0-7]+)$',value,re.MULTILINE);position=re.search(r'^pos:\s+([0-9]+)$',value,re.MULTILINE)
                    if flags and position:
                        bits=int(flags[1],8)
                        if bits&os.O_ACCMODE in (os.O_WRONLY,os.O_RDWR):matches.append({'fd':int(name),'flags':bits,'position':int(position[1])})
                except FileNotFoundError:continue
        except BaseException as error:raise mark_failure(error,'infolog-writer-census')
        try:
            check_deadline()
            need(len(matches)==1,'growing log writer unavailable or ambiguous')
            need(start_ticks(pid)==process['startTicks'],'growing log writer generation changed')
            check_deadline()
            return matches[0]
        except BaseException as error:raise mark_failure(error,'infolog-writer-match')
    def close(self):
        if self.fd is not None:
            os.close(self.fd);self.fd=None
    @staticmethod
    def _deadline(deadline):
        if time.monotonic()>=deadline:
            raise mark_failure(Refused('growing log record settlement deadline'),'infolog-record-settlement-deadline','deadline',None)
    def _read_exact(self,length,deadline=None):
        chunks=[];offset=0;calls=0
        self.counters['readOperations']+=1;self.counters['readCallsInOperation']=0;self.counters['requestedReadBytes']=length;self.counters['bytesReadInOperation']=0
        while offset<length:
            if deadline is not None:self._deadline(deadline)
            if calls>=MAX_PREAD_CALLS:
                self.counter_cause='exact-read-call-cap'
                raise mark_failure(Refused('growing log record exact-read exhausted'),'infolog-record-settlement-exhausted','refused',None)
            self.counters['readCalls']+=1;self.counters['readCallsInOperation']+=1
            block=os.pread(self.fd,min(65536,length-offset),offset);need(block,'growing log truncated');chunks.append(block);offset+=len(block)
            calls+=1;self.counters['bytesReadInOperation']=offset
            if deadline is not None:self._deadline(deadline)
        return b''.join(chunks)
    def _sample(self,deadline):
        try:return self._sample_impl(deadline)
        except BaseException:
            self.revoked=True;raise
    def _custody(self, expected=None, exact_size=False, final=False, deadline=None):
        def checkpoint(name):
            if final:self.failure_checkpoint='infolog-final-'+name
            if deadline is not None:self._deadline(deadline)
        checkpoint('scope')
        need(not self.revoked and self.fd is not None,'growing log scope revoked or closed')
        pid=self.process['pid']
        checkpoint('process')
        need(os.stat(f'/proc/{pid}').st_uid==self.process['uid']==os.geteuid() and start_ticks(pid)==self.process['startTicks'],'growing log producer changed')
        checkpoint('path');path=components(self.path)
        checkpoint('parent');parent=path.parent.stat()
        need(parent.st_uid==os.geteuid() and stat.S_ISDIR(parent.st_mode) and stat.S_IMODE(parent.st_mode)==0o700,'growing log private parent changed')
        checkpoint('named-identity');named=path.lstat()
        need((named.st_dev,named.st_ino)==(self.device,self.inode),'growing log named identity changed')
        checkpoint('descriptor-identity');opened=os.fstat(self.fd)
        need((opened.st_dev,opened.st_ino)==(self.device,self.inode),'growing log descriptor identity changed')
        checkpoint('file-custody')
        need(stat.S_ISREG(named.st_mode) and named.st_uid==os.geteuid() and stat.S_IMODE(named.st_mode)==0o600 and named.st_nlink==1,'growing log custody')
        self.counters['maximumObservedBytes']=max(self.counters['maximumObservedBytes'],opened.st_size)
        checkpoint('size-cap');need(opened.st_size<=MAX_LOG,'growing log bound')
        writer=self._writer(self.process,path,opened,deadline)
        if expected is not None:
            checkpoint('size-regression');need(opened.st_size>=len(expected) and (not exact_size or opened.st_size==len(expected)),'growing log changed after policy')
            checkpoint('prefix-read');actual=self._read_exact(len(expected),deadline)
            checkpoint('prefix-drift');need(actual==expected,'growing log prefix changed after read')
        return opened,writer
    def _sample_impl(self,deadline):
        self._deadline(deadline)
        opened,_=self._custody(deadline=deadline)
        need(len(self.previous)<=opened.st_size,'growing log truncated')
        length=opened.st_size;self.counters['maximumObservedBytes']=max(self.counters['maximumObservedBytes'],length);raw=self._read_exact(length,deadline)
        # This second retained-FD read closes the permanent overwrite window
        # after the first read.  The custody check also reopens no authority:
        # any failure makes this object sticky-revoked in _sample.
        after,writer=self._custody(raw,False,deadline=deadline)
        need(after.st_size>=length,'growing log truncated during sample')
        intact=raw.startswith(self.previous)
        need(intact,'growing log prefix changed')
        self._deadline(deadline)
        return raw,intact,writer
    def _settle(self,deadline,probes):
        while probes<MAX_SETTLEMENT_PROBES:
            self._deadline(deadline)
            self.counters['probesBegun']+=1
            raw,intact,writer=self._sample(deadline);probes+=1
            self.counters['probesCompleted']+=1
            # Retain every fully checked byte, including an incomplete tail.
            # The next probe must extend this exact mechanical prefix.
            self.previous=raw
            prefix=raw.rfind(b'\n')+1
            self.counters.update(sampleBytes=len(raw),completePrefixBytes=prefix,tailBytes=len(raw)-prefix)
            complete=bool(raw) and raw.endswith(b'\n')
            event={'kind':'probe','event':'complete' if complete else 'incomplete','probe':probes,'remaining':MAX_SETTLEMENT_PROBES-probes}
            self.settlement_transcript.append({key:value for key,value in event.items() if key!='kind'})
            self.settlement_effects.append(event)
            if complete:
                self._deadline(deadline)
                self.revision+=1
                return raw,intact,writer,probes
            if probes<MAX_SETTLEMENT_PROBES:
                self._deadline(deadline)
                time.sleep(min(SETTLEMENT_PAUSE_SECONDS,max(0,deadline-time.monotonic())))
                self._deadline(deadline)
        self.counter_cause='settlement-probe-cap'
        raise mark_failure(Refused('growing log record settlement exhausted'),'infolog-record-settlement-exhausted','refused',None)
    @staticmethod
    def _closure(path,digest,deadline):
        need(time.monotonic()<deadline,'policy closure deadline')
        raw=read_bytes(path,1024*1024);need(hashlib.sha256(raw).hexdigest()==digest,'policy closure manifest digest/bound')
        value=json.loads(raw.decode('utf-8'),object_pairs_hook=_unique)
        need(isinstance(value,dict) and set(value)=={'schema','custodyRoot','managedRoot','provenanceRoot','runtimeRoots','searchLayout','managed','provenance','runtime','runtimeRoles','source','custody'} and value.get('schema')==CLOSURE_SCHEMA,'policy closure schema')
        pins=[]
        for name in ('managed','provenance','runtime'):
            rows=value.get(name);need(isinstance(rows,list) and 0<len(rows)<=1024,'policy closure inventory')
            for row in rows:
                need(isinstance(row,dict) and set(row)==(({'role'} if name!='runtime' else set())|{'path','bytes','sha256','device','inode','ownerUid','mode','links'}),'closed policy closure file pin')
                pins.append((name,row))
        need(len(pins)<=1024 and sum(row['bytes'] for _,row in pins)<=1024*1024*1024,'policy closure aggregate bound')
        seen=set()
        for inventory,row in pins:
            need(time.monotonic()<deadline,'policy closure deadline')
            need(isinstance(row['path'],str) and row['path'] not in seen and type(row['bytes']) is int and 0<=row['bytes']<=256*1024*1024 and SHA.fullmatch(row['sha256'] or '') and type(row['inode']) is int and type(row['ownerUid']) is int and type(row['mode']) is int and type(row['links']) is int,'policy closure pin')
            seen.add(row['path']);info=components(row['path']).lstat()
            need(stat.S_ISREG(info.st_mode) and not Path(row['path']).is_symlink() and info.st_dev==os.makedev(*[int(x,16) for x in row['device'].split(':')]) and info.st_ino==row['inode'] and info.st_uid==row['ownerUid'] and info.st_nlink==row['links']==1 and info.st_size==row['bytes'] and stat.S_IMODE(info.st_mode)==row['mode'] and (row['mode']&0o022)==0,'policy closure file custody')
            need(inventory=='runtime' or info.st_uid!=os.geteuid() or (row['mode']&0o200)==0,'invoking-principal-writable policy file')
            hash_artifact(row['path'],row['sha256'],256*1024*1024)
        managed={row['role']:row for inventory,row in pins if inventory=='managed'}
        need(set(managed)=={'apphost','managedDll','depsJson','runtimeConfigJson','fsharpCore'},'closed managed roles')
        need(value['custody'].get('ownerUid')==os.geteuid() and value['custody'].get('executablePath')==managed['apphost']['path'],'policy owner/apphost join')
        need(isinstance(value['searchLayout'],list) and 0<len(value['searchLayout'])<=64,'search layout bound')
        for item in value['searchLayout']:
            need(time.monotonic()<deadline and set(item)=={'path','ownerUid','mode','entriesSha256'},'search layout')
            directory=components(item['path']);info=directory.stat();names=[]
            with os.scandir(directory) as entries:
                for entry in entries:
                    need(len(names)<4096,'search layout entry bound')
                    names.append(entry.name)
                    need(time.monotonic()<deadline,'policy closure deadline')
            names.sort()
            need(info.st_uid==item['ownerUid'] and stat.S_IMODE(info.st_mode)==item['mode'] and (item['mode']&0o022)==0 and hashlib.sha256('\n'.join(names).encode()).hexdigest()==item['entriesSha256'],'search layout drift')
        need(time.monotonic()<deadline,'policy closure deadline')
        return value
    def _run_policy(self,path,closure_path,closure_sha,encoded,deadline):
        policy_deadline=deadline
        invocation=hashlib.sha256(os.urandom(32)).hexdigest()
        argv=[path,'--closure-manifest',closure_path,'--closure-sha256',closure_sha,'--invocation-id',invocation]
        check='policy-child-start';process=None;selector=None;stdin_open=True;stdout_open=True;stderr_open=True;diagnostic=bytearray()
        try:
            process=subprocess.Popen(argv,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,env={'PATH':'/usr/bin:/bin'},start_new_session=True)
            input_fd=process.stdin.fileno();output_fd=process.stdout.fileno();error_fd=process.stderr.fileno()
            os.set_blocking(input_fd,False);os.set_blocking(output_fd,False);os.set_blocking(error_fd,False)
            selector=selectors.DefaultSelector();selector.register(output_fd,selectors.EVENT_READ,'stdout');selector.register(error_fd,selectors.EVENT_READ,'stderr')
            offset=0;output=bytearray();transport_count=0;ready=False;ready_line=None;ready_value=None;input_registered=False
            while stdout_open or stderr_open or stdin_open:
                check='policy-ready' if not ready else 'policy-transport'
                remaining=policy_deadline-time.monotonic()
                if remaining<=0:raise subprocess.TimeoutExpired([path],5)
                events=selector.select(remaining)
                if not events:raise subprocess.TimeoutExpired([path],5)
                for key,_ in events:
                    if key.data=='stdin' and stdin_open:
                        try:
                            written=os.write(input_fd,encoded[offset:offset+65536])
                            need(written>0,'growing log policy stdin stalled');offset+=written
                        except BrokenPipeError:
                            offset=len(encoded)
                        if offset==len(encoded):
                            selector.unregister(input_fd);process.stdin.close();stdin_open=False
                    elif key.data=='stdout' and stdout_open:
                        block=os.read(output_fd,min(65536,131073-transport_count))
                        if block:
                            transport_count+=len(block);output.extend(block);need(transport_count<=131072,'growing log policy output bound')
                            if not ready and b'\n' in output:
                                line,tail=bytes(output).split(b'\n',1)
                                value=json.loads(line.decode('utf-8'),object_pairs_hook=_unique)
                                need(set(value)=={'schema','invocationId','closureSha256','pid','startTicks','uid','phase'} and value['schema']=='fsbar.barc-runtime-evidence-policy-ready/v2' and value['phase']=='ready' and value['invocationId']==invocation and value['closureSha256']==closure_sha and value['pid']==process.pid and value['startTicks']==start_ticks(process.pid) and value['uid']==os.geteuid(),'policy ready join')
                                ready=True;ready_line=line;ready_value=value;output=bytearray(tail);selector.register(input_fd,selectors.EVENT_WRITE,'stdin');input_registered=True
                        else:
                            selector.unregister(output_fd);process.stdout.close();stdout_open=False
                            if not ready and stdin_open:
                                process.stdin.close();stdin_open=False
                    elif key.data=='stderr' and stderr_open:
                        block=os.read(error_fd,min(65536,131073-transport_count))
                        if block:
                            transport_count+=len(block);diagnostic.extend(block);need(transport_count<=131072,'growing log policy combined output bound')
                        else:
                            selector.unregister(error_fd);process.stderr.close();stderr_open=False
                if process.poll() is not None and stdin_open:
                    if input_registered:selector.unregister(input_fd)
                    process.stdin.close();stdin_open=False
            remaining=policy_deadline-time.monotonic()
            if remaining<=0:raise subprocess.TimeoutExpired([path],5)
            code=process.wait(timeout=remaining);need(code in (0,2),'growing log policy execution')
            need(ready and ready_line is not None,'policy readiness unavailable')
            check='policy-completion'
            try:final=json.loads(bytes(output).decode('utf-8'),object_pairs_hook=_unique)
            except (UnicodeError,json.JSONDecodeError) as error:raise Refused('invalid policy completion') from error
            need(set(final)=={'schema','invocationId','closureSha256','pid','startTicks','uid','phase','result'} and final['schema']=='fsbar.barc-runtime-evidence-policy-completed/v2' and final['invocationId']==invocation and final['closureSha256']==closure_sha and final['pid']==process.pid and final['startTicks']==ready_value['startTicks'] and final['uid']==os.geteuid() and final['phase']=='completed','policy completion join')
            self.last_policy_observation=_policy_observation(bytes(diagnostic)) if diagnostic else None
            return (json.dumps(final['result'],separators=(',',':'))+'\n').encode()
        except BaseException as error:
            observation=_policy_observation(bytes(diagnostic)) if diagnostic else None
            if observation is not None:check=POLICY_TO_MECHANICAL[observation['checkpoint']]
            outcome='deadline' if isinstance(error,subprocess.TimeoutExpired) else None
            if process is not None and process.poll() is None:
                process.kill()
                try:process.wait(timeout=max(0,policy_deadline-time.monotonic()))
                except subprocess.TimeoutExpired as settlement:raise mark_failure(Refused('growing log policy child settlement unknown'),check,'unexpected',observation) from settlement
            raise mark_failure(error,check,outcome,observation)
        finally:
            if selector is not None:selector.close()
            if process is not None and process.stdin is not None and not process.stdin.closed:process.stdin.close()
            if process is not None and process.stdout is not None and not process.stdout.closed:process.stdout.close()
            if process is not None and process.stderr is not None and not process.stderr.closed:process.stderr.close()
    def consume(self,boundary,config,deadline):
        self._reset_counters(boundary)
        try:return self._consume_impl(boundary,config,deadline)
        except BaseException as error:
            self.revoked=True
            error=mark_failure(error,self.failure_checkpoint)
            self._retain_counter_observation(error,config)
            raise error
    def _consume_impl(self,boundary,config,deadline):
        need(boundary in BOUNDARIES and isinstance(deadline,(int,float)),'closed growing log boundary/deadline')
        policy_deadline=min(deadline,time.monotonic()+5);self.counter_deadline=policy_deadline
        policy=config['artifacts']['runtimeEvidencePolicy'];closure=config['artifacts']['runtimeEvidencePolicyClosure']
        self.failure_checkpoint='policy-artifact';hash_artifact(policy['path'],policy['sha256'],268435456)
        self.failure_checkpoint='policy-closure-precheck';closure_value=self._closure(closure['path'],closure['sha256'],policy_deadline)
        apphost=next(row for row in closure_value['managed'] if row['role']=='apphost')
        self.failure_checkpoint='policy-apphost-join'
        need((policy['path'],policy['sha256'])==(apphost['path'],apphost['sha256']),'launched apphost/closure join')
        self.failure_checkpoint='policy-scope-join'
        if self.closure_sha256 is None:self.closure_sha256=closure['sha256']
        need(self.closure_sha256==closure['sha256'],'policy closure changed within growing-log scope')
        expected={'runId':config['runId'],'sourceSetSha256':_source_set(config),'apphostSha256':policy['sha256'],'closureSha256':closure['sha256'],'writeRoot':config['commands']['engine'][5],'dataRoot':config['commands']['engine'][3]}
        last=None;probes=0
        for _ in range(MAX_SAMPLES):
            need(time.monotonic()<policy_deadline,'growing log policy deadline')
            self.failure_checkpoint='infolog-sample'
            self.last_policy_observation=None
            raw,intact,writer,probes=self._settle(policy_deadline,probes)
            request={'schema':'fsbar.barc-growing-log-policy/v2','boundary':boundary,'expected':expected,'observation':{'pid':self.process['pid'],'startTicks':self.process['startTicks'],'uid':self.process['uid'],'device':str(self.device),'inode':str(self.inode),'path':self.path,'revision':self.revision,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'previousPrefixIntact':intact,'writerFd':writer['fd'],'writerFlags':writer['flags'],'writerPosition':writer['position'],'available':True,'logBase64':base64.b64encode(raw).decode()},'prior':self.state}
            encoded=json.dumps(request,separators=(',',':'),allow_nan=False).encode();need(len(encoded)<=MAX_POLICY_INPUT,'growing log policy input bound')
            remaining=policy_deadline-time.monotonic();need(remaining>0,'growing log policy deadline')
            self.failure_checkpoint='policy-transport';self.last_policy_observation=None
            self.counters['evaluationsBegun']+=1
            output=self._run_policy(policy['path'],closure['path'],closure['sha256'],encoded,policy_deadline)
            self.counters['evaluationsCompleted']+=1
            try:value=json.loads(output.decode('utf-8'),object_pairs_hook=_unique,parse_constant=lambda _:(_ for _ in ()).throw(Refused('nonfinite policy JSON')))
            except (UnicodeError,json.JSONDecodeError) as error:raise Refused('invalid growing log policy result') from error
            self.failure_checkpoint='policy-result-join'
            need(set(value)=={'schema','status','state'} and value['schema']=='fsbar.barc-growing-log-policy-result/v2' and value['status'] in ('accepted','pending','refused','unknown') and isinstance(value['state'],dict),'closed growing log policy result')
            identity=dict(expected);identity.update({'pid':self.process['pid'],'startTicks':self.process['startTicks'],'uid':self.process['uid'],'device':str(self.device),'inode':str(self.inode),'path':self.path})
            sample_sha256=hashlib.sha256(raw).hexdigest()
            next_state=_closed_state(value['state'],value['status'],boundary,identity,self.revision,len(raw),sample_sha256,self.state);last=value['status']
            before_state=self.state
            self.state=next_state
            # Qualification consumes this bounded in-memory trace to prove the
            # actual policy transition and its position among settlement probes.
            self.settlement_effects.append({'kind':'policy','boundary':boundary,'status':last,'expected':expected,'observation':{key:request['observation'][key] for key in ('pid','startTicks','uid','device','inode','path','revision','bytes','sha256')},'beforeState':before_state,'afterState':next_state})
            # The decision authorizes exactly this still-current sample. Growth
            # observed after policy evaluation receives a new revision instead.
            self.failure_checkpoint='infolog-final-refresh';current,_=self._custody(raw,False,True,policy_deadline)
            self.failure_checkpoint='policy-final-precheck'
            hash_artifact(policy['path'],policy['sha256'],268435456)
            self._closure(closure['path'],closure['sha256'],policy_deadline)
            need(time.monotonic()<policy_deadline,'policy final closure deadline')
            self.counters['maximumObservedBytes']=max(self.counters['maximumObservedBytes'],current.st_size)
            if current.st_size!=len(raw):
                self.counters['growthAfterEvaluation']+=1
                continue
            if last=='accepted':
                self.settlement_effects.append({'kind':'terminal','outcome':'accepted','check':None,'state':self.state})
                return {'boundary':boundary,'revision':self.revision,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'state':self.state}
            if last in ('refused','unknown'):
                self.failure_checkpoint='policy-result-join';self.revoked=True
                raise mark_failure(Refused('growing log policy refused or unknown'),self.failure_checkpoint,'policy-nonaccepted',self.last_policy_observation)
            time.sleep(min(0.01,max(0,policy_deadline-time.monotonic())))
        self.failure_checkpoint='policy-sample-exhausted';self.revoked=True
        if last=='accepted':
            self.counter_cause='policy-evaluation-growth-cap'
            raise mark_failure(Refused('growing log policy sample growth exhausted'),self.failure_checkpoint,'refused',None)
        raise mark_failure(Refused(f'growing log policy {last or "unavailable"}'),self.failure_checkpoint,'policy-nonaccepted',self.last_policy_observation)
