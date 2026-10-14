#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$repo_root/tests/Broker.Browser.Receiver.Tests/shared-fixture.sh"
work="$(mktemp -d "${TMPDIR:-/tmp}/barc-receiver-package-test.XXXXXX")"
cleanup() { rm -rf -- "$work"; }
trap cleanup EXIT

mkdir -p \
  "$work/source/src/Broker.Browser.Client/dist" \
  "$work/source/src/Broker.Browser.Contracts/generated" \
  "$work/source/src/Broker.Browser.Wasm" \
  "$work/source/tests/Broker.Browser.Wasm.Tests/generated"
printf '%s\n' 'module Broker.Browser.Client.BarcPreview' > "$work/source/src/Broker.Browser.Client/BarcPreview.fs"
printf '%s\n' 'built-client' > "$work/source/src/Broker.Browser.Client/dist/index.js"
printf '%s\n' 'generated-codec' > "$work/source/src/Broker.Browser.Contracts/generated/barc_browser.js"
printf '%s\n' 'self.onmessage = () => {};' > "$work/source/src/Broker.Browser.Wasm/guest-worker.js"
printf '\x00\x61\x73\x6d\x01\x00\x00\x00\x00\x00' > "$work/source/tests/Broker.Browser.Wasm.Tests/generated/manual-preview.wasm"
printf '\x00\x61\x73\x6d\x01\x00\x00\x00\x00\x00' > "$work/source/tests/Broker.Browser.Wasm.Tests/generated/custom-preview.wasm"

shared_fixture "$work/source"

"$repo_root/scripts/package-barc-preview.sh" "$work/source" "$work/first.tar.gz" >/dev/null
"$repo_root/scripts/package-barc-preview.sh" "$work/source" "$work/second.tar.gz" >/dev/null
cmp "$work/first.tar.gz" "$work/second.tar.gz"

mkdir "$work/unpacked"
tar -xzf "$work/first.tar.gz" -C "$work/unpacked"
(
  cd "$work/unpacked"
  sha256sum --check BARC-PREVIEW.SHA256 >/dev/null
)

expected="$work/expected.txt"
actual="$work/actual.txt"
printf '%s\n' \
  BARC-PREVIEW.SHA256 \
  guests/custom-preview.wasm \
  guests/manual-preview.wasm \
  src/Broker.Browser.Client/BarcPreview.fs \
  src/Broker.Browser.Client/dist/index.js \
  src/Broker.Browser.Contracts/generated/barc_browser.js \
  src/Broker.Browser.SharedWasm/_content/FS.GG.Wasm.Browser/module-worker.mjs \
  src/Broker.Browser.SharedWasm/_content/FS.GG.Wasm.Browser/policy/Host.js \
  src/Broker.Browser.SharedWasm/_content/FS.GG.Wasm.Browser/policy/Owned.js \
  src/Broker.Browser.SharedWasm/_content/FS.GG.Wasm.Browser/policy/WorkerEntry.js \
  src/Broker.Browser.SharedWasm/_content/FS.GG.Wasm.Browser/worker-client.mjs \
  src/Broker.Browser.SharedWasm/fable/Adapter.js \
  src/Broker.Browser.SharedWasm/index.js \
  src/Broker.Browser.Wasm/barc-wire.js \
  src/Broker.Browser.Wasm/guest-supervisor.js \
  src/Broker.Browser.Wasm/guest-worker.js \
  src/Broker.Browser.Wasm/index.js \
  src/Broker.Browser.Wasm/wasm-profile.js | LC_ALL=C sort > "$expected"
find "$work/unpacked" -type f -printf '%P\n' | LC_ALL=C sort > "$actual"
diff -u "$expected" "$actual"

if "$repo_root/scripts/package-barc-preview.sh" "$work/source" "$work/first.tar.gz" >/dev/null 2>&1; then
  echo "packager overwrote an immutable archive" >&2
  exit 1
fi

# Removing a transitive policy dependency must refuse before any archive output.
rm "$work/source/src/Broker.Browser.SharedWasm/_content/FS.GG.Wasm.Browser/policy/Owned.js"
if "$repo_root/scripts/package-barc-preview.sh" "$work/source" "$work/missing-policy.tar.gz" >/dev/null 2>&1; then
  echo "packager accepted an incomplete shared Worker graph" >&2; exit 1
fi
[[ ! -e "$work/missing-policy.tar.gz" ]]
# An added archive file outside the original manifest cannot pass adoption guards.
printf '%s\n' 'unlisted' > "$work/unpacked/src/unlisted.js"
if python3 "$repo_root/scripts/check-barc-shared-closure.py" "$work/unpacked" --manifest >/dev/null 2>&1; then
  echo "shared closure accepted an unmanifested file" >&2; exit 1
fi
# Complete Fable libraries retain unused Node-only files. They must remain in
# the archive inventory without making them browser runtime entrypoints.
shared_fixture "$work/source"
shared="$work/source/src/Broker.Browser.SharedWasm"
printf '%s\n' 'import { readFileSync } from "node:fs";' > "$shared/fable/UnusedNode.js"
python3 "$repo_root/scripts/check-barc-shared-closure.py" "$work/source"
"$repo_root/scripts/package-barc-preview.sh" "$work/source" "$work/dormant-library.tar.gz" >/dev/null
tar -tzf "$work/dormant-library.tar.gz" | grep -Fx 'src/Broker.Browser.SharedWasm/fable/UnusedNode.js' >/dev/null
printf '%s\n' 'import "./UnusedNode.js";' >> "$shared/fable/Adapter.js"
if python3 "$repo_root/scripts/check-barc-shared-closure.py" "$work/source" > "$work/reachable-node.log" 2>&1; then
  echo "shared closure accepted a reachable Node-only runtime import" >&2; exit 1
fi
grep -F 'nonrelative shared runtime import: node:fs' "$work/reachable-node.log" >/dev/null
rm "$shared/fable/UnusedNode.js"
shared_fixture "$work/source"
# Exercise complete import operands through the actual closure guard, including
# comments, escapes and template substitutions. No JavaScript is executed.
python3 - "$repo_root/scripts/check-barc-shared-closure.py" "$work/source" <<'PYIMPORTS'
import pathlib, subprocess, sys
guard, root = sys.argv[1:]
adapter = pathlib.Path(root) / 'src/Broker.Browser.SharedWasm/fable/Adapter.js'
original = adapter.read_text()
target = '../_content/FS.GG.Wasm.Browser/policy/Host.js'
accepted = [
    'import(' + repr(target) + ');',
    'import /* separator */ ( /* operand */ ' + repr(target) + ' /* end */ );',
    'import /* binding */ { Host } /* source */ from ' + repr(target) + ';',
    'export /* binding */ { Host } /* source */ from ' + repr(target) + ';',
    'const note = "import(selectedPath)"; // import(otherPath)\n',
    'const pattern = /import[(]selectedPath[)]/;',
    'const note = `import(selectedPath)`;',
    'const note = `${import(' + repr(target) + ')}`;',
]
rejected = [
    'import(' + repr(target) + ' + suffix);',
    'import /* separator */ (selectedPath);',
    'import(' + repr(target) + '\n + suffix);',
    'import((' + repr(target) + '));',
    'import(`' + target + '`);',
    'import(' + repr(target) + ', options);',
    'import(' + repr(target) + ' ?? fallback);',
    'const note = `${import(selectedPath)}`;',
    'import("../_content/FS.GG.Wasm.Browser/policy/Host\\x2ejs");',
    'import("../_content/FS.GG.Wasm.Browser/policy/Host\\u002ejs");',
    'import /* separator */ "node:fs";',
    'export /* separator */ * from "node:fs";',
    'const value = counter++ / import(selectedPath) / divisor;',
    'const value = counter-- / import(selectedPath) / divisor;',
    'const value = object.return / import(selectedPath) / divisor;',
    'const value = object.if() / import(selectedPath) / divisor;',
    '// ordinary comment\rimport(selectedPath);',
    '// ordinary comment\u2028import(selectedPath);',
    '// ordinary comment\u2029import(selectedPath);',
    'if (false) {} else /[/*]/; import(selectedPath);',
    'export default /[/*]/; import(selectedPath);',
    'function check() { label: while (true) { break label\n/[/*]/; import(selectedPath); } }',
    'const of = counter; const value = of / import(selectedPath) / divisor;',
]
try:
    for expected, cases in [(True, accepted), (False, rejected)]:
        for statement in cases:
            adapter.write_text(original + '\n' + statement + '\n')
            result = subprocess.run([sys.executable, guard, root], capture_output=True, text=True, timeout=10)
            if (result.returncode == 0) != expected:
                raise SystemExit('unexpected import-guard disposition: ' + repr(statement) + ': ' + result.stderr)
finally:
    adapter.write_text(original)
PYIMPORTS
# Individual files below 8MiB must still obey the aggregate inspection budget.
shared_fixture "$work/source"
python3 - "$work/source/src/Broker.Browser.SharedWasm/_content" <<'PYBYTES'
import pathlib, sys
root = pathlib.Path(sys.argv[1])
for index in range(5):
    with (root / ('bounded-' + str(index) + '.bin')).open('wb') as stream:
        stream.truncate(7 * 1024 * 1024)
PYBYTES
if python3 "$repo_root/scripts/check-barc-shared-closure.py" "$work/source" > "$work/byte-bound.log" 2>&1; then
  echo "shared closure accepted an excessive aggregate inspection population" >&2; exit 1
fi
grep -F 'aggregate inspection byte bound exceeded' "$work/byte-bound.log" >/dev/null
rm "$work/source/src/Broker.Browser.SharedWasm/_content/"bounded-*.bin
# Traversal must refuse excessive empty directories before reading their contents.
shared_fixture "$work/source"
python3 - "$work/source/src/Broker.Browser.SharedWasm/fable" <<'PYBOUND'
import pathlib, sys
root = pathlib.Path(sys.argv[1])
for index in range(257):
    (root / ('empty-' + str(index))).mkdir()
PYBOUND
if python3 "$repo_root/scripts/check-barc-shared-closure.py" "$work/source" > "$work/directory-bound.log" 2>&1; then
  echo "shared closure accepted unbounded empty-directory traversal" >&2; exit 1
fi
grep -F 'directory population/depth bound exceeded' "$work/directory-bound.log" >/dev/null
printf '%s\n' 'receiver archive package test: passed'
