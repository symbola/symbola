/* eslint-disable @typescript-eslint/no-empty-interface */
import { extend } from '@symbola/core'

export const take = Symbol('take')

export default abstract class Takeable {
  /**
   * Take the first `n` elements of an iterable.
   */
  *[take]<A>(this: Iterable<A>, n: number) {
    const iterator = this[Symbol.iterator]()
    for (let i = 0; i < n; i++) {
      const { value, done } = iterator.next()
      if (done) {
        // TODO: throw instead?
        break
      }
      yield value
    }
  }
}

declare global {
  interface Object extends Takeable {}
}

extend(Object.prototype, Takeable.prototype)
