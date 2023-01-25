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

  /**
   * Zip the given iterables with this iterable.
   */
  *[zip]<A, B extends unknown[]>(
    this: Iterable<A>,
    ...sources: { [K in keyof B]: Iterable<B[K]> }
  ): Iterable<[A, ...B]> {
    const iterators = [this, ...sources].map((source) => source[Symbol.iterator]())

    while (true) {
      const results = iterators.map((iterator) => iterator.next())
      if (results.some(({ done }) => done)) {
        break
      }
      yield results.map(({ value }) => value) as [A, ...B]
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
