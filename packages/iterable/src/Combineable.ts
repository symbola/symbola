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
  [zip]<A, B>(this: Iterable<A>, source: Iterable<B>[]): Iterable<[A, B]>
  [zip]<A, B, C>(this: Iterable<A>, ...sources: [Iterable<B>, Iterable<C>]): Iterable<[A, B, C]>
  [zip]<A, B, C, D>(
    this: Iterable<A>,
    ...sources: [Iterable<B>, Iterable<C>, Iterable<D>]
  ): Iterable<[A, B, C, D]>
  [zip]<A, B, C, D, E>(
    this: Iterable<A>,
    ...sources: [Iterable<B>, Iterable<C>, Iterable<D>, Iterable<E>]
  ): Iterable<[A, B, C, D, E]>
  [zip]<A, B, C, D, E, F>(
    this: Iterable<A>,
    ...sources: [Iterable<B>, Iterable<C>, Iterable<D>, Iterable<E>, Iterable<F>]
  ): Iterable<[A, B, C, D, E, F]>
  [zip]<A, B, C, D, E, F, G>(
    this: Iterable<A>,
    ...sources: [Iterable<B>, Iterable<C>, Iterable<D>, Iterable<E>, Iterable<F>, Iterable<G>]
  ): Iterable<[A, B, C, D, E, F, G]>
  [zip]<A, B, C, D, E, F, G, H, I>(
    this: Iterable<A>,
    ...sources: [
      Iterable<B>,
      Iterable<C>,
      Iterable<D>,
      Iterable<E>,
      Iterable<F>,
      Iterable<G>,
      Iterable<H>,
      Iterable<I>,
    ]
  ): Iterable<[A, B, C, D, E, F, G, H, I]>
  [zip]<A, B, C, D, E, F, G, H, I, J>(
    this: Iterable<A>,
    ...sources: [
      Iterable<B>,
      Iterable<C>,
      Iterable<D>,
      Iterable<E>,
      Iterable<F>,
      Iterable<G>,
      Iterable<H>,
      Iterable<I>,
      Iterable<J>,
    ]
  ): Iterable<[A, B, C, D, E, F, G, H, I, J]>
  *[zip]<A>(this: Iterable<A>, ...sources: Iterable<unknown>[]): Iterable<[A, ...unknown[]]> {
    const iterator = this[Symbol.iterator]()
    const sourceIterators = sources.map((source) => source[Symbol.iterator]())

    while (true) {
      const result = iterator.next()
      const sourceResults = sourceIterators.map((iterator) => iterator.next())
      if (result.done || sourceResults.some(({ done }) => done)) {
        break
      }
      yield [result.value, ...sourceResults.map(({ value }) => value)]
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
