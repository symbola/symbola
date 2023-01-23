import { extend } from '@symbola/core'

export const filter = Symbol('filter')

export default abstract class Filterable {
  *[filter]<A>(this: Iterable<A>, fn: (a: A) => boolean) {
    for (const value of this) {
      const nextValue = fn(value)
      if (nextValue) {
        yield value
      }
    }
  }
}

declare global {
  interface Object extends Filterable {}
}

extend(Object.prototype, Filterable.prototype)
