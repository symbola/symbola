import { extend } from '@symbola/core'

export const flatMap = Symbol('flatMap')

export default abstract class FlatMappable {
  /**
   * Maps each element to an iterable and flattens the result.
   */
  *[flatMap]<A, B>(this: Iterable<A>, fn: (a: A) => Iterable<B>) {
    for (const a of this) {
      yield* fn(a)
    }
  }
}

declare global {
  interface Object extends FlatMappable {}
}

extend(Object.prototype, FlatMappable.prototype)
