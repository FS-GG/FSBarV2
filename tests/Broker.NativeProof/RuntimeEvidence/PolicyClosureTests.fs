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
        let composed=PolicyComposition.start identity|>PolicyComposition.ready identity|>PolicyComposition.evaluated identity
        match PolicyComposition.finishGuard identity true composed with
        | Choice1Of2 value when value.State.Phase="completed" && value.Events=[Began;BecameReady;InnerEvaluated;FinalClosureAccepted] -> ()
        | other -> failwithf "actual composition did not complete: %A" other
        let mustRefuse label outcome =
            match outcome with
            | Choice2Of2 value when value.State.StickyInvalid && not(value.Events|>List.contains ExternalConsumption) -> ()
            | other -> failwithf "%s witness did not refuse: %A" label other
        PolicyComposition.finishGuard identity false composed |> mustRefuse "unavailable final closure"
        let wrongChild={identity with Pid=101}
        let wrongInvocation={identity with InvocationId="other"}
        let wrongClosure={identity with ClosureSha256=String.replicate 64 "b"}
        let startedComposition=PolicyComposition.start identity
        let witness label candidate =
            let value=PolicyComposition.ready candidate startedComposition
            if not(value.State.StickyInvalid) || value.Events|>List.contains ExternalConsumption then failwith(label+" witness admitted")
        witness "wrong child" wrongChild
        witness "wrong invocation" wrongInvocation
        witness "wrong closure" wrongClosure
        match PolicyComposition.unavailable "final observation unavailable" composed with
        | CompositionRefused value when value.State.StickyInvalid && value.State.Phase="unknown" -> ()
        | other -> failwithf "unavailable final witness admitted: %A" other
