namespace FSBar.NativeProof.RuntimeEvidence.Tests

open System
open System.IO
open System.Security.Cryptography
open System.Text
open FsQuint
open FSBar.NativeProof.RuntimeEvidence

module CorrespondenceTests =
    let private unwrap = function Ok value -> value | Error error -> failwithf "%A" error
    let private hash (value: string) =
        let bytes: byte array = Encoding.UTF8.GetBytes value
        let digest: byte array = SHA256.HashData bytes
        Convert.ToHexStringLower digest
    let private source={Path="GrowingLogEvidence_test.qnt";Line=1;Column=1}
    let private actions=["acquire";"sampleInitial";"validate:browser";"consume:browser";"benignAppend";"validate:normalization";"consume:normalization";"benignAppend";"validate:release";"consume:release"]
    let private environment={Seed="424242";Bounds=["revisions",3L;"generations",2L];ToolFingerprint=hash "quint-0.32.0";ProfileFingerprint=hash "growing-log-v1";ContractFingerprint=hash "ops-typed-01.4";AdapterFingerprint=hash "runtime-evidence-v1";ImplementationFingerprint=hash "fsharp-reducer-v1"}
    let private state (value: EvidenceState) =
        let present=value.Identity.IsSome
        let boundary=match value.ConsumedBoundary with Some BrowserAdmission->"browser"|Some Normalization->"normalization"|Some Release->"release"|None->"none"
        let intended=match value.ValidatedBoundary with Some BrowserAdmission->"browser"|Some Normalization->"normalization"|Some Release->"release"|None->"none"
        let record=Record ["phase",Text value.Phase;"generation",Integer(if present then "1" else "0");"observedRevision",Integer(string value.ObservedRevision);"validatedRevision",Integer(string value.ValidatedRevision);"intendedBoundary",Text intended;"consumedRevision",Integer(string value.ConsumedRevision);"consumedBoundary",Text boundary;"producerMatches",Boolean present;"logMatches",Boolean present;"sourceMatches",Boolean present;"rootsValid",Boolean(value.Phase<>"empty" && value.Phase<>"acquired");"prefixIntact",Boolean(value.Phase<>"empty" && value.Phase<>"acquired");"writerPresent",Boolean present;"stickyInvalid",Boolean value.StickyInvalid]
        let draft={Identity="";Bindings=["evidence",record]}
        {draft with Identity=QuintReplay.stateFingerprint draft |> unwrap}
    let private accepted = function Accepted value -> value | other -> failwithf "%A" other
    let run baseDirectory =
        let tracePath=Path.Combine(baseDirectory,"GrowingLogEvidence.healthy.itf.json")
        let context={Environment=environment;Steps=actions|>List.mapi(fun index action->{Index=index+1;Action=action;Source=source})}
        let trace=QuintReplay.decodeItf context (File.ReadAllText tracePath) |> unwrap
        let id={RunId="run";SourceSetSha256=String('a',64);ArtifactSha256=String('b',64);Pid=100;StartTicks="1";Uid=1000;Device="1";Inode="2";Path="/private/infolog.txt"}
        let mutable current=GrowingLogEvidence.empty
        let states=ResizeArray<EvidenceState>()
        let push next=current<-accepted next;states.Add current
        push(GrowingLogEvidence.acquire id current)
        let observe rev bytes sha={Identity=id;Revision=rev;Bytes=bytes;Sha256=sha;PreviousPrefixIntact=true;WriterPresent=true;CompleteRecord=true;Available=true;RootsValid=true}
        push(GrowingLogEvidence.sample (observe 1 100L (String('c',64))) current);push(GrowingLogEvidence.validate BrowserAdmission current);push(GrowingLogEvidence.consume BrowserAdmission current)
        push(GrowingLogEvidence.sample (observe 2 120L (String('d',64))) current);push(GrowingLogEvidence.validate Normalization current);push(GrowingLogEvidence.consume Normalization current)
        push(GrowingLogEvidence.sample (observe 3 140L (String('e',64))) current);push(GrowingLogEvidence.validate Release current);push(GrowingLogEvidence.consume Release current)
        let observations=states|>Seq.mapi(fun index item->{Index=index+1;Action=actions[index];Source=source;Actual=state item})|>List.ofSeq
        match QuintReplay.compare trace observations |> unwrap with QuintReplayResult.Equivalent -> () | other -> failwithf "reducer/model divergence: %A" other
