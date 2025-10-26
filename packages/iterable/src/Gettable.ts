import { extend } from '@symbola/core'
import { Buffer } from 'queueable'

export const at = Symbol('at')
export const first = Symbol('first')
export const last = Symbol('last')
export const find = Symbol('find')

export abstract class Gettable {
  /**
   * Return the element at index `i`. Negative indices count from the end.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at
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
    const buffer = new Buffer<A>(limit)
    for (const a of this) {
      buffer.enqueue(a)
    }
    return buffer.length >= limit ? buffer.dequeue() : undefined
  }

  /**
   * Gets the first element of the iterable.
   */
  [first]<A>(this: Iterable<A>) {
    if (Array.isArray(this)) {
      return this[0]
    }
    for (const value of this) {
      return value
    }
  }

  /**
   * Gets the last element of the iterable.
   */
  [last]<A>(this: Iterable<A>) {
    if (Array.isArray(this)) {
      return this[this.length - 1]
    }
    let lastValue: A | undefined
    for (const value of this) {
      lastValue = value
    }
    return lastValue
  }

  /**
   * Find the first element of the iterable that satisfies the predicate.
   */
  [find]<A>(this: Iterable<A>, fn: (a: A) => boolean) {
    if (Array.isArray(this)) {
      return this.find(fn)
    }
    for (const a of this) {
      if (fn(a)) {
        return a
      }
    }
    return undefined
  }
}

declare global {
  interface Object extends Gettable {}
}

extend(Object.prototype, Gettable.prototype)
