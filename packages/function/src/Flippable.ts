import { extend } from '@symbola/core'

export const flip = Symbol('flip')

export default abstract class Flippable {
  /**
   * Reverse the order of the arguments to a function.
   */
  [flip]<A, B, C>(this: (a: A, b: B) => C): (b: B, a: A) => C {
    return (b, a) => this(a, b)
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Function extends Flippable {}
}

extend(Function.prototype, Flippable.prototype)
