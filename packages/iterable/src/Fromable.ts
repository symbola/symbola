import { extend } from '@symbola/core'

export const from = Symbol('from')

export type IteratorLike<A> = {
  next(): { done: false; value: A } | { done: true; value?: unknown }
  [Symbol.iterator]?(): IteratorLike<A>
}

export default abstract class Fromable {
  /**
   * Wraps an iterator-like object in an iterable.
   */
  [from]<A>(this: IteratorLike<A> | Iterable<A>): Iterable<A> {
    if (this[Symbol.iterator]) {
      return this as Iterable<A>
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const iteratorLike = this as IteratorLike<A>
    return {
      *[Symbol.iterator]() {
        while (true) {
          const { done, value } = iteratorLike.next()
          if (done) {
            return
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
