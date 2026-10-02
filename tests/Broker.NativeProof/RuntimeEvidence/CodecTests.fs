namespace FSBar.NativeProof.RuntimeEvidence.Tests

open System
open System.Security.Cryptography
open System.Text
open System.Text.Json
open FSBar.NativeProof.RuntimeEvidence

module CodecTests =
    let private sha (bytes: byte array) = SHA256.HashData(bytes) |> Convert.ToHexStringLower
    let private request () =
        let log=Encoding.UTF8.GetBytes("[DataDirLocater::Check] Isolation Mode!\n[DataDirLocater::FindWriteableDataDir] using writeable data-directory \"/write\"\n[DataDirLocater::FilterUsableDataDirs] using read-write data directory: /write/\n[DataDirLocater::FilterUsableDataDirs] using read-only data directory: /data/\n")
        let encoded=Convert.ToBase64String(log)
        let source=$"{{\"schema\":\"fsbar.barc-growing-log-policy/v2\",\"boundary\":\"browser\",\"expected\":{{\"runId\":\"run\",\"sourceSetSha256\":\"{String('a',64)}\",\"apphostSha256\":\"{String('b',64)}\",\"closureSha256\":\"{String('c',64)}\",\"writeRoot\":\"/write\",\"dataRoot\":\"/data\"}},\"observation\":{{\"pid\":100,\"startTicks\":\"1\",\"uid\":1000,\"device\":\"1\",\"inode\":\"2\",\"path\":\"/private/infolog.txt\",\"revision\":1,\"bytes\":{log.Length},\"sha256\":\"{sha log}\",\"previousPrefixIntact\":true,\"writerFd\":4,\"writerFlags\":1,\"writerPosition\":{log.Length},\"available\":true,\"logBase64\":\"{encoded}\"}},\"prior\":null}}"
        source,log
    let private bytes (value:string)=Encoding.UTF8.GetBytes(value)
    let private evaluate value = Codec.evaluate (String('b',64)) (String('c',64)) (String('a',64)) (bytes value)
    let private refused value = try evaluate value|>ignore;false with :? ArgumentException -> true | :? Text.Json.JsonException -> true | :? FormatException -> true | :? InvalidOperationException -> true
    let run () =
        let source,log=request()
        let length=log.Length
        let result=evaluate source|>Codec.complete
        try Codec.evaluate (String('b',64)) (String('d',64)) (String('a',64)) (bytes source)|>ignore;failwith "active closure mismatch accepted" with :? ArgumentException -> ()
        try Codec.evaluate (String('b',64)) (String('c',64)) (String('d',64)) (bytes source)|>ignore;failwith "active source set mismatch accepted" with :? ArgumentException -> ()
        if not(result.Contains("\"status\":\"accepted\"")) || result.Contains("logBase64") then failwith "valid closed codec projection failed"
        if not(refused(source.Replace("{\"schema\":","{\"unexpected\":1,\"schema\":"))) then failwith "unknown field accepted"
        if not(refused(source.Replace("{\"schema\":","{\"schema\":\"duplicate\",\"schema\":"))) then failwith "duplicate field accepted"
        if not(refused(source.Replace("\"revision\":1","\"revision\":\"1\""))) then failwith "typed numeric field accepted as text"
        let wrongBytes=source.Replace($"\"bytes\":{length}","\"bytes\":1")
        if not(refused wrongBytes) then failwith "decoded byte mismatch accepted"
        let digestStart=source.IndexOf("\"sha256\":\"") + 10
        let wrongDigest=source.Remove(digestStart,64).Insert(digestStart,String('0',64))
        if not(refused wrongDigest) then failwith "well-formed wrong digest accepted"
        let malformedPrior=source.Replace("\"prior\":null", "\"prior\":{\"phase\":\"consumed\",\"identity\":null,\"observedRevision\":0,\"validatedRevision\":1,\"validatedBoundary\":\"browser\",\"consumedRevision\":1,\"consumedBoundary\":\"browser\",\"bytes\":0,\"sha256\":\"\",\"stickyInvalid\":false,\"reason\":null}")
        if not(refused malformedPrior) then failwith "incoherent prior state accepted"
        let changed=Array.copy log
        for index in 0..36 do changed[index] <- byte 'X'
        let missingIsolation=source.Replace(Convert.ToBase64String(log),Convert.ToBase64String(changed)).Replace(sha log,sha changed)
        let pending=evaluate missingIsolation|>Codec.complete
        if not(pending.Contains("\"status\":\"pending\"")) || not(pending.Contains("\"reason\":\"isolation-record-absent\"")) then failwith "pending parser reason collapsed"
        use firstDocument=JsonDocument.Parse(result)
        let prior=firstDocument.RootElement.GetProperty("state").GetRawText()
        let grown=Array.append log (Encoding.UTF8.GetBytes("unrelated complete record\n"))
        let next=source.Replace("\"revision\":1","\"revision\":2").Replace($"\"bytes\":{length}",$"\"bytes\":{grown.Length}").Replace(sha log,sha grown).Replace(Convert.ToBase64String(log),Convert.ToBase64String(grown)).Replace("\"prior\":null",$"\"prior\":{prior}")
        let nextResult=evaluate next|>Codec.complete
        if not(nextResult.Contains("\"status\":\"accepted\"")) then failwith "coherent prior prefix refused"
        let changedPrefix=Array.copy grown
        changedPrefix[0] <- byte 'X'
        let changedNext=next.Replace(sha grown,sha changedPrefix).Replace(Convert.ToBase64String(grown),Convert.ToBase64String(changedPrefix))
        if not(refused changedNext) then failwith "prior prefix digest mismatch accepted"
        let policyObservation="{\"schema\":\"fsbar.barc-runtime-evidence-failure-observation/v1\",\"checkpoint\":\"request-evaluation\",\"kind\":\"refused\"}"
        let observation=$"{{\"schema\":\"fsbar.barc-stock-failure-observation/v1\",\"configSha256\":\"{String('d',64)}\",\"sourceSetSha256\":\"{String('a',64)}\",\"policySha256\":\"{String('b',64)}\",\"closureSha256\":\"{String('c',64)}\",\"scope\":\"post-handoff-pre-browser\",\"check\":\"policy-result-join\",\"outcome\":\"policy-nonaccepted\",\"policyObservation\":{policyObservation}}}"
        let observationHash=sha(bytes(observation+"\n"))
        let operation="{\"schema\":\"fsbar.barc-stock-operation-result/v1\",\"status\":\"failed\",\"category\":\"refused\"}\n"
        let operationBase64=Convert.ToBase64String(bytes operation)
        let operationHash=sha(bytes operation)
        let diagnostic=$"{{\"schema\":\"fsbar.barc-stock-failure-projection/v1\",\"expected\":{{\"configSha256\":\"{String('d',64)}\",\"sourceSetSha256\":\"{String('a',64)}\",\"policySha256\":\"{String('b',64)}\",\"closureSha256\":\"{String('c',64)}\"}},\"observation\":{observation},\"observationSha256\":\"{observationHash}\",\"operationResultBase64\":\"{operationBase64}\",\"operationResultSha256\":\"{operationHash}\"}}"
        let projected=evaluate diagnostic|>Codec.complete
        if not(projected.Contains("\"status\":\"observed-failure\"")) || not(projected.Contains("\"nativeAcceptance\":false")) || projected.Contains("PRIVATE_SENTINEL") then failwith "valid failure diagnostic projection refused"
        let invalidDiagnostics =
            [ diagnostic.Replace("\"sourceSetSha256\":\""+String('a',64),"\"sourceSetSha256\":\""+String('f',64))
              diagnostic.Replace(observationHash,String('0',64))
              diagnostic.Replace("\"check\":\"policy-result-join\"","\"check\":\"browser-start\"")
              diagnostic.Replace("\"checkpoint\":\"request-evaluation\"","\"checkpoint\":\"initial-closure\"")
              diagnostic.Replace("\"kind\":\"refused\"","\"kind\":\"PRIVATE_SENTINEL\"")
              diagnostic.Replace("\"outcome\":\"policy-nonaccepted\"","\"outcome\":[]")
              diagnostic.Replace(operationHash,String('0',64))
              diagnostic.Replace("\"operationResultBase64\"","\"operationResult\":{},\"operationResultBase64\"")
              diagnostic.Replace("fsbar.barc-stock-failure-projection/v1","unknown-diagnostic/v1")
              diagnostic.Replace("\"policyObservation\":"+policyObservation,"\"policyObservation\":{\"schema\":\"fsbar.barc-runtime-evidence-failure-observation/v1\",\"checkpoint\":\"request-evaluation\",\"checkpoint\":\"request-evaluation\",\"kind\":\"refused\"}")
              diagnostic.Replace("{\"schema\":\"fsbar.barc-stock-failure-projection/v1\"","{\"extra\":true,\"schema\":\"fsbar.barc-stock-failure-projection/v1\"")
              diagnostic.Replace("{\"schema\":\"fsbar.barc-stock-failure-projection/v1\"","{\"schema\":\"fsbar.barc-stock-failure-projection/v1\",\"schema\":\"fsbar.barc-stock-failure-projection/v1\"") ]
        for invalid in invalidDiagnostics do
            let unavailable=evaluate invalid|>Codec.complete
            if not(unavailable.Contains("\"status\":\"diagnostic-unavailable\"")) || unavailable.Contains("PRIVATE_SENTINEL") || unavailable.Contains("observed-failure") then failwith "malformed diagnostic escaped closed projection"
        let operationUnknown="{\"schema\":\"fsbar.barc-stock-operation-result/v1\",\"status\":\"failed\",\"category\":\"operation-unknown\"}\n"
        let contradictory=diagnostic.Replace(operationBase64,Convert.ToBase64String(bytes operationUnknown)).Replace(operationHash,sha(bytes operationUnknown))
        if not((evaluate contradictory|>Codec.complete).Contains("\"status\":\"diagnostic-unavailable\"")) then failwith "contradictory operation category accepted"
        let runtimeFailure="{\"schema\":\"fsbar.barc-stock-operation-result/v1\",\"status\":\"failed\",\"category\":\"refused\",\"failureCode\":\"runtime-map-missing\"}\n"
        let runtimeDiagnostic=diagnostic.Replace(operationBase64,Convert.ToBase64String(bytes runtimeFailure)).Replace(operationHash,sha(bytes runtimeFailure))
        if not((evaluate runtimeDiagnostic|>Codec.complete).Contains("\"status\":\"observed-failure\"")) then failwith "closed runtime failure result refused"
        let pendingObservation=observation.Replace("\"kind\":\"refused\"","\"kind\":\"pending\"")
        let pendingContradiction=diagnostic.Replace(observation,pendingObservation).Replace(observationHash,sha(bytes(pendingObservation+"\n")))
        if not((evaluate pendingContradiction|>Codec.complete).Contains("\"status\":\"diagnostic-unavailable\"")) then failwith "incompatible pending policy observation accepted"
        let mechanicalObservation=observation.Replace("\"check\":\"policy-result-join\"","\"check\":\"infolog-final-refresh\"").Replace("\"outcome\":\"policy-nonaccepted\"","\"outcome\":\"os-unavailable\"").Replace("\"policyObservation\":"+policyObservation,"\"policyObservation\":null")
        let errorOperation="{\"schema\":\"fsbar.barc-stock-operation-result/v1\",\"status\":\"failed\",\"category\":\"error\"}\n"
        let mechanicalDiagnostic=diagnostic.Replace(observation,mechanicalObservation).Replace(observationHash,sha(bytes(mechanicalObservation+"\n"))).Replace(operationBase64,Convert.ToBase64String(bytes errorOperation)).Replace(operationHash,sha(bytes errorOperation))
        if not((evaluate mechanicalDiagnostic|>Codec.complete).Contains("\"status\":\"observed-failure\"")) then failwith "later mechanical failure refused"
        let oversized=diagnostic+String(' ',8193)
        if not((evaluate oversized|>Codec.complete).Contains("\"status\":\"diagnostic-unavailable\"")) then failwith "oversized diagnostic decoded"
        let malformed=Array.append (bytes diagnostic) [|0xffuy|]
        if not((Codec.evaluate (String('b',64)) (String('c',64)) (String('a',64)) malformed|>Codec.complete).Contains("\"status\":\"diagnostic-unavailable\"")) then failwith "malformed UTF-8 diagnostic escaped"
