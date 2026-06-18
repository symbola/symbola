import { describe, expect, it } from "vitest";
import type { SymbolaMethod } from "../supportedPairs/symbola.types.ts";
import { arrayRuntimePairKeys, renderArrayRuntime } from "./Array.ts";

describe("renderArrayRuntime", () => {
  it("renders the Array protocol module without importing other domains", () => {
    const output = renderArrayRuntime([
      method("effect/Array", "map", "map"),
      method("effect/Effect", "map", "map"),
    ]);

    expect(output).toContain('import * as EffectArray from "effect/Array"');
    expect(output).toContain(
      'export { filter, flatMap, map } from "../../Symbols.ts"',
    );
    expect(output).toContain(
      "Effect.runSync(install(ArrayProtocol.prototype, Array.prototype))",
    );
    expect(output).not.toContain('effect/Stream"');
  });

  it("rejects input without supported Array runtime methods", () => {
    expect(() =>
      renderArrayRuntime([method("effect/Array", "some", "some")]),
    ).toThrow("No supported Array runtime methods were generated");
  });

  it("exposes generated module-symbol keys for safety filtering", () => {
    expect([
      ...arrayRuntimePairKeys([
        method("effect/Array", "map", "map"),
        method("effect/Array", "some", "some"),
        method("effect/Effect", "map", "map"),
      ]),
    ]).toEqual(["effect/Array:map"]);
  });
});

function method(
  effectModule: string,
  effectMethod: string,
  symbol: string,
): SymbolaMethod {
  return {
    direct: { kind: "receiverFirst" },
    effectMethod,
    effectModule,
    implementation: "receiverFirst",
    pipe: { kind: "pipeOperator" },
    symbol,
  };
}
