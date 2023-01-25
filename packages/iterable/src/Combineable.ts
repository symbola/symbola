import { extend } from '@symbola/core'

export const concat = Symbol('concat')
export const zip = Symbol('zip')
export const _with = Symbol('with')

export abstract class Combineable {
  /**
   * Concatenate the given iterables to the end of this iterable.
   */
  *[concat]<A>(this: Iterable<A>, ...iterables: Iterable<A>[]) {
    yield* this
    for (const iterable of iterables) {
      yield* iterable
    }
  }

  *[zip]<A, B>(this: Iterable<A>, target: Iterable<B>): Iterable<[A, B]> {
    const iterator1 = this[Symbol.iterator]()
    const iterator2 = target[Symbol.iterator]()

    while (true) {
      const result1 = iterator1.next()
      const result2 = iterator2.next()
      if (result1.done || result2.done) {
        break
      }
      yield [result1.value, result2.value]
    }
  }

  /**
   * Return a new iterable with the element at index `i` replaced with `value`.
   *
   * @throws RangeError if `i` is out of range.
   *
   * @see https://tc39.es/proposal-change-array-by-copy/#sec-array.prototype.with
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
  interface Object extends Combineable {}
}

extend(Object.prototype, Combineable.prototype)
