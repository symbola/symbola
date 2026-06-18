import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

import { install } from "./internal/install.ts";

describe("install", () => {
  it.effect("installs symbol protocol entries as non-enumerable methods", () =>
    Effect.gen(function* () {
      const target = {};
      const read = Symbol("read");

      yield* install(
        [
          {
            symbol: read,
            implementation: (self, suffix) => `${String(self)}:${String(suffix)}`,
          },
        ],
        target,
      );

      const descriptor = Object.getOwnPropertyDescriptor(target, read);

      expect(descriptor).toMatchObject({
        enumerable: false,
        writable: true,
        configurable: true,
      });
      expect(descriptor?.value.call("subject", "object")).toBe("subject:object");
    }),
  );

  it.effect("installs symbol methods from protocol objects", () =>
    Effect.gen(function* () {
      const target = {};
      const greet = Symbol("greet");
      const protocol = {
        [greet](this: string, name: string) {
          return `${this}, ${name}`;
        },
      };

      yield* install(protocol, target);

      const descriptor = Object.getOwnPropertyDescriptor(target, greet);

      expect(descriptor).toMatchObject({
        enumerable: false,
        writable: true,
        configurable: true,
      });
      expect(descriptor?.value.call("hello", "ada")).toBe("hello, ada");
    }),
  );
});
