import { extend, isIterable } from '@symbola/core'

export const toArray = Symbol('toArray')

/**
 * @see https://github.com/tc39/proposal-array-from-async
 */
export default abstract class Convertable {
  /**
   * Collects all values from an async iterable into an array.
   */
  async [toArray]<A>(this: AsyncIterable<A> | Iterable<A>) {
    if (Array.isArray(this)) {
      return Promise.all(this)
    }
    if (isIterable(this)) {
      return Promise.all([...this])
    }
    const results = []
    for await (const value of this) {
      results.push(value)
    }
    return results
  }
}

declare global {
  interface Object extends Convertable {}
}

extend(Object.prototype, Convertable.prototype)
