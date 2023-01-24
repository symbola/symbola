import { extend } from '@symbola/core'

export const map = Symbol('map')

export default abstract class Mappable {
  /**
   * Maps each element to a new value.
   */
  *[map]<A, B>(this: Iterable<A>, fn: (a: A) => B) {
    for (const x of this) {
      yield fn(x)
    }
  }
}

declare global {
  interface Object extends Mappable {}
}

extend(Object.prototype, Mappable.prototype)