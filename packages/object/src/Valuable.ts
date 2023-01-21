import { extend } from '@symbola/core'
import { ValueObject } from 'tuplerone'

export const value = Symbol('value')

export default abstract class Valuable {
  /**
   * Returns a [value object] of the given object.
   * Implemented using [Tuplerone].
   *
   * [value object]: https://en.wikipedia.org/wiki/Value_object
   * [Tuplerone]: https://github.com/slikts/tuplerone
   */
  [value]<A extends object>(this: A): A {
    return ValueObject(this)
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Object extends Valuable {}
}

extend(Object.prototype, Valuable.prototype)
