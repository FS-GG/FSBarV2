#!/usr/bin/env python3
"""Keep verified, content-addressed snapshots of a live BAR knowledge store.

Each cycle fingerprints the allowlisted knowledge tables of the live store in one read
transaction. A changed fingerprint becomes a new verified snapshot; an unchanged one creates
nothing. Retention keeps the current snapshot and at most three older ones. Only the knowledge
tables are copied, so any source-search index in the live store stays excluded. Every cycle
re-verifies all retained snapshots; unreadable or corrupt state is quarantined and alerted, never
a crash loop. State writes are fsynced (file and directory) before and after publication.
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
LEAF_FILES = SNAPSHOT_FILES | {"bar.sqlite-wal", "bar.sqlite-shm", "bar.sqlite-journal"}
FTS_SHADOW = ("_data", "_idx", "_content", "_docsize", "_config")
SNAPSHOT_TABLES = set(KNOWLEDGE.TABLES) | {"knowledge_fts", "chapter_fts"} | \
    {f"{fts}{suffix}" for fts in ("knowledge_fts", "chapter_fts") for suffix in FTS_SHADOW}
STATUS_FIELDS = ("schema", "cycleUtc", "intervalSeconds", "retainedVersions", "olderVersions", "pending", "staged",
                 "quarantined", "alerts", "lastError", "lastFailureUtc", "liveAllocatedBytes", "backupAllocatedBytes")
ERRORS = (ValueError, OSError, sqlite3.Error, KeyError, json.JSONDecodeError)
fail = KNOWLEDGE.fail


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def fsync_dir(path):
    fd = os.open(path, os.O_RDONLY | os.O_DIRECTORY)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def write_durable(path, data, mode=0o600):
    # Write, fsync the file, atomically replace, then fsync the directory entry.
    temporary = path.with_name("." + path.name + ".tmp")
    fd = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, mode)
    try:
        os.write(fd, data)
        os.fchmod(fd, mode)
        os.fsync(fd)
    finally:
        os.close(fd)
    os.replace(temporary, path)
    fsync_dir(path.parent)


def read_json(path):
    """Return the parsed file, or None when it is missing, empty or unreadable."""
    try:
        return json.loads(path.read_text())
    except (OSError, ValueError):
        return None


def layout(root):
    if root.is_symlink() or not root.is_dir():
        fail("keeper root must be an existing directory")
    paths = {name: root / name for name in ("snapshots", "pending", "trash", "quarantine")}
    for path in paths.values():
        if path.is_symlink():
            fail(f"keeper directory symlink refused: {path.name}")
        path.mkdir(mode=0o700, exist_ok=True)
    return paths


def allocated(path):
    return path.stat().st_blocks * 512


def entries(path):
    with os.scandir(path) as listing:
        return list(listing)


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
        tables = {row[0] for row in connection.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        if tables != SNAPSHOT_TABLES:
            fail("snapshot table allowlist mismatch")
        for table in ("knowledge_fts", "chapter_fts"):
            connection.execute(f"INSERT INTO {table}({table}) VALUES ('integrity-check')")
        if fingerprint(connection) != expected:
            fail("snapshot fingerprint mismatch")
    finally:
        connection.close()


def snapshot(live, paths, expected, sequence):
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
    fd = os.open(database, os.O_RDONLY)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)
    record = {"schema": SCHEMA, "fingerprint": expected, "sequence": sequence, "createdUtc": now(),
              "createdNs": time.time_ns(), "verified": True, "allocatedBytes": allocated(database)}
    write_durable(staging / "snapshot.json", (json.dumps(record, indent=2) + "\n").encode())
    os.rename(staging, paths["snapshots"] / expected)
    fsync_dir(paths["pending"])
    fsync_dir(paths["snapshots"])
    return record


def quarantine(paths, name, reason):
    target = paths["quarantine"] / name
    if target.exists():
        target = paths["quarantine"] / f"{name}.{time.time_ns()}"
    os.rename(paths["snapshots"] / name, target)
    fsync_dir(paths["snapshots"])
    fsync_dir(paths["quarantine"])
    return f"quarantined snapshot {name[:12]}: {reason}"


def snapshots(paths, recheck=False):
    """Return the retained, readable snapshot records and alerts for any quarantined ones."""
    records, alerts = [], []
    for entry in entries(paths["snapshots"]):
        if entry.is_symlink() or not entry.is_dir(follow_symlinks=False) or not SNAPSHOT_NAME.fullmatch(entry.name):
            fail(f"unexpected snapshot entry refused: {entry.name}")
        record = read_json(Path(entry.path) / "snapshot.json")
        if not isinstance(record, dict) or record.get("fingerprint") != entry.name or record.get("verified") is not True:
            alerts.append(quarantine(paths, entry.name, "unreadable or unverified snapshot.json"))
            continue
        if recheck:
            try:
                verify(Path(entry.path) / "bar.sqlite", entry.name)
            except (ValueError, OSError, sqlite3.Error) as error:
                alerts.append(quarantine(paths, entry.name, str(error)))
                continue
        records.append(record)
    # Snapshots from before sequence numbers order by creation time, ahead of sequenced ones.
    return sorted(records, key=lambda record: (record.get("sequence", 0), record["createdNs"])), alerts


def remove_snapshot_dir(path):
    # Allowlisted, descriptor-relative removal: only the known leaf files of one directory.
    fd = os.open(path, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        for name in os.listdir(fd):
            if name not in LEAF_FILES:
                fail(f"unexpected file in snapshot refused: {name}")
            if os.stat(name, dir_fd=fd, follow_symlinks=False).st_nlink != 1 or os.path.islink(os.path.join(path, name)):
                fail(f"linked snapshot file refused: {name}")
            os.unlink(name, dir_fd=fd)
    finally:
        os.close(fd)
    os.rmdir(path)
    fsync_dir(path.parent)


def recover(paths):
    # Resume interrupted cycles: unpublished snapshots are discarded, staged deletions finish.
    observed = {}
    for name in ("pending", "trash"):
        found = entries(paths[name])
        observed[name] = len(found)
        for entry in found:
            if entry.is_symlink() or not entry.is_dir(follow_symlinks=False) or not SNAPSHOT_NAME.fullmatch(entry.name):
                fail(f"unexpected {name} entry refused: {entry.name}")
            remove_snapshot_dir(Path(entry.path))
    return observed


def prune(paths, current):
    records, _ = snapshots(paths)
    older = [record for record in records if record["fingerprint"] != current]
    for record in older[:max(0, len(older) - OLDER_VERSIONS)]:
        staged = paths["trash"] / record["fingerprint"]
        os.rename(paths["snapshots"] / record["fingerprint"], staged)
        fsync_dir(paths["snapshots"])
        remove_snapshot_dir(staged)


def write_health(root, record, status_dir):
    write_durable(root / "health.json", (json.dumps(record, indent=2) + "\n").encode())
    if status_dir:
        # Counts-only copy for unprivileged readback; no store content or paths.
        status = {key: record.get(key) for key in STATUS_FIELDS}
        write_durable(status_dir / "health.json", (json.dumps(status, indent=2) + "\n").encode(), 0o644)


def cycle(live, root, status_dir=None):
    if live.is_symlink() or not live.is_file():
        fail("live store must be an existing regular file")
    paths = layout(root)
    with open(root / "keeper.lock", "a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        alerts = []
        recovered = recover(paths)
        if recovered["pending"] or recovered["trash"]:
            alerts.append(f"recovered interrupted cycle (pending {recovered['pending']}, staged {recovered['trash']})")
        previous = read_json(root / "health.json")
        if (root / "health.json").exists() and not isinstance(previous, dict):
            alerts.append("previous health.json unreadable; baseline reset")
        previous = previous if isinstance(previous, dict) else {}
        connection = KNOWLEDGE.readonly(live)
        try:
            connection.execute("BEGIN")
            current = fingerprint(connection)
            payload = source_bytes(connection)
        finally:
            connection.close()
        records, quarantined = snapshots(paths, recheck=True)
        alerts += quarantined
        created = None
        last_sequence = max([record.get("sequence", 0) for record in records] + [previous.get("lastSequence", 0)])
        if current not in {record["fingerprint"] for record in records}:
            last_sequence += 1
            created = snapshot(live, paths, current, last_sequence)["fingerprint"]
        prune(paths, current)
        records, _ = snapshots(paths)
        live_bytes = allocated(live)
        baseline = previous.get("baseline") or {"liveAllocatedBytes": live_bytes,
                                                 "sourceRatio": live_bytes / max(payload, 1),
                                                 "setUtc": now(), "reason": "initial"}
        if live_bytes - baseline["liveAllocatedBytes"] >= GROWTH_BYTES and live_bytes >= GROWTH_RATIO * baseline["liveAllocatedBytes"]:
            alerts.append("live store allocated growth")
        if live_bytes / max(payload, 1) > SOURCE_RATIO * baseline["sourceRatio"]:
            alerts.append("database-to-source payload ratio")
        if current not in {record["fingerprint"] for record in records}:
            alerts.append("current version has no verified snapshot")
        quarantine_count = len(entries(paths["quarantine"]))
        if quarantine_count:
            alerts.append(f"{quarantine_count} quarantined snapshot(s) await review and acknowledge")
        health = {"schema": SCHEMA, "cycleUtc": now(), "intervalSeconds": INTERVAL,
                  "currentFingerprint": current, "createdSnapshot": created,
                  "retainedVersions": len(records), "olderVersions": len(records) - 1,
                  "pending": len(os.listdir(paths["pending"])), "staged": len(os.listdir(paths["trash"])),
                  "recoveredThisCycle": recovered, "quarantined": quarantine_count,
                  "alerts": alerts, "lastError": None, "lastFailureUtc": previous.get("lastFailureUtc"),
                  "liveAllocatedBytes": live_bytes,
                  "backupAllocatedBytes": sum(record["allocatedBytes"] for record in records),
                  "baseline": baseline, "baselineHistory": previous.get("baselineHistory", []),
                  "lastSequence": last_sequence}
        write_health(root, health, status_dir)
        return health


def record_failure(root, error, status_dir=None):
    # A failed cycle is visible in health instead of only as a stale timestamp.
    record = read_json(root / "health.json")
    record = record if isinstance(record, dict) else {"schema": SCHEMA, "alerts": []}
    record["lastError"] = str(error)[:500]
    record["lastFailureUtc"] = now()
    try:
        write_health(root, record, status_dir)
    except OSError:
        pass


def acknowledge(live, root, reason, status_dir=None):
    """Rebaseline growth/ratio to the current store and clear reviewed quarantine entries."""
    if not reason.strip():
        fail("acknowledge requires a reason")
    paths = layout(root)
    with open(root / "keeper.lock", "a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        record = read_json(root / "health.json")
        record = record if isinstance(record, dict) else {"schema": SCHEMA}
        connection = KNOWLEDGE.readonly(live)
        try:
            payload = source_bytes(connection)
        finally:
            connection.close()
        live_bytes = allocated(live)
        history = record.get("baselineHistory", [])
        history.append({"previous": record.get("baseline"), "acknowledgedUtc": now(), "reason": reason[:500],
                        "alerts": record.get("alerts", []), "quarantined": len(entries(paths["quarantine"]))})
        record["baseline"] = {"liveAllocatedBytes": live_bytes, "sourceRatio": live_bytes / max(payload, 1),
                              "setUtc": now(), "reason": reason[:500]}
        record["baselineHistory"] = history[-20:]
        for entry in entries(paths["quarantine"]):
            if entry.is_symlink() or not entry.is_dir(follow_symlinks=False):
                fail(f"unexpected quarantine entry refused: {entry.name}")
            remove_snapshot_dir(Path(entry.path))
        record["alerts"] = []
        record["quarantined"] = 0
        write_health(root, record, status_dir)
        return record


def health(root, max_age, status_file=None):
    """Readback. From private state, pending/staged/quarantine are listed live, not copied."""
    record = read_json(status_file or root / "health.json")
    if not isinstance(record, dict) or "cycleUtc" not in record:
        return {"healthy": False, "reason": "health record missing or unreadable"}
    if status_file is None:
        counts = {}
        for key, name in (("pending", "pending"), ("staged", "trash"), ("quarantined", "quarantine")):
            counts[key] = len(os.listdir(root / name)) if (root / name).is_dir() else 0
        record.update(counts)
    age = (datetime.datetime.now(datetime.timezone.utc) - datetime.datetime.fromisoformat(record["cycleUtc"])).total_seconds()
    failed_since = bool(record.get("lastFailureUtc")) and record["lastFailureUtc"] > record["cycleUtc"]
    record["ageSeconds"] = round(age)
    record["healthy"] = (record.get("pending") == 0 and record.get("staged") == 0 and not record.get("quarantined")
                         and not record.get("alerts") and not failed_since
                         and record.get("olderVersions", 99) <= OLDER_VERSIONS and age <= max_age)
    return record


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--status-dir", type=Path, help="also write a counts-only, world-readable health copy here")
    commands = parser.add_subparsers(dest="command", required=True)
    for command in ("once", "run"):
        commands.add_parser(command).add_argument("--live", type=Path, required=True)
    ack = commands.add_parser("acknowledge")
    ack.add_argument("--live", type=Path, required=True)
    ack.add_argument("--reason", required=True)
    check = commands.add_parser("health")
    check.add_argument("--max-age", type=int, default=2 * INTERVAL + 300)
    check.add_argument("--status-file", type=Path, help="read the counts-only copy instead of the private state")
    args = parser.parse_args()
    try:
        if args.command == "health":
            result = health(args.root, args.max_age, args.status_file)
            print(json.dumps(result, indent=2))
            return 0 if result["healthy"] else 1
        if args.command == "acknowledge":
            print(json.dumps(acknowledge(args.live, args.root, args.reason, args.status_dir), indent=2))
            return 0
    except ERRORS as error:
        print(f"bar knowledge keeper failed: {error}", file=sys.stderr)
        return 2
    while True:
        try:
            print(json.dumps(cycle(args.live, args.root, args.status_dir)), flush=True)
        except BlockingIOError as error:
            print(f"bar knowledge keeper: another cycle holds the lock: {error}", file=sys.stderr)
        except ERRORS as error:
            # Record and keep cycling: a bad cycle must not become a restart loop.
            print(f"bar knowledge keeper cycle failed: {error}", file=sys.stderr)
            record_failure(args.root, error, args.status_dir)
            if args.command == "once":
                return 2
        if args.command == "once":
            return 0
        time.sleep(INTERVAL)


if __name__ == "__main__":
    sys.exit(main())
