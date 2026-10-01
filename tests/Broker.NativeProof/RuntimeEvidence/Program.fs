namespace FSBar.NativeProof.RuntimeEvidence

open System
open System.IO

module Program =
    [<EntryPoint>]
    let main _ =
        try
            use input=Console.OpenStandardInput()
            use buffer=new MemoryStream()
            let block=Array.zeroCreate<byte> 65536
            let mutable total=0
            let mutable count=input.Read(block,0,block.Length)
            while count>0 do
                total <- total+count
                if total>6*1024*1024 then raise(InvalidDataException("input bound"))
                buffer.Write(block,0,count);count<-input.Read(block,0,block.Length)
            Console.Out.Write(Codec.evaluate(buffer.ToArray()));0
        with _ ->
            Console.Error.WriteLine("UNAVAILABLE: bounded growing-log policy input required")
            2
