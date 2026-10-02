namespace FSBar.NativeProof.RuntimeEvidence

open System
open System.Text.RegularExpressions

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
    let empty = { Phase="empty"; Identity=None; ObservedRevision=0; ValidatedRevision=0; ValidatedBoundary=None; ConsumedRevision=0; ConsumedBoundary=None; Bytes=0L; Sha256=""; StickyInvalid=false; Reason=None; Prefix=DataRootPolicy.describe [||]; CandidatePrefix=None; ConsumedPrefix=None; Consumption=None; AttemptId=0; ProbeCount=0; EvaluationCount=0; DeadlineMicroseconds=0L }
    let private hex = Regex("^[0-9a-f]{64}$", RegexOptions.CultureInvariant)
    let private identityValid value =
        value.Pid > 1 && value.Uid >= 0 && not (String.IsNullOrWhiteSpace value.RunId) &&
        not (String.IsNullOrWhiteSpace value.StartTicks) && value.Device.Length > 0 && value.Inode.Length > 0 &&
        IO.Path.IsPathFullyQualified value.Path && hex.IsMatch value.SourceSetSha256 && hex.IsMatch value.ApphostSha256 && hex.IsMatch value.ClosureSha256
    let private reject reason state = Refused { state with Phase="invalid"; StickyInvalid=true; Reason=Some reason }
    let acquire identity state =
        if state.StickyInvalid then reject "sticky-invalid" state
        elif state.Phase <> "empty" then reject "already-acquired" state
        elif not (identityValid identity) then reject "producer-identity-mismatch" state
        else Accepted { state with Phase="acquired"; Identity=Some identity; Reason=None }
    let sample observation state =
        if state.StickyInvalid then reject "sticky-invalid" state
        elif state.Phase <> "acquired" && state.Phase <> "validated" && state.Phase <> "consumed" && state.Phase <> "sampled" then reject "not-acquired" state
        elif not observation.Available then Unknown { state with Phase="unknown"; StickyInvalid=true; Reason=Some "observation-unavailable" }
        elif state.Identity <> Some observation.Identity then reject "producer-identity-mismatch" state
        elif not observation.WriterPresent then reject "writer-absent" state
        elif observation.Revision <> state.ObservedRevision + 1 then reject "revision-drift" state
        elif observation.Bytes < state.Bytes then reject "prefix-truncated" state
        elif state.Bytes > 0L && not observation.PreviousPrefixIntact then reject "prefix-changed" state
        elif observation.AttemptId < 1 || observation.ProbeCount < 1 || observation.ProbeCount > 32 ||
             observation.EvaluationCount < 1 || observation.EvaluationCount > 3 || observation.DeadlineMicroseconds <= 0L || observation.DeadlineMicroseconds > 5000000L then reject "boundary-budget" state
        elif observation.AttemptId = state.AttemptId && (observation.EvaluationCount <> state.EvaluationCount + 1 || observation.ProbeCount <= state.ProbeCount || observation.DeadlineMicroseconds <> state.DeadlineMicroseconds) then reject "boundary-budget-renewal" state
        elif observation.AttemptId <> state.AttemptId && (observation.AttemptId <> state.AttemptId + 1 || observation.EvaluationCount <> 1 || (state.Phase <> "acquired" && state.Phase <> "consumed")) then reject "boundary-attempt-drift" state
        elif observation.Prefix.RawBytes <> observation.Bytes || observation.Prefix.RawSha256 <> observation.Sha256 ||
             observation.Prefix.CompleteBytes < 0L || observation.Prefix.TailBytes < 0L ||
             observation.Prefix.CompleteBytes + observation.Prefix.TailBytes <> observation.Bytes ||
             observation.Prefix.CompleteRecords < 0 || observation.Prefix.CompleteRecords > 65536 ||
             not (hex.IsMatch observation.Sha256) || not (hex.IsMatch observation.Prefix.CompleteSha256) || not (hex.IsMatch observation.Prefix.TailSha256) then reject "sample-hash-invalid" state
        elif not observation.CompleteRecord then Pending { state with Phase="sampled"; ObservedRevision=observation.Revision; Bytes=observation.Bytes; Sha256=observation.Sha256; Prefix=observation.Prefix; CandidatePrefix=None; AttemptId=observation.AttemptId; ProbeCount=observation.ProbeCount; EvaluationCount=observation.EvaluationCount; DeadlineMicroseconds=observation.DeadlineMicroseconds; Reason=Some(defaultArg observation.PendingReason "incomplete-record") }
        elif not observation.RootsValid then
            reject (defaultArg observation.PendingReason "root-drift") { state with ObservedRevision=observation.Revision;Bytes=observation.Bytes;Sha256=observation.Sha256;Prefix=observation.Prefix;CandidatePrefix=None;AttemptId=observation.AttemptId;ProbeCount=observation.ProbeCount;EvaluationCount=observation.EvaluationCount;DeadlineMicroseconds=observation.DeadlineMicroseconds }
        elif observation.Prefix.CompleteRecords = 0 || (observation.Prefix.TailClass <> "empty" && observation.Prefix.TailClass <> "atlas") then reject "tail-not-safe" state
        elif not (hex.IsMatch observation.Sha256) then reject "sample-hash-invalid" state
        else Accepted { state with Phase="sampled"; ObservedRevision=observation.Revision; Bytes=observation.Bytes; Sha256=observation.Sha256; Prefix=observation.Prefix; CandidatePrefix=None; AttemptId=observation.AttemptId; ProbeCount=observation.ProbeCount; EvaluationCount=observation.EvaluationCount; DeadlineMicroseconds=observation.DeadlineMicroseconds; Reason=None }
    let validate boundary state =
        if state.StickyInvalid then reject "sticky-invalid" state
        elif state.Phase <> "sampled" || state.Reason.IsSome then reject "sample-not-validatable" state
        else Accepted { state with Phase="validated"; ValidatedRevision=state.ObservedRevision; ValidatedBoundary=Some boundary; CandidatePrefix=Some state.Prefix }
    let revoke unavailable reason state =
        let revoked={state with Phase=(if unavailable then "unknown" else "invalid");StickyInvalid=true;CandidatePrefix=None;Reason=Some reason}
        if unavailable then Unknown revoked else Refused revoked
    let observeGrowth rawBytes state =
        if state.StickyInvalid then reject "sticky-invalid" state
        elif (state.Phase <> "validated" && state.Phase <> "sampled") || rawBytes <= state.Bytes || rawBytes > 10L*1024L*1024L then reject "final-size-drift" state
        else Pending { state with Phase="sampled"; CandidatePrefix=None; Reason=Some "observed-growth" }
    let consume boundary (observation: ConsumptionObservation) state =
        if state.StickyInvalid then reject "sticky-invalid" state
        elif state.Phase <> "validated" || state.ValidatedRevision <> state.ObservedRevision || state.ValidatedBoundary <> Some boundary then reject "stale-validation" state
        elif observation.Boundary <> boundary || observation.Revision <> state.ObservedRevision ||
             observation.RawBytes <> state.Bytes || observation.RawSha256 <> state.Sha256 || state.CandidatePrefix <> Some state.Prefix then reject "final-horizon-mismatch" state
        elif observation.ReadStartMicroseconds < 0L || observation.ReadEndMicroseconds < observation.ReadStartMicroseconds ||
             observation.LinearizedMicroseconds < observation.ReadEndMicroseconds || observation.ReleasedMicroseconds < observation.LinearizedMicroseconds ||
             observation.DeadlineMicroseconds <> state.DeadlineMicroseconds ||
             observation.ReleasedMicroseconds >= observation.DeadlineMicroseconds then reject "final-observation-interval" state
        else Accepted { state with Phase="consumed"; ConsumedPrefix=Some state.Prefix; Consumption=Some observation; ConsumedRevision=state.ObservedRevision; ConsumedBoundary=Some boundary }
    let close state = { state with Phase="closed" }
