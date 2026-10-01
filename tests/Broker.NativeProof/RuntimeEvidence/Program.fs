namespace FSBar.NativeProof.RuntimeEvidence

open System
open System.IO

module Program =
    let private argument name (argv:string array) =
        match argv |> Array.tryFindIndex ((=) name) with
        | Some i when i+1<argv.Length -> argv[i+1]
        | _ -> invalidOp "closed policy argv"
    let private startTicks() = File.ReadAllText($"/proc/{Environment.ProcessId}/stat").Split(' ')[21]
    let private uid() = File.ReadLines("/proc/self/status") |> Seq.find _.StartsWith("Uid:") |> fun x->x.Split([|'\t';' '|],StringSplitOptions.RemoveEmptyEntries)[1] |> Int32.Parse
    [<EntryPoint>]
    let main argv =
        try
            if argv.Length<>6 then invalidOp "closed policy argv"
            let invocation=argument "--invocation-id" argv
            let manifestPath=argument "--closure-manifest" argv
            let closureSha=argument "--closure-sha256" argv
            let closure=PolicyClosure.loadAndVerify manifestPath closureSha invocation
            PolicyClosure.verifyCurrentProcess closure
            let identity={ InvocationId=invocation;ClosureSha256=closure.ManifestSha256;Pid=Environment.ProcessId;StartTicks=startTicks();Uid=uid() }
            let started=PolicyInvocation.beginInvocation identity PolicyInvocation.empty |> PolicyInvocation.requireAccepted
            let ready=PolicyInvocation.ready identity started |> PolicyInvocation.requireAccepted
            Console.Out.WriteLine(PolicyInvocation.readyFrame identity ready)
            Console.Out.Flush()
            use input=Console.OpenStandardInput()
            use buffer=new MemoryStream()
            let block=Array.zeroCreate<byte> 65536
            let mutable total=0
            let mutable count=input.Read(block,0,block.Length)
            while count>0 do
                total <- total+count
                if total>6*1024*1024 then raise(InvalidDataException("input bound"))
                buffer.Write(block,0,count);count<-input.Read(block,0,block.Length)
            let result=Codec.evaluate closure.ApphostSha256 closure.ManifestSha256 (buffer.ToArray())
            let evaluated=PolicyInvocation.evaluated identity ready |> PolicyInvocation.requireAccepted
            PolicyClosure.revalidate manifestPath closureSha invocation closure |> ignore
            let completed=PolicyInvocation.complete identity true evaluated |> PolicyInvocation.requireAccepted
            Console.Out.WriteLine(PolicyInvocation.completedFrame identity completed result)
            Console.Out.Flush();0
        with _ ->
            Console.Error.WriteLine("UNAVAILABLE: bounded growing-log policy input required")
            2
