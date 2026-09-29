namespace Broker.Protocol

open System
open System.Threading.Channels
open Highbar.V1

module LiveControl =
    type State

    type Action =
        | Stop
        | Move of x:float32 * z:float32 * append:bool
        | Attack of target:NativeUnitReference

    type Submission =
        { parentId: Guid
          inputId: Guid
          sessionId: Guid
          controllerId: Guid
          controllerIncarnation: string
          authorityEpoch: uint64
          moduleSha256: byte[]
          moduleGeneration: uint64
          basis: NativeObservationBasis
          actors: NativeUnitReference list
          action: Action }

    type FeedbackStage = BrokerAdmission | NativeAdmission | NativeDispatch | Unknown
    type FeedbackStatus = Accepted | Rejected | Applied | Skipped | Expired | UnknownStatus

    type Feedback =
        { resultSequence: uint64
          parentId: Guid
          inputId: Guid
          sessionId: Guid
          controllerId: Guid
          controllerIncarnation: string
          moduleGeneration: uint64
          moduleSha256: byte[]
          authorityEpoch: uint64
          basis: NativeObservationBasis
          batchSequence: uint64
          correlationId: uint64
          childIndex: int
          childCount: int
          actor: NativeUnitReference
          stage: FeedbackStage
          status: FeedbackStatus
          detail: string
          nativeFrame: uint32 option
          commandChannelIncarnation: string }

    type ControllerStage = ArmRequested | NativeConfirmed | RevokeRequested | Revoked | ControllerExpired | ControllerRefused
    type ControllerUpdate =
        { stateSequence: uint64
          binding: LiveBinding
          stage: ControllerStage
          reason: string }

    type ProvisionalController =
        { sessionId: Guid
          controllerId: Guid
          controllerIncarnation: string
          authorityEpoch: uint64 }

    type ControlLease =
        { incarnation: string
          reader: ChannelReader<LiveControlDirective> }

    type CommandDelivery = { batches: LiveCommandBatch list }
    type CommandLease =
        { incarnation: string
          reader: ChannelReader<CommandDelivery> }

    type ClaimResult<'a> = Claimed of 'a | AlreadyClaimed | Unavailable of string
    type NativeAdmissionDisposition = NativeRecorded | NativeDuplicate | NativeNotOwned

    val create : parentCapacity:int -> State
    val reportState : report:LiveStateReport -> receivedAt:DateTimeOffset -> state:State -> LiveStateReportDisposition
    val claimControl : subscribe:LiveControlSubscribe -> state:State -> ClaimResult<ControlLease>
    val releaseControl : incarnation:string -> state:State -> unit
    val claimCommands : subscribe:LiveCommandSubscribe -> state:State -> ClaimResult<CommandLease>
    val releaseCommands : incarnation:string -> state:State -> unit
    val requestArm : binding:LiveBinding -> leaseDurationMs:uint32 -> now:DateTimeOffset -> state:State -> Result<unit,string>
    val requestBrowserArm : sessionId:Guid -> controllerId:Guid -> controllerIncarnation:string -> authorityEpoch:uint64 -> moduleSha256:byte[] -> moduleGeneration:uint64 -> leaseDurationMs:uint32 -> now:DateTimeOffset -> state:State -> Result<unit,string>
    val provisionController : sessionId:Guid -> state:State -> ProvisionalController
    val releaseProvisionalController : controllerId:Guid -> state:State -> unit
    val requestRenew : binding:LiveBinding -> leaseDurationMs:uint32 -> now:DateTimeOffset -> state:State -> Result<unit,string>
    val requestRevoke : binding:LiveBinding -> reason:string -> now:DateTimeOffset -> state:State -> Result<unit,string>
    val reportControlAck : report:LiveControlAckReport -> now:DateTimeOffset -> state:State -> LiveControlAckDisposition
    val admit : submission:Submission -> now:DateTimeOffset -> state:State -> Result<Feedback list,string>
    val reportNativeAdmission : pluginId:string -> channelIncarnation:string -> result:CommandBatchResult -> state:State -> NativeAdmissionDisposition
    val noteDispatch : dispatch:CommandDispatchEvent -> state:State -> bool
    /// Expire terminal native outcomes after the command's dispatch fences plus a bounded
    /// transport allowance. Returns the number of child identities completed as unknown.
    val expirePendingResults : now:DateTimeOffset -> state:State -> int
    val blocksLegacyGameplay : state:State -> bool
    val maxPendingParents : state:State -> uint32
    val maxRetainedResults : state:State -> uint32
    val feedback : state:State -> IObservable<Feedback>
    val controllerUpdates : state:State -> IObservable<ControllerUpdate>
    val noteMetadataReported : sequence:uint64 -> state:State -> unit
    val metadataReports : state:State -> IObservable<uint64>
    val latestCapabilities : state:State -> LiveNativeCapabilities option
    val latestSnapshotMetadata : state:State -> LiveSnapshotMetadata option
    val currentBinding : state:State -> LiveBinding option
    val reset : detail:string -> state:State -> unit
