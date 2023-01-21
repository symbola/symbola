import { extend } from '@symbola/core'

export const to = Symbol('to')

export interface Newable<A, B> {
  new (a: A): B
}

/**
 * @alpha
 */
export default abstract class Toable {
  [to]<A, B>(this: A, newable: Newable<A, B>): B {
    return new newable(this)
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Object extends Toable {}
}

extend(Object.prototype, Toable.prototype)
