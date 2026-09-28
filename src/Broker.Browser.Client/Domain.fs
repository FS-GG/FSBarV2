namespace Broker.Browser.Client

open Fable.Core

type Connection =
    | Unpaired
    | Connecting
    | Streaming
    | Stale
    | Disconnected
    | Refused

[<AllowNullLiteral>]
type RuntimeEvent =
    abstract kind: string
    abstract detail: string
    abstract value: obj

type Model =
    { Connection: Connection
      Detail: string
      Armed: bool
      Snapshot: obj option
      Preview: obj option
      ModuleName: string
      ModuleDetail: string }

type Msg = Runtime of RuntimeEvent

module Domain =
    let initial =
        { Connection = Unpaired
          Detail = "Enter the loopback gateway and one-time credential to pair."
          Armed = false
          Snapshot = None
          Preview = None
          ModuleName = "No guest loaded"
          ModuleDetail = "Choose a bundled preview guest or import a .wasm file."
        }

    let private connection kind current =
        match kind with
        | "connecting" -> Connecting
        | "streaming" -> Streaming
        | "current" -> Streaming
        | "stale" -> Stale
        | "disconnected" -> Disconnected
        | "refused" -> Refused
        | _ -> current

    let update (Runtime event) model =
        match event.kind with
        | "snapshot" ->
            { model with
                Connection = connection event.detail model.Connection
                Detail = if event.detail = "stale" then "Snapshot retained; gameplay input is disarmed." else "Live read-only snapshot."
                Snapshot = Some event.value
                Preview = if event.detail = "stale" then None else model.Preview
                Armed = event.detail <> "stale" && model.Armed }
        | "preview" -> { model with Preview = Some event.value }
        | "armed" -> { model with Armed = true; ModuleDetail = event.detail }
        | "module" -> { model with ModuleName = event.detail; ModuleDetail = "Module bytes staged; explicit rearm validates and initializes them."; Armed = false; Preview = None }
        | "disarmed" -> { model with Armed = false; Preview = None; ModuleDetail = event.detail }
        | "connecting" | "streaming" | "stale" | "disconnected" | "refused" ->
            { model with
                Connection = connection event.kind model.Connection
                Detail = event.detail
                Armed = if event.kind = "streaming" then model.Armed else false
                Preview = if event.kind = "streaming" then model.Preview else None }
        | _ -> model

    let connectionText = function
        | Unpaired -> "unpaired"
        | Connecting -> "connecting"
        | Streaming -> "current"
        | Stale -> "stale"
        | Disconnected -> "disconnected"
        | Refused -> "refused"
