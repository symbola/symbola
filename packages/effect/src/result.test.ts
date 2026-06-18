import { describe, expect, it } from "@effect/vitest";
import * as Result from "effect/Result";

import {
  filterOrFail,
  flatMap,
  getOrElse,
  map,
  mapBoth,
  mapError,
  match,
  orElse,
} from "./Result.ts";

describe("result symbol protocol", () => {
  it("chains success-channel combinators on Result branches", () => {
    const incremented = Result.succeed(1)[map]((value) => value + 1);
    const result = incremented[flatMap]((value) => Result.succeed(`${value}`));

    expect(
      result[match]({ onFailure: String, onSuccess: (value) => value }),
    ).toBe("2");
  });

  it("maps and recovers failure-channel values", () => {
    const mapped = Result.fail("missing")[mapError](
      (error) => `error:${error}`,
    );
    const result = mapped[orElse]((error) => Result.succeed(error.length));

    expect(result[getOrElse](() => 0)).toBe(13);
  });

  it("supports branch-wide mapping and success filtering", () => {
    const mapped = Result.succeed(3)[mapBoth]({
      onFailure: (error: string) => `error:${error}`,
      onSuccess: (value) => value + 1,
    });
    const filtered = mapped[filterOrFail](
      (value) => value > 10,
      (value) => `small:${value}`,
    );

    expect(
      filtered[match]({ onFailure: (error) => error, onSuccess: String }),
    ).toBe("small:4");
  });

  it("installs methods on failure and success prototypes", () => {
    const successPrototype = Object.getPrototypeOf(Result.succeed(0));
    const failurePrototype = Object.getPrototypeOf(Result.fail(0));

    expect(
      Object.getOwnPropertyDescriptor(successPrototype, map),
    ).toMatchObject({
      enumerable: false,
      writable: true,
      configurable: true,
    });
    expect(
      Object.getOwnPropertyDescriptor(failurePrototype, map),
    ).toMatchObject({
      enumerable: false,
      writable: true,
      configurable: true,
    });
  });
});
