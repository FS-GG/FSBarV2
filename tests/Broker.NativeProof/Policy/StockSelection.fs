namespace Broker.NativeProof.Policy

type StockSelectionInput =
    { Keys: string array
      ProductKind: string
      Product: string
      ModeKind: string
      Mode: string
      CaseIdKind: string
      CaseId: string
      CountKind: string
      Count: float }

type StockSelection =
    private
    | StockSmokeCount1

module StockSelection =
    let private expectedKeys = [| "caseId"; "count"; "mode"; "product" |]

    let tryCreate input =
        if Array.sort input.Keys = expectedKeys
           && input.ProductKind = "string"
           && input.Product = "local"
           && input.ModeKind = "string"
           && input.Mode = "pointer"
           && input.CaseIdKind = "string"
           && input.CaseId = "stock-smoke-count1"
           && input.CountKind = "number"
           && input.Count = 1.0 then
            Some StockSmokeCount1
        else
            None

    let accepts keys productKind product modeKind mode caseIdKind caseId countKind count =
        { Keys = keys
          ProductKind = productKind
          Product = product
          ModeKind = modeKind
          Mode = mode
          CaseIdKind = caseIdKind
          CaseId = caseId
          CountKind = countKind
          Count = count }
        |> tryCreate
        |> Option.isSome
