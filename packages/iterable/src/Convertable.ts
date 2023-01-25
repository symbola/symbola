import { extend, isIterable, IteratorLike } from '@symbola/core'

export const toArray = Symbol('toArray')
export const toMap = Symbol('toMap')
export const toSet = Symbol('toSet')
export const toObject = Symbol('toObject')
export const toWeakMap = Symbol('toWeakMap')
export const toWeakSet = Symbol('toWeakSet')
export const from = Symbol('from')

export abstract class Convertable {
  /**
   * Converts an iterable to an array.
   */
  [toArray]<A>(this: Iterable<A>) {
    return [...this]
  }

  /**
   * Converts an iterable to a map.
   */
  [toMap]<A, B>(this: Iterable<[A, B]>) {
    return new Map(this)
  }

  /**
   * Converts an iterable to a set.
   */
  [toSet]<A>(this: Iterable<A>) {
    return new Set(this)
  }

  /**
   * Converts an iterable of entries to an object.
   */
  [toObject]<A extends string | symbol | number, B>(this: Iterable<[A, B]>) {
    return Object.fromEntries(this)
  }

  /**
   * Converts an iterable of entries to a weak map.
   */
  [toWeakMap]<A extends object, B>(this: Iterable<[A, B]>) {
    return new WeakMap(this)
  }

  /**
   * Converts an iterable to a weak set.
   */
  [toWeakSet]<A extends object>(this: Iterable<A>) {
    return new WeakSet(this)
  }

  /**
   * Wraps an iterator-like object in an iterable.
   */
  [from]<A>(this: IteratorLike<A> | Iterable<A>) {
    if (isIterable(this)) {
      return this
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const iteratorLike = this
    return {
      *[Symbol.iterator]() {
        while (true) {
          const { done, value } = iteratorLike.next()
          if (done) {
            return value
          }
          yield value
        }
      },
    }
  }
}

declare global {
  interface Object extends Convertable {}
}

extend(Object.prototype, Convertable.prototype)
