import { extend } from '@symbola/core'

export const reduce = Symbol('reduce')

export abstract class Reduceable {
  /**
   * Reduces the iterable to a single value.
   */
  [reduce]<A>(this: Iterable<A>, fn: (p: A, c: A) => A): A
  [reduce]<A>(this: Iterable<A>, fn: (p: A, c: A) => A, init: A): A
  [reduce]<A, B>(this: Iterable<A>, fn: (p: B, c: A) => B, init: B): B
  [reduce](this: Iterable<unknown>, fn: (...args: unknown[]) => unknown, ...args: [] | [unknown]) {
    if (Array.isArray(this)) {
      return this.reduce(fn, ...(args as []))
    }
    const iterator = this[Symbol.iterator]()
    let previous = args.length ? args[0] : iterator.next().value
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { value, done } = iterator.next()
      if (done) {
        break
      }
      const next = fn(previous, value)
      previous = next
    }
    return previous
  }
}

declare global {
  interface Object extends Reduceable {}
}

extend(Object.prototype, Reduceable.prototype)
