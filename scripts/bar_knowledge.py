#!/usr/bin/env python3
"""Export, validate, restore and query BAR knowledge without source snapshots."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import sqlite3
import tempfile

ARCHIVE = Path(__file__).resolve().parents[1] / "docs/knowledge/bar"
SCHEMA = "fsgg.knowledge.bar-git/1"
MAX_DOCUMENT = 2 * 1024 * 1024
MAX_ARCHIVE = 10 * 1024 * 1024
SECRET = re.compile(
    r"authorization\s*:\s*bearer|password\s*[=:]|cookie\s*:|"
    r"-----BEGIN [^-]*PRIVATE KEY|gh[pousr]_[A-Za-z0-9]{20,}|"
    r"github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9]{20,}|"
    r"https?://[^\s/@]+:[^\s/@]+@",
    re.I,
)
TABLES = {
    "chapter_documents": "digest TEXT PRIMARY KEY, imported_at TEXT, source_name TEXT, revision TEXT, origin TEXT, document TEXT",
    "chapter_items": "document_digest TEXT, source_name TEXT, revision TEXT, item_type TEXT, item_id TEXT, title TEXT, body TEXT, confidence TEXT, tags TEXT",
    "knowledge_documents": "digest TEXT PRIMARY KEY, schema TEXT NOT NULL, origin TEXT NOT NULL, imported_at TEXT NOT NULL, document TEXT NOT NULL",
    "knowledge_items": "item_digest TEXT PRIMARY KEY, item_id TEXT NOT NULL, document_digest TEXT NOT NULL, kind TEXT NOT NULL, title TEXT NOT NULL, statement TEXT NOT NULL, scope_json TEXT NOT NULL, as_of_date TEXT NOT NULL, event_date TEXT, state TEXT NOT NULL, basis TEXT NOT NULL, evidence_json TEXT NOT NULL, tags_json TEXT NOT NULL, supersedes_json TEXT NOT NULL, conflicts_json TEXT NOT NULL",
}


def fail(message):
    raise ValueError(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def columns(table):
    return [part.strip().split()[0] for part in TABLES[table].split(",")]


def readonly(path):
    if path.is_symlink() or not path.is_file():
        fail("database must be an existing regular file")
    connection = sqlite3.connect(path.resolve().as_uri() + "?mode=ro", uri=True)
    connection.row_factory = sqlite3.Row
    return connection


def reviewed_bytes(data, label):
    if len(data) > MAX_DOCUMENT:
        fail(f"document exceeds size limit: {label}")
    if SECRET.search(data.decode("utf-8")):
        fail(f"credential pattern refused: {label}")


def create_database(connection):
    for table, definition in TABLES.items():
        connection.execute(f"CREATE TABLE {table} ({definition})")
    connection.execute("CREATE INDEX knowledge_items_id ON knowledge_items(item_id)")
    connection.execute("CREATE VIRTUAL TABLE knowledge_fts USING fts5(item_digest UNINDEXED, item_id, title, statement)")
    connection.execute("CREATE VIRTUAL TABLE chapter_fts USING fts5(document_digest UNINDEXED, item_id, title, body)")


def export(database, archive):
    # A single read transaction captures WAL-committed knowledge without copying or
    # changing the live database, including while its owner continues importing.
    connection = readonly(database)
    try:
        connection.execute("BEGIN")
        tables = {}
        documents = {}
        for table in TABLES:
            rows = [dict(row) for row in connection.execute(f"SELECT {','.join(columns(table))} FROM {table}")]
            if table.endswith("_documents"):
                for row in rows:
                    data = row.pop("document").encode("utf-8")
                    if sha(data) != row["digest"]:
                        fail("live document digest mismatch")
                    reviewed_bytes(data, row["digest"])
                    documents[row["digest"]] = data
            tables[table] = sorted(rows, key=canonical)
    finally:
        connection.close()
    catalog = {"schema": SCHEMA, "tables": tables}
    data = (json.dumps(catalog, indent=2, sort_keys=True, ensure_ascii=False) + "\n").encode()
    reviewed_bytes(data, "catalog")
    if len(data) + sum(map(len, documents.values())) > MAX_ARCHIVE:
        fail("knowledge archive exceeds size budget; review retained knowledge")
    # Validate everything before changing the working-tree archive. No full source,
    # symbols, raw logs, evidence payloads or paths configuration are exported.
    check(catalog, documents)
    if (archive / "catalog.json").exists():
        previous, _ = load(archive)
        for table in TABLES:
            old_rows = {canonical(row) for row in previous["tables"][table]}
            if not old_rows <= {canonical(row) for row in tables[table]}:
                fail("export would discard or rewrite retained knowledge; reconcile first")
    docdir = archive / "documents"
    if archive.is_symlink() or docdir.is_symlink() or (archive / "catalog.json").is_symlink():
        fail("archive symlinks refused")
    docdir.mkdir(parents=True, exist_ok=True)
    for digest, content in documents.items():
        path = docdir / f"{digest}.json"
        if path.is_symlink() or (path.exists() and path.read_bytes() != content):
            fail("immutable document differs or is a symlink")
        if not path.exists():
            path.write_bytes(content)
    fd, name = tempfile.mkstemp(prefix=".catalog-", dir=archive)
    try:
        with os.fdopen(fd, "wb") as output:
            output.write(data)
        os.replace(name, archive / "catalog.json")
    finally:
        Path(name).unlink(missing_ok=True)
    return validate(archive)


def load(archive):
    catalog_path = archive / "catalog.json"
    if archive.is_symlink() or catalog_path.is_symlink():
        fail("archive symlinks refused")
    data = catalog_path.read_bytes()
    reviewed_bytes(data, "catalog")
    catalog = json.loads(data)
    if set(catalog) != {"schema", "tables"} or catalog["schema"] != SCHEMA:
        fail("invalid archive schema")
    if set(catalog["tables"]) != set(TABLES):
        fail("archive table allowlist mismatch")
    documents = {}
    for table in ("chapter_documents", "knowledge_documents"):
        for row in catalog["tables"][table]:
            digest = row["digest"]
            if not isinstance(digest, str) or not re.fullmatch("[0-9a-f]{64}", digest):
                fail("invalid document digest")
            path = archive / "documents" / f"{digest}.json"
            if (archive / "documents").is_symlink() or path.is_symlink():
                fail("document symlink refused")
            content = path.read_bytes()
            reviewed_bytes(content, digest)
            if sha(content) != digest:
                fail("document digest mismatch")
            documents[digest] = content
    if len(data) + sum(map(len, documents.values())) > MAX_ARCHIVE:
        fail("knowledge archive exceeds size budget")
    check(catalog, documents)
    return catalog, documents


def check(catalog, documents):
    tables = catalog["tables"]
    for table in TABLES:
        expected = set(columns(table)) - ({"document"} if table.endswith("_documents") else set())
        if not isinstance(tables[table], list) or any(set(row) != expected for row in tables[table]):
            fail(f"invalid rows: {table}")
    doc_ids = {row["digest"] for row in tables["knowledge_documents"]}
    chapter_ids = {row["digest"] for row in tables["chapter_documents"]}
    for table in ("knowledge_documents", "chapter_documents"):
        if len({row["digest"] for row in tables[table]}) != len(tables[table]):
            fail("duplicate document")
    parsed_items = {}
    for doc_id in doc_ids:
        doc = json.loads(documents[doc_id])
        if doc.get("schema") != "fsgg.knowledge.bar-project/1":
            fail("invalid project knowledge document")
        for item in doc["items"]:
            parsed_items[sha(canonical(item).encode())] = item
    items = {row["item_digest"]: row for row in tables["knowledge_items"]}
    if len(items) != len(tables["knowledge_items"]) or set(items) != set(parsed_items):
        fail("knowledge item/document coverage mismatch")
    mapping = {"item_id": "id", "as_of_date": "asOf", "event_date": "eventDate"}
    for digest, row in items.items():
        if row["document_digest"] not in doc_ids:
            fail("knowledge document reference missing")
        decoded = {}
        for key, value in row.items():
            if key in {"item_digest", "document_digest"}:
                continue
            decoded[mapping.get(key, key.removesuffix("_json"))] = json.loads(value) if key.endswith("_json") else value
        if sha(canonical(decoded).encode()) != digest or decoded != parsed_items[digest]:
            fail("knowledge item digest mismatch")
        own_document = json.loads(documents[row["document_digest"]])
        if decoded not in own_document["items"]:
            fail("knowledge item provenance mismatch")
        for ref in decoded["supersedes"] + decoded["conflicts"]:
            if ref not in items:
                fail("knowledge history reference missing")
        for ref in decoded["supersedes"]:
            if items[ref]["item_id"] != row["item_id"]:
                fail("supersession crosses stable IDs")
    visiting, visited = set(), set()

    def visit(digest):
        if digest in visiting:
            fail("knowledge supersession cycle")
        if digest in visited:
            return
        visiting.add(digest)
        for ref in json.loads(items[digest]["supersedes_json"]):
            visit(ref)
        visiting.remove(digest)
        visited.add(digest)

    for digest in items:
        visit(digest)
    expected_chapters = []
    for metadata in tables["chapter_documents"]:
        doc = json.loads(documents[metadata["digest"]])
        source = doc["source"]
        if (source["name"], source["revision"]) != (metadata["source_name"], metadata["revision"]):
            fail("chapter source/revision mismatch")
        values = []
        for item in doc["components"]:
            values.append(("component", item["id"], item["title"], item["summary"], None, json.dumps(item["paths"])))
        for item in doc["flows"]:
            values.append(("flow", item["id"], item["title"], json.dumps(item["steps"], sort_keys=True), None, "[]"))
        for item in doc["facts"]:
            values.append(("fact", item["id"], item["kind"], item["statement"] + " " + json.dumps(item["evidence"], sort_keys=True), item["confidence"], json.dumps(item["tags"])))
        for item in values:
            expected_chapters.append(dict(zip(columns("chapter_items"), (metadata["digest"], source["name"], source["revision"], *item))))
    if sorted(expected_chapters, key=canonical) != sorted(tables["chapter_items"], key=canonical):
        fail("chapter item/document coverage mismatch")


def validate(archive):
    catalog, documents = load(archive)
    return {"schema": SCHEMA, "valid": True,
            "counts": {table: len(rows) for table, rows in catalog["tables"].items()},
            "archiveBytes": (archive / "catalog.json").stat().st_size + sum(map(len, documents.values())),
            "sourceSnapshots": 0,
            "evidenceStatus": "references preserved; external bytes not reverified"}


def restore(archive, database):
    catalog, documents = load(archive)
    if database.exists() or database.is_symlink():
        fail("restore requires a new database path; existing database will not be overwritten")
    database.parent.mkdir(parents=True, exist_ok=True)
    fd, name = tempfile.mkstemp(prefix=".bar-knowledge-", suffix=".sqlite", dir=database.parent)
    os.close(fd)
    temporary = Path(name)
    connection = sqlite3.connect(temporary)
    try:
        create_database(connection)
        with connection:
            for table in TABLES:
                names = columns(table)
                for row in catalog["tables"][table]:
                    row = dict(row)
                    if table.endswith("_documents"):
                        row["document"] = documents[row["digest"]].decode()
                    connection.execute(f"INSERT INTO {table} VALUES ({','.join('?' for _ in names)})", [row[key] for key in names])
            connection.execute("INSERT INTO knowledge_fts SELECT item_digest,item_id,title,statement FROM knowledge_items")
            connection.execute("INSERT INTO chapter_fts(rowid,document_digest,item_id,title,body) SELECT rowid,document_digest,item_id,title,body FROM chapter_items")
        if connection.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
            fail("restored database integrity failed")
        connection.close()
        # Atomic creation without overwriting a path created by another writer.
        os.link(temporary, database)
        return {"restored": str(database), "databaseBytes": database.stat().st_size,
                **validate(archive)}
    finally:
        connection.close()
        temporary.unlink(missing_ok=True)


def annotated(rows, all_rows):
    superseded = {ref for row in all_rows for ref in json.loads(row["supersedes_json"])}
    active = {}
    for row in all_rows:
        if row["item_digest"] not in superseded:
            active.setdefault(row["item_id"], []).append(row["item_digest"])
    result = []
    for row in rows:
        item = dict(row)
        for key in list(item):
            if key.endswith("_json"):
                item[key.removesuffix("_json")] = json.loads(item.pop(key))
        item["active"] = item["item_digest"] not in superseded
        item["activeCompetitors"] = active.get(item["item_id"], [])
        item["unresolvedConflict"] = len(item["activeCompetitors"]) > 1
        item["citation"] = f"bar-knowledge:{item['item_id']}@{item['item_digest']}"
        item["evidenceStatus"] = "references preserved; external bytes not reverified"
        result.append(item)
    return result


def query(database, text, history=False):
    connection = readonly(database)
    try:
        all_rows = connection.execute("SELECT * FROM knowledge_items ORDER BY item_id,item_digest").fetchall()
        if history:
            return {"history": annotated([row for row in all_rows if row["item_id"] == text], all_rows)}
        tokens = re.findall(r"\w+", text, re.UNICODE)
        if not tokens:
            fail("search query is empty")
        expression = " OR ".join('"' + token + '"' for token in tokens[:20])
        rows = connection.execute("SELECT k.* FROM knowledge_fts f JOIN knowledge_items k ON k.item_digest=f.item_digest WHERE knowledge_fts MATCH ? ORDER BY rank LIMIT 30", (expression,)).fetchall()
        chapters = [dict(row) for row in connection.execute("SELECT c.* FROM chapter_fts f JOIN chapter_items c ON c.rowid=f.rowid WHERE chapter_fts MATCH ? ORDER BY rank LIMIT 20", (expression,))]
        return {"projectKnowledge": annotated(rows, all_rows), "sourceChapters": chapters,
                "evidenceStatus": "references preserved; external bytes not reverified"}
    finally:
        connection.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", type=Path, default=ARCHIVE)
    commands = parser.add_subparsers(dest="command", required=True)
    for command in ("export", "restore"):
        sub = commands.add_parser(command)
        sub.add_argument("--database", type=Path, required=True)
    commands.add_parser("validate")
    for command in ("search", "history"):
        sub = commands.add_parser(command)
        sub.add_argument("text")
        sub.add_argument("--database", type=Path, required=True)
    args = parser.parse_args()
    try:
        if args.command == "export":
            result = export(args.database, args.archive)
        elif args.command == "restore":
            result = restore(args.archive, args.database)
        elif args.command == "validate":
            result = validate(args.archive)
        else:
            result = query(args.database, args.text, args.command == "history")
        print(json.dumps(result, indent=2, ensure_ascii=False))
    except (ValueError, OSError, sqlite3.Error, KeyError, TypeError, json.JSONDecodeError) as error:
        parser.exit(2, f"bar knowledge operation failed: {error}\n")


if __name__ == "__main__":
    main()
