import { describe, expect, it } from "vitest"
import type { EffectExport, EffectModuleSurface, SignatureInfo } from "../effectSurface/effect.types.ts"
import { buildCandidate, buildSymbolaMethods } from "./candidates.ts"

describe("buildCandidate", () => {
  it("accepts direct receiver-first calls", () => {
    const candidate = buildCandidate(
      effectExport({
        method: "map",
        signatures: [
          signature({
            parameters: [{ name: "self", type: "Effect<A, E, R>" }]
          })
        ]
      }),
      "effect/Effect"
    )

    expect(candidate.inferred.direct).toEqual({ kind: "receiverFirst" })
    expect(candidate.policy).toMatchObject({
      accepted: true,
      acceptedReasons: ["direct-domain-receiver"]
    })
  })

  it("accepts curried domain receiver operators", () => {
    const candidate = buildCandidate(
      effectExport({
        method: "brand",
        signatures: [
          signature({
            parameters: [{ name: "identifier", type: "B" }],
            returnCallSignatures: [
              {
                parameters: [{ name: "schema", type: "Schema<A, I, R>" }],
                returnType: "Schema<A & Brand<B>, I, R>"
              }
            ],
            returnType: "<S extends Schema<A, I, R>>(schema: S) => Schema<A & Brand<B>, I, R>"
          })
        ]
      }),
      "effect/Schema"
    )

    expect(candidate.inferred.pipe).toEqual({ kind: "pipeOperator" })
    expect(candidate.policy).toMatchObject({
      accepted: true,
      acceptedReasons: ["pipe-domain-receiver"]
    })
  })

  it("does not treat arbitrary callable return values as pipe operators", () => {
    const candidate = buildCandidate(
      effectExport({
        initKind: "const",
        method: "makeOrder",
        signatures: [
          signature({
            parameters: [{ name: "O", type: "Order<A>" }],
            returnCallSignatures: [
              {
                parameters: [
                  { name: "self", type: "readonly A[]" },
                  { name: "that", type: "readonly A[]" }
                ],
                returnType: "Ordering"
              }
            ],
            returnType: "Order<readonly A[]>"
          })
        ]
      }),
      "effect/Array"
    )

    expect(candidate.inferred.pipe).toBe(false)
    expect(candidate.policy.accepted).toBe(false)
  })

  it("rejects is-prefixed predicate helpers even when receiver-first", () => {
    const candidate = buildCandidate(
      effectExport({
        method: "isSome",
        signatures: [
          signature({
            parameters: [{ name: "self", type: "Option<A>" }],
            returnType: "boolean"
          })
        ]
      }),
      "effect/Option"
    )

    expect(candidate.inferred.direct).toEqual({ kind: "receiverFirst" })
    expect(candidate.policy).toMatchObject({
      accepted: false,
      rejectedReasons: ["predicate-guard-name"]
    })
  })

  it("accepts constructor-style functions that return the module domain", () => {
    const candidate = buildCandidate(
      effectExport({
        initKind: "member:internal.succeed",
        method: "succeed",
        signatures: [
          signature({
            parameters: [{ name: "value", type: "A" }],
            returnType: "Effect<A, never, never>"
          })
        ]
      }),
      "effect/Effect"
    )

    expect(candidate.inferred).toMatchObject({
      direct: { kind: "receiverFirst" },
      pipe: false,
      reasons: ["domain-constructor"]
    })
    expect(candidate.policy).toMatchObject({
      accepted: true,
      acceptedReasons: ["direct-domain-constructor"]
    })
  })

  it("uses local export names for renamed protocol symbols", () => {
    const candidate = buildCandidate(
      effectExport({
        localName: "try_",
        method: "try",
        signatures: [
          signature({
            parameters: [{ name: "evaluate", type: "() => A" }],
            returnType: "Effect<A, UnknownException>"
          })
        ]
      }),
      "effect/Effect"
    )

    expect(candidate.symbol).toBe("try_")
  })

  it("builds accepted generated pairs without current-pair input", () => {
    expect(
      buildSymbolaMethods([
        surface("effect/Effect", [
          effectExport({
            initKind: "member:internal.succeed",
            method: "succeed",
            signatures: [
              signature({
                parameters: [{ name: "value", type: "A" }],
                returnType: "Effect<A, never, never>"
              })
            ]
          }),
          effectExport({
            method: "map",
            signatures: [
              signature({
                parameters: [{ name: "self", type: "Effect<A, E, R>" }]
              })
            ]
          }),
          effectExport({
            method: "isEffect",
            signatures: [
              signature({
                parameters: [{ name: "self", type: "Effect<A, E, R>" }],
                returnType: "boolean"
              })
            ]
          })
        ])
      ])
    ).toEqual([
      {
        direct: { kind: "receiverFirst" },
        effectMethod: "succeed",
        effectModule: "effect/Effect",
        implementation: "constructor",
        pipe: false,
        symbol: "succeed"
      },
      {
        direct: { kind: "receiverFirst" },
        effectMethod: "map",
        effectModule: "effect/Effect",
        implementation: "receiverFirst",
        pipe: { kind: "pipeOperator" },
        symbol: "map"
      }
    ])
  })
})

function surface(module: string, exports: readonly EffectExport[]): EffectModuleSurface {
  return { module, exports }
}

function effectExport(overrides: Partial<EffectExport>): EffectExport {
  return {
    declarationKind: "const",
    initKind: "call:dual",
    jsdoc: {},
    localName: overrides.method ?? "method",
    method: "method",
    signatures: [],
    snippet: "",
    ...overrides
  }
}

function signature(overrides: Partial<SignatureInfo>): SignatureInfo {
  return {
    parameters: [],
    returnCallSignatures: [],
    returnType: "unknown",
    ...overrides
  }
}
