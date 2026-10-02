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
            let started=PolicyComposition.start identity
            let ready=PolicyComposition.ready identity started
            if ready.State.Phase<>"ready" then invalidOp "invocation readiness refused"
            Console.Out.WriteLine(PolicyInvocation.readyFrame identity ready.State)
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
            let evaluation=Codec.evaluate closure.ApphostSha256 closure.ManifestSha256 closure.ProductSourceSetSha256 (buffer.ToArray())
            let evaluated=PolicyComposition.evaluated identity ready
            if evaluated.State.Phase<>"evaluated" then invalidOp "invocation evaluation refused"
            PolicyClosure.revalidate manifestPath closureSha invocation closure |> ignore
            let completed,result =
                match PolicyComposition.finish identity true evaluation evaluated with
                | CompositionAccepted(session,result) -> session,result
                | CompositionRefused _ -> invalidOp "invocation completion refused"
            Console.Out.WriteLine(PolicyInvocation.completedFrame identity completed.State result)
            Console.Out.Flush();0
        with _ ->
            Console.Error.WriteLine("UNAVAILABLE: bounded growing-log policy input required")
            2
