import { describe, expect, it } from "@effect/vitest"

import { filter, flatMap, map } from "./Array.ts"

describe("array symbol protocol", () => {
  it("maps, filters, and flatMaps arrays", () => {
    const values = [1, 2, 3] as const
    const mapped = values[map]((value) => value + 1)
    const filtered = mapped[filter]((value) => value > 2)
    const result = filtered[flatMap]((value) => [value, value * 10])

    expect(result).toStrictEqual([3, 30, 4, 40])
  })

  it("installs methods on Array.prototype as non-enumerable properties", () => {
    expect(Object.getOwnPropertyDescriptor(Array.prototype, map)).toMatchObject({
      enumerable: false,
      writable: true,
      configurable: true
    })
  })
})
