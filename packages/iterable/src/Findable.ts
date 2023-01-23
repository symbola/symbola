import { extend } from '@symbola/core'

export const find = Symbol('find')

export default abstract class Findable {
  [find]<A>(this: Iterable<A>, fn: (a: A) => boolean) {
    for (const a of this) {
      if (fn(a)) {
        return a
      }
    }
    return undefined
  }
}

declare global {
  interface Object extends Findable {}
}

extend(Object.prototype, Findable.prototype)
