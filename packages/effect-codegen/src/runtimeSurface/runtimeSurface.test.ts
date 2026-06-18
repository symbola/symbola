import { describe, expect, it } from "vitest";
import type {
  SymbolaMethod,
  SymbolaSourceFile,
} from "../supportedPairs/symbola.types.ts";
import {
  collectImplementedPairs,
  collectImplementedSymbols,
  filterImplementedPairs,
  selectRuntimeBackedMethods,
} from "./runtimeSurface.ts";

describe("collectImplementedSymbols", () => {
  it("collects declared and re-exported Symbola symbols from source text", () => {
    const files: readonly SymbolaSourceFile[] = [
      {
        path: "effect.ts",
        text: `
          export const tap: unique symbol = Symbol("Effect/tap");
          export { map, flatMap as chain } from "./Symbols.ts";
        `,
      },
    ];

    expect([...collectImplementedSymbols(files)].sort()).toEqual([
      "chain",
      "map",
      "tap",
    ]);
  });
});

describe("filterImplementedPairs", () => {
  it("keeps only generated pairs backed by implemented module-symbol pairs", () => {
    const methods: readonly SymbolaMethod[] = [
      pair("effect/Effect", "map", "map"),
      pair("effect/Effect", "annotateLogs", "annotateLogs"),
      pair("effect/Array", "some", "some"),
    ];

    expect(
      filterImplementedPairs(methods, new Set(["effect/Effect:map"])),
    ).toEqual([pair("effect/Effect", "map", "map")]);
  });
});

describe("selectRuntimeBackedMethods", () => {
  it("keeps methods backed by existing or generated runtime implementations", () => {
    const methods: readonly SymbolaMethod[] = [
      pair("effect/Effect", "map", "map"),
      pair("effect/Array", "map", "map"),
      pair("effect/Array", "some", "some"),
    ];

    expect(
      selectRuntimeBackedMethods(
        methods,
        new Set(["effect/Effect:map"]),
        new Set(["effect/Array:map"]),
      ),
    ).toEqual([
      pair("effect/Effect", "map", "map"),
      pair("effect/Array", "map", "map"),
    ]);
  });
});

describe("collectImplementedPairs", () => {
  it("maps runtime implementations to Effect module-symbol pairs", () => {
    const files: readonly SymbolaSourceFile[] = [
      {
        path: "/repo/packages/symbola/src/Array.ts",
        text: `
          abstract class ArrayProtocol<A> {
            [map]<B>(this: readonly A[], f: (value: A) => B): readonly B[] {
              return EffectArray.map(this, f);
            }
          }
        `,
      },
      {
        path: "/repo/packages/symbola/src/Constructors.ts",
        text: `
          installProperty(Object.prototype, succeed, function (this: unknown) {
            return Effect.succeed(this);
          });
          installProperty(Object.prototype, some, function (this: unknown) {
            return Option.some(this);
          });
        `,
      },
    ];

    expect([...collectImplementedPairs(files)].sort()).toEqual([
      "effect/Array:map",
      "effect/Effect:succeed",
      "effect/Option:some",
      "effect/Result:succeed",
    ]);
  });
});

function pair(module: string, method: string, symbol: string): SymbolaMethod {
  return {
    direct: { kind: "receiverFirst" },
    effectMethod: method,
    effectModule: module,
    implementation: "receiverFirst",
    pipe: { kind: "pipeOperator" },
    symbol,
  };
}
