namespace Broker.Browser.Gateway

open System
open System.Threading
open System.Threading.Tasks
open Microsoft.Extensions.Hosting
open Broker.Protocol

module Gateway =
    type Config =
        { url: string
          path: string
          allowedOrigin: string
          credential: string
          credentialSessionId: Guid
          credentialExpiresAt: DateTimeOffset
          perspectiveId: string
          authTimeout: TimeSpan
          closeTimeout: TimeSpan
          maxFrameBytes: int
          maxEntities: int }

    val defaultConfig : url:string -> origin:string -> credential:string -> sessionId:Guid -> Config
    val startAsync : hub:BrokerState.Hub -> config:Config -> cancellationToken:CancellationToken -> Task<IHost>

    type LiveConfig =
        { url: string
          path: string
          allowedOrigin: string
          credential: string
          credentialSessionId: Guid
          credentialExpiresAt: DateTimeOffset
          perspectiveId: string
          authTimeout: TimeSpan
          closeTimeout: TimeSpan
          maxFrameBytes: int }

    type SubmitRefusalReason =
        | Incomplete | IdentityRefused | IdentityMismatch | ActorsInvalid | ActorsNotDistinct
        | CapacityExhausted | CommandChannelFull | StateNotReady | ActorBindingInvalid
        | ActionInvalid | MovePolicyMissing | UnitReferenceInvalid | FeatureReferenceInvalid
        | ControllerNotConfirmed | AuthorityExpired | BasisExpired | ActorNotOwned
        | AttackTargetInvalid | MoveTargetOutOfBounds | UnknownRefusal

    type LiveDiagnostic =
        | SubmitAccepted
        | SubmitRefused of reason:SubmitRefusalReason
        | BrokerAdmissionForwarded
        | BrokerAdmissionRejectedForwarded
        | UnknownForwarded
        | ExpiredForwarded
        | ReceiveTaskFailed | ReceiveTaskCompleted | ReceiveTaskCancelled
        | OutputTaskFailed | OutputTaskCompleted | OutputTaskCancelled
        | RenewalTaskFailed | RenewalTaskCompleted | RenewalTaskCancelled

    val diagnosticNames : diagnostic:LiveDiagnostic -> struct(string * string)
    val internal emitDiagnostic : diagnostics:(LiveDiagnostic -> unit) -> diagnostic:LiveDiagnostic -> unit
    val internal completedTaskDiagnostic : receiveTask:Task -> outputTask:Task -> renewalTask:Task -> completed:Task -> LiveDiagnostic
    val internal feedbackDiagnostic : stage:LiveControl.FeedbackStage -> status:LiveControl.FeedbackStatus -> LiveDiagnostic option
    val internal submitRefusalReason : detail:string -> SubmitRefusalReason

    val defaultLiveConfig : url:string -> origin:string -> credential:string -> sessionId:Guid -> LiveConfig
    val startLiveAsyncWithDiagnostics : hub:BrokerState.Hub -> config:LiveConfig -> diagnostics:(LiveDiagnostic -> unit) -> cancellationToken:CancellationToken -> Task<IHost>
    val startLiveAsync : hub:BrokerState.Hub -> config:LiveConfig -> cancellationToken:CancellationToken -> Task<IHost>
