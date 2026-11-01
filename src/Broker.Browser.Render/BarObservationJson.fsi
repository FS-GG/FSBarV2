namespace Broker.Browser.Render

/// Decodes the canonical JSON form of a barc.browser.v1 `Observation` into the BAR game-state type.
///
/// This is the form `decodeServerFrame` in the existing client yields and the form the shared fixture corpus
/// (`fixtures/barc-browser/semantic`) records: uint64 values are decimal strings, enums are their proto names,
/// absent optional fields are absent. A server envelope (`{"body":"observation","observation":{...}}`) is
/// accepted as well as a bare observation.
[<RequireQualifiedAccess>]
module BarObservationJson =

    /// Decode one observation. An unknown enum value, a missing required field, malformed JSON, or an
    /// `int32`/`uint32` field (`teamId`, `definitionId`) that is fractional or outside its range is an
    /// `Error` (the same on .NET and Fable, which narrow out-of-range numbers differently); unknown fields are ignored, as the wire decoder does. A duplicate key in one JSON object is an `Error`, because
    /// the readers disagree about which duplicate wins; a `validity.lastSequence`, `validity.receivedSequence` or unit
    /// `generation` that is not a decimal string without leading zeros is an `Error` too. The result is not yet
    /// `validate`d.
    val decode: json: string -> Result<BarGameState, string>

    /// Decode the session's bootstrap (a bare `Bootstrap`, a server envelope with `body` `bootstrap`, or the
    /// `initialize` request that carries one) with the existing client's `validateBootstrap` rules: the `bar` game,
    /// protocol `1.0.0` and profile `barc-preview-v1`, a session, a perspective, the read-only mode, a valid
    /// validity and positive integer limits.
    val decodeBootstrap: json: string -> Result<BarBootstrap, string>
