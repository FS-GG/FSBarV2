namespace FSBar.NativeProof.RuntimeEvidence.Tests

open System.Text
open FSBar.NativeProof.RuntimeEvidence

module DataRootPolicyTests =
    let private bytes (value:string) = Encoding.UTF8.GetBytes value
    let private good writeRoot dataRoot suffix =
        $"[DataDirLocater::Check] Isolation Mode!\n[DataDirLocater::FindWriteableDataDir] using writeable data-directory \"{writeRoot}\"\n[DataDirLocater::FilterUsableDataDirs] using read-write data directory: {writeRoot}/\n[DataDirLocater::FilterUsableDataDirs] using read-only data directory: {dataRoot}/\n{suffix}"
    let private prefixed prefix (value:string) =
        value.Split('\n') |> Array.map (fun line -> if line = "" then line else prefix + line) |> String.concat "\n"
    let run () =
        let writeRoot="/private/attempt/engine"
        let dataRoot="/private/runtime-data"
        match DataRootPolicy.evaluate writeRoot dataRoot (bytes(good writeRoot dataRoot "unrelated complete record\n")) with RootAccepted _ -> () | other -> failwithf "healthy roots refused: %A" other
        for prefix in ["[t=00:00:00.123456] "; "[t=00:00:00.123456][f=0000000] "] do
            match DataRootPolicy.evaluate writeRoot dataRoot (bytes(prefixed prefix (good writeRoot dataRoot "unrelated complete record\n"))) with
            | RootAccepted _ -> () | other -> failwithf "actual Recoil prefix refused: %A" other
        match DataRootPolicy.evaluate writeRoot dataRoot (bytes(good writeRoot dataRoot "[DataDirLocater::FilterUsableDataDirs] using read-only data directory: /extra\n")) with RootRefused "data-root-drift" -> () | other -> failwithf "extra root accepted: %A" other
        let restored=good writeRoot dataRoot $"[DataDirLocater::FindWriteableDataDir] using writeable data-directory \"/wrong\"\n[DataDirLocater::FindWriteableDataDir] using writeable data-directory \"{writeRoot}\"\n"
        match DataRootPolicy.evaluate writeRoot dataRoot (bytes restored) with RootRefused "contradictory-write-root" -> () | other -> failwithf "restored contradiction accepted: %A" other
        let malicious=$"INFO unrelated [DataDirLocater::Check] Isolation Mode!\nINFO unrelated [DataDirLocater::FindWriteableDataDir] using writeable data-directory \"{writeRoot}\"\nINFO unrelated [DataDirLocater::FilterUsableDataDirs] using read-write data directory: {writeRoot}\nINFO unrelated [DataDirLocater::FilterUsableDataDirs] using read-only data directory: {dataRoot}\n"
        match DataRootPolicy.evaluate writeRoot dataRoot (bytes malicious) with RootPending _ -> () | other -> failwithf "embedded phrase accepted: %A" other
        let contradiction=good writeRoot dataRoot $"[t=00:00:00.123456] [DataDirLocater::FilterUsableDataDirs] using read-only data directory: /wrong/\n"
        match DataRootPolicy.evaluate writeRoot dataRoot (bytes contradiction) with RootRefused "data-root-drift" -> () | other -> failwithf "prefixed contradiction accepted: %A" other
        let traversal=(good writeRoot dataRoot "").Replace(dataRoot + "/", "/private/other/../runtime-data/")
        match DataRootPolicy.evaluate writeRoot dataRoot (bytes traversal) with RootRefused "noncanonical-root" -> () | other -> failwithf "lexical traversal accepted: %A" other
        match DataRootPolicy.evaluate writeRoot dataRoot (bytes(good writeRoot dataRoot "unfinished")) with RootPending "incomplete-record" -> () | other -> failwithf "unfinished record accepted: %A" other
        match DataRootPolicy.evaluate writeRoot dataRoot [|0xffuy;0x0auy|] with RootRefused "invalid-utf8" -> () | other -> failwithf "invalid UTF-8 accepted: %A" other
        let header=bytes(good writeRoot dataRoot "")
        let atCap=Array.append header (Array.append (Array.create (10*1024*1024-header.Length-1) (byte 'x')) [|byte '\n'|])
        match DataRootPolicy.evaluate writeRoot dataRoot atCap with RootAccepted _ -> () | other -> failwithf "10 MiB complete sample refused: %A" other
        let aboveCap=Array.append atCap [|byte '\n'|]
        match DataRootPolicy.evaluate writeRoot dataRoot aboveCap with RootRefused "custody-or-bound" -> () | other -> failwithf "10 MiB + 1 accepted: %A" other
        let recordCap=bytes(good writeRoot dataRoot (String.replicate (65536-4) "x\n"))
        match DataRootPolicy.evaluate writeRoot dataRoot recordCap with RootAccepted _ -> () | other -> failwithf "65,536 records refused: %A" other
        match DataRootPolicy.evaluate writeRoot dataRoot (Array.append recordCap (bytes "x\n")) with RootRefused "record-bound" -> () | other -> failwithf "65,537 records admitted: %A" other

        for prefix in ["";"[t=00:00:00.123456] ";"[t=00:00:00.123456][f=0000000] "] do
            for index in [0;1] do
                let raw=bytes(good writeRoot dataRoot $"{prefix}CTextureRenderAtlas::CreateAtlasTexture()[{index}] atlas=public fixture")
                match DataRootPolicy.evaluate writeRoot dataRoot raw with RootAccepted _ -> () | other -> failwithf "safe exact atlas tail refused: %A" other
                let horizon=DataRootPolicy.describe raw
                if horizon.RawBytes<>horizon.CompleteBytes+horizon.TailBytes || horizon.TailClass<>"atlas" || horizon.CompleteRecords<>4 then failwith "derived raw/P/T descriptor drift"
        for tail in ["CTextureRenderAtlas::CreateAtlasTexture()[0] atlas";"[t=00:00:00.12345";"[DataDirLocater::FilterUsableDataDirs] using read-only data directory: /wrong";"unknown"] do
            match DataRootPolicy.evaluate writeRoot dataRoot (bytes(good writeRoot dataRoot tail)) with RootPending _ -> () | other -> failwithf "unknown/relevant/partial tail accepted: %A" other
        let valid=bytes(good writeRoot dataRoot "")
        for partial in [[|0xc2uy|];[|0xe2uy;0x82uy|];[|0xf0uy;0x9fuy;0x92uy|]] do
            match DataRootPolicy.evaluate writeRoot dataRoot (Array.append valid partial) with RootPending "incomplete-utf8" -> () | other -> failwithf "partial UTF8 scalar mishandled: %A" other
        for malformed in [[|0xffuy|];[|0xe0uy;0x80uy|];[|0xeduy;0xa0uy|];[|0xf4uy;0x90uy|];[|0xc2uy;0x41uy|];[|0uy|]] do
            match DataRootPolicy.evaluate writeRoot dataRoot (Array.append valid malformed) with RootRefused _ -> () | other -> failwithf "malformed raw tail admitted: %A" other
        match DataRootPolicy.evaluate writeRoot dataRoot [||] with RootPending "complete-prefix-absent" -> () | other -> failwithf "empty complete prefix admitted: %A" other
        let missing=(good writeRoot dataRoot "").Replace($"[DataDirLocater::FilterUsableDataDirs] using read-only data directory: {dataRoot}/\n", "")
        match DataRootPolicy.evaluate writeRoot dataRoot (bytes missing) with RootPending "data-root-record-absent" -> () | other -> failwithf "missing root record is not pending: %A" other
