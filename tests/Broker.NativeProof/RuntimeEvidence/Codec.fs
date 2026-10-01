namespace FSBar.NativeProof.RuntimeEvidence

open System
open System.IO
open System.Security.Cryptography
open System.Text.Json
open System.Text.Json.Nodes
open System.Text.RegularExpressions

module Codec =
    let private exact (element: JsonElement) (names: string array) =
        if element.ValueKind <> JsonValueKind.Object then invalidArg "input" "object required"
        let seen = Collections.Generic.HashSet<string>(StringComparer.Ordinal)
        for property in element.EnumerateObject() do
            if not (seen.Add property.Name) then invalidArg "input" "duplicate field"
        let expected = Collections.Generic.HashSet<string>(names :> seq<string>, StringComparer.Ordinal)
        if not (seen.SetEquals expected) then invalidArg "input" "closed object"
    let private getString (element: JsonElement) (name: string) =
        let value = element.GetProperty(name)
        if value.ValueKind <> JsonValueKind.String then invalidArg name "string required"
        value.GetString()
    let private getInt (element: JsonElement) (name: string) =
        let value = element.GetProperty(name)
        match value.TryGetInt32() with true, number -> number | _ -> invalidArg name "int required"
    let private getInt64 (element: JsonElement) (name: string) =
        let value = element.GetProperty(name)
        match value.TryGetInt64() with true, number -> number | _ -> invalidArg name "int64 required"
    let private getBoolean (element: JsonElement) (name: string) =
        let value = element.GetProperty(name)
        if value.ValueKind <> JsonValueKind.True && value.ValueKind <> JsonValueKind.False then invalidArg name "bool required"
        value.GetBoolean()
    let private boundary = function
        | "browser" -> BrowserAdmission | "normalization" -> Normalization | "release" -> Release
        | _ -> invalidArg "boundary" "closed boundary"
    let private boundaryText = function BrowserAdmission -> "browser" | Normalization -> "normalization" | Release -> "release"
    let private identity (element: JsonElement) : ProducerIdentity =
        exact element [|"runId";"sourceSetSha256";"apphostSha256";"closureSha256";"pid";"startTicks";"uid";"device";"inode";"path"|]
        { RunId=getString element "runId"; SourceSetSha256=getString element "sourceSetSha256"; ApphostSha256=getString element "apphostSha256";ClosureSha256=getString element "closureSha256"
          Pid=getInt element "pid"; StartTicks=getString element "startTicks"; Uid=getInt element "uid"; Device=getString element "device"; Inode=getString element "inode"; Path=getString element "path" }
    let private decodeState (element: JsonElement) : EvidenceState =
        if element.ValueKind = JsonValueKind.Null then GrowingLogEvidence.empty
        else
            exact element [|"phase";"identity";"observedRevision";"validatedRevision";"validatedBoundary";"consumedRevision";"consumedBoundary";"bytes";"sha256";"stickyInvalid";"reason"|]
            let optionalString (name: string) =
                let value=element.GetProperty(name)
                if value.ValueKind=JsonValueKind.Null then None
                elif value.ValueKind=JsonValueKind.String then Some(value.GetString())
                else invalidArg name "optional string"
            let identityValue = element.GetProperty("identity")
            { Phase=getString element "phase"; Identity=if identityValue.ValueKind=JsonValueKind.Null then None else Some(identity identityValue)
              ObservedRevision=getInt element "observedRevision"; ValidatedRevision=getInt element "validatedRevision"; ValidatedBoundary=optionalString "validatedBoundary" |> Option.map boundary; ConsumedRevision=getInt element "consumedRevision"
              ConsumedBoundary=optionalString "consumedBoundary" |> Option.map boundary; Bytes=getInt64 element "bytes"; Sha256=getString element "sha256"
              StickyInvalid=getBoolean element "stickyInvalid"; Reason=optionalString "reason" }
    let private set<'T> (node: JsonObject) (name: string) (value: 'T) = node[name] <- JsonValue.Create<'T>(value)
    let private identityNode (value: ProducerIdentity) =
        let node=JsonObject()
        set node "runId" value.RunId;set node "sourceSetSha256" value.SourceSetSha256;set node "apphostSha256" value.ApphostSha256;set node "closureSha256" value.ClosureSha256
        set node "pid" value.Pid;set node "startTicks" value.StartTicks;set node "uid" value.Uid;set node "device" value.Device;set node "inode" value.Inode;set node "path" value.Path
        node
    let private stateNode (value: EvidenceState) =
        let node=JsonObject()
        set node "phase" value.Phase
        node["identity"] <- match value.Identity with Some item -> identityNode item :> JsonNode | None -> null
        set node "observedRevision" value.ObservedRevision;set node "validatedRevision" value.ValidatedRevision;set node "consumedRevision" value.ConsumedRevision
        node["validatedBoundary"] <- match value.ValidatedBoundary with Some item -> JsonValue.Create(boundaryText item) :> JsonNode | None -> null
        node["consumedBoundary"] <- match value.ConsumedBoundary with Some item -> JsonValue.Create(boundaryText item) :> JsonNode | None -> null
        set node "bytes" value.Bytes;set node "sha256" value.Sha256;set node "stickyInvalid" value.StickyInvalid
        node["reason"] <- match value.Reason with Some item -> JsonValue.Create(item) :> JsonNode | None -> null
        node
    let private resultNode status state =
        let value=JsonObject()
        set value "schema" "fsbar.barc-growing-log-policy-result/v2";set value "status" status
        value["state"]<-stateNode state
        value.ToJsonString(JsonSerializerOptions(WriteIndented=false)) + "\n"
    let private stateOf = function Accepted state | Pending state | Refused state | Unknown state -> state
    let private statusOf = function Accepted _ -> "accepted" | Pending _ -> "pending" | Refused _ -> "refused" | Unknown _ -> "unknown"
    let evaluate expectedApphostSha256 expectedClosureSha256 (input: byte array) =
        if isNull input || input.Length=0 || input.Length>6*1024*1024 then invalidArg "input" "encoded bound"
        use document=JsonDocument.Parse(input,JsonDocumentOptions(AllowTrailingCommas=false,CommentHandling=JsonCommentHandling.Disallow,MaxDepth=24))
        let root=document.RootElement
        exact root [|"schema";"boundary";"expected";"observation";"prior"|]
        if getString root "schema" <> "fsbar.barc-growing-log-policy/v2" then invalidArg "schema" "schema"
        let expected=root.GetProperty("expected")
        exact expected [|"runId";"sourceSetSha256";"apphostSha256";"closureSha256";"writeRoot";"dataRoot"|]
        if getString expected "apphostSha256"<>expectedApphostSha256 || getString expected "closureSha256"<>expectedClosureSha256 then invalidArg "expected" "active closure identity mismatch"
        let observation=root.GetProperty("observation")
        exact observation [|"pid";"startTicks";"uid";"device";"inode";"path";"revision";"bytes";"sha256";"previousPrefixIntact";"writerFd";"writerFlags";"writerPosition";"available";"logBase64"|]
        let identityValue={ RunId=getString expected "runId";SourceSetSha256=getString expected "sourceSetSha256";ApphostSha256=getString expected "apphostSha256";ClosureSha256=getString expected "closureSha256";Pid=getInt observation "pid";StartTicks=getString observation "startTicks";Uid=getInt observation "uid";Device=getString observation "device";Inode=getString observation "inode";Path=getString observation "path" }
        let raw=Convert.FromBase64String(getString observation "logBase64")
        if raw.Length>4*1024*1024 || int64 raw.Length <> getInt64 observation "bytes" then invalidArg "logBase64" "decoded bound"
        let actualSha = SHA256.HashData(raw) |> Convert.ToHexStringLower
        if getString observation "sha256" <> actualSha then invalidArg "sha256" "decoded digest mismatch"
        let roots=DataRootPolicy.evaluate (getString expected "writeRoot") (getString expected "dataRoot") raw
        let complete,rootsValid,pendingReason = match roots with RootAccepted _ -> true,true,None | RootPending reason -> false,false,Some reason | RootRefused _ -> true,false,None
        let prior=decodeState(root.GetProperty("prior"))
        if prior.ObservedRevision < 0 || prior.ValidatedRevision < 0 || prior.ConsumedRevision < 0 ||
           prior.ValidatedRevision > prior.ObservedRevision || prior.ConsumedRevision > prior.ValidatedRevision ||
           prior.Bytes < 0L || (prior.ObservedRevision = 0 && (prior.Bytes <> 0L || prior.Sha256 <> "")) ||
           (prior.ObservedRevision > 0 && (prior.Bytes = 0L || not (Regex("^[0-9a-f]{64}$", RegexOptions.CultureInvariant).IsMatch prior.Sha256))) then
            invalidArg "prior" "incoherent prior state"
        let phases=Set ["empty";"acquired";"sampled";"validated";"consumed";"invalid";"unknown";"closed"]
        if not(phases.Contains prior.Phase) ||
           (prior.Phase="empty" && prior.Identity.IsSome) || (prior.Phase<>"empty" && prior.Identity<>Some identityValue) ||
           (prior.ValidatedRevision=0 && prior.ValidatedBoundary.IsSome) || (prior.ValidatedRevision>0 && prior.ValidatedBoundary.IsNone) ||
           (prior.ConsumedRevision=0 && prior.ConsumedBoundary.IsSome) || (prior.ConsumedRevision>0 && prior.ConsumedBoundary.IsNone) ||
           (prior.StickyInvalid && prior.Phase<>"invalid" && prior.Phase<>"unknown" && prior.Phase<>"closed") then
            invalidArg "prior" "prior identity or phase mismatch"
        if prior.Bytes > int64 raw.Length then invalidArg "prior" "prior prefix truncated"
        if prior.Bytes > 0L then
            let prefixSha=SHA256.HashData(raw.AsSpan(0,int prior.Bytes)) |> Convert.ToHexStringLower
            if prefixSha<>prior.Sha256 then invalidArg "prior" "prior prefix digest mismatch"
        let acquired = if prior.Phase="empty" then GrowingLogEvidence.acquire identityValue prior else Accepted prior
        let afterAcquire=stateOf acquired
        let writerFd=getInt observation "writerFd"
        let writerFlags=getInt observation "writerFlags"
        let writerPosition=getInt64 observation "writerPosition"
        let writerPresent=writerFd>=0 && writerPosition>=0L && ((writerFlags &&& 3)=1 || (writerFlags &&& 3)=2)
        let sample={ Identity=identityValue;Revision=getInt observation "revision";Bytes=getInt64 observation "bytes";Sha256=getString observation "sha256";PreviousPrefixIntact=getBoolean observation "previousPrefixIntact";WriterPresent=writerPresent;CompleteRecord=complete;Available=getBoolean observation "available";RootsValid=rootsValid;PendingReason=pendingReason }
        let sampled=if statusOf acquired="accepted" then GrowingLogEvidence.sample sample afterAcquire else acquired
        let requestedBoundary=boundary(getString root "boundary")
        let validated=match sampled with Accepted state -> GrowingLogEvidence.validate requestedBoundary state | other -> other
        let consumed=match validated with Accepted state -> GrowingLogEvidence.consume requestedBoundary state | other -> other
        let finalState=stateOf consumed
        if statusOf consumed="accepted" && (finalState.Bytes <> int64 raw.Length || finalState.Sha256 <> actualSha) then invalidArg "result" "sample identity mismatch"
        resultNode (statusOf consumed) finalState
