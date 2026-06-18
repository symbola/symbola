import * as Stream from "effect/Stream";
import * as Effect from "effect/Effect";
import { describe, expect, it } from "@effect/vitest";
import { Equal } from "effect";

import { filter, flatMap, map, runCollect, tap } from "./Stream.ts";
// Import effect protocol to test coexistence of shared symbols
// oxlint-disable-next-line import/no-unassigned-import
import "./Effect.ts";

describe("stream symbol protocol", () => {
  describe("[map]", () => {
    it.effect("is equivalent to Stream.map", () =>
      Effect.gen(function* () {
        const stream = Stream.make(1, 2, 3);
        const before = yield* Stream.runCollect(Stream.map(stream, (v) => v + 1));
        const after = yield* stream[map]((v) => v + 1)[runCollect]();

        expect(Equal.equals(before, after)).toBe(true);
      }),
    );

    it.effect("works with Stream.fromIterable, not just Stream.make", () =>
      Effect.gen(function* () {
        const stream = Stream.fromIterable([1, 2, 3, 4, 5]);
        const before = yield* Stream.runCollect(Stream.map(stream, (v) => v * 2));
        const after = yield* stream[map]((v) => v * 2)[runCollect]();

        expect(Equal.equals(before, after)).toBe(true);
      }),
    );

    it.effect("coexists with Effect on shared symbols", () =>
      Effect.gen(function* () {
        const stream = Stream.make(1, 2, 3);
        const effect = Effect.succeed(10);

        const streamResult = yield* stream[map]((v) => v + 1)[runCollect]();
        expect(streamResult).toEqual([2, 3, 4]);

        const effectResult = yield* effect[map]((v: number) => v * 2);
        expect(effectResult).toBe(20);
      }),
    );
  });

  describe("[filter]", () => {
    it.effect("is equivalent to Stream.filter", () =>
      Effect.gen(function* () {
        const stream = Stream.make(1, 2, 3, 4, 5);
        const before = yield* Stream.runCollect(Stream.filter(stream, (v) => v > 3));
        const after = yield* stream[filter]((v) => v > 3)[runCollect]();

        expect(Equal.equals(before, after)).toBe(true);
      }),
    );
  });

  describe("[flatMap]", () => {
    it.effect("is equivalent to Stream.flatMap", () =>
      Effect.gen(function* () {
        const stream = Stream.make(1, 2, 3);
        const before = yield* Stream.runCollect(
          Stream.flatMap(stream, (v) => Stream.make(v, v * 10)),
        );
        const after = yield* stream[flatMap]((v) => Stream.make(v, v * 10))[runCollect]();

        expect(Equal.equals(before, after)).toBe(true);
      }),
    );
  });

  describe("[tap]", () => {
    it.effect("is equivalent to Stream.tap", () =>
      Effect.gen(function* () {
        const seen: number[] = [];
        const stream = Stream.make(1, 2, 3);
        const before = yield* Stream.runCollect(
          Stream.tap(stream, (v) => Effect.sync(() => seen.push(v))),
        );
        seen.length = 0;
        const after = yield* stream[tap]((v) => Effect.sync(() => seen.push(v)))[runCollect]();

        expect(Equal.equals(before, after)).toBe(true);
        expect(seen).toEqual([1, 2, 3]);
      }),
    );
  });

  describe("[runCollect]", () => {
    it.effect("is equivalent to Stream.runCollect", () =>
      Effect.gen(function* () {
        const stream = Stream.make(10, 20, 30);
        const before = yield* Stream.runCollect(stream);
        const after = yield* stream[runCollect]();

        expect(Equal.equals(before, after)).toBe(true);
      }),
    );
  });

  describe("installation", () => {
    it("installs shared methods on Object.prototype as non-enumerable properties", () => {
      expect(Object.getOwnPropertyDescriptor(Object.prototype, map)).toMatchObject({
        enumerable: false,
        writable: true,
        configurable: true,
      });
    });
  });
});
