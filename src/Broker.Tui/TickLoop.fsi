namespace Broker.Tui

open System.Threading
open System.Threading.Tasks
open Broker.Core

module TickLoop =

    /// Which screen the TUI is currently rendering. The lobby form
    /// carries an in-progress draft `LobbyConfig` the operator is editing;
    /// pressing `Enter` confirms it and the mode flips back to Dashboard.
    type UiMode =
        | Dashboard
        | Lobby of draft:Lobby.LobbyConfig

    /// Pure dispatch: given the current UI mode and a hotkey action,
    /// invoke the matching `Session.CoreFacade` operator method and
    /// return the next UI mode. Decoupled from the live ANSI loop so
    /// `Broker.Tui.Tests` can exercise the dispatch table against a
    /// stub `CoreFacade` without standing up Spectre's LiveDisplay.
    val dispatch :
        core:Session.CoreFacade
        -> uiMode:UiMode
        -> action:HotkeyMap.Action
        -> UiMode

    /// Single-thread render-and-input loop. Owns the AnsiConsole.Live
    /// context — Spectre.Console's `LiveDisplay` is not thread-safe, so
    /// rendering and input handling share one thread (research.md §4).
    /// Returns when the user issues
    /// `Quit` or the cancellation token fires.
    val run :
        core:Session.CoreFacade
        -> tickIntervalMs:int
        -> CancellationToken
        -> Task<unit>
