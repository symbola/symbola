import { times, extend } from '@symbola/core'

export default abstract class NumberExtended {
  [times]<A>(this: number, f: (i: number) => A): A[] {
    return Array.from({ length: this }, (_, i) => f(i))
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Number extends NumberExtended {}
}

extend(Number.prototype, NumberExtended.prototype)
