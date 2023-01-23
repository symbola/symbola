/* eslint-disable @typescript-eslint/no-empty-interface */
import { extend } from '@symbola/core'

export const group = Symbol('group')
export const groupToMap = Symbol('groupToMap')

type Key = string | number | symbol

/**
 * @see https://github.com/tc39/proposal-array-grouping
 */
export default abstract class Groupable {
  /**
   */
  [group]<A>(this: Iterable<A>, fn: (a: A) => Key) {
    const result: Record<Key, A[]> = {}
    for (const a of this) {
      const key = fn(a)
      if (result[key] === undefined) {
        result[key] = []
      }
      result[key].push(a)
    }
    return result
  }

  [groupToMap]<A, B>(this: Iterable<A>, fn: (a: A) => B) {
    const result = new Map<B, A[]>()
    for (const a of this) {
      const key = fn(a)
      if (!result.has(key)) {
        result.set(key, [])
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      result.get(key)!.push(a)
    }
    return result
  }
}

declare global {
  interface Object extends Groupable {}
}

extend(Object.prototype, Groupable.prototype)
