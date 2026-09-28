module Broker.Browser.Client.Tests.Program

open Broker.Browser.Client

let private require condition message =
    if not condition then failwith message

let private event kind detail value =
    { new RuntimeEvent with
        member _.kind = kind
        member _.detail = detail
        member _.value = value }

let private apply kind detail value model =
    Domain.update (Runtime(event kind detail value)) model

let mutable model = Domain.initial
require (Domain.connectionText model.Connection = "unpaired") "initial connection must be unpaired"

model <- apply "streaming" "authenticated" Unchecked.defaultof<obj> model
require (Domain.connectionText model.Connection = "current") "streaming must project current state"

model <- apply "module" "manual-preview.wasm" Unchecked.defaultof<obj> model
model <- apply "armed" "generation 1" Unchecked.defaultof<obj> model
require model.Armed "explicit rearm must arm the guest"

model <- apply "snapshot" "current" "snapshot-9007199254740993" model
require model.Armed "current snapshots preserve an explicitly armed generation"

model <- apply "preview" "" "move-77" model
require model.Preview.IsSome "validated guest output must be projected"

model <- apply "snapshot" "stale" "snapshot-9007199254740993" model
require (Domain.connectionText model.Connection = "stale") "stale snapshot must be visible"
require (not model.Armed && model.Preview.IsNone) "stale state must clear preview and disarm"

model <- apply "disconnected" "closed" Unchecked.defaultof<obj> model
require (Domain.connectionText model.Connection = "disconnected" && not model.Armed) "disconnect must remain disarmed"

printfn "BARC client Elmish state tests passed (8 assertions)"
