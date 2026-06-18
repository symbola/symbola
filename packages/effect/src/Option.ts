import * as Effect from "effect/Effect"
import * as Option from "effect/Option"

import { install } from "./internal/install.ts"
import { filter, flatMap, getOrElse, map, match, orElse } from "./Symbols.ts"

export { filter, flatMap, getOrElse, map, match, orElse } from "./Symbols.ts"

export const filterMap: unique symbol = Symbol("Option/filterMap")
export const flatMapNullishOr: unique symbol = Symbol("Option/flatMapNullishOr")
export const orElseSome: unique symbol = Symbol("Option/orElseSome")

type Opt<A> = Option.Option<A>

declare module "effect/Option" {
  interface Some<A> extends OptionProtocol<A> {}
  interface None<A> extends OptionProtocol<A> {}
}

abstract class OptionProtocol<A> {
  [map]<B>(this: Opt<A>, f: (value: A) => B): Opt<B> {
    return Option.map(this, f)
  }

  [flatMap]<B>(this: Opt<A>, f: (value: A) => Opt<B>): Opt<B> {
    return Option.flatMap(this, f)
  }

  [match]<B, C>(
    this: Opt<A>,
    options: {
      readonly onNone: () => B
      readonly onSome: (value: A) => C
    }
  ): B | C {
    return Option.match(this, options)
  }

  [getOrElse]<B>(this: Opt<A>, onNone: () => B): A | B {
    return Option.getOrElse(this, onNone)
  }

  [orElse]<B>(this: Opt<A>, that: () => Opt<B>): Opt<A | B> {
    return Option.orElse(this, that)
  }

  [filter](this: Opt<A>, predicate: (value: A) => boolean): Opt<A> {
    return Option.filter(this, predicate)
  }

  [filterMap]<B>(this: Opt<A>, f: (value: A) => Opt<B>): Opt<B> {
    return Option.flatMap(this, f)
  }

  [flatMapNullishOr]<B>(this: Opt<A>, f: (value: A) => B | null | undefined): Opt<NonNullable<B>> {
    return Option.flatMapNullishOr(this, f)
  }

  [orElseSome]<B>(this: Opt<A>, onNone: () => B): Opt<A | B> {
    return Option.orElseSome(this, onNone)
  }
}

const prototypeOf = (value: object): object => {
  const prototype = Object.getPrototypeOf(value)
  if (prototype === null) {
    throw new TypeError("Expected Option branch to have a prototype")
  }
  return prototype
}

Effect.runSync(install(OptionProtocol.prototype, prototypeOf(Option.some(0))))
Effect.runSync(install(OptionProtocol.prototype, prototypeOf(Option.none())))
