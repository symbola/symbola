import { extend } from '@symbola/core'
import { memoize as _memoize } from 'tuplerone'

export const memoize = Symbol('memoize')

/**
 * @alpha
 */
export default abstract class Memoizable {
  // TODO
  // eslint-disable-next-line @typescript-eslint/ban-types
  [memoize]<A extends Function>(this: A) {
    return _memoize(this)
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Function extends Memoizable {}
}

extend(Function.prototype, Memoizable.prototype)
