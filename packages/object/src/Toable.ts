import { extend } from '@symbola/core'

export const to = Symbol('to')

/**
 * // TODO: types break when used with `SetConstructor` because of iterable overloads
 *
 * @alpha
 */
export default abstract class Toable {
  [to]<A, B>(this: A, constructor: new (a: A) => B) {
    return new constructor(this)
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Object extends Toable {}
}

extend(Object.prototype, Toable.prototype)
