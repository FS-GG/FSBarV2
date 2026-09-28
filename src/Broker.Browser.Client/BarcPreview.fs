namespace Broker.Browser.Client

open Elmish
open Fable.Core
open Fable.Core.JsInterop

[<AllowNullLiteral>]
type MountOptions =
    abstract assetBaseUrl: string
    abstract initialGatewayUrl: string option
    abstract initialExpectedSessionId: string option
    abstract initialCredential: string option

[<AllowNullLiteral>]
type Runtime =
    abstract start: unit -> unit
    abstract render: obj -> unit
    abstract dispose: unit -> unit

module BarcPreview =
    [<Import("createRuntime", "./runtime.js")>]
    let private createRuntime (root: obj) (options: MountOptions) (emit: RuntimeEvent -> unit) : Runtime = jsNative

    let mount (root: obj) (options: MountOptions) : obj =
        let mutable dispatchEvent: RuntimeEvent -> unit = ignore
        let runtime = createRuntime root options (fun event -> dispatchEvent event)

        let init () =
            Domain.initial,
            Cmd.ofEffect (fun dispatch ->
                dispatchEvent <- Runtime >> dispatch
                runtime.start ())

        let update msg model = Domain.update msg model, Cmd.none

        let view model _ =
            runtime.render (
                createObj [
                    "connection" ==> Domain.connectionText model.Connection
                    "detail" ==> model.Detail
                    "armed" ==> model.Armed
                    "snapshot" ==> (model.Snapshot |> Option.defaultValue Unchecked.defaultof<obj>)
                    "preview" ==> (model.Preview |> Option.defaultValue Unchecked.defaultof<obj>)
                    "moduleName" ==> model.ModuleName
                    "moduleDetail" ==> model.ModuleDetail
                ])

        Program.mkProgram init update view
        |> Program.withErrorHandler (fun (context, error) ->
            emitJsExpr (context, error) "console.error('BARC preview Elmish failure', $0, $1)")
        |> Program.run

        createObj [ "dispose" ==> fun () -> runtime.dispose () ]
