namespace FSBar.NativeProof.RuntimeEvidence.Tests

open System
open System.IO
open System.Security.Cryptography
open System.Text
open System.Text.Json
open FsQuint
open FSBar.NativeProof.RuntimeEvidence

module CorrespondenceTests =
    let mutable private policyPhase="none"
    let mutable private policyInvocation="none"
    let mutable private policyClosure="none"
    let private unwrap = function Ok value -> value | Error error -> failwithf "%A" error
    let private hashBytes (bytes: byte array) = SHA256.HashData bytes |> Convert.ToHexStringLower
    let private hashFile path = File.ReadAllBytes path |> hashBytes
    let private hashJoined paths = paths |> Seq.collect File.ReadAllBytes |> Seq.toArray |> hashBytes
    let private locate name =
        Environment.GetEnvironmentVariable("PATH").Split(Path.PathSeparator)
        |> Array.map (fun root -> Path.Combine(root,name)) |> Array.find File.Exists |> Path.GetFullPath
    let private source={Path="GrowingLogEvidence_test.qnt";Line=1;Column=1}
    let private boundaryText = function Some BrowserAdmission->"browser"|Some Normalization->"normalization"|Some Release->"release"|None->"none"
    let private stateWithSettlement settlementPhase settlementRemaining deadlineAvailable rootsValid prefixIntact writerPresent (value: EvidenceState) =
        let present=value.Identity.IsSome
        let settlement=Record ["phase",Text settlementPhase;"remaining",Integer(string settlementRemaining);"deadlineAvailable",Boolean deadlineAvailable]
        let record=Record ["phase",Text value.Phase;"generation",Integer(if present then "1" else "0");"observedRevision",Integer(string value.ObservedRevision);"validatedRevision",Integer(string value.ValidatedRevision);"intendedBoundary",Text(boundaryText value.ValidatedBoundary);"consumedRevision",Integer(string value.ConsumedRevision);"consumedBoundary",Text(boundaryText value.ConsumedBoundary);"producerMatches",Boolean present;"logMatches",Boolean present;"sourceMatches",Boolean present;"rootsValid",Boolean rootsValid;"prefixIntact",Boolean prefixIntact;"writerPresent",Boolean writerPresent;"authorityActive",Boolean(value.Phase="validated" && not value.StickyInvalid);"stickyInvalid",Boolean value.StickyInvalid;"policyPhase",Text policyPhase;"policyInvocation",Text policyInvocation;"policyClosure",Text policyClosure;"settlement",settlement]
        let draft={Identity="";Bindings=["evidence",record]}
        {draft with Identity=QuintReplay.stateFingerprint draft |> unwrap}
    let private state rootsValid prefixIntact writerPresent value = stateWithSettlement "idle" 32 true rootsValid prefixIntact writerPresent value
    let private accepted = function Accepted value -> value | other -> failwithf "%A" other
    let private transitioned = function Accepted value|Pending value|Refused value|Unknown value -> value
    let private compareTrace baseDirectory environment name actions projected =
        let context={Environment=environment;Steps=actions|>List.mapi(fun index action->{Index=index+1;Action=action;Source=source})}
        let trace=QuintReplay.decodeItf context (File.ReadAllText(Path.Combine(baseDirectory,$"GrowingLogEvidence.{name}.itf.json"))) |> unwrap
        let observations=projected|>List.mapi(fun index actual->{Index=index+1;Action=actions[index];Source=source;Actual=actual})
        match QuintReplay.compare trace observations |> unwrap with QuintReplayResult.Equivalent -> trace,observations | other -> failwithf "%s reducer/model divergence: %A" name other
    let run baseDirectory =
        match Environment.GetEnvironmentVariable("BAR_SETTLEMENT_TRANSCRIPT") with
        | null | "" -> ()
        | path ->
            use document=JsonDocument.Parse(File.ReadAllBytes path)
            let rows=document.RootElement.EnumerateArray()|>Seq.toArray
            if rows.Length<>2 then failwith "actual settlement transcript length"
            let read index event probe remaining =
                let row=rows[index]
                let names=row.EnumerateObject()|>Seq.map _.Name|>Set.ofSeq
                if names<>set ["event";"probe";"remaining"] || row.GetProperty("event").GetString()<>event || row.GetProperty("probe").GetInt32()<>probe || row.GetProperty("remaining").GetInt32()<>remaining then failwith "actual settlement transcript mismatch"
            read 0 "incomplete" 1 31
            read 1 "complete" 2 30
        policyPhase<-"none";policyInvocation<-"none";policyClosure<-"none"
        let tool=locate "quint"
        let environment={Seed="424242";Bounds=["revisions",3L;"generations",2L];ToolFingerprint=hashFile tool;ProfileFingerprint=hashJoined [Path.Combine(baseDirectory,"GrowingLogEvidence.qnt");Path.Combine(baseDirectory,"GrowingLogEvidence_test.qnt")];ContractFingerprint=hashFile(Path.Combine(baseDirectory,"Codec.fs"));AdapterFingerprint=hashFile(Path.Combine(baseDirectory,"DataRootPolicy.fs"));ImplementationFingerprint=hashJoined [Path.Combine(baseDirectory,"GrowingLogEvidence.fs");typeof<EvidenceState>.Assembly.Location]}
        let id={RunId="run";SourceSetSha256=String('a',64);ApphostSha256=String('b',64);ClosureSha256=String('c',64);Pid=100;StartTicks="1";Uid=1000;Device="1";Inode="2";Path="/private/infolog.txt"}
        let observe rev bytes sha complete available writer roots={Identity=id;Revision=rev;Bytes=bytes;Sha256=sha;PreviousPrefixIntact=true;WriterPresent=writer;CompleteRecord=complete;Available=available;RootsValid=roots;PendingReason=None}
        let mutable current=GrowingLogEvidence.empty
        let states=ResizeArray<QuintReplayState>()
        let push next roots prefix writer=current<-accepted next;states.Add(state roots prefix writer current)
        let mutable composition:CompositionSession option=None
        let recordGuard identity session roots prefix writer =
            composition<-Some session
            policyPhase<-session.State.Phase;policyInvocation<-identity.InvocationId;policyClosure<-identity.ClosureSha256
            states.Add(state roots prefix writer current)
        let beginReady number roots prefix writer =
            let identity={InvocationId=$"invocation{number}";ClosureSha256=String('c',64);Pid=100;StartTicks="1";Uid=1000}
            let started=PolicyComposition.start identity
            recordGuard identity started roots prefix writer
            let ready=PolicyComposition.ready identity started
            recordGuard identity ready roots prefix writer
            identity
        let evaluateComplete identity roots prefix writer =
            let evaluated=PolicyComposition.evaluated identity composition.Value
            recordGuard identity evaluated roots prefix writer
            match PolicyComposition.finishGuard identity true evaluated with
            | Choice1Of2 completed -> recordGuard identity completed roots prefix writer
            | Choice2Of2 refused -> failwithf "healthy final guard refused: %A" refused
        let identity1=beginReady 1 false false false
        push(GrowingLogEvidence.acquire id current) false false true
        push(GrowingLogEvidence.sample (observe 1 100L (String('c',64)) true true true true) current) true true true
        push(GrowingLogEvidence.validate BrowserAdmission current) true true true
        evaluateComplete identity1 true true true
        push(GrowingLogEvidence.consume BrowserAdmission current) true true true
        policyPhase<-"none";policyInvocation<-"none";policyClosure<-"none"
        push(GrowingLogEvidence.sample (observe 2 120L (String('d',64)) true true true true) current) true true true
        let identity2=beginReady 2 true true true
        push(GrowingLogEvidence.validate Normalization current) true true true
        evaluateComplete identity2 true true true
        push(GrowingLogEvidence.consume Normalization current) true true true
        policyPhase<-"none";policyInvocation<-"none";policyClosure<-"none"
        push(GrowingLogEvidence.sample (observe 3 140L (String('e',64)) true true true true) current) true true true
        let identity3=beginReady 3 true true true
        push(GrowingLogEvidence.validate Release current) true true true
        evaluateComplete identity3 true true true
        push(GrowingLogEvidence.consume Release current) true true true
        let before n=["beginPolicy:invocation"+string n;"readyPolicy:invocation"+string n]
        let after n=["evaluatedPolicy:invocation"+string n;"completePolicy:invocation"+string n]
        let healthyActions=before 1@["acquire";"sampleInitial";"validate:browser"]@after 1@["consume:browser";"benignAppend"]@before 2@["validate:normalization"]@after 2@["consume:normalization";"benignAppend"]@before 3@["validate:release"]@after 3@["consume:release"]
        compareTrace baseDirectory environment "healthy" healthyActions (List.ofSeq states)|>ignore
        let guardProbe={InvocationId="invocation";ClosureSha256=String('c',64);Pid=100;StartTicks="1";Uid=1000}
        current<-GrowingLogEvidence.empty
        let guardStarted=PolicyComposition.start guardProbe
        policyPhase<-guardStarted.State.Phase;policyInvocation<-guardProbe.InvocationId;policyClosure<-guardProbe.ClosureSha256
        let driftStates=ResizeArray<QuintReplayState>()
        driftStates.Add(state false false false current)
        let guardReady=PolicyComposition.ready guardProbe guardStarted
        policyPhase<-guardReady.State.Phase;driftStates.Add(state false false false current)
        current<-GrowingLogEvidence.acquire id current|>accepted;driftStates.Add(state false false true current)
        current<-GrowingLogEvidence.sample (observe 1 100L (String('c',64)) true true true true) current|>accepted;driftStates.Add(state true true true current)
        current<-GrowingLogEvidence.validate BrowserAdmission current|>accepted;driftStates.Add(state true true true current)
        let guardEvaluated=PolicyComposition.evaluated guardProbe guardReady
        policyPhase<-guardEvaluated.State.Phase;driftStates.Add(state true true true current)
        match PolicyComposition.finishGuard guardProbe false guardEvaluated with
        | Choice2Of2 refused when refused.State.StickyInvalid && not(refused.Events|>List.contains ExternalConsumption) ->
            policyPhase<-refused.State.Phase
            current<-{current with Phase="invalid";StickyInvalid=true;Reason=Some "invocation-final-closure"}
            driftStates.Add(state true true true current)
        | other -> failwithf "actual final guard weakening control failed: %A" other
        compareTrace baseDirectory environment "policyClosureDriftIsSticky" (["beginPolicy:invocation";"readyPolicy:invocation";"acquire";"sampleInitial";"validate:browser";"evaluatedPolicy:invocation";"policyDrift"]) (List.ofSeq driftStates)|>ignore
        policyPhase<-"none";policyInvocation<-"none";policyClosure<-"none"
        let initial ()=GrowingLogEvidence.acquire id GrowingLogEvidence.empty |> accepted
        let sampled value=GrowingLogEvidence.sample (observe 1 100L (String('c',64)) true true true true) value |> accepted
        let validated value=GrowingLogEvidence.validate BrowserAdmission value |> accepted
        let consumed value=GrowingLogEvidence.consume BrowserAdmission value |> accepted
        let unavailable value=GrowingLogEvidence.sample (observe 1 0L "" false false false false) value |> transitioned
        let sequence name actions values = compareTrace baseDirectory environment name actions values |> ignore
        let a=initial()
        let s=sampled a
        let v=validated s
        let aState=state false false true a
        let sState=state true true true s
        let vState=state true true true v
        sequence "unavailableAfterValidationRevokesCurrentAuthority" ["acquire";"sampleInitial";"validate:browser";"unavailable"] [aState;sState;vState;state true true false (unavailable v)]
        let guardId={InvocationId="invocation";ClosureSha256=String('c',64);Pid=100;StartTicks="1";Uid=1000}
        current<-GrowingLogEvidence.empty
        let g0=PolicyComposition.start guardId
        policyPhase<-g0.State.Phase
        policyInvocation<-guardId.InvocationId
        policyClosure<-guardId.ClosureSha256
        let gs0=state false false false current
        let g1=PolicyComposition.ready guardId g0
        policyPhase<-g1.State.Phase
        let gs1=state false false false current
        current<-a
        let ga=state false false true a
        current<-s
        let gs=state true true true s
        current<-v
        let gv=state true true true v
        let g2=PolicyComposition.evaluated guardId g1
        policyPhase<-g2.State.Phase
        let gs2=state true true true v
        let g3=match PolicyComposition.finishGuard guardId true g2 with Choice1Of2 value->value|Choice2Of2 value->failwithf "%A" value
        policyPhase<-g3.State.Phase
        let gs3=state true true true v
        let c=consumed v
        sequence "unavailableAfterConsumptionPreservesHistoryOnly" (before 0@["acquire";"sampleInitial";"validate:browser"]@after 0@["consume:browser";"unavailable"]) [gs0;gs1;ga;gs;gv;gs2;gs3;state true true true c;state true true false (unavailable c)]
        policyPhase<-"none";policyInvocation<-"none";policyClosure<-"none"
        let pending=GrowingLogEvidence.sample (observe 1 100L (String('c',64)) false true true false) a |> transitioned
        sequence "pendingTailHasNoAuthority" ["acquire";"pendingTail";"close"] [state false false true a;state false true true pending;state false true true (GrowingLogEvidence.close pending)]
        let stale=GrowingLogEvidence.consume Normalization v |> transitioned
        sequence "staleBoundaryCannotConsume" ["acquire";"sampleInitial";"validate:browser";"staleBoundary"] [state false false true a;state true true true s;state true true true v;state true true true stale]
        sequence "closeRevokesCurrentAuthority" ["acquire";"sampleInitial";"validate:browser";"close"] [state false false true a;state true true true s;state true true true v;state true true true (GrowingLogEvidence.close v)]

        // Settlement steps are mechanical: replay them against the exact same
        // production reducer state. Only the complete candidate is submitted
        // to GrowingLogEvidence.sample and advances its revision.
        policyPhase<-"none";policyInvocation<-"none";policyClosure<-"none"
        let waitStates=ResizeArray<QuintReplayState>()
        waitStates.Add(state false false true a)
        waitStates.Add(stateWithSettlement "probing" 32 true false false true a)
        waitStates.Add(stateWithSettlement "probing" 31 true false false true a)
        waitStates.Add(stateWithSettlement "candidate" 30 true false false true a)
        waitStates.Add(stateWithSettlement "candidate" 30 true true true true s)
        let waitGuard=PolicyComposition.start guardId
        policyPhase<-waitGuard.State.Phase;policyInvocation<-guardId.InvocationId;policyClosure<-guardId.ClosureSha256
        waitStates.Add(stateWithSettlement "candidate" 30 true true true true s)
        let waitReady=PolicyComposition.ready guardId waitGuard
        policyPhase<-waitReady.State.Phase;waitStates.Add(stateWithSettlement "candidate" 30 true true true true s)
        let waitValidated=GrowingLogEvidence.validate BrowserAdmission s|>accepted
        waitStates.Add(stateWithSettlement "candidate" 30 true true true true waitValidated)
        let waitEvaluated=PolicyComposition.evaluated guardId waitReady
        policyPhase<-waitEvaluated.State.Phase;waitStates.Add(stateWithSettlement "candidate" 30 true true true true waitValidated)
        let waitCompleted=match PolicyComposition.finishGuard guardId true waitEvaluated with Choice1Of2 value->value|Choice2Of2 value->failwithf "%A" value
        policyPhase<-waitCompleted.State.Phase;waitStates.Add(stateWithSettlement "candidate" 30 true true true true waitValidated)
        let waitConsumed=GrowingLogEvidence.consume BrowserAdmission waitValidated|>accepted
        waitStates.Add(stateWithSettlement "candidate" 30 true true true true waitConsumed)
        sequence "completeRecordWaitThenConsume" ["acquire";"beginSettlement";"incompleteRecordProbe";"completeRecordCandidate";"sampleInitial";"beginPolicy:invocation";"readyPolicy:invocation";"validate:browser";"evaluatedPolicy:invocation";"completePolicy:invocation";"consume:browser"] (List.ofSeq waitStates)

        policyPhase<-"none";policyInvocation<-"none";policyClosure<-"none"
        let exhaustedStates=ResizeArray<QuintReplayState>()
        exhaustedStates.Add(state false false true a)
        exhaustedStates.Add(stateWithSettlement "probing" 32 true false false true a)
        for remaining in 31..-1..0 do exhaustedStates.Add(stateWithSettlement "probing" remaining true false false true a)
        exhaustedStates.Add(stateWithSettlement "refused" 0 true false false true a)
        sequence "completeRecordWaitExhausted" (["acquire";"beginSettlement"] @ List.replicate 32 "incompleteRecordProbe" @ ["recordSettlementExhausted"]) (List.ofSeq exhaustedStates)
        sequence "completeRecordWaitDeadline" ["acquire";"beginSettlement";"incompleteRecordProbe";"recordSettlementDeadline"] [state false false true a;stateWithSettlement "probing" 32 true false false true a;stateWithSettlement "probing" 31 true false false true a;stateWithSettlement "deadline" 31 false false false true a]

        let afterConsumeStates=ResizeArray<QuintReplayState>()
        afterConsumeStates.Add(state false false true a)
        afterConsumeStates.Add(stateWithSettlement "probing" 32 true false false true a)
        afterConsumeStates.Add(stateWithSettlement "candidate" 31 true false false true a)
        afterConsumeStates.Add(stateWithSettlement "candidate" 31 true true true true s)
        let afterGuard=PolicyComposition.start guardId
        policyPhase<-afterGuard.State.Phase;policyInvocation<-guardId.InvocationId;policyClosure<-guardId.ClosureSha256
        afterConsumeStates.Add(stateWithSettlement "candidate" 31 true true true true s)
        let afterReady=PolicyComposition.ready guardId afterGuard
        policyPhase<-afterReady.State.Phase;afterConsumeStates.Add(stateWithSettlement "candidate" 31 true true true true s)
        let afterValidated=GrowingLogEvidence.validate BrowserAdmission s|>accepted
        afterConsumeStates.Add(stateWithSettlement "candidate" 31 true true true true afterValidated)
        let afterEvaluated=PolicyComposition.evaluated guardId afterReady
        policyPhase<-afterEvaluated.State.Phase;afterConsumeStates.Add(stateWithSettlement "candidate" 31 true true true true afterValidated)
        let afterCompleted=match PolicyComposition.finishGuard guardId true afterEvaluated with Choice1Of2 value->value|Choice2Of2 value->failwithf "%A" value
        policyPhase<-afterCompleted.State.Phase;afterConsumeStates.Add(stateWithSettlement "candidate" 31 true true true true afterValidated)
        let afterConsumed=GrowingLogEvidence.consume BrowserAdmission afterValidated|>accepted
        afterConsumeStates.Add(stateWithSettlement "candidate" 31 true true true true afterConsumed)
        afterConsumeStates.Add(stateWithSettlement "probing" 32 true true true true afterConsumed)
        afterConsumeStates.Add(stateWithSettlement "probing" 31 true true true true afterConsumed)
        sequence "waitAfterConsumptionHasNoNewAuthority" ["acquire";"beginSettlement";"completeRecordCandidate";"sampleInitial";"beginPolicy:invocation";"readyPolicy:invocation";"validate:browser";"evaluatedPolicy:invocation";"completePolicy:invocation";"consume:browser";"beginSettlement";"incompleteRecordProbe"] (List.ofSeq afterConsumeStates)

        policyPhase<-"none";policyInvocation<-"none";policyClosure<-"none"
        let completedPending=GrowingLogEvidence.sample (observe 2 120L (String('d',64)) true true true true) pending|>accepted
        sequence "pendingThenCompleteResample" ["acquire";"pendingTail";"beginSettlement";"incompleteRecordProbe";"completeRecordCandidate";"pendingCompleteResample"] [state false false true a;state false true true pending;stateWithSettlement "probing" 32 true false true true pending;stateWithSettlement "probing" 31 true false true true pending;stateWithSettlement "candidate" 30 true false true true pending;stateWithSettlement "candidate" 30 true true true true completedPending]
