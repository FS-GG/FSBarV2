# BAR project knowledge

This Git-tracked archive preserves BAR architecture, source maps, decisions, experiments, incidents,
successful and failed fixes, qualification gates and their history across container replacement.
The initial capture contains 17 project-knowledge documents, 96 immutable item versions across
61 stable IDs, and 37 source-map chapters with 490 indexed entries. The text archive is about
1.4 MB; its restored searchable SQLite database is about 2.1 MB. No full source snapshots are stored.

`documents/<sha256>.json` retains original curated document bytes. `catalog.json` retains their
provenance and the indexed knowledge records, including supersession and conflict links. Git records
later captures. The SQLite database is generated locally and is excluded from Git.

## Restore in a new container

From a checkout of this repository, Python 3.9 or later with SQLite FTS5 is sufficient:

```bash
python3 scripts/bar_knowledge.py validate
python3 scripts/bar_knowledge.py restore --database /tmp/bar-knowledge.sqlite
python3 scripts/bar_knowledge.py search 'stock engine' --database /tmp/bar-knowledge.sqlite
python3 scripts/bar_knowledge.py history question.next-native-stock-gates --database /tmp/bar-knowledge.sqlite
```

Restore requires a new output path and refuses to overwrite an existing database. A container may
recreate this cache from its repository checkout whenever needed. Search returns project records and
source chapters; history retains active and superseded versions with their original citations.
Competing active versions remain visible. Nothing selects truth merely by newest capture time.

Source proofs, artifact identities and evidence references are preserved. Temporary local paths are
historical provenance, not portable evidence. The restore tool does not copy raw logs, full reports,
credentials, runtime settings or licensed assets, and does not mark external evidence as freshly
verified. Fetch the relevant pinned repository/file or retained evidence and check its digest before
making an implementation or runtime claim. Existing public reports and roadmap links remain useful.

The `bar-source` skill can still build an independent source-search cache when source investigation
requires it. This knowledge-only database is queried with `bar_knowledge.py`; it is not a replacement
for the combined source index's schema or a claim that its source corpora have been restored.

## Capture later knowledge

After the knowledge owner records new findings, export the combined local store into an isolated
checkout of this repository:

```bash
python3 scripts/bar_knowledge.py export --database /path/to/local/bar.sqlite
python3 scripts/bar_knowledge.py validate
python3 tests/Contract/bar_knowledge_roundtrip_test.py
git diff --check
```

The exporter reads one consistent SQLite transaction, including committed WAL data. It copies only
the four knowledge/chapter tables and their curated document bytes; it never writes to the source
database. It rejects missing history, changed content digests, credential patterns and an export
that would discard or rewrite already retained records. Document files are immutable; the catalog
update is atomic. The archive has a 10 MiB size budget and a 2 MiB per-document/catalog limit to make
unexpected growth explicit. Full source text, bulk symbols and source-search indexes stay outside it.

Review new content for publication suitability and land the text changes through the repository's
normal PR route. Pattern checks assist review; they are not a complete sensitivity audit. FSBarV2 is
public, so restricted evidence stays in its own custody with a safe reference or public summary.
Do not commit the generated SQLite file. Snapshot export is explicit: later live-store writes are
durable here only after another reviewed capture is committed and pushed.

## Verification

The focused restore checks compare every retained row and original document byte after a fresh
restore and re-export, exercise search and superseded history, refuse corrupted/missing knowledge,
and prove existing stores are not overwritten. They require no game, native engine, account or
product build.
