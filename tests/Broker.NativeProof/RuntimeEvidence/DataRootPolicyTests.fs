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
