namespace Broker.Browser.Render

[<RequireQualifiedAccess>]
module BarSynthetic =

    let sessionId = "AAECAwQFBgcICQoLDA0ODw=="

    let private at x z : BarPosition =
        { X = x
          Elevation = None
          Z = z }

    let private resource current : BarResource =
        { Current = Some current
          Storage = Some 1000.0
          Income = Some 7.5
          Expenditure = None }

    let private frame (step: int) : BarGameState =
        let t = float step

        { SessionId = sessionId
          Sequence = string (step + 1)
          CapturedAtUnixMs = string (1770000000000L + int64 step * 100L)
          PerspectiveId = "team-0"
          Validity = BarValidity.Current
          Units =
            [ { Id = "1"
                DefinitionId = Some 501u
                TeamId = Some 0
                Kind = BarObservationKind.Own
                Position = at (-120.0 + 4.0 * t) (-40.0 + 1.5 * t)
                Health = Some 800.0
                MaxHealth = Some 800.0 }
              { Id = "2"
                DefinitionId = Some 502u
                TeamId = Some 0
                Kind = BarObservationKind.Own
                Position = at (-100.0 + 3.0 * t) (30.0 - 2.0 * t)
                Health = Some(800.0 - 5.0 * t)
                MaxHealth = Some 800.0 }
              { Id = "3"
                DefinitionId = Some 601u
                TeamId = Some 1
                Kind = BarObservationKind.Visual
                Position = at (90.0 - 2.0 * t) (20.0 + 1.0 * t)
                Health = None
                MaxHealth = None }
              { Id = "4"
                DefinitionId = None
                TeamId = None
                Kind = BarObservationKind.Radar
                Position = at (150.0 - 3.0 * t) (-60.0 + 2.0 * t)
                Health = None
                MaxHealth = None } ]
          Features =
            [ { Id = "10"
                DefinitionId = 909u
                Position = at -20.0 -30.0 }
              { Id = "11"
                DefinitionId = 909u
                Position = at 40.0 50.0 }
              { Id = "12"
                DefinitionId = 910u
                Position = at 10.0 -80.0 } ]
          Economy =
            Some
                { TeamId = Some 0
                  Metal = resource (42.5 + 7.5 * t)
                  Energy = resource 3000.0 }
          Selected = None }

    let frames (count: int) : BarGameState list = [ for step in 0 .. count - 1 -> frame step ]
