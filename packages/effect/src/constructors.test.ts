import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import { describe, expect, it } from "@effect/vitest";
import { Equal, Exit } from "effect";

import {
  fail,
  fromNullable,
  gen,
  promise,
  some,
  succeed,
  sync,
  try_,
  tryPromise,
} from "./Constructors.ts";

const return99 = () => 99;
const parseValidJson = () => JSON.parse('{"a":1}') as unknown;
const parseInvalidJson = () => JSON.parse("{invalid") as unknown;
const resolve42 = () => Promise.resolve(42);
const resolveHello = () => Promise.resolve("hello");
const addGeneratedValues = function* () {
  const a = yield* Effect.succeed(1);
  const b = yield* Effect.succeed(2);
  return a + b;
};

describe("constructors symbol protocol", () => {
  describe("[succeed]", () => {
    it.effect("lifts a value into Effect", () =>
      Effect.gen(function* () {
        const value = 42;
        const before = yield* Effect.exit(Effect.succeed(value));
        const after = yield* Effect.exit(value[succeed]());

        expect(Equal.equals(before, after)).toBe(true);
      }),
    );
  });

  describe("[fail]", () => {
    it.effect("lifts an error into Effect", () =>
      Effect.gen(function* () {
        const error = new Error("oops");
        const before = yield* Effect.exit(Effect.fail(error));
        const after = yield* Effect.exit(error[fail]());

        expect(Equal.equals(before, after)).toBe(true);
      }),
    );
  });

  describe("[sync]", () => {
    it.effect("lifts a thunk into Effect", () =>
      Effect.gen(function* () {
        const before = yield* Effect.exit(Effect.sync(return99));
        const after = yield* Effect.exit(return99[sync]());

        expect(Equal.equals(before, after)).toBe(true);
      }),
    );

    it("is lazy", () => {
      let called = 0;
      const thunk = () => {
        called++;
        return 42;
      };

      const effect = thunk[sync]();
      expect(called).toBe(0);

      Effect.runSync(effect);
      expect(called).toBe(1);
    });
  });

  describe("[try_]", () => {
    it("lifts a throwing thunk into Effect on success", () => {
      const before = Effect.runSync(Effect.try({ try: parseValidJson, catch: (error) => error }));
      const after = Effect.runSync(parseValidJson[try_]());

      expect(before).toStrictEqual(after);
    });

    it.effect("lifts a throwing thunk into Effect on failure", () =>
      Effect.gen(function* () {
        const before = yield* Effect.exit(
          Effect.try({ try: parseInvalidJson, catch: (error) => error }),
        );
        const after = yield* Effect.exit(parseInvalidJson[try_]());

        expect(Exit.isFailure(before)).toBe(true);
        expect(Exit.isFailure(after)).toBe(true);
      }),
    );
  });

  describe("[tryPromise]", () => {
    it.effect("lifts an async thunk into Effect", () =>
      Effect.gen(function* () {
        const before = yield* Effect.exit(Effect.tryPromise(resolve42));
        const after = yield* Effect.exit(resolve42[tryPromise]());

        expect(Equal.equals(before, after)).toBe(true);
      }),
    );
  });

  describe("[promise]", () => {
    it.effect("lifts an async thunk into Effect without an error channel", () =>
      Effect.gen(function* () {
        const before = yield* Effect.exit(Effect.promise(resolveHello));
        const after = yield* Effect.exit(resolveHello[promise]());

        expect(Equal.equals(before, after)).toBe(true);
      }),
    );
  });

  describe("[gen]", () => {
    it.effect("lifts a generator function into Effect", () =>
      Effect.gen(function* () {
        const before = yield* Effect.exit(Effect.gen(addGeneratedValues));
        const after = yield* Effect.exit(addGeneratedValues[gen]());

        expect(Equal.equals(before, after)).toBe(true);
      }),
    );

    it("re-runs the generator from the start on re-run", () => {
      let calls = 0;
      const program = function* () {
        calls++;
        return yield* Effect.succeed(calls);
      };

      const eff = program[gen]();
      Effect.runSync(eff);
      Effect.runSync(eff);
      expect(calls).toBe(2);
    });
  });

  describe("[fromNullable]", () => {
    it("lifts a non-null value into Option.some", () => {
      const value = "hello";
      const before = Option.fromNullishOr(value);
      const after = value[fromNullable]();

      expect(Equal.equals(before, after)).toBe(true);
    });

    it("lifts undefined into Option.none", () => {
      const value: string | undefined = undefined;
      const before = Option.fromNullishOr(value);

      expect(Option.isNone(before)).toBe(true);
    });
  });

  describe("[some]", () => {
    it("wraps a value in Option.some", () => {
      const value = 42;
      const before = Option.some(value);
      const after = value[some]();

      expect(Equal.equals(before, after)).toBe(true);
    });
  });
});
