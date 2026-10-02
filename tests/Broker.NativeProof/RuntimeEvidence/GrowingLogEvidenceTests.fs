namespace FSBar.NativeProof.RuntimeEvidence.Tests

open FSBar.NativeProof.RuntimeEvidence

module GrowingLogEvidenceTests =
    let private sha c = System.String(c,64)
    let identity generation = { RunId="run";SourceSetSha256=sha 'a';ApphostSha256=sha 'b';ClosureSha256=sha 'c';Pid=100;StartTicks=string generation;Uid=1000;Device="1";Inode="2";Path="/private/infolog.txt" }
    let accepted = function Accepted value -> value | other -> failwithf "expected acceptance: %A" other
    let sample identity revision bytes digest intact roots state = GrowingLogEvidence.sample {Identity=identity;Revision=revision;Bytes=bytes;Sha256=digest;PreviousPrefixIntact=intact;WriterPresent=true;CompleteRecord=true;Available=true;RootsValid=roots;PendingReason=None} state
    let run () =
        let id=identity 1
        let acquired=GrowingLogEvidence.acquire id GrowingLogEvidence.empty |> accepted
        let sampled=sample id 1 100L (sha 'c') true true acquired |> accepted
        let validated=GrowingLogEvidence.validate BrowserAdmission sampled |> accepted
        match GrowingLogEvidence.consume Release validated with Refused state when state.StickyInvalid -> () | other -> failwithf "wrong boundary accepted: %A" other
        let validated2=GrowingLogEvidence.validate BrowserAdmission sampled |> accepted
        let consumed=GrowingLogEvidence.consume BrowserAdmission validated2 |> accepted
        match sample id 2 120L (sha 'd') false true consumed with Refused state when state.Reason=Some "prefix-changed" -> () | other -> failwithf "rewrite accepted: %A" other
        match sample id 3 90L (sha 'e') true true consumed with Refused _ -> () | other -> failwithf "truncate/revision accepted: %A" other
        match sample (identity 2) 2 120L (sha 'd') true true consumed with Refused _ -> () | other -> failwithf "generation change accepted: %A" other
        let wrongSource={id with SourceSetSha256=sha 'f'}
        match sample wrongSource 2 120L (sha 'd') true true consumed with Refused _ -> () | other -> failwithf "source change accepted: %A" other
        match sample id 2 120L "not-a-hash" true true consumed with Refused state when state.Reason=Some "sample-hash-invalid" -> () | other -> failwithf "invalid hash accepted: %A" other
        let invalid=match sample id 2 120L (sha 'd') true false consumed with Refused state -> state | other -> failwithf "root drift accepted: %A" other
        match GrowingLogEvidence.acquire id invalid with Refused state when state.StickyInvalid -> () | other -> failwithf "sticky invalid reacquired: %A" other
        let unavailable=GrowingLogEvidence.sample {Identity=id;Revision=1;Bytes=0;Sha256="";PreviousPrefixIntact=false;WriterPresent=false;CompleteRecord=false;Available=false;RootsValid=false;PendingReason=None} acquired
        match unavailable with Unknown state when state.StickyInvalid -> () | other -> failwithf "unavailable observation granted: %A" other
