import { describe, expect, it } from "@effect/vitest"
import { Equal } from "effect"
import * as HashMap from "effect/HashMap"

import { filter, flatMap, get, has, map } from "./HashMap.ts"

describe("hashmap symbol protocol", () => {
  it("maps and filters hashmap values", () => {
    const hm = HashMap.make(["a", 1], ["b", 2], ["c", 3])
    const before = HashMap.filter(
      HashMap.map(hm, (v) => v * 10),
      (v) => v > 10
    )
    const after = hm[map]((v) => v * 10)[filter]((v) => v > 10)

    expect(Equal.equals(before, after)).toBe(true)
  })

  it("flatMaps hashmap entries", () => {
    const hm = HashMap.make(["x", 1])
    const before = HashMap.flatMap(hm, (v, k) => HashMap.make([k, v * 2]))
    const after = hm[flatMap]((v, k) => HashMap.make([k, v * 2]))

    expect(Equal.equals(before, after)).toBe(true)
  })

  it("gets and checks membership", () => {
    const hm = HashMap.make(["a", 1], ["b", 2])
    const before = HashMap.get(hm, "a")
    const after = hm[get]("a")

    expect(Equal.equals(before, after)).toBe(true)
    expect(hm[has]("a")).toBe(HashMap.has(hm, "a"))
    expect(hm[has]("z")).toBe(HashMap.has(hm, "z"))
  })

  it("installs methods on HashMap prototype as non-enumerable properties", () => {
    const hmProto = Object.getPrototypeOf(HashMap.make(["a", 1]))
    expect(Object.getOwnPropertyDescriptor(hmProto, map)).toMatchObject({
      enumerable: false,
      writable: true,
      configurable: true
    })
  })
})
