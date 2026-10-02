namespace FSBar.NativeProof.RuntimeEvidence.Tests

open FSBar.NativeProof.RuntimeEvidence

module GrowingLogEvidenceTests =
    let private historicalPrefix bytes sha =
        { RawBytes=bytes; RawSha256=sha; CompleteBytes=bytes; CompleteSha256=sha
          TailBytes=0L;TailSha256=(DataRootPolicy.describe [||]).RawSha256;CompleteRecords=1;TailClass="empty" }
    let private consumed boundary (value: EvidenceState) =
        let final={Boundary=boundary;Revision=value.ObservedRevision;RawBytes=value.Bytes;RawSha256=value.Sha256
                   ReadStartMicroseconds=1L;ReadEndMicroseconds=2L;LinearizedMicroseconds=3L;ReleasedMicroseconds=4L;DeadlineMicroseconds=5000000L}
        GrowingLogEvidence.consume boundary final value

    let private sha c = System.String(c,64)
    let identity generation = { RunId="run";SourceSetSha256=sha 'a';ApphostSha256=sha 'b';ClosureSha256=sha 'c';Pid=100;StartTicks=string generation;Uid=1000;Device="1";Inode="2";Path="/private/infolog.txt" }
    let accepted = function Accepted value -> value | other -> failwithf "expected acceptance: %A" other
    let sample identity revision bytes digest intact roots state = GrowingLogEvidence.sample {Identity=identity;Revision=revision;Bytes=bytes;Sha256=digest;PreviousPrefixIntact=intact;WriterPresent=true;CompleteRecord=true;Available=true;RootsValid=roots;PendingReason=None;Prefix=historicalPrefix bytes digest;AttemptId=(if state.Phase="consumed" then state.AttemptId+1 else max 1 state.AttemptId);ProbeCount=(if state.Phase="consumed" then 1 else state.ProbeCount+1);EvaluationCount=(if state.Phase="consumed" then 1 else state.EvaluationCount+1);DeadlineMicroseconds=5000000L} state
    let run () =
        let id=identity 1
        let acquired=GrowingLogEvidence.acquire id GrowingLogEvidence.empty |> accepted
        let sampled=sample id 1 100L (sha 'c') true true acquired |> accepted
        let validated=GrowingLogEvidence.validate BrowserAdmission sampled |> accepted
        match consumed Release validated with Refused state when state.StickyInvalid -> () | other -> failwithf "wrong boundary accepted: %A" other
        let validated2=GrowingLogEvidence.validate BrowserAdmission sampled |> accepted
        let consumed=consumed BrowserAdmission validated2 |> accepted
        match sample id 2 120L (sha 'd') false true consumed with Refused state when state.Reason=Some "prefix-changed" -> () | other -> failwithf "rewrite accepted: %A" other
        match sample id 3 90L (sha 'e') true true consumed with Refused _ -> () | other -> failwithf "truncate/revision accepted: %A" other
        match sample (identity 2) 2 120L (sha 'd') true true consumed with Refused _ -> () | other -> failwithf "generation change accepted: %A" other
        let wrongSource={id with SourceSetSha256=sha 'f'}
        match sample wrongSource 2 120L (sha 'd') true true consumed with Refused _ -> () | other -> failwithf "source change accepted: %A" other
        match sample id 2 120L "not-a-hash" true true consumed with Refused state when state.Reason=Some "sample-hash-invalid" -> () | other -> failwithf "invalid hash accepted: %A" other
        let invalid=match sample id 2 120L (sha 'd') true false consumed with Refused state -> state | other -> failwithf "root drift accepted: %A" other
        match GrowingLogEvidence.acquire id invalid with Refused state when state.StickyInvalid -> () | other -> failwithf "sticky invalid reacquired: %A" other
        let unavailable=GrowingLogEvidence.sample {Identity=id;Revision=1;Bytes=0;Sha256="";PreviousPrefixIntact=false;WriterPresent=false;CompleteRecord=false;Available=false;RootsValid=false;PendingReason=None;Prefix=DataRootPolicy.describe [||];AttemptId=1;ProbeCount=1;EvaluationCount=1;DeadlineMicroseconds=5000000L} acquired
        match unavailable with Unknown state when state.StickyInvalid -> () | other -> failwithf "unavailable observation granted: %A" other

        let final={Boundary=BrowserAdmission;Revision=validated.ObservedRevision;RawBytes=validated.Bytes;RawSha256=validated.Sha256
                   ReadStartMicroseconds=10L;ReadEndMicroseconds=20L;LinearizedMicroseconds=30L;ReleasedMicroseconds=40L;DeadlineMicroseconds=5000000L}
        for mutant in [{final with RawBytes=final.RawBytes+1L};{final with RawSha256=sha 'f'};{final with Revision=2};{final with Boundary=Release}
                       {final with LinearizedMicroseconds=0L};{final with ReleasedMicroseconds=5000000L};{final with DeadlineMicroseconds=4000000L};{final with ReadStartMicroseconds=21L}] do
            match GrowingLogEvidence.consume BrowserAdmission mutant validated with Refused _ -> () | other -> failwithf "false final observation consumed: %A" other
        let atL=GrowingLogEvidence.consume BrowserAdmission final validated |> accepted
        if atL.ConsumedPrefix<>Some validated.Prefix || atL.Consumption<>Some final then failwith "consumed horizon/interval lost"
        match GrowingLogEvidence.consume BrowserAdmission final atL with Refused _ -> () | other -> failwithf "same candidate consumed twice: %A" other
