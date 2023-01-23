/* eslint-disable @typescript-eslint/no-empty-interface */
import { extend } from '@symbola/core'

export const _with = Symbol('with')

/**
 * @see https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.with
 */
export default abstract class Withable {
  /**
   * Return a new iterable with the element at index `i` replaced with `value`.
   *
   * @throws RangeError if `i` is out of range.
   */
  *[_with]<A>(this: Iterable<A>, i: number, value: A) {
    let count = 0
    for (const a of this) {
      yield count === i ? value : a
      count += 1
    }
    if (count <= i) {
      throw RangeError(`Index ${i} is out of range`)
    }
  }
}

declare global {
  interface Object extends Withable {}
}

extend(Object.prototype, Withable.prototype)
