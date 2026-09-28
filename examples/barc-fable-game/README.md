# Clean public BARC Fable-game receiver

This directory contains the small, reviewable input used to create the BARC-01.3d
receiver. The full generated workspace is deliberately not checked in. Qualification
creates it from public `FS.GG.Workspace.Template` 0.15.0 through public
`FS.GG.SDD.Cli` 2.0.3 in empty selected caches, verifies every pre-adoption file
against `public-scaffold.SHA256`, and retains the resulting workspace in its evidence
directory.

`receiver.patch` is the explicit receiver-owned change over that verified public
tree. It adds non-root base-path support and the opt-in BAR mount without changing
the SVG Player, typed-SDD lifecycle, arena authority, or product BAR implementation.
`adapter/Client/public/barc-receiver.js` imports the joined product's stable
`barc-preview.js` mount directly. `scripts/adopt-barc-preview.sh` installs an immutable
hash-manifested archive beneath `Client/public/barc-preview/` and refuses collisions.

Run the public-only scaffold checkpoint with:

```console
scripts/qualify-barc-receiver.sh --evidence /an/empty/evidence/directory --scaffold-only
```

Final qualification adds `--archive /path/to/barc-preview.tar.gz`. It is intentionally
pending until the joined BARC-01.3c source can produce that archive.
