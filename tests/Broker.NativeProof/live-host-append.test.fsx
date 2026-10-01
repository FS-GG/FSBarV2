#r "bin/Release/net10.0/Broker.NativeProof.dll"

open System
open System.IO
open System.Text
open Broker.NativeProof

let fail detail = raise (InvalidOperationException detail)
let root=Path.Combine(Path.GetTempPath(),$"fsbar-stock-host-fd-{Guid.NewGuid():N}")
Directory.CreateDirectory root |> ignore
File.SetUnixFileMode(root,UnixFileMode.UserRead ||| UnixFileMode.UserWrite ||| UnixFileMode.UserExecute)

try
    let path=Path.Combine(root,"host.jsonl")
    use stream=LiveHost.openStockJournal path
    let descriptor=stream.SafeFileHandle.DangerousGetHandle().ToInt32()
    let flagsLine =
        File.ReadLines($"/proc/self/fdinfo/{descriptor}")
        |> Seq.tryFind(fun line -> line.StartsWith("flags:",StringComparison.Ordinal))
        |> Option.defaultWith(fun () -> fail "actual journal descriptor flags unavailable")
    let flagFields=flagsLine.Split(':')
    let flagText=flagFields[1]
    let flags=Convert.ToInt32(flagText.Trim(),8)
    // /proc renders flags in octal.
    if flags &&& 0o2000 = 0 then fail "actual production journal descriptor lacks O_APPEND"
    if File.GetUnixFileMode(path)<>(UnixFileMode.UserRead ||| UnixFileMode.UserWrite) then fail "actual production journal is not mode 0600"
    let first=Encoding.UTF8.GetBytes("first\n")
    let second=Encoding.UTF8.GetBytes("second\n")
    stream.Write(first);stream.Flush();stream.Position<-0L;stream.Write(second);stream.Flush()
    if File.ReadAllText(path)<>"first\nsecond\n" then fail "actual descriptor rewrote an earlier prefix instead of appending"
    try
        use _duplicate=LiveHost.openStockJournal path
        fail "actual production opener accepted an existing path"
    with :? IOException -> ()
    let target=Path.Combine(root,"target")
    File.WriteAllText(target,"unchanged")
    let link=Path.Combine(root,"link")
    File.CreateSymbolicLink(link,target) |> ignore
    try
        use _followed=LiveHost.openStockJournal link
        fail "actual production opener followed a symbolic link"
    with :? IOException -> ()
    if File.ReadAllText(target)<>"unchanged" then fail "symbolic-link target changed"
    printfn "live-host-append-test-ok"
finally
    Directory.Delete(root,true)
