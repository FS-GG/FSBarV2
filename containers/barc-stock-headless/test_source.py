"""Inert controls: no container, network, compiler, engine or downloader runs."""
import copy
import gzip
import hashlib
import importlib.util
import json
import pathlib
import struct
import subprocess
import tempfile
import unittest
from unittest import mock

root = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('bar_image_source', root / 'build-image.py')
module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
pins = json.loads((root / 'resources.json').read_text())

def elf_fixture(path, *, needed=(), soname=None, search=None, interpreter=False, extra=()):
    """Small ELF bytes, authored as data. No compilation or fixture execution."""
    strings = bytearray(b'\0'); tags = []
    for tag, values in ((1, needed), (14, [soname] if soname else []), (29, [search] if search is not None else [])):
        for value in values:
            tags.append((tag, len(strings))); strings.extend(value.encode('ascii') + b'\0')
    tags = [(5, 0x400), (10, len(strings)), *tags, *extra, (0, 0)]
    data = bytearray(4096)
    data[:64] = struct.pack('<16sHHIQQQIHHHHHH', b'\x7fELF\x02\x01\x01' + bytes(9), 3, 62, 1, 0, 64, 0, 0, 64, 56, 3 if interpreter else 2, 0, 0, 0)
    data[64:120] = struct.pack('<IIQQQQQQ', 1, 4, 0, 0, 0, len(data), len(data), 4096)
    data[120:176] = struct.pack('<IIQQQQQQ', 2, 4, 0x100, 0x100, 0, len(tags)*16, len(tags)*16, 8)
    if interpreter:
        value = b'/lib64/ld-linux-x86-64.so.2\0'
        data[176:232] = struct.pack('<IIQQQQQQ', 3, 4, 0x800, 0x800, 0, len(value), len(value), 1)
        data[0x800:0x800+len(value)] = value
    for index, pair in enumerate(tags): data[0x100+index*16:0x110+index*16] = struct.pack('<qQ', *pair)
    data[0x400:0x400+len(strings)] = strings
    path.parent.mkdir(parents=True, exist_ok=True); path.write_bytes(data)
    return path

class StaticElfTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(); self.addCleanup(self.temp.cleanup)
        self.image = pathlib.Path(self.temp.name)
        self.output = self.image / 'opt/barc'
        self.engine = elf_fixture(self.output/'engine/spring-headless', needed=['liba.so'], interpreter=True)
        self.plugin = elf_fixture(self.output/'plugin/libSkirmishAI.so', needed=['liba.so'])
        self.liba = elf_fixture(self.image/'usr/lib/x86_64-linux-gnu/liba.so', soname='liba.so', needed=['libb.so'])
        self.libb = elf_fixture(self.image/'usr/lib/x86_64-linux-gnu/libb.so', soname='libb.so')
        self.loader = elf_fixture(self.image/'lib64/ld-linux-x86-64.so.2')
    def collect(self):
        return module.static_elf_correspondence(self.image, self.engine, self.plugin)
    def expected(self):
        return {role: hashlib.sha256(path.read_bytes()).hexdigest() for role, path in [('engine', self.engine), ('plugin', self.plugin)]}
    def test_production_retention_has_recursive_hashes_and_never_executes(self):
        with mock.patch.object(module.subprocess, 'run', side_effect=AssertionError('execution forbidden')), mock.patch.object(module.subprocess, 'Popen', side_effect=AssertionError('execution forbidden')):
            module.retain_static_elf(self.output, self.image, self.expected())
        result = json.loads((self.output/'STATIC-ELF.json').read_text())
        self.assertEqual(len(result['files']), 5)
        self.assertFalse(result['loadedAbiAccepted'])
        self.assertEqual(result['roots']['engine'], '/opt/barc/engine/spring-headless')
        for name, record in result['files'].items():
            self.assertEqual(record['sha256'], hashlib.sha256((self.image/name.lstrip('/')).read_bytes()).hexdigest())
        original = (self.output/'STATIC-ELF.json').read_bytes()
        with self.assertRaises(FileExistsError): module.retain_static_elf(self.output, self.image, self.expected())
        self.assertEqual(original, (self.output/'STATIC-ELF.json').read_bytes())
    def test_missing_transitive_dependency_never_retains_success(self):
        self.libb.unlink()
        with self.assertRaisesRegex(ValueError, 'missing or ambiguous'): module.retain_static_elf(self.output, self.image, self.expected())
        self.assertFalse((self.output/'STATIC-ELF.json').exists())
    def test_selected_root_digest_drift_refuses_retention(self):
        expected = self.expected(); expected['engine'] = '0'*64
        with self.assertRaisesRegex(ValueError, 'selected digest'): module.retain_static_elf(self.output, self.image, expected)
        self.assertFalse((self.output/'STATIC-ELF.json').exists())
    def test_real_readelf_agrees_on_authored_nonexecuted_fixture(self):
        inspected = subprocess.run(['readelf', '--file-header', '--dynamic', '--wide', str(self.engine)],
                                   stdout=subprocess.PIPE, stderr=subprocess.PIPE, timeout=5,
                                   env={'PATH': '/usr/bin:/bin', 'LC_ALL': 'C'})
        self.assertEqual(inspected.returncode, 0, inspected.stderr)
        self.assertLess(len(inspected.stdout) + len(inspected.stderr), 16384)
        self.assertIn(b'ELF64', inspected.stdout)
        self.assertIn(b'Advanced Micro Devices X86-64', inspected.stdout)
        self.assertIn(b'Shared library: [liba.so]', inspected.stdout)
        self.assertEqual(module.elf_metadata(self.engine)['needed'], ['liba.so'])
    def test_distinct_duplicate_refused_even_with_identical_bytes(self):
        duplicate = self.image/'lib64/libb.so'; duplicate.write_bytes(self.libb.read_bytes())
        with self.assertRaisesRegex(ValueError, 'ambiguous'): self.collect()
    def test_system_aliases_deduplicate_and_are_retained(self):
        (self.image/'lib').symlink_to('usr/lib', target_is_directory=True)
        result = self.collect()
        self.assertEqual(len(result['files']), 5)
        self.assertEqual(result['aliases']['/lib/x86_64-linux-gnu/liba.so'], '/usr/lib/x86_64-linux-gnu/liba.so')
    def test_dependency_link_outside_image_refused(self):
        self.libb.unlink(); self.libb.symlink_to('/etc/passwd')
        with self.assertRaisesRegex(ValueError, 'escapes image'): self.collect()
    def test_soname_mismatch_refused(self):
        elf_fixture(self.libb, soname='libwrong.so')
        with self.assertRaisesRegex(ValueError, 'SONAME differs'): self.collect()
    def test_duplicate_and_path_needed_names_are_refused(self):
        for needed in (['libb.so', 'libb.so'], ['../libb.so'], ['/lib/libb.so']):
            with self.subTest(needed=needed):
                elf_fixture(self.liba, needed=needed)
                with self.assertRaises(ValueError): self.collect()
    def test_closure_population_is_bounded(self):
        for index in range(255):
            elf_fixture(self.liba.parent/f'lib{index}.so', needed=[f'lib{index+1}.so'] if index < 254 else [])
        elf_fixture(self.liba, soname='liba.so', needed=['lib0.so'])
        with self.assertRaisesRegex(ValueError, 'closure population'): self.collect()
    def test_alias_retarget_during_collection_refuses(self):
        alias = self.image/'lib64/liba.so'; alias.symlink_to(self.liba)
        replacement = elf_fixture(self.image/'spare/liba.so', soname='liba.so', needed=['libb.so'])
        original = module.sha; calls = []
        def change(path, maximum):
            result = original(path, maximum); calls.append(path)
            if path == self.libb and calls.count(path) == 2:
                alias.unlink(); alias.symlink_to(replacement)
            return result
        with mock.patch.object(module, 'sha', side_effect=change), self.assertRaisesRegex(ValueError, 'alias changed'): self.collect()
    def test_cycles_terminate_without_omitting_edges(self):
        elf_fixture(self.libb, soname='libb.so', needed=['liba.so'])
        result = self.collect()
        self.assertEqual(len(result['files']), 5)
        self.assertEqual(result['files']['/usr/lib/x86_64-linux-gnu/libb.so']['dependencies'][0]['needed'], 'liba.so')
    def test_origin_directory_and_unsupported_search_semantics(self):
        self.libb.unlink(); elf_fixture(self.liba.parent/'private/libb.so', soname='libb.so')
        elf_fixture(self.liba, soname='liba.so', needed=['libb.so'], search='$ORIGIN/private')
        self.assertEqual(len(self.collect()['files']), 5)
        for value in ('', '/host/lib', '$ORIGIN/../escape', '$LIB', '$ORIGIN:'):
            with self.subTest(value=value):
                elf_fixture(self.liba, soname='liba.so', needed=['libb.so'], search=value)
                with self.assertRaises(ValueError): self.collect()
    def test_changed_closure_refuses_final_sweep(self):
        original = module.sha; calls = []
        def change(path, maximum):
            result = original(path, maximum); calls.append(path)
            if path == self.libb and calls.count(path) == 2:
                data = bytearray(self.engine.read_bytes()); data[-1] ^= 1; self.engine.write_bytes(data)
            return result
        with mock.patch.object(module, 'sha', side_effect=change), self.assertRaisesRegex(ValueError, 'closure changed'): self.collect()
    def test_malformed_metadata_and_unsupported_dynamic_features(self):
        original = self.libb.read_bytes()
        mutations = [(4, b'\x01'), (5, b'\x02'), (18, b'\xb7\x00'), (54, b'\x00\x00'),
                     (56, b'\xff\xff'), (0x108, struct.pack('<Q', 0xffffffffffffffff))]
        for offset, value in mutations:
            with self.subTest(offset=offset):
                data = bytearray(original); data[offset:offset+len(value)] = value; self.libb.write_bytes(data)
                with self.assertRaises(ValueError): self.collect()
        for tags in ([(5, 0x400)], [(0x7fffffff, 0)], [(0x6ffffffb, 0x800)]):
            with self.subTest(tags=tags):
                elf_fixture(self.libb, extra=tags)
                with self.assertRaises(ValueError): self.collect()
        self.libb.write_bytes(original[:200])
        with self.assertRaises(ValueError): self.collect()

class ImageSourceTests(unittest.TestCase):
    def test_missing_unwind_is_refused_before_source_acquisition(self):
        with mock.patch.object(module.shutil, 'which', return_value='/fixture/tool'), mock.patch.object(module, 'run', side_effect=subprocess.CalledProcessError(1, ['pkg-config'])), mock.patch.object(module, 'source') as acquire:
            with self.assertRaises(subprocess.CalledProcessError): module.toolchain(pins)
            acquire.assert_not_called()
    def test_moving_parent_tag_is_refused(self):
        changed = copy.deepcopy(pins); changed['toolchain']['parentOsCandidate'] = 'ubuntu:latest'
        with self.assertRaises(ValueError): module.check_inputs(changed)
    def test_snapshot_is_required(self):
        changed = copy.deepcopy(pins); changed['toolchain']['bootstrap']['ubuntuSnapshot'] = 'latest'
        with self.assertRaises(ValueError): module.check_inputs(changed)
    def test_bootstrap_hash_is_required(self):
        changed = copy.deepcopy(pins); changed['toolchain']['bootstrap']['vcpkgToolGlibcSha512'] = ''
        with self.assertRaises(ValueError): module.check_inputs(changed)
    def test_declared_source_inputs_are_complete(self):
        module.check_inputs(pins)
    def test_wrong_game_selection_is_refused(self):
        changed = copy.deepcopy(pins); changed['game']['name'] = 'Beyond All Reason stable'
        with self.assertRaises(ValueError): module.check_inputs(changed)
    def test_nonfinite_deadline_is_refused(self):
        changed = copy.deepcopy(pins); changed['budgets']['downloadSeconds'] = 0
        with self.assertRaises(ValueError): module.check_inputs(changed)
    def test_missing_make_refuses_before_source_or_compiler_launch(self):
        with mock.patch.object(module.shutil, 'which', side_effect=lambda command: None if command == 'make' else '/fixture/' + command), mock.patch.object(module, 'source') as acquire:
            with self.assertRaisesRegex(ValueError, 'missing bootstrap tool.*make'): module.toolchain(pins)
            acquire.assert_not_called()
    def test_real_gitlink_placeholder_and_nonempty_refusal(self):
        with tempfile.TemporaryDirectory() as directory:
            root = pathlib.Path(directory); repo = root / 'parent'; checkout = root / 'checkout'
            subprocess.run(['git','init','-q',str(repo)], check=True)
            subprocess.run(['git','-C',str(repo),'config','user.name','fixture'], check=True)
            subprocess.run(['git','-C',str(repo),'config','user.email','fixture@example.invalid'], check=True)
            subprocess.run(['git','-C',str(repo),'update-index','--add','--cacheinfo',
                            '160000,1111111111111111111111111111111111111111,AI/Skirmish/BARb'], check=True)
            subprocess.run(['git','-C',str(repo),'commit','-qm','fixture'], check=True)
            subprocess.run(['git','clone','--quiet','--no-hardlinks',str(repo),str(checkout)], check=True)
            slot = checkout / 'AI/Skirmish/BARb'
            self.assertTrue(slot.is_dir())
            module.prepare_highbar_slot(checkout, slot)
            self.assertFalse(slot.exists())
            slot.mkdir(); payload = slot / 'existing'; payload.write_bytes(b'preserve')
            with self.assertRaisesRegex(ValueError, 'populated'): module.prepare_highbar_slot(checkout, slot)
            self.assertEqual(payload.read_bytes(), b'preserve')
            payload.unlink(); slot.rmdir(); slot.symlink_to(repo, target_is_directory=True)
            with self.assertRaisesRegex(ValueError, 'linked'): module.prepare_highbar_slot(checkout, slot)
            with self.assertRaisesRegex(ValueError, 'slot differs'): module.prepare_highbar_slot(checkout, repo)
    def test_archive_paths_links_population_and_size(self):
        module.check_listing([{'Path':'spring-headless','Size':'5'}], 2, 10)
        for rows in ([{'Path':'../escape','Size':'5'}], [{'Path':'/escape','Size':'5'}],
                     [{'Path':'spring-headless','Size':'5','Symbolic Link':'escape'}],
                     [{'Path':'same','Size':'1'}, {'Path':'same','Size':'1'}],
                     [{'Path':'a','Size':'6'}, {'Path':'b','Size':'6'}],
                     [{'Path':'a','Size':'1'}, {'Path':'b','Size':'1'}, {'Path':'c','Size':'1'}]):
            with self.subTest(rows=rows), self.assertRaises(ValueError): module.check_listing(rows, 2, 10)
    def test_local_digest_and_symlink_refusal(self):
        with tempfile.TemporaryDirectory() as directory:
            path = pathlib.Path(directory) / 'data'; path.write_bytes(b'fixture')
            self.assertEqual(module.sha(path, 7), hashlib.sha256(b'fixture').hexdigest())
            with self.assertRaises(ValueError): module.sha(path, 6)
            link = pathlib.Path(directory) / 'link'; link.symlink_to(path)
            with self.assertRaises(ValueError): module.sha(link, 7)
    def test_game_population_is_bounded(self):
        with tempfile.TemporaryDirectory() as directory:
            path = pathlib.Path(directory); (path/'a').write_bytes(b'1234'); (path/'b').write_bytes(b'1234')
            module.data_population(path, 2, 8)
            with self.assertRaises(ValueError): module.data_population(path, 1, 8)
            with self.assertRaises(ValueError): module.data_population(path, 2, 7)
    def test_sdp_declared_population_and_expansion(self):
        with tempfile.TemporaryDirectory() as directory:
            path = pathlib.Path(directory) / 'fixture.sdp'
            def write(name, size):
                raw = bytes([len(name)]) + name + bytes(20) + struct.pack('<I', size)
                with gzip.open(path,'wb') as output: output.write(raw)
            write(b'unit.lua', 9); module.sdp_population(path, 1, 9)
            with self.assertRaises(ValueError): module.sdp_population(path, 1, 8)
            write(b'../escape', 1)
            with self.assertRaises(ValueError): module.sdp_population(path, 1, 9)

if __name__ == '__main__': unittest.main()
