"""Fresh restore, history retention and corruption refusal for the real archive."""
import importlib.util
from contextlib import closing
import json
from pathlib import Path
import shutil
import sqlite3
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location("bar_knowledge", ROOT / "scripts/bar_knowledge.py")
KNOWLEDGE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(KNOWLEDGE)


class KnowledgeRestore(unittest.TestCase):
    def test_fresh_restore_preserves_every_record_and_history_without_sources(self):
        archive = ROOT / "docs/knowledge/bar"
        catalog, documents = KNOWLEDGE.load(archive)
        with tempfile.TemporaryDirectory() as directory:
            database = Path(directory) / "knowledge.sqlite"
            result = KNOWLEDGE.restore(archive, database)
            self.assertLess(result["databaseBytes"], 10 * 1024 * 1024)
            with closing(sqlite3.connect(database)) as connection:
                connection.row_factory = sqlite3.Row
                self.assertEqual(connection.execute("PRAGMA integrity_check").fetchone()[0], "ok")
                self.assertNotIn("files", {r[0] for r in connection.execute("SELECT name FROM sqlite_master")})
                for table, archived in catalog["tables"].items():
                    restored = [dict(row) for row in connection.execute(f"SELECT * FROM {table}")]
                    if table.endswith("_documents"):
                        for row in restored:
                            self.assertEqual(row.pop("document").encode(), documents[row["digest"]])
                    self.assertEqual(sorted(restored, key=KNOWLEDGE.canonical), sorted(archived, key=KNOWLEDGE.canonical))
            history = KNOWLEDGE.query(database, "question.next-native-stock-gates", history=True)["history"]
            self.assertGreater(len(history), 1)
            self.assertTrue(any(row["active"] for row in history))
            self.assertTrue(any(not row["active"] for row in history))
            self.assertTrue(all(row["evidenceStatus"].endswith("not reverified") for row in history))
            found = KNOWLEDGE.query(database, "stock")
            self.assertTrue(found["projectKnowledge"])
            self.assertTrue(found["sourceChapters"])
            # Export the restored database to a different archive: canonical
            # records and original document bytes must survive a second roundtrip.
            second = Path(directory) / "reexport"
            KNOWLEDGE.export(database, second)
            self.assertEqual((second / "catalog.json").read_bytes(), (archive / "catalog.json").read_bytes())
            self.assertEqual(KNOWLEDGE.load(second)[1], documents)

    def test_corruption_and_missing_history_refuse_before_creating_database(self):
        with tempfile.TemporaryDirectory() as directory:
            archive = Path(directory) / "archive"
            shutil.copytree(ROOT / "docs/knowledge/bar", archive)
            document = next((archive / "documents").glob("*.json"))
            original = document.read_bytes()
            document.write_bytes(original + b" ")
            database = Path(directory) / "restore.sqlite"
            with self.assertRaisesRegex(ValueError, "digest mismatch"):
                KNOWLEDGE.restore(archive, database)
            self.assertFalse(database.exists())
            document.write_bytes(original)
            catalog = json.loads((archive / "catalog.json").read_text())
            catalog["tables"]["knowledge_items"].pop()
            (archive / "catalog.json").write_text(json.dumps(catalog))
            with self.assertRaisesRegex(ValueError, "coverage mismatch"):
                KNOWLEDGE.restore(archive, database)
            self.assertFalse(database.exists())

    def test_restore_never_overwrites_an_existing_store(self):
        with tempfile.TemporaryDirectory() as directory:
            database = Path(directory) / "existing.sqlite"
            database.write_bytes(b"retained owner data")
            with self.assertRaisesRegex(ValueError, "existing database"):
                KNOWLEDGE.restore(ROOT / "docs/knowledge/bar", database)
            self.assertEqual(database.read_bytes(), b"retained owner data")

    def test_partial_export_cannot_discard_git_retained_history(self):
        with tempfile.TemporaryDirectory() as directory:
            archive = Path(directory) / "archive"
            shutil.copytree(ROOT / "docs/knowledge/bar", archive)
            before = (archive / "catalog.json").read_bytes()
            database = Path(directory) / "partial.sqlite"
            with closing(sqlite3.connect(database)) as connection:
                KNOWLEDGE.create_database(connection)
            with self.assertRaisesRegex(ValueError, "discard or rewrite"):
                KNOWLEDGE.export(database, archive)
            self.assertEqual((archive / "catalog.json").read_bytes(), before)


if __name__ == "__main__":
    unittest.main()
