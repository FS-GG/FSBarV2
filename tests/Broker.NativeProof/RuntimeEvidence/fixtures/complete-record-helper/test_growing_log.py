import base64,fnmatch,hashlib,json,os,pathlib,shutil,stat,subprocess,sys,tempfile,threading,time,unittest
from unittest import mock
import growing_log
from growing_log import GrowingLog
from private_io import Refused,digest
from runtime_identity import acquire_data_root_evidence,start_ticks

POLICY_BUILD=pathlib.Path(os.environ['BAR_RUNTIME_EVIDENCE_BUILD'])
POLICY_SOURCE=pathlib.Path(os.environ['BAR_RUNTIME_EVIDENCE_SOURCE'])
WRITER="""import os,sys
os.umask(0o077)
p=sys.argv[1]
f=open(p,'w+b',buffering=0)
f.write(base64.b64decode(sys.argv[2]))
for command in sys.stdin.buffer:
 command=command.rstrip(b'\\n')
 if command.startswith(b'append:'):f.seek(0,2);f.write(command[7:]+b'\\n')
 elif command.startswith(b'appendraw:'):f.seek(0,2);f.write(base64.b64decode(command[10:]))
 elif command==b'rewrite':f.seek(0);f.write(b'X');f.flush()
 elif command==b'truncate':f.truncate(1);f.flush()
 elif command==b'close':f.close();break
"""

def _rp2_canonical_trace(source,timeline,name,directory):
    """Concrete action parameters from actual framed F# and held-FD effects.
    The expected core states are independently checked by the F# reader. The
    canonical Quint actions check every projected field at every ordered step.
    This fixture code grants no runtime authority and is never imported by the
    production helper.
    """
    empty_hash=hashlib.sha256(b'').hexdigest()
    empty_prefix={'rawBytes':0,'rawSha256':empty_hash,'completeBytes':0,'completeSha256':empty_hash,'tailBytes':0,'tailSha256':empty_hash,'completeRecords':0,'tailClass':'empty'}
    no_consumption={'boundary':'none','revision':0,'rawBytes':0,'rawSha256':'','readStartMicroseconds':0,'readEndMicroseconds':0,'linearizedMicroseconds':0,'releasedMicroseconds':0,'deadlineMicroseconds':0}
    core={'phase':'empty','identity':None,'observedRevision':0,'validatedRevision':0,'validatedBoundary':None,'consumedRevision':0,'consumedBoundary':None,'bytes':0,'sha256':'','stickyInvalid':False,'reason':None,'prefix':empty_prefix,'candidatePrefix':None,'consumedPrefix':None,'consumption':None,'attemptId':0,'probeCount':0,'evaluationCount':0,'deadlineMicroseconds':0}
    mech={'rootsValid':False,'prefixIntact':False,'writerPresent':False,'policyPhase':'none','policyInvocation':'none','policyClosure':'none','settlement':{'phase':'idle','boundary':'none','remaining':32,'deadlineAvailable':True},'producerBytes':0,'producerContradiction':False,'finalPhase':'none','finalSize':0,'readStart':0,'readEnd':0,'linearized':0}
    steps=[]
    def literal(value):
        if type(value) is bool:return 'true' if value else 'false'
        if type(value) is int:return str(value)
        if type(value) is str:return json.dumps(value)
        if type(value) is dict:return '{ '+', '.join(key+': '+literal(item) for key,item in value.items())+' }'
        raise AssertionError('closed Quint literal')
    def project():
        present=core['identity'] is not None
        return {'phase':core['phase'],'generation':1 if present else 0,'observedRevision':core['observedRevision'],'validatedRevision':core['validatedRevision'],'intendedBoundary':core['validatedBoundary'] or 'none','consumedRevision':core['consumedRevision'],'consumedBoundary':core['consumedBoundary'] or 'none','producerMatches':present,'logMatches':present,'sourceMatches':present,'rootsValid':mech['rootsValid'],'prefixIntact':mech['prefixIntact'],'writerPresent':mech['writerPresent'],'authorityActive':False,'stickyInvalid':core['stickyInvalid'],'policyPhase':mech['policyPhase'],'policyInvocation':mech['policyInvocation'],'policyClosure':mech['policyClosure'],'settlement':dict(mech['settlement']),'prefix':core['prefix'],'consumedPrefix':core['consumedPrefix'] or empty_prefix,'consumption':core['consumption'] or no_consumption,'producerBytes':mech['producerBytes'],'producerContradiction':mech['producerContradiction'],'candidateBytes':(core['candidatePrefix'] or {}).get('rawBytes',0),'candidateSha256':(core['candidatePrefix'] or {}).get('rawSha256',''),'finalPhase':mech['finalPhase'],'finalSize':mech['finalSize'],'readStart':mech['readStart'],'readEnd':mech['readEnd'],'linearized':mech['linearized'],'evaluations':core['evaluationCount'],'attemptId':core['attemptId'],'probeCount':core['probeCount'],'deadlineMicroseconds':core['deadlineMicroseconds']}
    def emit(action):steps.append({'action':action,'state':json.loads(json.dumps(project()))})
    first=next(row for row in timeline if row['kind']=='policy')
    identity={key:first['expected'][key] for key in ('runId','sourceSetSha256','apphostSha256','closureSha256')}
    identity.update({key:first['observation'][key] for key in ('pid','startTicks','uid','device','inode','path')})
    core={**core,'phase':'acquired','identity':identity};mech['writerPresent']=True;emit('acquire')
    for row in timeline:
        kind=row['kind']
        if kind=='boundary':
            if mech['settlement']['phase']!='idle':raise AssertionError('boundary without terminal')
            mech['settlement']={'phase':'probing','boundary':row['boundary'],'remaining':32,'deadlineAvailable':True};mech.update(policyPhase='none',policyInvocation='none',policyClosure='none',finalPhase='none');emit('beginObservedBoundary('+literal(row['boundary'])+')')
        elif kind=='probe':
            if mech['settlement']['phase']=='candidate':
                mech['settlement']['phase']='probing';mech.update(policyPhase='none',policyInvocation='none',policyClosure='none',finalPhase='none')
                core={**core,'phase':'sampled','candidatePrefix':None};emit('retryObserved('+literal(mech['settlement']['boundary'])+')')
            mech['settlement']['remaining']=row['remaining']
            if row['event']=='raw':mech['settlement']['phase']='candidate';emit('completeRecordCandidate')
            else:emit('incompleteRecordProbe')
        elif kind=='policy':
            inv=row['invocation'];args=literal(inv['invocationId'])+','+literal(inv['closureSha256'])
            mech.update(policyPhase='started',policyInvocation=inv['invocationId'],policyClosure=inv['closureSha256']);emit('beginPolicy('+args+')')
            mech['policyPhase']='ready';emit('readyPolicy('+args+')')
            after=row['afterState'];before=core;core=json.loads(json.dumps(after))
            if row['status']=='accepted':core.update(phase='sampled',validatedRevision=before['validatedRevision'],validatedBoundary=before['validatedBoundary'],candidatePrefix=None)
            mech.update(rootsValid=row['status']=='accepted',prefixIntact=True,producerBytes=max(mech['producerBytes'],after['bytes']))
            extras=str(after['attemptId'])+','+str(after['probeCount'])+','+str(after['evaluationCount'])+','+str(after['deadlineMicroseconds'])
            params=literal(after['prefix'])+','+extras
            emit(('rejectRaw('+params+')') if row['status']=='refused' else 'observeRaw('+literal(after['prefix'])+','+literal(row['status']=='accepted')+','+extras+')')
            if row['status']=='accepted':
                core=after;emit('validate('+literal(row['boundary'])+')')
            mech['policyPhase']='evaluated';emit('evaluatedPolicy('+args+')')
            mech['policyPhase']='completed';emit('completePolicy('+args+')')
        elif kind=='final-observation':
            mech.update(finalPhase='reading',readStart=row['readStartMicroseconds']);emit('beginFinalRead('+str(mech['readStart'])+')')
            mech.update(finalPhase='read',readEnd=row['readEndMicroseconds']);emit('endFinalRead('+str(mech['readEnd'])+')')
            if row['rawBytes']>mech['producerBytes']:
                mech['producerBytes']=row['rawBytes'];emit('producerSize('+str(row['rawBytes'])+',false)')
            mech.update(finalSize=row['rawBytes'],linearized=row['linearizedMicroseconds'],finalPhase='unchanged' if row['rawBytes']==core['bytes'] else 'grown')
            emit('observeFinalSize('+str(row['rawBytes'])+','+str(row['linearizedMicroseconds'])+')')
        elif kind=='growth':
            core=row['afterState'];mech.update(rootsValid=False,policyPhase='none',policyInvocation='none',policyClosure='none',finalPhase='none');emit('observedGrowth')
        elif kind=='producer-after-L':
            mech.update(producerBytes=row['rawBytes'],producerContradiction=row['contradictory']);emit('producerSize('+str(row['rawBytes'])+','+literal(row['contradictory'])+')')
        elif kind=='consume':
            core=row['afterState'];mech['finalPhase']='released';obs=row['observation'];emit('consumeAt('+literal(obs['boundary'])+','+str(obs['releasedMicroseconds'])+','+str(obs['deadlineMicroseconds'])+')')
        elif kind=='revoke':
            core=row['afterState']
            if row['unavailable']:mech['writerPresent']=False
            emit('revokeObserved('+literal(row['unavailable'])+')')
        elif kind=='terminal':
            if row['outcome']=='accepted':
                mech['settlement'].update(phase='idle',boundary='none');emit('completeBoundary('+literal(core['consumedBoundary'])+')')
            elif row['check']=='infolog-record-settlement-exhausted':
                mech['settlement']['phase']='refused';emit('recordSettlementExhausted')
            else:
                # Policy/root refusal and evaluation exhaustion have already
                # produced the concrete sticky revocation edge.
                if not core['stickyInvalid']:raise AssertionError('unrevoked terminal')
        else:raise AssertionError('closed RP2 effect')
    # Dynamic constants contain public fixture values only. Import exactly the
    # production canonical model; no alternate transition definitions.
    directory.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(source/'GrowingLogEvidence.qnt',directory/'GrowingLogEvidence.qnt')
    qnt=directory/(name+'.qnt')
    body='module RP2_actual_test {\n import GrowingLogEvidence.* from "./GrowingLogEvidence"\n run actual = init'
    for step in steps:body+='\n .then('+step['action']+').expect(evidence == '+literal(step['state'])+')'
    qnt.write_text(body+'\n}\n')
    trace=directory/(name+'.itf.json')
    run=subprocess.run(['quint','test',str(qnt),'--backend=typescript','--main','RP2_actual_test','--match','^actual$','--out-itf',str(directory/(name+'_{test}_{seq}.itf.json')),'--seed','424242','--max-samples','1'],stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True,timeout=30)
    (directory/(name+'.log')).write_text(run.stdout)
    if run.returncode:raise AssertionError('actual full-state canonical correspondence: '+name+'\n'+run.stdout)
    generated=directory/(name+'_actual_0.itf.json')
    itf=json.loads(generated.read_text())
    # Apply the same volatile-metadata normalization as the owning predecessor
    # gate. Preserve every generated variable and ordered state unchanged.
    itf['#meta'].pop('description',None);itf['#meta'].pop('timestamp',None)
    itf['#meta']['status']='ok'
    trace.write_text(json.dumps(itf,separators=(',',':'),sort_keys=True)+'\n')
    return {'steps':steps,'trace':trace.name}

class GrowingLogTests(unittest.TestCase):
    def test_policy_diagnostic_decoder_is_total_closed_and_never_echoes(self):
        valid=b'{"schema":"fsbar.barc-runtime-evidence-failure-observation/v1","checkpoint":"request-evaluation","kind":"refused"}\n'
        self.assertEqual(growing_log._policy_observation(valid)['checkpoint'],'request-evaluation')
        invalid=(valid.replace(b'"refused"',b'"PRIVATE_SENTINEL"'),valid+valid,valid.replace(b'"checkpoint"',b'"checkpoint":[],"other"'),b'['+b'x'*2049+b']')
        for raw in invalid:self.assertIsNone(growing_log._policy_observation(raw))
    def test_policy_transport_retains_only_one_closed_diagnostic_frame(self):
        policy=self.root/'diagnostic-policy'
        policy.write_text('''#!/usr/bin/python3
import hashlib,json,os,sys
args=dict(zip(sys.argv[1::2],sys.argv[2::2]));inv=args["--invocation-id"];closure=args["--closure-sha256"]
ticks=open(f"/proc/{os.getpid()}/stat").read().split()[21]
print(json.dumps({"schema":"fsbar.barc-runtime-evidence-policy-ready/v2","invocationId":inv,"closureSha256":closure,"pid":os.getpid(),"startTicks":ticks,"uid":os.geteuid(),"phase":"ready"},separators=(",",":")),flush=True)
sys.stdin.buffer.read()
print(json.dumps({"schema":"fsbar.barc-runtime-evidence-policy-completed/v2","invocationId":inv,"closureSha256":closure,"pid":os.getpid(),"startTicks":ticks,"uid":os.geteuid(),"phase":"completed","result":{}},separators=(",",":")),flush=True)
sys.stderr.write('{"schema":"fsbar.barc-runtime-evidence-failure-observation/v1","checkpoint":"request-evaluation","kind":"refused"}\\n');sys.stderr.flush()
''');os.chmod(policy,0o700)
        runner=object.__new__(GrowingLog);runner.last_policy_observation=None
        self.assertEqual(runner._run_policy(str(policy),'/unused','a'*64,b'{}',time.monotonic()+2),b'{}\n')
        self.assertEqual(runner.last_policy_observation['checkpoint'],'request-evaluation')
        policy.write_text(policy.read_text().replace("sys.stderr.write('{\"schema\"", "sys.stderr.write('PRIVATE_SENTINEL\\n'+ '{\"schema\""));os.chmod(policy,0o700)
        runner.last_policy_observation=None
        self.assertEqual(runner._run_policy(str(policy),'/unused','a'*64,b'{}',time.monotonic()+2),b'{}\n')
        self.assertIsNone(runner.last_policy_observation)
    def test_actual_compiled_failure_projection_uses_production_transport(self):
        config=self.config();expected={'configSha256':'d'*64,'sourceSetSha256':growing_log._source_set(config),'policySha256':config['artifacts']['runtimeEvidencePolicy']['sha256'],'closureSha256':self.closure_sha}
        observation={'schema':'fsbar.barc-stock-failure-observation/v1',**expected,'scope':'post-handoff-pre-browser','check':'policy-result-join','outcome':'policy-nonaccepted','policyObservation':{'schema':'fsbar.barc-runtime-evidence-failure-observation/v1','checkpoint':'request-evaluation','kind':'refused'}}
        observation_raw=(json.dumps(observation,separators=(',',':'))+'\n').encode()
        operation_raw=b'{"schema":"fsbar.barc-stock-operation-result/v1","status":"failed","category":"refused"}\n'
        request={'schema':'fsbar.barc-stock-failure-projection/v1','expected':expected,'observation':observation,'observationSha256':hashlib.sha256(observation_raw).hexdigest(),'operationResultBase64':base64.b64encode(operation_raw).decode(),'operationResultSha256':hashlib.sha256(operation_raw).hexdigest()}
        runner=object.__new__(GrowingLog);runner.last_policy_observation=None
        encoded=json.dumps(request,separators=(',',':')).encode();projected=json.loads(runner._run_policy(str(self.policy),str(self.closure),self.closure_sha,encoded,time.monotonic()+5))
        self.assertEqual((projected['status'],projected['check'],projected['nativeAcceptance']),('observed-failure','policy-result-join',False))
        request['expected']['sourceSetSha256']='f'*64
        unavailable=json.loads(runner._run_policy(str(self.policy),str(self.closure),self.closure_sha,json.dumps(request,separators=(',',':')).encode(),time.monotonic()+5))
        self.assertEqual(unavailable['status'],'diagnostic-unavailable');self.assertNotIn('PRIVATE_SENTINEL',json.dumps(unavailable))
        request['expected']['sourceSetSha256']=expected['sourceSetSha256'];request['operationResultSha256']='0'*64
        false_digest=json.loads(runner._run_policy(str(self.policy),str(self.closure),self.closure_sha,json.dumps(request,separators=(',',':')).encode(),time.monotonic()+5))
        self.assertEqual(false_digest['status'],'diagnostic-unavailable')
    def test_later_final_refresh_failure_drops_noncausal_pending_observation(self):
        self.spawn(self.text().replace(b'[DataDirLocater::Check] Isolation Mode!\n',b''));original_run=self.handle._run_policy;original_custody=self.handle._custody;after=[False]
        def policy(*args):
            output=original_run(*args);after[0]=True;return output
        def custody(*args,**kwargs):
            if after[0]:raise OSError('PRIVATE_SENTINEL_FINAL_REFRESH')
            return original_custody(*args,**kwargs)
        self.handle._run_policy=policy;self.handle._custody=custody
        with self.assertRaises(OSError) as caught:self.consume('browser')
        fact=caught.exception._barc_failure_observation
        self.assertEqual((fact['check'],fact['outcome'],fact['policyObservation']),('infolog-final-refresh','os-unavailable',None))
    def test_acquisition_close_failure_preserves_writer_refusal(self):
        self.spawn();real_close=os.close;closed=[]
        def close_failure(fd):closed.append(fd);raise OSError('PRIVATE_SENTINEL_CLOSE')
        with mock.patch.object(GrowingLog,'_writer',side_effect=growing_log.mark_failure(Refused('PRIVATE_SENTINEL_WRITER'),'infolog-writer-match')),mock.patch.object(growing_log.os,'close',side_effect=close_failure):
            with self.assertRaises(Refused) as caught:GrowingLog.acquire(self.log,self.handle.process)
        for fd in closed:real_close(fd)
        fact=caught.exception._barc_failure_observation
        self.assertEqual((fact['check'],fact['outcome']),('infolog-writer-match','refused'));self.assertTrue(caught.exception._barc_cleanup_unknown)
    def test_three_accepted_growth_samples_report_mechanical_exhaustion(self):
        self.spawn();original=self.handle._run_policy;calls=[0]
        def grow(*args):
            output=original(*args);calls[0]+=1;self.command('append:benign complete record');return output
        self.handle._run_policy=grow
        with self.assertRaises(Refused) as caught:self.consume('browser')
        fact=caught.exception._barc_failure_observation
        self.assertEqual(calls[0],3);self.assertEqual((fact['check'],fact['outcome'],fact['policyObservation']),('policy-sample-exhausted','refused',None))
        counters=caught.exception._barc_infolog_mechanical_observation
        self.assertEqual((counters['terminalCause'],counters['evaluationsBegun'],counters['evaluationsCompleted'],counters['growthAfterEvaluation']),('policy-evaluation-growth-cap',3,3,3))
        self.assertEqual(counters['probesCompleted'],3)
    def test_full_buffered_writer_growth_after_real_policy_exhausts_three_evaluations(self):
        self.child=subprocess.Popen([sys.executable,str(pathlib.Path(__file__).with_name('buffered_writer.py')),str(self.log),base64.b64encode(self.text()).decode()],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,start_new_session=True)
        def ack(expected):
            need=__import__('select').select([self.child.stdout],[],[],2)[0]
            self.assertTrue(need,'public buffered writer ack deadline')
            self.assertEqual(self.child.stdout.readline().strip(),expected)
        ack('ready')
        self.handle=acquire_data_root_evidence(self.log,{'pid':self.child.pid,'startTicks':start_ticks(self.child.pid),'uid':os.geteuid()})
        original=self.handle._run_policy
        def grow(*args):
            result=original(*args)
            self.child.stdin.write('growflush\n');self.child.stdin.flush();ack('done')
            return result
        self.handle._run_policy=grow
        try:
            with self.assertRaises(Refused) as caught:self.consume('browser')
            counters=caught.exception._barc_infolog_mechanical_observation
            self.assertEqual((counters['terminalCause'],counters['evaluationsBegun'],counters['evaluationsCompleted'],counters['growthAfterEvaluation']),('policy-evaluation-growth-cap',3,3,3))
            self.assertEqual(counters['probesCompleted'],3)
            self.assertEqual(counters['terminalCheck'],'policy-sample-exhausted')
            self.assertEqual(counters['tailBytes'],0)
            self.assertTrue(caught.exception._barc_infolog_mechanical_retained)
        finally:
            self.child.stdin.write('close\n');self.child.stdin.flush();self.child.communicate(timeout=2)
    def test_genuine_pending_exhaustion_retains_policy_observation(self):
        self.spawn(self.text().replace(b'[DataDirLocater::Check] Isolation Mode!\n',b''))
        with self.assertRaises(Refused) as caught:self.consume('browser')
        fact=caught.exception._barc_failure_observation
        self.assertEqual((fact['check'],fact['outcome']),('policy-sample-exhausted','policy-nonaccepted'));self.assertEqual(fact['policyObservation']['kind'],'pending')
    def test_partial_record_settles_before_first_policy_revision(self):
        initial=self.text()[:-1];self.spawn(initial);requests=[];actual=self.handle._run_policy;actual_sample=self.handle._sample;probes=[0]
        def inspect(*args):
            requests.append(json.loads(args[3])['observation']['revision']);return actual(*args)
        self.handle._run_policy=inspect
        def sample(deadline):
            value=actual_sample(deadline);probes[0]+=1
            if probes[0]==1:self.command('appendraw:'+base64.b64encode(b'\n').decode())
            return value
        self.handle._sample=sample;result=self.consume('browser')
        self.assertEqual((requests,result['revision']),([1],1))
        self.assertGreaterEqual(len(self.handle.settlement_transcript),2)
        self.assertEqual(self.handle.settlement_transcript[-1]['event'],'complete')
        output=os.environ.get('BAR_SETTLEMENT_TRANSCRIPT')
        if output:pathlib.Path(output).write_text(json.dumps(self.handle.settlement_transcript,separators=(',',':'))+'\n')
    def test_continuous_partial_tail_exhausts_without_policy_evaluation(self):
        self.spawn(self.text()[:-1]);calls=[0]
        self.handle._run_policy=lambda *args:(calls.__setitem__(0,calls[0]+1),b'')[1]
        with mock.patch.object(growing_log,'MAX_SETTLEMENT_PROBES',3):
            with self.assertRaises(Refused) as caught:self.consume('browser')
        fact=caught.exception._barc_failure_observation
        self.assertEqual((calls[0],self.handle.revision,fact['check'],fact['outcome'],fact['policyObservation']),(0,0,'infolog-record-settlement-exhausted','refused',None))
    def test_settlement_deadline_prevents_policy_launch(self):
        self.spawn(self.text()[:-1]);calls=[0];self.handle._run_policy=lambda *args:calls.__setitem__(0,calls[0]+1)
        with self.assertRaises(Refused) as caught:self.handle._settle(time.monotonic(),0)
        fact=caught.exception._barc_failure_observation
        self.assertEqual((calls[0],self.handle.revision,fact['check'],fact['outcome'],fact['policyObservation']),(0,0,'infolog-record-settlement-deadline','deadline',None))
    def test_partial_prefix_rewrite_is_sticky_across_probes(self):
        self.spawn(self.text()[:-1]);real_sleep=time.sleep;changed=[False]
        def rewrite(_):
            if not changed[0]:
                changed[0]=True;self.child.stdin.write(b'rewrite\n');self.child.stdin.flush();real_sleep(.03)
            else:real_sleep(0)
        with mock.patch.object(growing_log.time,'sleep',side_effect=rewrite):
            with self.assertRaises(Refused):self.consume('browser')
        self.assertTrue(self.handle.revoked);self.assertEqual(self.handle.revision,0)
    def test_exact_read_refuses_after_finite_short_read_budget(self):
        self.spawn(self.text());actual=os.pread
        def short(fd,count,offset):return actual(fd,min(count,1),offset)
        with mock.patch.object(growing_log,'MAX_PREAD_CALLS',2),mock.patch.object(growing_log.os,'pread',side_effect=short):
            with self.assertRaises(Refused) as caught:self.consume('browser')
        self.assertEqual(caught.exception._barc_failure_observation['check'],'infolog-record-settlement-exhausted')
    def test_deadline_expiry_inside_writer_census_stops_before_fd_walk_and_policy(self):
        self.spawn(self.text());base=time.monotonic();expired=[False];fd_stats=[0];actual_listdir=os.listdir;actual_stat=os.stat;policy=[0]
        def listdir(path):
            value=actual_listdir(path)
            if path==f'/proc/{self.child.pid}/fd':expired[0]=True
            return value
        def guarded_stat(path,*args,**kwargs):
            if expired[0] and str(path).startswith(f'/proc/{self.child.pid}/fd/'):
                fd_stats[0]+=1
            return actual_stat(path,*args,**kwargs)
        self.handle._run_policy=lambda *args:policy.__setitem__(0,policy[0]+1)
        with mock.patch.object(growing_log.time,'monotonic',side_effect=lambda:base+2 if expired[0] else base),mock.patch.object(growing_log.os,'listdir',side_effect=listdir),mock.patch.object(growing_log.os,'stat',side_effect=guarded_stat):
            with self.assertRaises(Refused) as caught:self.handle._settle(base+1,0)
        self.assertEqual((fd_stats[0],policy[0],self.handle.revision,caught.exception._barc_failure_observation['check']),(0,0,0,'infolog-record-settlement-deadline'))
    def test_deadline_at_candidate_promotion_does_not_advance_revision_or_launch_policy(self):
        self.spawn(self.text());base=time.monotonic();expired=[False];actual=self.handle._sample;policy=[0]
        def expire_after_sample(deadline):
            value=actual(deadline);expired[0]=True;return value
        self.handle._sample=expire_after_sample;self.handle._run_policy=lambda *args:policy.__setitem__(0,policy[0]+1)
        with mock.patch.object(growing_log.time,'monotonic',side_effect=lambda:base+2 if expired[0] else base):
            with self.assertRaises(Refused) as caught:self.handle._settle(base+1,0)
        self.assertEqual((policy[0],self.handle.revision,caught.exception._barc_failure_observation['check']),(0,0,'infolog-record-settlement-deadline'))
    def test_settlement_failure_after_pending_drops_policy_observation(self):
        self.spawn(self.text().replace(b'[DataDirLocater::Check] Isolation Mode!\n',b''));actual=self.handle._run_policy;calls=[0]
        def append_partial(*args):
            output=actual(*args);calls[0]+=1
            if calls[0]==1:self.command('appendraw:'+base64.b64encode(b'partial').decode())
            return output
        self.handle._run_policy=append_partial
        with mock.patch.object(growing_log,'MAX_SETTLEMENT_PROBES',4):
            with self.assertRaises(Refused) as caught:self.consume('browser')
        fact=caught.exception._barc_failure_observation
        self.assertEqual((calls[0],fact['check'],fact['outcome'],fact['policyObservation']),(1,'infolog-record-settlement-exhausted','refused',None))
    @classmethod
    def setUpClass(cls):
        cls.fixture=tempfile.TemporaryDirectory(prefix='bar-policy-closure-fixture-');root=pathlib.Path(cls.fixture.name)
        managed=root/'managed';provenance=root/'provenance';managed.mkdir();provenance.mkdir()
        for name in ('RuntimeEvidence','RuntimeEvidence.dll','RuntimeEvidence.deps.json','RuntimeEvidence.runtimeconfig.json','FSharp.Core.dll'):
            shutil.copyfile(POLICY_BUILD/name,managed/name);os.chmod(managed/name,0o555 if name=='RuntimeEvidence' else 0o444)
        shutil.copyfile(POLICY_BUILD/'RuntimeEvidence.pdb',provenance/'RuntimeEvidence.pdb')
        system_dotnet=pathlib.Path(os.environ.get('DOTNET_ROOT','/usr/share/dotnet')).resolve()
        version=subprocess.check_output(['dotnet','--list-runtimes'],text=True).splitlines()[-1].split()[1]
        system_framework=system_dotnet/'shared/Microsoft.NETCore.App'/version
        system_fxr=max((system_dotnet/'host/fxr').iterdir(),key=lambda p:tuple(map(int,p.name.split('.'))))
        cls.dotnet_root=root/'dotnet';framework=cls.dotnet_root/'shared/Microsoft.NETCore.App'/version;fxr=cls.dotnet_root/'host/fxr'/system_fxr.name
        framework.parent.mkdir(parents=True);fxr.parent.mkdir(parents=True)
        shutil.copytree(system_framework,framework);shutil.copytree(system_fxr,fxr)
        shutil.copyfile(system_dotnet/'dotnet',cls.dotnet_root/'dotnet')
        for base,directories,files in os.walk(cls.dotnet_root):
            for name in directories:os.chmod(pathlib.Path(base)/name,0o555)
            for name in files:os.chmod(pathlib.Path(base)/name,0o555 if '.so' in name else 0o444)
        os.chmod(cls.dotnet_root/'dotnet',0o555);os.chmod(cls.dotnet_root,0o555)
        if any(path.is_symlink() for path in cls.dotnet_root.rglob('*')):raise AssertionError('private runtime staging retained a link')
        def row(path,role=None):
            info=path.stat();value={'path':str(path),'bytes':info.st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'device':f'{os.major(info.st_dev):x}:{os.minor(info.st_dev):x}','inode':info.st_ino,'ownerUid':info.st_uid,'mode':stat.S_IMODE(info.st_mode),'links':info.st_nlink}
            if role:value={'role':role,**value}
            return value
        runtime_paths={path.resolve() for directory in (framework,fxr) for path in directory.rglob('*') if path.is_file()}
        candidates=[managed/'RuntimeEvidence',framework/'libcoreclr.so',framework/'libhostpolicy.so',fxr/'libhostfxr.so',*framework.glob('*.so')]
        for candidate in candidates:
            output=subprocess.run(['ldd',str(candidate)],text=True,stdout=subprocess.PIPE,check=True).stdout
            for line in output.splitlines():
                fields=line.replace('=>',' ').split()
                runtime_paths.update(pathlib.Path(x).resolve() for x in fields if x.startswith('/') and pathlib.Path(x).is_file())
        dynamic_patterns={'icu':'libicu*.so*','crypto':'libcrypto.so*','ssl':'libssl.so*','brotli':'libbrotli*.so*','zlib':'libz.so*','zstd':'libzstd.so*'}
        ldconfig=subprocess.run(['ldconfig','-p'],stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=True)
        if len(ldconfig.stdout)>1024*1024 or len(ldconfig.stderr)>4096:raise AssertionError('bounded loader cache census')
        dynamic={name:set() for name in dynamic_patterns}
        for line in ldconfig.stdout.decode('utf-8','strict').splitlines():
            if '=>' not in line:continue
            raw=line.rsplit('=>',1)[1].strip();path=pathlib.Path(raw)
            for name,pattern in dynamic_patterns.items():
                if fnmatch.fnmatchcase(path.name,pattern):
                    resolved=path.resolve(strict=True)
                    if resolved.is_file():dynamic[name].add(resolved)
        if sum(map(len,dynamic.values()))>128:raise AssertionError('bounded dynamic runtime census')
        cls.dynamic_libraries={name:sorted(paths) for name,paths in dynamic.items()}
        runtime_paths.update(path for paths in cls.dynamic_libraries.values() for path in paths)
        runtime_paths.add(pathlib.Path('/etc/ld.so.cache'))
        runtime=[row(path) for path in sorted(runtime_paths)]
        roles={'hostfxr':str(fxr/'libhostfxr.so'),'hostpolicy':str(framework/'libhostpolicy.so'),'coreLib':str(framework/'System.Private.CoreLib.dll'),'coreClr':str(framework/'libcoreclr.so'),'jit':str(framework/'libclrjit.so')}
        policy_commit=subprocess.check_output(['git','-C',str(POLICY_SOURCE),'rev-parse','HEAD'],text=True).strip();policy_tree=subprocess.check_output(['git','-C',str(POLICY_SOURCE),'rev-parse','HEAD^{tree}'],text=True).strip()
        product_commit='2cd9f47dd120d43b6781b6edc7dbb1d571cc51a1';product_tree='4fee295bf14f6b2fe2369085c1e743610709297e'
        highbar_commit='54e17084c35b90584f8f84efc468bcc8943e4ec0'
        product_roles={'fsbarCommit':product_commit,'highbarCommit':highbar_commit}
        product_source_set=hashlib.sha256(json.dumps(product_roles,sort_keys=True,separators=(',',':')).encode()).hexdigest()
        source_link=json.dumps({'documents':{'/_/*':f'https://raw.githubusercontent.com/FS-GG/FSBarV2/{policy_commit}/*'}},separators=(',',':')).encode()
        (provenance/'RuntimeEvidence.sourcelink.json').write_bytes(source_link)
        (provenance/'policy-source.json').write_text(json.dumps({'schema':'fsbar.barc-source-identity/v1','role':'policySourceManifest','commit':policy_commit,'tree':policy_tree},separators=(',',':')))
        (provenance/'product-source.json').write_text(json.dumps({'schema':'fsbar.barc-source-identity/v1','role':'productSourceManifest','commit':product_commit,'tree':product_tree},separators=(',',':')))
        (provenance/'product-role-graph.json').write_text(json.dumps({'schema':'fsbar.barc-product-source-role-graph/v1','roles':product_roles},separators=(',',':')))
        (provenance/'locked-build-inputs.json').write_text(json.dumps({'schema':'fsbar.barc-locked-build-inputs/v1','policyProjectSha256':hashlib.sha256((POLICY_SOURCE/'tests/Broker.NativeProof/RuntimeEvidence/RuntimeEvidence.fsproj').read_bytes()).hexdigest(),'policyLockSha256':hashlib.sha256((POLICY_SOURCE/'tests/Broker.NativeProof/RuntimeEvidence/RuntimeEvidence.packages.lock.json').read_bytes()).hexdigest(),'policyTree':policy_tree},separators=(',',':')))
        (provenance/'toolchain-receipt.json').write_text(json.dumps({'schema':'fsbar.barc-toolchain-receipt/v1','dotnetSdk':subprocess.check_output(['dotnet','--version'],text=True).strip(),'targetFramework':'net10.0'},separators=(',',':')))
        shutil.copyfile(pathlib.Path(__file__).with_name('source-manifest.json'),provenance/'helper-source-manifest.json')
        helper_identity=json.loads((provenance/'helper-source-manifest.json').read_bytes())
        managed_rows=[row(managed/name,role) for role,name in [('apphost','RuntimeEvidence'),('managedDll','RuntimeEvidence.dll'),('depsJson','RuntimeEvidence.deps.json'),('runtimeConfigJson','RuntimeEvidence.runtimeconfig.json'),('fsharpCore','FSharp.Core.dll')]]
        managed_hashes={item['role']:item['sha256'] for item in managed_rows}
        receipt={'schema':'fsbar.barc-runtime-evidence-build-receipt/v2','policyCommit':policy_commit,'policyTree':policy_tree,'productCommit':product_commit,'productTree':product_tree,'helperCommit':helper_identity['publicHead'],'helperTree':helper_identity['publicTree'],'productSourceSetSha256':product_source_set,'productRoleGraphSha256':hashlib.sha256((provenance/'product-role-graph.json').read_bytes()).hexdigest(),'lockedBuildInputsSha256':hashlib.sha256((provenance/'locked-build-inputs.json').read_bytes()).hexdigest(),'toolchainReceiptSha256':hashlib.sha256((provenance/'toolchain-receipt.json').read_bytes()).hexdigest(),'managed':managed_hashes,'pdbSha256':hashlib.sha256((provenance/'RuntimeEvidence.pdb').read_bytes()).hexdigest(),'sourceLinkSha256':hashlib.sha256(source_link).hexdigest(),'helperManifestSha256':hashlib.sha256((provenance/'helper-source-manifest.json').read_bytes()).hexdigest()}
        (provenance/'build-receipt.json').write_text(json.dumps(receipt,separators=(',',':')))
        for path in provenance.iterdir():os.chmod(path,0o444)
        provenance_rows=[row(provenance/name,role) for role,name in [('pdb','RuntimeEvidence.pdb'),('sourceLink','RuntimeEvidence.sourcelink.json'),('buildReceipt','build-receipt.json'),('helperManifest','helper-source-manifest.json'),('policySourceManifest','policy-source.json'),('productSourceManifest','product-source.json'),('productRoleGraph','product-role-graph.json'),('lockedBuildInputs','locked-build-inputs.json'),('toolchainReceipt','toolchain-receipt.json')]]
        source={'policyCommit':policy_commit,'policyTree':policy_tree,'productCommit':product_commit,'productTree':product_tree,'productSourceSetSha256':product_source_set,**{role+'Sha256':next(item['sha256'] for item in provenance_rows if item['role']==role) for role in ('policySourceManifest','productSourceManifest','productRoleGraph','lockedBuildInputs','toolchainReceipt','buildReceipt','pdb','sourceLink','helperManifest')}}
        def directory(path):
            info=path.stat();names=sorted(p.name for p in path.iterdir());return {'path':str(path),'ownerUid':info.st_uid,'mode':stat.S_IMODE(info.st_mode),'entriesSha256':hashlib.sha256('\n'.join(names).encode()).hexdigest()}
        os.chmod(managed,0o555);os.chmod(provenance,0o555)
        search_paths={managed,provenance,framework,fxr,framework.parent,fxr.parent,*[path.parent for path in runtime_paths]}
        search=[directory(path) for path in sorted(search_paths)]
        value={'schema':'fsbar.barc-runtime-evidence-policy-closure/v3','custodyRoot':str(root),'managedRoot':str(managed),'provenanceRoot':str(provenance),'runtimeRoots':[str(framework),str(fxr)],'searchLayout':search,'managed':managed_rows,'provenance':provenance_rows,'runtime':runtime,'runtimeRoles':roles,'source':source,'custody':{'ownerUid':os.geteuid(),'executablePath':str(managed/'RuntimeEvidence'),'fixedArgv':[str(managed/'RuntimeEvidence'),'--closure-manifest','--closure-sha256','--invocation-id']}}
        cls.closure=root/'closure.json';cls.closure.write_text(json.dumps(value,separators=(',',':')));os.chmod(cls.closure,0o600)
        cls.policy=managed/'RuntimeEvidence';cls.closure_sha=hashlib.sha256(cls.closure.read_bytes()).hexdigest()
    @classmethod
    def tearDownClass(cls):
        for path in pathlib.Path(cls.fixture.name).rglob('*'):
            try:os.chmod(path,0o700 if path.is_dir() else 0o600)
            except FileNotFoundError:pass
        cls.fixture.cleanup()
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(prefix='bar-growing-log-');self.root=pathlib.Path(self.temp.name);os.chmod(self.root,0o700)
        self.write=self.root/'engine';self.data=self.root/'runtime-data';self.write.mkdir(mode=0o700);self.data.mkdir(mode=0o700);self.log=self.write/'infolog.txt';self.child=None;self.handle=None
        real_popen=subprocess.Popen
        def private_runtime_popen(argv,*args,**kwargs):
            if argv and pathlib.Path(argv[0])==self.policy:
                env=dict(kwargs.get('env') or {});env['DOTNET_ROOT']=str(self.dotnet_root);env['DOTNET_ROOT_X64']=str(self.dotnet_root);env['DOTNET_MULTILEVEL_LOOKUP']='0';kwargs['env']=env
            return real_popen(argv,*args,**kwargs)
        self.popen_patch=mock.patch.object(growing_log.subprocess,'Popen',side_effect=private_runtime_popen);self.popen_patch.start()
    def tearDown(self):
        self.popen_patch.stop()
        if self.handle:
            try:self.handle.close()
            except OSError:pass
        if self.child and self.child.poll() is None:
            self.child.kill();self.child.wait()
        if self.child and self.child.stdin:
            self.child.stdin.close()
        self.temp.cleanup()
    def text(self):
        return (f'[DataDirLocater::Check] Isolation Mode!\n[DataDirLocater::FindWriteableDataDir] using writeable data-directory "{self.write}"\n[DataDirLocater::FilterUsableDataDirs] using read-write data directory: {self.write}/\n[DataDirLocater::FilterUsableDataDirs] using read-only data directory: {self.data}/\n').encode()
    def spawn(self,initial=None):
        initial=self.text() if initial is None else initial
        self.child=subprocess.Popen([sys.executable,'-c','import base64\n'+WRITER,str(self.log),base64.b64encode(initial).decode()],stdin=subprocess.PIPE,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)
        end=time.time()+3
        while not self.log.exists() and time.time()<end:time.sleep(.01)
        time.sleep(.03)
        process={'pid':self.child.pid,'startTicks':start_ticks(self.child.pid),'uid':os.geteuid()}
        self.handle=acquire_data_root_evidence(self.log,process);return process
    def config(self):
        executable=self.policy.resolve();sha=hashlib.sha256(executable.read_bytes()).hexdigest()
        engine=['engine','--isolation','--isolation-dir',str(self.data),'--write-dir',str(self.write),'--config','settings','script']
        return {'runId':'run','roots':{'attemptRoot':str(self.root)},'source':{'fsbarCommit':'2cd9f47dd120d43b6781b6edc7dbb1d571cc51a1','highbarCommit':'54e17084c35b90584f8f84efc468bcc8943e4ec0'},'artifacts':{'runtimeEvidencePolicy':{'path':str(executable),'sha256':sha},'runtimeEvidencePolicyClosure':{'path':str(self.closure),'sha256':self.closure_sha}},'commands':{'engine':engine}}
    def consume(self,boundary):return self.handle.consume(boundary,self.config(),time.monotonic()+5)
    def command(self,value):self.child.stdin.write((value+'\n').encode());self.child.stdin.flush();time.sleep(.03)
    def test_actual_entrypoint_encoded_sixteen_mib_boundary(self):
        self.spawn();requests=[];actual=self.handle._run_policy
        def capture(*args):requests.append(args[3]);return actual(*args)
        self.handle._run_policy=capture;self.consume('browser')
        original=requests[0];cap=16*1024*1024
        for size in (cap,cap+1):
            with self.subTest(encodedBytes=size):
                encoded=original+b' '*(size-len(original))
                self.assertEqual(len(encoded),size)
                process=subprocess.Popen([str(self.policy),'--closure-manifest',str(self.closure),'--closure-sha256',self.closure_sha,'--invocation-id',f'encoded-bound-{size}'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,env={'PATH':'/usr/bin:/bin'})
                try:output,error=process.communicate(encoded,timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill();process.communicate();raise
                frames=[json.loads(line) for line in output.splitlines()]
                self.assertEqual(frames[0]['phase'],'ready')
                if size==cap:
                    self.assertEqual(process.returncode,0);self.assertEqual(len(frames),2)
                    self.assertEqual(frames[1]['phase'],'completed');self.assertEqual(frames[1]['result']['status'],'accepted')
                else:
                    self.assertEqual(process.returncode,2);self.assertEqual(len(frames),1)
                    self.assertEqual(json.loads(error),{'schema':'fsbar.barc-runtime-evidence-failure-observation/v1','checkpoint':'request-read','kind':'exception'})
    def test_full_ten_mib_retained_sample_real_policy_under_fixed_deadline(self):
        self.spawn();header=self.text();cap=10*1024*1024
        padding=b'x'*(cap-len(header)-1)+b'\n'
        self.command('appendraw:'+base64.b64encode(padding).decode())
        self.assertEqual(self.log.stat().st_size,cap)
        began=time.monotonic();deadline=began+5
        self.handle.consume('browser',self.config(),deadline)
        self.assertLess(time.monotonic(),deadline)
        self.assertEqual(len(self.handle.previous),cap)
        self.assertEqual(self.handle.previous,header+padding)
        self.assertEqual(self.handle.counters['requestedReadBytes'],cap)
        self.assertEqual(self.handle.counters['readCallsInOperation'],160)
        self.assertEqual(self.handle.counters['bytesReadInOperation'],cap)
        self.assertEqual(self.handle.counters['evaluationsBegun'],1)
        self.assertEqual(self.handle.counters['evaluationsCompleted'],1)
    def test_staged_runtime_policy_readiness_preflight(self):
        runtime_config=json.loads((self.policy.parent/'RuntimeEvidence.runtimeconfig.json').read_text())
        framework=runtime_config['runtimeOptions']['framework']
        host=subprocess.run([str(self.dotnet_root/'dotnet'),'--info'],env={'PATH':'/usr/bin:/bin','DOTNET_ROOT':str(self.dotnet_root),'DOTNET_ROOT_X64':str(self.dotnet_root),'DOTNET_MULTILEVEL_LOOKUP':'0'},stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=2)
        def stream(raw):
            if not raw:return 'empty'
            value=raw[:4096].decode('utf-8','replace').lower()
            if 'you must install or update .net' in value:return 'framework-unavailable'
            if 'hostfxr' in value:return 'hostfxr-unavailable'
            if 'permission denied' in value:return 'permission-refused'
            return 'bounded-nonempty'
        diagnostic={'schema':'fsbar.public.runtime-evidence-startup-diagnostic/v1','dotnetHostExit':host.returncode,'dotnetStdout':stream(host.stdout),'dotnetStderr':stream(host.stderr),'runtimeFrameworkName':framework['name'],'runtimeFrameworkVersion':framework['version'],'selectedRuntimeVersion':self.dotnet_root.joinpath('shared/Microsoft.NETCore.App').iterdir().__next__().name,'selectedHostfxrVersion':self.dotnet_root.joinpath('host/fxr').iterdir().__next__().name,'runtimeFiles':sum(1 for path in self.dotnet_root.rglob('*') if path.is_file()),'runtimeLinks':sum(1 for path in self.dotnet_root.rglob('*') if path.is_symlink()),'dynamicLibraryCounts':{name:len(paths) for name,paths in self.dynamic_libraries.items()},'policyDisposition':'not-started','policyCheck':None,'policyObservation':None}
        self.assertEqual((host.returncode,diagnostic['runtimeLinks']),(0,0))
        runner=object.__new__(GrowingLog);runner.last_policy_observation=None
        try:
            runner._run_policy(str(self.policy),str(self.closure),self.closure_sha,b'{}',time.monotonic()+5)
            diagnostic['policyDisposition']='ready-completed'
            if runner.last_policy_observation:diagnostic['policyObservation']=runner.last_policy_observation['checkpoint']+':'+runner.last_policy_observation['kind']
        except BaseException as error:
            fact=getattr(error,'_barc_failure_observation',None);diagnostic['policyDisposition']='refused'
            if isinstance(fact,dict):
                diagnostic['policyCheck']=fact.get('check')
                observation=fact.get('policyObservation')
                if isinstance(observation,dict):diagnostic['policyObservation']=observation.get('checkpoint','unknown')+':'+observation.get('kind','unknown')
            if (diagnostic['policyCheck'],diagnostic['policyObservation'])!=('policy-result-join','request-evaluation:exception'):
                print(json.dumps(diagnostic,separators=(',',':'),sort_keys=True),flush=True);raise
            diagnostic['policyDisposition']='ready-request-refused'
        icu={str(path) for path in self.dynamic_libraries['icu']};self.assertTrue(icu)
        omitted=json.loads(self.closure.read_text());omitted['runtime']=[row for row in omitted['runtime'] if row['path'] not in icu]
        omitted_path=pathlib.Path(self.fixture.name)/'current-process-omitted-icu.json';omitted_raw=json.dumps(omitted,separators=(',',':')).encode();omitted_path.write_bytes(omitted_raw);os.chmod(omitted_path,0o600)
        omitted_runner=object.__new__(GrowingLog);omitted_runner.last_policy_observation=None
        try:
            with self.assertRaises(Refused) as caught:omitted_runner._run_policy(str(self.policy),str(omitted_path),hashlib.sha256(omitted_raw).hexdigest(),b'{}',time.monotonic()+5)
            fact=caught.exception._barc_failure_observation;observation=fact['policyObservation']
            self.assertEqual((fact['check'],observation['checkpoint'],observation['kind']),('policy-artifact','current-process','exception'))
            diagnostic['omittedIcuControl']='current-process-refused'
        finally:omitted_path.unlink(missing_ok=True)
        print(json.dumps(diagnostic,separators=(',',':'),sort_keys=True),flush=True)
        self.assertIn(diagnostic['policyDisposition'],('ready-completed','ready-request-refused'))
    def test_initial_closure_closed_detail_failures(self):
        def observe(path,digest,stage,code):
            runner=object.__new__(GrowingLog);runner.last_policy_observation=None
            with self.assertRaises(Refused) as caught:
                runner._run_policy(str(self.policy),str(path),digest,b'{}',time.monotonic()+5)
            fact=caught.exception._barc_failure_observation
            self.assertEqual(fact['check'],'policy-closure-precheck')
            self.assertEqual(fact['policyObservation'],{'schema':growing_log.INITIAL_CLOSURE_OBSERVATION_SCHEMA,'checkpoint':'initial-closure','kind':'exception','subcheckpoint':stage,'code':code})
            self.assertNotIn('PRIVATE_SENTINEL',json.dumps(fact));self.assertNotIn(str(self.fixture.name),json.dumps(fact))
        missing=pathlib.Path(self.fixture.name)/'PRIVATE_SENTINEL_missing'
        observe(missing,'a'*64,'manifest-read','refused')
        observe(self.closure,'a'*64,'manifest-hash','refused')
        malformed=pathlib.Path(self.fixture.name)/'malformed.json'
        malformed.write_bytes(b'{PRIVATE_SENTINEL')
        try:observe(malformed,hashlib.sha256(malformed.read_bytes()).hexdigest(),'manifest-json','malformed')
        finally:malformed.unlink()
        # Mutate a real sealed managed directory only for this fixture, then restore it.
        managed=self.policy.parent;old_mode=stat.S_IMODE(managed.stat().st_mode)
        try:
            os.chmod(managed,0o755)
            observe(self.closure,self.closure_sha,'directory-custody','refused')
        finally:os.chmod(managed,old_mode)
        process=subprocess.run([str(self.policy),'PRIVATE_SENTINEL'],stdout=subprocess.PIPE,stderr=subprocess.PIPE,env={'PATH':'/usr/bin:/bin'})
        self.assertEqual(process.returncode,2);self.assertEqual(process.stdout,b'')
        detail=growing_log._policy_observation(process.stderr)
        self.assertEqual((detail['subcheckpoint'],detail['code']),('argv','refused'))
        self.assertNotIn(b'PRIVATE_SENTINEL',process.stderr)
    def test_initial_closure_parser_is_closed_and_preserves_legacy(self):
        legacy={'schema':growing_log.POLICY_OBSERVATION_SCHEMA,'checkpoint':'initial-closure','kind':'exception'}
        self.assertEqual(growing_log._policy_observation(json.dumps(legacy).encode()),legacy)
        good={'schema':growing_log.INITIAL_CLOSURE_OBSERVATION_SCHEMA,'checkpoint':'initial-closure','kind':'exception','subcheckpoint':'manifest-read','code':'refused'}
        self.assertEqual(growing_log._policy_observation(json.dumps(good).encode()),good)
        for mutation in [dict(good,subcheckpoint='PRIVATE_SENTINEL'),dict(good,code='PRIVATE_SENTINEL'),dict(good,checkpoint='current-process'),dict(good,kind='refused'),dict(good,path='PRIVATE_SENTINEL'),dict(good,schema=growing_log.POLICY_OBSERVATION_SCHEMA)]:
            self.assertIsNone(growing_log._policy_observation(json.dumps(mutation).encode()))
        self.assertIsNone(growing_log._policy_observation(json.dumps(good).encode()+b'\n{}'))
        self.assertIsNone(growing_log._policy_observation(b'X'*2049))
    @staticmethod
    def state_projection(value):
        if value is None:return None
        return dict(value)
    def final_failure(self,mutation,expected,initial=None):
        if self.handle is None:self.spawn(initial)
        actual=self.handle._run_policy
        def mutate(*args):
            output=actual(*args);mutation();return output
        self.handle._run_policy=mutate
        with self.assertRaises((Refused,OSError)) as caught:self.consume('browser')
        fact=caught.exception._barc_failure_observation
        self.assertEqual((fact['check'],fact['outcome'],fact['policyObservation']),(expected,'refused',None))
        self.assertNotIn('PRIVATE_SENTINEL',json.dumps(fact))
        return fact
    def test_nonappend_writer_benign_growth_all_boundaries(self):
        self.spawn();first=self.consume('browser');self.command('append:benign complete record');second=self.consume('normalization');self.command('append:another complete record');third=self.consume('release')
        self.assertEqual([first['revision'],second['revision'],third['revision']],[1,2,3]);self.assertLess(first['bytes'],second['bytes']);self.assertLess(second['bytes'],third['bytes'])
    def test_final_refresh_classifies_cap_crossing(self):
        self.spawn();remaining=growing_log.MAX_LOG-self.log.stat().st_size-16
        self.command('appendraw:'+base64.b64encode(b'x'*(remaining-1)+b'\n').decode())
        self.final_failure(lambda:self.command('appendraw:'+base64.b64encode(b'y'*32).decode()),'infolog-final-size-cap')
    def test_final_refresh_below_cap_growth_remains_eligible(self):
        self.spawn();actual=self.handle._run_policy;calls=[0]
        def grow_once(*args):
            output=actual(*args);calls[0]+=1
            if calls[0]==1:self.command('append:benign complete record')
            return output
        self.handle._run_policy=grow_once
        result=self.consume('browser')
        self.assertEqual((calls[0],result['revision'],result['boundary']),(2,2,'browser'))
        self.assertFalse(self.handle.revoked)
    def test_final_refresh_classifies_truncation(self):
        self.final_failure(lambda:self.command('truncate'),'infolog-final-size-regression')
    def test_final_refresh_classifies_same_length_rewrite(self):
        self.final_failure(lambda:self.command('rewrite'),'infolog-final-prefix-drift')
    def test_final_refresh_classifies_named_replacement(self):
        def replace():
            original=self.log.with_name('held-original');self.log.rename(original);self.log.write_bytes(self.text());os.chmod(self.log,0o600)
        self.final_failure(replace,'infolog-final-named-identity')
    def test_final_refresh_classifies_file_and_parent_custody(self):
        try:self.final_failure(lambda:os.chmod(self.log,0o400),'infolog-final-file-custody')
        finally:
            if self.log.exists():os.chmod(self.log,0o600)
        self.tearDown();self.setUp()
        try:self.final_failure(lambda:os.chmod(self.write,0o500),'infolog-final-parent')
        finally:os.chmod(self.write,0o700)
    def test_final_refresh_classifies_generation_and_scope(self):
        actual=growing_log.start_ticks
        try:self.final_failure(lambda:setattr(growing_log,'start_ticks',lambda _pid:'0'),'infolog-final-process')
        finally:growing_log.start_ticks=actual
        self.tearDown();self.setUp()
        self.final_failure(lambda:setattr(self.handle,'revoked',True),'infolog-final-scope')
    def test_final_refresh_preserves_nested_writer_checkpoint(self):
        def refuse_writer():
            self.handle._writer=mock.Mock(side_effect=growing_log.mark_failure(Refused('PRIVATE_SENTINEL_WRITER'),'infolog-writer-match'))
        self.final_failure(refuse_writer,'infolog-writer-match')
    def _manifest_mutation_refuses(self,mutate):
        original=self.closure.read_bytes();old=self.closure_sha
        try:
            value=json.loads(original);mutate(value);self.closure.write_text(json.dumps(value,separators=(',',':')));self.closure_sha=hashlib.sha256(self.closure.read_bytes()).hexdigest()
            self.spawn()
            with self.assertRaises(Refused):self.consume('browser')
            self.assertTrue(self.handle.revoked)
        finally:self.closure.write_bytes(original);self.closure_sha=old
    def test_runtime_roles_are_distinct_and_exact(self):
        self._manifest_mutation_refuses(lambda value:value.update(runtimeRoles={key:value['runtimeRoles']['coreLib'] for key in value['runtimeRoles']}))
    def test_declared_runtime_role_must_be_selected_by_actual_child(self):
        def mutate(value):
            selected=pathlib.Path(value['runtimeRoles']['hostfxr']);extra=pathlib.Path(self.fixture.name)/'unselected-fxr';extra.mkdir(exist_ok=True);target=extra/'libhostfxr.so';shutil.copyfile(selected,target);os.chmod(target,0o444);os.chmod(extra,0o555)
            info=target.stat();value['runtime'].append({'path':str(target),'bytes':info.st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'device':f'{os.major(info.st_dev):x}:{os.minor(info.st_dev):x}','inode':info.st_ino,'ownerUid':info.st_uid,'mode':stat.S_IMODE(info.st_mode),'links':info.st_nlink});value['runtimeRoles']['hostfxr']=str(target)
            info=extra.stat();value['searchLayout'].append({'path':str(extra),'ownerUid':info.st_uid,'mode':stat.S_IMODE(info.st_mode),'entriesSha256':hashlib.sha256(b'libhostfxr.so').hexdigest()})
        self._manifest_mutation_refuses(mutate)
    def test_complete_runtime_search_layout_is_required(self):
        def mutate(value):
            retained={value['managedRoot'],value['provenanceRoot'],*value['runtimeRoots']}
            value['searchLayout']=[row for row in value['searchLayout'] if row['path'] in retained]
        self._manifest_mutation_refuses(mutate)
    def test_selected_framework_and_fxr_census_roots_are_mandatory(self):
        original=json.loads(self.closure.read_bytes());framework=pathlib.Path(original['runtimeRoles']['coreLib']).parent;fxr=pathlib.Path(original['runtimeRoles']['hostfxr']).parent
        for label,roots in [('framework-omitted',[str(fxr)]),('fxr-omitted',[str(framework)])]:
            with self.subTest(label=label):
                self.tearDown();self.setUp();self._manifest_mutation_refuses(lambda value,roots=roots:value.update(runtimeRoots=roots))
    def test_combined_selected_framework_omission_refuses(self):
        def mutate(value):
            framework=pathlib.Path(value['runtimeRoles']['coreLib']).parent;fxr=pathlib.Path(value['runtimeRoles']['hostfxr']).parent
            value['runtimeRoots']=[str(fxr)]
            value['runtime']=[row for row in value['runtime'] if row['path']!=str(framework/'System.Xml.XmlSerializer.dll')]
            value['searchLayout']=[row for row in value['searchLayout'] if row['path']!=str(framework.parent)]
        self._manifest_mutation_refuses(mutate)
    def test_selected_framework_roles_require_one_coherent_version_directory(self):
        def mutate(value):
            selected=pathlib.Path(value['runtimeRoles']['hostpolicy']);extra=pathlib.Path(self.fixture.name)/'incoherent-framework';extra.mkdir(exist_ok=True);target=extra/'libhostpolicy.so';shutil.copyfile(selected,target);os.chmod(target,0o444);os.chmod(extra,0o555)
            info=target.stat();value['runtime'].append({'path':str(target),'bytes':info.st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'device':f'{os.major(info.st_dev):x}:{os.minor(info.st_dev):x}','inode':info.st_ino,'ownerUid':info.st_uid,'mode':stat.S_IMODE(info.st_mode),'links':info.st_nlink});value['runtimeRoles']['hostpolicy']=str(target)
        self._manifest_mutation_refuses(mutate)
    def _with_managed_directory_census(self,children,consume):
        wide=self.policy.parent/'census-wide';raw=self.closure.read_bytes();old=self.closure_sha;os.chmod(self.policy.parent,0o755);wide.mkdir()
        try:
            remaining=children
            for branch_number in range(63):
                branch=wide/f'b{branch_number:02d}';branch.mkdir();count=min(64,remaining);remaining-=count
                for child_number in range(count):(branch/f'd{child_number:02d}').mkdir()
                os.chmod(branch,0o555)
            self.assertEqual(remaining,0);os.chmod(wide,0o555);os.chmod(self.policy.parent,0o555)
            value=json.loads(raw)
            names=sorted(path.name for path in self.policy.parent.iterdir());search=next(row for row in value['searchLayout'] if row['path']==str(self.policy.parent));search['entriesSha256']=hashlib.sha256('\n'.join(names).encode()).hexdigest()
            self.closure.write_text(json.dumps(value,separators=(',',':')));self.closure_sha=hashlib.sha256(self.closure.read_bytes()).hexdigest();self.spawn()
            if consume:self.consume('browser')
            else:
                with self.assertRaises(Refused):self.consume('browser')
        finally:
            self.closure.write_bytes(raw);self.closure_sha=old
            os.chmod(self.policy.parent,0o755)
            for path in sorted(wide.rglob('*'),key=lambda item:len(item.parts),reverse=True):
                os.chmod(path,0o755 if path.is_dir() else 0o644)
            os.chmod(wide,0o755)
            shutil.rmtree(wide);os.chmod(self.policy.parent,0o555)
    def test_recursive_directory_census_accepts_exact_4096_scheduled_directories(self):
        # managed root + census-wide + 63 branches + 4031 leaves = 4096.
        self._with_managed_directory_census(4031,True)
    def test_recursive_directory_census_refuses_before_scheduling_4097th_directory(self):
        self._with_managed_directory_census(4032,False)
    def test_source_provenance_claim_and_owner_drift_refuse(self):
        self._manifest_mutation_refuses(lambda value:value['source'].update(policyCommit='f'*40))
        self.tearDown();self.setUp()
        self._manifest_mutation_refuses(lambda value:value['custody'].update(ownerUid=99999))
    def test_world_writable_managed_search_directory_refuses(self):
        os.chmod(self.policy.parent,0o777)
        try:
            self.spawn()
            with self.assertRaises(Refused):self.consume('browser')
        finally:os.chmod(self.policy.parent,0o555)
    def test_invoking_owner_writable_managed_dll_refuses_even_when_pinned(self):
        target=self.policy.parent/'RuntimeEvidence.dll';os.chmod(target,0o644)
        try:
            self._manifest_mutation_refuses(lambda value:next(row for row in value['managed'] if row['role']=='managedDll').update(mode=0o644))
        finally:os.chmod(target,0o444)
    def test_configured_product_source_set_must_match_closure(self):
        self.spawn();value=self.config();value['source']['fsbarCommit']='e'*40
        with self.assertRaises(Refused):self.handle.consume('browser',value,time.monotonic()+5)
    def test_direct_fsharp_rejects_duplicate_manifest_properties(self):
        self.spawn();captured=[];actual=self.handle._run_policy
        def capture(*args):captured.append(args[3]);return actual(*args)
        self.handle._run_policy=capture;self.consume('browser');self.assertTrue(captured)
        original=self.closure.read_bytes();old=self.closure_sha
        try:
            changed=b'{"schema":"conflicting-duplicate",'+original[1:];self.closure.write_bytes(changed);sha=hashlib.sha256(changed).hexdigest()
            request=json.loads(captured[0]);request['expected']['closureSha256']=sha
            process=subprocess.Popen([str(self.policy),'--closure-manifest',str(self.closure),'--closure-sha256',sha,'--invocation-id','duplicate-property'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,env={'PATH':'/usr/bin:/bin'})
            output,_=process.communicate(json.dumps(request,separators=(',',':')).encode(),timeout=5)
            self.assertEqual(process.returncode,2);self.assertEqual(output,b'')
        finally:self.closure.write_bytes(original);self.closure_sha=old
    def test_fsharp_rejects_duplicate_nested_provenance_properties(self):
        target=pathlib.Path(self.fixture.name)/'provenance'/'build-receipt.json';original=target.read_bytes();os.chmod(target,0o644)
        changed=b'{"schema":"conflicting-duplicate",'+original[1:];target.write_bytes(changed);os.chmod(target,0o444);changed_sha=hashlib.sha256(changed).hexdigest()
        try:
            def mutate(value):
                row=next(item for item in value['provenance'] if item['role']=='buildReceipt');row.update(bytes=len(changed),sha256=changed_sha)
                value['source']['buildReceiptSha256']=changed_sha
            self._manifest_mutation_refuses(mutate)
        finally:os.chmod(target,0o644);target.write_bytes(original);os.chmod(target,0o444)
    def test_closure_change_within_held_scope_is_sticky(self):
        self.spawn();self.consume('browser');original=self.closure.read_bytes();old=self.closure_sha
        try:
            self.closure.write_bytes(original+b' ');self.closure_sha=hashlib.sha256(self.closure.read_bytes()).hexdigest();self.command('append:next')
            with self.assertRaises(Refused):self.consume('normalization')
            self.assertTrue(self.handle.revoked)
        finally:self.closure.write_bytes(original);self.closure_sha=old
    def test_final_inventory_cannot_authorize_after_deadline(self):
        self.spawn();original=self.handle._closure;calls=[0]
        def delayed(*args):
            calls[0]+=1;value=original(*args)
            if calls[0]==2:time.sleep(.08)
            return value
        self.handle._closure=delayed
        with self.assertRaises(Refused):self.handle.consume('browser',self.config(),time.monotonic()+.06)
    def test_prelaunch_apphost_must_equal_closure_member(self):
        self.spawn();value=self.config();script=self.root/'alternate-policy';script.write_text('#!/bin/sh\nexit 2\n');os.chmod(script,0o700)
        value['artifacts']['runtimeEvidencePolicy']={'path':str(script),'sha256':hashlib.sha256(script.read_bytes()).hexdigest()}
        with self.assertRaises(Refused):self.handle.consume('browser',value,time.monotonic()+2)
    def test_actual_child_final_reread_refuses_post_ready_managed_drift(self):
        self.spawn();captured=[];actual=self.handle._run_policy
        def capture(*args):captured.append(args[3]);return actual(*args)
        self.handle._run_policy=capture;self.consume('browser');self.assertTrue(captured)
        invocation='post-ready-drift';argv=[str(self.policy),'--closure-manifest',str(self.closure),'--closure-sha256',self.closure_sha,'--invocation-id',invocation]
        process=subprocess.Popen(argv,stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,env={'PATH':'/usr/bin:/bin'})
        ready=json.loads(process.stdout.readline());self.assertEqual(ready['phase'],'ready')
        target=self.policy.parent/'RuntimeEvidence.runtimeconfig.json';before=target.read_bytes();os.chmod(target,0o644);target.write_bytes(before+b' ');os.chmod(target,0o444)
        try:
            output,error=process.communicate(captured[0],timeout=5)
            self.assertEqual(process.returncode,2);self.assertEqual(output,b'')
        finally:os.chmod(target,0o644);target.write_bytes(before);os.chmod(target,0o444)
    def test_rewrite_and_truncate_are_sticky(self):
        self.spawn();self.consume('browser');self.command('rewrite')
        with self.assertRaises((Refused,OSError)):self.consume('normalization')
        with self.assertRaises(Refused):self.consume('release')
    def test_path_replacement_and_closed_writer_refuse(self):
        self.spawn();self.consume('browser');original=self.log.with_name('held-original');self.log.rename(original);self.log.write_bytes(self.text());os.chmod(self.log,0o600)
        with self.assertRaises((Refused,OSError)):self.consume('normalization')
        self.log.unlink();original.rename(self.log)
        with self.assertRaises((Refused,OSError)):self.consume('normalization')
        self.handle.close();self.handle=None;self.child.kill();self.child.wait();self.child.stdin.close();self.child=None
        self.spawn();self.consume('browser');self.command('close');self.child.wait(timeout=2)
        with self.assertRaises((Refused,OSError)):self.consume('normalization')
    def test_incomplete_and_malformed_suffix_refuse_without_raw_output(self):
        self.spawn();self.consume('browser');self.command('appendraw:'+base64.b64encode(b'unfinished').decode())
        with self.assertRaises(Refused):self.consume('normalization')
    def test_invalid_utf8_suffix_refuses(self):
        self.spawn();self.consume('browser');self.command('appendraw:'+base64.b64encode(b'\xff\n').decode())
        with self.assertRaises(Refused):self.consume('normalization')
    def test_incomplete_tail_may_only_complete_without_rewriting_captured_bytes(self):
        self.spawn();self.consume('browser');self.command('appendraw:'+base64.b64encode(b'late-record').decode())
        def complete():time.sleep(.005);self.command('appendraw:'+base64.b64encode(b'\n').decode())
        worker=threading.Thread(target=complete);worker.start();result=self.consume('normalization');worker.join()
        self.assertEqual(result['boundary'],'normalization')
    def test_hardlink_custody_and_wrong_policy_digest_refuse(self):
        process=self.spawn();alias=self.root/'alias';os.link(self.log,alias)
        self.handle.close();self.handle=None
        with self.assertRaises(Refused):acquire_data_root_evidence(self.log,process)
        alias.unlink();self.handle=acquire_data_root_evidence(self.log,process)
        value=self.config();value['artifacts']['runtimeEvidencePolicy']['sha256']='0'*64
        with self.assertRaises(Refused):self.handle.consume('browser',value,time.monotonic()+1)
    def test_policy_timeout_leaves_no_policy_child(self):
        self.spawn();pidfile=self.root/'policy.pid';policy=self.root/'slow-policy'
        policy.write_text(f'#!/usr/bin/python3\nimport os,time\nopen({str(pidfile)!r},"w").write(str(os.getpid()))\ntime.sleep(30)\n');os.chmod(policy,0o700)
        value=self.config();value['artifacts']['runtimeEvidencePolicy']={'path':str(policy),'sha256':hashlib.sha256(policy.read_bytes()).hexdigest()}
        with self.assertRaises(Refused):self.handle.consume('browser',value,time.monotonic()+.1)
        self.assertTrue(self.handle.revoked)
        self.assertFalse(pidfile.exists())
    def test_wrong_generation_and_closed_handle_refuse(self):
        process=self.spawn();self.handle.process['startTicks']='0'
        with self.assertRaises(Refused):self.consume('browser')
        self.handle.close();self.handle=None

    def _mutated_genuine_response(self,boundary,mutate):
        self.spawn();original=self.handle._run_policy;observed=[]
        def run(*args):
            value=json.loads(original(*args))
            self.assertEqual((value['status'],value['state']['phase']),('accepted','validated'))
            observed.append((value['state']['bytes'],value['state']['sha256']))
            mutate(value)
            return (json.dumps(value,separators=(',',':'))+'\n').encode()
        self.handle._run_policy=run
        with self.assertRaises(Refused):self.consume(boundary)
        self.assertTrue(observed and self.handle.revoked)

    def test_accepted_unknown_response_never_authorizes_any_boundary(self):
        for boundary in ('browser','normalization','release'):
            with self.subTest(boundary=boundary):
                self.tearDown();self.setUp()
                def mutate(value):
                    value['state'].update({'phase':'unknown','stickyInvalid':True,'reason':'fixture-unavailable','validatedRevision':0,'validatedBoundary':None,'consumedRevision':0,'consumedBoundary':None,'bytes':1,'sha256':'0'*64})
                self._mutated_genuine_response(boundary,mutate)

    def test_closed_status_phase_combinations_refuse_mismatches(self):
        expected={'accepted':'validated','pending':'sampled','refused':'invalid','unknown':'unknown'}
        for status in expected:
            for phase in expected.values():
                if phase==expected[status]:continue
                with self.subTest(status=status,phase=phase):
                    self.tearDown();self.setUp()
                    def mutate(value,status=status,phase=phase):value.update(status=status);value['state']['phase']=phase
                    self._mutated_genuine_response('browser',mutate)

    def test_accepted_consumed_response_requires_every_current_sample_join(self):
        mutations=(
            lambda value:value['state'].update(bytes=value['state']['bytes']-1),
            lambda value:value['state'].update(sha256='0'*64),
            lambda value:value['state'].update(consumedRevision=1),
            lambda value:value['state'].update(consumedBoundary='release'),
            lambda value:value['state'].update(stickyInvalid=True),
            lambda value:value['state'].update(reason='contradiction'),
            lambda value:value['state']['identity'].update(startTicks='0'),
        )
        for index,mutate in enumerate(mutations):
            with self.subTest(join=index):
                self.tearDown();self.setUp();self._mutated_genuine_response('browser',mutate)

    def test_unknown_status_preserves_history_without_current_authority(self):
        self.spawn();first=self.consume('browser');history=dict(first['state']);original=self.handle._run_policy
        def unknown(*args):
            genuine=json.loads(original(*args));self.assertEqual((genuine['status'],genuine['state']['phase']),('accepted','validated'))
            state=dict(history);state.update(phase='unknown',stickyInvalid=True,reason='observation-unavailable')
            return (json.dumps({'schema':genuine['schema'],'status':'unknown','state':state},separators=(',',':'))+'\n').encode()
        self.handle._run_policy=unknown
        with self.assertRaises(Refused):self.consume('normalization')
        self.assertTrue(self.handle.revoked)
        self.assertEqual(self.handle.state['consumedRevision'],first['state']['consumedRevision'])
        self.assertEqual(self.handle.state['consumedBoundary'],'browser')

    def test_persistent_mutations_at_read_barrier_refuse_every_boundary(self):
        for boundary,kind in (("browser","rewrite"),("normalization","replace"),("release","custody")):
            with self.subTest(boundary=boundary):
                self.tearDown();self.setUp();self.spawn();original=self.handle._read_exact;fired=[False]
                def barrier(length,deadline=None):
                    raw=original(length,deadline)
                    if not fired[0]:
                        fired[0]=True
                        if kind=="rewrite":self.command("rewrite")
                        elif kind=="replace":
                            self.log.rename(self.write/'old-infolog');self.log.write_bytes(self.text());os.chmod(self.log,0o600)
                        else:os.chmod(self.write,0o755)
                    return raw
                self.handle._read_exact=barrier
                with self.assertRaises((Refused,OSError)):self.consume(boundary)
                self.assertTrue(self.handle.revoked)

    def test_post_policy_refresh_refuses_mutation_and_never_reacquires(self):
        for boundary,kind in (("browser","rewrite"),("normalization","replace"),("release","custody")):
            with self.subTest(boundary=boundary):
                self.tearDown();self.setUp();self.spawn();original=self.handle._run_policy
                def after_policy(*args):
                    output=original(*args)
                    if kind=="rewrite":self.command("rewrite")
                    elif kind=="replace":
                        self.log.rename(self.write/'old-infolog');self.log.write_bytes(self.text());os.chmod(self.log,0o600)
                    else:os.chmod(self.write,0o755)
                    return output
                self.handle._run_policy=after_policy
                with self.assertRaises((Refused,OSError)):self.consume(boundary)
                self.assertTrue(self.handle.revoked)
                with self.assertRaises(Refused):self.consume(boundary)

    def test_policy_output_is_capped_while_streaming(self):
        self.spawn();policy=self.root/'noisy-policy'
        policy.write_text('#!/usr/bin/python3\nimport sys\nsys.stdin.buffer.read()\nsys.stdout.buffer.write(b"x"*200000)\n')
        os.chmod(policy,0o700);value=self.config();value['artifacts']['runtimeEvidencePolicy']={'path':str(policy),'sha256':hashlib.sha256(policy.read_bytes()).hexdigest()}
        with self.assertRaises((Refused,subprocess.TimeoutExpired)):self.handle.consume('browser',value,time.monotonic()+2)

    def test_nonreading_policy_large_stdin_times_out_and_is_reaped(self):
        self.spawn();self.command('append:'+('x'*131072));pidfile=self.root/'blocked.pid';policy=self.root/'blocked-policy'
        policy.write_text(f'#!/usr/bin/python3\nimport os,time\nopen({str(pidfile)!r},"w").write(str(os.getpid()))\ntime.sleep(30)\n');os.chmod(policy,0o700)
        value=self.config();value['artifacts']['runtimeEvidencePolicy']={'path':str(policy),'sha256':hashlib.sha256(policy.read_bytes()).hexdigest()}
        started=time.monotonic()
        with self.assertRaises(Refused):self.handle.consume('browser',value,started+.1)
        self.assertLess(time.monotonic()-started,.75);self.assertTrue(self.handle.revoked)
        self.assertFalse(pidfile.exists())

    def test_partial_reader_and_large_valid_request_complete_under_deadline(self):
        self.spawn();self.command('append:'+('y'*131072));actual=self.policy.resolve();wrapper=self.root/'partial-reader'
        wrapper.write_text(f'''#!/usr/bin/python3
import subprocess,sys,time
p=subprocess.Popen([{str(actual)!r},*sys.argv[1:]],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.DEVNULL)
ready=p.stdout.readline();sys.stdout.buffer.write(ready);sys.stdout.buffer.flush()
data=bytearray()
while True:
 block=sys.stdin.buffer.read(1024)
 if not block:break
 data.extend(block);time.sleep(.0002)
output,_=p.communicate(bytes(data));sys.stdout.buffer.write(output)
raise SystemExit(p.returncode)
''');os.chmod(wrapper,0o700)
        value=self.config();value['artifacts']['runtimeEvidencePolicy']={'path':str(wrapper),'sha256':hashlib.sha256(wrapper.read_bytes()).hexdigest()}
        with self.assertRaises(Refused):self.handle.consume('browser',value,time.monotonic()+3)

    def test_policy_early_exit_during_write_is_reaped(self):
        self.spawn();self.command('append:'+('z'*131072));pidfile=self.root/'early.pid';policy=self.root/'early-policy'
        policy.write_text(f'#!/usr/bin/python3\nimport os\nopen({str(pidfile)!r},"w").write(str(os.getpid()))\nraise SystemExit(7)\n');os.chmod(policy,0o700)
        value=self.config();value['artifacts']['runtimeEvidencePolicy']={'path':str(policy),'sha256':hashlib.sha256(policy.read_bytes()).hexdigest()}
        with self.assertRaises(Refused):self.handle.consume('browser',value,time.monotonic()+2)
        self.assertFalse(pidfile.exists())

    def test_policy_pump_cancellation_reaps_exact_child(self):
        self.spawn();pidfile=self.root/'cancel.pid';policy=self.root/'cancel-policy'
        policy.write_text(f'#!/usr/bin/python3\nimport os,time\nopen({str(pidfile)!r},"w").write(str(os.getpid()))\ntime.sleep(30)\n');os.chmod(policy,0o700)
        real_selector=growing_log.selectors.DefaultSelector
        class CancellingSelector:
            def __init__(self):self.inner=real_selector()
            def register(self,*args):return self.inner.register(*args)
            def unregister(self,*args):return self.inner.unregister(*args)
            def close(self):return self.inner.close()
            def select(self,_timeout):
                end=time.monotonic()+.5
                while time.monotonic()<end:
                    if pidfile.exists() and pidfile.read_text().strip().isdigit():break
                    time.sleep(.002)
                raise KeyboardInterrupt()
        growing_log.selectors.DefaultSelector=CancellingSelector
        try:
            with self.assertRaises(KeyboardInterrupt):self.handle._run_policy(str(policy),str(self.closure),self.closure_sha,b'x'*131072,time.monotonic()+2)
        finally:growing_log.selectors.DefaultSelector=real_selector
        pid=int(pidfile.read_text())
        with self.assertRaises(ProcessLookupError):os.kill(pid,0)

    def test_growth_observed_after_policy_gets_a_fresh_revision(self):
        self.spawn();original=self.handle._run_policy;fired=[False]
        def grow_once(*args):
            output=original(*args)
            if not fired[0]:fired[0]=True;self.command('append:late complete record')
            return output
        self.handle._run_policy=grow_once
        result=self.consume('browser')
        self.assertEqual(result['revision'],2)
        self.assertEqual(result['bytes'],self.log.stat().st_size)

    def test_required_complete_record_correspondence_bundle(self):
        # Keep the owning entrypoint stable while qualifying the successor
        # protocol; the 27/14 predecessor vectors remain in the canonical gate.
        return self.test_rp2_required_actual_correspondence_bundle()

    def test_rp2_required_actual_correspondence_bundle(self):
        output=os.environ.get('BAR_SETTLEMENT_TRANSCRIPT')
        self.assertTrue(output,'RP2 correspondence output required')
        scenarios=[]
        atlas=b'CTextureRenderAtlas::CreateAtlasTexture()[0] atlas=public-fixture'
        def reset(tail=b''):
            if self.handle or self.child:self.tearDown();self.setUp()
            self.spawn(self.text()+tail)
        def record(name):
            scenarios.append({'name':name,'timeline':json.loads(json.dumps(self.handle.settlement_effects))})
        def refused(boundary='browser'):
            with self.assertRaises(Refused) as caught:self.consume(boundary)
            fact=caught.exception._barc_failure_observation
            self.handle.settlement_effects.append({'kind':'terminal','outcome':'refused','check':fact['check'],'state':self.handle.state})
            self.assertTrue(self.handle.revoked)
            return caught.exception
        def contradiction():return b'[DataDirLocater::FilterUsableDataDirs] using read-only data directory: /public/wrong/\n'
        reset(atlas)
        first=self.consume('browser');self.assertEqual(first['state']['prefix']['tailClass'],'atlas');self.assertGreater(first['state']['prefix']['tailBytes'],0)
        record('rp2SafeTailConsume')
        reset(atlas)
        first=self.consume('browser');old_raw=self.handle.previous
        self.command('appendraw:'+base64.b64encode(b' completed\nbenign complete record\n').decode())
        second=self.consume('normalization');self.assertTrue(self.handle.previous.startswith(old_raw))
        self.assertEqual(second['state']['consumedRevision'],first['state']['consumedRevision']+1)
        record('rp2SafeTailExtend')
        for name,tail in [('rp2RelevantTailPending',b'[DataDirLocater::FilterUsableDataDirs] using read-only data directory: /wrong'),('rp2UnknownTailPending',b'unknown'),('rp2PartialUtf8Pending',b'\xe2\x82')]:
            reset(tail);failure=refused();counters=failure._barc_infolog_mechanical_observation
            self.assertEqual((counters['probesCompleted'],counters['evaluationsCompleted']),(32,1))
            self.assertEqual(counters['terminalCause'],'settlement-probe-cap');record(name)
        reset(b'\xff');refused();record('rp2MalformedUtf8Refused')
        reset(contradiction());refused();record('rp2ContradictionBeforeSample')
        reset(atlas);original=self.handle._run_policy;fired=[]
        def during_policy(*args):
            result=original(*args)
            if not fired:fired.append(True);self.command('appendraw:'+base64.b64encode(b'\n'+contradiction()).decode())
            return result
        self.handle._run_policy=during_policy;refused();self.assertEqual(self.handle.counters['evaluationsCompleted'],2);record('rp2ContradictionDuringPolicy')
        reset();original_read=self.handle._read_exact;fired=[]
        def during_read(length,deadline=None):
            result=original_read(length,deadline)
            if self.handle.failure_checkpoint=='infolog-final-prefix-read' and not fired:
                fired.append(True);self.command('appendraw:'+base64.b64encode(contradiction()).decode())
            return result
        self.handle._read_exact=during_read;refused();self.assertTrue(fired);self.assertEqual(self.handle.counters['evaluationsCompleted'],2);record('rp2ContradictionDuringRead')
        reset();original_closure=self.handle._closure;fired=[]
        def after_L(*args):
            result=original_closure(*args)
            if hasattr(self.handle,'final_observation') and not fired:
                fired.append(True);self.command('appendraw:'+base64.b64encode(contradiction()).decode())
                # This producer write is after L. The adapter makes no further
                # FD read before releasing the named old horizon.
                self.handle.settlement_effects.append({'kind':'producer-after-L','rawBytes':len(self.text())+len(contradiction()),'contradictory':True})
            return result
        self.handle._closure=after_L
        first=self.consume('browser');self.assertEqual(first['bytes'],len(self.text()));self.assertTrue(fired)
        refused('normalization');self.assertEqual(self.handle.state['consumedPrefix'],first['state']['consumedPrefix']);record('rp2ContradictionAfterL')
        reset();original=self.handle._run_policy
        def grow(*args):
            result=original(*args);self.command('append:benign complete record');return result
        self.handle._run_policy=grow;failure=refused()
        self.assertEqual((failure._barc_infolog_mechanical_observation['evaluationsCompleted'],failure._barc_infolog_mechanical_observation['growthAfterEvaluation']),(3,3))
        self.assertEqual(failure._barc_infolog_mechanical_observation['terminalCause'],'policy-evaluation-growth-cap');record('rp2BenignGrowthCap')
        self.tearDown();self.setUp()
        self.spawn(atlas);refused();record('rp2NoCompleteRecords')
        if self.handle or self.child:self.tearDown();self.setUp()
        self.child=subprocess.Popen([sys.executable,str(pathlib.Path(__file__).with_name('buffered_writer.py')),str(self.log),base64.b64encode(self.text()).decode()],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True,start_new_session=True)
        def ack(expected):
            self.assertTrue(__import__('select').select([self.child.stdout],[],[],2)[0]);self.assertEqual(self.child.stdout.readline().strip(),expected)
        ack('ready')
        def grow_to_full_atlas_tail():
            # Prepare an actual libc flush cut with the complete public family
            # header. Other cuts remain pending; this is fixture scheduling,
            # never a production classifier or retry-budget exception.
            for _ in range(16):
                self.child.stdin.write('grow\n');self.child.stdin.flush();ack('done')
                tail=self.log.read_bytes().rsplit(b'\n',1)[-1]
                if tail.startswith((b'CTextureRenderAtlas::CreateAtlasTexture()[0] atlas=',b'CTextureRenderAtlas::CreateAtlasTexture()[1] atlas=')):return
            self.fail('bounded libc fixture did not expose fully formed atlas family tail')
        grow_to_full_atlas_tail()
        self.handle=acquire_data_root_evidence(self.log,{'pid':self.child.pid,'startTicks':start_ticks(self.child.pid),'uid':os.geteuid()})
        self.assertFalse(self.log.read_bytes().endswith(b'\n'))
        self.consume('browser');self.assertEqual(self.handle.state['prefix']['tailClass'],'atlas');record('rp2RealLibcSafeTail')
        grow_to_full_atlas_tail()
        previous=self.handle.previous;self.consume('normalization');self.assertTrue(self.handle.previous.startswith(previous));record('rp2RealLibcSafeTailExtend')
        for row in scenarios:row['model']=_rp2_canonical_trace(POLICY_SOURCE/'tests/Broker.NativeProof/RuntimeEvidence',row['timeline'],row['name'],pathlib.Path(output).parent/'rp2-model')
        bundle={'schema':'fsbar.barc-complete-prefix-correspondence/v3','helperSha256':hashlib.sha256(pathlib.Path(growing_log.__file__).read_bytes()).hexdigest(),'scenarios':scenarios}
        pathlib.Path(output).write_text(json.dumps(bundle,separators=(',',':'),sort_keys=True)+'\n')

if __name__=='__main__':unittest.main()
