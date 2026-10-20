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
import contextlib
import stat

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
    require(boot.get('buildType') == 'release', 'stock plugin dependencies require release-only build selection')
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

def file_identity(info):
    return (info.st_dev, info.st_ino, info.st_size, info.st_mtime_ns, info.st_ctime_ns)

@contextlib.contextmanager
def regular_input(path, maximum):
    # NONBLOCK prevents a raced FIFO from blocking open before the fstat check.
    require(not path.is_symlink(), 'linked input refused')
    descriptor = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
    with os.fdopen(descriptor, 'rb') as stream:
        before = os.fstat(stream.fileno())
        require(stat.S_ISREG(before.st_mode) and before.st_size <= maximum, 'input is nonregular or exceeds byte budget')
        require(file_identity(path.lstat()) == file_identity(before), 'input replaced before read')
        yield stream, before.st_size
        require(file_identity(os.fstat(stream.fileno())) == file_identity(before)
                and file_identity(path.lstat()) == file_identity(before), 'input grew or was replaced during read')

def file_digest(path, maximum):
    result = hashlib.sha256(); count = 0
    with regular_input(path, maximum) as (stream, size):
        while count < size:
            block = stream.read(min(1024 * 1024, size - count))
            require(bool(block), 'input truncated during read')
            count += len(block)
            require(count <= maximum, 'input read exceeds byte budget')
            result.update(block)
        require(count == size, 'input size changed during read')
    return result.hexdigest(), count

def sha(path, maximum):
    return file_digest(path, maximum)[0]

def elf_metadata(path):
    """Read bounded ELF64 metadata as data; never invoke a loader or the file."""
    with regular_input(path, 256 * 1024 * 1024) as (stream, size):
        require(size >= 64, 'truncated ELF file')
        metadata_bytes = 0
        def read(offset, count):
            nonlocal metadata_bytes
            require(0 <= offset <= size and 0 <= count <= 1024 * 1024 and offset + count <= size,
                    'truncated or excessive ELF metadata')
            require(metadata_bytes + count <= 2 * 1024 * 1024, 'ELF cumulative metadata read budget exceeded')
            stream.seek(offset); value = stream.read(count)
            metadata_bytes += len(value)
            require(len(value) == count, 'ELF changed during metadata read')
            return value
        header = struct.unpack('<16sHHIQQQIHHHHHH', read(0, 64))
        require(header[0][:7] == b'\x7fELF\x02\x01\x01' and header[0][7] in (0, 3) and header[1] in (2, 3)
                and header[2:4] == (62, 1) and header[8] == 64,
                'only executable/shared ELF64 little-endian x86-64 is supported')
        require(header[5] >= 64 and header[9] == 56 and 0 < header[10] <= 256, 'unsupported ELF program-header population')
        segments = [struct.unpack('<IIQQQQQQ', read(header[5] + index * 56, 56))
                    for index in range(header[10])]
        for segment in segments:
            require(segment[2] + segment[5] <= size and segment[5] <= segment[6], 'invalid ELF segment bounds')
        dynamic = [s for s in segments if s[0] == 2]
        interpreters = [s for s in segments if s[0] == 3]
        require(len(dynamic) == 1 and len(interpreters) <= 1, 'one dynamic segment and at most one interpreter required')
        interpreter = None
        if interpreters:
            value = read(interpreters[0][2], interpreters[0][5])
            require(value == b'/lib64/ld-linux-x86-64.so.2\0', 'unsupported ELF interpreter')
            interpreter = value[:-1].decode('ascii')
        segment = dynamic[0]
        containing = [s for s in segments if s[0] == 1 and s[2] <= segment[2]
                      and segment[2] + segment[5] <= s[2] + s[5]
                      and segment[3] - s[3] == segment[2] - s[2]]
        require(len(containing) == 1, 'dynamic metadata is not in one corresponding load segment')
        require(0 < segment[5] <= 4096 * 16 and segment[5] % 16 == 0, 'invalid dynamic metadata population')
        tags = {}; terminated = False
        for offset in range(segment[2], segment[2] + segment[5], 16):
            tag, value = struct.unpack('<qQ', read(offset, 16))
            if tag == 0:
                terminated = True; break
            tags.setdefault(tag, []).append(value)
        require(terminated, 'unterminated ELF dynamic table')
        # Audit/filter objects introduce another dependency mechanism. NODEFLIB
        # changes the selected default-directory contract and is not supported.
        require(not any(tag in tags for tag in (0x7fffffff, 0x7ffffffd, 0x6ffffefb, 0x6ffffefc)),
                'unsupported ELF audit/filter dependency')
        require(not any(value & 0x800 for value in tags.get(0x6ffffffb, [])), 'ELF NODEFLIB is unsupported')
        for tag in (5, 10, 14, 15, 29):
            require(len(tags.get(tag, [])) <= 1, 'duplicate singleton ELF metadata')
        require(5 in tags and 10 in tags and 0 < tags[10][0] <= 1024 * 1024, 'bounded ELF string table required')
        address, count = tags[5][0], tags[10][0]
        loads = [s for s in segments if s[0] == 1 and s[3] <= address and address + count <= s[3] + s[5]]
        require(len(loads) == 1, 'ambiguous or unmapped ELF string table')
        strings = read(loads[0][2] + address - loads[0][3], count)
        def string(index):
            require(index < len(strings), 'ELF string offset outside table')
            end = strings.find(b'\0', index)
            require(index < end <= index + 4096, 'unterminated or excessive ELF string')
            return strings[index:end].decode('ascii')
        needed = [string(index) for index in tags.get(1, [])]
        require(len(needed) <= 128 and len(set(needed)) == len(needed), 'duplicate/excessive ELF dependencies')
        soname = string(tags[14][0]) if 14 in tags else None
        for name in needed + ([soname] if soname else []):
            require(bool(re.fullmatch(r'[A-Za-z0-9_+.-]+', name)) and name not in ('.', '..'), 'unsupported ELF library name')
        require(not (15 in tags and 29 in tags), 'combined RPATH/RUNPATH is ambiguous')
        paths = [string(tags[tag][0]) for tag in (15, 29) if tag in tags]
        return {'class': 'ELF64', 'machine': 'x86-64', 'type': header[1], 'needed': needed,
                'soname': soname, 'interpreter': interpreter, 'searchPath': paths[0] if paths else None,
                'searchPathKind': 'RPATH' if 15 in tags else ('RUNPATH' if 29 in tags else None)}

def static_elf_correspondence(image_root, engine, plugin):
    """Closed image-local candidate correspondence, not dynamic-loader resolution."""
    image_root = image_root.resolve(strict=True)
    aliases = {}
    def confined(path):
        resolved = path.resolve(strict=True)
        require(resolved.is_relative_to(image_root) and resolved.is_file(), 'ELF candidate escapes image or is nonregular')
        require(path.is_relative_to(image_root), 'ELF input path escapes image')
        selected = '/' + path.relative_to(image_root).as_posix()
        destination = '/' + resolved.relative_to(image_root).as_posix()
        require(selected not in aliases or aliases[selected] == destination, 'ELF dependency alias changed between lookups')
        aliases[selected] = destination
        return resolved
    roots = {'engine': confined(engine), 'plugin': confined(plugin)}
    pending = list(roots.values()); records = {}; total = 0
    defaults = [image_root / path for path in ('lib/x86_64-linux-gnu', 'usr/lib/x86_64-linux-gnu', 'lib64', 'usr/lib64')]
    while pending:
        path = pending.pop(0)
        key = '/' + path.relative_to(image_root).as_posix()
        if key in records: continue
        require(len(records) < 256, 'ELF dependency closure population exceeded')
        before, accepted_bytes = file_digest(path, min(256 * 1024 * 1024, 512 * 1024 * 1024 - total))
        total += accepted_bytes
        require(total <= 512 * 1024 * 1024, 'ELF dependency closure byte budget exceeded')
        metadata = elf_metadata(path)
        directories = [path.parent, *defaults]
        if metadata['searchPath'] is not None:
            entries = metadata['searchPath'].split(':')
            require(len(entries) <= 16, 'ELF search-path population exceeded')
            for entry in entries:
                require(entry and (entry == '$ORIGIN' or entry.startswith('$ORIGIN/')),
                        'only explicit ORIGIN-relative ELF search paths supported')
                suffix = entry[len('$ORIGIN'):].lstrip('/')
                require('$' not in suffix and '..' not in pathlib.PurePosixPath(suffix).parts,
                        'unsupported ELF search-path expansion')
                directory = (path.parent / suffix).resolve(strict=True)
                require(directory.is_relative_to(image_root) and directory.is_dir(), 'ELF search directory escapes image')
                directories.append(directory)
        edges = []
        for needed in metadata['needed']:
            candidates = {confined(directory / needed) for directory in directories
                          if (directory / needed).exists() or (directory / needed).is_symlink()}
            require(len(candidates) == 1, 'missing or ambiguous ELF dependency: ' + needed)
            candidate = candidates.pop()
            edges.append({'needed': needed, 'path': '/' + candidate.relative_to(image_root).as_posix()})
            pending.append(candidate)
        if metadata['interpreter']:
            candidate = confined(image_root / metadata['interpreter'].lstrip('/'))
            edges.append({'interpreter': metadata['interpreter'], 'path': '/' + candidate.relative_to(image_root).as_posix()})
            pending.append(candidate)
        require(sha(path, 256 * 1024 * 1024) == before, 'ELF changed during correspondence')
        records[key] = {'sha256': before, 'bytes': accepted_bytes, 'metadata': metadata, 'dependencies': edges}
    # A final sweep binds dependencies and both roots to one unchanged inventory.
    for key, record in records.items():
        require(sha(image_root / key.lstrip('/'), 256 * 1024 * 1024) == record['sha256'], 'ELF closure changed during collection')
        for edge in record['dependencies']:
            soname = records[edge['path']]['metadata']['soname']
            require('needed' not in edge or soname is None or soname == edge['needed'], 'ELF dependency SONAME differs')
    for selected, resolved in aliases.items():
        require((image_root / selected.lstrip('/')).resolve(strict=True) == image_root / resolved.lstrip('/'),
                'ELF dependency alias changed during collection')
    return {'schema': 'bar-static-elf-correspondence/1', 'roots': {role: '/' + path.relative_to(image_root).as_posix() for role, path in roots.items()},
            'files': records, 'aliases': aliases, 'loadedAbiAccepted': False,
            'scope': 'ELF64 x86-64 image-local DT_NEEDED/interpreter candidate correspondence; not loader order, symbols, versions, dlopen or loaded ABI proof'}

def retain_static_elf(output, image_root=pathlib.Path('/'), expected=None):
    require(isinstance(expected, dict) and set(expected) == {'engine', 'plugin'}
            and all(isinstance(value, str) and SHA.fullmatch(value) for value in expected.values()),
            'exact expected engine/plugin digests required')
    correspondence = static_elf_correspondence(image_root, output / 'engine/spring-headless', output / 'plugin/libSkirmishAI.so')
    for role, digest in expected.items():
        require(correspondence['files'][correspondence['roots'][role]]['sha256'] == digest,
                'ELF root differs from selected digest: ' + role)
    correspondence['expectedRoots'] = expected
    with (output / 'STATIC-ELF.json').open('x') as stream:
        json.dump(correspondence, stream, sort_keys=True, indent=2)
        stream.write('\n')

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

def prepare_highbar_slot(recoil, highbar):
    relative = 'AI/Skirmish/BARb'
    require(highbar == recoil / relative, 'HighBar source slot differs')
    row = subprocess.check_output(['git','-C',str(recoil),'ls-files','--stage','--',relative], text=True).strip().split('\t')
    require(len(row) == 2 and row[1] == relative, 'HighBar slot is not one tracked gitlink')
    fields = row[0].split()
    require(len(fields) == 3 and fields[0] == '160000' and fields[2] == '0' and bool(COMMIT.fullmatch(fields[1])), 'HighBar slot gitlink metadata differs')
    tracked = subprocess.check_output(['git','-C',str(recoil),'ls-tree','HEAD','--',relative], text=True).strip().split('\t')
    require(len(tracked) == 2 and tracked[1] == relative and tracked[0].split() == ['160000','commit',fields[1]], 'HighBar gitlink index differs from authenticated HEAD')
    require(not highbar.is_symlink(), 'HighBar slot is linked')
    if highbar.exists():
        require(highbar.is_dir(), 'HighBar slot is not a directory')
        with os.scandir(highbar) as entries:
            require(next(entries, None) is None, 'HighBar slot is populated; refusing replacement')
        # Git checkout materializes an empty gitlink directory. Removing only
        # that placeholder keeps the tracked Recoil tree and foreign data intact.
        highbar.rmdir()

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
    # Refuse missing native prerequisites before a costly dependency compile.
    for command in ('git','curl','cmake','ninja','make','perl','pkg-config','g++-13','gcc-13','timeout','readelf','7z','tar','zip','unzip','autoconf','automake','libtoolize'):
        require(shutil.which(command) is not None, 'missing bootstrap tool before dependency build: ' + command)
    # Selected Recoil requires Libunwind >=1.4 and links its static LZMA closure.
    # Check the system prerequisites before spending time on vcpkg compilation.
    run(['pkg-config', '--atleast-version=1.4.0', 'libunwind'], 30)
    run(['pkg-config', '--exists', 'liblzma'], 30)
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
    triplets = manifest_root / 'triplets'; triplets.mkdir()
    triplet = triplets / 'x64-linux.cmake'
    canonical_triplet = target / 'triplets/x64-linux.cmake'
    require(canonical_triplet.is_file(), 'canonical x64-linux triplet missing')
    triplet.write_text('include("/opt/vcpkg/triplets/x64-linux.cmake")\n'
                       'set(VCPKG_BUILD_TYPE release)\n'
                       'list(APPEND VCPKG_HASH_ADDITIONAL_FILES "/opt/vcpkg/triplets/x64-linux.cmake")\n')
    env = dict(os.environ, VCPKG_MAX_CONCURRENCY='1', VCPKG_DISABLE_METRICS='1')
    run([str(target / 'vcpkg'), 'install', '--triplet=x64-linux', '--x-manifest-root=' + str(manifest_root),
         '--x-install-root=/opt/vcpkg/installed', '--overlay-triplets=' + str(triplets), '--disable-metrics'], 3600, env=env)
    packages = subprocess.check_output(['dpkg-query','-W','-f=${Package} ${Version} ${Architecture}\n'], text=True)
    (manifest_root / 'ubuntu-packages.txt').write_text(packages)
    status = target / 'installed/vcpkg/status'
    require(status.is_file(), 'vcpkg installed package status missing')
    shutil.copy2(status, manifest_root / 'vcpkg-status.txt')
    # Record actual package identities and tool bytes as OUTPUTS, not fake
    # prequalified inputs. The platform also records the resulting image ID.
    files = [manifest_root / name for name in ('vcpkg.json','ubuntu-packages.txt','vcpkg-status.txt')]
    files += [triplet, canonical_triplet, target / 'vcpkg', pathlib.Path('/usr/bin/g++-13'), pathlib.Path('/usr/bin/cmake')]
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
    prepare_highbar_slot(recoil, highbar)
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
    # Validate and retain the produced engine/plugin dependency inventory before
    # launching the downloader. No inspected ELF is executed by this check.
    plugin_manifest = (output / 'PLUGIN.SHA256').read_text()
    require(bool(re.fullmatch(r'[0-9a-f]{64}  /opt/barc/plugin/libSkirmishAI\.so\n', plugin_manifest)),
            'plugin digest manifest differs')
    retain_static_elf(output, expected={'engine': pins['engine']['headlessSha256'], 'plugin': plugin_manifest[:64]})
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
