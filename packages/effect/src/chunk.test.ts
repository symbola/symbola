import { describe, expect, it } from "@effect/vitest";
import { Equal } from "effect";
import * as Chunk from "effect/Chunk";

import { append, filter, flatMap, map, take } from "./Chunk.ts";

describe("chunk symbol protocol", () => {
  it("maps, filters, and flatMaps chunks", () => {
    const chunk = Chunk.make(1, 2, 3, 4, 5);
    const before = Chunk.flatMap(
      Chunk.filter(
        Chunk.map(chunk, (v) => v + 1),
        (v) => v > 3,
      ),
      (v) => Chunk.make(v, v * 10),
    );
    const mapped = chunk[map]((v) => v + 1);
    const filtered = mapped[filter]((v) => v > 3);
    const after = filtered[flatMap]((v) => Chunk.make(v, v * 10));

    expect(Equal.equals(before, after)).toBe(true);
  });

  it("appends and takes from chunks", () => {
    const chunk = Chunk.make(1, 2, 3);
    const before = Chunk.take(Chunk.append(chunk, 4), 3);
    const after = chunk[append](4)[take](3);

    expect(Equal.equals(before, after)).toBe(true);
  });

  it("installs methods on Chunk prototype as non-enumerable properties", () => {
    const chunkProto = Object.getPrototypeOf(Chunk.make(0));
    expect(Object.getOwnPropertyDescriptor(chunkProto, map)).toMatchObject({
      enumerable: false,
      writable: true,
      configurable: true,
    });
  });
});
