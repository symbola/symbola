import { extend } from '@symbola/core'

export const splice = Symbol('splice')

export default abstract class Spliceable {
  /**
   * Sort the elements in the iterable.
   */
  *[splice]<A>(this: Iterable<A>, start: number, deleteCount = Infinity, ...items: A[]) {
    let count = 0
    for (const a of this) {
      if (count === start) {
        yield* items
        if (deleteCount === Infinity) {
          return
        }
      }
      if (count < start || count >= start + deleteCount) {
        yield a
      }
      count += 1
    }
    if (count < start) {
      yield* items
    }
  }
}

declare global {
  interface Object extends Spliceable {}
}

extend(Object.prototype, Spliceable.prototype)
