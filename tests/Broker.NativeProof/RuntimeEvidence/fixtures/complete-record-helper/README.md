# Sanitized complete-record mechanical fixture

This fixture contains the same bounded filesystem and process mechanics used by the
complete-record correspondence gate. The gate copies the Python files to a temporary
mode-local directory and generates `source-manifest.json` from the checked-out commit and
tree. It contains no game payload, credential, private packet, runtime grant, or accepted
native observation. The fixture can only produce synthetic growing-log and policy inputs.


RP1 adds `buffered_writer.py`: public atlas message bodies verified against
Recoil `2639eedac7d1fd67d793ec93ebd27f014f336a14`, ordinary libc `fopen("w")`,
`setvbuf(NULL, _IOFBF, 8192)` and `fprintf("%s\n")`. The libc implementation
may choose a smaller effective buffer, exactly as stock FileSink permits. Tests
use acknowledged writes and held writer FDs, with no fabricated transcript.
`python3 -m unittest -v test_buffered_writer` runs the public mechanical controls
without .NET. The real compiled policy growth controls run in the coherent gate.

On a failed `consume`, the actual adapter retains
`infolog-mechanical-<boundary>.json` and its `.receipt.json` in the validated
attempt root, mode 0600, exclusive creation. The <=4096-byte observation contains
only closed categories, counters, byte lengths, sample hash and monotonic elapsed
microseconds; the receipt binds its filename, bytes/hash and source-set hash.
No raw log, path, process identity or exception text is included. A read-call cap
is per exact-read operation; aggregate calls across probes can exceed 160.
`sampleSha256`, complete-prefix/tail lengths describe the last fully checked
retained sample; requested/read-in-operation counts describe the current read.
`settlementBudgetMicroseconds` is the frozen relative budget, or null for direct
mechanical probes. This sidecar is separate mechanical evidence and never
acceptance authority. Failed publication preserves the original exception and
sets its retention flag false; absent/unjoined receipt is an evidence gap.
The existing typed F# failure diagnostic schema and settlement semantics remain
unchanged. The subsequent user-selected budget is 10 MiB raw, 16 MiB encoded,
and 160 calls per exact read; record/probe/evaluation/deadline bounds are unchanged.
Source-only RP1 does not authorize another native attempt;
RP2 contract qualification and RP3 capacity evidence remain required.


RP2 transports the entire raw sample, including an unfinished tail, to the real compiled F# classifier. Repeated unchanged pending observations consume the shared probe budget without inventing new policy evaluations. Newly observed bytes require reevaluation; the helper never classifies atlas/root text. The final size observation occurs after the full-prefix reread and repeated permanent custody checks, before closure completion and receipt release. The returned `v3` state names its exact consumed horizon and finite L interval; later producer bytes require the next boundary's fresh evaluation.

The stable owning correspondence entrypoint now collects 14 successor scenarios. It includes an actual libc full-buffered writer with a nonempty atlas tail and a later boundary extending that exact prefix. Generated scenario modules import the byte-exact production `GrowingLogEvidence.qnt`; every ordered projection is asserted against its canonical actions and checked by the real F# reader/reducer. Private synthetic transcripts and dynamic ITFs are qualification artifacts, not public or native acceptance evidence.
