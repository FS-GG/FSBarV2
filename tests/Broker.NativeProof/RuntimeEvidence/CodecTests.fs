namespace FSBar.NativeProof.RuntimeEvidence.Tests

open System
open System.Security.Cryptography
open System.Text
open FSBar.NativeProof.RuntimeEvidence

module CodecTests =
    let private sha (bytes: byte array) = SHA256.HashData(bytes) |> Convert.ToHexStringLower
    let private request () =
        let log=Encoding.UTF8.GetBytes("[DataDirLocater::Check] Isolation Mode!\n[DataDirLocater::FindWriteableDataDir] using writeable data-directory \"/write\"\n[DataDirLocater::FilterUsableDataDirs] using read-write data directory: /write/\n[DataDirLocater::FilterUsableDataDirs] using read-only data directory: /data/\n")
        let encoded=Convert.ToBase64String(log)
        let source=$"{{\"schema\":\"fsbar.barc-growing-log-policy/v1\",\"boundary\":\"browser\",\"expected\":{{\"runId\":\"run\",\"sourceSetSha256\":\"{String('a',64)}\",\"artifactSha256\":\"{String('b',64)}\",\"writeRoot\":\"/write\",\"dataRoot\":\"/data\"}},\"observation\":{{\"pid\":100,\"startTicks\":\"1\",\"uid\":1000,\"device\":\"1\",\"inode\":\"2\",\"path\":\"/private/infolog.txt\",\"revision\":1,\"bytes\":{log.Length},\"sha256\":\"{sha log}\",\"previousPrefixIntact\":true,\"writerFd\":4,\"writerFlags\":1,\"writerPosition\":{log.Length},\"available\":true,\"logBase64\":\"{encoded}\"}},\"prior\":null}}"
        source,log.Length
    let private bytes (value:string)=Encoding.UTF8.GetBytes(value)
    let private refused value = try Codec.evaluate(bytes value)|>ignore;false with :? ArgumentException -> true | :? Text.Json.JsonException -> true | :? FormatException -> true | :? InvalidOperationException -> true
    let run () =
        let source,length=request()
        let result=Codec.evaluate(bytes source)
        if not(result.Contains("\"status\":\"accepted\"")) || result.Contains("logBase64") then failwith "valid closed codec projection failed"
        if not(refused(source.Replace("{\"schema\":","{\"unexpected\":1,\"schema\":"))) then failwith "unknown field accepted"
        if not(refused(source.Replace("{\"schema\":","{\"schema\":\"duplicate\",\"schema\":"))) then failwith "duplicate field accepted"
        if not(refused(source.Replace("\"revision\":1","\"revision\":\"1\""))) then failwith "typed numeric field accepted as text"
        let wrongBytes=source.Replace($"\"bytes\":{length}","\"bytes\":1")
        if not(refused wrongBytes) then failwith "decoded byte mismatch accepted"
