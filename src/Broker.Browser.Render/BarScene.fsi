namespace Broker.Browser.Render

open FS.GG.UI.Scene

/// The projection every renderer backend shares: a BAR game state to an `FS.GG.UI.Scene`. SVG draws it through
/// the retained SVG surface; the Pixi and Babylon adapters draw the same Scene's rectangles, ellipses and
/// circles, so the three backends show one state.
[<RequireQualifiedAccess>]
module BarScene =

    /// The scene is drawn in a fixed 800 by 520 viewport, matching the existing preview's viewBox.
    val width: float
    val height: float

    /// Where a world position falls in the viewport: x = 400 + 2 * X, y = 260 + 2 * Z. These are the existing
    /// preview's `coordinates` and the inverse of its ground-target pick, so pointer picking can be shared.
    val toViewport: position: BarPosition -> Point

    /// The Scene for a state: a backdrop, then features, radar blips, visual contacts and own units in a fixed
    /// order (by id within a layer) so equal states give equal scenes. A stale state is veiled.
    val view: state: BarGameState -> Scene

    /// A one-line description of the state for an accessible label.
    val describe: state: BarGameState -> string
