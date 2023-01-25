import { extend } from '@symbola/core'
import { times } from '@symbola/number'
import { zip } from './Combineable'
import { map } from './Mappable'

export const index = Symbol('index')

export abstract class Indexable {
  /**
   * Return an iterable of the index and value of each item in the iterable.
   */
  *[index]<A>(this: Iterable<A>) {
    if (Array.isArray(this)) {
      yield* this.entries()
    }
    yield* this[zip](Infinity[times]())[map](([a, i]) => [i, a])
  }
}

declare global {
  interface Object extends Indexable {}
}

extend(Object.prototype, Indexable.prototype)
