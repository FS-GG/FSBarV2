namespace FSBar.NativeProof.RuntimeEvidence

open System
open System.Text.RegularExpressions

type Boundary = BrowserAdmission | Normalization | Release

type ProducerIdentity = {
    RunId: string; SourceSetSha256: string; ApphostSha256: string; ClosureSha256: string
    Pid: int; StartTicks: string; Uid: int; Device: string; Inode: string; Path: string
}

type Observation = {
    Identity: ProducerIdentity; Revision: int; Bytes: int64; Sha256: string
    PreviousPrefixIntact: bool; WriterPresent: bool; CompleteRecord: bool
    Available: bool; RootsValid: bool; PendingReason: string option
}

type EvidenceState = {
    Phase: string; Identity: ProducerIdentity option; ObservedRevision: int
    ValidatedRevision: int; ValidatedBoundary: Boundary option; ConsumedRevision: int; ConsumedBoundary: Boundary option
    Bytes: int64; Sha256: string; StickyInvalid: bool; Reason: string option
}

type Transition = Accepted of EvidenceState | Pending of EvidenceState | Refused of EvidenceState | Unknown of EvidenceState

module GrowingLogEvidence =
    let empty = { Phase="empty"; Identity=None; ObservedRevision=0; ValidatedRevision=0; ValidatedBoundary=None; ConsumedRevision=0; ConsumedBoundary=None; Bytes=0L; Sha256=""; StickyInvalid=false; Reason=None }
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
        elif not observation.CompleteRecord then Pending { state with Phase="sampled"; ObservedRevision=observation.Revision; Bytes=observation.Bytes; Sha256=observation.Sha256; Reason=Some(defaultArg observation.PendingReason "incomplete-record") }
        elif not observation.RootsValid then reject "root-drift" state
        elif not (hex.IsMatch observation.Sha256) then reject "sample-hash-invalid" state
        else Accepted { state with Phase="sampled"; ObservedRevision=observation.Revision; Bytes=observation.Bytes; Sha256=observation.Sha256; Reason=None }
    let validate boundary state =
        if state.StickyInvalid then reject "sticky-invalid" state
        elif state.Phase <> "sampled" || state.Reason.IsSome then reject "sample-not-validatable" state
        else Accepted { state with Phase="validated"; ValidatedRevision=state.ObservedRevision; ValidatedBoundary=Some boundary }
    let consume boundary state =
        if state.StickyInvalid then reject "sticky-invalid" state
        elif state.Phase <> "validated" || state.ValidatedRevision <> state.ObservedRevision || state.ValidatedBoundary <> Some boundary then reject "stale-validation" state
        else Accepted { state with Phase="consumed"; ConsumedRevision=state.ObservedRevision; ConsumedBoundary=Some boundary }
    let close state = { state with Phase="closed" }
