/* eslint-disable @typescript-eslint/no-empty-interface */
import { extend } from '@symbola/core'

export const traverse = Symbol('traverse')

export const _break = Symbol('break')
export const _continue = Symbol('continue')

export type Signal = typeof _break | typeof _continue

/**
 * @alpha
 */
export default abstract class Traversable {
  *[traverse]<A, B>(this: Iterable<A>, fn: (a: A) => B | Signal) {
    const iterator = this[Symbol.iterator]()

    while (true) {
      const { value, done } = iterator.next()
      const nextValue = fn(value)
      if (done || nextValue === _break) {
        break
      }
      if (nextValue === _continue) {
        continue
      }
      yield nextValue
    }
  }
}

declare global {
  interface Object extends Traversable {}
}

extend(Object.prototype, Traversable.prototype)
