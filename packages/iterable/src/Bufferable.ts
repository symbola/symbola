import { extend } from '@symbola/core'
import { Buffer } from 'queueable'

export const buffer = Symbol('buffer')

export default abstract class Bufferable {
  /**
   * Buffers the last values of the iterable.
   */
  *[buffer]<A>(this: Iterable<A>, limit: number) {
    if (limit <= 0) {
      return
    }
    if (limit === Infinity) {
      yield* this
    } else if (Array.isArray(this)) {
      yield* this.slice(-limit)
      return
    } else {
      yield* Buffer.from(this, limit)
    }
  }
}

declare global {
  interface Object extends Bufferable {}
}

extend(Object.prototype, Bufferable.prototype)
