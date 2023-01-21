import { extend } from '@symbola/core'
import { FunctionN } from 'fp-ts/function'

export const compose = Symbol('compose')

export default abstract class Composable {
  /**
   * TODO: support more arities
   *
   * @alpha
   */
  [compose]<A, B, C>(this: FunctionN<[A], B>, f: FunctionN<[B], C>): FunctionN<[A], C> {
    return (i: A): C => f(this(i))
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Function extends Composable {}
}

extend(Function.prototype, Composable.prototype)
