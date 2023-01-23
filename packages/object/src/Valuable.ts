import { extend } from '@symbola/core'
import { ValueObject } from 'tuplerone'

export const value = Symbol('value')

export default abstract class Valuable {
  /**
   * Returns a value object of the given object.
   *
   * @see https://en.wikipedia.org/wiki/Value_object
   * @see https://github.com/slikts/tuplerone
   */
  [value]<A extends object>(this: A): A {
    return ValueObject(this)
  }
}

declare global {
  interface Object extends Valuable {}
}

extend(Object.prototype, Valuable.prototype)
