import { extend } from '@symbola/core'

export const every = Symbol('every')

export default abstract class Everyable {
  /**
   * Returns true if every element in the iterable satisfies the predicate.
   */
  [every]<A>(this: Iterable<A>, fn: (a: A) => boolean) {
    for (const a of this) {
      if (!fn(a)) {
        return false
      }
    }
    return true
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Object extends Everyable {}
}

extend(Object.prototype, Everyable.prototype)
