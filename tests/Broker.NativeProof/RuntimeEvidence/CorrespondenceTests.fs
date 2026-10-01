namespace FSBar.NativeProof.RuntimeEvidence.Tests

open System
open System.IO
open System.Security.Cryptography
open System.Text
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
    let private state rootsValid prefixIntact writerPresent (value: EvidenceState) =
        let present=value.Identity.IsSome
        let record=Record ["phase",Text value.Phase;"generation",Integer(if present then "1" else "0");"observedRevision",Integer(string value.ObservedRevision);"validatedRevision",Integer(string value.ValidatedRevision);"intendedBoundary",Text(boundaryText value.ValidatedBoundary);"consumedRevision",Integer(string value.ConsumedRevision);"consumedBoundary",Text(boundaryText value.ConsumedBoundary);"producerMatches",Boolean present;"logMatches",Boolean present;"sourceMatches",Boolean present;"rootsValid",Boolean rootsValid;"prefixIntact",Boolean prefixIntact;"writerPresent",Boolean writerPresent;"authorityActive",Boolean(value.Phase="validated" && not value.StickyInvalid);"stickyInvalid",Boolean value.StickyInvalid;"policyPhase",Text policyPhase;"policyInvocation",Text policyInvocation;"policyClosure",Text policyClosure]
        let draft={Identity="";Bindings=["evidence",record]}
        {draft with Identity=QuintReplay.stateFingerprint draft |> unwrap}
    let private accepted = function Accepted value -> value | other -> failwithf "%A" other
    let private transitioned = function Accepted value|Pending value|Refused value|Unknown value -> value
    let private compareTrace baseDirectory environment name actions projected =
        let context={Environment=environment;Steps=actions|>List.mapi(fun index action->{Index=index+1;Action=action;Source=source})}
        let trace=QuintReplay.decodeItf context (File.ReadAllText(Path.Combine(baseDirectory,$"GrowingLogEvidence.{name}.itf.json"))) |> unwrap
        let observations=projected|>List.mapi(fun index actual->{Index=index+1;Action=actions[index];Source=source;Actual=actual})
        match QuintReplay.compare trace observations |> unwrap with QuintReplayResult.Equivalent -> trace,observations | other -> failwithf "%s reducer/model divergence: %A" name other
    let run baseDirectory =
        policyPhase<-"none";policyInvocation<-"none";policyClosure<-"none"
        let tool=locate "quint"
        let environment={Seed="424242";Bounds=["revisions",3L;"generations",2L];ToolFingerprint=hashFile tool;ProfileFingerprint=hashJoined [Path.Combine(baseDirectory,"GrowingLogEvidence.qnt");Path.Combine(baseDirectory,"GrowingLogEvidence_test.qnt")];ContractFingerprint=hashFile(Path.Combine(baseDirectory,"Codec.fs"));AdapterFingerprint=hashFile(Path.Combine(baseDirectory,"DataRootPolicy.fs"));ImplementationFingerprint=hashJoined [Path.Combine(baseDirectory,"GrowingLogEvidence.fs");typeof<EvidenceState>.Assembly.Location]}
        let id={RunId="run";SourceSetSha256=String('a',64);ApphostSha256=String('b',64);ClosureSha256=String('c',64);Pid=100;StartTicks="1";Uid=1000;Device="1";Inode="2";Path="/private/infolog.txt"}
        let observe rev bytes sha complete available writer roots={Identity=id;Revision=rev;Bytes=bytes;Sha256=sha;PreviousPrefixIntact=true;WriterPresent=writer;CompleteRecord=complete;Available=available;RootsValid=roots;PendingReason=None}
        let mutable current=GrowingLogEvidence.empty
        let states=ResizeArray<QuintReplayState>()
        let push next roots prefix writer=current<-accepted next;states.Add(state roots prefix writer current)
        let mutable invocation=PolicyInvocation.empty
        let guard identity transition roots prefix writer =
            invocation<-PolicyInvocation.requireAccepted transition
            policyPhase<-invocation.Phase;policyInvocation<-identity.InvocationId;policyClosure<-identity.ClosureSha256
            states.Add(state roots prefix writer current)
        let invoke number =
            let identity={InvocationId=$"invocation{number}";ClosureSha256=String('c',64);Pid=100;StartTicks="1";Uid=1000}
            invocation<-PolicyInvocation.empty
            guard identity (PolicyInvocation.beginInvocation identity invocation) true true true
            guard identity (PolicyInvocation.ready identity invocation) true true true
            guard identity (PolicyInvocation.evaluated identity invocation) true true true
            guard identity (PolicyInvocation.complete identity true invocation) true true true
        push(GrowingLogEvidence.acquire id current) false false true
        push(GrowingLogEvidence.sample (observe 1 100L (String('c',64)) true true true true) current) true true true
        invoke 1
        push(GrowingLogEvidence.validate BrowserAdmission current) true true true;push(GrowingLogEvidence.consume BrowserAdmission current) true true true
        policyPhase<-"none";policyInvocation<-"none";policyClosure<-"none"
        push(GrowingLogEvidence.sample (observe 2 120L (String('d',64)) true true true true) current) true true true
        invoke 2
        push(GrowingLogEvidence.validate Normalization current) true true true;push(GrowingLogEvidence.consume Normalization current) true true true
        policyPhase<-"none";policyInvocation<-"none";policyClosure<-"none"
        push(GrowingLogEvidence.sample (observe 3 140L (String('e',64)) true true true true) current) true true true
        invoke 3
        push(GrowingLogEvidence.validate Release current) true true true;push(GrowingLogEvidence.consume Release current) true true true
        let guardActions n=["beginPolicy:invocation"+string n;"readyPolicy:invocation"+string n;"evaluatedPolicy:invocation"+string n;"completePolicy:invocation"+string n]
        let healthyActions=["acquire";"sampleInitial"]@guardActions 1@["validate:browser";"consume:browser";"benignAppend"]@guardActions 2@["validate:normalization";"consume:normalization";"benignAppend"]@guardActions 3@["validate:release";"consume:release"]
        let trace,observations=compareTrace baseDirectory environment "healthy" healthyActions (List.ofSeq states)
        let changed=observations |> List.mapi(fun index item -> if index=observations.Length-1 then {item with Actual=state false true true current} else item)
        match QuintReplay.compare trace changed |> unwrap with QuintReplayResult.Diverged _ -> () | other -> failwithf "semantic mutation did not diverge: %A" other
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
        let g0=PolicyInvocation.beginInvocation guardId PolicyInvocation.empty|>PolicyInvocation.requireAccepted
        policyPhase<-g0.Phase
        policyInvocation<-guardId.InvocationId
        policyClosure<-guardId.ClosureSha256
        let gs0=state true true true s
        let g1=PolicyInvocation.ready guardId g0|>PolicyInvocation.requireAccepted
        policyPhase<-g1.Phase
        let gs1=state true true true s
        let g2=PolicyInvocation.evaluated guardId g1|>PolicyInvocation.requireAccepted
        policyPhase<-g2.Phase
        let gs2=state true true true s
        let g3=PolicyInvocation.complete guardId true g2|>PolicyInvocation.requireAccepted
        policyPhase<-g3.Phase
        let gs3=state true true true s
        let c=consumed v
        sequence "unavailableAfterConsumptionPreservesHistoryOnly" (["acquire";"sampleInitial"]@guardActions 0@["validate:browser";"consume:browser";"unavailable"]) [aState;sState;gs0;gs1;gs2;gs3;state true true true v;state true true true c;state true true false (unavailable c)]
        policyPhase<-"none";policyInvocation<-"none";policyClosure<-"none"
        let pending=GrowingLogEvidence.sample (observe 1 100L (String('c',64)) false true true false) a |> transitioned
        sequence "pendingTailHasNoAuthority" ["acquire";"pendingTail";"close"] [state false false true a;state false true true pending;state false true true (GrowingLogEvidence.close pending)]
        let stale=GrowingLogEvidence.consume Normalization v |> transitioned
        sequence "staleBoundaryCannotConsume" ["acquire";"sampleInitial";"validate:browser";"staleBoundary"] [state false false true a;state true true true s;state true true true v;state true true true stale]
        sequence "closeRevokesCurrentAuthority" ["acquire";"sampleInitial";"validate:browser";"close"] [state false false true a;state true true true s;state true true true v;state true true true (GrowingLogEvidence.close v)]
