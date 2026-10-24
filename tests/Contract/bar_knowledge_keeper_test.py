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


if __name__ == "__main__":
    unittest.main()
