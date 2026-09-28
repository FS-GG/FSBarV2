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
`adapter/Client/barc-receiver.js` imports the joined product's stable
`barc-preview.js` mount directly. `scripts/adopt-barc-preview.sh` installs an immutable
hash-manifested archive beneath `Client/public/barc-preview/` and refuses collisions.

Run the public-only scaffold checkpoint with:

```console
scripts/qualify-barc-receiver.sh --evidence /an/empty/evidence/directory --scaffold-only
```

Retain that untouched evidence directory as the public-generation authority. Each
candidate archive can then use a checked copy without downloading public inputs
again; the qualifier validates the scaffold-only receipt, provenance and every
pre-adoption hash before applying the archive:

```console
scripts/qualify-barc-receiver.sh \
  --evidence /a/new/candidate-evidence \
  --baseline /the/scaffold-only-evidence \
  --archive /path/to/barc-preview.tar.gz
```

After the generated receiver and actual companion are built, run the real browser
journey at the receiver's production `/barc/` URL. The wrapper passes that exact
loopback Origin to the companion, keeps the ready handoff private, owns both process
lifetimes, and accepts the native-zero receipt only after clean teardown:

```console
scripts/qualify-barc-receiver-journey.sh \
  --product-root /path/to/the/joined/fsbar/source \
  --receiver-evidence /a/qualified/candidate-evidence \
  --evidence /a/new/journey-evidence
```
