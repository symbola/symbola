import { extend } from '@symbola/core'

export const splice = Symbol('splice')

export default abstract class Sortable {
  /**
   * Sort the elements in the iterable.
   */
  *[splice]<A>(this: Iterable<A>, start: number, deleteCount = 0, ...items: A[]) {
    let i = 0
    for (const a of this) {
      if (i === start) {
        yield* items
      }
      if (i < start || i >= start + deleteCount) {
        yield a
      }
      i += 1
    }
    if (i < start) {
      yield* items
    }
  }
}

declare global {
  interface Object extends Sortable {}
}

extend(Object.prototype, Sortable.prototype)
