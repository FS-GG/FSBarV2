# HighBar live-control sibling pin

`highbar/live_control.proto` is additive to the frozen five-file HighBar
coordinator bundle. It does not replace or amend `coordinator.proto`.

- Producer repository: `FS-GG/HighBarV3`
- Producer base: `81016ee38b123a490e6ff06037cdc2f56a105a96`
- Producer contract commit: `d7f001d0e709cd7a2b9923f781b3c1184529a191`
- Consumer base: `FS-GG/FSBarV2@c537040`
- Package: `highbar.v1`
- Protocol: `LIVE_CONTROL_PROTOCOL_V1`
- File SHA-256: `34e37fd62bcac2758cb6383deae34d3523cb40ce3470034b1fb2ee2ba3bbc240`

The existing coordinator proto remains SHA-256
`b8d3f56494564a8628a20ffdcc2ac7e42a0508f8f1162bcc87ee6c0f6b7c3c1d`.
Old peers continue to use the ordinary coordinator services. Live peers must
explicitly negotiate `LIVE_CONTROL_PROTOCOL_V1`; zero/unknown negotiation is
refused before an authority epoch can be armed.

The producer and consumer copies must be byte-identical. Regenerate both C++
and .NET bindings and update the independent pin test for every change.
