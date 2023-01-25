import { extend } from '@symbola/core'

export const cycle = Symbol('group')

export abstract class Cycleable {
  /**
   * Cycle an iterable.
   */
  *[cycle]<A>(this: Iterable<A>) {
    while (true) {
      yield* this
    }
  }
}

declare global {
  interface Object extends Cycleable {}
}

extend(Object.prototype, Cycleable.prototype)
