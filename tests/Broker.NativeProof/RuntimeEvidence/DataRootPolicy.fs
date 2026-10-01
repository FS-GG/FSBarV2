namespace FSBar.NativeProof.RuntimeEvidence

open System
open System.IO
open System.Text
open System.Text.RegularExpressions

type RootDecision =
    | RootAccepted of roots: string list * writeRoot: string
    | RootPending of reason: string
    | RootRefused of reason: string

module DataRootPolicy =
    let private rootPattern = Regex(@"^(?:\[f=[0-9]+\]\s+\[t=[^\]\r\n]+\]\s+)?\[DataDirLocater::FilterUsableDataDirs\] using (?:read-write|read-only) data directory: (.+)$", RegexOptions.CultureInvariant)
    let private writePattern = Regex(@"^(?:\[f=[0-9]+\]\s+\[t=[^\]\r\n]+\]\s+)?\[DataDirLocater::FindWriteableDataDir\] using writeable data-directory ""([^""]+)""$", RegexOptions.CultureInvariant)
    let private isolationPattern = Regex(@"^(?:\[f=[0-9]+\]\s+\[t=[^\]\r\n]+\]\s+)?\[DataDirLocater::Check\] Isolation Mode!$", RegexOptions.CultureInvariant)

    let private canonical (value: string) =
        if String.IsNullOrWhiteSpace value || not (Path.IsPathFullyQualified value) then None
        else
            let normalized = Path.GetFullPath(value).TrimEnd(Path.DirectorySeparatorChar)
            if normalized.Contains("..", StringComparison.Ordinal) || normalized.Length > 4096 then None else Some normalized

    let evaluate expectedWriteRoot expectedDataRoot (sample: byte array) =
        if isNull sample || sample.Length = 0 || sample.Length > 4 * 1024 * 1024 then RootRefused "custody-or-bound"
        elif sample[sample.Length - 1] <> byte '\n' then RootPending "incomplete-record"
        elif Array.contains 0uy sample then RootRefused "nul-record"
        else
            try
                let text = UTF8Encoding(false, true).GetString sample
                let lines = text.Split('\n', StringSplitOptions.None) |> Array.take (text.Split('\n').Length - 1)
                if lines.Length > 65536 then RootRefused "record-bound"
                else
                    let mutable isolated = false
                    let mutable refused = None
                    let roots = ResizeArray<string>()
                    let writes = ResizeArray<string>()
                    for raw in lines do
                        let line = raw.TrimEnd('\r')
                        if isolationPattern.IsMatch line then isolated <- true
                        let rootMatch = rootPattern.Match line
                        if rootMatch.Success then
                            match canonical rootMatch.Groups[1].Value with
                            | Some value -> roots.Add value
                            | None -> refused <- Some "noncanonical-root"
                        let writeMatch = writePattern.Match line
                        if writeMatch.Success then
                            match canonical writeMatch.Groups[1].Value with
                            | Some value -> writes.Add value
                            | None -> refused <- Some "noncanonical-write-root"
                    match refused, canonical expectedWriteRoot, canonical expectedDataRoot with
                    | Some reason, _, _ -> RootRefused reason
                    | _, Some writeRoot, Some dataRoot when writeRoot <> dataRoot ->
                        let expected = Set [ writeRoot; dataRoot ]
                        let observed = Set roots
                        if not isolated then RootPending "isolation-record-absent"
                        elif observed <> expected then RootRefused "data-root-drift"
                        elif writes.Count = 0 then RootPending "write-root-record-absent"
                        elif writes |> Seq.exists ((<>) writeRoot) then RootRefused "contradictory-write-root"
                        else RootAccepted(List.ofSeq observed, writeRoot)
                    | _ -> RootRefused "invalid-expected-roots"
            with
            | :? DecoderFallbackException -> RootRefused "invalid-utf8"
            | :? IOException -> RootRefused "path-normalization"
            | :? UnauthorizedAccessException -> RootRefused "path-normalization"
            | :? ArgumentException -> RootRefused "path-normalization"
