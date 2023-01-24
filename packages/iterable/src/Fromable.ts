import { extend, isIterable } from '@symbola/core'

export const from = Symbol('from')

export type IteratorLike<A> = {
  next(): { done: false; value: A } | { done: true; value?: unknown }
}

export default abstract class Fromable {
  /**
   * Wraps an iterator-like object in an iterable.
   */
  [from]<A>(this: IteratorLike<A> | Iterable<A>) {
    if (isIterable(this)) {
      return this
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const iteratorLike = this
    return {
      *[Symbol.iterator]() {
        while (true) {
          const { done, value } = iteratorLike.next()
          if (done) {
            return value
          }
          yield value
        }
      },
    }
  }
}

declare global {
  interface Object extends Fromable {}
}

extend(Object.prototype, Fromable.prototype)