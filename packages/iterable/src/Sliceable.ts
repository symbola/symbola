import { extend } from '@symbola/core'
import { Buffer } from 'queueable'

import { reverse } from './Reversable'
import { buffer } from './Bufferable'
import { first, last } from './Gettable'

export const slice = Symbol('slice')
export const splice = Symbol('slice')
export const take = Symbol('take')
export const skip = Symbol('skip')

export abstract class Sliceable {
  /**
   * Take the first N elements of an iterable, or the last N elements if N is negative.
   */
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

  /**
   * Skip the first N elements of an iterable, or the last N elements if N is negative.
   */
  *[skip]<A>(this: Iterable<A>, count: number) {
    if (count === 0) {
      yield* this
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

  *[splice]<A>(this: Iterable<A>, start = 0, deleteCount = Infinity, ...items: A[]) {
    if (Array.isArray(this)) {
      yield* this.splice(start, deleteCount, ...items)
    } else {
      yield* this[skip](start)
    }
  }
}

declare global {
  interface Object extends Sliceable {}
}

extend(Object.prototype, Sliceable.prototype)
