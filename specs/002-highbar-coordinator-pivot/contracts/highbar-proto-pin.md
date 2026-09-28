# HighBarV3 Proto Pin Manifest

This manifest records the upstream `EHotwagner/HighBarV3` commit and
per-file blob hashes from which the broker's vendored proto set
(`src/Broker.Contracts/highbar/`) was copied. Drift handling and
re-vendoring are governed by a separate broker-side pin-and-update
workflow per spec Assumptions; this file is the audit anchor for
"what version of the upstream contract are we talking to".

## Upstream coordinates

- **Repo**: `EHotwagner/HighBarV3`
- **Branch**: `master`
- **Commit SHA (full)**: `dd6f5ef909905a8b5182d3d52c10946527ea79e5`
- **Captured at**: 2026-09-28
- **Ordered five-file bundle sha256**: `796278dda7e178a5592413e9842795711efae7b101bc502d1501622bfb5c316e`

## Vendored files

Five files were vendored verbatim into both
`specs/002-highbar-coordinator-pivot/contracts/highbar/` and
`src/Broker.Contracts/highbar/`. The two copies MUST match
byte-for-byte.

| File | GitHub blob SHA | sha256 of file content |
|------|-----------------|------------------------|
| `coordinator.proto` | `497483c703ebca8279d328f4bd39ba94118e1ecd` | `b8d3f56494564a8628a20ffdcc2ac7e42a0508f8f1162bcc87ee6c0f6b7c3c1d` |
| `state.proto` | `53b5fc0d439c3abb386151e5fc93fa27997cfbfb` | `11ff63ac8211cbb6530e9be3ce4323a8b5911306d85c1b472c6aaa4618fc78d8` |
| `commands.proto` | `ff8a676496501c3e47aa7fb69fd226550f6b320e` | `19cbca8c0b84de976e5e99c20fd9a7e3b63909248d45caed3f237315cc780de0` |
| `events.proto` | `0b050ceb5820f4b1f34a825abc399e8bc446200c` | `796d79ed2eb3c20505565d7b93d2d14ce8e1c1c75caa8f4e10bf87ab2a4f0175` |
| `common.proto` | `7b8b1d915b22e874d672593650917a3f0fc8a97e` | `15072451c53f4428bc3c1c1c35e21be5f79a2461c451fa1be523ce26667826b1` |

## Files NOT vendored (deliberately)

The upstream `proto/highbar/` directory contains two more files not
included in this vendor; both are out of scope for this feature per
spec Out of Scope:

| File | Why not vendored |
|------|------------------|
| `service.proto` | Defines `HighBarProxy` + `HighBarAdmin`, the **plugin-hosted** embedded gateway. The broker only consumes the coordinator-side contract. |
| `callbacks.proto` | Imported only by `service.proto`; vendoring it would imply we host the callback surface. |

## Re-vendoring procedure

When the upstream contract changes and we choose to update the pin:

```sh
# 1. Pick the new upstream SHA
NEW_SHA=<full sha>

# 2. Refresh both copies (specs/.../contracts/highbar/ and src/Broker.Contracts/highbar/)
for f in coordinator state commands events common; do
  gh api repos/EHotwagner/HighBarV3/contents/proto/highbar/$f.proto?ref=$NEW_SHA \
    -H 'Accept: application/vnd.github.raw' \
    > specs/002-highbar-coordinator-pivot/contracts/highbar/$f.proto
  cp specs/002-highbar-coordinator-pivot/contracts/highbar/$f.proto \
     src/Broker.Contracts/highbar/$f.proto
done

# 3. Update this manifest's SHA, blob SHAs, and sha256 column
# 4. Run the surface-area suite — any wire-shape change shows up as a
#    baseline diff; review and update WireConvert + tests accordingly.
# 5. Update HIGHBAR_PROTO_PIN.md (mirror of this file under src/Broker.Contracts/)
```

## Drift detection

A unit test in `Broker.Contracts.Tests` MUST verify that the
in-repo files under `src/Broker.Contracts/highbar/` match the SHAs
in this manifest, failing with a clear message that the pin is out
of sync. (Tests fetch nothing from the network — they hash the
on-disk vendored copies and compare against constants generated
from this manifest.)
