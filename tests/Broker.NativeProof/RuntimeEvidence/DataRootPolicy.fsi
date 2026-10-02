namespace FSBar.NativeProof.RuntimeEvidence

type RootDecision =
    | RootAccepted of roots: string list * writeRoot: string
    | RootPending of reason: string
    | RootRefused of reason: string

/// Exact descriptors derived from one retained raw sample; no byte is discarded.
type PrefixEvidence = {
    RawBytes: int64; RawSha256: string
    CompleteBytes: int64; CompleteSha256: string
    TailBytes: int64; TailSha256: string
    CompleteRecords: int; TailClass: string
}

module DataRootPolicy =
    /// Derive the split and conservative unfinished-tail classification.
    val describe: sample: byte array -> PrefixEvidence
    val evaluate: expectedWriteRoot: string -> expectedDataRoot: string -> sample: byte array -> RootDecision
