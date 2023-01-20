import { extend, compose } from "@symbola/core"
import { FunctionN } from 'fp-ts/function'

export default abstract class ExtendedFunction {
  [compose]<A, B, C>(
    this: FunctionN<[A], B>,
    f: FunctionN<[B], C>
  ): FunctionN<[A], C> {
    return (i: A): C => f(this(i));
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Function extends ExtendedFunction {}
}

extend(Function.prototype, ExtendedFunction.prototype)
