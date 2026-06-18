import { describe, expect, it } from "@effect/vitest";
import { Equal } from "effect";
import * as Cause from "effect/Cause";
import * as Exit from "effect/Exit";
import * as Option from "effect/Option";

import { flatMap, map, match } from "./Exit.ts";

const formatFailure = (cause: Cause.Cause<string>) =>
  `err:${Option.getOrElse(Cause.findErrorOption(cause), () => "unknown")}`;

describe("exit symbol protocol", () => {
  it("maps and flatMaps successful exits", () => {
    const exit = Exit.succeed(10);
    const mapped = Exit.map(exit, (v) => v * 2);
    const before = Exit.isSuccess(mapped)
      ? Exit.succeed(`value:${mapped.value}`)
      : mapped;
    const after = exit[map]((v) => v * 2)[flatMap]((v) =>
      Exit.succeed(`value:${v}`),
    );

    expect(Equal.equals(before, after)).toBe(true);
  });

  it("matches success and failure exits", () => {
    const success = Exit.succeed(42);
    const failure = Exit.fail("oops");

    const beforeSuccess = Exit.match(success, {
      onFailure: () => "failed",
      onSuccess: (v) => `ok:${v}`,
    });
    const afterSuccess = success[match]({
      onFailure: () => "failed",
      onSuccess: (v) => `ok:${v}`,
    });

    const beforeFailure = Exit.match(failure, {
      onFailure: formatFailure,
      onSuccess: () => "ok",
    });
    const afterFailure = failure[match]({
      onFailure: formatFailure,
      onSuccess: () => "ok",
    });

    expect(beforeSuccess).toBe(afterSuccess);
    expect(beforeFailure).toBe(afterFailure);
  });

  it("installs methods on Exit prototypes as non-enumerable properties", () => {
    const successProto = Object.getPrototypeOf(Exit.succeed(0));
    const failureProto = Object.getPrototypeOf(Exit.fail("e"));

    expect(Object.getOwnPropertyDescriptor(successProto, map)).toMatchObject({
      enumerable: false,
      writable: true,
      configurable: true,
    });
    expect(Object.getOwnPropertyDescriptor(failureProto, map)).toMatchObject({
      enumerable: false,
      writable: true,
      configurable: true,
    });
  });
});
