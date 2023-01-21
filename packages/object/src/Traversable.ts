import { extend } from '@symbola/core'

export const traverse = Symbol('traverse')

export const _break = Symbol('break')
export const _continue = Symbol('continue')

type Signal = typeof _break | typeof _continue

export default abstract class Traversable {
  *[traverse]<A, B>(this: Iterable<A | Signal>, fn: (a: A) => B): Iterable<B> {
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
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Object extends Traversable {}
}

extend(Object.prototype, Traversable.prototype)
