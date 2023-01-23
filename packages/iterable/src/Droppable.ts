/* eslint-disable @typescript-eslint/no-empty-interface */
import { extend } from '@symbola/core'

export const drop = Symbol('drop')

export default abstract class Droppable {
  *[drop]<A>(this: Iterable<A>, n: number) {
    let count = 0
    for (const a of this) {
      if (count >= n) {
        yield a
      }
      count += 1
    }
  }
}

declare global {
  interface Object extends Droppable {}
}

extend(Object.prototype, Droppable.prototype)
