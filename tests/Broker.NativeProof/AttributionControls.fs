namespace Broker.NativeProof

open System
open System.Collections.Concurrent
open System.Diagnostics
open System.Net
open System.Net.Sockets
open System.Threading
open Grpc.Net.Client
open Broker.Core
open Broker.Protocol
open Highbar.V1

// Compiled service controls use a controlled loopback producer, never a game.
module AttributionControls =
    let private require condition message = if not condition then invalidOp message

    let private snapshot sequence frame =
        let state = StateSnapshot.empty()
        state.FrameNumber <- frame
        let unit = OwnUnit.empty()
        unit.UnitId <- 7u
        unit.DefId <- 303u
        unit.BuildProgress <- 1f
        let position = Vector3.empty()
        position.X <- 11f
        position.Y <- 7f
        position.Z <- 23f
        unit.Position <- ValueSome position
        state.OwnUnits.Add unit
        let update = StateUpdate.empty()
        update.Seq <- sequence
        update.Frame <- frame
        update.Snapshot <- state
        update

    let private lifecycle sequence frame created =
        let event = DeltaEvent.empty()
        if created then
            let value = UnitCreatedEvent.empty()
            value.UnitId <- 8
            value.BuilderId <- 7
            event.UnitCreated <- value
        else
            let value = UnitFinishedEvent.empty()
            value.UnitId <- 8
            event.UnitFinished <- value
        let delta = StateDelta.empty()
        delta.Events.Add event
        let update = StateUpdate.empty()
        update.Seq <- sequence
        update.Frame <- frame
        update.Delta <- delta
        update

    let run () = task {
        use lifetime = new CancellationTokenSource(TimeSpan.FromSeconds 25.)
        let rows = ConcurrentQueue<struct(Guid * StateUpdate * string)>()
        let subscriptions = ConcurrentBag<IDisposable>()
        let listenerObserver =
            { new IObserver<DiagnosticListener> with
                member _.OnNext listener =
                    if listener.Name = "FSBar.HighBar.AcceptedState" then
                        let observer =
                            { new IObserver<Collections.Generic.KeyValuePair<string,obj>> with
                                member _.OnNext value =
                                    if value.Key = "AcceptedState" then
                                        rows.Enqueue(unbox<struct(Guid * StateUpdate * string)> value.Value)
                                member _.OnError error = raise error
                                member _.OnCompleted() = () }
                        subscriptions.Add(listener.Subscribe observer)
                member _.OnError error = raise error
                member _.OnCompleted() = () }
        use all = DiagnosticListener.AllListeners.Subscribe(listenerObserver)
        let portSelection = new TcpListener(IPAddress.Loopback, 0)
        portSelection.Start()
        let port = (portSelection.LocalEndpoint :?> IPEndPoint).Port
        portSelection.Stop()
        let audit = ConcurrentQueue<Audit.AuditEvent>()
        let! host = ServerHost.start { ServerHost.defaultOptions with listenAddress=sprintf "127.0.0.1:%d" port } (Version(1,0)) audit.Enqueue lifetime.Token
        let waitFor name condition = task {
            let stop = DateTimeOffset.UtcNow.AddSeconds 8.
            while not(condition()) do
                if DateTimeOffset.UtcNow > stop then invalidOp ("attribution control timeout: " + name)
                do! System.Threading.Tasks.Task.Delay(10,lifetime.Token)
        }
        let row sequence frame =
            rows.ToArray() |> Array.find(fun struct(_,value,_) -> value.Seq=sequence && value.Frame=frame)
        try
            use channel = GrpcChannel.ForAddress(sprintf "http://127.0.0.1:%d" port)
            let producer = HighBarCoordinator.HighBarCoordinatorClient(channel)
            let heartbeat name =
                let request = HeartbeatRequest.empty()
                request.PluginId <- name
                request.SchemaVersion <- "1.0.0"
                producer.HeartbeatAsync(request,cancellationToken=lifetime.Token).ResponseAsync
            let! _ = heartbeat "attribution-old"
            use oldPush = producer.PushStateAsync(cancellationToken=lifetime.Token)
            do! oldPush.RequestStream.WriteAsync(snapshot 1UL 10u)
            do! waitFor "initial snapshot" (fun () -> rows.Count=1)
            let struct(generation,baseline,disposition) = row 1UL 10u
            require (generation<>Guid.Empty && disposition="materialized" && baseline.Snapshot.OwnUnits.[0].UnitId=7u) "actual baseline/generation missing"
            printfn "ATTRIBUTION_CONTROL_PASS baseline-generation"

            do! oldPush.RequestStream.WriteAsync(lifecycle 2UL 11u true)
            do! waitFor "created" (fun () -> rows.Count=2)
            let struct(createdGeneration,created,createdDisposition) = row 2UL 11u
            require (createdGeneration=generation && createdDisposition="invalidated" && created.Delta.Events.[0].UnitCreated.BuilderId=7 && created.Delta.Events.[0].UnitCreated.UnitId=8) "creation provenance/invalidation changed"
            require (audit.ToArray() |> Array.exists(function Audit.AuditEvent.CoordinatorStateInvalidated _ -> true | _ -> false)) "actual hub invalidation missing"
            printfn "ATTRIBUTION_CONTROL_PASS creation-invalidates-with-builder"

            do! oldPush.RequestStream.WriteAsync(lifecycle 3UL 12u false)
            do! waitFor "finished" (fun () -> rows.Count=3)
            let struct(finishedGeneration,finished,finishedDisposition) = row 3UL 12u
            require (finishedGeneration=generation && finishedDisposition="invalidated" && finished.Delta.Events.[0].UnitFinished.UnitId=8) "completion/invalidation changed"
            printfn "ATTRIBUTION_CONTROL_PASS completion-retains-invalid-baseline"

            let replacement = snapshot 4UL 13u
            let product = OwnUnit.empty()
            product.UnitId <- 8u
            product.DefId <- 304u
            product.BuildProgress <- 1f
            let productPosition = Vector3.empty()
            productPosition.X <- 13f
            productPosition.Y <- 7f
            productPosition.Z <- 25f
            product.Position <- ValueSome productPosition
            replacement.Snapshot.OwnUnits.Add product
            do! oldPush.RequestStream.WriteAsync replacement
            do! waitFor "full replacement" (fun () -> rows.Count=4)
            let struct(replacementGeneration,replaced,replacementDisposition) = row 4UL 13u
            require (replacementGeneration=generation && replacementDisposition="materialized" && replaced.Snapshot.OwnUnits.Count=2) "full replacement missing"
            let view,_ = WireConvert.applyHighBarStateUpdate baseline WireConvert.emptyRunningView
            let invalid,_ = WireConvert.applyHighBarStateUpdate created view
            require (not(WireConvert.hasValidBaseline invalid)) "unsupported creation falsely materialized"
            let invalidFinished,_ = WireConvert.applyHighBarStateUpdate finished invalid
            require (not(WireConvert.hasValidBaseline invalidFinished)) "finish falsely repairs baseline"
            let repaired,_ = WireConvert.applyHighBarStateUpdate replaced invalidFinished
            require (WireConvert.hasValidBaseline repaired) "complete replacement failed to repair"
            printfn "ATTRIBUTION_CONTROL_PASS full-replacement-recovers"

            // Let the existing owning-generation watchdog detach this controlled stream.
            do! waitFor "old generation detach" (fun () -> BrokerState.session host.Hub |> Option.isNone)
            let! _ = heartbeat "attribution-new"
            use newPush = producer.PushStateAsync(cancellationToken=lifetime.Token)
            do! newPush.RequestStream.WriteAsync(snapshot 1UL 100u)
            do! waitFor "new generation" (fun () -> rows.Count=5)
            let struct(newGeneration,_,newDisposition) = row 1UL 100u
            require (newGeneration<>generation && newDisposition="materialized") "replacement generation identity reused"
            printfn "ATTRIBUTION_CONTROL_PASS new-generation-distinct"

            do! oldPush.RequestStream.WriteAsync(lifecycle 5UL 999u true)
            do! System.Threading.Tasks.Task.Delay(100,lifetime.Token)
            require (rows.Count=5) "stale stream emitted accepted attribution"
            let tick = BrokerState.session host.Hub |> Option.bind(fun session -> (Session.toReading DateTimeOffset.UtcNow session).telemetry) |> Option.map _.tick
            require (tick=Some 100L) "stale stream contaminated replacement"
            printfn "ATTRIBUTION_CONTROL_PASS stale-generation-refused"
            printfn "ATTRIBUTION_CONTROLS_COMPLETE passed=6 controlledProducer=true gameLaunched=false"
            return 0
        finally
            lifetime.Cancel()
            (host :> IAsyncDisposable).DisposeAsync().AsTask().GetAwaiter().GetResult()
            for subscription in subscriptions do subscription.Dispose()
    }
