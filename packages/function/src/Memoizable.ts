import { extend } from '@symbola/core'
import { memoize as _memoize } from 'tuplerone'

export const memoize = Symbol('memoize')

/**
 * @alpha
 */
export abstract class Memoizable {
  [memoize]<A extends Function>(this: A) {
    return _memoize(this)
  }
}

declare global {
  interface Function extends Memoizable {}
}

extend(Function.prototype, Memoizable.prototype)
