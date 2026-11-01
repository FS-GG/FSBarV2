namespace Broker.Browser.Render

/// Deterministic synthetic observations, for a client with no live session. The native chain
/// (Coordination#1032 and #4842) does not yet deliver live state, so these stand in for it.
[<RequireQualifiedAccess>]
module BarSynthetic =

    /// The session id every synthetic frame carries.
    val sessionId: string

    /// `count` frames with sequences 1..count. Two own units march across the map, one visual contact and one
    /// radar blip drift, and three features stay put. The same arguments always give the same frames.
    val frames: count: int -> BarGameState list
