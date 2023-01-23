import { extend } from '@symbola/core'

export const collect = Symbol('collect')

/**
 * @see https://github.com/tc39/proposal-array-from-async
 */
export default abstract class Collectable {
  /**
   * Collects all values from an async iterable into an array.
   */
  async [collect]<A>(this: AsyncIterable<A>) {
    const results = []
    for await (const value of this) {
      results.push(value)
    }
    return results
  }
}

declare global {
  interface Object extends Collectable {}
}

extend(Object.prototype, Collectable.prototype)
