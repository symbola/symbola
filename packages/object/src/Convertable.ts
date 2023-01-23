/* eslint-disable @typescript-eslint/no-unused-vars */
import { extend } from '@symbola/core'

export const entries = Symbol('entries')
export const toMap = Symbol('toMap')
export const values = Symbol('values')
export const keys = Symbol('keys')

export default abstract class Convertable {
  /**
   * Converts a record to an array of entries.
   */
  [entries]<A extends string, B>(this: Record<A, B>) {
    return Object.entries(this) as [A, B][]
  }

  /**
   * Converts a record to a map.
   */
  [toMap]<A extends string, B>(this: Record<A, B>) {
    return new Map<A, B>(Object.entries(this) as [A, B][])
  }

  /**
   * Converts a record to an array of values.
   */
  [values]<A>(this: Record<string, A>) {
    return Object.values(this) as A[]
  }

  /**
   * Converts a record to an array of keys.
   */
  [keys]<A extends string>(this: Record<A, unknown>) {
    return Object.keys(this) as A[]
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Object extends Convertable {}
}

extend(Object.prototype, Convertable.prototype)
