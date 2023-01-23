import { extend } from '@symbola/core'

export const flatMap = Symbol('flatMap')

export default abstract class FlatMappable {
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
