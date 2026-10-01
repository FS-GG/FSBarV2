namespace FSBar.NativeProof.RuntimeEvidence

open System
open System.Collections.Generic
open System.IO
open System.Reflection.Metadata
open System.Runtime.InteropServices
open System.Security.Cryptography
open System.Text
open System.Text.Json

module PolicyClosure =
    [<Literal>]
    let Schema = "fsbar.barc-runtime-evidence-policy-closure/v2"
    [<Literal>]
    let MaxFiles = 1024
    [<Literal>]
    let MaxTotalBytes = 1024L*1024L*1024L

    [<Struct; StructLayout(LayoutKind.Sequential)>]
    type private StatxTimestamp =
        val mutable Seconds:int64
        val mutable Nanoseconds:uint32
        val mutable Reserved:int32

    [<Struct; StructLayout(LayoutKind.Sequential)>]
    type private Statx =
        val mutable Mask:uint32
        val mutable BlockSize:uint32
        val mutable Attributes:uint64
        val mutable Links:uint32
        val mutable Uid:uint32
        val mutable Gid:uint32
        val mutable Mode:uint16
        val mutable Spare0:uint16
        val mutable Inode:uint64
        val mutable Size:uint64
        val mutable Blocks:uint64
        val mutable AttributesMask:uint64
        val mutable Access:StatxTimestamp
        val mutable Birth:StatxTimestamp
        val mutable Change:StatxTimestamp
        val mutable Modify:StatxTimestamp
        val mutable RdevMajor:uint32
        val mutable RdevMinor:uint32
        val mutable DevMajor:uint32
        val mutable DevMinor:uint32
        val mutable MountId:uint64
        val mutable DioMemoryAlign:uint32
        val mutable DioOffsetAlign:uint32
        [<MarshalAs(UnmanagedType.ByValArray,SizeConst=12)>]
        val mutable Spare:uint64 array

    [<DllImport("libc",SetLastError=true)>]
    extern int private statx(int directoryFd,string path,int flags,uint32 mask,Statx& buffer)

    type FilePin = { Role:string option;Path:string;Bytes:int64;Sha256:string;Device:string;Inode:uint64;OwnerUid:int;Mode:int;Links:int }
    type DirectoryPin = { Path:string;OwnerUid:int;Mode:int;EntriesSha256:string }
    type Verified = { ManifestPath:string;ManifestSha256:string;ExecutablePath:string;ApphostSha256:string;OwnerUid:int;Files:Map<string,FilePin>;RuntimeRoots:Set<string>;SourceIdentity:string }

    let private fail message = invalidOp message
    let private hashBytes bytes = SHA256.HashData(bytes:byte[]) |> Convert.ToHexStringLower
    let private readBounded path maximum =
        use stream=File.Open(path,FileMode.Open,FileAccess.Read,FileShare.Read)
        use output=new MemoryStream()
        let block=Array.zeroCreate<byte> 65536
        let mutable total=0
        let mutable count=stream.Read(block,0,block.Length)
        while count>0 do
            total<-total+count
            if total>maximum then fail "file read bound"
            output.Write(block,0,count)
            count<-stream.Read(block,0,block.Length)
        output.ToArray()
    let private hashFile path =
        readBounded path (256*1024*1024) |> hashBytes
    let private exact (e:JsonElement) names label =
        if e.ValueKind<>JsonValueKind.Object || (e.EnumerateObject()|>Seq.map _.Name|>Set.ofSeq)<>Set.ofList names then fail("closed "+label)
    let private text (o:JsonElement) (name:string) =
        let e=o.GetProperty name
        if e.ValueKind<>JsonValueKind.String then fail("invalid "+name)
        let value=e.GetString()
        if isNull value || value.Length=0 || value.Length>4096 || value.Contains '\000' then fail("invalid "+name)
        value
    let private hex length (value:string) label =
        if value.Length<>length || value|>Seq.exists(fun c->not(c>='0'&&c<='9'||c>='a'&&c<='f')) then fail("invalid "+label)
        value
    let private full (value:string) label = if not(Path.IsPathFullyQualified value) || Path.GetFullPath(value)<>value then fail("noncanonical "+label) else value
    let private stat path =
        let mutable value=Statx(Spare=Array.zeroCreate 12)
        if statx(-100,path,0x100,0x7ffu,&value)<>0 then fail("statx unavailable: "+path)
        value
    let private device (value:Statx) = sprintf "%x:%x" value.DevMajor value.DevMinor
    let private noSymlinkComponents (root:string) (path:string) =
        let mutable current=path
        let root=Path.TrimEndingDirectorySeparator(root)
        let mutable doneValue=false
        while not doneValue do
            let info = if Directory.Exists current then DirectoryInfo(current) :> FileSystemInfo else FileInfo(current) :> FileSystemInfo
            if not(isNull info.LinkTarget) then fail "symlink closure component"
            if Path.TrimEndingDirectorySeparator(info.FullName)=root then doneValue<-true
            else
                let parent=Directory.GetParent info.FullName
                if isNull parent then fail "path outside custody root"
                current<-parent.FullName
    let private parsePin withRole (e:JsonElement) =
        exact e (if withRole then ["role";"path";"bytes";"sha256";"device";"inode";"ownerUid";"mode";"links"] else ["path";"bytes";"sha256";"device";"inode";"ownerUid";"mode";"links"]) "file pin"
        let bytes=e.GetProperty("bytes").GetInt64()
        if bytes<0L || bytes>256L*1024L*1024L then fail "file byte bound"
        { Role=(if withRole then Some(text e "role") else None);Path=full(text e "path") "file path";Bytes=bytes;Sha256=hex 64 (text e "sha256") "file digest";Device=text e "device";Inode=e.GetProperty("inode").GetUInt64();OwnerUid=e.GetProperty("ownerUid").GetInt32();Mode=e.GetProperty("mode").GetInt32();Links=e.GetProperty("links").GetInt32() }
    let private pins (o:JsonElement) (name:string) withRole =
        let a=o.GetProperty name
        if a.ValueKind<>JsonValueKind.Array then fail("invalid "+name)
        let rows=ResizeArray<FilePin>()
        for e in a.EnumerateArray() do
            if rows.Count>=MaxFiles then fail "file count bound"
            rows.Add(parsePin withRole e)
        let value=List.ofSeq rows
        if value.IsEmpty || (value|>List.map _.Path|>Set.ofList).Count<>value.Length then fail(name+" empty/duplicate")
        value
    let private directoryPin (e:JsonElement) =
        exact e ["path";"ownerUid";"mode";"entriesSha256"] "search directory"
        { Path=full(text e "path") "search directory";OwnerUid=e.GetProperty("ownerUid").GetInt32();Mode=e.GetProperty("mode").GetInt32();EntriesSha256=hex 64 (text e "entriesSha256") "directory entries" }
    let private directoryEntries path =
        let names=Directory.EnumerateFileSystemEntries(path) |> Seq.map Path.GetFileName |> Seq.sort |> Seq.toArray
        if names.Length>4096 then fail "directory entry bound"
        hashBytes(Encoding.UTF8.GetBytes(String.Join("\n",names)))
    let private verifyDirectory custodyRoot requireSealed (pin:DirectoryPin) =
        if not(Directory.Exists pin.Path) then fail "directory unavailable"
        noSymlinkComponents custodyRoot pin.Path
        let observed=stat pin.Path
        if int observed.Uid<>pin.OwnerUid || int observed.Mode&&&0o777<>pin.Mode || directoryEntries pin.Path<>pin.EntriesSha256 then fail "directory custody/layout drift"
        if pin.Mode&&&0o022<>0 || requireSealed && pin.Mode&&&0o222<>0 then fail "writable search directory"
    let private verifyFile custodyRoot (pin:FilePin) =
        if not(File.Exists pin.Path) then fail "file unavailable"
        noSymlinkComponents custodyRoot pin.Path
        let observed=stat pin.Path
        if int64 observed.Size<>pin.Bytes || device observed<>pin.Device || observed.Inode<>pin.Inode || int observed.Uid<>pin.OwnerUid || int observed.Mode&&&0o777<>pin.Mode || int observed.Links<>pin.Links || pin.Links<>1 then fail "file identity/custody drift"
        if pin.Mode&&&0o022<>0 then fail "group/world writable closure file"
        if hashFile pin.Path<>pin.Sha256 then fail "file digest drift"
    let private enumerateBounded roots =
        let found=HashSet<string>(StringComparer.Ordinal)
        for root in roots do
            for path in Directory.EnumerateFiles(root,"*",SearchOption.AllDirectories) do
                if found.Count>=MaxFiles then fail "runtime census count bound"
                found.Add(Path.GetFullPath path)|>ignore
        Set.ofSeq found
    let private roleMap pins =
        pins |> List.map(fun p->p.Role.Value,p) |> Map.ofList
    let private provenanceJoin sourceElement managed provenance =
        exact sourceElement ["policyCommit";"policyTree";"productCommit";"productTree";"policySourceManifestSha256";"productSourceManifestSha256";"buildReceiptSha256";"pdbSha256";"sourceLinkSha256";"helperManifestSha256"] "source graph"
        let policyCommit=hex 40 (text sourceElement "policyCommit") "policy commit"
        let policyTree=hex 40 (text sourceElement "policyTree") "policy tree"
        let productCommit=hex 40 (text sourceElement "productCommit") "product commit"
        let productTree=hex 40 (text sourceElement "productTree") "product tree"
        let roles=roleMap provenance
        let expectedRoles=Set.ofList ["pdb";"sourceLink";"buildReceipt";"helperManifest";"policySourceManifest";"productSourceManifest"]
        if Set.ofSeq roles.Keys<>expectedRoles then fail "closed provenance roles"
        let join field role = if text sourceElement field<>roles[role].Sha256 then fail("source/provenance join: "+field)
        join "pdbSha256" "pdb";join "sourceLinkSha256" "sourceLink";join "buildReceiptSha256" "buildReceipt";join "helperManifestSha256" "helperManifest";join "policySourceManifestSha256" "policySourceManifest";join "productSourceManifestSha256" "productSourceManifest"
        let parseSource role expectedCommit expectedTree =
            use doc=JsonDocument.Parse(readBounded roles[role].Path (1024*1024))
            exact doc.RootElement ["schema";"role";"commit";"tree"] "source identity"
            if text doc.RootElement "schema"<>"fsbar.barc-source-identity/v1" || text doc.RootElement "role"<>role || text doc.RootElement "commit"<>expectedCommit || text doc.RootElement "tree"<>expectedTree then fail "source identity drift"
        parseSource "policySourceManifest" policyCommit policyTree
        parseSource "productSourceManifest" productCommit productTree
        if roles["policySourceManifest"].Path=roles["productSourceManifest"].Path then fail "aliased source roles"
        let sourceLink=readBounded roles["sourceLink"].Path (1024*1024)
        use pdb=File.OpenRead roles["pdb"].Path
        use provider=MetadataReaderProvider.FromPortablePdbStream pdb
        let reader=provider.GetMetadataReader()
        let sourceLinkGuid=Guid("cc110556-a091-4d38-9fec-25ab9a351a6a")
        let embedded=reader.CustomDebugInformation |> Seq.choose(fun handle->let item=reader.GetCustomDebugInformation handle in if reader.GetGuid(item.Kind)=sourceLinkGuid then Some(reader.GetBlobBytes item.Value) else None) |> Seq.toList
        if embedded<>[sourceLink] then fail "PDB SourceLink drift"
        use linkDoc=JsonDocument.Parse sourceLink
        let serialized=linkDoc.RootElement.GetRawText()
        if not(serialized.Contains(policyCommit,StringComparison.Ordinal)) then fail "SourceLink source commit drift"
        use receipt=JsonDocument.Parse(readBounded roles["buildReceipt"].Path (1024*1024))
        exact receipt.RootElement ["schema";"policyCommit";"policyTree";"productCommit";"productTree";"managed";"pdbSha256";"sourceLinkSha256";"helperManifestSha256"] "build receipt"
        if text receipt.RootElement "schema"<>"fsbar.barc-runtime-evidence-build-receipt/v1" || text receipt.RootElement "policyCommit"<>policyCommit || text receipt.RootElement "policyTree"<>policyTree || text receipt.RootElement "productCommit"<>productCommit || text receipt.RootElement "productTree"<>productTree || text receipt.RootElement "pdbSha256"<>roles["pdb"].Sha256 || text receipt.RootElement "sourceLinkSha256"<>roles["sourceLink"].Sha256 || text receipt.RootElement "helperManifestSha256"<>roles["helperManifest"].Sha256 then fail "build receipt source/provenance drift"
        let outputs=receipt.RootElement.GetProperty "managed"
        exact outputs ["apphost";"managedDll";"depsJson";"runtimeConfigJson";"fsharpCore"] "build receipt managed outputs"
        let managedRoles=roleMap managed
        for role in outputs.EnumerateObject() do if role.Value.GetString()<>managedRoles[role.Name].Sha256 then fail "build output receipt drift"
        policyCommit+":"+policyTree+":"+productCommit+":"+productTree

    let loadAndVerify manifestPath expectedSha invocationId =
        if String.IsNullOrWhiteSpace invocationId || invocationId.Length>128 then fail "invalid invocation id"
        let path=full manifestPath "manifest"
        let info=FileInfo path
        if not info.Exists || info.Length<=0L || info.Length>1024L*1024L then fail "manifest unavailable/bound"
        let raw=readBounded path (1024*1024)
        let digest=hashBytes raw
        if digest<>hex 64 expectedSha "manifest digest" then fail "manifest digest drift"
        use document=JsonDocument.Parse(raw,JsonDocumentOptions(MaxDepth=32,CommentHandling=JsonCommentHandling.Disallow,AllowTrailingCommas=false))
        let root=document.RootElement
        exact root ["schema";"custodyRoot";"managedRoot";"provenanceRoot";"runtimeRoots";"searchLayout";"managed";"provenance";"runtime";"runtimeRoles";"source";"custody"] "policy closure"
        if text root "schema"<>Schema then fail "policy closure schema"
        let custodyRoot=full(text root "custodyRoot") "custody root"
        let managedRoot=full(text root "managedRoot") "managed root"
        let provenanceRoot=full(text root "provenanceRoot") "provenance root"
        if managedRoot=provenanceRoot || not(managedRoot.StartsWith(custodyRoot+string Path.DirectorySeparatorChar)) || not(provenanceRoot.StartsWith(custodyRoot+string Path.DirectorySeparatorChar)) then fail "closure roots"
        let runtimeRoots=root.GetProperty("runtimeRoots").EnumerateArray() |> Seq.map(fun e->full(e.GetString()) "runtime root") |> Seq.toList
        if runtimeRoots.IsEmpty || runtimeRoots.Length>16 || (Set.ofList runtimeRoots).Count<>runtimeRoots.Length then fail "runtime roots"
        let managed=pins root "managed" true
        let provenance=pins root "provenance" true
        let runtime=pins root "runtime" false
        let all=managed@provenance@runtime
        if all.Length>MaxFiles || all|>List.sumBy _.Bytes>MaxTotalBytes || (all|>List.map _.Path|>Set.ofList).Count<>all.Length then fail "closure aggregate/duplicate bound"
        let managedRoles=roleMap managed
        if managed.Length<>5 || Set.ofSeq managedRoles.Keys<>Set.ofList["apphost";"managedDll";"depsJson";"runtimeConfigJson";"fsharpCore"] then fail "closed managed roles"
        let managedCensus=enumerateBounded [managedRoot]
        if managedCensus<>(managed|>List.map _.Path|>Set.ofList) then fail "managed census drift"
        let provenanceCensus=enumerateBounded [provenanceRoot]
        if provenanceCensus<>(provenance|>List.map _.Path|>Set.ofList) then fail "provenance census drift"
        let runtimeCensus=enumerateBounded runtimeRoots
        let runtimeSet=runtime|>List.map _.Path|>Set.ofList
        if not(Set.isSubset runtimeCensus runtimeSet) then fail "runtime directory census drift"
        let search=root.GetProperty("searchLayout").EnumerateArray() |> Seq.map directoryPin |> Seq.toList
        if search.IsEmpty || search.Length>64 || (search|>List.map _.Path|>Set.ofList).Count<>search.Length then fail "search layout"
        let searchMap=search|>List.map(fun d->d.Path,d)|>Map.ofList
        for required in managedRoot::provenanceRoot::runtimeRoots do if not(searchMap.ContainsKey required) then fail "unsealed closure directory"
        let custody=root.GetProperty "custody"
        exact custody ["ownerUid";"executablePath";"fixedArgv"] "custody"
        let owner=custody.GetProperty("ownerUid").GetInt32()
        let selfUid=File.ReadLines("/proc/self/status")|>Seq.find _.StartsWith("Uid:")|>fun line->line.Split([|'\t';' '|],StringSplitOptions.RemoveEmptyEntries)[1]|>Int32.Parse
        if owner<>selfUid then fail "invoking owner drift"
        let executable=full(text custody "executablePath") "executable"
        let argv=custody.GetProperty("fixedArgv").EnumerateArray()|>Seq.map _.GetString()|>Seq.toList
        if argv<>[executable;"--closure-manifest";"--closure-sha256";"--invocation-id"] || managedRoles["apphost"].Path<>executable then fail "fixed apphost argv"
        let roles=root.GetProperty "runtimeRoles"
        exact roles ["hostfxr";"hostpolicy";"coreLib";"coreClr";"jit"] "runtime roles"
        let rolePaths=roles.EnumerateObject()|>Seq.map(fun p->p.Name,full(p.Value.GetString()) p.Name)|>Map.ofSeq
        if (Set.ofSeq rolePaths.Values).Count<>5 || rolePaths|>Map.exists(fun _ path->not(runtimeSet.Contains path)) then fail "aliased/outside runtime roles"
        let names=Map ["hostfxr","libhostfxr.so";"hostpolicy","libhostpolicy.so";"coreLib","System.Private.CoreLib.dll";"coreClr","libcoreclr.so";"jit","libclrjit.so"]
        if rolePaths|>Map.exists(fun role path->Path.GetFileName(path)<>names[role]) then fail "selected runtime role mismatch"
        let custodyStat=stat custodyRoot
        verifyDirectory custodyRoot false { Path=custodyRoot;OwnerUid=owner;Mode=int custodyStat.Mode&&&0o777;EntriesSha256=directoryEntries custodyRoot }
        for pin in search do verifyDirectory (if pin.Path.StartsWith(custodyRoot) then custodyRoot else "/") (pin.Path=managedRoot || pin.Path=provenanceRoot) pin
        for pin in all do verifyFile (if pin.Path.StartsWith(custodyRoot) then custodyRoot else "/") pin
        let sourceIdentity=provenanceJoin (root.GetProperty "source") managed provenance
        { ManifestPath=path;ManifestSha256=digest;ExecutablePath=executable;ApphostSha256=managedRoles["apphost"].Sha256;OwnerUid=owner;Files=all|>List.map(fun p->p.Path,p)|>Map.ofList;RuntimeRoots=Set.ofList runtimeRoots;SourceIdentity=sourceIdentity }

    let verifyCurrentProcess (verified:Verified) =
        let exe=File.ResolveLinkTarget("/proc/self/exe",true).FullName|>Path.GetFullPath
        if exe<>verified.ExecutablePath then fail "running executable drift"
        let maps=readBounded "/proc/self/maps" (4*1024*1024)
        if maps.Length>4*1024*1024 then fail "runtime maps byte bound"
        let seen=HashSet<string>()
        for line in Encoding.UTF8.GetString(maps).Split('\n',StringSplitOptions.RemoveEmptyEntries) do
            let fields=line.Split([|' '|],6,StringSplitOptions.RemoveEmptyEntries)
            if fields.Length=6 then
                let path=fields[5]
                if path.StartsWith("/",StringComparison.Ordinal) then
                    if path="/memfd:doublemapper (deleted)" || path="/memfd:dotnet_ipc_created (deleted)" then ()
                    elif path.EndsWith(" (deleted)",StringComparison.Ordinal) then fail "deleted file-backed mapping"
                    else
                        if seen.Count>=1024 then fail "runtime maps count bound"
                        seen.Add(path)|>ignore
                        match verified.Files.TryFind path with
                        | None -> fail("unadmitted file-backed mapping: "+path)
                        | Some pin ->
                            let mapDevice=fields[3].TrimStart('0').Replace(":0",":")
                            let expectedDevice=pin.Device.TrimStart('0').Replace(":0",":")
                            if mapDevice<>expectedDevice || UInt64.Parse(fields[4])<>pin.Inode then fail "mapped device/inode drift"

    let revalidate manifestPath expectedSha invocationId previous =
        let current=loadAndVerify manifestPath expectedSha invocationId
        if current<>previous then fail "closure identity drift"
        verifyCurrentProcess current
        current
