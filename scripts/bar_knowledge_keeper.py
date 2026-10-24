#!/usr/bin/env python3
"""Keep verified, content-addressed snapshots of a live BAR knowledge store.

Each cycle fingerprints the allowlisted knowledge tables of the live store. A changed
fingerprint becomes a new verified snapshot; an unchanged one creates nothing. Retention
keeps the current snapshot and at most three older ones. Only the knowledge tables are
copied, so any source-search index in the live store stays excluded.
"""
import argparse
import datetime
import fcntl
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import sqlite3
import sys
import time

SPEC = importlib.util.spec_from_file_location("bar_knowledge", Path(__file__).resolve().with_name("bar_knowledge.py"))
KNOWLEDGE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(KNOWLEDGE)

SCHEMA = "fsgg.knowledge.bar-keeper/1"
INTERVAL = 1800
OLDER_VERSIONS = 3
GROWTH_BYTES = 256 * 1024 * 1024
GROWTH_RATIO = 1.25
SOURCE_RATIO = 1.5
SNAPSHOT_NAME = re.compile("[0-9a-f]{64}")
SNAPSHOT_FILES = {"bar.sqlite", "snapshot.json"}
fail = KNOWLEDGE.fail


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def layout(root):
    if root.is_symlink() or not root.is_dir():
        fail("keeper root must be an existing directory")
    paths = {name: root / name for name in ("snapshots", "pending", "trash")}
    for path in paths.values():
        if path.is_symlink():
            fail(f"keeper directory symlink refused: {path.name}")
        path.mkdir(mode=0o700, exist_ok=True)
    return paths


def allocated(path):
    return path.stat().st_blocks * 512


def fingerprint(connection):
    # Logical content identity: the same rows give the same fingerprint regardless of
    # page layout, vacuum state or WAL, so unchanged cycles consume no history.
    digest = hashlib.sha256()
    for table in sorted(KNOWLEDGE.TABLES):
        names = KNOWLEDGE.columns(table)
        rows = [dict(zip(names, row)) for row in connection.execute(f"SELECT {','.join(names)} FROM {table}")]
        digest.update(KNOWLEDGE.canonical({"table": table, "rows": sorted(rows, key=KNOWLEDGE.canonical)}).encode())
    return digest.hexdigest()


def source_bytes(connection):
    return sum(connection.execute(f"SELECT COALESCE(SUM(LENGTH(CAST(document AS BLOB))), 0) FROM {table}").fetchone()[0]
               for table in ("knowledge_documents", "chapter_documents"))


def verify(database, expected):
    # Read-write open only because FTS5 integrity-check is issued as an INSERT; it changes nothing.
    if database.is_symlink() or not database.is_file():
        fail("snapshot must be a regular file")
    connection = sqlite3.connect(database.resolve().as_uri() + "?mode=rw", uri=True)
    try:
        if connection.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
            fail("snapshot integrity check failed")
        if connection.execute("PRAGMA foreign_key_check").fetchall():
            fail("snapshot foreign key check failed")
        if set(KNOWLEDGE.TABLES) != {row[0] for row in connection.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '%fts%'")}:
            fail("snapshot table allowlist mismatch")
        for table in ("knowledge_fts", "chapter_fts"):
            connection.execute(f"INSERT INTO {table}({table}) VALUES ('integrity-check')")
        if fingerprint(connection) != expected:
            fail("snapshot fingerprint mismatch")
    finally:
        connection.close()


def snapshot(live, paths, expected):
    staging = paths["pending"] / expected
    if staging.exists() or staging.is_symlink():
        fail("pending snapshot already exists")
    staging.mkdir(mode=0o700)
    database = staging / "bar.sqlite"
    source = KNOWLEDGE.readonly(live)
    target = sqlite3.connect(database)
    try:
        KNOWLEDGE.create_database(target)
        source.execute("BEGIN")
        with target:
            for table in KNOWLEDGE.TABLES:
                names = KNOWLEDGE.columns(table)
                rows = source.execute(f"SELECT {','.join(names)} FROM {table}")
                target.executemany(f"INSERT INTO {table} VALUES ({','.join('?' for _ in names)})", rows)
            target.execute("INSERT INTO knowledge_fts SELECT item_digest,item_id,title,statement FROM knowledge_items")
            target.execute("INSERT INTO chapter_fts(rowid,document_digest,item_id,title,body) SELECT rowid,document_digest,item_id,title,body FROM chapter_items")
        if fingerprint(source) != expected:
            fail("live store changed during snapshot; retry next cycle")
    finally:
        source.close()
        target.close()
    verify(database, expected)
    record = {"schema": SCHEMA, "fingerprint": expected, "createdUtc": now(), "createdNs": time.time_ns(),
              "verified": True, "allocatedBytes": allocated(database)}
    (staging / "snapshot.json").write_text(json.dumps(record, indent=2) + "\n")
    os.rename(staging, paths["snapshots"] / expected)
    return record


def snapshots(paths):
    result = []
    with os.scandir(paths["snapshots"]) as entries:
        entries = list(entries)
    for entry in entries:
        if entry.is_symlink() or not entry.is_dir(follow_symlinks=False) or not SNAPSHOT_NAME.fullmatch(entry.name):
            fail(f"unexpected snapshot entry refused: {entry.name}")
        record = json.loads((Path(entry.path) / "snapshot.json").read_text())
        if record.get("fingerprint") != entry.name or record.get("verified") is not True:
            fail(f"unverified snapshot refused: {entry.name}")
        result.append(record)
    return sorted(result, key=lambda record: record["createdNs"])


def remove_snapshot_dir(path):
    # Allowlisted, descriptor-relative removal: only the known leaf files of one directory.
    fd = os.open(path, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        for name in os.listdir(fd):
            if name not in SNAPSHOT_FILES | {"bar.sqlite-wal", "bar.sqlite-shm", "bar.sqlite-journal"}:
                fail(f"unexpected file in snapshot refused: {name}")
            if os.stat(name, dir_fd=fd, follow_symlinks=False).st_nlink != 1 or os.path.islink(os.path.join(path, name)):
                fail(f"linked snapshot file refused: {name}")
            os.unlink(name, dir_fd=fd)
    finally:
        os.close(fd)
    os.rmdir(path)


def recover(paths):
    # Resume interrupted cycles: unpublished snapshots are discarded, staged deletions finish.
    for name in ("pending", "trash"):
        with os.scandir(paths[name]) as entries:
            entries = list(entries)
        for entry in entries:
            if entry.is_symlink() or not entry.is_dir(follow_symlinks=False) or not SNAPSHOT_NAME.fullmatch(entry.name):
                fail(f"unexpected {name} entry refused: {entry.name}")
            remove_snapshot_dir(Path(entry.path))


def prune(paths, current):
    records = snapshots(paths)
    older = [record for record in records if record["fingerprint"] != current]
    for record in older[:max(0, len(older) - OLDER_VERSIONS)]:
        staged = paths["trash"] / record["fingerprint"]
        os.rename(paths["snapshots"] / record["fingerprint"], staged)
        remove_snapshot_dir(staged)


def cycle(live, root):
    if live.is_symlink() or not live.is_file():
        fail("live store must be an existing regular file")
    paths = layout(root)
    with open(root / "keeper.lock", "a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        recover(paths)
        previous = json.loads((root / "health.json").read_text()) if (root / "health.json").exists() else {}
        connection = KNOWLEDGE.readonly(live)
        try:
            current = fingerprint(connection)
            payload = source_bytes(connection)
        finally:
            connection.close()
        created = None
        if not (paths["snapshots"] / current).exists():
            created = snapshot(live, paths, current)["fingerprint"]
        prune(paths, current)
        records = snapshots(paths)
        live_bytes = allocated(live)
        baseline = previous.get("baseline") or {"liveAllocatedBytes": live_bytes,
                                                 "sourceRatio": live_bytes / max(payload, 1)}
        alerts = []
        if live_bytes - baseline["liveAllocatedBytes"] >= GROWTH_BYTES and live_bytes >= GROWTH_RATIO * baseline["liveAllocatedBytes"]:
            alerts.append("live store allocated growth")
        if live_bytes / max(payload, 1) > SOURCE_RATIO * baseline["sourceRatio"]:
            alerts.append("database-to-source payload ratio")
        if current not in {record["fingerprint"] for record in records}:
            alerts.append("current version has no verified snapshot")
        health = {"schema": SCHEMA, "cycleUtc": now(), "intervalSeconds": INTERVAL,
                  "currentFingerprint": current, "createdSnapshot": created,
                  "retainedVersions": len(records), "olderVersions": len(records) - 1,
                  "pending": len(os.listdir(paths["pending"])),
                  "staged": len(os.listdir(paths["trash"])),
                  "alerts": alerts, "liveAllocatedBytes": live_bytes,
                  "backupAllocatedBytes": sum(record["allocatedBytes"] for record in records),
                  "baseline": baseline}
        temporary = root / ".health.json.tmp"
        temporary.write_text(json.dumps(health, indent=2) + "\n")
        os.replace(temporary, root / "health.json")
        return health


def health(root, max_age):
    record = json.loads((root / "health.json").read_text())
    age = (datetime.datetime.now(datetime.timezone.utc) - datetime.datetime.fromisoformat(record["cycleUtc"])).total_seconds()
    record["ageSeconds"] = round(age)
    record["healthy"] = (record["pending"] == 0 and record["staged"] == 0 and not record["alerts"]
                         and record["olderVersions"] <= OLDER_VERSIONS and age <= max_age)
    return record


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, required=True)
    commands = parser.add_subparsers(dest="command", required=True)
    for command in ("once", "run"):
        commands.add_parser(command).add_argument("--live", type=Path, required=True)
    commands.add_parser("health").add_argument("--max-age", type=int, default=2 * INTERVAL + 300)
    args = parser.parse_args()
    try:
        if args.command == "health":
            result = health(args.root, args.max_age)
            print(json.dumps(result, indent=2))
            return 0 if result["healthy"] else 1
        while True:
            print(json.dumps(cycle(args.live, args.root)), flush=True)
            if args.command == "once":
                return 0
            time.sleep(INTERVAL)
    except (ValueError, OSError, sqlite3.Error, KeyError, json.JSONDecodeError) as error:
        print(f"bar knowledge keeper failed: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
