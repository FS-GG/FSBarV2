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

## Keep verified backups of a live store

`scripts/bar_knowledge_keeper.py` keeps verified snapshots of a live knowledge store
(FS-GG/.github#4843). It replaces the unrecoverable October 2 keeper with new source.

- **Cycle:** every 1,800 seconds, it fingerprints the four allowlisted knowledge tables in
  one read transaction.
- **Snapshots:** a changed fingerprint becomes a new snapshot of those tables only, plus
  rebuilt full-text indexes, so a source-search index in the live store stays excluded. An
  unchanged fingerprint creates nothing. Each snapshot passes integrity, foreign-key, FTS5,
  exact table and fingerprint checks before publication, and its file, metadata and directory
  are fsynced.
- **Re-verification:** every cycle re-verifies all retained snapshots. A corrupt or unreadable
  one is moved to `quarantine/` and alerted, and the current version is re-created.
- **Retention:** the current snapshot and at most three older ones, ordered by a monotonic
  sequence rather than the wall clock. Older snapshots are staged, then removed through
  allowlisted, descriptor-relative deletion.
- **Recovery:** the next cycle discards interrupted unpublished snapshots and finishes staged
  deletions, and reports this as an alert. An unreadable `health.json` resets the baseline with
  an alert instead of crash-looping, and a failed cycle records `lastError`.
- **Health:** `health` lists pending, staged and quarantined entries live, and is unhealthy on
  any alert, failure or stale cycle. Alerts fire on allocated growth of at least 256 MiB that is
  also at least 25% above baseline, and on a database-to-source ratio above 1.5 times its baseline.
- **Acknowledge:** `acknowledge --reason …` rebaselines after review, clears reviewed quarantine
  entries and keeps the reason in `baselineHistory`.
- **Status copy:** `--status-dir DIR` also writes a counts-only, world-readable `health.json`.
  Paths, entry names and hash prefixes in `alerts`/`lastError` are redacted there.
  `health --status-file` reads it without access to the private state.
- **Crash tolerance:** a kill at any rename, replace or fsync of a cycle recovers on the next cycle,
  including the window where the snapshot's temporary metadata file exists
  (`tests/Contract/bar_knowledge_keeper_crash_sweep.py`). Malformed but valid JSON state is quarantined or reset
  with an alert, and a transient verify error is retried once before quarantine. Above 64 MiB of
  retained snapshots, each cycle verifies the current one plus one older one in turn, not all.
- **Installer limits:** host install and upgrade scripts live outside this repository. They are checked by review,
  `bash -n` and a live readback, not by an automated test. A failed start mid-upgrade is not rolled back
  automatically, and after a rollback the same upgrade refuses to rerun until its marker directories are cleared.

```bash
python3 scripts/bar_knowledge.py restore --database /srv/keeper/live/bar.sqlite
python3 scripts/bar_knowledge_keeper.py --root /srv/keeper/state --status-dir /srv/keeper-status run --live /srv/keeper/live/bar.sqlite
python3 scripts/bar_knowledge_keeper.py --root /srv/keeper/state health                          # private, live counts
python3 scripts/bar_knowledge_keeper.py --root /srv/keeper/state health --status-file /srv/keeper-status/health.json
python3 scripts/bar_knowledge_keeper.py --root /srv/keeper/state acknowledge --live /srv/keeper/live/bar.sqlite --reason "reviewed"
python3 tests/Contract/bar_knowledge_keeper_test.py
```

Installation, supervision, upgrades and the store location belong to the host operator. They
are not part of this repository source. CI runs these tests in `bar-knowledge-tests`.
