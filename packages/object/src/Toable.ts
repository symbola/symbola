/* eslint-disable @typescript-eslint/no-unused-vars */
import { extend } from '@symbola/core'

export const to = Symbol('to')

/**
 * TODO: types break when used with `SetConstructor` because of iterable overloads
 *
 * @see https://stackoverflow.com/questions/75196941/how-to-wrap-new-without-losing-the-generic-parameters-for-the-constructed-type
 * @alpha
 */
export default abstract class Toable {
  /**
   * Convert an object to another type.
   */
  [to]<A, B>(this: A, constructor: new (a: A) => B) {
    return new constructor(this)
  }
}

declare global {
  interface Object extends Toable {}
}

extend(Object.prototype, Toable.prototype)