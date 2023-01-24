import { extend } from '@symbola/core'
import { Buffer } from 'queueable'

import { reverse } from './Reversable'
import { buffer } from './Bufferable'

export const slice = Symbol('slice')
export const splice = Symbol('slice')
export const first = Symbol('first')
export const last = Symbol('last')
export const take = Symbol('take')
export const skip = Symbol('skip')
export const at = Symbol('at')

export default abstract class Sliceable {
  *[take]<A>(this: Iterable<A>, count: number) {
    if (count === 0) {
      return
    } else if (count === 1) {
      yield this[first]()
    } else if (count === -1) {
      yield this[last]()
    } else if (Array.isArray(this)) {
      yield* count > 0 ? this.slice(0, count) : this.slice(count)
    } else if (count === Infinity) {
      yield* this
    } else if (count === -Infinity) {
      yield* this[reverse]()
    } else if (count < 0) {
      yield* this[buffer](Math.abs(count))
    } else {
      let i = 0
      for (const value of this) {
        if (i === count) {
          break
        }
        yield value
        i += 1
      }
    }
  }

  *[skip]<A>(this: Iterable<A>, count: number) {
    if (count === 0) {
      return
    } else if (Array.isArray(this)) {
      yield* count > 0 ? this.slice(count) : this.slice(0, count)
    } else if (count > 0) {
      for (const value of this) {
        if (count === 0) {
          yield value
        } else {
          count -= 1
        }
      }
    } else {
      const buffer = Buffer.from(this, Infinity)
      yield* buffer[take](Math.max(0, buffer.length + count))
    }
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
   * Returns a slice of the iterable.
   */
  *[slice]<A>(this: Iterable<A>, start = 0, end = Infinity) {
    if (Array.isArray(this)) {
      yield* this.slice(start, end)
    } else {
      let i = 0
      for (const a of this) {
        if (i >= start && i < end) {
          yield a
        }
        i += 1
      }
    }
  }
}

declare global {
  interface Object extends Sliceable {}
}

extend(Object.prototype, Sliceable.prototype)
