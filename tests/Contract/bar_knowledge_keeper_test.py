"""Keeper snapshots, retention, exclusion, recovery and health on a restored real archive."""
import importlib.util
from contextlib import closing
import json
import os
from pathlib import Path
import sqlite3
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("bar_knowledge_keeper", ROOT / "scripts/bar_knowledge_keeper.py")
KEEPER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(KEEPER)
KNOWLEDGE = KEEPER.KNOWLEDGE


class Keeper(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        base = Path(self.directory.name)
        self.live = base / "live/bar.sqlite"
        KNOWLEDGE.restore(ROOT / "docs/knowledge/bar", self.live)
        self.root = base / "keeper"
        self.root.mkdir()

    def tearDown(self):
        self.directory.cleanup()

    def change(self, marker):
        # A new chapter document row changes the logical content without touching history.
        with closing(sqlite3.connect(self.live)) as connection, connection:
            connection.execute("INSERT INTO chapter_documents VALUES (?,?,?,?,?,?)",
                               (KNOWLEDGE.sha(marker.encode()), "2026-10-24", "keeper-test", marker, "test", marker))

    def snapshot_names(self):
        return sorted(os.listdir(self.root / "snapshots"))

    def test_first_cycle_creates_one_verified_snapshot_and_healthy_readback(self):
        health = KEEPER.cycle(self.live, self.root)
        self.assertEqual((health["retainedVersions"], health["pending"], health["staged"], health["alerts"]), (1, 0, 0, []))
        self.assertEqual(self.snapshot_names(), [health["currentFingerprint"]])
        self.assertTrue(KEEPER.health(self.root, 3900)["healthy"])

    def test_unchanged_content_creates_no_new_snapshot(self):
        first = KEEPER.cycle(self.live, self.root)
        with closing(sqlite3.connect(self.live)) as connection:
            connection.execute("VACUUM")
        second = KEEPER.cycle(self.live, self.root)
        self.assertIsNone(second["createdSnapshot"])
        self.assertEqual(second["currentFingerprint"], first["currentFingerprint"])
        self.assertEqual(len(self.snapshot_names()), 1)

    def test_retention_keeps_current_and_at_most_three_older(self):
        fingerprints = [KEEPER.cycle(self.live, self.root)["currentFingerprint"]]
        for number in range(5):
            self.change(f"version-{number}")
            fingerprints.append(KEEPER.cycle(self.live, self.root)["currentFingerprint"])
        health = KEEPER.cycle(self.live, self.root)
        self.assertEqual((health["retainedVersions"], health["olderVersions"]), (4, 3))
        self.assertEqual(self.snapshot_names(), sorted(fingerprints[-4:]))
        self.assertEqual(health["currentFingerprint"], fingerprints[-1])

    def test_source_index_is_excluded_from_snapshots(self):
        with closing(sqlite3.connect(self.live)) as connection, connection:
            connection.execute("CREATE TABLE source_index (path TEXT, body TEXT)")
            connection.execute("INSERT INTO source_index VALUES ('x', ?)", ("y" * 4096,))
        health = KEEPER.cycle(self.live, self.root)
        snapshot = self.root / "snapshots" / health["currentFingerprint"] / "bar.sqlite"
        with closing(sqlite3.connect(snapshot)) as connection:
            names = {row[0] for row in connection.execute("SELECT name FROM sqlite_master")}
        self.assertNotIn("source_index", names)

    def test_interrupted_pending_and_staged_entries_are_recovered(self):
        KEEPER.cycle(self.live, self.root)
        for name in ("pending", "trash"):
            leftover = self.root / name / ("a" * 64 if name == "pending" else "b" * 64)
            leftover.mkdir()
            (leftover / "bar.sqlite").write_bytes(b"partial")
        health = KEEPER.cycle(self.live, self.root)
        self.assertEqual((health["pending"], health["staged"]), (0, 0))

    def test_unexpected_entries_and_symlinks_are_refused(self):
        KEEPER.cycle(self.live, self.root)
        (self.root / "snapshots/not-a-fingerprint").mkdir()
        with self.assertRaisesRegex(ValueError, "unexpected snapshot entry"):
            KEEPER.cycle(self.live, self.root)
        os.rmdir(self.root / "snapshots/not-a-fingerprint")
        victim = Path(self.directory.name) / "victim"
        victim.mkdir()
        (victim / "keep").write_text("keep")
        os.symlink(victim, self.root / "trash" / ("c" * 64))
        with self.assertRaisesRegex(ValueError, "unexpected trash entry"):
            KEEPER.cycle(self.live, self.root)
        self.assertTrue((victim / "keep").exists())

    def test_tampered_snapshot_fails_verification(self):
        health = KEEPER.cycle(self.live, self.root)
        snapshot = self.root / "snapshots" / health["currentFingerprint"] / "bar.sqlite"
        with closing(sqlite3.connect(snapshot)) as connection, connection:
            connection.execute("DELETE FROM knowledge_items WHERE rowid IN (SELECT rowid FROM knowledge_items LIMIT 1)")
        with self.assertRaisesRegex(ValueError, "fingerprint mismatch"):
            KEEPER.verify(snapshot, health["currentFingerprint"])

    def test_growth_alert_and_stale_health_are_unhealthy(self):
        health = KEEPER.cycle(self.live, self.root)
        record = json.loads((self.root / "health.json").read_text())
        record["baseline"]["liveAllocatedBytes"] = 1
        record["baseline"]["sourceRatio"] = record["baseline"]["sourceRatio"] / 2
        (self.root / "health.json").write_text(json.dumps(record))
        with closing(sqlite3.connect(self.live)) as connection, connection:
            connection.execute("CREATE TABLE padding (body BLOB)")
            connection.execute("INSERT INTO padding VALUES (zeroblob(?))", (300 * 1024 * 1024,))
        alerted = KEEPER.cycle(self.live, self.root)
        self.assertIn("live store allocated growth", alerted["alerts"])
        self.assertIn("database-to-source payload ratio", alerted["alerts"])
        self.assertFalse(KEEPER.health(self.root, 3900)["healthy"])
        self.assertEqual(health["alerts"], [])
        record = json.loads((self.root / "health.json").read_text())
        record["alerts"] = []
        record["cycleUtc"] = "2026-01-01T00:00:00+00:00"
        (self.root / "health.json").write_text(json.dumps(record))
        self.assertFalse(KEEPER.health(self.root, 3900)["healthy"])

    def test_health_reports_live_leftovers_and_failed_cycles(self):
        KEEPER.cycle(self.live, self.root)
        leftover = self.root / "pending" / ("d" * 64)
        leftover.mkdir()
        (leftover / "bar.sqlite").write_bytes(b"partial")
        live = KEEPER.health(self.root, 3900)
        self.assertEqual(live["pending"], 1)
        self.assertFalse(live["healthy"])
        health = KEEPER.cycle(self.live, self.root)
        self.assertEqual(health["recoveredThisCycle"], {"pending": 1, "trash": 0})
        self.assertTrue(any("recovered interrupted cycle" in alert for alert in health["alerts"]))
        KEEPER.record_failure(self.root, ValueError("injected"))
        failed = KEEPER.health(self.root, 3900)
        self.assertEqual(failed["lastError"], "injected")
        self.assertFalse(failed["healthy"])

    def test_crash_mid_snapshot_leaves_no_published_partial(self):
        KEEPER.cycle(self.live, self.root)
        self.change("crash")
        original = KEEPER.write_durable
        def crash(path, data, mode=0o600):
            if path.name == "snapshot.json":
                raise OSError("injected crash before publication")
            return original(path, data, mode)
        KEEPER.write_durable = crash
        try:
            with self.assertRaises(OSError):
                KEEPER.cycle(self.live, self.root)
        finally:
            KEEPER.write_durable = original
        self.assertEqual(len(self.snapshot_names()), 1)
        self.assertEqual(len(os.listdir(self.root / "pending")), 1)
        health = KEEPER.cycle(self.live, self.root)
        self.assertEqual((health["pending"], health["retainedVersions"]), (0, 2))

    def test_unreadable_health_and_snapshot_state_self_heal(self):
        first = KEEPER.cycle(self.live, self.root)
        (self.root / "health.json").write_text("")
        (self.root / "snapshots" / first["currentFingerprint"] / "snapshot.json").write_text("")
        health = KEEPER.cycle(self.live, self.root)
        self.assertIn("previous health.json unreadable; baseline reset", health["alerts"])
        self.assertTrue(any(alert.startswith("quarantined snapshot") for alert in health["alerts"]))
        self.assertEqual(health["createdSnapshot"], first["currentFingerprint"])
        self.assertEqual(health["quarantined"], 1)
        self.assertFalse(KEEPER.health(self.root, 3900)["healthy"])

    def test_corrupt_retained_snapshot_is_reverified_quarantined_and_recreated(self):
        first = KEEPER.cycle(self.live, self.root)
        database = self.root / "snapshots" / first["currentFingerprint"] / "bar.sqlite"
        database.write_bytes(b"garbage" * 1000)
        health = KEEPER.cycle(self.live, self.root)
        self.assertTrue(any("quarantined snapshot" in alert for alert in health["alerts"]))
        self.assertEqual(health["createdSnapshot"], first["currentFingerprint"])
        KEEPER.verify(self.root / "snapshots" / first["currentFingerprint"] / "bar.sqlite", first["currentFingerprint"])

    def test_acknowledge_rebaselines_and_clears_quarantine_with_reason(self):
        first = KEEPER.cycle(self.live, self.root)
        (self.root / "snapshots" / first["currentFingerprint"] / "bar.sqlite").write_bytes(b"x")
        KEEPER.cycle(self.live, self.root)
        with self.assertRaises(ValueError):
            KEEPER.acknowledge(self.live, self.root, " ")
        record = KEEPER.acknowledge(self.live, self.root, "reviewed injected corruption")
        self.assertEqual((record["alerts"], record["quarantined"]), ([], 0))
        self.assertEqual(record["baselineHistory"][-1]["reason"], "reviewed injected corruption")
        self.assertEqual(os.listdir(self.root / "quarantine"), [])
        self.assertEqual(KEEPER.cycle(self.live, self.root)["alerts"], [])

    def test_counts_only_status_copy_is_world_readable(self):
        status = Path(self.directory.name) / "status"
        status.mkdir()
        KEEPER.cycle(self.live, self.root, status)
        copy = status / "health.json"
        self.assertEqual(copy.stat().st_mode & 0o777, 0o644)
        record = json.loads(copy.read_text())
        self.assertEqual(set(record), set(KEEPER.STATUS_FIELDS))
        self.assertNotIn("currentFingerprint", record)
        self.assertTrue(KEEPER.health(self.root, 3900, copy)["healthy"])

    def test_retention_order_uses_sequence_not_wall_clock(self):
        fingerprints = [KEEPER.cycle(self.live, self.root)["currentFingerprint"]]
        for number in range(4):
            self.change(f"seq-{number}")
            fingerprints.append(KEEPER.cycle(self.live, self.root)["currentFingerprint"])
        records, _ = KEEPER.snapshots(KEEPER.layout(self.root))
        self.assertEqual([record["sequence"] for record in records], [2, 3, 4, 5])
        newest = self.root / "snapshots" / fingerprints[-1] / "snapshot.json"
        record = json.loads(newest.read_text())
        record["createdNs"] = 1  # a backwards wall-clock step must not make the newest look oldest
        newest.write_text(json.dumps(record))
        self.change("seq-final")
        KEEPER.cycle(self.live, self.root)
        self.assertIn(fingerprints[-1], self.snapshot_names())


if __name__ == "__main__":
    unittest.main()
