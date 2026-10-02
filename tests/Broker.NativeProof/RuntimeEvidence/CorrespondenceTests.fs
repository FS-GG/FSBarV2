namespace FSBar.NativeProof.RuntimeEvidence.Tests

open System
open System.IO
open System.Security.Cryptography
open System.Text
open System.Text.Json
open FsQuint
open FSBar.NativeProof.RuntimeEvidence

module CorrespondenceTests =
    let private historicalPrefix bytes sha =
        { RawBytes=bytes; RawSha256=sha; CompleteBytes=bytes; CompleteSha256=sha
          TailBytes=0L;TailSha256=(DataRootPolicy.describe [||]).RawSha256;CompleteRecords=1;TailClass="empty" }
    let private consumeAtFixture boundary (value: EvidenceState) =
        let final={Boundary=boundary;Revision=value.ObservedRevision;RawBytes=value.Bytes;RawSha256=value.Sha256
                   ReadStartMicroseconds=1L;ReadEndMicroseconds=2L;LinearizedMicroseconds=3L;ReleasedMicroseconds=4L;DeadlineMicroseconds=5000000L}
        GrowingLogEvidence.consume boundary final value

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
    let private prefixValue (value: PrefixEvidence) =
        Record ["rawBytes",Integer(string value.RawBytes);"rawSha256",Text value.RawSha256;"completeBytes",Integer(string value.CompleteBytes);"completeSha256",Text value.CompleteSha256;
                "tailBytes",Integer(string value.TailBytes);"tailSha256",Text value.TailSha256;"completeRecords",Integer(string value.CompleteRecords);"tailClass",Text value.TailClass]
    let private consumptionValue (value: ConsumptionObservation option) =
        match value with
        | None -> Record ["boundary",Text "none";"revision",Integer "0";"rawBytes",Integer "0";"rawSha256",Text "";"readStartMicroseconds",Integer "0";"readEndMicroseconds",Integer "0";"linearizedMicroseconds",Integer "0";"releasedMicroseconds",Integer "0";"deadlineMicroseconds",Integer "0"]
        | Some item -> Record ["boundary",Text(boundaryText(Some item.Boundary));"revision",Integer(string item.Revision);"rawBytes",Integer(string item.RawBytes);"rawSha256",Text item.RawSha256;
                              "readStartMicroseconds",Integer(string item.ReadStartMicroseconds);"readEndMicroseconds",Integer(string item.ReadEndMicroseconds);"linearizedMicroseconds",Integer(string item.LinearizedMicroseconds);"releasedMicroseconds",Integer(string item.ReleasedMicroseconds);"deadlineMicroseconds",Integer(string item.DeadlineMicroseconds)]
    let private stateWithSettlement settlementPhase settlementBoundary settlementRemaining deadlineAvailable rootsValid prefixIntact writerPresent (value: EvidenceState) =
        let present=value.Identity.IsSome
        let settlement=Record ["phase",Text settlementPhase;"boundary",Text settlementBoundary;"remaining",Integer(string settlementRemaining);"deadlineAvailable",Boolean deadlineAvailable]
        let record=Record ["phase",Text value.Phase;"generation",Integer(if present then "1" else "0");"observedRevision",Integer(string value.ObservedRevision);"validatedRevision",Integer(string value.ValidatedRevision);"intendedBoundary",Text(boundaryText value.ValidatedBoundary);"consumedRevision",Integer(string value.ConsumedRevision);"consumedBoundary",Text(boundaryText value.ConsumedBoundary);"producerMatches",Boolean present;"logMatches",Boolean present;"sourceMatches",Boolean present;"rootsValid",Boolean rootsValid;"prefixIntact",Boolean prefixIntact;"writerPresent",Boolean writerPresent;"authorityActive",Boolean false;"stickyInvalid",Boolean value.StickyInvalid;"policyPhase",Text policyPhase;"policyInvocation",Text policyInvocation;"policyClosure",Text policyClosure;"settlement",settlement;
                          "prefix",prefixValue value.Prefix;"consumedPrefix",prefixValue(defaultArg value.ConsumedPrefix (DataRootPolicy.describe [||]));"consumption",consumptionValue value.Consumption;
                          "producerBytes",Integer(string value.Bytes);"producerContradiction",Boolean false;
                          "candidateBytes",Integer(string (value.CandidatePrefix |> Option.map _.RawBytes |> Option.defaultValue 0L));"candidateSha256",Text(value.CandidatePrefix |> Option.map _.RawSha256 |> Option.defaultValue "");
                          "finalPhase",Text(if value.Consumption.IsSome && value.ConsumedRevision=value.ObservedRevision then "released" else "none");
                          "finalSize",Integer(string (value.Consumption |> Option.map _.RawBytes |> Option.defaultValue 0L));
                          "readStart",Integer(string (value.Consumption |> Option.map _.ReadStartMicroseconds |> Option.defaultValue 0L));"readEnd",Integer(string (value.Consumption |> Option.map _.ReadEndMicroseconds |> Option.defaultValue 0L));"linearized",Integer(string (value.Consumption |> Option.map _.LinearizedMicroseconds |> Option.defaultValue 0L));
                          "evaluations",Integer(string value.EvaluationCount);"attemptId",Integer(string value.AttemptId);"probeCount",Integer(string value.ProbeCount);"deadlineMicroseconds",Integer(string value.DeadlineMicroseconds)]
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
        if transcript.GetProperty("schema").GetString()<>"fsbar.barc-complete-prefix-correspondence/v3" || transcript.GetProperty("helperSha256").GetString()<>hashFile helperPath then failwith "settlement helper/transcript binding"
        let scenarios=transcript.GetProperty("scenarios").EnumerateArray()|>Seq.toArray
        if scenarios.Length<>14 then failwith "closed RP2 scenario census"
        let scenario name =
            let matches=scenarios|>Array.filter(fun row->exactNames row ["name";"timeline";"model"];row.GetProperty("name").GetString()=name)
            if matches.Length<>1 then failwithf "required settlement scenario absent/duplicate: %s" name
            matches[0]
        let timeline name=(scenario name).GetProperty("timeline").EnumerateArray()|>Seq.toArray
        // The predecessor named vectors remain historical model/reducer
        // controls. Current real helper effects are qualified separately below.
        let events name =
            use historical=JsonDocument.Parse(File.ReadAllBytes(Path.Combine(baseDirectory,$"GrowingLogEvidence.{name}.itf.json")))
            let states=historical.RootElement.GetProperty("states").EnumerateArray() |> Seq.map(fun item->item.GetProperty("evidence").GetProperty("settlement")) |> Seq.toArray
            states |> Array.pairwise |> Array.choose(fun (before,after)->
                let remaining (item:JsonElement) = Int32.Parse(item.GetProperty("remaining").GetProperty("#bigint").GetString())
                let boundary=after.GetProperty("boundary").GetString()
                if before.GetProperty("phase").GetString()="probing" && remaining after=remaining before-1 && (name<>"waitAfterConsumptionHasNoNewAuthority" || boundary="normalization") then
                    Some((if after.GetProperty("phase").GetString()="candidate" then "complete" else "incomplete"),remaining after)
                else None) |> Array.mapi(fun index (kind,remaining)->kind,index+1,remaining) |> Array.toList
        let parseBoundary = function "browser"->BrowserAdmission|"normalization"->Normalization|"release"->Release|value->failwithf "closed boundary: %s" value
        let optionalText (element:JsonElement) (property:string) =
            let item=element.GetProperty property
            if item.ValueKind=JsonValueKind.Null then None else Some(item.GetString())
        let parseIdentity (element:JsonElement) =
            exactNames element ["runId";"sourceSetSha256";"apphostSha256";"closureSha256";"pid";"startTicks";"uid";"device";"inode";"path"]
            {RunId=element.GetProperty("runId").GetString();SourceSetSha256=element.GetProperty("sourceSetSha256").GetString();ApphostSha256=element.GetProperty("apphostSha256").GetString();ClosureSha256=element.GetProperty("closureSha256").GetString();Pid=element.GetProperty("pid").GetInt32();StartTicks=element.GetProperty("startTicks").GetString();Uid=element.GetProperty("uid").GetInt32();Device=element.GetProperty("device").GetString();Inode=element.GetProperty("inode").GetString();Path=element.GetProperty("path").GetString()}
        let parsePrefix (element:JsonElement) : PrefixEvidence =
            exactNames element ["rawBytes";"rawSha256";"completeBytes";"completeSha256";"tailBytes";"tailSha256";"completeRecords";"tailClass"]
            { RawBytes=element.GetProperty("rawBytes").GetInt64();RawSha256=element.GetProperty("rawSha256").GetString()
              CompleteBytes=element.GetProperty("completeBytes").GetInt64();CompleteSha256=element.GetProperty("completeSha256").GetString()
              TailBytes=element.GetProperty("tailBytes").GetInt64();TailSha256=element.GetProperty("tailSha256").GetString()
              CompleteRecords=element.GetProperty("completeRecords").GetInt32();TailClass=element.GetProperty("tailClass").GetString() }
        let parseConsumption (element:JsonElement) : ConsumptionObservation =
            exactNames element ["boundary";"revision";"rawBytes";"rawSha256";"readStartMicroseconds";"readEndMicroseconds";"linearizedMicroseconds";"releasedMicroseconds";"deadlineMicroseconds"]
            { Boundary=parseBoundary(element.GetProperty("boundary").GetString());Revision=element.GetProperty("revision").GetInt32()
              RawBytes=element.GetProperty("rawBytes").GetInt64();RawSha256=element.GetProperty("rawSha256").GetString()
              ReadStartMicroseconds=element.GetProperty("readStartMicroseconds").GetInt64();ReadEndMicroseconds=element.GetProperty("readEndMicroseconds").GetInt64()
              LinearizedMicroseconds=element.GetProperty("linearizedMicroseconds").GetInt64();ReleasedMicroseconds=element.GetProperty("releasedMicroseconds").GetInt64();DeadlineMicroseconds=element.GetProperty("deadlineMicroseconds").GetInt64() }
        let parseState (element:JsonElement) =
            exactNames element ["phase";"observedRevision";"validatedRevision";"validatedBoundary";"consumedRevision";"consumedBoundary";"bytes";"sha256";"stickyInvalid";"reason";"identity";"prefix";"candidatePrefix";"consumedPrefix";"consumption";"attemptId";"probeCount";"evaluationCount";"deadlineMicroseconds"]
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
              Reason=optionalText element "reason"
              Prefix=parsePrefix(element.GetProperty("prefix"))
              CandidatePrefix=(let item=element.GetProperty("candidatePrefix") in if item.ValueKind=JsonValueKind.Null then None else Some(parsePrefix item))
              ConsumedPrefix=(let item=element.GetProperty("consumedPrefix") in if item.ValueKind=JsonValueKind.Null then None else Some(parsePrefix item))
              Consumption=(let item=element.GetProperty("consumption") in if item.ValueKind=JsonValueKind.Null then None else Some(parseConsumption item))
              AttemptId=element.GetProperty("attemptId").GetInt32();ProbeCount=element.GetProperty("probeCount").GetInt32();EvaluationCount=element.GetProperty("evaluationCount").GetInt32();DeadlineMicroseconds=element.GetProperty("deadlineMicroseconds").GetInt64() }
        let parseNullableState (element:JsonElement)=if element.ValueKind=JsonValueKind.Null then None else Some(parseState element)
        let transitionState = function Accepted value|Pending value|Refused value|Unknown value->value
        // Current transcript validation and full canonical trace joins.
        let currentScenarioNames = set ["rp2SafeTailConsume";"rp2SafeTailExtend";"rp2RelevantTailPending";"rp2UnknownTailPending";"rp2PartialUtf8Pending";"rp2MalformedUtf8Refused";"rp2ContradictionBeforeSample";"rp2ContradictionDuringPolicy";"rp2ContradictionDuringRead";"rp2ContradictionAfterL";"rp2BenignGrowthCap";"rp2NoCompleteRecords";"rp2RealLibcSafeTail";"rp2RealLibcSafeTailExtend"]
        if (scenarios |> Array.map(fun row->row.GetProperty("name").GetString()) |> Set.ofArray)<>currentScenarioNames then failwith "required RP2 scenarios missing/duplicate"
        let privateHash (raw:byte array)=SHA256.HashData(raw)|>Convert.ToHexStringLower
        for name in currentScenarioNames do
            let row=scenario name
            let rows=row.GetProperty("timeline").EnumerateArray() |> Seq.toArray
            let mutable concrete:EvidenceState option=None
            let mutable activeBoundary:Boundary option=None
            let mutable activeAttempt=0
            let mutable probes=0
            let mutable evaluations=0
            let mutable frozenDeadline=0L
            let mutable rawCandidate:JsonElement option=None
            let mutable finalRead:JsonElement option=None
            let mutable terminal=false
            let mutable previousRaw:byte array=[||]
            for effect in rows do
                let kind=effect.GetProperty("kind").GetString()
                if terminal && kind<>"boundary" then failwithf "effect after terminal: %s" name
                match kind with
                | "boundary" ->
                    exactNames effect ["kind";"boundary";"attemptId";"deadlineMicroseconds";"beforeState"]
                    let before=parseNullableState(effect.GetProperty("beforeState"))
                    if before<>concrete || (concrete.IsSome && concrete.Value.Phase<>"consumed") then failwith "boundary history/one-shot join"
                    if activeAttempt>0 && not terminal then failwith "boundary restarted before terminal"
                    activeAttempt<-effect.GetProperty("attemptId").GetInt32()
                    if activeAttempt<>(concrete |> Option.map(fun item->item.AttemptId+1) |> Option.defaultValue 1) then failwith "boundary attempt sequence"
                    activeBoundary<-Some(parseBoundary(effect.GetProperty("boundary").GetString()))
                    frozenDeadline<-effect.GetProperty("deadlineMicroseconds").GetInt64()
                    if frozenDeadline<=0L || frozenDeadline>5000000L then failwith "frozen boundary deadline"
                    probes<-0;evaluations<-0;rawCandidate<-None;finalRead<-None;terminal<-false
                | "probe" ->
                    exactNames effect ["kind";"event";"probe";"remaining";"rawBytes";"rawSha256";"completeBytes";"tailBytes"]
                    probes<-probes+1
                    if activeBoundary.IsNone || probes>32 || effect.GetProperty("probe").GetInt32()<>probes || effect.GetProperty("remaining").GetInt32()<>32-probes then failwith "shared probe budget/order"
                    let rawBytes=effect.GetProperty("rawBytes").GetInt64()
                    let completeBytes=effect.GetProperty("completeBytes").GetInt64()
                    let tailBytes=effect.GetProperty("tailBytes").GetInt64()
                    if min completeBytes tailBytes<0L || completeBytes+tailBytes<>rawBytes || rawBytes>10L*1024L*1024L then failwith "raw probe recombination/bound"
                    match effect.GetProperty("event").GetString() with
                    | "raw" -> rawCandidate<-Some effect;finalRead<-None
                    | "unchanged" ->
                        if concrete.IsNone || concrete.Value.Phase<>"sampled" || effect.GetProperty("rawSha256").GetString()<>concrete.Value.Sha256 || rawBytes<>concrete.Value.Bytes then failwith "pending unchanged raw probe"
                        rawCandidate<-None
                    | other -> failwithf "closed current raw-probe outcome: %s" other
                | "policy" ->
                    exactNames effect ["kind";"boundary";"status";"expected";"observation";"prefix";"rawBase64";"invocation";"beforeState";"afterState"]
                    if rawCandidate.IsNone || activeBoundary.IsNone then failwith "policy without fresh raw candidate"
                    evaluations<-evaluations+1
                    if evaluations>3 then failwith "fourth policy evaluation"
                    let expected=effect.GetProperty("expected")
                    exactNames expected ["runId";"sourceSetSha256";"apphostSha256";"closureSha256";"writeRoot";"dataRoot"]
                    let observed=effect.GetProperty("observation")
                    exactNames observed ["pid";"startTicks";"uid";"device";"inode";"path";"revision";"bytes";"sha256";"attemptId";"probeCount";"evaluationCount";"deadlineMicroseconds"]
                    let requested=parseBoundary(effect.GetProperty("boundary").GetString())
                    if Some requested<>activeBoundary then failwith "candidate boundary drift"
                    let id={RunId=expected.GetProperty("runId").GetString();SourceSetSha256=expected.GetProperty("sourceSetSha256").GetString();ApphostSha256=expected.GetProperty("apphostSha256").GetString();ClosureSha256=expected.GetProperty("closureSha256").GetString();Pid=observed.GetProperty("pid").GetInt32();StartTicks=observed.GetProperty("startTicks").GetString();Uid=observed.GetProperty("uid").GetInt32();Device=observed.GetProperty("device").GetString();Inode=observed.GetProperty("inode").GetString();Path=observed.GetProperty("path").GetString()}
                    let before=parseNullableState(effect.GetProperty("beforeState"))
                    if before<>concrete then failwith "policy prior concrete state chain"
                    let raw=Convert.FromBase64String(effect.GetProperty("rawBase64").GetString())
                    if raw.Length>10*1024*1024 || int64 raw.Length<>observed.GetProperty("bytes").GetInt64() || privateHash raw<>observed.GetProperty("sha256").GetString() then failwith "actual policy raw bytes/hash"
                    if raw.Length<previousRaw.Length || not(MemoryExtensions.SequenceEqual<byte>(ReadOnlySpan<byte>(raw,0,previousRaw.Length),ReadOnlySpan<byte>(previousRaw))) then failwith "entire retained raw prefix including unfinished tail"
                    previousRaw<-raw
                    let prefix=DataRootPolicy.describe raw
                    if parsePrefix(effect.GetProperty("prefix"))<>prefix || rawCandidate.Value.GetProperty("rawBytes").GetInt64()<>prefix.RawBytes || rawCandidate.Value.GetProperty("rawSha256").GetString()<>prefix.RawSha256 then failwith "raw candidate/P/T descriptor join"
                    let roots=DataRootPolicy.evaluate (expected.GetProperty("writeRoot").GetString()) (expected.GetProperty("dataRoot").GetString()) raw
                    let complete,valid,reason=match roots with RootAccepted _->true,true,None | RootPending text->false,false,Some text | RootRefused text->true,false,Some text
                    let acquired=before |> Option.defaultWith(fun ()->GrowingLogEvidence.acquire id GrowingLogEvidence.empty |> transitionState)
                    let sample={Identity=id;Revision=observed.GetProperty("revision").GetInt32();Bytes=prefix.RawBytes;Sha256=prefix.RawSha256;PreviousPrefixIntact=true;WriterPresent=true;CompleteRecord=complete;Available=true;RootsValid=valid;PendingReason=reason;Prefix=prefix;AttemptId=observed.GetProperty("attemptId").GetInt32();ProbeCount=observed.GetProperty("probeCount").GetInt32();EvaluationCount=observed.GetProperty("evaluationCount").GetInt32();DeadlineMicroseconds=observed.GetProperty("deadlineMicroseconds").GetInt64()}
                    if sample.AttemptId<>activeAttempt || sample.ProbeCount<>probes || sample.EvaluationCount<>evaluations || sample.DeadlineMicroseconds<>frozenDeadline then failwith "shared frozen budget/result join"
                    let sampled=GrowingLogEvidence.sample sample acquired
                    let calculated=match sampled with Accepted state->GrowingLogEvidence.validate requested state | other->other
                    let status=match calculated with Accepted _->"accepted"|Pending _->"pending"|Refused _->"refused"|Unknown _->"unknown"
                    let after=parseState(effect.GetProperty("afterState"))
                    if effect.GetProperty("status").GetString()<>status || transitionState calculated<>after then failwith "full actual F# classifier/reducer state mismatch"
                    let invocation=effect.GetProperty("invocation")
                    exactNames invocation ["invocationId";"closureSha256";"pid";"startTicks";"uid";"readyPhase";"completedPhase"]
                    if invocation.GetProperty("closureSha256").GetString()<>id.ClosureSha256 || invocation.GetProperty("readyPhase").GetString()<>"ready" || invocation.GetProperty("completedPhase").GetString()<>"completed" then failwith "framed actual invocation/closure join"
                    let invocationIdentity={InvocationId=invocation.GetProperty("invocationId").GetString();ClosureSha256=id.ClosureSha256;Pid=invocation.GetProperty("pid").GetInt32();StartTicks=invocation.GetProperty("startTicks").GetString();Uid=invocation.GetProperty("uid").GetInt32()}
                    let session=PolicyComposition.start invocationIdentity |> PolicyComposition.ready invocationIdentity |> PolicyComposition.evaluated invocationIdentity
                    match PolicyComposition.finishGuard invocationIdentity true session with Choice1Of2 _->()|Choice2Of2 _->failwith "same current-process completion reducer refused"
                    concrete<-Some after;rawCandidate<-None
                | "final-observation" ->
                    exactNames effect ["kind";"boundary";"revision";"rawBytes";"rawSha256";"readStartMicroseconds";"readEndMicroseconds";"linearizedMicroseconds"]
                    if concrete.IsNone || finalRead.IsSome || (concrete.Value.Phase<>"validated" && concrete.Value.Phase<>"sampled") then failwith "final observation without one current candidate"
                    let current=concrete.Value
                    if Some(parseBoundary(effect.GetProperty("boundary").GetString()))<>activeBoundary || effect.GetProperty("revision").GetInt32()<>current.ObservedRevision || effect.GetProperty("rawSha256").GetString()<>current.Sha256 || effect.GetProperty("rawBytes").GetInt64()<current.Bytes || effect.GetProperty("rawBytes").GetInt64()>10L*1024L*1024L then failwith "final held-FD horizon scope"
                    let started=effect.GetProperty("readStartMicroseconds").GetInt64()
                    let ended=effect.GetProperty("readEndMicroseconds").GetInt64()
                    let at=effect.GetProperty("linearizedMicroseconds").GetInt64()
                    if started<0L || ended<started || at<ended || at>=frozenDeadline then failwith "invented/noncausal L"
                    finalRead<-Some effect
                | "growth" ->
                    exactNames effect ["kind";"rawBytes";"beforeState";"afterState"]
                    if concrete.IsNone || finalRead.IsNone || finalRead.Value.GetProperty("rawBytes").GetInt64()<>effect.GetProperty("rawBytes").GetInt64() then failwith "growth without observed size"
                    let before=parseState(effect.GetProperty("beforeState"))
                    let after=parseState(effect.GetProperty("afterState"))
                    if Some before<>concrete || transitionState(GrowingLogEvidence.observeGrowth (effect.GetProperty("rawBytes").GetInt64()) before)<>after then failwith "actual growth revocation/re-evaluation seam"
                    concrete<-Some after;finalRead<-None
                | "consume" ->
                    exactNames effect ["kind";"observation";"beforeState";"afterState"]
                    if concrete.IsNone || finalRead.IsNone then failwith "consumption without observed L"
                    let before=parseState(effect.GetProperty("beforeState"))
                    let after=parseState(effect.GetProperty("afterState"))
                    let observed=parseConsumption(effect.GetProperty("observation"))
                    let final=finalRead.Value
                    if Some before<>concrete || observed.RawBytes<>final.GetProperty("rawBytes").GetInt64() || observed.RawSha256<>final.GetProperty("rawSha256").GetString() || observed.ReadStartMicroseconds<>final.GetProperty("readStartMicroseconds").GetInt64() || observed.ReadEndMicroseconds<>final.GetProperty("readEndMicroseconds").GetInt64() || observed.LinearizedMicroseconds<>final.GetProperty("linearizedMicroseconds").GetInt64() || observed.DeadlineMicroseconds<>frozenDeadline then failwith "exact final observation/consumption join"
                    if transitionState(GrowingLogEvidence.consume observed.Boundary observed before)<>after then failwith "full typed final consumption reducer mismatch"
                    concrete<-Some after
                | "producer-after-L" ->
                    exactNames effect ["kind";"rawBytes";"contradictory"]
                    if finalRead.IsNone || concrete.IsNone || concrete.Value.Phase<>"validated" || effect.GetProperty("rawBytes").GetInt64()<=concrete.Value.Bytes || not(effect.GetProperty("contradictory").GetBoolean()) then failwith "independent producer post-L fixture join"
                | "revoke" ->
                    exactNames effect ["kind";"unavailable";"reason";"beforeState";"afterState"]
                    let before=parseState(effect.GetProperty("beforeState"))
                    let after=parseState(effect.GetProperty("afterState"))
                    if Some before<>concrete || transitionState(GrowingLogEvidence.revoke (effect.GetProperty("unavailable").GetBoolean()) (effect.GetProperty("reason").GetString()) before)<>after then failwith "sticky actual terminal revocation seam"
                    concrete<-Some after
                | "terminal" ->
                    exactNames effect ["kind";"outcome";"check";"state"]
                    if parseNullableState(effect.GetProperty("state"))<>concrete then failwith "terminal concrete state chain"
                    match effect.GetProperty("outcome").GetString(),concrete with
                    | "accepted",Some value when value.Phase="consumed" && value.Consumption.IsSome && value.AttemptId=activeAttempt -> ()
                    | "refused",Some value when value.StickyInvalid && value.Phase<>"consumed" -> ()
                    | _ -> failwith "false/stale terminal authority"
                    terminal<-true;finalRead<-None;rawCandidate<-None
                | _ -> failwithf "closed actual RP2 effect kind: %s" kind
            if not terminal then failwith "missing actual terminal"
            let model=row.GetProperty("model")
            exactNames model ["steps";"trace"]
            let steps=model.GetProperty("steps").EnumerateArray() |> Seq.toArray
            if model.GetProperty("trace").GetString()<>name+".itf.json" || steps.Length=0 then failwith "fixed canonical dynamic trace filename"
            let rec replayValue (element:JsonElement) =
                match element.ValueKind with
                | JsonValueKind.String -> Text(element.GetString())
                | JsonValueKind.Number -> Integer(string(element.GetInt64()))
                | JsonValueKind.True -> Boolean true
                | JsonValueKind.False -> Boolean false
                | JsonValueKind.Object -> Record(element.EnumerateObject() |> Seq.map(fun item->item.Name,replayValue item.Value) |> Seq.toList)
                | _ -> failwith "closed actual modeled state value"
            let rec normalizeRecord = function
                | Record fields -> Record(fields |> List.map(fun (key,value)->key,normalizeRecord value) |> List.sortBy fst)
                | value -> value
            // Join the actual typed F# milestones to the full modeled states,
            // independently of the generator's intermediate projections.
            let mutable milestone=0
            for effect in rows do
                let kind=effect.GetProperty("kind").GetString()
                let actionPrefix = match kind with "policy"->Some "completePolicy("|"growth"->Some "observedGrowth"|"consume"->Some "consumeAt("|"revoke"->Some "revokeObserved("|_->None
                match actionPrefix with
                | None -> ()
                | Some prefix ->
                    while milestone<steps.Length && not(steps[milestone].GetProperty("action").GetString().StartsWith(prefix,StringComparison.Ordinal)) do milestone<-milestone+1
                    if milestone=steps.Length then failwith "actual F# effect omitted/reordered from model steps"
                    let expected=parseState(effect.GetProperty("afterState"))
                    let projected=steps[milestone].GetProperty("state")
                    let same (property:string) value = if normalizeRecord(replayValue(projected.GetProperty(property)))<>normalizeRecord value then failwithf "actual F# field/model join: %s %s at %s expected=%A actual=%A" name property (steps[milestone].GetProperty("action").GetString()) value (replayValue(projected.GetProperty(property)))
                    same "phase" (Text expected.Phase)
                    same "observedRevision" (Integer(string expected.ObservedRevision));same "validatedRevision" (Integer(string expected.ValidatedRevision));same "intendedBoundary" (Text(boundaryText expected.ValidatedBoundary))
                    same "consumedRevision" (Integer(string expected.ConsumedRevision));same "consumedBoundary" (Text(boundaryText expected.ConsumedBoundary));same "stickyInvalid" (Boolean expected.StickyInvalid)
                    same "prefix" (prefixValue expected.Prefix);same "consumedPrefix" (prefixValue(defaultArg expected.ConsumedPrefix (DataRootPolicy.describe [||])));same "consumption" (consumptionValue expected.Consumption)
                    same "candidateBytes" (Integer(string(expected.CandidatePrefix |> Option.map _.RawBytes |> Option.defaultValue 0L)));same "candidateSha256" (Text(expected.CandidatePrefix |> Option.map _.RawSha256 |> Option.defaultValue ""))
                    same "evaluations" (Integer(string expected.EvaluationCount));same "attemptId" (Integer(string expected.AttemptId));same "probeCount" (Integer(string expected.ProbeCount));same "deadlineMicroseconds" (Integer(string expected.DeadlineMicroseconds))
                    milestone<-milestone+1
            let actions=steps |> Array.map(fun step->exactNames step ["action";"state"];step.GetProperty("action").GetString())
            let actual=steps |> Array.mapi(fun index step->
                let draft={Identity="";Bindings=["evidence",replayValue(step.GetProperty("state"))]}
                let observed={draft with Identity=QuintReplay.stateFingerprint draft |> unwrap}
                {Index=index+1;Action=actions[index];Source=source;Actual=observed}) |> Array.toList
            let tool=locate "quint"
            let environment={Seed="424242";Bounds=["rawBytes",10485760L;"probes",32L;"evaluations",3L;"deadlineMicroseconds",5000000L];ToolFingerprint=hashFile tool;ProfileFingerprint=hashJoined [Path.Combine(baseDirectory,"GrowingLogEvidence.qnt");Path.Combine(baseDirectory,"GrowingLogEvidence_test.qnt")];ContractFingerprint=hashFile(Path.Combine(baseDirectory,"Codec.fs"));AdapterFingerprint=hashJoined [Path.Combine(baseDirectory,"DataRootPolicy.fs");helperPath];ImplementationFingerprint=hashJoined [Path.Combine(baseDirectory,"GrowingLogEvidence.fs");typeof<EvidenceState>.Assembly.Location]}
            let context={Environment=environment;Steps=actions |> Array.mapi(fun index action->{Index=index+1;Action=action;Source=source}) |> Array.toList}
            let modelPath=Path.Combine(Path.GetDirectoryName(transcriptPath),"rp2-model",name+".itf.json")
            let trace=QuintReplay.decodeItf context (File.ReadAllText modelPath) |> unwrap
            match QuintReplay.compare trace actual |> unwrap with QuintReplayResult.Equivalent->()|other->failwithf "actual full-state ordered-effect correspondence: %s %A" name other
        policyPhase<-"none";policyInvocation<-"none";policyClosure<-"none"
        let tool=locate "quint"
        let environment={Seed="424242";Bounds=["revisions",3L;"generations",2L];ToolFingerprint=hashFile tool;ProfileFingerprint=hashJoined [Path.Combine(baseDirectory,"GrowingLogEvidence.qnt");Path.Combine(baseDirectory,"GrowingLogEvidence_test.qnt")];ContractFingerprint=hashFile(Path.Combine(baseDirectory,"Codec.fs"));AdapterFingerprint=hashJoined [Path.Combine(baseDirectory,"DataRootPolicy.fs");helperPath;transcriptPath];ImplementationFingerprint=hashJoined [Path.Combine(baseDirectory,"GrowingLogEvidence.fs");typeof<EvidenceState>.Assembly.Location]}
        let id={RunId="run";SourceSetSha256=String('a',64);ApphostSha256=String('b',64);ClosureSha256=String('c',64);Pid=100;StartTicks="1";Uid=1000;Device="1";Inode="2";Path="/private/infolog.txt"}
        let observe rev bytes sha complete available writer roots={Identity=id;Revision=rev;Bytes=bytes;Sha256=sha;PreviousPrefixIntact=true;WriterPresent=writer;CompleteRecord=complete;Available=available;RootsValid=roots;PendingReason=None;Prefix=historicalPrefix bytes sha;AttemptId=1;ProbeCount=rev;EvaluationCount=rev;DeadlineMicroseconds=5000000L}
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
        push(consumeAtFixture BrowserAdmission current) true true true
        states.Add(state true true true current)
        policyPhase<-"none";policyInvocation<-"none";policyClosure<-"none"
        push(GrowingLogEvidence.sample ({observe 2 120L (String('d',64)) true true true true with AttemptId=2;ProbeCount=1;EvaluationCount=1}) current) true true true
        let identity2=beginReady 2 true true true
        push(GrowingLogEvidence.validate Normalization current) true true true
        evaluateComplete identity2 true true true
        push(consumeAtFixture Normalization current) true true true
        states.Add(state true true true current)
        policyPhase<-"none";policyInvocation<-"none";policyClosure<-"none"
        push(GrowingLogEvidence.sample ({observe 3 140L (String('e',64)) true true true true with AttemptId=3;ProbeCount=1;EvaluationCount=1}) current) true true true
        let identity3=beginReady 3 true true true
        push(GrowingLogEvidence.validate Release current) true true true
        evaluateComplete identity3 true true true
        push(consumeAtFixture Release current) true true true
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
        let consumed value=consumeAtFixture BrowserAdmission value |> accepted
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
        let stale=consumeAtFixture Normalization v |> transitioned
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
        let waitConsumed=consumeAtFixture BrowserAdmission waitValidated|>accepted
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
        let sharedConsumed=consumeAtFixture BrowserAdmission sharedValidated|>accepted
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
        let pendingConsumed=consumeAtFixture BrowserAdmission pendingValidated|>accepted
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
        let afterConsumed=consumeAtFixture BrowserAdmission afterValidated|>accepted
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
        let lastConsumed=consumeAtFixture BrowserAdmission lastValidated|>accepted
        lastStates.Add(stateWithSettlement "candidate" "browser" 0 true true true true lastConsumed)
        lastStates.Add(stateWithSettlement "probing" "browser" 0 true true true true lastConsumed)
        lastStates.Add(stateWithSettlement "refused" "browser" 0 true true true true lastConsumed)
        sequence "lastProbeCandidateThenExhausted" (["acquire";"beginSettlement:browser"]@eventActions lastEvents@["sampleInitial";"beginPolicy:invocation";"readyPolicy:invocation";"validate:browser";"evaluatedPolicy:invocation";"completePolicy:invocation";"consume:browser";"retrySettlement:browser";"recordSettlementExhausted"]) (List.ofSeq lastStates)
