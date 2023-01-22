import { extend } from '@symbola/core'

export const toArray = Symbol('toArray')

export default abstract class ToArrayable {
  [toArray]<A>(this: Iterable<A>) {
    return [...this]
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Object extends ToArrayable {}
}

extend(Object.prototype, ToArrayable.prototype)
