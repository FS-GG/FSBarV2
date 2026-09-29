module Broker.Browser.Codec.Tests.Program

open System
open Fable.Core
open Fable.Core.JsInterop
open Broker.Browser.Codec.Tests.CodecAdapter

[<Import("readFileSync", "node:fs")>]
let readFileSync (path: string) : obj = jsNative

[<Import("readFileSync", "node:fs")>]
let readText (path: string) (encoding: string) : string = jsNative

let corpusRoot = "../../fixtures/barc-browser"
let manifest = parseJson (readText $"{corpusRoot}/manifest.json" "utf8")
let cases = property manifest "cases"

let mutable absent: obj option = None
let mutable zero: obj option = None
let mutable asymmetric: obj option = None
let mutable decodeExceptions = 0
let mutable oversizedBoundaryObserved = false
let mutable unknownEnumPreserved = false
let mutable unknownEnvelopeBodyAbsent = false
let mutable decoded = 0

let require condition message =
    if not condition then
        failwith message

for index in 0 .. length cases - 1 do
    let item = property cases (string index)
    let name = stringProperty item "name"
    let expected = stringProperty item "expected"
    let wirePath = stringProperty item "wire"
    let bytes = readFileSync $"{corpusRoot}/{wirePath}"

    if name = "oversized-frame" then
        require (length bytes = 65537) "oversized fixture lost its 65537-byte boundary"
        oversizedBoundaryObserved <- true
    elif name = "malformed-varint" || name = "truncated-observation" then
        let mutable rejected = false

        try
            decode name bytes |> ignore
        with _ ->
            rejected <- true

        require rejected $"{name} was accepted by the Fable-imported protobuf codec"
        decodeExceptions <- decodeExceptions + 1
    else
        let canonical = decode name bytes

        if hasOwn item "semantic" then
            let semanticPath = stringProperty item "semantic"
            let expectedSemantic =
                readText $"{corpusRoot}/{semanticPath}" "utf8"
                |> parseJson

            require (json canonical = json expectedSemantic) $"{name} semantic projection drifted"

            let reencoded = reencode name canonical
            let roundTripped = decode name reencoded
            require (json roundTripped = json canonical) $"{name} did not retain semantic parity after re-encode"

            if name <> "observation-unknown-field" then
                require (bytesEqual reencoded bytes) $"{name} changed canonical wire bytes"

        match name with
        | "observation-optional-absent" -> absent <- Some canonical
        | "observation-optional-present-zero" -> zero <- Some canonical
        | "observation-asymmetric" -> asymmetric <- Some canonical
        | "observation-unknown-field" ->
            let baseBytes = readFileSync $"{corpusRoot}/wire/observation-asymmetric.bin"
            require (bytesEqual (reencode name canonical) baseBytes) "unknown fields were not dropped on re-encode"
        | "observation-unknown-enum" ->
            let observation = property canonical "observation"
            let unit = property (property observation "units") "0"
            require (numberProperty unit "observation" = 99.0) "unknown enum value was not preserved"
            unknownEnumPreserved <- true
        | "unknown-envelope-wire" ->
            require (not (hasOwn canonical "body")) "unknown envelope acquired a fabricated body"
            unknownEnvelopeBodyAbsent <- true
        | _ -> ()

        decoded <- decoded + 1

let absentValue = absent |> Option.defaultWith (fun () -> failwith "absent optional fixture was not decoded")
let zeroValue = zero |> Option.defaultWith (fun () -> failwith "explicit-zero optional fixture was not decoded")
let asymmetricValue = asymmetric |> Option.defaultWith (fun () -> failwith "asymmetric fixture was not decoded")

let absentObservation = property absentValue "observation"
let absentUnit = property (property absentObservation "units") "0"
let absentPosition = property absentUnit "position"
require (stringProperty absentObservation "sequence" = "9007199254740993") "uint64 sequence crossed the JS safe-integer boundary"
require (not (hasOwn absentUnit "teamId")) "absent unit team identity became zero"
require (not (hasOwn absentPosition "elevation")) "absent elevation became zero"
require (not (hasOwn absentObservation "teamEconomy")) "absent team economy was fabricated"
require (stringProperty absentUnit "observation" = "OBSERVATION_KIND_RADAR") "radar observation kind drifted"

let zeroObservation = property zeroValue "observation"
let zeroUnit = property (property zeroObservation "units") "0"
let zeroPosition = property zeroUnit "position"
let zeroEconomy = property zeroObservation "teamEconomy"
require (hasOwn zeroUnit "teamId" && numberProperty zeroUnit "teamId" = 0.0) "explicit zero unit team identity was lost"
require (hasOwn zeroPosition "elevation" && numberProperty zeroPosition "elevation" = 0.0) "explicit zero elevation was lost"
require (hasOwn zeroUnit "health" && numberProperty zeroUnit "health" = 0.0) "explicit zero health was lost"
require (hasOwn zeroEconomy "teamId" && numberProperty zeroEconomy "teamId" = 0.0) "explicit zero economy team identity was lost"

let observation = property asymmetricValue "observation"
let units = property observation "units"
let features = property observation "features"
let own = property units "0"
let radar = property units "2"
let feature = property features "0"
let ownPosition = property own "position"
require (length units = 3 && length features = 1) "unit/feature collections drifted"
require (stringProperty own "id" = "77" && stringProperty feature "id" = "77") "shared unit/feature uint64 identity drifted"
require (stringProperty radar "observation" = "OBSERVATION_KIND_RADAR") "radar entity was not retained"
require (numberProperty ownPosition "x" = 11.25 && numberProperty ownPosition "elevation" = 403.5 && numberProperty ownPosition "z" = -37.5) "XYZ axes were reordered"
let economy = property observation "teamEconomy"
let energy = property economy "energy"
require (numberProperty energy "current" = 0.0 && numberProperty energy "storage" = 5000.0) "team economy values drifted"
require (decodeExceptions = 2) "malformed/truncated decoder exception count drifted"
require oversizedBoundaryObserved "oversized fixture boundary was not observed"
require unknownEnumPreserved "unknown enum compatibility case was not observed"
require unknownEnvelopeBodyAbsent "unknown envelope compatibility case was not observed"

// The additive tactical profile uses the same generated protobuf.js adapter.
// Native-only highbar.v1 entries are qualified by the producer/consumer proto
// build and are intentionally excluded from this browser decoder pass.
let liveCorpusRoot = "../../fixtures/barc-live"
let liveManifest = parseJson (readText $"{liveCorpusRoot}/manifest.json" "utf8")
let liveEntries = property liveManifest "entries"
let mutable tacticalCases = 0
for index in 0 .. length liveEntries - 1 do
    let item = property liveEntries (string index)
    let name = stringProperty item "name"
    let typeName = stringProperty item "type"
    if not (typeName.StartsWith("highbar.")) then
        let bytes = readFileSync $"{liveCorpusRoot}/wire/{name}.bin"
        let canonical = decodeAs typeName bytes
        let expected = parseJson (readText $"{liveCorpusRoot}/semantic/{name}.json" "utf8")
        require (json canonical = json expected) $"{name} tactical semantic projection drifted"
        require (bytesEqual (reencodeAs typeName canonical) bytes) $"{name} tactical wire bytes drifted"
        if name = "tactical-observation" then
            let observation = property canonical "observation"
            let tactical = property observation "tactical"
            let featureRef = property (property (property tactical "features") "0") "reference"
            let queue = property (property (property (property tactical "actors") "0") "queue") "0"
            require (not (hasOwn featureRef "id")) "legal feature id zero acquired a nonzero scalar"
            require (stringProperty featureRef "lifetime" = "9007199254741017") "feature lifetime lost uint64 precision"
            require (stringProperty queue "revision" = "9007199254741015") "queue revision lost uint64 precision"
        elif name = "tactical-guest-unknown-action-response" then
            let intent = property canonical "intent"
            let queueEdit = property intent "queueEdit"
            let insert = property queueEdit "insert"
            require (numberProperty insert "action" = 99.0) "unknown tactical action was not retained for fail-closed validation"
        tacticalCases <- tacticalCases + 1

printfn "Fable codec: %d preview and %d live/tactical semantic cases; %d malformed/truncated decoder exceptions; 65537-byte boundary observed; unknown enum preserved; unknown envelope projected without a body; 64-bit/optional/XYZ/radar/features/economy parity passed" decoded tacticalCases decodeExceptions
