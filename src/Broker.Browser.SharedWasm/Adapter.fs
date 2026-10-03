module Broker.Browser.SharedWasm.Adapter

open FS.GG.Wasm.Contracts
open FS.GG.Wasm.Browser

type Limits = {
    maximumArtifactBytes: int
    maximumMemoryPages: int
    maximumTableElements: int
    maximumInputBytes: int
    maximumOutputBytes: int
    phaseTimeoutMilliseconds: int
}

type Result = {
    request: string
    generation: int
    state: string
    phase: string
    reason: string
    output: byte array
    hash: string
}

let private unwrap = function Ok value -> value | Error issues -> failwithf "%A" issues
let private profile = Profiles.tryFind BarProtected |> Option.get
let defaultLimits = {
    maximumArtifactBytes = profile.Limits.MaximumArtifactBytes
    maximumMemoryPages = profile.Limits.MaximumMemoryPages
    maximumTableElements = 4096
    maximumInputBytes = profile.Limits.MaximumInputBytes
    maximumOutputBytes = profile.Limits.MaximumOutputBytes
    phaseTimeoutMilliseconds = profile.Limits.MaximumDeadlineMilliseconds
}
let private configuration limits digest configurationDigest =
    if limits.maximumTableElements <> 4096 then
        invalidArg "maximumTableElements" "BAR shared profile requires the frozen 4096 table bound"
    Validation.validateConfiguration {
        Path = BarProtected
        ArtifactSha256 = digest
        ConfigurationSha256 = configurationDigest
        Limits = {
            MaximumArtifactBytes = limits.maximumArtifactBytes
            MaximumMemoryPages = limits.maximumMemoryPages
            MaximumInputBytes = limits.maximumInputBytes
            MaximumOutputBytes = limits.maximumOutputBytes
            MaximumDeadlineMilliseconds = limits.phaseTimeoutMilliseconds
        }
        Deadline = profile.Deadline
        Scheduling = profile.Scheduling
        Replacement = profile.Replacement
    } |> unwrap

// The shared Host owns all execution policy. This adapter owns only BAR API identities
// and product output validation, which is supplied from the existing barc-wire module.
type Adapter(transport: HostTransport, limits: Limits, validate: byte array -> byte array -> unit, receive: Result -> unit) =
    let mutable generation = 0
    let mutable nextRequest = 0UL
    let mutable preparing = false
    let mutable host: Host option = None
    let mutable requests: Map<uint64, string * byte array * string> = Map.empty
    let mutable retiringReason = "guest generation was replaced"
    let now () = transport.Now()
    let settle (result: BrowserResult) =
        match requests.TryFind result.Identity.Request with
        | None -> ()
        | Some (phase, input, digest) ->
            requests <- requests.Remove result.Identity.Request
            let mutable reason = result.Reason |> Option.map string |> Option.defaultValue ""
            let mutable output = Array.empty
            let mutable state =
                match result.Reason, result.Outcome with
                | Some DeadlineExpired, _ -> "timed-out"
                | Some HostDisposed, _ -> reason <- retiringReason; "discarded"
                | Some GenerationRetired, _ when result.Disposition = Discarded -> reason <- retiringReason; "discarded"
                | _, Some outcome ->
                    match outcome.State with
                    | Succeeded when result.Disposition = Current -> output <- outcome.CopiedOutput; "completed"
                    | TimedOut -> "timed-out"
                    | Invalidated when result.Disposition = Refused -> "faulted"
                    | Invalidated -> "discarded"
                    | Faulted diagnostic -> reason <- diagnostic; "faulted"
                    | GuestRejected status -> reason <- sprintf "guest rejected input (%d)" status; "faulted"
                    | _ -> "faulted"
                | _ -> "faulted"
            if state = "completed" && (phase = "initialize" || phase = "process") then
                try validate input output
                with error ->
                    state <- "faulted"
                    reason <- error.Message
                    output <- Array.empty
                    host |> Option.iter (fun value -> value.RejectAdapterOutput(now(), result.Identity, reason))
            if (state = "faulted" || state = "timed-out") && result.Disposition <> Refused
               && int result.Identity.Generation = generation then
                generation <- generation + 1
            let reportedPhase =
                if state = "timed-out" then
                    match result.Outcome |> Option.map _.Phase with
                    | Some AllocateDescriptor -> "alloc-descriptor"
                    | Some AllocateInput -> "alloc-input"
                    | Some Compile -> "compile"
                    | Some Instantiate -> "instantiate"
                    | Some Initialize -> "initialize"
                    | Some Process -> "process"
                    | Some Free -> "free"
                    | Some Shutdown -> "shutdown"
                    | None -> phase
                else phase
            receive {
                request = string result.Identity.Request
                generation = int result.Identity.Generation
                state = state; phase = reportedPhase; reason = reason; output = output
                hash = if state = "completed" && phase = "load" then digest else ""
            }
    let create () =
        let settings = HostSettings.create (configuration limits (String.replicate 64 "a") (String.replicate 64 "b")) None |> unwrap
        Host.CreateConnected(settings, transport, settle) |> unwrap
    do host <- Some(create())
    member _.Generation = generation
    member _.Active = preparing || (host |> Option.exists (fun value -> value.Projection.ActiveWorker <> ""))
    member private _.Identity(request: string, phase, input, digest) : HostIdentity =
        nextRequest <- uint64 request
        requests <- requests.Add(nextRequest, (phase, input, digest))
        { WorkerInstance = sprintf "barc-guest-%d" generation; Request = nextRequest; Generation = uint64 generation }
    member this.Load(request, artifact, digest, configurationDigest, expectedGeneration) =
        if generation <> expectedGeneration then
            receive { request = request; generation = expectedGeneration; state = "discarded"; phase = "load"; reason = "guest generation was replaced"; output = Array.empty; hash = "" }
        else
            preparing <- false
            let identity = this.Identity(request, "load", Array.empty, digest)
            host.Value.LoadConfigured(now(), identity, configuration limits digest configurationDigest, artifact)
    member _.ConfigurationDocument(digest) =
        sprintf "bar-protected\n%s\n%d\n%d\n4096\n%d\n%d\n%d\nphase-watchdog\nrefuse-while-busy\ndestructive-load\n"
            digest limits.maximumArtifactBytes limits.maximumMemoryPages limits.maximumInputBytes
            limits.maximumOutputBytes limits.phaseTimeoutMilliseconds
    member this.Initialize(request, input) =
        if preparing then this.RefusePreparing(request, "initialize")
        elif not this.Active then this.RefuseInactive(request, "initialize")
        else host.Value.Initialize(now(), this.Identity(request, "initialize", input, ""), input)
    member this.Process(request, input) =
        if preparing then this.RefusePreparing(request, "process")
        elif not this.Active then this.RefuseInactive(request, "process")
        else host.Value.Invoke(now(), this.Identity(request, "process", input, ""), Ordinary, input)
    member this.Shutdown(request) =
        if preparing then this.RefusePreparing(request, "shutdown")
        elif not this.Active then this.RefuseInactive(request, "shutdown")
        else host.Value.Shutdown(now(), this.Identity(request, "shutdown", Array.empty, ""))
    member private _.RefuseInactive(request, phase) =
        receive { request = request; generation = generation; state = "faulted"; phase = phase; reason = "guest is not active"; output = Array.empty; hash = "" }
    member private _.RefusePreparing(request, phase) =
        receive { request = request; generation = generation; state = "faulted"; phase = phase; reason = "Busy: artifact identity is being prepared"; output = Array.empty; hash = "" }
    member this.BeginLoad() =
        this.Retire("guest generation was replaced")
        preparing <- true
        generation
    member _.Retire(reason) =
        preparing <- false
        retiringReason <- reason
        host.Value.Dispose(now())
        generation <- generation + 1
        host <- Some(create())

let create transport limits validate receive = Adapter(transport, limits, validate, receive)
let beginLoad (adapter: Adapter) = adapter.BeginLoad()
let configurationDocument (adapter: Adapter) digest = adapter.ConfigurationDocument(digest)
let load (adapter: Adapter) request artifact digest configurationDigest expectedGeneration = adapter.Load(request, artifact, digest, configurationDigest, expectedGeneration)
let initialize (adapter: Adapter) request input = adapter.Initialize(request, input)
let invoke (adapter: Adapter) request input = adapter.Process(request, input)
let shutdown (adapter: Adapter) request = adapter.Shutdown(request)
let retire (adapter: Adapter) reason = adapter.Retire(reason)
let generation (adapter: Adapter) = adapter.Generation
let active (adapter: Adapter) = adapter.Active
