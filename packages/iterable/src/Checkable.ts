import { extend } from '@symbola/core'

export const some = Symbol('some')
export const every = Symbol('every')

export abstract class Somable {
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

  /**
   * Returns true if every element in the iterable satisfies the predicate.
   */
  [every]<A>(this: Iterable<A>, fn: (a: A) => boolean) {
    if (Array.isArray(this)) {
      return this.every(fn)
    }
    for (const a of this) {
      if (!fn(a)) {
        return false
      }
    }
    return true
  }
}

declare global {
  interface Object extends Somable {}
}

extend(Object.prototype, Somable.prototype)
