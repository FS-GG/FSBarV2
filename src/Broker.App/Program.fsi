namespace Broker.App

module Program =

    /// Composition-root entry point. Wires Logging, Core, Protocol and Tui,
    /// then runs until the operator presses `Q` or
    /// the process receives `SIGINT` / Ctrl-C.
    [<EntryPoint>]
    val main : argv:string array -> int
