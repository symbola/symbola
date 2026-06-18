import { describe, expect, it } from "@effect/vitest";
import * as Option from "effect/Option";

import {
  filter,
  filterMap,
  flatMap,
  flatMapNullishOr,
  getOrElse,
  map,
  match,
  orElse,
  orElseSome,
} from "./Option.ts";

describe("option symbol protocol", () => {
  it("chains some-channel combinators on Option branches", () => {
    const incremented = Option.some(1)[map]((value) => value + 1);
    const result = incremented[flatMap]((value) => Option.some(`${value}`));

    expect(
      result[match]({ onNone: () => "none", onSome: (value) => value }),
    ).toBe("2");
  });

  it("filters and maps optional values", () => {
    const even = Option.some(4)[filter]((value) => value % 2 === 0);
    const result = even[filterMap]((value) =>
      value > 2 ? Option.some(`large:${value}`) : Option.none(),
    );

    expect(result[getOrElse](() => "missing")).toBe("large:4");
  });

  it("supports nullable mapping and fallbacks", () => {
    const longName = Option.some("ada")[flatMapNullishOr]((name) =>
      name.length > 10 ? name : undefined,
    );
    const recovered = longName[orElse](() => Option.some("grace"));
    const result = recovered[orElseSome](() => "fallback");

    expect(result[getOrElse](() => "missing")).toBe("grace");
  });

  it("installs methods on some and none prototypes", () => {
    const somePrototype = Object.getPrototypeOf(Option.some(0));
    const nonePrototype = Object.getPrototypeOf(Option.none());

    expect(Object.getOwnPropertyDescriptor(somePrototype, map)).toMatchObject({
      enumerable: false,
      writable: true,
      configurable: true,
    });
    expect(Object.getOwnPropertyDescriptor(nonePrototype, map)).toMatchObject({
      enumerable: false,
      writable: true,
      configurable: true,
    });
  });
});
