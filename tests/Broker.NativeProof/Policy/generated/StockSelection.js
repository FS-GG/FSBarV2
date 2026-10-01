
import { Union, Record } from "@fable-org/fable-library-js/Types.js";
import { union_type, record_type, float64_type, array_type, string_type } from "@fable-org/fable-library-js/Reflection.js";
import { sort, equalsWith } from "@fable-org/fable-library-js/Array.js";
import { comparePrimitives } from "@fable-org/fable-library-js/Util.js";

export class StockSelectionInput extends Record {
    constructor(Keys, ProductKind, Product, ModeKind, Mode, CaseIdKind, CaseId, CountKind, Count) {
        super();
        this.Keys = Keys;
        this.ProductKind = ProductKind;
        this.Product = Product;
        this.ModeKind = ModeKind;
        this.Mode = Mode;
        this.CaseIdKind = CaseIdKind;
        this.CaseId = CaseId;
        this.CountKind = CountKind;
        this.Count = Count;
    }
}

export function StockSelectionInput_$reflection() {
    return record_type("Broker.NativeProof.Policy.StockSelectionInput", [], StockSelectionInput, () => [["Keys", array_type(string_type)], ["ProductKind", string_type], ["Product", string_type], ["ModeKind", string_type], ["Mode", string_type], ["CaseIdKind", string_type], ["CaseId", string_type], ["CountKind", string_type], ["Count", float64_type]]);
}

export class StockSelection extends Union {
    constructor() {
        super();
        this.tag = 0;
        this.fields = [];
    }
    cases() {
        return ["StockSmokeCount1"];
    }
    static StockSmokeCount1 = new StockSelection();
}

export function StockSelection_$reflection() {
    return union_type("Broker.NativeProof.Policy.StockSelection", [], StockSelection, () => [[]]);
}

const StockSelectionModule_expectedKeys = ["caseId", "count", "mode", "product"];

export function StockSelectionModule_tryCreate(input) {
    if ((((((((equalsWith((x_1, y_1) => (x_1 === y_1), sort(input.Keys, {
        Compare: (x, y) => (comparePrimitives(x, y) | 0),
    }), StockSelectionModule_expectedKeys) && (input.ProductKind === "string")) && (input.Product === "local")) && (input.ModeKind === "string")) && (input.Mode === "pointer")) && (input.CaseIdKind === "string")) && (input.CaseId === "stock-smoke-count1")) && (input.CountKind === "number")) && (input.Count === 1)) {
        return StockSelection.StockSmokeCount1;
    }
    else {
        return undefined;
    }
}

export function StockSelectionModule_accepts(keys, productKind, product, modeKind, mode, caseIdKind, caseId, countKind, count) {
    return StockSelectionModule_tryCreate(new StockSelectionInput(keys, productKind, product, modeKind, mode, caseIdKind, caseId, countKind, count)) != null;
}
