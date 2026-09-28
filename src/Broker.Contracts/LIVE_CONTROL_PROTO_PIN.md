# HighBar live-control sibling pin

`highbar/live_control.proto` is additive to the frozen five-file HighBar
coordinator bundle. It does not replace or amend `coordinator.proto`.

- Producer repository: `FS-GG/HighBarV3`
- Producer base: `81016ee38b123a490e6ff06037cdc2f56a105a96`
- Producer contract commit: `81c6819af9bfbf74240434e71b78534ec12c45ae`
- Consumer base: `FS-GG/FSBarV2@c537040`
- Package: `highbar.v1`
- Protocol: `LIVE_CONTROL_PROTOCOL_V1`
- File SHA-256: `532ebc1f73f6bc76a5d9b49efc0a0588d760d3f5f85230b4e4aac6538c22ccd7`

The existing coordinator proto remains SHA-256
`b8d3f56494564a8628a20ffdcc2ac7e42a0508f8f1162bcc87ee6c0f6b7c3c1d`.
Old peers continue to use the ordinary coordinator services. Live peers must
explicitly negotiate `LIVE_CONTROL_PROTOCOL_V1`; zero/unknown negotiation is
refused before an authority epoch can be armed.

The producer and consumer copies must be byte-identical. Regenerate both C++
and .NET bindings and update the independent pin test for every change.
