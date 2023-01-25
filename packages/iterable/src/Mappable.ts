import { extend } from '@symbola/core'

export const map = Symbol('map')
export const flatMap = Symbol('flatMap')

export abstract class Mappable {
  /**
   * Maps each element to a new value.
   */
  *[map]<A, B>(this: Iterable<A>, fn: (a: A) => B) {
    for (const x of this) {
      yield fn(x)
    }
  }

  /**
   * Flat maps each element to a new iterable.
   */
  *[flatMap]<A, B>(this: Iterable<A>, fn: (a: A) => Iterable<B>) {
    for (const a of this) {
      yield* fn(a)
    }
  }
}

declare global {
  interface Object extends Mappable {}
}

extend(Object.prototype, Mappable.prototype)
