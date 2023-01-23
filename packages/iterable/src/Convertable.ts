import { extend } from '@symbola/core'

export const toArray = Symbol('toArray')
export const toMap = Symbol('toMap')
export const toSet = Symbol('toSet')
export const toObject = Symbol('toObject')

export default abstract class Convertable {
  /**
   * Converts an iterable to an array.
   */
  [toArray]<A>(this: Iterable<A>) {
    // if (Array.isArray(this)) {
    //   return this
    // }
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
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Object extends Convertable {}
}

extend(Object.prototype, Convertable.prototype)
