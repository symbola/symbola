import * as Effect from "effect/Effect";
import * as HashSet from "effect/HashSet";

import { install } from "./internal/install.ts";
import { filter, map } from "./Symbols.ts";

export { filter, map } from "./Symbols.ts";

export const union: unique symbol = Symbol("HashSet/union");

type HS<A> = HashSet.HashSet<A, A>;

declare module "effect/HashSet" {
  interface HashSet<
    out Value,
    out A extends Value = Value,
  > extends HashSetProtocol<A> {}
}

abstract class HashSetProtocol<A> {
  [map]<B>(this: HS<A>, f: (value: A) => B): HS<B> {
    return HashSet.map(this, f);
  }

  [filter](this: HS<A>, predicate: (value: A) => boolean): HS<A> {
    return HashSet.filter(this, predicate);
  }

  [union]<B>(this: HS<A>, that: HashSet.HashSet<B, B>): HS<A | B> {
    return HashSet.union(this, that);
  }
}

const prototypeOf = (value: object): object => {
  const prototype = Object.getPrototypeOf(value);
  if (prototype === null) {
    throw new TypeError("Expected HashSet to have a prototype");
  }
  return prototype;
};

// Safe: all HashSet constructors share this prototype, unlike Stream.
Effect.runSync(
  install(HashSetProtocol.prototype, prototypeOf(HashSet.make(0))),
);
