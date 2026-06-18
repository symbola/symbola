import { describe, expect, it } from "vitest";
import type { SymbolaMethod } from "./symbola.types.ts";
import { renderSupportedPairs } from "./renderSupportedPairs.ts";

describe("renderSupportedPairs", () => {
  it("renders deterministic generated pair data", () => {
    const methods: readonly SymbolaMethod[] = [
      {
        direct: { kind: "receiverFirst" },
        effectMethod: "try",
        effectModule: "effect/Effect",
        implementation: "constructor",
        pipe: false,
        symbol: "try_",
      },
      {
        direct: false,
        effectMethod: "brand",
        effectModule: "effect/Schema",
        implementation: "receiverFirst",
        pipe: { kind: "pipeOperator" },
        symbol: "brand",
      },
    ];

    expect(renderSupportedPairs(methods)).toContain("// effect/Effect");
    expect(renderSupportedPairs(methods)).toContain("direct: receiverFirst");
    expect(renderSupportedPairs(methods)).toContain("pipe: pipeOperator");
    expect(renderSupportedPairs(methods)).toContain('symbol: "try_"');
  });
});
