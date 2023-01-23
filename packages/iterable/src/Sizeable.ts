import { extend } from '@symbola/core'
import { reduce } from './Reduceable'

export const size = Symbol('size')

export default abstract class Sizeable {
  /**
   * Returns the number of elements in the iterable.
   */
  [size](this: Iterable<unknown>): number {
    if (Array.isArray(this)) {
      return this.length
    }
    if (this instanceof Set || this instanceof Map) {
      return this.size
    }
    return this[reduce]((count: number) => count + 1, 0)
  }
}

declare global {
  interface Object extends Sizeable {}
}

extend(Object.prototype, Sizeable.prototype)
