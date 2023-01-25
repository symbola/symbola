import { extend } from '@symbola/core'

export const _catch = Symbol('catch')

/**
 * @alpha
 */
export abstract class Catchable {
  /**
   * Catch errors thrown by a function.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [_catch]<A extends (...args: any[]) => any, B>(this: A, fn: (error: unknown) => B) {
    return (...args: unknown[]) => {
      try {
        return this(...args)
      } catch (error) {
        return fn(error)
      }
    }
  }
}

declare global {
  interface Function extends Catchable {}
}

extend(Function.prototype, Catchable.prototype)
