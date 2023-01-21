import { extend } from '@symbola/core'
import { ValueObject } from 'tuplerone'

export const value = Symbol('value')

/**
 * @alpha
 */
export default abstract class Valuable {
  [value]<A extends object>(this: A): A {
    return ValueObject(this)
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Object extends Valuable {}
}

extend(Object.prototype, Valuable.prototype)
