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
    let private refused value = try Codec.evaluate (String('b',64)) (String('c',64)) (bytes value)|>ignore;false with :? ArgumentException -> true | :? Text.Json.JsonException -> true | :? FormatException -> true | :? InvalidOperationException -> true
    let run () =
        let source,log=request()
        let length=log.Length
        let result=Codec.evaluate (String('b',64)) (String('c',64)) (bytes source)
        try Codec.evaluate (String('b',64)) (String('d',64)) (bytes source)|>ignore;failwith "active closure mismatch accepted" with :? ArgumentException -> ()
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
        let pending=Codec.evaluate (String('b',64)) (String('c',64)) (bytes missingIsolation)
        if not(pending.Contains("\"status\":\"pending\"")) || not(pending.Contains("\"reason\":\"isolation-record-absent\"")) then failwith "pending parser reason collapsed"
        use firstDocument=JsonDocument.Parse(result)
        let prior=firstDocument.RootElement.GetProperty("state").GetRawText()
        let grown=Array.append log (Encoding.UTF8.GetBytes("unrelated complete record\n"))
        let next=source.Replace("\"revision\":1","\"revision\":2").Replace($"\"bytes\":{length}",$"\"bytes\":{grown.Length}").Replace(sha log,sha grown).Replace(Convert.ToBase64String(log),Convert.ToBase64String(grown)).Replace("\"prior\":null",$"\"prior\":{prior}")
        let nextResult=Codec.evaluate (String('b',64)) (String('c',64)) (bytes next)
        if not(nextResult.Contains("\"status\":\"accepted\"")) then failwith "coherent prior prefix refused"
        let changedPrefix=Array.copy grown
        changedPrefix[0] <- byte 'X'
        let changedNext=next.Replace(sha grown,sha changedPrefix).Replace(Convert.ToBase64String(grown),Convert.ToBase64String(changedPrefix))
        if not(refused changedNext) then failwith "prior prefix digest mismatch accepted"
