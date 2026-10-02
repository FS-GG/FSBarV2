namespace FSBar.NativeProof.RuntimeEvidence

type Boundary = BrowserAdmission | Normalization | Release

type ProducerIdentity = {
    RunId: string; SourceSetSha256: string; ApphostSha256: string; ClosureSha256: string
    Pid: int; StartTicks: string; Uid: int; Device: string; Inode: string; Path: string
}

type ConsumptionObservation = {
    Boundary: Boundary; Revision: int; RawBytes: int64; RawSha256: string
    ReadStartMicroseconds: int64; ReadEndMicroseconds: int64
    LinearizedMicroseconds: int64; ReleasedMicroseconds: int64; DeadlineMicroseconds: int64
}

type Observation = {
    Identity: ProducerIdentity; Revision: int; Bytes: int64; Sha256: string
    PreviousPrefixIntact: bool; WriterPresent: bool; CompleteRecord: bool
    Available: bool; RootsValid: bool; PendingReason: string option
    Prefix: PrefixEvidence
    AttemptId: int; ProbeCount: int; EvaluationCount: int; DeadlineMicroseconds: int64
}

type EvidenceState = {
    Phase: string; Identity: ProducerIdentity option; ObservedRevision: int
    ValidatedRevision: int; ValidatedBoundary: Boundary option; ConsumedRevision: int; ConsumedBoundary: Boundary option
    Bytes: int64; Sha256: string; StickyInvalid: bool; Reason: string option
    Prefix: PrefixEvidence; CandidatePrefix: PrefixEvidence option; ConsumedPrefix: PrefixEvidence option; Consumption: ConsumptionObservation option
    AttemptId: int; ProbeCount: int; EvaluationCount: int; DeadlineMicroseconds: int64
}

type Transition = Accepted of EvidenceState | Pending of EvidenceState | Refused of EvidenceState | Unknown of EvidenceState

module GrowingLogEvidence =
    val empty: EvidenceState
    val acquire: ProducerIdentity -> EvidenceState -> Transition
    val sample: Observation -> EvidenceState -> Transition
    val validate: Boundary -> EvidenceState -> Transition
    val revoke: unavailable: bool -> reason: string -> EvidenceState -> Transition
    val observeGrowth: rawBytes: int64 -> EvidenceState -> Transition
    val consume: Boundary -> ConsumptionObservation -> EvidenceState -> Transition
    val close: EvidenceState -> EvidenceState
