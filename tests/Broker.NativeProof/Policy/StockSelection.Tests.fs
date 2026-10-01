module Broker.NativeProof.Policy.Tests

open System
open Broker.NativeProof.Policy

let require condition message =
    if not condition then failwith message

let rec permutations values =
    match values with
    | [] -> [ [] ]
    | _ ->
        values
        |> List.mapi (fun index value ->
            let remaining = values |> List.removeAt index
            permutations remaining |> List.map (fun rest -> value :: rest))
        |> List.concat

let accept keys =
    StockSelection.accepts
        (Array.ofList keys)
        "string"
        "local"
        "string"
        "pointer"
        "string"
        "stock-smoke-count1"
        "number"
        1.0

let keys = [ "product"; "mode"; "caseId"; "count" ]
let orders = permutations keys

require (orders.Length = 24) "expected all 24 selection key permutations"
orders |> List.iter (fun order -> require (accept order) "a valid selection key order was refused")

for missing in keys do
    require (not (accept (keys |> List.filter ((<>) missing)))) "a missing key was accepted"

require (not (accept ("extra" :: keys))) "an extra key was accepted"
require (not (accept [ "product"; "product"; "mode"; "caseId"; "count" ])) "duplicate logical keys were accepted"
require (not (StockSelection.accepts (Array.ofList keys) "string" "remote" "string" "pointer" "string" "stock-smoke-count1" "number" 1.0)) "changed product was accepted"
require (not (StockSelection.accepts (Array.ofList keys) "string" "local" "string" "value" "string" "stock-smoke-count1" "number" 1.0)) "changed mode was accepted"
require (not (StockSelection.accepts (Array.ofList keys) "string" "local" "string" "pointer" "string" "other" "number" 1.0)) "changed case was accepted"
require (not (StockSelection.accepts (Array.ofList keys) "string" "local" "string" "pointer" "string" "stock-smoke-count1" "number" 2.0)) "changed count was accepted"
require (not (StockSelection.accepts (Array.ofList keys) "string" "local" "string" "pointer" "string" "stock-smoke-count1" "string" 1.0)) "string count was accepted"
require (not (StockSelection.accepts (Array.ofList keys) "string" "local" "string" "pointer" "string" "stock-smoke-count1" "boolean" 1.0)) "boolean count was accepted"

printfn "stock-selection-policy-ok permutations=%d" orders.Length
