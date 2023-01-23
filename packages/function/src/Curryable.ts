import { extend } from '@symbola/core'

export const _curry = Symbol('curry')

export default abstract class Curryable {
  /**
   * Curry a binary function.
   *
   * @alpha
   */
  [_curry]<A, B, C>(this: (a: A, b: B) => C): (a: A) => (b: B) => C {
    return (a) => (b) => this(a, b)
  }
}

declare global {
  interface Function extends Curryable {}
}

extend(Function.prototype, Curryable.prototype)
