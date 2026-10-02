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
        if transcript.GetProperty("schema").GetString()<>"fsbar.barc-complete-record-settlement-correspondence/v2" || transcript.GetProperty("helperSha256").GetString()<>hashFile helperPath then failwith "settlement helper/transcript binding"
        let scenarios=transcript.GetProperty("scenarios").EnumerateArray()|>Seq.toArray
        if scenarios.Length<>7 then failwith "closed settlement scenario census"
        let scenario name =
            let matches=scenarios|>Array.filter(fun row->exactNames row ["name";"timeline"];row.GetProperty("name").GetString()=name)
            if matches.Length<>1 then failwithf "required settlement scenario absent/duplicate: %s" name
            matches[0]
        let timeline name=(scenario name).GetProperty("timeline").EnumerateArray()|>Seq.toArray
        let events name =
            timeline name|>Array.filter(fun event->event.GetProperty("kind").GetString()="probe")|>Array.mapi(fun index event->
                exactNames event ["kind";"event";"probe";"remaining"]
                let kind=event.GetProperty("event").GetString()
                let probe=event.GetProperty("probe").GetInt32()
                let remaining=event.GetProperty("remaining").GetInt32()
                if (kind<>"incomplete" && kind<>"complete") || probe<>index+1 || remaining<>32-probe then failwithf "noncausal settlement event: %s" name
                kind,probe,remaining)|>Array.toList
        let parseBoundary = function "browser"->BrowserAdmission|"normalization"->Normalization|"release"->Release|value->failwithf "closed boundary: %s" value
        let optionalText (element:JsonElement) (property:string) =
            let item=element.GetProperty property
            if item.ValueKind=JsonValueKind.Null then None else Some(item.GetString())
        let parseIdentity (element:JsonElement) =
            exactNames element ["runId";"sourceSetSha256";"apphostSha256";"closureSha256";"pid";"startTicks";"uid";"device";"inode";"path"]
            {RunId=element.GetProperty("runId").GetString();SourceSetSha256=element.GetProperty("sourceSetSha256").GetString();ApphostSha256=element.GetProperty("apphostSha256").GetString();ClosureSha256=element.GetProperty("closureSha256").GetString();Pid=element.GetProperty("pid").GetInt32();StartTicks=element.GetProperty("startTicks").GetString();Uid=element.GetProperty("uid").GetInt32();Device=element.GetProperty("device").GetString();Inode=element.GetProperty("inode").GetString();Path=element.GetProperty("path").GetString()}
        let parseState (element:JsonElement) =
            exactNames element ["phase";"observedRevision";"validatedRevision";"validatedBoundary";"consumedRevision";"consumedBoundary";"bytes";"sha256";"stickyInvalid";"reason";"identity"]
            let identity=element.GetProperty("identity")
            { Phase=element.GetProperty("phase").GetString()
              Identity=(if identity.ValueKind=JsonValueKind.Null then None else Some(parseIdentity identity))
              ObservedRevision=element.GetProperty("observedRevision").GetInt32()
              ValidatedRevision=element.GetProperty("validatedRevision").GetInt32()
              ValidatedBoundary=optionalText element "validatedBoundary"|>Option.map parseBoundary
              ConsumedRevision=element.GetProperty("consumedRevision").GetInt32()
              ConsumedBoundary=optionalText element "consumedBoundary"|>Option.map parseBoundary
              Bytes=element.GetProperty("bytes").GetInt64()
              Sha256=element.GetProperty("sha256").GetString()
              StickyInvalid=element.GetProperty("stickyInvalid").GetBoolean()
              Reason=optionalText element "reason" }
        let parseNullableState (element:JsonElement)=if element.ValueKind=JsonValueKind.Null then None else Some(parseState element)
        let transitionState = function Accepted value|Pending value|Refused value|Unknown value->value
        let verifyTimeline name expectedPolicies expectedOutcome expectedCheck =
            let rows=timeline name
            if rows.Length=0 then failwithf "empty settlement timeline: %s" name
            let tokens=rows|>Array.map(fun row->
                match row.GetProperty("kind").GetString() with
                | "probe"->"probe:"+row.GetProperty("event").GetString()
                | "policy"->"policy:"+row.GetProperty("status").GetString()
                | "terminal"->"terminal:"+row.GetProperty("outcome").GetString()
                | "historical"->"historical"
                | other->"unknown:"+other)|>Array.toList
            let expectedTokens=
                match name with
                | "completeRecordWaitThenConsume"->["probe:incomplete";"probe:complete";"policy:accepted";"terminal:accepted"]
                | "completeRecordWaitExhausted"->List.replicate 32 "probe:incomplete"@["terminal:refused"]
                | "completeRecordWaitDeadline"->["probe:incomplete";"terminal:deadline"]
                | "sharedBudgetAcrossEvaluations"->["probe:complete";"policy:accepted"]@List.replicate 31 "probe:incomplete"@["terminal:refused"]
                | "pendingThenCompleteResample"->["probe:complete";"policy:pending";"probe:incomplete";"probe:complete";"policy:accepted";"terminal:accepted"]
                | "waitAfterConsumptionHasNoNewAuthority"->["historical"]@List.replicate 32 "probe:incomplete"@["terminal:refused"]
                | "lastProbeCandidateThenExhausted"->List.replicate 31 "probe:incomplete"@["probe:complete";"policy:accepted";"terminal:refused"]
                | _->failwithf "unknown settlement scenario: %s" name
            if tokens<>expectedTokens then failwithf "ordered timeline/canonical action join: %s" name
            let terminals=rows|>Array.indexed|>Array.filter(fun (_,row)->row.GetProperty("kind").GetString()="terminal")
            if terminals.Length<>1 || fst terminals[0]<>rows.Length-1 then failwithf "terminal ordering: %s" name
            let terminal=snd terminals[0]
            exactNames terminal ["kind";"outcome";"check";"state"]
            let check=optionalText terminal "check"
            if terminal.GetProperty("outcome").GetString()<>expectedOutcome || check<>expectedCheck then failwithf "terminal result mismatch: %s" name
            let mutable candidateAvailable=false
            let mutable terminalSeen=false
            let mutable lastConcrete:EvidenceState option=None
            let mutable probeCount=0
            let mutable policyCount=0
            for row in rows do
                let kind=row.GetProperty("kind").GetString()
                if terminalSeen then failwithf "effect after terminal: %s" name
                match kind with
                | "probe" ->
                    probeCount<-probeCount+1
                    if probeCount>32 || row.GetProperty("probe").GetInt32()<>probeCount then failwithf "settlement probe bound/order: %s" name
                    if row.GetProperty("event").GetString()="complete" then
                        if candidateAvailable then failwithf "unconsumed complete candidate: %s" name
                        candidateAvailable<-true
                    else candidateAvailable<-false
                | "historical" ->
                    exactNames row ["kind";"beforeState";"afterState"]
                    let before=parseState(row.GetProperty("beforeState"))
                    let after=parseState(row.GetProperty("afterState"))
                    if before<>after then failwithf "historical state changed: %s" name
                    lastConcrete<-Some after
                | "policy" ->
                    if not candidateAvailable then failwithf "policy without fresh complete candidate: %s" name
                    candidateAvailable<-false
                    policyCount<-policyCount+1
                    if policyCount>3 then failwithf "policy evaluation bound: %s" name
                    exactNames row ["kind";"boundary";"status";"expected";"observation";"beforeState";"afterState"]
                    let expected=row.GetProperty("expected")
                    let observed=row.GetProperty("observation")
                    exactNames expected ["runId";"sourceSetSha256";"apphostSha256";"closureSha256";"writeRoot";"dataRoot"]
                    exactNames observed ["pid";"startTicks";"uid";"device";"inode";"path";"revision";"bytes";"sha256"]
                    let identity={RunId=expected.GetProperty("runId").GetString();SourceSetSha256=expected.GetProperty("sourceSetSha256").GetString();ApphostSha256=expected.GetProperty("apphostSha256").GetString();ClosureSha256=expected.GetProperty("closureSha256").GetString();Pid=observed.GetProperty("pid").GetInt32();StartTicks=observed.GetProperty("startTicks").GetString();Uid=observed.GetProperty("uid").GetInt32();Device=observed.GetProperty("device").GetString();Inode=observed.GetProperty("inode").GetString();Path=observed.GetProperty("path").GetString()}
                    let before=parseNullableState(row.GetProperty("beforeState"))
                    if before<>lastConcrete then failwithf "policy prior state chain mismatch: %s" name
                    if before.IsSome && before.Value.Identity<>Some identity then failwithf "policy prior identity mismatch: %s" name
                    let acquired=match before with Some value->value|None->GrowingLogEvidence.acquire identity GrowingLogEvidence.empty|>transitionState
                    let status=row.GetProperty("status").GetString()
                    let after=parseState(row.GetProperty("afterState"))
                    if observed.GetProperty("revision").GetInt32()<>policyCount then failwithf "policy revision progression: %s" name
                    let observation={Identity=identity;Revision=observed.GetProperty("revision").GetInt32();Bytes=observed.GetProperty("bytes").GetInt64();Sha256=observed.GetProperty("sha256").GetString();PreviousPrefixIntact=true;WriterPresent=true;CompleteRecord=status="accepted";Available=true;RootsValid=status="accepted";PendingReason=if status="pending" then after.Reason else None}
                    let sampled=GrowingLogEvidence.sample observation acquired|>transitionState
                    let expectedState=if status="accepted" then GrowingLogEvidence.validate (parseBoundary(row.GetProperty("boundary").GetString())) sampled|>transitionState|>GrowingLogEvidence.consume (parseBoundary(row.GetProperty("boundary").GetString()))|>transitionState else sampled
                    if expectedState<>after then failwithf "full production policy state mismatch: %s" name
                    lastConcrete<-Some after
                | "terminal" ->
                    terminalSeen<-true
                    let state=parseNullableState(row.GetProperty("state"))
                    if state<>lastConcrete then failwithf "terminal concrete state mismatch: %s" name
                | other->failwithf "closed ordered effect kind %s" other
            if policyCount<>expectedPolicies then failwithf "scenario policy census: %s" name
        verifyTimeline "completeRecordWaitThenConsume" 1 "accepted" None
        verifyTimeline "completeRecordWaitExhausted" 0 "refused" (Some "infolog-record-settlement-exhausted")
        verifyTimeline "completeRecordWaitDeadline" 0 "deadline" (Some "infolog-record-settlement-deadline")
        verifyTimeline "sharedBudgetAcrossEvaluations" 1 "refused" (Some "infolog-record-settlement-exhausted")
        verifyTimeline "pendingThenCompleteResample" 2 "accepted" None
        verifyTimeline "waitAfterConsumptionHasNoNewAuthority" 0 "refused" (Some "infolog-record-settlement-exhausted")
        verifyTimeline "lastProbeCandidateThenExhausted" 1 "refused" (Some "infolog-record-settlement-exhausted")
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
        afterConsumeStates.Add(stateWithSettlement "candidate" "browser" 31 true true true true afterConsumed)
        afterConsumeStates.Add(stateWithSettlement "idle" "none" 31 true true true true afterConsumed)
        afterConsumeStates.Add(stateWithSettlement "probing" "normalization" 32 true true true true afterConsumed)
        appendEventStates afterConsumeStates "normalization" true true true afterConsumed afterEvents
        afterConsumeStates.Add(stateWithSettlement "refused" "normalization" 0 true true true true afterConsumed)
        sequence "waitAfterConsumptionHasNoNewAuthority" (["acquire";"beginSettlement:browser";"completeRecordCandidate";"sampleInitial";"beginPolicy:invocation";"readyPolicy:invocation";"validate:browser";"evaluatedPolicy:invocation";"completePolicy:invocation";"consume:browser";"completeBoundary:browser";"beginSettlement:normalization"]@eventActions afterEvents@["recordSettlementExhausted"]) (List.ofSeq afterConsumeStates)

        policyPhase<-"none";policyInvocation<-"none";policyClosure<-"none"
        let lastEvents=events "lastProbeCandidateThenExhausted"
        if lastEvents.Length<>32 || (lastEvents|>List.take 31|>List.exists(fun (kind,_,_)->kind<>"incomplete")) || (lastEvents|>List.last|>fun (kind,_,remaining)->kind<>"complete" || remaining<>0) then failwith "last-probe actual event order"
        let lastStates=ResizeArray<QuintReplayState>()
        lastStates.Add(state false false true a)
        lastStates.Add(stateWithSettlement "probing" "browser" 32 true false false true a)
        appendEventStates lastStates "browser" false false true a lastEvents
        lastStates.Add(stateWithSettlement "candidate" "browser" 0 true true true true s)
        let lastGuard=PolicyComposition.start guardId
        policyPhase<-lastGuard.State.Phase;policyInvocation<-guardId.InvocationId;policyClosure<-guardId.ClosureSha256
        lastStates.Add(stateWithSettlement "candidate" "browser" 0 true true true true s)
        let lastReady=PolicyComposition.ready guardId lastGuard
        policyPhase<-lastReady.State.Phase;lastStates.Add(stateWithSettlement "candidate" "browser" 0 true true true true s)
        let lastValidated=GrowingLogEvidence.validate BrowserAdmission s|>accepted
        lastStates.Add(stateWithSettlement "candidate" "browser" 0 true true true true lastValidated)
        let lastEvaluated=PolicyComposition.evaluated guardId lastReady
        policyPhase<-lastEvaluated.State.Phase;lastStates.Add(stateWithSettlement "candidate" "browser" 0 true true true true lastValidated)
        let lastCompleted=match PolicyComposition.finishGuard guardId true lastEvaluated with Choice1Of2 value->value|Choice2Of2 value->failwithf "%A" value
        policyPhase<-lastCompleted.State.Phase;lastStates.Add(stateWithSettlement "candidate" "browser" 0 true true true true lastValidated)
        let lastConsumed=GrowingLogEvidence.consume BrowserAdmission lastValidated|>accepted
        lastStates.Add(stateWithSettlement "candidate" "browser" 0 true true true true lastConsumed)
        lastStates.Add(stateWithSettlement "probing" "browser" 0 true true true true lastConsumed)
        lastStates.Add(stateWithSettlement "refused" "browser" 0 true true true true lastConsumed)
        sequence "lastProbeCandidateThenExhausted" (["acquire";"beginSettlement:browser"]@eventActions lastEvents@["sampleInitial";"beginPolicy:invocation";"readyPolicy:invocation";"validate:browser";"evaluatedPolicy:invocation";"completePolicy:invocation";"consume:browser";"retrySettlement:browser";"recordSettlementExhausted"]) (List.ofSeq lastStates)
