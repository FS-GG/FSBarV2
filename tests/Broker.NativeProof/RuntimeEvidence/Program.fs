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
            let closure=PolicyClosure.loadAndVerify (argument "--closure-manifest" argv) (argument "--closure-sha256" argv) invocation
            PolicyClosure.verifyCurrentProcess closure
            Console.Out.WriteLine(PolicyInvocation.ready invocation closure.ManifestSha256 Environment.ProcessId (startTicks()) (uid()))
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
            let result=Codec.evaluate(buffer.ToArray())
            PolicyClosure.verifyCurrentProcess closure
            Console.Out.WriteLine(PolicyInvocation.completed invocation closure.ManifestSha256 result)
            Console.Out.Flush();0
        with _ ->
            Console.Error.WriteLine("UNAVAILABLE: bounded growing-log policy input required")
            2
