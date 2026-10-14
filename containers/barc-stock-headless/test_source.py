"""Inert controls: no container, network, compiler, engine or downloader runs."""
import copy
import gzip
import hashlib
import importlib.util
import json
import pathlib
import struct
import tempfile
import unittest

root = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('bar_image_source', root / 'build-image.py')
module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
pins = json.loads((root / 'resources.json').read_text())

class ImageSourceTests(unittest.TestCase):
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
