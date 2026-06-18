import * as Chunk from "effect/Chunk"
import * as Effect from "effect/Effect"

import { install } from "./internal/install.ts"
import { filter, flatMap, map } from "./Symbols.ts"

export { filter, flatMap, map } from "./Symbols.ts"

export const append: unique symbol = Symbol("Chunk/append")
export const take: unique symbol = Symbol("Chunk/take")

type Chk<A> = Chunk.Chunk<A>

declare module "effect/Chunk" {
  interface Chunk<out A> extends ChunkProtocol<A> {}
}

abstract class ChunkProtocol<A> {
  [map]<B>(this: Chk<A>, f: (value: A, index: number) => B): Chk<B> {
    return Chunk.map(this, f)
  }

  [filter]<B extends A>(this: Chk<A>, predicate: (value: A, index: number) => value is B): Chk<B>
  [filter](this: Chk<A>, predicate: (value: A, index: number) => boolean): Chk<A>
  [filter](this: Chk<A>, predicate: (value: A, index: number) => boolean): Chk<A> {
    return Chunk.filter(this, predicate as (value: A) => boolean)
  }

  [flatMap]<B>(this: Chk<A>, f: (value: A, index: number) => Chk<B>): Chk<B> {
    return Chunk.flatMap(this, f)
  }

  [append]<B>(this: Chk<A>, value: B): Chk<A | B> {
    return Chunk.append(this, value)
  }

  [take](this: Chk<A>, n: number): Chk<A> {
    return Chunk.take(this, n)
  }
}

const prototypeOf = (value: object): object => {
  const prototype = Object.getPrototypeOf(value)
  if (prototype === null) {
    throw new TypeError("Expected Chunk to have a prototype")
  }
  return prototype
}

// Safe: all Chunk constructors share this prototype, unlike Stream.
Effect.runSync(install(ChunkProtocol.prototype, prototypeOf(Chunk.make(0))))
