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

// --- Integer fields: .NET and Fable narrow out-of-range numbers differently, so the decoder refuses them -------

let unitWith (extra: string) =
    sprintf
        """{"sessionId":"s","sequence":"1","perspectiveId":"p","validity":{"status":"VALIDITY_STATUS_CURRENT","lastSequence":"1"},"units":[{"id":"5","observation":"OBSERVATION_KIND_OWN","position":{"x":1,"z":2}%s}],"features":[]}"""
        extra

let featureWith (definition: string) =
    sprintf
        """{"sessionId":"s","sequence":"1","perspectiveId":"p","validity":{"status":"VALIDITY_STATUS_CURRENT","lastSequence":"1"},"units":[],"features":[{"id":"5","definitionId":%s,"position":{"x":1,"z":2}}]}"""
        definition

let integerProbes =
    [ "unit definitionId -1", unitWith ""","definitionId":-1"""
      "unit definitionId 4294967296", unitWith ""","definitionId":4294967296"""
      "unit definitionId 1.5", unitWith ""","definitionId":1.5"""
      "unit teamId 2.7", unitWith ""","teamId":2.7"""
      "unit teamId 2147483648", unitWith ""","teamId":2147483648"""
      "unit teamId -2147483649", unitWith ""","teamId":-2147483649"""
      "feature definitionId -1", featureWith "-1"
      "feature definitionId 4294967296", featureWith "4294967296"
      "feature definitionId 0.5", featureWith "0.5" ]

for (name, json) in integerProbes do
    require (BarObservationJson.decode json |> Result.isError) (name + " is refused")

let boundary = BarObservationJson.decode (unitWith ""","definitionId":4294967295,"teamId":-2147483648""")
require (match boundary with Ok s -> s.Units.Head.DefinitionId = Some 4294967295u && s.Units.Head.TeamId = Some -2147483648 | _ -> false) "the int32 and uint32 limits are accepted exactly"
require ((BarObservationJson.decode (featureWith "4294967295") |> Result.map (fun s -> s.Features.Head.DefinitionId)) = Ok 4294967295u) "a feature definition at the uint32 limit is accepted"

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

// --- The broker's stale observation ------------------------------------------------------------------------------
// Gateway.fs `envelope`: a `Snapshot.Stale` is a ServerEnvelope whose Observation has the session, the LAST sequence
// and a stale validity, and nothing else: no units, no features, no economy, no perspective, no capture time.

let brokerStale (sequence: string) =
    sprintf
        """{"body":"observation","observation":{"sessionId":"ABEiM0RVZneImaq7zN3u/w==","sequence":"%s","validity":{"status":"VALIDITY_STATUS_STALE","lastSequence":"%s","receivedSequence":"9007199254740999","detail":"feed expired"}}}"""
        sequence
        sequence

let decodedStale = BarObservationJson.decode (brokerStale "9007199254740993")
require (match decodedStale with Ok s -> s.Validity = BarValidity.Stale && s.Units.IsEmpty && s.PerspectiveId = "" && s.Sequence = "9007199254740993" | _ -> false) "the broker's stale shape decodes: stale, no units, empty perspective"

let live, _ = BarClient.update (ObserveJson(fixture "observation-asymmetric")) empty0
require (live.Renderer.State.Validity = BarValidity.Current && live.Presented = 1) "the current observation is presented first"

let veiled, veilEffects = BarClient.update (ObserveJson(brokerStale "9007199254740993")) live
require (veiled.Rejected.IsEmpty) "the equal-sequence stale transition is not refused"
require (veiled.Renderer.State.Validity = BarValidity.Stale && veiled.Renderer.State.Sequence = "9007199254740993") "the presented state turns stale at the same sequence"
require (veiled.Renderer.State.Units = live.Renderer.State.Units && veiled.Renderer.State.Features = live.Renderer.State.Features) "the prior units and features are retained"
require (veiled.Renderer.State.PerspectiveId = "team-7" && veiled.Renderer.State.Economy = live.Renderer.State.Economy) "the prior perspective and economy are retained"
require (match veilEffects with [ RendererEffect.Present(RendererBackend.Svg, s) ] -> s.Validity = BarValidity.Stale | _ -> false) "the stale state is presented on the mounted backend"
require (BarScene.view veiled.Renderer.State <> BarScene.view live.Renderer.State) "the stale state is veiled"

let again, againEffects = BarClient.update (ObserveJson(brokerStale "9007199254740993")) veiled
require (againEffects.IsEmpty && again.Rejected.Length = 1) "a second equal-sequence stale frame is a replay and is refused"

let wrongSession = brokerStale "9007199254740993" |> fun json -> json.Replace("ABEiM0RVZneImaq7zN3u/w==", "other")
let other, _ = BarClient.update (ObserveJson wrongSession) live
require (other.Renderer.State.Validity = BarValidity.Stale && other.Renderer.State.Units.IsEmpty) "a stale frame of a different session is a new session, not a transition"

let ahead, _ = BarClient.update (ObserveJson(brokerStale "9007199254740995")) live
require (ahead.Renderer.State.Units.Length = 3 && ahead.Renderer.State.Sequence = "9007199254740995") "a later stale sequence with no entities keeps the units and takes the sequence"

let behind, behindEffects = BarClient.update (ObserveJson(brokerStale "9007199254740990")) live
require (behindEffects.IsEmpty && behind.Rejected.Length = 1) "a stale frame behind the presented sequence is refused"

let recovered, _ = BarClient.update (ObserveJson(fixture "observation-asymmetric" |> fun j -> j.Replace("9007199254740993", "9007199254740997"))) veiled
require (recovered.Renderer.State.Validity = BarValidity.Current && recovered.Renderer.State.Sequence = "9007199254740997") "a later current observation recovers from stale"

let lateCurrent, lateEffects = BarClient.update (Observe live.Renderer.State) veiled
require (lateEffects.IsEmpty && lateCurrent.Rejected.Length = 1) "an equal-sequence current frame does not undo stale"

// --- Selection: BAR units are selectable objects of the interaction contract ------------------------------------

let objectsOf = BarScene.objects first
require (objectsOf.Length = first.Units.Length) "every observed unit is one selectable object"
require (BarScene.objects first = BarScene.objects { first with Units = List.rev first.Units }) "the selectable objects do not depend on input order"
require (SceneInteraction.problems objectsOf = []) "the selectable objects are valid for the interaction contract"
require (objectsOf |> List.map _.Id |> List.sort = (first.Units |> List.map _.Id |> List.sort)) "an object's id is the unit's id"
require (objectsOf |> List.map _.Label |> List.forall (fun label -> label.Contains "unit")) "every object carries an accessible label"

let ownUnit = first.Units |> List.find (fun u -> u.Kind = BarObservationKind.Own)
let ownCentre = BarScene.toViewport ownUnit.Position
require (SceneInteraction.hitTest ownCentre objectsOf = Some ownUnit.Id) "a point on a unit hits that unit"
require (SceneInteraction.hitTest { X = 0.0; Y = 0.0 } objectsOf = None) "a point on empty ground hits nothing"
require ((BarScene.describeUnit ownUnit).StartsWith "Own unit ") "an own unit is labelled as one"

let selectedFirst = BarGameState.select (SelectionRequest.Select ownUnit.Id) first
require (selectedFirst.Selected = Some ownUnit.Id) "selecting an observed unit selects it"
require (BarGameState.select (SelectionRequest.Select "999999") first = first) "selecting an unobserved unit changes nothing"
require ((BarGameState.select SelectionRequest.Clear selectedFirst).Selected = None) "Clear empties the selection"
require (BarScene.view selectedFirst <> BarScene.view first) "the canvas scene shows the selection"
require ((BarScene.retained selectedFirst).Layers = (BarScene.retained first).Layers) "the retained scene leaves the selection to the surface"
require (SceneInteraction.selected BarScene.interaction selectedFirst = Some ownUnit.Id) "the interaction reads the state's selection"
require (SceneInteraction.apply BarScene.interaction (SelectionRequest.Select ownUnit.Id) first = selectedFirst) "the interaction applies BAR's own rule"

let retainedObjects = (BarScene.retained first).Layers |> List.collect (fun layer -> layer.Objects)
require (retainedObjects |> List.filter _.Selectable |> List.map _.Id |> List.sort = (first.Units |> List.map _.Id |> List.sort)) "exactly the units are selectable in the retained scene"
require (retainedObjects |> List.filter (fun o -> o.Selectable) |> List.forall (fun o -> o.AccessibleLabel <> "")) "every selectable object is labelled"
require (match SvgRetained.tryCreateInteraction (BarScene.retained first) with Ok _ -> true | Error _ -> false) "the retained scene is accepted by the retained interaction"

let carried = BarGameState.carrySelection selectedFirst synthetic.[1]
require (carried.Selected = Some ownUnit.Id) "the selection follows its unit into the next observation"
require ((BarGameState.carrySelection selectedFirst { synthetic.[1] with Units = [] }).Selected = None) "the selection is dropped when its unit is no longer observed"

let clientSelected, selectEffects = BarClient.update (Select(SelectionRequest.Select ownUnit.Id)) model0
require (clientSelected.Renderer.State.Selected = Some ownUnit.Id && selectEffects.Length = 1) "the client presents a selection like any new state"
let clientRepeat, repeatEffects = BarClient.update (Select(SelectionRequest.Select ownUnit.Id)) clientSelected
require (repeatEffects.IsEmpty && clientRepeat.Renderer.State = clientSelected.Renderer.State && clientRepeat.Presented = clientSelected.Presented) "selecting the selected unit presents nothing"
let clientRefused, refusedEffects = BarClient.update (Select(SelectionRequest.Select "999999")) clientSelected
require (refusedEffects.IsEmpty && clientRefused.Renderer.State.Selected = Some ownUnit.Id) "an unobserved unit leaves the selection"
let clientStepped, _ = BarClient.update Step clientSelected
require (clientStepped.Renderer.State.Selected = Some ownUnit.Id && clientStepped.Renderer.State.Sequence = "2") "the selection survives the next observation"
let clientNewSession, _ = BarClient.update (Observe otherSession) clientSelected
require (clientNewSession.Renderer.State.Selected = None) "a new session starts with nothing selected"
let liveSelected, _ = BarClient.update (Select(SelectionRequest.Select "77")) live
let staleSelected, _ = BarClient.update (ObserveJson(brokerStale "9007199254740993")) liveSelected
require (liveSelected.Renderer.State.Selected = Some "77" && staleSelected.Renderer.State.Validity = BarValidity.Stale && staleSelected.Renderer.State.Selected = Some "77") "the stale veil keeps the selection"

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

// --- Cross-runtime digest ----------------------------------------------------------------------------------------
// A canonical text of every decoded value, hashed with FNV-1a 64. .NET and the Fable-emitted code both print it, and
// the gate compares the two outputs, so a value the two runtimes decode differently cannot hide behind equal counts.

let private optional (render: 'a -> string) (value: 'a option) =
    match value with
    | Some v -> render v
    | None -> "-"

let private position (p: BarPosition) =
    sprintf "%s,%s,%s" (string p.X) (optional string p.Elevation) (string p.Z)

let private resource (r: BarResource) =
    sprintf "%s/%s/%s/%s" (optional string r.Current) (optional string r.Storage) (optional string r.Income) (optional string r.Expenditure)

let canonical (state: BarGameState) : string =
    let units =
        state.Units
        |> List.map (fun u ->
            sprintf "u%s:%s:%s:%A:%s:%s:%s" u.Id (optional string u.DefinitionId) (optional string u.TeamId) u.Kind (position u.Position) (optional string u.Health) (optional string u.MaxHealth))

    let features =
        state.Features |> List.map (fun f -> sprintf "f%s:%s:%s" f.Id (string f.DefinitionId) (position f.Position))

    let economy =
        optional (fun (e: BarEconomy) -> sprintf "%s;%s;%s" (optional string e.TeamId) (resource e.Metal) (resource e.Energy)) state.Economy

    sprintf "%s|%s|%s|%s|%A|%s|%s|%s" state.SessionId state.Sequence state.CapturedAtUnixMs state.PerspectiveId state.Validity (String.Join(",", units)) (String.Join(",", features)) economy

let outcome (result: Result<BarGameState, string>) =
    match result with
    | Ok state -> "ok " + canonical state
    | Error reason -> "error " + reason

let digest (lines: string list) : string =
    let mutable hash = 14695981039346656037UL

    for line in lines do
        for c in line + "\n" do
            hash <- (hash ^^^ uint64 c) * 1099511628211UL

    hash.ToString("x16")

let corpus =
    [ for name in [ "observation-asymmetric"; "observation-optional-absent"; "observation-optional-present-zero"; "observation-unknown-field"; "observation-unknown-enum"; "guest-observation" ] ->
          name + " " + outcome (BarObservationJson.decode (fixture name))
      for (name, json) in integerProbes -> name + " " + outcome (BarObservationJson.decode json)
      yield "boundary " + outcome boundary
      yield "stale " + outcome decodedStale
      for state in BarSynthetic.frames 3 -> "synthetic " + canonical state ]

let corpusDigest = digest corpus

// The digest must see a one-value divergence, such as the one the lenient decoder showed: `definitionId -1` was
// `Some 0u` on .NET and `Some 4294967295u` on Fable.
let divergent =
    corpus
    |> List.map (fun line -> if line.StartsWith "boundary" then line.Replace("4294967295", "0") else line)

require (divergent <> corpus && digest divergent <> corpusDigest) "the digest changes when one decoded value differs between runtimes"
require (digest (List.rev corpus) <> corpusDigest) "the digest depends on order"
require (digest corpus = corpusDigest && corpusDigest.Length = 16) "the digest is stable and sixteen hex digits"

printfn "bar-render digest=%s over=%d" corpusDigest corpus.Length
printfn "bar-render checks=%d" checks
