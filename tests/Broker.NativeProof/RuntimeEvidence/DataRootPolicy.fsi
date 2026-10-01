namespace FSBar.NativeProof.RuntimeEvidence

type RootDecision =
    | RootAccepted of roots: string list * writeRoot: string
    | RootPending of reason: string
    | RootRefused of reason: string

module DataRootPolicy =
    val evaluate: expectedWriteRoot: string -> expectedDataRoot: string -> sample: byte array -> RootDecision
