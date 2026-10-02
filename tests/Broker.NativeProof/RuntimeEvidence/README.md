# BAR growing infolog runtime evidence

This qualification-local .NET 10 executable owns the typed policy for one authenticated,
held Recoil `infolog.txt` descriptor. `DataRootPolicy` recognizes only the source-grounded
`DataDirLocater::Check`, `FilterUsableDataDirs`, and `FindWriteableDataDir` records. It
requires isolation mode, exactly the configured write and read roots, and one consistent
write root across the entire observed prefix.
The accepted engine record prefix is exactly Recoil 2639's timestamp-first
`[t=HH:MM:SS.ffffff] ` form with its optional adjacent seven-digit
`[f=0000000]` component. Other bracketed or embedded prefixes are ignored as
evidence. Lexical `.` and `..` path segments are refused before normalization.

`GrowingLogEvidence` reduces `Acquire → Sample → Validate(boundary) → Consume(boundary)`.
Every appended revision needs fresh validation for BrowserAdmission, Normalization, or
Release. Prefix mutation, truncation, producer/log/source identity drift, contradictory
root history, and unavailable observations revoke the scope irreversibly.

The private adapter settles bounded raw candidates, including an unfinished tail,
under one frozen deadline and shared probe/evaluation budgets. F# derives the
complete-prefix/tail split and classifies the actual bytes. An unchanged pending
horizon uses another probe without another policy evaluation; each newly
observed horizon needs a fresh evaluation. The canonical Quint model includes
these effects and the final read/size/release interval. Current correspondence
uses fourteen actual helper scenarios; the predecessor vectors remain separate
historical controls. Boundary entry alone resets the 32-probe budget. No
candidate or historical consumption grants reusable authority.

Hosted `dotnet test` runs this gate through the test project's `VSTest` target. With no
external helper configured, the gate copies the committed sanitized mechanical fixture to
a temporary directory and creates its manifest from the checked-out `HEAD` and tree. It
requires Quint 0.32.0, locked NuGet restore, all 38 named model scenarios, 14 predecessor ITFs, the
compiled correspondence replay, and duplicate, reordered, and prior-state mutations.
The `complete-record-source` workflow checks out the exact pull-request head or manually
selected commit, installs Quint from its integrity-locked tool manifest, selects .NET SDK
10.0.401, and enters this same `CI=true` target with read-only repository permissions.
Model tests, simulations, and ITF generation select Quint's TypeScript backend explicitly,
so the gate does not download an evaluator. The public correspondence fixture copies the
selected host and framework into an owner-private, link-free runtime tree before pinning
its physical identities; writable-mode and same-bytes replacement controls must still fail.

Before it reads a request, the executable accepts only
`--closure-manifest PATH --closure-sha256 HEX --invocation-id ID`. It verifies an exact
five-file managed census, exact provenance census, PDB-embedded SourceLink, source identity
objects, product role graph and source-set digest, locked build inputs, toolchain receipt,
and decoded helper head/tree. The build receipt joins all of those identities to the five
managed outputs. It also verifies the complete selected hostfxr and shared-framework
directory census, five distinct runtime roles, the loaded managed assembly locations,
host/framework version parents, native-library search directories, and every observed
filesystem-backed mapping with device, inode, ownership, mode and hash. Every semantic
JSON object rejects duplicate properties before projection.
It emits a ready envelope, evaluates one request, rechecks the same closure, and emits a
completed envelope bound to the same digest and invocation. Bounds are 1 MiB for the
manifest, 1024 files, 1 GiB aggregate, 256 MiB per file, 4096 directories or immediate
directory entries per census, 4 MiB of proc maps, and 1024 distinct file-backed mapping
paths. Enumeration caps are enforced while traversing, before sorting or materialization.

The v3 closure and v3 growing-log request/result carry apphost, complete-closure, and configured
product source-set joins.
A closure change on a retained growing-log scope is sticky invalid. The final child step
rereads and rehashes the manifest, every file, every directory census and actual mappings.
The disposable fixture uses owner-private directories and read-only checkpoint modes. This
is a bounded observed checkpoint, not a claim that mode 0444 bytes owned by the invoking UID
are immutable against that owner. Root adoption must supply its separate concurrency and
filesystem trust decision.

The private Python adapter remains responsible only for Linux descriptor/process custody,
bounded exact-length reads, prefix comparison, invoking this pinned executable, and closing
its held FD. The F# CLI receives bounded JSON through stdin and returns a closed decision
and state without returning log bytes. It does not receive credentials in argv or output.
The adapter pumps request and response pipes concurrently in nonblocking mode under one
frozen deadline, incrementally caps response bytes, and retires the exact policy child on
timeout, broken input, early exit, or malformed output. The deadline is checked between
filesystem operations and after the final census; it is not a hard interrupt for an
arbitrarily stalled filesystem call or a general descendant-tree guarantee.
The policy transport accepts `accepted` only with a fully joined `validated`
candidate for the exact requested boundary, identity, revision, byte count and
digest. The held-FD adapter releases a named consumed horizon only after the
final read/size/closure checks. Pending, refused and unknown states cannot be
promoted by a contradictory response.

The same executable also projects a bounded post-handoff failure observation through
`fsbar.barc-stock-failure-projection/v1`. The projection accepts only the closed
mechanical checkpoint and outcome enums, an optional compatible fixed F# checkpoint,
the exact source-set/apphost/closure pins, and the exact bounded bytes and digest of a
closed failed operation result. F# enforces the category/outcome/policy-observation
relation and the closed optional runtime-map failure-code variant. Its
runtime failure codes are joined to their exact validation, executable-map, or final-generation
checkpoint group. Its
only positive status is `observed-failure`; `nativeAcceptance` is always false. Invalid,
duplicate, inconsistent, oversized, or unknown input becomes the fixed
`diagnostic-unavailable` result without echoing caller data. The executable writes at
most one fixed `{schema,checkpoint,kind}` observation to stderr. This diagnostic stream
does not replace the ready/completed protocol or authorize a boundary.

Post-policy infolog custody failures retain fixed, sanitized checkpoints for scope,
producer identity, path and parent custody, named and retained-descriptor identity,
file custody, the 10 MiB size cap, size regression, and prefix read or comparison.
The earlier aggregate `infolog-final-refresh` value remains decodable for existing
receipts. Writer census and match failures keep their existing specific checkpoints.
No path, log bytes, exception text, or other private runtime value enters the
diagnostic projection, and these classifications do not change growing-log authority.

`GrowingLogEvidence.qnt` independently models the cached revision protocol. The committed
healthy and negative ITF traces are generated by Quint 0.32.0, normalized only to remove volatile timestamp
data, decoded with FsQuint 0.1.0, and compared to the production reducer. The
correspondence fingerprints hash the actual model, reducer sources, compiled
assembly, and Quint executable bytes. Action mapping is:

| Quint action | Production reducer |
| --- | --- |
| `acquire` | `GrowingLogEvidence.acquire` |
| `sampleInitial`, `benignAppend` | `GrowingLogEvidence.sample` |
| `beginPolicy`, `readyPolicy`, `evaluatedPolicy`, `completePolicy` | `PolicyComposition` transitions used by the executable; inner validation is speculative until the same-child final closure completes |
| `validate:<boundary>` | `GrowingLogEvidence.validate` |
| `consume:<boundary>` | external `GrowingLogEvidence.consume`, reachable only after `PolicyComposition.finishGuard` |
| mutation/unavailable actions | refused or unknown sticky transitions |
| `close` | `GrowingLogEvidence.close` |

Run `tests/check-runtime-evidence.sh`. The gate also checks the policy apphost, DLL,
dependency manifest, runtime configuration, and FSharp.Core closure and prints their
SHA-256 values for the adopting runner. The model is bounded and sampled. It does not prove
OS provenance, absence of an unobserved rewrite-and-restore, atomicity with browser work,
future append behavior, owned-role cleanup, Count1, or native acceptance.

### Log budget selected on 2026-10-02

The user selected a 10 MiB raw infolog cap for the next qualification, to be
revisited against the actual workload. Encoded policy requests permit 16 MiB to
carry Base64 plus metadata. Each exact read permits 160 calls of up to 64 KiB,
sufficient for the full admitted raw sample. The 65,536-record ceiling, 32
settlement probes, three policy evaluations and five-second deadline remain
separate bounds. Sustained atlas logging can still exhaust these budgets.
The capacity change does not fix partial-record or continuously growing-file
semantics; qualified artifacts and private helper placement need rebuilding
before a native attempt uses it.


## RP2 complete prefix and retained raw tail

The successor growing-log request/result schema is `v3`; the existing current-process invocation frame remains `v2`. Installed predecessor artifacts remain separate. The codec derives the exact raw, complete LF prefix and unfinished tail descriptors from the supplied bytes and rechecks the entire previous raw prefix, including unfinished bytes. Complete records retain the anchored stock root/write/isolation grammar. Missing required complete evidence is pending; contradictions, NUL and malformed UTF-8 refuse. A truncated UTF-8 scalar is pending.

A nonempty tail is eligible only after the complete optional stock timestamp/frame prefix and exact `CTextureRenderAtlas::CreateAtlasTexture()[0] atlas=` or `[1] atlas=` discriminator; the remainder must be ASCII without LF, CR or NUL. Unknown, relevant or short discriminators remain pending. Every observed byte remains in custody. This rule does not promise progress for an indefinitely growing or unknown tail.

F# policy completion returns a **candidate**, without consumed authority. The helper rereads the complete raw horizon, rechecks permanent producer/path/writer changes during that reread, then takes the held-FD size observation L. Any observed growth requires a fresh F# evaluation within the same frozen deadline, shared probes and three evaluations. The receipt binds read-start/read-end/L/release offsets, the exact raw/P/T horizon, boundary and attempt. Release must precede the frozen deadline. Writes after L remain unvalidated; the next boundary resamples from zero. No reusable authority survives consumption. These observed checks do not detect an adversarial ABA between reads or prove future freshness.

The 27 named predecessor witnesses and 14 regenerated ITFs remain historical canonical-model/typed-reducer controls. The current gate requires 11 successor witnesses, actual libc held-FD controls, 14 actual framed F#/helper scenarios, parameterized runs importing the unchanged canonical model, and full modeled-state/ordered-effect joins. The dynamic runs contain fixture constants and expected observed projections, never alternate transition definitions. Semantic mutants exercise omitted/reordered/duplicate candidates, component hashes, invented L, stale terminal, frozen-budget renewal and missing observed-growth revocation.

This window changes source only; qualification requires the gate above. RP3 capacity measurement, RP4 protected executable/engine/plugin custody, RP5 a changed native Count1 and all six useful-play journeys remain independent owner gates. The installed495/2639 failed packet is unchanged.
