namespace Broker.Browser.Render

open System

[<RequireQualifiedAccess>]
module BarObservationJson =

    // A small JSON reader: the same code runs under .NET and Fable, so the recorded fixtures decode identically
    // on both. Numbers keep their source text so a uint64 is never rounded.
    type private Json =
        | JNull
        | JBool of bool
        | JNumber of string
        | JString of string
        | JArray of Json list
        | JObject of (string * Json) list

    exception private Malformed of string

    let private parse (text: string) : Json =
        let mutable i = 0
        let fail message = raise (Malformed(sprintf "%s at %d" message i))

        let skip () =
            while i < text.Length && (text.[i] = ' ' || text.[i] = '\n' || text.[i] = '\r' || text.[i] = '\t') do
                i <- i + 1

        let expect (c: char) =
            skip ()

            if i < text.Length && text.[i] = c then
                i <- i + 1
            else
                fail (sprintf "expected '%c'" c)

        let literal (word: string) (value: Json) =
            if i + word.Length <= text.Length && text.Substring(i, word.Length) = word then
                i <- i + word.Length
                value
            else
                fail "unexpected token"

        let readString () =
            expect '"'
            let sb = Text.StringBuilder()
            let mutable closed = false

            while not closed do
                if i >= text.Length then
                    fail "unterminated string"

                let c = text.[i]
                i <- i + 1

                if c = '"' then
                    closed <- true
                elif c = '\\' then
                    if i >= text.Length then
                        fail "unterminated escape"

                    let e = text.[i]
                    i <- i + 1

                    match e with
                    | '"' -> sb.Append('"') |> ignore
                    | '\\' -> sb.Append('\\') |> ignore
                    | '/' -> sb.Append('/') |> ignore
                    | 'b' -> sb.Append('\b') |> ignore
                    | 'f' -> sb.Append('\012') |> ignore
                    | 'n' -> sb.Append('\n') |> ignore
                    | 'r' -> sb.Append('\r') |> ignore
                    | 't' -> sb.Append('\t') |> ignore
                    | 'u' ->
                        if i + 4 > text.Length then
                            fail "short unicode escape"

                        let code = Convert.ToInt32(text.Substring(i, 4), 16)
                        i <- i + 4
                        sb.Append(char code) |> ignore
                    | _ -> fail "unknown escape"
                else
                    sb.Append(c) |> ignore

            sb.ToString()

        let rec value () : Json =
            skip ()

            if i >= text.Length then
                fail "unexpected end"

            match text.[i] with
            | '{' ->
                i <- i + 1
                skip ()

                if i < text.Length && text.[i] = '}' then
                    i <- i + 1
                    JObject []
                else
                    let members = ResizeArray<string * Json>()
                    let mutable more = true

                    while more do
                        skip ()
                        let key = readString ()
                        expect ':'
                        // JSON.parse (the existing client's canonical decoder) keeps the LAST duplicate and other readers the
                        // first, so a duplicate key has no single meaning: it is refused.
                        if members.Exists(fun (existing, _) -> existing = key) then
                            fail (sprintf "duplicate key '%s'" key)

                        members.Add((key, value ()))
                        skip ()

                        if i < text.Length && text.[i] = ',' then
                            i <- i + 1
                        else
                            expect '}'
                            more <- false

                    JObject(List.ofSeq members)
            | '[' ->
                i <- i + 1
                skip ()

                if i < text.Length && text.[i] = ']' then
                    i <- i + 1
                    JArray []
                else
                    let items = ResizeArray<Json>()
                    let mutable more = true

                    while more do
                        items.Add(value ())
                        skip ()

                        if i < text.Length && text.[i] = ',' then
                            i <- i + 1
                        else
                            expect ']'
                            more <- false

                    JArray(List.ofSeq items)
            | '"' -> JString(readString ())
            | 't' -> literal "true" (JBool true)
            | 'f' -> literal "false" (JBool false)
            | 'n' -> literal "null" JNull
            | c when c = '-' || (c >= '0' && c <= '9') ->
                let start = i
                i <- i + 1

                while
                    i < text.Length
                    && (let d = text.[i] in (d >= '0' && d <= '9') || d = '.' || d = 'e' || d = 'E' || d = '+' || d = '-')
                    do
                    i <- i + 1

                JNumber(text.Substring(start, i - start))
            | _ -> fail "unexpected character"

        let result = value ()
        skip ()

        if i <> text.Length then
            fail "trailing content"

        result

    let private tryMember (name: string) (json: Json) : Json option =
        match json with
        | JObject members -> members |> List.tryFind (fun (key, _) -> key = name) |> Option.map snd
        | _ -> None

    let private number (json: Json) : float option =
        match json with
        | JNumber text ->
            // `float` of a string is culture-invariant on .NET and parseFloat under Fable.
            let value = (try float text with :? FormatException -> nan)
            if Double.IsNaN value then None else Some value
        | _ -> None

    // uint64 fields are decimal strings on the canonical wire form.
    let private decimalString (json: Json) : string option =
        match json with
        | JString text when text.Length > 0 && text |> Seq.forall (fun c -> c >= '0' && c <= '9') -> Some text
        | _ -> None

    let private required (what: string) (value: 'a option) : 'a =
        match value with
        | Some v -> v
        | None -> raise (Malformed what)

    let private field (name: string) (json: Json) = tryMember name json

    // The existing client's `sequence`: a decimal string that is zero or has no leading zero.
    let private checkedSequence (what: string) (json: Json) : unit =
        match json with
        | JString text when text = "0" || (text.Length > 0 && text.[0] <> '0' && text |> Seq.forall (fun c -> c >= '0' && c <= '9')) -> ()
        | _ -> raise (Malformed(sprintf "%s is invalid" what))

    let private optionalSequence (name: string) (what: string) (json: Json) : unit =
        match field name json with
        | None -> ()
        | Some value -> checkedSequence what value

    let private optionalNumber (name: string) (json: Json) : float option =
        match field name json with
        | None -> None
        | Some value -> Some(required (sprintf "%s is not a number" name) (number value))

    // A 32-bit integer field must be a whole number in range. Narrowing a float with `int` or `uint32` wraps or
    // truncates differently under .NET and Fable, so out-of-range and fractional values are refused here.
    let private optionalInteger (name: string) (low: float) (high: float) (json: Json) : float option =
        match optionalNumber name json with
        | None -> None
        | Some value when Math.Floor value = value && value >= low && value <= high -> Some value
        | Some _ -> raise (Malformed(sprintf "%s is not an integer in [%.0f, %.0f]" name low high))

    let private optionalUInt32 (name: string) (json: Json) : uint32 option =
        optionalInteger name 0.0 4294967295.0 json |> Option.map uint32

    let private optionalInt32 (name: string) (json: Json) : int option =
        optionalInteger name -2147483648.0 2147483647.0 json |> Option.map int

    let private position (json: Json) : BarPosition =
        let p = required "position is missing" (field "position" json)

        { X = required "position.x is missing" (optionalNumber "x" p)
          Elevation = optionalNumber "elevation" p
          Z = required "position.z is missing" (optionalNumber "z" p) }

    let private kind (json: Json) : BarObservationKind =
        match field "observation" json with
        | Some(JString "OBSERVATION_KIND_OWN") -> BarObservationKind.Own
        | Some(JString "OBSERVATION_KIND_VISUAL") -> BarObservationKind.Visual
        | Some(JString "OBSERVATION_KIND_RADAR") -> BarObservationKind.Radar
        | _ -> raise (Malformed "unsupported observation kind")

    let private items (name: string) (json: Json) : Json list =
        match field name json with
        | Some(JArray values) -> values
        | None -> []
        | Some _ -> raise (Malformed(sprintf "%s is not an array" name))

    let private bigId (json: Json) : string =
        required "identity is not a decimal string" (field "id" json |> Option.bind decimalString)

    let private unitOf (json: Json) : BarUnit =
        optionalSequence "generation" "unit generation" json

        { Id = bigId json
          DefinitionId = optionalUInt32 "definitionId" json
          TeamId = optionalInt32 "teamId" json
          Kind = kind json
          Position = position json
          Health = optionalNumber "health" json
          MaxHealth = optionalNumber "maxHealth" json }

    let private featureOf (json: Json) : BarFeature =
        { Id = bigId json
          DefinitionId = required "feature definitionId is missing" (optionalUInt32 "definitionId" json)
          Position = position json }

    let private resource (name: string) (json: Json) : BarResource =
        let r = required (sprintf "economy %s is missing" name) (field name json)

        { Current = optionalNumber "current" r
          Storage = optionalNumber "storage" r
          Income = optionalNumber "income" r
          Expenditure = optionalNumber "expenditure" r }

    let private economyOf (json: Json) : BarEconomy =
        { TeamId = optionalInt32 "teamId" json
          Metal = resource "metal" json
          Energy = resource "energy" json }

    let private validity (json: Json) : BarValidity =
        let v = required "validity is missing" (field "validity" json)
        optionalSequence "lastSequence" "validity sequence" v
        optionalSequence "receivedSequence" "validity sequence" v

        match field "status" v with
        | Some(JString "VALIDITY_STATUS_CURRENT") -> BarValidity.Current
        | Some(JString "VALIDITY_STATUS_STALE") -> BarValidity.Stale
        | _ -> raise (Malformed "unsupported validity status")

    let private text (name: string) (json: Json) : string =
        match field name json with
        | Some(JString s) -> s
        | None -> ""
        | Some _ -> raise (Malformed(sprintf "%s is not a string" name))

    let private observationOf (json: Json) : BarGameState =
        { SessionId = text "sessionId" json
          Sequence = required "sequence is not a decimal string" (field "sequence" json |> Option.bind decimalString)
          CapturedAtUnixMs = text "capturedAtUnixMs" json
          PerspectiveId = text "perspectiveId" json
          Validity = validity json
          Units = items "units" json |> List.map unitOf
          Features = items "features" json |> List.map featureOf
          Economy = field "teamEconomy" json |> Option.map economyOf
          Selected = None }

    let decode (json: string) : Result<BarGameState, string> =
        try
            let root = parse json
            // A server envelope carries the observation under its own name; a bare observation does not.
            let observation =
                match field "observation" root with
                | Some(JObject _ as inner) when (field "units" root).IsNone -> inner
                | _ -> root

            Ok(observationOf observation)
        with
        | Malformed message -> Error message
        | :? FormatException as e -> Error e.Message

    // --- Bootstrap ------------------------------------------------------------------------------------------------

    let private expectText (name: string) (expected: string) (json: Json) =
        match field name json with
        | Some(JString actual) when actual = expected -> ()
        | _ -> raise (Malformed "unsupported game, protocol, or browser profile")

    let private nonBlank (name: string) (json: Json) : string =
        match field name json with
        | Some(JString text) when text <> "" -> text
        | _ -> raise (Malformed "bootstrap identity or read-only mode is missing")

    let private positiveInteger (name: string) (json: Json) : int =
        match optionalInteger name 1.0 2147483647.0 json with
        | Some value -> int value
        | None -> raise (Malformed "bootstrap limits are invalid")

    let private bootstrapOf (json: Json) : BarBootstrap =
        expectText "game" "bar" json
        expectText "protocolVersion" "1.0.0" json
        expectText "profile" "barc-preview-v1" json
        let session = nonBlank "sessionId" json
        let perspective = nonBlank "perspectiveId" json

        match field "mode" json with
        | Some(JString "PREVIEW_MODE_READ_ONLY") -> ()
        | _ -> raise (Malformed "bootstrap identity or read-only mode is missing")

        validity json |> ignore

        match field "limits" json with
        | Some limits ->
            positiveInteger "maxFrameBytes" limits |> ignore

            { SessionId = session
              PerspectiveId = perspective
              MaxEntities = positiveInteger "maxEntities" limits }
        | None -> raise (Malformed "bootstrap limits are invalid")

    let decodeBootstrap (json: string) : Result<BarBootstrap, string> =
        try
            let root = parse json

            let bootstrap =
                match field "bootstrap" root, field "initialize" root with
                | Some(JObject _ as inner), _ when (field "game" root).IsNone -> inner
                | _, Some(JObject _ as inner) when (field "game" root).IsNone -> inner
                | _ -> root

            Ok(bootstrapOf bootstrap)
        with
        | Malformed message -> Error message
        | :? FormatException as e -> Error e.Message
