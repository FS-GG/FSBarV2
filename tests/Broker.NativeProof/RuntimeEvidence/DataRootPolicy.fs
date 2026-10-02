namespace FSBar.NativeProof.RuntimeEvidence

open System
open System.IO
open System.Text
open System.Text.RegularExpressions
open System.Security.Cryptography

type RootDecision =
    | RootAccepted of roots: string list * writeRoot: string
    | RootPending of reason: string
    | RootRefused of reason: string

type PrefixEvidence = {
    RawBytes: int64; RawSha256: string
    CompleteBytes: int64; CompleteSha256: string
    TailBytes: int64; TailSha256: string
    CompleteRecords: int; TailClass: string
}

module DataRootPolicy =
    // Recoil 2639 FramePrefixer.cpp emits the timestamp first and the optional
    // seven-digit frame immediately after it.  Keep this grammar anchored: an
    // arbitrary bracketed prefix must never turn unrelated text into evidence.
    let private prefix = @"(?:\[t=[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{6}\](?:\[f=[0-9]{7}\])? )?"
    let private rootPattern = Regex("^" + prefix + @"\[DataDirLocater::FilterUsableDataDirs\] using (?:read-write|read-only) data directory: (.+)$", RegexOptions.CultureInvariant)
    let private writePattern = Regex("^" + prefix + @"\[DataDirLocater::FindWriteableDataDir\] using writeable data-directory ""([^""]+)""$", RegexOptions.CultureInvariant)
    let private isolationPattern = Regex("^" + prefix + @"\[DataDirLocater::Check\] Isolation Mode!$", RegexOptions.CultureInvariant)

    let private canonical (value: string) =
        let lexical = if isNull value then [||] else value.Split([|'/'; '\\'|], StringSplitOptions.None)
        if String.IsNullOrWhiteSpace value || not (Path.IsPathFullyQualified value) ||
           lexical |> Array.exists (fun part -> part = "." || part = "..") then None
        else
            let normalized = Path.GetFullPath(value).TrimEnd(Path.DirectorySeparatorChar)
            if normalized.Length > 4096 then None else Some normalized

    // Validate the entire raw horizon. Only a well-formed but unfinished final
    // UTF-8 scalar is pending; malformed bytes cannot hide behind partial EOF.
    let private utf8Status (raw: byte array) =
        let mutable index = 0
        let mutable status = "valid"
        while index < raw.Length && status = "valid" do
            let first = int raw[index]
            let width = if first < 128 then 1 elif first >= 194 && first <= 223 then 2 elif first >= 224 && first <= 239 then 3 elif first >= 240 && first <= 244 then 4 else 0
            if width = 0 then status <- "invalid"
            else
                let available = min width (raw.Length - index)
                for offset in 1 .. available - 1 do
                    let value = int raw[index + offset]
                    if value < 128 || value > 191 ||
                       (offset = 1 && ((first = 224 && value < 160) || (first = 237 && value > 159) || (first = 240 && value < 144) || (first = 244 && value > 143))) then status <- "invalid"
                if status = "valid" && available < width then status <- "partial"
                index <- index + width
        status

    let private atlasTail = Regex("^" + prefix + @"CTextureRenderAtlas::CreateAtlasTexture\(\)\[[01]\] atlas=[\x01-\x09\x0b\x0c\x0e-\x7f]*$", RegexOptions.CultureInvariant)
    let private hash (sample: byte array) offset count = SHA256.HashData(ReadOnlySpan<byte>(sample,offset,count)) |> Convert.ToHexStringLower
    let describe (sample: byte array) =
        if isNull sample || sample.Length > 10 * 1024 * 1024 then invalidArg "sample" "custody-or-bound"
        let cut = (sample |> Array.tryFindIndexBack ((=) (byte '\n')) |> Option.defaultValue -1) + 1
        let tail = ReadOnlySpan<byte>(sample,cut,sample.Length-cut)
        let tailClass =
            if Array.contains 0uy sample then "refused-nul"
            else
                match utf8Status sample with
                | "invalid" -> "refused-utf8"
                | "partial" -> "pending-utf8"
                | _ when tail.Length = 0 -> "empty"
                | _ when (tail.ToArray() |> Array.forall (fun value -> value <= 127uy && value <> 0uy && value <> byte '\r' && value <> byte '\n')) && atlasTail.IsMatch(Encoding.ASCII.GetString tail) -> "atlas"
                | _ -> "pending"
        { RawBytes=int64 sample.Length; RawSha256=hash sample 0 sample.Length; CompleteBytes=int64 cut; CompleteSha256=hash sample 0 cut
          TailBytes=int64 tail.Length; TailSha256=hash sample cut tail.Length; CompleteRecords=sample |> Array.sumBy (fun value -> if value=byte '\n' then 1 else 0); TailClass=tailClass }

    let private evaluateComplete expectedWriteRoot expectedDataRoot (sample: byte array) =
        if sample.Length = 0 then RootPending "complete-prefix-absent"
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
                        elif not (Set.isSubset observed expected) then RootRefused "data-root-drift"
                        elif observed <> expected then RootPending "data-root-record-absent"
                        elif writes.Count = 0 then RootPending "write-root-record-absent"
                        elif writes |> Seq.exists ((<>) writeRoot) then RootRefused "contradictory-write-root"
                        else RootAccepted(List.ofSeq observed, writeRoot)
                    | _ -> RootRefused "invalid-expected-roots"
            with
            | :? DecoderFallbackException -> RootRefused "invalid-utf8"
            | :? IOException -> RootRefused "path-normalization"
            | :? UnauthorizedAccessException -> RootRefused "path-normalization"
            | :? ArgumentException -> RootRefused "path-normalization"

    let evaluate expectedWriteRoot expectedDataRoot (sample: byte array) =
        if isNull sample || sample.Length > 10 * 1024 * 1024 then RootRefused "custody-or-bound"
        else
            let horizon = describe sample
            match horizon.TailClass with
            | "refused-nul" -> RootRefused "nul-record"
            | "refused-utf8" -> RootRefused "invalid-utf8"
            | _ ->
                // Complete contradictions take precedence over an unfinished
                // tail; no later tail classification can erase them.
                let decision = evaluateComplete expectedWriteRoot expectedDataRoot sample[0 .. int horizon.CompleteBytes - 1]
                match decision, horizon.TailClass with
                | RootRefused _, _ -> decision
                | _, "pending-utf8" -> RootPending "incomplete-utf8"
                | _, "pending" -> RootPending "incomplete-record"
                | _ -> decision
