import { extend } from '@symbola/core'

export const sort = Symbol('sort')

export default abstract class Sortable {
  /**
   * Sort the elements in the iterable.
   */
  [sort]<A>(this: Iterable<A>, fn?: (a: A, b: A) => number) {
    return [...this].sort(fn)
  }
}

declare global {
  interface Object extends Sortable {}
}

extend(Object.prototype, Sortable.prototype)
