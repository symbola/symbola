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
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Function extends Curryable {}
}

extend(Function.prototype, Curryable.prototype)
