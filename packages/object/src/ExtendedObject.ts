import { extend, map } from '@symbola/core'

export default abstract class ExtendedObject {
  [map]<A, B>(
    this: Record<string, A>,
    fn: ([key, x]: [string, A]) => [string, B],
  ): Record<string, B> {
    return Object.fromEntries(Object.entries(this).map(fn))
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Object extends ExtendedObject {}
}

extend(Object.prototype, ExtendedObject.prototype)
