import { extend } from '@symbola/core'
import { filter } from '@symbola/iterable'

export const intersection = Symbol('intersection')
export const union = Symbol('union')
export const difference = Symbol('difference')
export const symmetricDifference = Symbol('symmetricDifference')
export const isSubsetOf = Symbol('isSubsetOf')
export const isSupersetOf = Symbol('isSupersetOf')
export const isDisjointFrom = Symbol('isDisjointFrom')

/**
 * @alpha
 */
export default abstract class ExtendedSet {
  [intersection]<A>(this: Set<A>, other: Set<A>): Set<A> {
    // return new this[filter]((a) => other.has(a))
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Object extends ExtendedSet {}
}

extend(Object.prototype, ExtendedSet.prototype)
