namespace FSBar.NativeProof.RuntimeEvidence

type Boundary = BrowserAdmission | Normalization | Release

type ProducerIdentity = {
    RunId: string; SourceSetSha256: string; ArtifactSha256: string
    Pid: int; StartTicks: string; Uid: int; Device: string; Inode: string; Path: string
}

type Observation = {
    Identity: ProducerIdentity; Revision: int; Bytes: int64; Sha256: string
    PreviousPrefixIntact: bool; WriterPresent: bool; CompleteRecord: bool
    Available: bool; RootsValid: bool
}

type EvidenceState = {
    Phase: string; Identity: ProducerIdentity option; ObservedRevision: int
    ValidatedRevision: int; ValidatedBoundary: Boundary option; ConsumedRevision: int; ConsumedBoundary: Boundary option
    Bytes: int64; Sha256: string; StickyInvalid: bool; Reason: string option
}

type Transition = Accepted of EvidenceState | Pending of EvidenceState | Refused of EvidenceState | Unknown of EvidenceState

module GrowingLogEvidence =
    val empty: EvidenceState
    val acquire: ProducerIdentity -> EvidenceState -> Transition
    val sample: Observation -> EvidenceState -> Transition
    val validate: Boundary -> EvidenceState -> Transition
    val consume: Boundary -> EvidenceState -> Transition
    val close: EvidenceState -> EvidenceState
