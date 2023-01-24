/* eslint-disable @typescript-eslint/no-empty-interface */
import { extend } from '@symbola/core'
import { splice } from './Spliceable'

export const take = Symbol('take')

export default abstract class Takeable {
  /**
   * Take the first `n` elements of an iterable.
   */
  *[take]<A>(this: Iterable<A>, n: number) {
    yield* this[splice](n)
  }
}

declare global {
  interface Object extends Takeable {}
}

extend(Object.prototype, Takeable.prototype)
