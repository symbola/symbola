import { extend } from '@symbola/core'

export const times = Symbol('times')

export default abstract class Timesable {
  [times]<A>(this: number, f: (i: number) => A): A[] {
    return Array.from({ length: this }, (_, i) => f(i))
  }
}

declare global {
  interface Number extends Timesable {}
}

extend(Number.prototype, Timesable.prototype)
