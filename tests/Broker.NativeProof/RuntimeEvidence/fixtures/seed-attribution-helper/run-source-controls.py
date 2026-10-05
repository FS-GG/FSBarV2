"""Finite portable SOURCE controls; no subprocess/compiler/Node/Lua/game effects.
Controlled in-process pipes/threads and temporary files are allowed. Tests may mock
Popen explicitly; any unmocked process launch fails the gate.
Actual growing_log/buffered writer controls require separately selected compiled
policy inputs and are deliberately absent from this portable roster.
"""
import pathlib,sys,unittest,importlib.util,subprocess,os
ROOT=pathlib.Path(__file__).resolve().parent
sys.dont_write_bytecode=True
sys.path[:0]=[str(ROOT),str(ROOT/'helper')]
def forbidden(*args,**kwargs):raise RuntimeError('portable source controls prohibit real process effects')
subprocess.Popen=forbidden
os.system=forbidden
for name in ['fork','forkpty','posix_spawn','posix_spawnp','execv','execve','execvp','execvpe']:
 if hasattr(os,name):setattr(os,name,forbidden)
FILES=('helper/test_mapping_profile.py','helper/test_immutable_closure.py','test_policy_transport_runner.py','test_qualify_prearm.py','test_native_evidence.py','helper/test_prearm_startup.py','helper/test_seed_policy.py','helper/test_capture_custody.py','helper/test_loaded_custody.py','helper/test_settings_custody.py','helper/test_proc_bytes.py','fixture/tests/test_prearm_observation.py')
suite=unittest.TestSuite()
for index,name in enumerate(FILES):
 spec=importlib.util.spec_from_file_location('portable_seed_controls_'+str(index),ROOT/name);module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);suite.addTests(unittest.defaultTestLoader.loadTestsFromModule(module))
expected=117
if suite.countTestCases()!=expected:raise SystemExit('portable source control roster changed: '+str(suite.countTestCases()))
result=unittest.TextTestRunner(verbosity=2).run(suite)
if not result.wasSuccessful()or result.testsRun!=expected or result.skipped:raise SystemExit(1)
print('PASS: exact '+str(expected)+' portable seed source controls; no actual policy/game/producer evidence')
