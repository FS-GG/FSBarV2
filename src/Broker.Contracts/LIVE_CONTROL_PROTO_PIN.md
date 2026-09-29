# HighBar live-control sibling pin

`highbar/live_control.proto` is additive to the frozen five-file HighBar
coordinator bundle. It does not replace or amend `coordinator.proto`.

- Producer repository: `FS-GG/HighBarV3`
- Producer base: `680b62480bfb60a19b3591b7250e03787e1f93d1`
- Producer contract checkpoint: `e7601e19abe6b1df190fe8d5cedeb71efaea51f9`
- Consumer base: `FS-GG/FSBarV2@f1a18c52246b88e958344cb3bcc87f3c2035a62e`
- Package: `highbar.v1`
- Protocols: `LIVE_CONTROL_PROTOCOL_V1` and additive `LIVE_CONTROL_PROTOCOL_TACTICAL_V1`
- File SHA-256: `c0db75f75c1b50fb788407764560b5201f4e959e6ae7a744351e6cde5e893aec`

The existing coordinator proto remains SHA-256
`b8d3f56494564a8628a20ffdcc2ac7e42a0508f8f1162bcc87ee6c0f6b7c3c1d`.
Old peers continue to use the ordinary coordinator services. Live peers must
explicitly negotiate `LIVE_CONTROL_PROTOCOL_V1`; zero/unknown negotiation is
refused before an authority epoch can be armed. Tactical peers negotiate
`LIVE_CONTROL_PROTOCOL_TACTICAL_V1` with exact profile
`barc-live-tactical-v1` and revision 1. V1 peers must refuse tactical bodies;
missing/incomplete catalogues and absent per-actor descriptors never grant a
tactical capability.

The producer and consumer copies must be byte-identical. Regenerate both C++
and .NET bindings and update the independent pin test for every change.
