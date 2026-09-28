module Broker.Browser.Preview.Program

open System
open System.Threading
open System.Threading.Tasks
open Broker.Browser.Preview

let private usage () =
    "usage: Broker.Browser.Preview --fixture --assets-root PATH --base-path /barc/ --grpc-port N --gateway-port N --static-port N --ready-file PATH"

let private parse (argv: string array) : PreviewHost.Config =
    let mutable fixture = false
    let values = System.Collections.Generic.Dictionary<string, string>()
    let mutable index = 0
    while index < argv.Length do
        match argv.[index] with
        | "--fixture" -> fixture <- true; index <- index + 1
        | key when key.StartsWith("--") && index + 1 < argv.Length ->
            values[key] <- argv.[index + 1]; index <- index + 2
        | value -> invalidArg "argv" ("unexpected argument " + value + "\n" + usage())
    let required key = match values.TryGetValue key with true, value -> value | _ -> invalidArg "argv" (key + " is required\n" + usage())
    let port key = match Int32.TryParse(required key) with true, value -> value | _ -> invalidArg "argv" (key + " must be an integer")
    { assetsRoot = required "--assets-root"
      basePath = required "--base-path"
      grpcPort = port "--grpc-port"
      gatewayPort = port "--gateway-port"
      staticPort = port "--static-port"
      readyFile = required "--ready-file"
      fixtureMode = fixture
      credentialLifetime = TimeSpan.FromMinutes 5.0
      fixtureTiming = PreviewHost.defaultFixtureTiming }

[<EntryPoint>]
let main argv =
    try
        let config = parse argv
        use stop = new CancellationTokenSource()
        Console.CancelKeyPress.Add(fun args -> args.Cancel <- true; stop.Cancel())
        let handle = PreviewHost.start config stop.Token |> fun task -> task.GetAwaiter().GetResult()
        printfn "BARC preview ready: static=%s fixture=%b" (sprintf "http://127.0.0.1:%d%s" config.staticPort config.basePath) config.fixtureMode
        try Task.Delay(Timeout.Infinite, stop.Token).GetAwaiter().GetResult() with :? OperationCanceledException -> ()
        (handle :> IAsyncDisposable).DisposeAsync().AsTask().GetAwaiter().GetResult()
        0
    with error ->
        eprintfn "BARC preview failed: %s" error.Message
        2
