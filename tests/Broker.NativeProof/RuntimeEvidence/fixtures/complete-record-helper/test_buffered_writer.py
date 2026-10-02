"""Bounded public-file checks: no .NET or game process."""
import hashlib,json,os,pathlib,select,subprocess,sys,tempfile,time,unittest
from unittest import mock
import growing_log
from growing_log import GrowingLog
from private_io import Refused
from runtime_identity import start_ticks
class BufferedWriterTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory(prefix='bar-public-buffered-');self.root=pathlib.Path(self.tmp.name);self.path=self.root/'infolog.txt'
        self.child=subprocess.Popen([sys.executable,str(pathlib.Path(__file__).with_name('buffered_writer.py')),str(self.path)],stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE,text=True)
        self.ack('ready');self.handle=GrowingLog.acquire(self.path,{'pid':self.child.pid,'startTicks':start_ticks(self.child.pid),'uid':os.geteuid()})
    def ack(self,expected):
        self.assertTrue(select.select([self.child.stdout],[],[],2)[0],'writer ack deadline');self.assertEqual(self.child.stdout.readline().strip(),expected)
    def command(self,command):
        self.child.stdin.write(command+'\n');self.child.stdin.flush();self.ack('done')
    def tearDown(self):
        self.handle.close();self.child.stdin.write('close\n');self.child.stdin.flush();self.child.communicate(timeout=2);self.assertEqual(self.child.returncode,0);self.tmp.cleanup()
    def test_full_buffered_partial_eof_exhausts_actual_32_probes(self):
        original=self.handle._sample;sizes=[]
        def sample(deadline):
            if sizes:self.command('grow')
            result=original(deadline);sizes.append(len(result[0]));return result
        self.handle._sample=sample
        with self.assertRaises(Refused) as caught:self.handle._settle(time.monotonic()+5,0)
        observation=self.handle._counter_observation(caught.exception._barc_failure_observation['check'])
        self.assertEqual(observation['terminalCause'],'settlement-probe-cap');self.assertEqual((observation['probesBegun'],observation['probesCompleted'],observation['evaluationsBegun']),(32,32,0))
        self.assertEqual(len(set(sizes)),32);self.assertGreater(observation['tailBytes'],0)
        self.assertEqual(observation['completePrefixBytes']+observation['tailBytes'],observation['sampleBytes']);self.assertEqual(observation['sampleSha256'],hashlib.sha256(self.handle.previous).hexdigest())
        self.assertLess(observation['maximumObservedBytes'],growing_log.MAX_LOG);self.assertGreater(observation['readCalls'],64);self.assertLessEqual(observation['readCallsInOperation'],128)
        self.assertNotIn('/public/',json.dumps(observation));self.assertNotIn(str(self.root),json.dumps(observation))
    def test_actual_short_read_call_cap_is_distinct_from_probe_cap(self):
        real=os.pread
        def short(fd,count,offset):return real(fd,min(1,count),offset)
        with mock.patch.object(growing_log.os,'pread',side_effect=short):
            with self.assertRaises(Refused) as caught:self.handle._settle(time.monotonic()+5,0)
        observation=self.handle._counter_observation(caught.exception._barc_failure_observation['check'])
        self.assertEqual(observation['terminalCause'],'exact-read-call-cap');self.assertEqual((observation['probesBegun'],observation['probesCompleted'],observation['readCalls'],observation['readCallsInOperation']),(1,0,128,128));self.assertEqual(observation['terminalCheck'],'infolog-record-settlement-exhausted')
    def test_failed_consume_retains_bounded_sidecar_and_digest_receipt(self):
        config={'roots':{'attemptRoot':str(self.root)},'source':{'public':'synthetic'}}
        self.handle._consume_impl=lambda *args:self.handle._settle(time.monotonic()+5,0)
        with self.assertRaises(Refused) as caught:self.handle.consume('browser',config,time.monotonic()+5)
        self.assertTrue(caught.exception._barc_infolog_mechanical_retained)
        path=self.root/'infolog-mechanical-browser.json';raw=path.read_bytes();observation=json.loads(raw);receipt=json.loads(path.with_name(path.name+'.receipt.json').read_bytes())
        self.assertEqual(receipt['sha256'],hashlib.sha256(raw).hexdigest());self.assertEqual(receipt['bytes'],len(raw));self.assertEqual(observation['terminalCause'],'settlement-probe-cap');self.assertEqual(observation['boundary'],'browser');self.assertLess(len(raw),4096);self.assertEqual(path.stat().st_mode&0o777,0o600)
        self.assertEqual(caught.exception._barc_failure_observation,{'check':'infolog-record-settlement-exhausted','outcome':'refused','policyObservation':None});self.assertNotIn(str(self.root),raw.decode());self.assertNotIn('/public/',raw.decode())
    def test_sidecar_collision_preserves_original_refusal_and_existing_bytes(self):
        config={'roots':{'attemptRoot':str(self.root)},'source':{'public':'synthetic'}}
        path=self.root/'infolog-mechanical-browser.json';path.write_bytes(b'PUBLIC_SENTINEL');os.chmod(path,0o600)
        self.handle._consume_impl=lambda *args:self.handle._settle(time.monotonic()+5,0)
        with self.assertRaises(Refused) as caught:self.handle.consume('browser',config,time.monotonic()+5)
        self.assertFalse(caught.exception._barc_infolog_mechanical_retained)
        self.assertEqual(path.read_bytes(),b'PUBLIC_SENTINEL')
        self.assertEqual(caught.exception._barc_failure_observation['check'],'infolog-record-settlement-exhausted')
        self.assertFalse(path.with_name(path.name+'.receipt.json').exists())
    def test_flush_control_promotes_exact_untrimmed_record_sample(self):
        self.command('flush');raw,_,_,probes=self.handle._settle(time.monotonic()+5,0)
        self.assertTrue(raw.endswith(b'\n'));self.assertEqual(probes,1);self.assertEqual(self.handle.counters['tailBytes'],0);self.assertEqual(self.handle.previous,raw);self.assertEqual(self.handle.counters['evaluationsBegun'],0)
if __name__=='__main__':unittest.main()
