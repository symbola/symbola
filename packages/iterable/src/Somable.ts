import { extend } from '@symbola/core'

export const some = Symbol('some')

export default abstract class Somable {
  /**
   * Checks if any value in the iterable satisfies the predicate.
   */
  [some]<A>(this: Iterable<A>, fn: (a: A) => boolean) {
    if (Array.isArray(this)) {
      return this.some(fn)
    }
    for (const a of this) {
      if (fn(a)) {
        return true
      }
    }
    return false
  }
}

declare global {
  interface Object extends Somable {}
}

extend(Object.prototype, Somable.prototype)
