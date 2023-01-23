import { extend } from '@symbola/core'

export const zip = Symbol('zip')

export default abstract class Zippable {
  /**
   * Zips two iterables together.
   *
   * @alpha
   */
  *[zip]<A, B>(this: Iterable<A>, target: Iterable<B>) {
    const iterator1 = this[Symbol.iterator]()
    const iterator2 = target[Symbol.iterator]()

    while (true) {
      const result1 = iterator1.next()
      const result2 = iterator2.next()
      if (result1.done || result2.done) {
        break
      }
      yield [result1.value, result2.value]
    }
  }
}

declare global {
  interface Object extends Zippable {}
}

extend(Object.prototype, Zippable.prototype)
