import { extend } from '@symbola/core'

export const reverse = Symbol('reverse')

export default abstract class Reversable {
  /**
   * Reverse the order of the elements in the iterable.
   */
  [reverse]<A>(this: Iterable<A>) {
    return [...this].reverse()
  }
}

declare global {
  interface Object extends Reversable {}
}

extend(Object.prototype, Reversable.prototype)
