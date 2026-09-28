module BarcFableGame.Client.Program

open Elmish
open BarcFableGame.Client.App

Program.mkProgram init update view |> Program.run
