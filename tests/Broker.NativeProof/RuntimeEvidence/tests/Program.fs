namespace FSBar.NativeProof.RuntimeEvidence.Tests

open System

module Program =
    [<EntryPoint>]
    let main _ =
        DataRootPolicyTests.run()
        CodecTests.run()
        GrowingLogEvidenceTests.run()
        PolicyClosureTests.run()
        CorrespondenceTests.run AppContext.BaseDirectory
        printfn "PASS: root grammar, sticky reducer, boundary binding, and FsQuint model correspondence"
        0
