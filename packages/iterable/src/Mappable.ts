import { extend } from '@symbola/core'

export const map = Symbol('map')

export default abstract class Mappable {
  *[map]<A, B>(this: Iterable<A>, fn: (a: A) => B) {
    for (const x of this) {
      yield fn(x)
    }
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Object extends Mappable {}
}

extend(Object.prototype, Mappable.prototype)