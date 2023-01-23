import { extend } from '@symbola/core'

export const slice = Symbol('slice')

export default abstract class Sliceable {
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
