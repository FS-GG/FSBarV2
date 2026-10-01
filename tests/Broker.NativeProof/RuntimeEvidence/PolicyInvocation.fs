namespace FSBar.NativeProof.RuntimeEvidence

open System
open System.Text.Json

type InvocationIdentity = { InvocationId:string; ClosureSha256:string; Pid:int; StartTicks:string; Uid:int }
type InvocationState = { Phase:string; Identity:InvocationIdentity option; StickyInvalid:bool; Reason:string option }
type InvocationTransition = InvocationAccepted of InvocationState | InvocationRefused of InvocationState | InvocationUnknown of InvocationState

module PolicyInvocation =
    let empty = { Phase="none";Identity=None;StickyInvalid=false;Reason=None }
    let private fail reason state = InvocationRefused { state with Phase="invalid";StickyInvalid=true;Reason=Some reason }
    let private valid identity =
        identity.InvocationId.Length>0 && identity.InvocationId.Length<=128 && identity.ClosureSha256.Length=64 &&
        (identity.ClosureSha256 |> Seq.forall(fun c->c>='0'&&c<='9'||c>='a'&&c<='f')) &&
        identity.Pid>1 && identity.Uid>=0 && not(String.IsNullOrWhiteSpace identity.StartTicks)
    let beginInvocation identity state =
        if state.StickyInvalid || state.Phase<>"none" || not(valid identity) then fail "invocation-begin" state
        else InvocationAccepted { Phase="started";Identity=Some identity;StickyInvalid=false;Reason=None }
    let ready identity state =
        if state.StickyInvalid || state.Phase<>"started" || state.Identity<>Some identity then fail "invocation-ready" state
        else InvocationAccepted { state with Phase="ready" }
    let evaluated identity state =
        if state.StickyInvalid || state.Phase<>"ready" || state.Identity<>Some identity then fail "invocation-evaluated" state
        else InvocationAccepted { state with Phase="evaluated" }
    let complete identity closureVerified state =
        if state.StickyInvalid || state.Phase<>"evaluated" || state.Identity<>Some identity || not closureVerified then fail "invocation-final-closure" state
        else InvocationAccepted { state with Phase="completed" }
    let unavailable reason state = InvocationUnknown { state with Phase="unknown";StickyInvalid=true;Reason=Some reason }
    let stateOf = function InvocationAccepted s|InvocationRefused s|InvocationUnknown s->s
    let requireAccepted = function InvocationAccepted s->s | other->invalidOp(sprintf "invocation guard refused: %A" other)
    let private envelope schema identity phase = JsonSerializer.Serialize {| schema=schema;invocationId=identity.InvocationId;closureSha256=identity.ClosureSha256;pid=identity.Pid;startTicks=identity.StartTicks;uid=identity.Uid;phase=phase |}
    let readyFrame identity state =
        if state.Phase<>"ready" || state.Identity<>Some identity then invalidOp "invocation not ready"
        envelope "fsbar.barc-runtime-evidence-policy-ready/v2" identity "ready"
    let completedFrame identity state (inner:string) =
        if state.Phase<>"completed" || state.Identity<>Some identity then invalidOp "invocation not completed"
        JsonSerializer.Serialize {| schema="fsbar.barc-runtime-evidence-policy-completed/v2";invocationId=identity.InvocationId;closureSha256=identity.ClosureSha256;pid=identity.Pid;startTicks=identity.StartTicks;uid=identity.Uid;phase="completed";result=JsonDocument.Parse(inner).RootElement.Clone() |}
