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
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Object extends Droppable {}
}

extend(Object.prototype, Droppable.prototype)
