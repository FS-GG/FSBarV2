namespace Broker.Browser.Render

/// Decodes the canonical JSON form of a barc.browser.v1 `Observation` into the BAR game-state type.
///
/// This is the form `decodeServerFrame` in the existing client yields and the form the shared fixture corpus
/// (`fixtures/barc-browser/semantic`) records: uint64 values are decimal strings, enums are their proto names,
/// absent optional fields are absent. A server envelope (`{"body":"observation","observation":{...}}`) is
/// accepted as well as a bare observation.
[<RequireQualifiedAccess>]
module BarObservationJson =

    /// Decode one observation. An unknown enum value, a missing required field or malformed JSON is an
    /// `Error`; unknown fields are ignored, as the wire decoder does. The result is not yet `validate`d.
    val decode: json: string -> Result<BarGameState, string>
