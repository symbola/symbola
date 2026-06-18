import { fc, test } from "@fast-check/vitest"
import { expect } from "vitest"
import { arrayRuntimePairKeys } from "../generatedRuntime/Array.ts"
import { selectRuntimeBackedMethods } from "../runtimeSurface/runtimeSurface.ts"
import { renderSupportedPairs } from "./renderSupportedPairs.ts"
import type { DirectFix, PipeFix, SymbolaMethod } from "./symbola.types.ts"

const propertyOptions = { numRuns: 100, seed: 0x5eed } as const

const effectModule = fc.constantFrom(
  "effect/Array",
  "effect/Effect",
  "effect/Option",
  "effect/Schema"
)

const symbolName = fc.constantFrom("annotateLogs", "filter", "flatMap", "map", "some", "succeed")

const directFix: fc.Arbitrary<DirectFix | false> = fc.oneof(
  fc.constant(false as const),
  fc.constant({ kind: "receiverFirst" } as const)
)

const pipeFix: fc.Arbitrary<PipeFix | false> = fc.oneof(
  fc.constant(false as const),
  fc.constant({ kind: "pipeOperator" } as const)
)

const methodArbitrary: fc.Arbitrary<SymbolaMethod> = fc.record({
  direct: directFix,
  effectMethod: symbolName,
  effectModule,
  implementation: fc.constantFrom("constructor", "receiverFirst"),
  pipe: pipeFix,
  symbol: symbolName
})

const uniqueMethods = fc.uniqueArray(methodArbitrary, {
  maxLength: 30,
  selector: methodKey
})

const pairKeyArbitrary = fc
  .tuple(effectModule, symbolName)
  .map(([moduleSpecifier, symbol]) => `${moduleSpecifier}:${symbol}`)

test.prop([uniqueMethods, fc.array(pairKeyArbitrary), fc.array(pairKeyArbitrary)], propertyOptions)(
  "runtime-backed method selection exactly preserves supported input methods",
  (methods, implementedKeys, generatedKeys) => {
    const supportedKeys = new Set([...implementedKeys, ...generatedKeys])
    const selected = selectRuntimeBackedMethods(
      methods,
      new Set(implementedKeys),
      new Set(generatedKeys)
    )

    expect(selected).toEqual(methods.filter((method) => supportedKeys.has(methodKey(method))))
  }
)

test.prop([uniqueMethods], propertyOptions)(
  "supported-pairs rendering is independent of input order",
  (methods) => {
    expect(renderSupportedPairs(methods)).toBe(renderSupportedPairs([...methods].reverse()))
  }
)

test.prop([uniqueMethods], propertyOptions)(
  "Array runtime exposes only supported Array module-symbol keys",
  (methods) => {
    expect([...arrayRuntimePairKeys(methods)].sort()).toEqual(
      methods
        .filter(
          (method) =>
            method.effectModule === "effect/Array" &&
            ["filter", "flatMap", "map"].includes(method.symbol)
        )
        .map(methodKey)
        .sort()
    )
  }
)

function methodKey(method: SymbolaMethod): string {
  return `${method.effectModule}:${method.symbol}`
}
