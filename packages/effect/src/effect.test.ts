import { describe, expect, it } from "@effect/vitest";
import { Data } from "effect";
import * as Effect from "effect/Effect";

import { as, catchTag, flatMap, flip, map, mapError, orElse, tap } from "./Effect.ts";

class NotFound extends Data.TaggedError("NotFound")<{ readonly id: number }> {}
class Timeout extends Data.TaggedError("Timeout")<{}> {}

const lookup = (id: number): Effect.Effect<string, NotFound | Timeout> =>
  id === 1 ? Effect.succeed("ada") : Effect.fail(new NotFound({ id }));

describe("effect symbol protocol", () => {
  it.effect("chains success-channel combinators through symbol methods", () =>
    Effect.gen(function* () {
      const seen: string[] = [];
      const tapped = lookup(1)[tap]((name) => Effect.sync(() => seen.push(name)));
      const mapped = tapped[map]((name) => name.toUpperCase());
      const program = mapped[flatMap]((name) => Effect.succeed(`hello, ${name}`));
      const result = yield* program;

      expect(result).toBe("hello, ADA");
      expect(seen).toEqual(["ada"]);
    }),
  );

  it.effect("recovers tagged errors with catchTag", () =>
    Effect.gen(function* () {
      const recovered = lookup(999)[catchTag]("NotFound", (error) =>
        Effect.succeed(`fallback for id ${error.id}`),
      );
      const result = yield* recovered;

      expect(result).toBe("fallback for id 999");
    }),
  );

  it.effect("composes error mapping, fallback, and as", () =>
    Effect.gen(function* () {
      const mappedError = lookup(2)[mapError]((error) =>
        error instanceof NotFound ? `missing:${error.id}` : "slow",
      );
      const fallback = mappedError[orElse](() => Effect.succeed("default"));
      const composed = fallback[as](42);
      const result = yield* composed;

      expect(result).toBe(42);
    }),
  );

  it.effect("flips the success and error channels", () =>
    Effect.gen(function* () {
      const flipped = lookup(999)[flip]();
      const mapped = flipped[map]((error) => (error instanceof NotFound ? error.id : 0));
      const result = yield* mapped;

      expect(result).toBe(999);
    }),
  );

  it("installs symbol methods as non-enumerable Object prototype properties", () => {
    const descriptor = Object.getOwnPropertyDescriptor(Object.prototype, map);

    expect(descriptor).toMatchObject({
      enumerable: false,
      writable: true,
      configurable: true,
    });
  });
});
