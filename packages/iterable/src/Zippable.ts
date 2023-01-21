import { extend } from '@symbola/core'

export const zip = Symbol('zip')

/**
 * @alpha
 */
export default abstract class Zippable {
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
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Object extends Zippable {}
}

extend(Object.prototype, Zippable.prototype)
