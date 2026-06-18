import * as Effect from "effect/Effect";
import * as Result from "effect/Result";

import { flatMap, getOrElse, map, match, orElse } from "./Symbols.ts";
import { install } from "./internal/install.ts";

export { flatMap, getOrElse, map, match, orElse } from "./Symbols.ts";

export const mapBoth: unique symbol = Symbol("Result/mapBoth");
export const mapError: unique symbol = Symbol("Result/mapError");
export const filterOrFail: unique symbol = Symbol("Result/filterOrFail");

type ResultValue<A, E> = Result.Result<A, E>;

declare module "effect/Result" {
  interface Success<A, E> extends ResultProtocol<A, E> {}
  interface Failure<A, E> extends ResultProtocol<A, E> {}
}

abstract class ResultProtocol<A, E> {
  [map]<B>(this: ResultValue<A, E>, f: (success: A) => B): ResultValue<B, E> {
    return Result.map(this, f);
  }

  [flatMap]<B, E2>(
    this: ResultValue<A, E>,
    f: (success: A) => ResultValue<B, E2>,
  ): ResultValue<B, E | E2> {
    return Result.flatMap(this, f);
  }

  [match]<B, C>(
    this: ResultValue<A, E>,
    options: {
      readonly onFailure: (failure: E) => B;
      readonly onSuccess: (success: A) => C;
    },
  ): B | C {
    return Result.match(this, options);
  }

  [getOrElse]<B>(this: ResultValue<A, E>, onFailure: (failure: E) => B): A | B {
    return Result.getOrElse(this, onFailure);
  }

  [orElse]<B, E2>(
    this: ResultValue<A, E>,
    that: (failure: E) => ResultValue<B, E2>,
  ): ResultValue<A | B, E2> {
    return Result.orElse(this, that);
  }

  [mapBoth]<B, E2>(
    this: ResultValue<A, E>,
    options: {
      readonly onFailure: (failure: E) => E2;
      readonly onSuccess: (success: A) => B;
    },
  ): ResultValue<B, E2> {
    return Result.mapBoth(this, options);
  }

  [mapError]<E2>(this: ResultValue<A, E>, f: (failure: E) => E2): ResultValue<A, E2> {
    return Result.mapError(this, f);
  }

  [filterOrFail]<E2>(
    this: ResultValue<A, E>,
    predicate: (success: A) => boolean,
    orFailWith: (success: A) => E2,
  ): ResultValue<A, E | E2> {
    return Result.filterOrFail(this, predicate, orFailWith);
  }
}

const prototypeOf = (value: object): object => {
  const prototype = Object.getPrototypeOf(value);
  if (prototype === null) {
    throw new TypeError("Expected Result branch to have a prototype");
  }
  return prototype;
};

Effect.runSync(install(ResultProtocol.prototype, prototypeOf(Result.succeed(0))));
Effect.runSync(install(ResultProtocol.prototype, prototypeOf(Result.fail(0))));
