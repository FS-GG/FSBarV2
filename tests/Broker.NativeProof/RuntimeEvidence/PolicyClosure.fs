namespace FSBar.NativeProof.RuntimeEvidence

open System
open System.IO
open System.Security.Cryptography
open System.Text
open System.Text.Json

module PolicyClosure =
    [<Literal>]
    let Schema = "fsbar.barc-runtime-evidence-policy-closure/v1"
    type FilePin = { Role:string option; Path:string; Bytes:int64; Sha256:string }
    type Verified = { ManifestSha256:string; ExecutablePath:string; RuntimeFiles:Set<string>; OwnerUid:int }
    let private fail message = invalidOp message
    let private sha (bytes:byte[]) = Convert.ToHexString(SHA256.HashData bytes).ToLowerInvariant()
    let private exact (e:JsonElement) names label =
        if (e.EnumerateObject() |> Seq.map _.Name |> Set.ofSeq) <> Set.ofList names then fail ("closed "+label)
    let private text (o:JsonElement) (name:string) =
        let e=o.GetProperty name
        if e.ValueKind<>JsonValueKind.String then fail ("invalid "+name)
        let value=e.GetString()
        if isNull value || value.Length=0 || value.Length>4096 || value.Contains('\000') then fail ("invalid "+name)
        value
    let private hex (value:string) (label:string) =
        if value.Length<>64 || value |> Seq.exists(fun c->not(Uri.IsHexDigit c)||Char.IsUpper c) then fail ("invalid "+label)
        value
    let private full (value:string) (label:string) = if not(Path.IsPathFullyQualified value) then fail ("non-absolute "+label) else Path.GetFullPath value
    let private pin withRole (e:JsonElement) =
        exact e (if withRole then ["role";"path";"bytes";"sha256"] else ["path";"bytes";"sha256"]) "file pin"
        let bytes=e.GetProperty("bytes").GetInt64()
        if bytes<0L || bytes>256L*1024L*1024L then fail "file byte bound"
        { Role=(if withRole then Some(text e "role") else None); Path=full(text e "path") "file path"; Bytes=bytes; Sha256=hex(text e "sha256") "file digest" }
    let private pins (o:JsonElement) (name:string) withRole =
        let e=o.GetProperty name
        if e.ValueKind<>JsonValueKind.Array then fail ("invalid "+name)
        let value=e.EnumerateArray() |> Seq.map(pin withRole) |> Seq.toList
        if value.IsEmpty || value.Length>1024 || (value |> List.map _.Path |> Set.ofList).Count<>value.Length then fail (name+" count/duplicate bound")
        value
    let private verifyFile (p:FilePin) =
        let info=FileInfo p.Path
        if not info.Exists || not(isNull info.LinkTarget) || info.Length<>p.Bytes then fail "file identity/size drift"
        let writable=(if p.Path.StartsWith("/usr/share/dotnet/",StringComparison.Ordinal) then UnixFileMode.GroupWrite ||| UnixFileMode.OtherWrite else UnixFileMode.UserWrite ||| UnixFileMode.GroupWrite ||| UnixFileMode.OtherWrite)
        if int(File.GetUnixFileMode p.Path) &&& int writable <> 0 then fail "writable policy closure file"
        use stream=File.Open(p.Path,FileMode.Open,FileAccess.Read,FileShare.Read)
        if (SHA256.HashData(stream)|>Convert.ToHexString|>_.ToLowerInvariant())<>p.Sha256 then fail "file digest drift"
    let private census roots runtime =
        let actual=roots |> List.collect(fun root ->
            if not(Directory.Exists root) then fail "runtime root unavailable"
            Directory.EnumerateFiles(root,"*",SearchOption.AllDirectories)|>Seq.map Path.GetFullPath|>Seq.toList) |> Set.ofList
        if actual<>(runtime|>List.map _.Path|>Set.ofList) then fail "runtime directory census drift"

    let loadAndVerify manifestPath expectedSha invocationId =
        if String.IsNullOrWhiteSpace invocationId || invocationId.Length>128 then fail "invalid invocation id"
        let path=full manifestPath "manifest"
        let info=FileInfo path
        if not info.Exists || not(isNull info.LinkTarget) || info.Length>1024L*1024L then fail "manifest unavailable/bound"
        let raw=File.ReadAllBytes path
        let digest=sha raw
        if digest<>hex expectedSha "manifest digest" then fail "manifest digest drift"
        use document=JsonDocument.Parse raw
        let root=document.RootElement
        exact root ["schema";"managedRoot";"provenanceRoot";"runtimeRoots";"managed";"provenance";"runtime";"runtimeRoles";"source";"custody"] "policy closure"
        if text root "schema"<>Schema then fail "policy closure schema"
        let managedRoot=full(text root "managedRoot") "managed root"
        let provenanceRoot=full(text root "provenanceRoot") "provenance root"
        if managedRoot=provenanceRoot then fail "managed/provenance alias"
        let runtimeRoots=root.GetProperty("runtimeRoots").EnumerateArray() |> Seq.map(fun e->full(e.GetString()) "runtime root") |> Seq.toList
        if runtimeRoots.IsEmpty || runtimeRoots.Length>16 || (Set.ofList runtimeRoots).Count<>runtimeRoots.Length then fail "runtime roots"
        let managed=pins root "managed" true
        let provenance=pins root "provenance" true
        let runtime=pins root "runtime" false
        if managed.Length<>5 || (managed|>List.choose _.Role|>Set.ofList)<>Set.ofList["apphost";"managedDll";"depsJson";"runtimeConfigJson";"fsharpCore"] then fail "closed managed roles"
        let all=managed@provenance@runtime
        if all.Length>1024 || (all|>List.sumBy _.Bytes)>1024L*1024L*1024L then fail "closure aggregate bound"
        exact (root.GetProperty "source") ["policyCommit";"policyTree";"productCommit";"productTree";"buildInputsSha256";"lockFileSha256";"toolchainSha256";"pdbSha256";"sourceLinkSha256";"helperManifestSha256"] "source graph"
        for p in root.GetProperty("source").EnumerateObject() do if p.Name.EndsWith "Sha256" then hex(p.Value.GetString()) p.Name|>ignore elif p.Value.GetString().Length<>40 then fail "source commit/tree"
        let custody=root.GetProperty "custody"
        exact custody ["ownerUid";"executablePath";"fixedArgv"] "custody"
        let owner=custody.GetProperty("ownerUid").GetInt32()
        if owner<0 then fail "owner uid"
        let executable=full(text custody "executablePath") "executable"
        let argv=custody.GetProperty("fixedArgv").EnumerateArray() |> Seq.map _.GetString() |> Seq.toList
        if argv<>[executable;"--closure-manifest";"--closure-sha256";"--invocation-id"] then fail "fixed policy argv"
        let roles=root.GetProperty "runtimeRoles"
        exact roles ["hostfxr";"hostpolicy";"coreLib";"coreClr";"jit"] "runtime roles"
        let runtimeSet=runtime|>List.map _.Path|>Set.ofList
        for role in roles.EnumerateObject() do if not(runtimeSet.Contains(full(role.Value.GetString()) role.Name)) then fail "runtime role outside inventory"
        let managedSet=managed|>List.map _.Path|>Set.ofList
        if (managed|>List.find(fun p->p.Role=Some "apphost")).Path<>executable then fail "apphost path"
        let managedActual=Directory.EnumerateFiles(managedRoot,"*",SearchOption.AllDirectories)|>Seq.map Path.GetFullPath|>Set.ofSeq
        if managedActual<>managedSet then fail "managed directory census drift"
        census runtimeRoots runtime
        all|>List.iter verifyFile
        { ManifestSha256=digest; ExecutablePath=executable; RuntimeFiles=runtimeSet; OwnerUid=owner }

    let verifyCurrentProcess verified =
        let exe=File.ResolveLinkTarget("/proc/self/exe",true).FullName |> Path.GetFullPath
        if exe<>verified.ExecutablePath then fail "running executable drift"
        let maps=File.ReadAllBytes "/proc/self/maps"
        if maps.Length>4*1024*1024 then fail "runtime maps bound"
        let paths=Encoding.UTF8.GetString(maps).Split('\n',StringSplitOptions.RemoveEmptyEntries)|>Seq.choose(fun line->let i=line.IndexOf('/') in if i<0 then None else Some(line.Substring i))|>Set.ofSeq|>Set.toList
        if paths.Length>1024 || paths|>List.exists(fun p->p.EndsWith(" (deleted)") && (p.StartsWith("/usr/share/dotnet/") || p.StartsWith(verified.ExecutablePath))) then fail "runtime mappings invalid"
        let admitted=Set.add verified.ExecutablePath verified.RuntimeFiles
        if paths|>List.filter(fun p->p.StartsWith("/usr/share/dotnet/")||p=verified.ExecutablePath)|>List.exists(fun p->not(admitted.Contains(Path.GetFullPath p))) then fail "unadmitted selected runtime mapping"
