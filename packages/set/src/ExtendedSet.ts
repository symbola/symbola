import { extend } from '@symbola/core'

export const intersection = Symbol('intersection')
export const union = Symbol('union')
export const difference = Symbol('difference')
export const symmetricDifference = Symbol('symmetricDifference')
export const isSubsetOf = Symbol('isSubsetOf')
export const isSupersetOf = Symbol('isSupersetOf')
export const isDisjointFrom = Symbol('isDisjointFrom')

/**
 * Methods from [Set Methods for JavaScript proposal][proposal].
 *
 * [proposal]: https://github.com/tc39/proposal-set-methods
 *
 * @alpha
 */
export default abstract class ExtendedSet {
  [intersection]<A>(this: Set<A>, other: Set<A>): Set<A> {
    return new Set([...this].filter((a) => other.has(a)))
  }
  [union]<A>(this: Set<A>, other: Set<A>): Set<A> {
    return new Set([...this, ...other])
  }
  [difference]<A>(this: Set<A>, other: Set<A>): Set<A> {
    return new Set([...this].filter((a) => !other.has(a)))
  }
  [symmetricDifference]<A>(this: Set<A>, other: Set<A>): Set<A> {
    return new Set([...this[difference](other), ...other[difference](this)])
  }
  [isSubsetOf]<A>(this: Set<A>, other: Set<A>): boolean {
    return [...this].every((a) => other.has(a))
  }
  [isSupersetOf]<A>(this: Set<A>, other: Set<A>): boolean {
    return other[isSubsetOf](this)
  }
  [isDisjointFrom]<A>(this: Set<A>, other: Set<A>): boolean {
    return [...this].every((a) => !other.has(a))
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Object extends ExtendedSet {}
}

extend(Object.prototype, ExtendedSet.prototype)
