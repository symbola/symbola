import { extend } from '@symbola/core'

export const filter = Symbol('filter')

export default abstract class Filterable {
  *[filter]<A>(this: Iterable<A>, fn: (a: A) => boolean) {
    for (const x of this) {
      const next = fn(x)
      if (next) {
        yield x
      }
    }
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Object extends Filterable {}
}

extend(Object.prototype, Filterable.prototype)
