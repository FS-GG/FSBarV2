namespace Broker.Browser.Render

open FS.GG.Game.Render
open FS.GG.UI.Scene

/// The projections every renderer backend shares: a BAR game state to an `FS.GG.UI.Scene` (`view`, which the Pixi
/// and Babylon adapters draw: rectangles, ellipses and circles), to a `RetainedScene` (`retained`, which the retained
/// SVG surface draws, with one selectable semantic object per observed unit), and to the selectable objects of the
/// interaction contract (`objects`, `interaction`). All of them are built from the same geometry, so the backends
/// show one state and a unit is where each of them draws it.
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

    /// The accessible name of one unit: its kind, team and health, for example "Own unit 77, team 0, health 80 of 100".
    val describeUnit: unit: BarUnit -> string

    /// The retained-scene projection the SVG surface draws. A unit is one selectable semantic object whose id is the
    /// unit's `Id`; the backdrop, the features and a stale veil are not selectable. The revision is the surface's
    /// to assign.
    val retained: state: BarGameState -> RetainedScene

    /// The selectable objects of a state, topmost last: the units in the order `view` draws them (radar, visual, own,
    /// each by id), each in scene coordinates around the point it is drawn at. An object's id is the unit's `Id`.
    val objects: state: BarGameState -> SelectableObject list

    /// How BAR is played through selection on every backend: `objects`, the state's `Selected` unit and
    /// `BarGameState.select`.
    val interaction: SceneInteraction<BarGameState>
