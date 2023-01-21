import { extend } from '@symbola/core'

export const reduce = Symbol('reduce')

export default abstract class Reduceable {
  [reduce]<A>(this: Iterable<A>, fn: (p: A, c: A) => A): A
  [reduce]<A>(this: Iterable<A>, fn: (p: A, c: A) => A, init: A): A
  [reduce]<A, B>(this: Iterable<A>, fn: (p: B, c: A) => B, init: B): B
  [reduce](
    this: Iterable<unknown>,
    fn: (...args: unknown[]) => unknown,
    ...args: [] | [unknown]
  ): unknown {
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
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Object extends Reduceable {}
}

extend(Object.prototype, Reduceable.prototype)
