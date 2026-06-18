import * as Effect from "effect/Effect"
import * as HashMap from "effect/HashMap"
import type * as Option from "effect/Option"

import { install } from "./internal/install.ts"
import { filter, flatMap, map } from "./Symbols.ts"

export { filter, flatMap, map } from "./Symbols.ts"

export const get: unique symbol = Symbol("HashMap/get")
export const has: unique symbol = Symbol("HashMap/has")

type HM<K, V> = HashMap.HashMap<K, V>

declare module "effect/HashMap" {
  interface HashMap<out Key, out Value> extends HashMapProtocol<Key, Value> {}
}

abstract class HashMapProtocol<K, V> {
  [map]<B>(this: HM<K, V>, f: (value: V, key: K) => B): HM<K, B> {
    return HashMap.map(this, f)
  }

  [filter](this: HM<K, V>, predicate: (value: V, key: K) => boolean): HM<K, V> {
    return HashMap.filter(this, predicate)
  }

  [flatMap]<B>(this: HM<K, V>, f: (value: V, key: K) => HashMap.HashMap<K, B>): HM<K, B> {
    return HashMap.flatMap(this, f)
  }

  [get](this: HM<K, V>, key: K): Option.Option<V> {
    return HashMap.get(this, key)
  }

  [has](this: HM<K, V>, key: K): boolean {
    return HashMap.has(this, key)
  }
}

const prototypeOf = (value: object): object => {
  const prototype = Object.getPrototypeOf(value)
  if (prototype === null) {
    throw new TypeError("Expected HashMap to have a prototype")
  }
  return prototype
}

// Safe: all HashMap constructors share this prototype, unlike Stream.
Effect.runSync(install(HashMapProtocol.prototype, prototypeOf(HashMap.make(["a", 1]))))
