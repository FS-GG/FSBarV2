module Broker.Integration.Tests.ReadyCoordinator

open System
open System.Threading.Tasks
open Grpc.Net.Client
open Broker.Protocol

/// Attach through the production coordinator gRPC surface, publish one real
/// snapshot baseline, and wait until command admission can observe both the
/// telemetry and outbound-channel readiness fences.
let connect
    (channel: GrpcChannel)
    (hub: BrokerState.Hub)
    (pluginId: string)
    : Task<SyntheticCoordinator.Driver> =
    task {
        let! coordinator = SyntheticCoordinator.connect channel pluginId "1.0.0"
        do! coordinator.PushSnapshotAsync(fun _ -> ())

        let deadline = DateTime.UtcNow.AddSeconds(5.0)
        while
            DateTime.UtcNow < deadline
            && not (BrokerState.telemetryValid hub && BrokerState.hasCoordinatorCommandChannel hub)
            do
                do! Task.Delay 25

        if not (BrokerState.telemetryValid hub) then
            (coordinator :> IDisposable).Dispose()
            invalidOp "synthetic coordinator snapshot did not establish a valid telemetry baseline"

        if not (BrokerState.hasCoordinatorCommandChannel hub) then
            (coordinator :> IDisposable).Dispose()
            invalidOp "synthetic coordinator command channel did not become ready"

        return coordinator
    }
