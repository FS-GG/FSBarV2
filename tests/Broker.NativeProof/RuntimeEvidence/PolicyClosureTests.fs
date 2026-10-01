namespace FSBar.NativeProof.RuntimeEvidence.Tests

open FSBar.NativeProof.RuntimeEvidence

module PolicyClosureTests =
    let private accepted = PolicyInvocation.requireAccepted
    let private refused = function InvocationRefused state when state.StickyInvalid -> state | other -> failwithf "expected sticky refusal: %A" other
    let run() =
        let identity={InvocationId="invocation";ClosureSha256=String.replicate 64 "a";Pid=100;StartTicks="1";Uid=1000}
        let started=PolicyInvocation.beginInvocation identity PolicyInvocation.empty|>accepted
        let ready=PolicyInvocation.ready identity started|>accepted
        let evaluated=PolicyInvocation.evaluated identity ready|>accepted
        let completed=PolicyInvocation.complete identity true evaluated|>accepted
        if completed.Phase<>"completed" then failwith "invocation did not complete"
        let wrong={identity with ClosureSha256=String.replicate 64 "b"}
        PolicyInvocation.ready wrong started|>refused|>ignore
        PolicyInvocation.complete identity false evaluated|>refused|>ignore
