#!/usr/bin/env python3
"""Acquire exact BAR image inputs and reuse the existing stock plugin build."""
import argparse
import hashlib
import gzip
import struct
import json
import os
import pathlib
import re
import shutil
import subprocess

ROOT = pathlib.Path(__file__).resolve().parent
SHA = re.compile(r'[0-9a-f]{64}')
COMMIT = re.compile(r'[0-9a-f]{40}')
IMAGE = re.compile(r'(?:[a-z0-9][a-z0-9./:_-]*@sha256:[0-9a-f]{64}|sha256:[0-9a-f]{64})')

def require(condition, reason):
    if not condition:
        raise ValueError(reason)

def check_inputs(pins):
    tool = pins['toolchain']; boot = tool['bootstrap']
    require(bool(IMAGE.fullmatch(tool['parentOsCandidate'])), 'digest-pinned Ubuntu parent required')
    require(bool(re.fullmatch(r'20[0-9]{6}T[0-9]{6}Z', boot['ubuntuSnapshot'])), 'fixed signed snapshot required')
    require(boot['vcpkgCommit'] == tool['vcpkgBaseline'] and bool(COMMIT.fullmatch(boot['vcpkgTree'])), 'exact canonical vcpkg commit/tree required')
    require(bool(re.fullmatch(r'[0-9a-f]{128}', boot['vcpkgToolGlibcSha512'])), 'vcpkg tool hash missing')
    for row in pins['sources'].values():
        require(row['url'].startswith('https://github.com/'), 'source must use the declared HTTPS repository')
        require(bool(COMMIT.fullmatch(row['commit'])) and bool(COMMIT.fullmatch(row['tree'])), 'exact source commit/tree required')
    require(pins['engine']['release'] == '2026.07.04', 'stock engine release differs')
    for name in ('imageBuildSeconds', 'downloadSeconds', 'compileSeconds', 'gitFetchSeconds'):
        require(type(pins['budgets'][name]) is int and 0 < pins['budgets'][name] <= 3600, 'invalid finite stage deadline')
    for value in (pins['engine']['archiveSha256'], pins['engine']['headlessSha256'], pins['map']['sha256'], pins['game']['sdpSha256'], pins['stockContractSha256']):
        require(bool(SHA.fullmatch(value)), 'resource SHA256 is missing')
    require(pins['game']['name'] == 'Beyond All Reason test-29926-0571aa8', 'moving/unselected game name refused')
    require(pins['game']['sdp'] == '7fd33d9ceb79c052065b8d3c2f6f2687.sdp', 'game package identity differs')

def sha(path, maximum):
    require(path.is_file() and not path.is_symlink(), 'missing/linked input: ' + str(path))
    require(path.stat().st_size <= maximum, 'input exceeds byte budget: ' + str(path))
    result = hashlib.sha256()
    with path.open('rb') as stream:
        while block := stream.read(1024 * 1024):
            result.update(block)
    return result.hexdigest()

def run(command, seconds, *, env=None, cwd=None):
    subprocess.run(['timeout', '--kill-after=5s', str(seconds) + 's', *command], env=env, cwd=cwd, check=True)

def acquire_file(url, expected, target, seconds, maximum):
    require(not target.exists(), 'acquisition destination already exists')
    target.parent.mkdir(parents=True, exist_ok=True)
    run(['curl', '--fail', '--location', '--proto', '=https', '--proto-redir', '=https',
         '--retry', '0', '--connect-timeout', '20', '--max-time', str(seconds),
         '--max-filesize', str(maximum), '--output', str(target), url], seconds + 5)
    require(sha(target, maximum) == expected, 'downloaded artifact hash differs: ' + str(target))

def source(row, target, seconds):
    require(not target.exists(), 'source destination already exists')
    target.mkdir(parents=True)
    run(['git', 'init', '-q', str(target)], 30)
    run(['git', '-C', str(target), 'remote', 'add', 'origin', row['url']], 30)
    env = dict(os.environ, GIT_TERMINAL_PROMPT='0')
    run(['git', '-C', str(target), 'fetch', '--depth=1', '--no-tags', 'origin', row['commit']], seconds, env=env)
    run(['git', '-C', str(target), 'checkout', '--detach', 'FETCH_HEAD'], 30)
    for expression, expected in [('HEAD', row['commit']), ('HEAD^{tree}', row['tree'])]:
        actual = subprocess.check_output(['git', '-C', str(target), 'rev-parse', expression], text=True).strip()
        require(actual == expected, 'fetched source identity differs')

def check_listing(records, max_files, max_bytes):
    seen = set(); total = 0
    for record in records:
        name = record.get('Path', '')
        path = pathlib.PurePosixPath(name)
        require(name and path.as_posix() == name and not path.is_absolute() and '..' not in path.parts and len(path.parts) <= 16, 'unsafe archive path')
        require(name not in seen and len(seen) < max_files, 'duplicate/excessive archive population')
        require(not any('Link' in key for key in record), 'archive links require separate qualification')
        seen.add(name)
        count = int(record.get('Size', '0'))
        require(count >= 0, 'negative archive size')
        total += count
        require(total <= max_bytes, 'archive expanded-byte budget exceeded')
    require(bool(seen), 'empty engine archive')

def engine_listing(archive, pins):
    # The outer digest is verified before native archive inspection. Bound textual
    # metadata while streaming, before accumulating the file population.
    records = []; current = {}; active = False; metadata_bytes = 0
    child = subprocess.Popen(['timeout', '--kill-after=5s', '120s', '7z', 'l', '-slt', str(archive)], stdout=subprocess.PIPE)
    try:
        for line in child.stdout:
            metadata_bytes += len(line)
            require(metadata_bytes <= 2 * 1024 * 1024 and len(line) <= 4096, 'archive listing exceeds metadata budget')
            text = line.decode('utf-8').rstrip('\r\n')
            if text == '----------':
                active = True; continue
            if not active:
                continue
            if not text:
                if current:
                    records.append(current); current = {}
                    require(len(records) <= pins['budgets']['engineEntriesMax'], 'archive population exceeded')
                continue
            key, value = text.split(' = ', 1)
            require(key not in current, 'duplicate archive metadata field')
            current[key] = value
        if current: records.append(current)
        require(child.wait(timeout=5) == 0, '7z engine inspection failed')
    finally:
        if child.poll() is None:
            child.kill(); child.wait(timeout=5)
        child.stdout.close()
    check_listing(records, pins['budgets']['engineEntriesMax'], pins['budgets']['engineExpandedMaxBytes'])

def data_population(root, files_max, bytes_max):
    files = directories = total = 0; stack = [(root, 0)]
    while stack:
        directory, depth = stack.pop()
        require(depth <= 8, 'game directory depth exceeded')
        with os.scandir(directory) as entries:
            for entry in entries:
                require(not entry.is_symlink(), 'game data contains a symlink')
                if entry.is_dir(follow_symlinks=False):
                    directories += 1
                    require(directories <= 512, 'game directory population exceeded')
                    stack.append((pathlib.Path(entry.path), depth + 1))
                else:
                    require(entry.is_file(follow_symlinks=False), 'nonregular game data')
                    files += 1; total += entry.stat(follow_symlinks=False).st_size
                    require(files <= files_max and total <= bytes_max, 'game data population/bytes exceeded')

def sdp_population(path, files_max, bytes_max):
    # The authenticated .sdp uses the upstream pool format: filename length,
    # filename, MD5 digest, CRC32 and little-endian uint32 uncompressed size.
    files = expanded = 0; seen = set()
    with gzip.open(path, 'rb') as stream:
        while length := stream.read(1):
            record = stream.read(length[0] + 24)
            require(len(record) == length[0] + 24 and length[0] > 0, 'truncated SDP record')
            name = record[:length[0]].decode('utf-8')
            relative = pathlib.PurePosixPath(name)
            require(relative.as_posix() == name and not relative.is_absolute() and '..' not in relative.parts, 'unsafe SDP member path')
            require(name not in seen and files < files_max, 'duplicate/excessive SDP file population')
            seen.add(name); files += 1
            expanded += struct.unpack('<I', record[-4:])[0]
            require(expanded <= bytes_max, 'game declared expanded-byte budget exceeded')
    require(files > 0, 'empty SDP')

def toolchain(pins):
    check_inputs(pins)
    boot = pins['toolchain']['bootstrap']; target = pathlib.Path('/opt/vcpkg')
    source({'url': boot['vcpkgRepository'], 'commit': boot['vcpkgCommit'], 'tree': boot['vcpkgTree']}, target, pins['budgets']['gitFetchSeconds'])
    metadata = (target / 'scripts/vcpkg-tool-metadata.txt').read_text()
    require(boot['vcpkgToolRelease'] in metadata and boot['vcpkgToolGlibcSha512'] in metadata, 'vcpkg bootstrap metadata differs')
    run(['bash', str(target / 'bootstrap-vcpkg.sh'), '-disableMetrics'], 600)
    executable = target / 'vcpkg'
    require(executable.is_file() and executable.stat().st_size <= 64 * 1024 * 1024, 'vcpkg executable exceeds budget')
    require(hashlib.sha512(executable.read_bytes()).hexdigest() == boot['vcpkgToolGlibcSha512'], 'bootstrapped vcpkg binary differs')
    manifest_root = pathlib.Path('/opt/barc/toolchain'); manifest_root.mkdir(parents=True)
    manifest = {'name':'barc-stock-toolchain', 'version-string':'0.1.0',
                'builtin-baseline':boot['vcpkgCommit'], 'dependencies':['grpc','protobuf','abseil','gtest']}
    # The first three are the existing HighBar manifest; GTest is required by
    # its stock source controls. Resolve all sources from the same baseline.
    (manifest_root / 'vcpkg.json').write_text(json.dumps(manifest, indent=2) + '\n')
    env = dict(os.environ, VCPKG_MAX_CONCURRENCY='1', VCPKG_DISABLE_METRICS='1')
    run([str(target / 'vcpkg'), 'install', '--triplet=x64-linux', '--x-manifest-root=' + str(manifest_root),
         '--x-install-root=/opt/vcpkg/installed', '--disable-metrics'], 3600, env=env)
    packages = subprocess.check_output(['dpkg-query','-W','-f=${Package} ${Version} ${Architecture}\n'], text=True)
    (manifest_root / 'ubuntu-packages.txt').write_text(packages)
    status = target / 'installed/vcpkg/status'
    require(status.is_file(), 'vcpkg installed package status missing')
    shutil.copy2(status, manifest_root / 'vcpkg-status.txt')
    # Record actual package identities and tool bytes as OUTPUTS, not fake
    # prequalified inputs. The platform also records the resulting image ID.
    files = [manifest_root / name for name in ('vcpkg.json','ubuntu-packages.txt','vcpkg-status.txt')]
    files += [target / 'vcpkg', pathlib.Path('/usr/bin/g++-13'), pathlib.Path('/usr/bin/cmake')]
    for relative in ('tools/protobuf/protoc','tools/grpc/grpc_cpp_plugin'):
        files.append(target / 'installed/x64-linux' / relative)
    lines = []
    for path in files:
        actual = path.resolve(strict=True)
        lines.append(sha(actual, 512 * 1024 * 1024) + '  ' + str(actual))
    (manifest_root / 'SHA256SUMS').write_text('\n'.join(lines) + '\n')
    (manifest_root / 'MANIFEST.SHA256').write_text(sha(manifest_root / 'SHA256SUMS', 1024 * 1024) + '\n')

def verify_toolchain():
    manifest = pathlib.Path('/opt/barc/toolchain/SHA256SUMS')
    expected = (manifest.parent / 'MANIFEST.SHA256').read_text().strip()
    require(bool(SHA.fullmatch(expected)) and sha(manifest, 1024 * 1024) == expected, 'produced toolchain manifest differs')
    run(['sha256sum', '--check', '--strict', str(manifest)], 120)

def build(pins):
    check_inputs(pins)
    verify_toolchain()
    cmake = subprocess.check_output(['cmake', '--version'], text=True).splitlines()[0]
    require(cmake == 'cmake version ' + pins['toolchain']['cmakeVersion'], 'unselected CMake version')
    require(subprocess.check_output(['g++-13', '-dumpfullversion'], text=True).strip() == pins['toolchain']['gccVersion'], 'unselected C++ compiler')
    require(subprocess.check_output(['protoc', '--version'], text=True).strip() == 'libprotoc ' + pins['toolchain']['protobufVersion'], 'unselected protobuf generator')
    require(subprocess.check_output(['pkg-config', '--modversion', 'grpc++'], text=True).strip() == pins['toolchain']['grpcVersion'], 'unselected grpc closure')
    for command in ('git','curl','7z','ninja','timeout','grpc_cpp_plugin','readelf'):
        require(shutil.which(command) is not None, 'missing qualified tool: ' + command)
    budget = pins['budgets']; output = pathlib.Path('/opt/barc'); output.mkdir(exist_ok=True)
    shutil.copy2(ROOT / 'resources.json', output / 'resources.json')
    recoil = pathlib.Path('/src/recoil'); highbar = recoil / 'AI/Skirmish/BARb'; fsbar = pathlib.Path('/src/fsbar')
    source(pins['sources']['recoil'], recoil, budget['gitFetchSeconds'])
    # Gitlink revisions are bound by the verified engine tree. HighBar overrides
    # only the explicitly owned BARb gitlink, not the engine's tracked files.
    paths = subprocess.check_output(['git', '-C', str(recoil), 'config', '--file', '.gitmodules', '--get-regexp', 'path'], text=True)
    for line in paths.splitlines():
        path = line.split(maxsplit=1)[1]
        if path != 'AI/Skirmish/BARb':
            run(['git', '-C', str(recoil), 'submodule', 'update', '--init', '--recursive', '--', path], budget['gitFetchSeconds'])
    source(pins['sources']['highbar'], highbar, budget['gitFetchSeconds'])
    source(pins['sources']['fsbar'], fsbar, budget['gitFetchSeconds'])
    require(sha(highbar / 'contracts/barc-stock-queue-v1/contract.json', 1024 * 1024) == pins['stockContractSha256'], 'stock ABI/wire contract differs')
    # Protobuf stubs are generated by the exact qualified tools; no moving Buf plugins.
    generated = highbar / 'build/gen'; generated.mkdir(parents=True)
    protos = sorted((highbar / 'proto/highbar').glob('*.proto'))
    run(['protoc', '-I', str(highbar / 'proto'), '--cpp_out=' + str(generated), '--grpc_out=' + str(generated),
         '--plugin=protoc-gen-grpc=' + shutil.which('grpc_cpp_plugin'), *map(str, protos)], 120)
    env = dict(os.environ, BARC_BUILD_JOBS='1', BARC_SYSROOT=pins['toolchain']['sysroot'])
    run(['bash', str(highbar / 'scripts/build-barc-stock-plugin.sh'), str(recoil), str(highbar), '/tmp/barc-plugin-build'], budget['compileSeconds'], env=env)
    plugin = pathlib.Path('/tmp/barc-plugin-build/AI/Skirmish/BARb/data/libSkirmishAI.so')
    require(plugin.is_file(), 'built plugin location differs; inspect actual build output')
    run(['readelf', '--file-header', str(plugin)], 30)
    # Runtime ABI/load qualification is separate; these are actual produced bytes.
    (output / 'plugin').mkdir(); shutil.copy2(plugin, output / 'plugin/libSkirmishAI.so')
    # Retain only source/setup needed by the maintained launcher; no old runtime.
    installed = pathlib.Path('/opt/highbar')
    for relative in ('data', 'tests/headless/LuaRules', 'tests/headless/LuaUI'):
        if (highbar / relative).exists(): shutil.copytree(highbar / relative, installed / relative)
    target = installed / 'tests/headless/_launch.sh'; target.parent.mkdir(parents=True, exist_ok=True); shutil.copy2(highbar / 'tests/headless/_launch.sh', target)
    shutil.copytree(fsbar / 'tests/Broker.NativeProof/RuntimeEvidence/fixtures/seed-attribution-helper/fixture', output / 'source/seed-fixture')
    (output / 'BUILD-SOURCES.txt').write_text('\n'.join(role + ' ' + row['commit'] + ' ' + row['tree'] for role,row in pins['sources'].items()) + '\n')
    (output / 'PLUGIN.SHA256').write_text(sha(output / 'plugin/libSkirmishAI.so', budget['assetDownloadMaxBytes']) + '  /opt/barc/plugin/libSkirmishAI.so\n')

def integrate(pins):
    check_inputs(pins)
    verify_toolchain()
    output = pathlib.Path('/opt/barc'); budget = pins['budgets']
    require(not (output / 'engine').exists() and not (output / 'data').exists(), 'runtime acquisition requires a fresh image stage')
    for role, row in pins['sources'].items():
        target = pathlib.Path('/src/recoil/AI/Skirmish/BARb') if role == 'highbar' else pathlib.Path('/src/' + role)
        for expression, expected in [('HEAD', row['commit']), ('HEAD^{tree}', row['tree'])]:
            require(subprocess.check_output(['git','-C',str(target),'rev-parse',expression], text=True).strip() == expected, 'development source identity differs')
    run(['sha256sum','--check','--strict',str(output / 'PLUGIN.SHA256')], 30)
    archive = pathlib.Path('/tmp/recoil.7z')
    acquire_file(pins['engine']['url'], pins['engine']['archiveSha256'], archive, 300, budget['assetDownloadMaxBytes'])
    engine_listing(archive, pins); (output / 'engine').mkdir()
    run(['7z', 'x', '-y', '-o' + str(output / 'engine'), str(archive)], 300)
    require(sha(output / 'engine/spring-headless', budget['engineExpandedMaxBytes']) == pins['engine']['headlessSha256'], 'headless binary differs')
    # Retain the complete official engine payload; runtime entry is headless only.
    data = output / 'data'; (data / 'maps').mkdir(parents=True)
    acquire_file(pins['map']['url'], pins['map']['sha256'], data / 'maps' / pins['map']['file'], 300, budget['assetDownloadMaxBytes'])
    prd = output / 'engine/pr-downloader'; require(prd.is_file(), 'pinned engine archive lacks its downloader')
    env = dict(os.environ, PRD_RAPID_REPO_MASTER=pins['game']['rapidRepositoryMaster'], PRD_RAPID_USE_STREAMER='false')
    run([str(prd), '--filesystem-writepath', str(data), '--rapid-download', pins['game']['name']], budget['downloadSeconds'], env=env)
    sdp = data / 'packages' / pins['game']['sdp']
    require(sha(sdp, 8 * 1024 * 1024) == pins['game']['sdpSha256'], 'selected BAR manifest differs')
    sdp_population(sdp, budget['gameFilesMax'], budget['gameExpandedMaxBytes'])
    data_population(data, budget['gameFilesMax'], budget['gameCompressedMaxBytes'])
    run([str(prd), '--filesystem-writepath', str(data), '--validate-sdp', str(sdp)], 300, env=env)
    run([str(prd), '--filesystem-writepath', str(data), '--rapid-validate'], 300, env=env)
    archive.unlink()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--mode', choices=['preflight','toolchain','development','headless-integration'], default='development')
    args = parser.parse_args()
    try:
        pins = json.loads((ROOT / 'resources.json').read_text())
        if args.mode == 'preflight':
            check_inputs(pins)
        elif args.mode == 'toolchain':
            toolchain(pins)
        elif args.mode == 'development':
            build(pins)
        else:
            integrate(pins)
    except (ValueError, OSError, subprocess.SubprocessError) as error:
        parser.exit(2, 'BAR image preparation refused: ' + str(error) + '\n')
