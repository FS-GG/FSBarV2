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
    let private stateWithSettlement settlementPhase settlementBoundary settlementRemaining deadlineAvailable rootsValid prefixIntact writerPresent (value: EvidenceState) =
        let present=value.Identity.IsSome
        let settlement=Record ["phase",Text settlementPhase;"boundary",Text settlementBoundary;"remaining",Integer(string settlementRemaining);"deadlineAvailable",Boolean deadlineAvailable]
        let record=Record ["phase",Text value.Phase;"generation",Integer(if present then "1" else "0");"observedRevision",Integer(string value.ObservedRevision);"validatedRevision",Integer(string value.ValidatedRevision);"intendedBoundary",Text(boundaryText value.ValidatedBoundary);"consumedRevision",Integer(string value.ConsumedRevision);"consumedBoundary",Text(boundaryText value.ConsumedBoundary);"producerMatches",Boolean present;"logMatches",Boolean present;"sourceMatches",Boolean present;"rootsValid",Boolean rootsValid;"prefixIntact",Boolean prefixIntact;"writerPresent",Boolean writerPresent;"authorityActive",Boolean(value.Phase="validated" && not value.StickyInvalid);"stickyInvalid",Boolean value.StickyInvalid;"policyPhase",Text policyPhase;"policyInvocation",Text policyInvocation;"policyClosure",Text policyClosure;"settlement",settlement]
        let draft={Identity="";Bindings=["evidence",record]}
        {draft with Identity=QuintReplay.stateFingerprint draft |> unwrap}
    let private state rootsValid prefixIntact writerPresent value = stateWithSettlement "idle" "none" 32 true rootsValid prefixIntact writerPresent value
    let private accepted = function Accepted value -> value | other -> failwithf "%A" other
    let private transitioned = function Accepted value|Pending value|Refused value|Unknown value -> value
    let private compareTrace baseDirectory environment name actions projected =
        let context={Environment=environment;Steps=actions|>List.mapi(fun index action->{Index=index+1;Action=action;Source=source})}
        let trace=QuintReplay.decodeItf context (File.ReadAllText(Path.Combine(baseDirectory,$"GrowingLogEvidence.{name}.itf.json"))) |> unwrap
        let observations=projected|>List.mapi(fun index actual->{Index=index+1;Action=actions[index];Source=source;Actual=actual})
        match QuintReplay.compare trace observations |> unwrap with QuintReplayResult.Equivalent -> trace,observations | other -> failwithf "%s reducer/model divergence: %A" name other
    let run baseDirectory =
        let requiredEnvironment name =
            match Environment.GetEnvironmentVariable name with
            | null | "" -> failwithf "required correspondence input absent: %s" name
            | value -> Path.GetFullPath value
        let transcriptPath=requiredEnvironment "BAR_SETTLEMENT_TRANSCRIPT"
        let helperRoot=requiredEnvironment "BAR_GROWING_LOG_HELPER"
        let helperPath=Path.Combine(helperRoot,"growing_log.py")
        if not(File.Exists transcriptPath && File.Exists helperPath) then failwith "required correspondence artifact absent"
        use transcriptDocument=JsonDocument.Parse(File.ReadAllBytes transcriptPath)
        let transcript=transcriptDocument.RootElement
        let exactNames (element:JsonElement) names =
            let actual=element.EnumerateObject()|>Seq.map _.Name|>Set.ofSeq
            if actual<>set names then failwith "closed settlement transcript object"
        exactNames transcript ["schema";"helperSha256";"scenarios"]
        if transcript.GetProperty("schema").GetString()<>"fsbar.barc-complete-record-settlement-correspondence/v1" || transcript.GetProperty("helperSha256").GetString()<>hashFile helperPath then failwith "settlement helper/transcript binding"
        let scenarios=transcript.GetProperty("scenarios").EnumerateArray()|>Seq.toArray
        if scenarios.Length<>6 then failwith "closed settlement scenario census"
        let scenario name =
            let matches=scenarios|>Array.filter(fun row->exactNames row ["name";"events";"effects"];row.GetProperty("name").GetString()=name)
            if matches.Length<>1 then failwithf "required settlement scenario absent/duplicate: %s" name
            matches[0]
        let events name =
            scenario name|>fun row->row.GetProperty("events").EnumerateArray()|>Seq.mapi(fun index event->
                exactNames event ["event";"probe";"remaining"]
                let kind=event.GetProperty("event").GetString()
                let probe=event.GetProperty("probe").GetInt32()
                let remaining=event.GetProperty("remaining").GetInt32()
                if (kind<>"incomplete" && kind<>"complete") || probe<>index+1 || remaining<>32-probe then failwithf "noncausal settlement event: %s" name
                kind,probe,remaining)|>Seq.toList
        let effects name =
            let value=(scenario name).GetProperty("effects")
            exactNames value ["policyCalls";"revisions";"outcome";"check";"beforeState";"afterState"]
            value
        let requireEffects name calls revisions outcome check =
            let value=effects name
            let actualRevisions=value.GetProperty("revisions").EnumerateArray()|>Seq.map _.GetInt32()|>Seq.toList
            let actualCheck=if value.GetProperty("check").ValueKind=JsonValueKind.Null then None else Some(value.GetProperty("check").GetString())
            if value.GetProperty("policyCalls").GetInt32()<>calls || actualRevisions<>revisions || value.GetProperty("outcome").GetString()<>outcome || actualCheck<>check then failwithf "settlement effects mismatch: %s" name
        requireEffects "completeRecordWaitThenConsume" 1 [1] "accepted" None
        requireEffects "completeRecordWaitExhausted" 0 [] "refused" (Some "infolog-record-settlement-exhausted")
        requireEffects "completeRecordWaitDeadline" 0 [] "deadline" (Some "infolog-record-settlement-deadline")
        requireEffects "sharedBudgetAcrossEvaluations" 1 [1] "refused" (Some "infolog-record-settlement-exhausted")
        requireEffects "pendingThenCompleteResample" 2 [1;2] "accepted" None
        requireEffects "waitAfterConsumptionHasNoNewAuthority" 0 [] "refused" (Some "infolog-record-settlement-exhausted")
        for name in ["completeRecordWaitExhausted";"completeRecordWaitDeadline"] do
            let value=effects name
            if value.GetProperty("beforeState").ValueKind<>JsonValueKind.Null || value.GetProperty("afterState").ValueKind<>JsonValueKind.Null then failwithf "mechanical wait changed production state: %s" name
        let historical=effects "waitAfterConsumptionHasNoNewAuthority"
        if historical.GetProperty("beforeState").GetRawText()<>historical.GetProperty("afterState").GetRawText() then failwith "wait changed historical production state"
        let requireProductionState name (element:JsonElement) (value:EvidenceState) =
            exactNames element ["phase";"observedRevision";"validatedRevision";"validatedBoundary";"consumedRevision";"consumedBoundary";"bytes";"sha256";"stickyInvalid";"reason";"identitySha256"]
            let optionalText (property:string) = let item=element.GetProperty property in if item.ValueKind=JsonValueKind.Null then None else Some(item.GetString())
            let validDigest (property:string) = let text=element.GetProperty(property).GetString() in text.Length=64 && text|>Seq.forall(fun c->Char.IsDigit c || (c>='a' && c<='f'))
            let boundaryOptionText = function Some boundary->Some(boundaryText(Some boundary))|None->None
            if element.GetProperty("phase").GetString()<>value.Phase || element.GetProperty("observedRevision").GetInt32()<>value.ObservedRevision || element.GetProperty("validatedRevision").GetInt32()<>value.ValidatedRevision || optionalText "validatedBoundary"<>boundaryOptionText value.ValidatedBoundary || element.GetProperty("consumedRevision").GetInt32()<>value.ConsumedRevision || optionalText "consumedBoundary"<>boundaryOptionText value.ConsumedBoundary || element.GetProperty("stickyInvalid").GetBoolean()<>value.StickyInvalid || optionalText "reason"<>value.Reason || element.GetProperty("bytes").GetInt64()<0L || not(validDigest "sha256" && validDigest "identitySha256") then failwithf "production settlement state mismatch: %s" name
        policyPhase<-"none";policyInvocation<-"none";policyClosure<-"none"
        let tool=locate "quint"
        let environment={Seed="424242";Bounds=["revisions",3L;"generations",2L];ToolFingerprint=hashFile tool;ProfileFingerprint=hashJoined [Path.Combine(baseDirectory,"GrowingLogEvidence.qnt");Path.Combine(baseDirectory,"GrowingLogEvidence_test.qnt")];ContractFingerprint=hashFile(Path.Combine(baseDirectory,"Codec.fs"));AdapterFingerprint=hashJoined [Path.Combine(baseDirectory,"DataRootPolicy.fs");helperPath;transcriptPath];ImplementationFingerprint=hashJoined [Path.Combine(baseDirectory,"GrowingLogEvidence.fs");typeof<EvidenceState>.Assembly.Location]}
        let id={RunId="run";SourceSetSha256=String('a',64);ApphostSha256=String('b',64);ClosureSha256=String('c',64);Pid=100;StartTicks="1";Uid=1000;Device="1";Inode="2";Path="/private/infolog.txt"}
        let observe rev bytes sha complete available writer roots={Identity=id;Revision=rev;Bytes=bytes;Sha256=sha;PreviousPrefixIntact=true;WriterPresent=writer;CompleteRecord=complete;Available=available;RootsValid=roots;PendingReason=None}
        let observePending rev bytes sha={observe rev bytes sha false true true false with PendingReason=Some "isolation-record-absent"}
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
        states.Add(state true true true current)
        policyPhase<-"none";policyInvocation<-"none";policyClosure<-"none"
        push(GrowingLogEvidence.sample (observe 2 120L (String('d',64)) true true true true) current) true true true
        let identity2=beginReady 2 true true true
        push(GrowingLogEvidence.validate Normalization current) true true true
        evaluateComplete identity2 true true true
        push(GrowingLogEvidence.consume Normalization current) true true true
        states.Add(state true true true current)
        policyPhase<-"none";policyInvocation<-"none";policyClosure<-"none"
        push(GrowingLogEvidence.sample (observe 3 140L (String('e',64)) true true true true) current) true true true
        let identity3=beginReady 3 true true true
        push(GrowingLogEvidence.validate Release current) true true true
        evaluateComplete identity3 true true true
        push(GrowingLogEvidence.consume Release current) true true true
        states.Add(state true true true current)
        let before n=["beginPolicy:invocation"+string n;"readyPolicy:invocation"+string n]
        let after n=["evaluatedPolicy:invocation"+string n;"completePolicy:invocation"+string n]
        let healthyActions=before 1@["acquire";"sampleInitial";"validate:browser"]@after 1@["consume:browser";"completeBoundary:browser";"benignAppend"]@before 2@["validate:normalization"]@after 2@["consume:normalization";"completeBoundary:normalization";"benignAppend"]@before 3@["validate:release"]@after 3@["consume:release";"completeBoundary:release"]
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

        // Settlement projections are driven by freshly emitted helper events.
        let appendEventStates (target:ResizeArray<QuintReplayState>) boundary roots prefix writer reducerState rows =
            for kind,_,remaining in rows do
                let phase=if kind="complete" then "candidate" else "probing"
                target.Add(stateWithSettlement phase boundary remaining true roots prefix writer reducerState)
        let eventActions rows = rows|>List.map(fun (kind,_,_)->if kind="complete" then "completeRecordCandidate" else "incompleteRecordProbe")

        policyPhase<-"none";policyInvocation<-"none";policyClosure<-"none"
        let completionEvents=events "completeRecordWaitThenConsume"
        let waitStates=ResizeArray<QuintReplayState>()
        waitStates.Add(state false false true a)
        waitStates.Add(stateWithSettlement "probing" "browser" 32 true false false true a)
        appendEventStates waitStates "browser" false false true a completionEvents
        let completionRemaining=completionEvents|>List.last|>fun (_,_,remaining)->remaining
        waitStates.Add(stateWithSettlement "candidate" "browser" completionRemaining true true true true s)
        let waitGuard=PolicyComposition.start guardId
        policyPhase<-waitGuard.State.Phase;policyInvocation<-guardId.InvocationId;policyClosure<-guardId.ClosureSha256
        waitStates.Add(stateWithSettlement "candidate" "browser" completionRemaining true true true true s)
        let waitReady=PolicyComposition.ready guardId waitGuard
        policyPhase<-waitReady.State.Phase;waitStates.Add(stateWithSettlement "candidate" "browser" completionRemaining true true true true s)
        let waitValidated=GrowingLogEvidence.validate BrowserAdmission s|>accepted
        waitStates.Add(stateWithSettlement "candidate" "browser" completionRemaining true true true true waitValidated)
        let waitEvaluated=PolicyComposition.evaluated guardId waitReady
        policyPhase<-waitEvaluated.State.Phase;waitStates.Add(stateWithSettlement "candidate" "browser" completionRemaining true true true true waitValidated)
        let waitCompleted=match PolicyComposition.finishGuard guardId true waitEvaluated with Choice1Of2 value->value|Choice2Of2 value->failwithf "%A" value
        policyPhase<-waitCompleted.State.Phase;waitStates.Add(stateWithSettlement "candidate" "browser" completionRemaining true true true true waitValidated)
        let waitConsumed=GrowingLogEvidence.consume BrowserAdmission waitValidated|>accepted
        requireProductionState "completeRecordWaitThenConsume" ((effects "completeRecordWaitThenConsume").GetProperty("afterState")) waitConsumed
        waitStates.Add(stateWithSettlement "candidate" "browser" completionRemaining true true true true waitConsumed)
        sequence "completeRecordWaitThenConsume" (["acquire";"beginSettlement:browser"]@eventActions completionEvents@["sampleInitial";"beginPolicy:invocation";"readyPolicy:invocation";"validate:browser";"evaluatedPolicy:invocation";"completePolicy:invocation";"consume:browser"]) (List.ofSeq waitStates)

        policyPhase<-"none";policyInvocation<-"none";policyClosure<-"none"
        let exhaustedEvents=events "completeRecordWaitExhausted"
        let exhaustedStates=ResizeArray<QuintReplayState>()
        exhaustedStates.Add(state false false true a)
        exhaustedStates.Add(stateWithSettlement "probing" "browser" 32 true false false true a)
        appendEventStates exhaustedStates "browser" false false true a exhaustedEvents
        exhaustedStates.Add(stateWithSettlement "refused" "browser" 0 true false false true a)
        sequence "completeRecordWaitExhausted" (["acquire";"beginSettlement:browser"]@eventActions exhaustedEvents@["recordSettlementExhausted"]) (List.ofSeq exhaustedStates)

        let deadlineEvents=events "completeRecordWaitDeadline"
        let deadlineStates=ResizeArray<QuintReplayState>()
        deadlineStates.Add(state false false true a)
        deadlineStates.Add(stateWithSettlement "probing" "browser" 32 true false false true a)
        appendEventStates deadlineStates "browser" false false true a deadlineEvents
        let deadlineRemaining=deadlineEvents|>List.last|>fun (_,_,remaining)->remaining
        deadlineStates.Add(stateWithSettlement "deadline" "browser" deadlineRemaining false false false true a)
        sequence "completeRecordWaitDeadline" (["acquire";"beginSettlement:browser"]@eventActions deadlineEvents@["recordSettlementDeadline"]) (List.ofSeq deadlineStates)

        policyPhase<-"none";policyInvocation<-"none";policyClosure<-"none"
        let sharedEvents=events "sharedBudgetAcrossEvaluations"
        let sharedFirst=sharedEvents|>List.head
        if (sharedFirst|>fun (kind,_,_)->kind)<>"complete" then failwith "shared budget first candidate absent"
        let sharedRemaining=sharedFirst|>fun (_,_,remaining)->remaining
        let sharedStates=ResizeArray<QuintReplayState>()
        sharedStates.Add(state false false true a)
        sharedStates.Add(stateWithSettlement "probing" "browser" 32 true false false true a)
        sharedStates.Add(stateWithSettlement "candidate" "browser" sharedRemaining true false false true a)
        sharedStates.Add(stateWithSettlement "candidate" "browser" sharedRemaining true true true true s)
        let sharedGuard=PolicyComposition.start guardId
        policyPhase<-sharedGuard.State.Phase;policyInvocation<-guardId.InvocationId;policyClosure<-guardId.ClosureSha256
        sharedStates.Add(stateWithSettlement "candidate" "browser" sharedRemaining true true true true s)
        let sharedReady=PolicyComposition.ready guardId sharedGuard
        policyPhase<-sharedReady.State.Phase;sharedStates.Add(stateWithSettlement "candidate" "browser" sharedRemaining true true true true s)
        let sharedValidated=GrowingLogEvidence.validate BrowserAdmission s|>accepted
        sharedStates.Add(stateWithSettlement "candidate" "browser" sharedRemaining true true true true sharedValidated)
        let sharedEvaluated=PolicyComposition.evaluated guardId sharedReady
        policyPhase<-sharedEvaluated.State.Phase;sharedStates.Add(stateWithSettlement "candidate" "browser" sharedRemaining true true true true sharedValidated)
        let sharedCompleted=match PolicyComposition.finishGuard guardId true sharedEvaluated with Choice1Of2 value->value|Choice2Of2 value->failwithf "%A" value
        policyPhase<-sharedCompleted.State.Phase;sharedStates.Add(stateWithSettlement "candidate" "browser" sharedRemaining true true true true sharedValidated)
        let sharedConsumed=GrowingLogEvidence.consume BrowserAdmission sharedValidated|>accepted
        requireProductionState "sharedBudgetAcrossEvaluations" ((effects "sharedBudgetAcrossEvaluations").GetProperty("afterState")) sharedConsumed
        sharedStates.Add(stateWithSettlement "candidate" "browser" sharedRemaining true true true true sharedConsumed)
        sharedStates.Add(stateWithSettlement "probing" "browser" sharedRemaining true true true true sharedConsumed)
        appendEventStates sharedStates "browser" true true true sharedConsumed (sharedEvents|>List.tail)
        sharedStates.Add(stateWithSettlement "refused" "browser" 0 true true true true sharedConsumed)
        sequence "sharedBudgetAcrossEvaluations" (["acquire";"beginSettlement:browser";"completeRecordCandidate";"sampleInitial";"beginPolicy:invocation";"readyPolicy:invocation";"validate:browser";"evaluatedPolicy:invocation";"completePolicy:invocation";"consume:browser";"retrySettlement:browser"]@eventActions(sharedEvents|>List.tail)@["recordSettlementExhausted"]) (List.ofSeq sharedStates)

        policyPhase<-"none";policyInvocation<-"none";policyClosure<-"none"
        let pendingEvents=events "pendingThenCompleteResample"
        if pendingEvents|>List.map(fun (kind,_,_)->kind)<>["complete";"incomplete";"complete"] then failwith "actual pending resample event order"
        let pendingStates=ResizeArray<QuintReplayState>()
        pendingStates.Add(state false false true a)
        pendingStates.Add(stateWithSettlement "probing" "browser" 32 true false false true a)
        let _,_,pendingR1=pendingEvents[0]
        pendingStates.Add(stateWithSettlement "candidate" "browser" pendingR1 true false false true a)
        let pending1=GrowingLogEvidence.sample (observePending 1 100L (String('c',64))) a|>transitioned
        pendingStates.Add(stateWithSettlement "candidate" "browser" pendingR1 true false true true pending1)
        pendingStates.Add(stateWithSettlement "probing" "browser" pendingR1 true false true true pending1)
        let _,_,pendingR2=pendingEvents[1]
        pendingStates.Add(stateWithSettlement "probing" "browser" pendingR2 true false true true pending1)
        let _,_,pendingR3=pendingEvents[2]
        pendingStates.Add(stateWithSettlement "candidate" "browser" pendingR3 true false true true pending1)
        let pending2=GrowingLogEvidence.sample (observe 2 120L (String('d',64)) true true true true) pending1|>accepted
        pendingStates.Add(stateWithSettlement "candidate" "browser" pendingR3 true true true true pending2)
        let pendingGuard=PolicyComposition.start guardId
        policyPhase<-pendingGuard.State.Phase;policyInvocation<-guardId.InvocationId;policyClosure<-guardId.ClosureSha256
        pendingStates.Add(stateWithSettlement "candidate" "browser" pendingR3 true true true true pending2)
        let pendingReady=PolicyComposition.ready guardId pendingGuard
        policyPhase<-pendingReady.State.Phase;pendingStates.Add(stateWithSettlement "candidate" "browser" pendingR3 true true true true pending2)
        let pendingValidated=GrowingLogEvidence.validate BrowserAdmission pending2|>accepted
        pendingStates.Add(stateWithSettlement "candidate" "browser" pendingR3 true true true true pendingValidated)
        let pendingEvaluated=PolicyComposition.evaluated guardId pendingReady
        policyPhase<-pendingEvaluated.State.Phase;pendingStates.Add(stateWithSettlement "candidate" "browser" pendingR3 true true true true pendingValidated)
        let pendingCompleted=match PolicyComposition.finishGuard guardId true pendingEvaluated with Choice1Of2 value->value|Choice2Of2 value->failwithf "%A" value
        policyPhase<-pendingCompleted.State.Phase;pendingStates.Add(stateWithSettlement "candidate" "browser" pendingR3 true true true true pendingValidated)
        let pendingConsumed=GrowingLogEvidence.consume BrowserAdmission pendingValidated|>accepted
        requireProductionState "pendingThenCompleteResample" ((effects "pendingThenCompleteResample").GetProperty("afterState")) pendingConsumed
        pendingStates.Add(stateWithSettlement "candidate" "browser" pendingR3 true true true true pendingConsumed)
        sequence "pendingThenCompleteResample" ["acquire";"beginSettlement:browser";"completeRecordCandidate";"pendingTail";"retrySettlement:browser";"incompleteRecordProbe";"completeRecordCandidate";"pendingCompleteResample";"beginPolicy:invocation";"readyPolicy:invocation";"validate:browser";"evaluatedPolicy:invocation";"completePolicy:invocation";"consume:browser"] (List.ofSeq pendingStates)

        policyPhase<-"none";policyInvocation<-"none";policyClosure<-"none"
        let afterEvents=events "waitAfterConsumptionHasNoNewAuthority"
        let afterConsumeStates=ResizeArray<QuintReplayState>()
        afterConsumeStates.Add(state false false true a)
        afterConsumeStates.Add(stateWithSettlement "probing" "browser" 32 true false false true a)
        afterConsumeStates.Add(stateWithSettlement "candidate" "browser" 31 true false false true a)
        afterConsumeStates.Add(stateWithSettlement "candidate" "browser" 31 true true true true s)
        let afterGuard=PolicyComposition.start guardId
        policyPhase<-afterGuard.State.Phase;policyInvocation<-guardId.InvocationId;policyClosure<-guardId.ClosureSha256
        afterConsumeStates.Add(stateWithSettlement "candidate" "browser" 31 true true true true s)
        let afterReady=PolicyComposition.ready guardId afterGuard
        policyPhase<-afterReady.State.Phase;afterConsumeStates.Add(stateWithSettlement "candidate" "browser" 31 true true true true s)
        let afterValidated=GrowingLogEvidence.validate BrowserAdmission s|>accepted
        afterConsumeStates.Add(stateWithSettlement "candidate" "browser" 31 true true true true afterValidated)
        let afterEvaluated=PolicyComposition.evaluated guardId afterReady
        policyPhase<-afterEvaluated.State.Phase;afterConsumeStates.Add(stateWithSettlement "candidate" "browser" 31 true true true true afterValidated)
        let afterCompleted=match PolicyComposition.finishGuard guardId true afterEvaluated with Choice1Of2 value->value|Choice2Of2 value->failwithf "%A" value
        policyPhase<-afterCompleted.State.Phase;afterConsumeStates.Add(stateWithSettlement "candidate" "browser" 31 true true true true afterValidated)
        let afterConsumed=GrowingLogEvidence.consume BrowserAdmission afterValidated|>accepted
        requireProductionState "waitAfterConsumptionHasNoNewAuthority" (historical.GetProperty("beforeState")) afterConsumed
        afterConsumeStates.Add(stateWithSettlement "candidate" "browser" 31 true true true true afterConsumed)
        afterConsumeStates.Add(stateWithSettlement "idle" "none" 31 true true true true afterConsumed)
        afterConsumeStates.Add(stateWithSettlement "probing" "normalization" 32 true true true true afterConsumed)
        appendEventStates afterConsumeStates "normalization" true true true afterConsumed afterEvents
        afterConsumeStates.Add(stateWithSettlement "refused" "normalization" 0 true true true true afterConsumed)
        sequence "waitAfterConsumptionHasNoNewAuthority" (["acquire";"beginSettlement:browser";"completeRecordCandidate";"sampleInitial";"beginPolicy:invocation";"readyPolicy:invocation";"validate:browser";"evaluatedPolicy:invocation";"completePolicy:invocation";"consume:browser";"completeBoundary:browser";"beginSettlement:normalization"]@eventActions afterEvents@["recordSettlementExhausted"]) (List.ofSeq afterConsumeStates)
