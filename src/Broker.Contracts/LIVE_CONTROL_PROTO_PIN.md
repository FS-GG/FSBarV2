# HighBar live-control sibling pin

`highbar/live_control.proto` is additive to the frozen five-file HighBar
coordinator bundle. It does not replace or amend `coordinator.proto`.

- Producer repository: `FS-GG/HighBarV3`
- Producer base: `1f12673ebcbfeb637726088e048d2c9c04609078`
- Producer contract checkpoint: this candidate's HighBar commit (recorded in the
  cross-repository contract receipt when both candidates are frozen)
- Consumer base: `FS-GG/FSBarV2@b43712897f25ab6ee1d7efd679f797f58039eb65`
- Package: `highbar.v1`
- Protocols: `LIVE_CONTROL_PROTOCOL_V1` and additive `LIVE_CONTROL_PROTOCOL_TACTICAL_V1`
- File SHA-256: `90a9ee50f817dfd30988d0c6b861a9a20a597a0db68209da4e005b9348c5da1f`

The existing coordinator proto remains SHA-256
`b8d3f56494564a8628a20ffdcc2ac7e42a0508f8f1162bcc87ee6c0f6b7c3c1d`.
Old peers continue to use the ordinary coordinator services. Live peers must
explicitly negotiate `LIVE_CONTROL_PROTOCOL_V1`; zero/unknown negotiation is
refused before an authority epoch can be armed. Tactical peers negotiate
`LIVE_CONTROL_PROTOCOL_TACTICAL_V1` with exact profile
`barc-live-tactical-v1` and revision 1, or the distinct stock profile
`barc-live-tactical-stock-v1` and revision 2. Legacy revision 1 accepts the
historical absent enum value or explicit `FULL_NATIVE_TUPLE_V1`; stock revision
2 requires `STOCK_LUA_SUPPORTED_FIELDS_V1`. Unknown and cross-profile schemes
are refused. V1 peers must refuse tactical bodies;
missing/incomplete catalogues and absent per-actor descriptors never grant a
tactical capability.

The producer and consumer copies must be byte-identical. The canonical bridge
format and cross-runtime vectors are pinned in
`contracts/barc-stock-queue-v1/`. Regenerate both C++ and .NET bindings and
update the independent pin test for every change.
