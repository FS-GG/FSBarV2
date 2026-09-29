# BARC-01.4 live-control native qualification

The final local cohort passed six fresh-host journeys against the same joined
FSBar and HighBar source trees. It covers the local product and the generated
Fable-game receiver through pointer, independently operated keyboard, and
separately built custom-guest paths. This report records the sanitized cohort;
raw envelopes, credentials, parent/input identities, engine logs, and game
assets remain private.

The accepted cohort manifest uses schema
`barc.final-native-six-accepted-cohort/v1` and has SHA-256
`4177782b98312d4bbeb15b819d2f29b7d79d0ce6510a406a439722b1b26c0d0b`.
Each journey used a fresh Protocol host and engine, recorded the live capability
report, confirmed the owned-actor and visual-target gates, loaded the mapped
plugin bytes below, and shut down all processes. The six retained manifests
cover 78 hash-verified files.

## Qualified identities

These identities are independent pins. The receiver archive was built from the
earlier immutable UI/component set and does not imply that every component came
from the final broker source commit. A path-restricted comparison found no
client or guest byte changes between component source `d7fecb42` and final
FSBar source `698dacd8`.

| Role | Version or source | SHA-256 or tree |
| --- | --- | --- |
| FSBar joined source | `698dacd8deba1fd20b31057f66068ee7d72894b7` | tree `3b47f8ad89b7cf14f9ae9339270adeffa92e3a90` |
| FSBar delivered source | [PR #5](https://github.com/FS-GG/FSBarV2/pull/5), merge `f1a18c52246b88e958344cb3bcc87f3c2035a62e` | tree `51140c912b0cc58f7b795094fce3eb4712eee963` |
| HighBar qualified source | `488d57f67a48fc90ef8c6415f032c14ce75289fa` | tree `0c5d8b0d25ad759d502903c53f8ca4c0546a0cd1` |
| HighBar delivered source | [PR #2](https://github.com/FS-GG/HighBarV3/pull/2), merge `680b62480bfb60a19b3591b7250e03787e1f93d1` | tree `0c5d8b0d25ad759d502903c53f8ca4c0546a0cd1` |
| Live native contract | `live_control.proto` | `34e37fd62bcac2758cb6383deae34d3523cb40ce3470034b1fb2ee2ba3bbc240` |
| Browser live schema | `barc_live.proto` | `0094b7dc893e6bf264a271b296cda005f77e75edd29af40683a6c29698e7b533` |
| Frozen legacy coordinator contract | unchanged | `b8d3f56494564a8628a20ffdcc2ac7e42a0508f8f1162bcc87ee6c0f6b7c3c1d` |
| NativeProof assembly | joined Release build | `ceaedc336154ee5515dfa092a95ddaea2d1fb387b6c9ffc5e85ea4dc36c0e4ba` |
| HighBar plugin | mapped in every journey | `7785e4de7989665213abb5a933663ea9a00e4e0b7ca098615b72dd638fec650b` |
| Recoil engine | `2025.06.19` | `e4f63c1a391f9ddfbb4d1da225d9533b1d56c65133687d036422a7380c84e833` |
| BAR game package | `test-29926-0571aa8` | `58ca71d252e89e844361293e3b6b0aa2fb29fd217094b83e2a8f51ed1541f250` |
| Passive qualification game overlay | `HighBar BARC Live Fixture 1` | `a9224f2389273dc35eaac8074aa25421eeca406fdd32bb4da34d54cbf04c93f5` |
| Map | `Avalanche 3.4` | `3873260c6b5e533490598488eab3ff0b6587c778aee60cbb71186938dfaee426` |
| Start script | identical in all six journeys | `c5d2d1cbaef370996ba6ab7edcdee7a62d1876a103c5dba98d4ee94bfa99b9e6` |
| Client JavaScript | component source `d7fecb42ca88e78d336de040c51bc88a99d371fd` | `836d0978e36f372b8ee910326d75b264134106589a74ec94dfc73ad012b6cdff` |
| Manual Rust guest | Rust 1.90 locked build | `5b80d40ea02ee2b719849154f3cde950d9e32c98d2fa64c56cba3bb1437acd45` |
| Independent custom Rust guest | Rust 1.90 locked build | `ad5e93fb64177b16784e76b29d220609d05766227bb737e069fc3046f907b686` |
| Generated-receiver archive | immutable component set | `c1ddfb349d4ce90e23c3e098075818b09b508db96e2d94187643b7e5fc251c5d` |

The native scenario disabled built-in behavior and used an owned mobile actor
with lifetime `1` and a visible target with lifetime `1`, initial health `280`,
and no autonomous orders. The values above `2^53` are qualified by contract,
codec, and unit tests; the actual engine assigned lifetime `1`, so this cohort
does not claim an engine-produced value above JavaScript's safe integer range.

## Six accepted journeys

The four manual journeys each accepted five actions and 15 ordered result
stages. The two custom-guest journeys each accepted one action and three ordered
stages. In total, 23 browser submissions produced 22 accepted actions and 66
ordered `BrokerAdmission → NativeAdmission → NativeDispatch` stages. No accepted
journey had an active-browser stale observation or a rejected native stage.

| Journey | Accepted actions/stages | Retained private manifest SHA-256 | Retained private outcome SHA-256 |
| --- | ---: | --- | --- |
| Local pointer | 5 / 15 | `89f124e4c73233c08193472daa9c23d2aa815375ff52c269fe89c9fae5c3f0fe` | `f2e1050bcf546114c5f151fd42d170455968fb2a255a2690ebdd8821c7a37ed0` |
| Local keyboard | 5 / 15 | `8d2146ffac530110560b69c189bca18dedbbf1d1985f063e19543251bf532341` | `74f7b25d0cba91d87b282424cf0baf6e0285ebf30024b724fc85b4ef8bbc8ddc` |
| Local custom guest | 1 / 3 | `01b0126fe896903b2298f923289a4a4852c1912f668e627445a0e6b1ab7777fb` | `a9e7992e7f60cfc0ab3ceb6a5d9d36268adb4e847db7de969bf9ebd7e293d605` |
| Generated pointer | 5 / 15 | `8495f41e5dce4a9f2a1db1fa72c0f28f8ef4b277e14c3265decb9feafede2b88` | `f576ba94abf50b91912d4d0ca5b75903f2081b1b48f76098e5805185bd6fb3da` |
| Generated keyboard | 5 / 15 | `158f5b73b2f18c93ab8d6fe3d6f67e132de07ae717e2a59589246f545eab295f` | `5980029fd66f97bc616a5f9eb9b2e210a702548a0ae52a296c648bd3b49f82e8` |
| Generated custom guest | 1 / 3 | `397597a9ea1efe8235010cea4f5e7f228de6706467532992281ce6e2456962e5` | `0f8a4c79a933b9a97188d32ce27bd889f1e3e49cbe36dcebb89f46b4a6e75c8f` |

The manual journeys observed replace Move displacement, append Move retaining
the first destination ahead of the appended destination and then progressing to
the second, Stop clearing an in-progress order, and selected Attack reducing
the identified target from health `280` to observed minima `4.662665`,
`1.2176943`, `2.8911939`, and `3.3435063` across the four manual journeys. The
custom guest independently changed an APPEND manual input into a REPLACE Move
and produced the later native effect.
Its Move left the controlled target at health `280`, as expected. All accepted
actions crossed the guest, browser, broker, native admission, and engine-dispatch
boundaries.

The local keyboard journey also exercised the expected stale-display race. One
submission based on observation `56` received a recorded broker rejection; a
new parent/input on current observation `58` succeeded on the same WebSocket.
The refused parent emitted no native command. This is the cohort's twenty-third
submission and is separate from the 22 accepted actions.

## Timings and bounded scope

Times below come from the accepted browser envelope/stage traces. They use
nearest-rank p95 and millisecond timestamp precision.

| Interval | n | Median | p95 | Maximum |
| --- | ---: | ---: | ---: | ---: |
| Visible pair click to paired UI | 6 | 37 ms | 41 ms | 41 ms |
| Explicit manual arm click to native-confirmed UI | 4 | 27.5 ms | 78 ms | 78 ms |
| Broker admission result to native admission result | 22 | 0 ms | 2 ms | 4 ms |
| Native admission result to native dispatch result | 22 | 12.5 ms | 32 ms | 34 ms |
| Native dispatch result to next current observation | 22 | 486.5 ms | 838 ms | 918 ms |

The last interval records the next truthful current observation; it is not a
claim that every action's full effect completed by that observation. `APPLIED`
means the engine call occurred, not that the game or a late-game workload
completed.

The live profile accepts at most 64 distinct actors per guest intention and
expands them into one fenced native command per actor. Native unit IDs are
bounded to `0..31999`, including legal ID `0`; actor and target lifetimes are
present nonzero `uint64` values. Stop and replace Move use native options `0`;
append Move is semantic at the guest boundary and maps to installed SHIFT bit
`32`; selected Attack requires a currently owned actor and currently visual,
lifetime-matched target at final dispatch. Guest input/output and browser frames
retain their 64 KiB bounds. This cohort uses one actor per action and does not
claim late-game or 64-actor native capacity.

Two preliminary driver attempts are excluded: generated pointer attempt J4-a
serialized a queue burst, and generated keyboard attempt J5-a retained a
relative cursor target. Their retained private adjudication hashes are respectively
`a7d9e64b8a368087473588d17c71dc3140fd9f93a6699ef7e09748642adaa9eb`
and `a50c4cc8e0cf9467f0d68fb8e90a5e27cf63467914a7f570d57a88a95cbe4e9d`.
The corrected J4-b and J5-b journeys are the rows accepted above.

## Delivery status

Local native qualification and paired source delivery are complete. HighBar PR #2 merged at
`2026-09-29T04:10:54Z`; a fresh fetch verified selected `master` at merge
`680b62480bfb60a19b3591b7250e03787e1f93d1`, whose tree exactly matches the
qualified native tree. FSBar PR #5 merged at `2026-09-29T04:19:53Z`; a fresh
fetch verified selected `main` at merge
`f1a18c52246b88e958344cb3bcc87f3c2035a62e`. Its tree differs from the qualified
runtime tree because it adds this roadmap and evidence report; a source
comparison verified the application, contracts, and tests are identical to
qualified source `698dacd8deba1fd20b31057f66068ee7d72894b7`. BARC-01.4a–.4f are complete.
The forks currently provide no hosted checks or branch protection; all checks
represented here are local. Public BAR publication, installed-fleet support,
and upstream adoption remain `.7` work.

Telemetry was not configured for this work. Native collaboration usage and
efficiency remain unknown; no counts are inferred from the 66 result stages.
