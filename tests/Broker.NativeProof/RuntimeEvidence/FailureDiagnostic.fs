namespace FSBar.NativeProof.RuntimeEvidence

open System
open System.Collections.Generic
open System.Security.Cryptography
open System.Text
open System.Text.Json
open System.Text.Json.Nodes
open System.Text.RegularExpressions

module FailureDiagnostic =
    [<Literal>]
    let ObservationSchema = "fsbar.barc-stock-failure-observation/v1"
    [<Literal>]
    let PolicyObservationSchema = "fsbar.barc-runtime-evidence-failure-observation/v1"
    [<Literal>]
    let RequestSchema = "fsbar.barc-stock-failure-projection/v1"
    [<Literal>]
    let ResultSchema = "fsbar.barc-stock-failure-diagnostic/v1"

    let checks =
        Set [ "engine-process-read"; "runtime-closure-process"; "runtime-closure-input"
              "runtime-closure-resolve"; "runtime-map-census"; "runtime-map-validation"
              "runtime-executable-map"; "runtime-final-generation"; "infolog-process"
              "infolog-path"; "infolog-parent"; "infolog-file-custody"; "infolog-open"
              "infolog-descriptor-identity"; "infolog-writer-census"; "infolog-writer-match"
              "infolog-final-generation"; "policy-artifact"; "policy-closure-precheck"
              "policy-apphost-join"; "policy-scope-join"; "infolog-sample"
              "policy-child-start"; "policy-ready"; "policy-transport"; "policy-completion"
              "policy-result-join"; "infolog-final-refresh"; "policy-final-precheck"
              "policy-sample-exhausted"; "browser-start" ]
    let outcomes = Set [ "refused"; "os-unavailable"; "deadline"; "malformed"; "unexpected"; "policy-nonaccepted" ]
    let policyCheckpoints = Set [ "initial-closure"; "current-process"; "invocation-ready"; "request-read"; "request-evaluation"; "final-closure"; "invocation-completion" ]
    let policyKinds = Set [ "exception"; "pending"; "refused"; "unknown" ]
    let private shaPattern = Regex("\\A[0-9a-f]{64}\\z",RegexOptions.CultureInvariant)

    let private refuse () = raise(InvalidOperationException("diagnostic unavailable"))
    let private require value = if not value then refuse()
    let private exact (element:JsonElement) names =
        require(element.ValueKind=JsonValueKind.Object)
        let seen=HashSet<string>(StringComparer.Ordinal)
        for property in element.EnumerateObject() do require(seen.Add property.Name)
        require(seen.SetEquals(names:seq<string>))
    let private text (name:string) (element:JsonElement) : string =
        let value=element.GetProperty name
        require(value.ValueKind=JsonValueKind.String)
        value.GetString()
    let private digest (name:string) (element:JsonElement) : string = let value=text name element in require(shaPattern.IsMatch value);value
    let private canonicalHash (element:JsonElement) =
        let bytes=Encoding.UTF8.GetBytes(element.GetRawText()+"\n")
        SHA256.HashData bytes |> Convert.ToHexStringLower

    let policyObservation (checkpoint:string) (kind:string) =
        require(policyCheckpoints.Contains checkpoint && policyKinds.Contains kind)
        let node=JsonObject()
        node["schema"]<-JsonValue.Create PolicyObservationSchema
        node["checkpoint"]<-JsonValue.Create checkpoint
        node["kind"]<-JsonValue.Create kind
        node.ToJsonString(JsonSerializerOptions(WriteIndented=false))

    let private compatible (check:string) (checkpoint:string) =
        match check,checkpoint with
        | "policy-closure-precheck","initial-closure"
        | "policy-artifact","current-process"
        | "policy-ready","invocation-ready"
        | "policy-transport","request-read"
        | "policy-result-join","request-evaluation"
        | "policy-sample-exhausted","request-evaluation"
        | "policy-final-precheck","final-closure"
        | "policy-completion","invocation-completion" -> true
        | _ -> false

    let private categoryFor = function
        | "refused" | "policy-nonaccepted" -> "refused"
        | "os-unavailable" | "malformed" | "unexpected" -> "error"
        | "deadline" -> "operation-unknown"
        | _ -> refuse()

    let private runtimeFailureCodes =
        Set [ "runtime-map-deleted"; "runtime-map-unadmitted"; "runtime-map-missing"
              "runtime-map-identity-drift"; "runtime-map-content-drift"; "runtime-map-none"
              "runtime-engine-map-missing"; "runtime-process-identity-drift" ]

    let private runtimeFailureCheck = function
        | "runtime-map-deleted" | "runtime-map-unadmitted" | "runtime-map-missing"
        | "runtime-map-identity-drift" | "runtime-map-content-drift" | "runtime-map-none" -> "runtime-map-validation"
        | "runtime-engine-map-missing" -> "runtime-executable-map"
        | "runtime-process-identity-drift" -> "runtime-final-generation"
        | _ -> refuse()

    let unavailable () =
        let node=JsonObject()
        node["schema"]<-JsonValue.Create ResultSchema;node["status"]<-JsonValue.Create "diagnostic-unavailable"
        node["observationSha256"]<-null;node["operationResultSha256"]<-null
        node["scope"]<-JsonValue.Create "post-handoff-pre-browser";node["check"]<-null;node["outcome"]<-null
        node["policyObservation"]<-null;node["nativeAcceptance"]<-JsonValue.Create false
        node.ToJsonString(JsonSerializerOptions(WriteIndented=false))+"\n"

    let project (expectedSource:string) (expectedPolicy:string) (expectedClosure:string) (root:JsonElement) =
        try
            exact root ["schema";"expected";"observation";"observationSha256";"operationResultBase64";"operationResultSha256"]
            require(text "schema" root=RequestSchema)
            let expected=root.GetProperty "expected"
            exact expected ["configSha256";"sourceSetSha256";"policySha256";"closureSha256"]
            let expectedConfig=digest "configSha256" expected
            require(digest "sourceSetSha256" expected=expectedSource && digest "policySha256" expected=expectedPolicy && digest "closureSha256" expected=expectedClosure)
            let observation=root.GetProperty "observation"
            exact observation ["schema";"configSha256";"sourceSetSha256";"policySha256";"closureSha256";"scope";"check";"outcome";"policyObservation"]
            require(text "schema" observation=ObservationSchema)
            require(digest "configSha256" observation=expectedConfig && digest "sourceSetSha256" observation=expectedSource && digest "policySha256" observation=expectedPolicy && digest "closureSha256" observation=expectedClosure)
            require(text "scope" observation="post-handoff-pre-browser")
            let check=text "check" observation
            let outcome=text "outcome" observation
            require(checks.Contains check && outcomes.Contains outcome)
            let policyElement=observation.GetProperty "policyObservation"
            let policyNode,policyKind =
                if policyElement.ValueKind=JsonValueKind.Null then null,None
                else
                    exact policyElement ["schema";"checkpoint";"kind"]
                    require(text "schema" policyElement=PolicyObservationSchema)
                    let checkpoint=text "checkpoint" policyElement
                    let kind=text "kind" policyElement
                    require(policyCheckpoints.Contains checkpoint && policyKinds.Contains kind && compatible check checkpoint)
                    JsonNode.Parse(policyElement.GetRawText()),Some kind
            let observationHash=digest "observationSha256" root
            require(canonicalHash observation=observationHash)
            let operationBytes=Convert.FromBase64String(text "operationResultBase64" root)
            require(operationBytes.Length>0 && operationBytes.Length<=8192)
            let operationHash=digest "operationResultSha256" root
            require((SHA256.HashData operationBytes |> Convert.ToHexStringLower)=operationHash)
            use operationDocument=JsonDocument.Parse(operationBytes,JsonDocumentOptions(AllowTrailingCommas=false,CommentHandling=JsonCommentHandling.Disallow,MaxDepth=8))
            let operation=operationDocument.RootElement
            let operationNames=operation.EnumerateObject() |> Seq.map _.Name |> Set.ofSeq
            require(operationNames=Set ["schema";"status";"category"] || operationNames=Set ["schema";"status";"category";"failureCode"])
            exact operation operationNames
            require(text "schema" operation="fsbar.barc-stock-operation-result/v1" && text "status" operation="failed")
            let category=text "category" operation
            require(category=categoryFor outcome)
            if operationNames.Contains "failureCode" then
                let failureCode=text "failureCode" operation
                require(category="refused" && outcome="refused" && policyKind.IsNone && runtimeFailureCodes.Contains failureCode && check=runtimeFailureCheck failureCode)
            match policyKind with
            | None -> require(outcome<>"policy-nonaccepted")
            | Some "exception" -> require(outcome="refused")
            | Some "pending" -> require(outcome="policy-nonaccepted" && check="policy-sample-exhausted")
            | Some kind when kind="refused" || kind="unknown" -> require(outcome="policy-nonaccepted" && check="policy-result-join")
            | _ -> refuse()
            let node=JsonObject()
            node["schema"]<-JsonValue.Create ResultSchema;node["status"]<-JsonValue.Create "observed-failure"
            node["observationSha256"]<-JsonValue.Create observationHash;node["operationResultSha256"]<-JsonValue.Create operationHash
            node["scope"]<-JsonValue.Create "post-handoff-pre-browser";node["check"]<-JsonValue.Create check;node["outcome"]<-JsonValue.Create outcome
            node["policyObservation"]<-policyNode;node["nativeAcceptance"]<-JsonValue.Create false
            node.ToJsonString(JsonSerializerOptions(WriteIndented=false))+"\n"
        with _ -> unavailable()
