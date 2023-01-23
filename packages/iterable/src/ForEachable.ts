import { extend } from '@symbola/core'

export const forEach = Symbol('forEach')

export default abstract class ForEachable {
  /**
   * Uses side effects to perform an action for each element of the iterable.
   */
  [forEach]<A>(this: Iterable<A>, fn: (a: A) => void) {
    for (const a of this) {
      fn(a)
    }
  }
}

declare global {
  interface Object extends ForEachable {}
}

extend(Object.prototype, ForEachable.prototype)
