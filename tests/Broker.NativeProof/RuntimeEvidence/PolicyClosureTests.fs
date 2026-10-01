namespace FSBar.NativeProof.RuntimeEvidence.Tests

open System
open System.IO
open System.Security.Cryptography
open System.Text.Json
open System.Text.Json.Nodes
open FSBar.NativeProof.RuntimeEvidence

module PolicyClosureTests =
    let private sha path =
        use stream=File.OpenRead path
        SHA256.HashData stream |> Convert.ToHexString |> _.ToLowerInvariant()
    let private pin (role:string option) (path:string) =
        let value=JsonObject()
        match role with
        | Some r -> value["role"] <- r
        | None -> ()
        value["path"] <- path
        value["bytes"] <- FileInfo(path).Length
        value["sha256"] <- sha path
        value
    let private refuses f =
        try f(); false with :? InvalidOperationException -> true
    let run() =
        let root=Path.Combine(Path.GetTempPath(),"bar-policy-closure-"+Guid.NewGuid().ToString("N"))
        let managed=Path.Combine(root,"managed")
        let provenance=Path.Combine(root,"provenance")
        let runtime=Path.Combine(root,"runtime")
        Directory.CreateDirectory managed |> ignore
        Directory.CreateDirectory provenance |> ignore
        Directory.CreateDirectory runtime |> ignore
        let make dir name =
            let p=Path.Combine(dir,name)
            File.WriteAllText(p,name)
            File.SetUnixFileMode(p,UnixFileMode.UserRead)
            p
        let apphost=make managed "RuntimeEvidence"
        let managedPins=["apphost",apphost;"managedDll",make managed "RuntimeEvidence.dll";"depsJson",make managed "RuntimeEvidence.deps.json";"runtimeConfigJson",make managed "RuntimeEvidence.runtimeconfig.json";"fsharpCore",make managed "FSharp.Core.dll"]
        let pdb=make provenance "RuntimeEvidence.pdb"
        let runtimeFiles=["hostfxr",make runtime "libhostfxr.so";"hostpolicy",make runtime "libhostpolicy.so";"coreLib",make runtime "System.Private.CoreLib.dll";"coreClr",make runtime "libcoreclr.so";"jit",make runtime "libclrjit.so"]
        for d in [managed;provenance;runtime] do File.SetUnixFileMode(d,UnixFileMode.UserRead|||UnixFileMode.UserExecute)
        let zeros=String.replicate 64 "0"
        let commits=String.replicate 40 "0"
        let source=JsonObject()
        for name in ["policyCommit";"policyTree";"productCommit";"productTree"] do source[name]<-commits
        for name in ["buildInputsSha256";"lockFileSha256";"toolchainSha256";"pdbSha256";"sourceLinkSha256";"helperManifestSha256"] do source[name]<-zeros
        let custody=JsonObject()
        custody["ownerUid"] <- 0
        custody["executablePath"] <- apphost
        custody["fixedArgv"] <- JsonArray(apphost,"--closure-manifest","--closure-sha256","--invocation-id")
        let roles=JsonObject()
        for role,path in runtimeFiles do roles[role]<-path
        let document=JsonObject()
        document["schema"] <- PolicyClosure.Schema
        document["managedRoot"] <- managed
        document["provenanceRoot"] <- provenance
        document["runtimeRoots"] <- JsonArray(runtime)
        document["managed"]<-JsonArray(managedPins|>List.map(fun (r,p)->pin(Some r)p :> JsonNode)|>List.toArray)
        document["provenance"]<-JsonArray(pin(Some "pdb")pdb)
        document["runtime"]<-JsonArray(runtimeFiles|>List.map(fun (_,p)->pin None p :> JsonNode)|>List.toArray)
        document["runtimeRoles"] <- roles
        document["source"] <- source
        document["custody"] <- custody
        let manifest=Path.Combine(root,"closure.json")
        let original=document.ToJsonString(JsonSerializerOptions(WriteIndented=false))
        File.WriteAllText(manifest,original)
        File.SetUnixFileMode(manifest,UnixFileMode.UserRead)
        let digest=sha manifest
        PolicyClosure.loadAndVerify manifest digest "invocation"|>ignore
        File.SetUnixFileMode(runtimeFiles.Head|>snd,UnixFileMode.UserRead|||UnixFileMode.UserWrite)
        if not(refuses(fun()->PolicyClosure.loadAndVerify manifest digest "invocation"|>ignore)) then failwith "writable runtime admitted"
        File.SetUnixFileMode(runtimeFiles.Head|>snd,UnixFileMode.UserRead)
        File.SetUnixFileMode(manifest,UnixFileMode.UserRead|||UnixFileMode.UserWrite)
        File.AppendAllText(manifest," ")
        if not(refuses(fun()->PolicyClosure.loadAndVerify manifest digest "invocation"|>ignore)) then failwith "closure digest drift admitted"
        let sourceDrift=JsonNode.Parse(original).AsObject()
        sourceDrift["source"].AsObject()["policyCommit"] <- "bad"
        File.WriteAllText(manifest,sourceDrift.ToJsonString())
        File.SetUnixFileMode(manifest,UnixFileMode.UserRead)
        if not(refuses(fun()->PolicyClosure.loadAndVerify manifest (sha manifest) "invocation"|>ignore)) then failwith "source drift admitted"
        File.SetUnixFileMode(manifest,UnixFileMode.UserRead|||UnixFileMode.UserWrite)
        File.WriteAllText(manifest,original)
        File.SetUnixFileMode(manifest,UnixFileMode.UserRead)
        let runtimePath=runtimeFiles.Head|>snd
        File.SetUnixFileMode(runtimePath,UnixFileMode.UserRead|||UnixFileMode.UserWrite)
        File.AppendAllText(runtimePath,"drift")
        File.SetUnixFileMode(runtimePath,UnixFileMode.UserRead)
        if not(refuses(fun()->PolicyClosure.loadAndVerify manifest digest "invocation"|>ignore)) then failwith "runtime digest drift admitted"
        for path in Directory.EnumerateFiles(root,"*",SearchOption.AllDirectories) do File.SetUnixFileMode(path,UnixFileMode.UserRead|||UnixFileMode.UserWrite)
        for path in Directory.EnumerateDirectories(root,"*",SearchOption.AllDirectories) do File.SetUnixFileMode(path,UnixFileMode.UserRead|||UnixFileMode.UserWrite|||UnixFileMode.UserExecute)
        Directory.Delete(root,true)
