import { extend } from '@symbola/core'

export const clamp = Symbol('clamp')

export default abstract class Clampable {
  [clamp](this: number, a: number, b: number): number {
    return Math.min(Math.max(this, a), b)
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Number extends Clampable {}
}

extend(Number.prototype, Clampable.prototype)
