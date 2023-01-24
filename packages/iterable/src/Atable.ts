/* eslint-disable @typescript-eslint/no-empty-interface */
import { extend } from '@symbola/core'
import { LinkedQueue } from 'queueable'

export const at = Symbol('at')

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at
 */
export default abstract class Atable {
  /**
   * Return the element at index `i`. Negative indices count from the end.
   */
  [at]<A>(this: Iterable<A>, i: number) {
    if (Array.isArray(this)) {
      return this.at(i)
    }
    if (i >= 0) {
      let count = 0
      for (const a of this) {
        if (count === i) {
          return a
        }
        count += 1
      }
      return undefined
    }
    const limit = Math.abs(i)
    const buffer = new LinkedQueue<A>(limit)
    for (const a of this) {
      buffer.enqueue(a)
    }
    return buffer.length >= limit ? buffer.dequeue() : undefined
  }
}

declare global {
  interface Object extends Atable {}
}

extend(Object.prototype, Atable.prototype)
