import { extend } from '@symbola/core'
import { FunctionN } from 'fp-ts/function'

export const compose = Symbol('compose')

/**
 * @alpha
 */
export default abstract class Composable {
  /**
   * Compose two functions.
   *
   * TODO: support more arities
   */
  [compose]<A, B, C>(this: FunctionN<[A], B>, f: FunctionN<[B], C>): FunctionN<[A], C> {
    return (i: A): C => f(this(i))
  }
}

declare global {
  interface Function extends Composable {}
}

extend(Function.prototype, Composable.prototype)
