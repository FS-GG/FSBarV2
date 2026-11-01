#!/usr/bin/env python3
"""Verify the pinned copies of FS.GG.Game renderer sources (GAME-RENDER-ADOPT-01.8).

Default: every file named in eng/game-render/pin.env exists with the pinned sha256, and the pinned directories
hold no other file. No network.

--against-upstream: also fetch each file at UPSTREAM_COMMIT from the public upstream repository and require
identical bytes, so a recorded sha256 cannot drift from the commit it claims.
"""
import hashlib
import pathlib
import sys
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
PIN = ROOT / "eng" / "game-render" / "pin.env"


def parse():
    values, files, directories = {}, {}, []
    for raw in PIN.read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        key, _, value = line.partition("=")
        if key.startswith("FILE_"):
            local, upstream, digest = value.split()
            files[key[len("FILE_"):]] = (local, upstream, digest)
        elif key == "DIRECTORY":
            directories.append(value)
        else:
            values[key] = value
    return values, files, directories


def main(argv):
    values, files, directories = parse()
    problems = []
    pinned = {ROOT / local for local, _, _ in files.values()}
    for directory in directories:
        for path in sorted(p for p in (ROOT / directory).rglob("*") if p.is_file()):
            if path not in pinned:
                problems.append(f"unpinned file in {directory}: {path.name}")
    for name, (local, upstream, digest) in sorted(files.items()):
        path = ROOT / local
        if not path.is_file():
            problems.append(f"missing pinned file: {local}")
            continue
        data = path.read_bytes()
        actual = hashlib.sha256(data).hexdigest()
        if actual != digest:
            problems.append(f"{local}: sha256 {actual} is not the pinned {digest}")
        if "--against-upstream" in argv:
            url = f"https://raw.githubusercontent.com/{values['UPSTREAM_REPOSITORY']}/{values['UPSTREAM_COMMIT']}/{upstream}"
            with urllib.request.urlopen(url, timeout=60) as response:
                remote = response.read()
            if remote != data:
                problems.append(f"{local}: differs from {url}")
    if problems:
        print("\n".join(problems), file=sys.stderr)
        return 1
    print(f"game-render pin ok: {len(files)} files at {values['UPSTREAM_COMMIT'][:12]}")
    return 0


sys.exit(main(sys.argv[1:]))
