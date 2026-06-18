import { describe, expect, it } from "@effect/vitest";
import { Equal } from "effect";
import * as HashSet from "effect/HashSet";

import { filter, map, union } from "./HashSet.ts";

describe("hashset symbol protocol", () => {
  it("maps and filters hashset values", () => {
    const hs = HashSet.make(1, 2, 3, 4, 5);
    const before = HashSet.filter(
      HashSet.map(hs, (v) => v * 2),
      (v) => v > 4,
    );
    const after = hs[map]((v) => v * 2)[filter]((v) => v > 4);

    expect(Equal.equals(before, after)).toBe(true);
  });

  it("unions two sets", () => {
    const a = HashSet.make(1, 2, 3);
    const b = HashSet.make(3, 4, 5);
    const before = HashSet.union(a, b);
    const after = a[union](b);

    expect(Equal.equals(before, after)).toBe(true);
  });

  it("installs methods on HashSet prototype as non-enumerable properties", () => {
    const hsProto = Object.getPrototypeOf(HashSet.make(0));
    expect(Object.getOwnPropertyDescriptor(hsProto, map)).toMatchObject({
      enumerable: false,
      writable: true,
      configurable: true,
    });
  });
});
