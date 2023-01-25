import { extend } from '@symbola/core'
import { Buffer } from 'queueable'

export const reverse = Symbol('reverse')

export abstract class Reversable {
  /**
   * Reverse the order of the elements in the iterable.
   */
  *[reverse]<A>(this: Iterable<A>) {
    yield* Buffer.from(this, Infinity).reverse()
  }
}

declare global {
  interface Object extends Reversable {}
}

extend(Object.prototype, Reversable.prototype)
