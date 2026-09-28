module Broker.Browser.Preview.Tests.Program

open Expecto

[<EntryPoint>]
let main argv = runTestsWithCLIArgs [] argv PreviewTests.tests
