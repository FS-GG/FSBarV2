module Broker.Browser.Render.Tests.Program

// GAME-RENDER-ADOPT-01.8. The same file runs under .NET (`dotnet run`) and, compiled by Fable, under Node
// (`npm run test:fable`); scripts/verify-bar-render.sh requires the two outputs to be identical. Run it from this
// directory: the fixture corpus is read from ../../fixtures/barc-browser/semantic.

open System
open System.IO
open Elmish
open FS.GG.Game.Render
open FS.GG.UI.Scene
open Broker.Browser.Render

let mutable private checks = 0

let private require (condition: bool) (message: string) =
    checks <- checks + 1

    if not condition then
        failwithf "FAILED: %s" message

let private fixture (name: string) =
    File.ReadAllText("../../fixtures/barc-browser/semantic/" + name + ".json")

let private decoded name =
    match BarObservationJson.decode (fixture name) with
    | Ok state -> state
    | Error reason -> failwithf "fixture %s did not decode: %s" name reason

// --- Recorded state: the shared barc.browser.v1 fixture corpus -------------------------------------------------

let asymmetric = decoded "observation-asymmetric"

require (asymmetric.Sequence = "9007199254740993") "a uint64 sequence above 2^53 survives decoding exactly"
require (asymmetric.SessionId = "ABEiM0RVZneImaq7zN3u/w==" && asymmetric.PerspectiveId = "team-7") "identity decodes"
require (asymmetric.Validity = BarValidity.Current) "validity decodes"
require (asymmetric.Units.Length = 3 && asymmetric.Features.Length = 1) "three units and one feature decode"

let own = asymmetric.Units |> List.find (fun u -> u.Id = "77")
require (own.Kind = BarObservationKind.Own && own.TeamId = Some 7 && own.DefinitionId = Some 501u) "own unit decodes"
require (own.Position.X = 11.25 && own.Position.Elevation = Some 403.5 && own.Position.Z = -37.5) "position keeps elevation"
require (own.Health = Some 123.5 && own.MaxHealth = Some 800.0) "health decodes"

let radar = asymmetric.Units |> List.find (fun u -> u.Id = "99")
require (radar.Kind = BarObservationKind.Radar && radar.TeamId.IsNone) "an absent team stays absent"
require (radar.Position.Elevation.IsNone && radar.DefinitionId = Some 0u) "absent elevation is not invented; definition 0 is a real zero"
require (asymmetric.Features.Head.Id = "77" && asymmetric.Features.Head.DefinitionId = 909u) "features have their own identity space"

match asymmetric.Economy with
| Some economy ->
    require (economy.TeamId = Some 7 && economy.Metal.Current = Some 42.5 && economy.Metal.Storage = Some 1000.0) "metal decodes"
    require (economy.Metal.Expenditure = Some 3.5 && economy.Energy.Current = Some 0.0) "expenditure decodes; a zero current stays a zero"
| None -> require false "economy decodes"

require (BarGameState.validate BarClient.maxEntities asymmetric = Ok asymmetric) "a fixture observation validates"

let absent = decoded "observation-optional-absent"
require (absent.Economy.IsNone && absent.Units.Head.Health.IsNone && absent.Units.Head.TeamId.IsNone) "absent economy, health and team stay absent"

let zero = decoded "observation-optional-present-zero"
let zeroUnit = zero.Units.Head
require (zeroUnit.TeamId = Some 0 && zeroUnit.Health = Some 0.0 && zeroUnit.MaxHealth = Some 0.0) "present zero is kept, not dropped"
require (zeroUnit.Position.Elevation = Some 0.0) "present zero elevation is kept"
require (zero.Economy.Value.Metal.Storage = Some 0.0 && zero.Economy.Value.Energy.Storage.IsNone) "present zero economy is kept"

let unknownField = decoded "observation-unknown-field"
require (unknownField.Units.Length = 3) "an unknown field is ignored"

match BarObservationJson.decode (fixture "observation-unknown-enum") with
| Error reason -> require (reason.Contains "observation kind") "an unknown enum value is refused"
| Ok _ -> require false "an unknown enum value is refused"

require ((decoded "guest-observation").Units.Length = 2) "an observation inside a guest request decodes"
require (BarObservationJson.decode "{" |> Result.isError) "malformed JSON is refused"
require (BarObservationJson.decode """{"sequence":"1"}""" |> Result.isError) "an observation without validity is refused"

// --- Invariants ------------------------------------------------------------------------------------------------

let withUnits units = { asymmetric with Units = units }
let anUnit = asymmetric.Units.Head
let refused result = Result.isError result

require (refused (BarGameState.validate 100 (withUnits [ anUnit; anUnit ]))) "duplicate unit ids are refused"
require (refused (BarGameState.validate 100 (withUnits [ { anUnit with Id = "0" } ]))) "a zero unit id is refused"
require (refused (BarGameState.validate 100 (withUnits [ { anUnit with Id = "07" } ]))) "a leading-zero id is refused"
require (refused (BarGameState.validate 100 (withUnits [ { anUnit with Position = { anUnit.Position with X = nan } } ]))) "a non-finite coordinate is refused"
require (refused (BarGameState.validate 100 (withUnits [ { anUnit with Health = Some infinity } ]))) "a non-finite health is refused"
require (refused (BarGameState.validate 2 asymmetric)) "more than the entity limit is refused"
require (refused (BarGameState.validate 100 { asymmetric with Features = [ { asymmetric.Features.Head with DefinitionId = 0u } ] })) "a zero feature type is refused"
require (BarGameState.validate 100 (withUnits [ anUnit ]) |> Result.isOk) "a unit may share an id with a feature"
require (BarGameState.follows { asymmetric with Sequence = "9" } { asymmetric with Sequence = "10" }) "sequences compare numerically"
require (not (BarGameState.follows asymmetric asymmetric)) "an equal sequence does not follow"

// --- The shared Scene projection --------------------------------------------------------------------------------

let synthetic = BarSynthetic.frames 6
require (synthetic.Length = 6 && synthetic.Head.Sequence = "1" && (List.last synthetic).Sequence = "6") "synthetic frames are numbered 1..n"
require (synthetic = BarSynthetic.frames 6) "synthetic frames are deterministic"
require (synthetic |> List.forall (fun f -> BarGameState.validate BarClient.maxEntities f |> Result.isOk)) "synthetic frames validate"

let first = synthetic.Head
let centre = BarScene.toViewport { X = 0.0; Elevation = None; Z = 0.0 }
require (centre.X = 400.0 && centre.Y = 260.0) "the world origin is the viewport centre, as in the existing preview"
let corner = BarScene.toViewport { X = -37.5; Elevation = Some 9.0; Z = 10.0 }
require (corner.X = 325.0 && corner.Y = 280.0) "x = 400 + 2X and y = 260 + 2Z; elevation does not move the point"

let sceneOf state = BarScene.view state
require (sceneOf first = sceneOf first) "the projection is deterministic"
require (sceneOf { first with Units = List.rev first.Units; Features = List.rev first.Features } = sceneOf first) "unit order in the input does not change the scene"
require (sceneOf { first with Validity = BarValidity.Stale } <> sceneOf first) "a stale state is drawn differently"
require ((BarScene.describe first).Contains "2 own, 1 visual, 1 radar, 3 features") "the description counts entities"

let retained (scene: Scene) : RetainedScene =
    { RootId = "bar"
      Revision = 1
      Camera = { PanX = 0.0; PanY = 0.0; Zoom = 1.0 }
      Layers =
        [ { Id = "game"
            Visible = true
            Objects =
              [ { Id = "scene"
                  Selectable = false
                  AccessibleLabel = "BAR"
                  Content = scene } ] } ] }

for state in [ first; BarGameState.empty; { first with Validity = BarValidity.Stale }; asymmetric; zero ] do
    require
        (match SvgRetained.project (retained (sceneOf state)) with
         | SvgAdapterResult.Rendered _ -> true
         | _ -> false)
        "the portable SVG adapter accepts the BAR scene"

// --- Renderer selection over the BAR game-state type ------------------------------------------------------------

type Probe() =
    member val Log = ResizeArray<string>()

let probe = Probe()

let fakeAdapter (backend: RendererBackend) (failMount: bool) : RendererAdapter<BarGameState> =
    { Backend = backend
      Mount =
        fun state ->
            let token = RendererBackend.id backend
            probe.Log.Add(sprintf "mount %s #%s" token state.Sequence)

            if failMount then
                Error "no WebGL"
            else
                Ok
                    { Present = fun next -> probe.Log.Add(sprintf "present %s #%s" token next.Sequence)
                      Dispose = fun () -> probe.Log.Add(sprintf "dispose %s" token) } }

let svgOnly () =
    RendererRegistry.svg BarScene.view (fun scene ->
        probe.Log.Add "mount svg scene"
        Ok { Present = (fun _ -> probe.Log.Add "present svg scene"); Dispose = fun () -> probe.Log.Add "dispose svg scene" })

let all () =
    svgOnly ()
    |> RendererRegistry.register (fakeAdapter RendererBackend.Pixi false)
    |> RendererRegistry.register (fakeAdapter RendererBackend.Babylon false)

let model0, effects0 = BarClient.init (svgOnly ()) synthetic

require (model0.Renderer.Selected = RendererBackend.Svg) "SVG is the default backend"
require (model0.Renderer.State = first && model0.Presented = 1 && model0.Remaining.Length = 5) "the first frame is the initial state"
require (BarClient.available model0 = [ RendererBackend.Svg ]) "only SVG is selectable before other adapters are registered"
require (match effects0 with [ RendererEffect.Mount(RendererBackend.Svg, 1, s) ] when s = first -> true | _ -> false) "init mounts SVG as attempt 1"

let empty0, _ = BarClient.init (svgOnly ()) []
require (empty0.Renderer.State = BarGameState.empty && empty0.Presented = 0) "no frames starts on the empty state"

let stepped, stepEffects = BarClient.update Step model0
require (stepped.Renderer.State.Sequence = "2" && stepped.Presented = 2 && stepped.Remaining.Length = 4) "Step presents the next frame"
require (match stepEffects with [ RendererEffect.Present(RendererBackend.Svg, s) ] -> s.Sequence = "2" | _ -> false) "Step presents it on the mounted backend"

let replayed, replayEffects = BarClient.update (Observe first) stepped
require (replayEffects.IsEmpty && replayed.Rejected.Length = 1 && replayed.Renderer.State = stepped.Renderer.State) "a replayed sequence is refused and state is kept"

let otherSession = { first with SessionId = "other"; Sequence = "1" }
let accepted, _ = BarClient.update (Observe otherSession) stepped
require (accepted.Renderer.State = otherSession) "a new session starts a new sequence"

let invalid, invalidEffects = BarClient.update (Observe { synthetic.[2] with Units = [ anUnit; anUnit ] }) stepped
require (invalidEffects.IsEmpty && invalid.Rejected.Length = 1) "an invalid observation is refused"

let viaJson, _ = BarClient.update (ObserveJson(fixture "observation-optional-absent")) empty0
require (viaJson.Renderer.State.Units.Length = 1 && viaJson.Presented = 1) "canonical JSON is decoded and presented"
let badJson, _ = BarClient.update (ObserveJson "[") model0
require (badJson.Rejected.Length = 1) "undecodable JSON is refused"

let mutable flooded = model0
for _ in 1 .. 20 do
    flooded <- fst (BarClient.update (Observe first) flooded)
require (flooded.Rejected.Length = BarClient.maxRejections) "refusals are bounded"

let unavailable, unavailableEffects = BarClient.update (Renderer(RendererMsg.SelectBackend RendererBackend.Pixi)) stepped
require (unavailableEffects.IsEmpty && unavailable.Renderer.State = stepped.Renderer.State) "selecting an unregistered backend is refused with state intact"
require (unavailable.Renderer.Refusal = Some(RendererRefusal.Unavailable RendererBackend.Pixi) && unavailable.Renderer.Selected = RendererBackend.Svg) "the refusal is typed and the selection unchanged"

// --- The Elmish program ------------------------------------------------------------------------------------------

let run (registry: RendererRegistry<BarGameState>) frames =
    probe.Log.Clear()
    let mutable latest = None
    let mutable send: BarClientMsg -> unit = ignore

    let program, host =
        BarClient.program registry frames (fun model dispatch ->
            latest <- Some model
            send <- dispatch)

    Program.run program
    (fun () -> latest.Value), (fun msg -> send msg), host

let model, dispatch, host = run (all ()) synthetic
require (model().Renderer.Selected = RendererBackend.Svg && model().Presented = 1) "the program starts on SVG with the first frame"
require (List.ofSeq probe.Log = [ "mount svg scene" ]) "the program mounts the default adapter once"

dispatch Step
dispatch Step
require (model().Renderer.State.Sequence = "3" && model().Presented = 3) "the program replays frames"

dispatch (Renderer(RendererMsg.SelectBackend RendererBackend.Pixi))
let atSwitch = model().Renderer.State
require (model().Renderer.Selected = RendererBackend.Pixi && model().Renderer.Status = RendererStatus.Active) "the program switches to Pixi"
require (atSwitch.Sequence = "3") "switching to Pixi keeps the game state"

dispatch Step
dispatch (Renderer(RendererMsg.SelectBackend RendererBackend.Babylon))
dispatch (Renderer(RendererMsg.SelectBackend RendererBackend.Svg))
require (model().Renderer.Selected = RendererBackend.Svg && model().Renderer.State.Sequence = "4") "Pixi to Babylon to SVG keeps the latest state"
require (model().Renderer.State = synthetic.[3]) "the state after three switches is exactly the fourth recorded frame"

let log = List.ofSeq probe.Log
let index (entry: string) = List.findIndex ((=) entry) log
require (index "dispose svg scene" < index "mount pixi #3") "the old backend is released before the next mounts"
require (index "dispose pixi" < index "mount babylon #4") "Pixi is released before Babylon mounts"
require (log |> List.filter (fun e -> e.StartsWith "mount") |> List.length = 4) "four mounts for four selections"
require (log |> List.filter (fun e -> e.StartsWith "dispose") |> List.length = 3) "three disposals for three switches"
host.Dispose()
require (List.ofSeq probe.Log |> List.last = "dispose svg scene") "disposing the program releases the mounted backend"

// A backend that cannot start falls back to SVG with the game state intact.
let broken () =
    svgOnly () |> RendererRegistry.register (fakeAdapter RendererBackend.Babylon true)

let brokenModel, brokenDispatch, brokenHost = run (broken ()) synthetic
brokenDispatch Step
brokenDispatch (Renderer(RendererMsg.SelectBackend RendererBackend.Babylon))
require (brokenModel().Renderer.Selected = RendererBackend.Svg && brokenModel().Renderer.Status = RendererStatus.Active) "a failed Babylon mount falls back to SVG"
require (brokenModel().Renderer.State.Sequence = "2") "the fallback keeps the game state"
require (match brokenModel().Renderer.Refusal with Some(RendererRefusal.MountFailed(RendererBackend.Babylon, "no WebGL")) -> true | _ -> false) "the failure cause is reported"
brokenHost.Dispose()

printfn "bar-render checks=%d" checks
