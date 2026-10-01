namespace FSBar.NativeProof.RuntimeEvidence

open System.Text.Json

module PolicyInvocation =
    let ready invocation closure pid start uid = JsonSerializer.Serialize {| schema="fsbar.barc-runtime-evidence-policy-ready/v1"; invocationId=invocation; closureSha256=closure; pid=pid; startTicks=start; uid=uid |}
    let completed invocation closure (inner:string) = JsonSerializer.Serialize {| schema="fsbar.barc-runtime-evidence-policy-completed/v1"; invocationId=invocation; closureSha256=closure; phase="completed"; result=JsonDocument.Parse(inner).RootElement.Clone() |}
