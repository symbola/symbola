import { extend } from '@symbola/core'

export const times = Symbol('times')

export default abstract class Repeatable {
  /**
   * Repeat the given function N times, or return an iterable of numbers from 0 to N.
   */
  [times](this: number): Iterable<number>
  [times]<A>(this: number, fn: (i: number) => A): Iterable<A>
  *[times](this: number, fn?: unknown) {
    for (let i = 0; i < this; i++) {
      yield typeof fn === 'function' ? fn(i) : i
    }
  }
}

declare global {
  interface Number extends Repeatable {}
}

extend(Number.prototype, Repeatable.prototype)
