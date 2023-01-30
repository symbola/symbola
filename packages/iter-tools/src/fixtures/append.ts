import { extend } from '@symbola/core'
import { type IterableIterator } from 'iter-tools'
const __append = require('iter-tools/__methods/append')
export const append = Symbol('append')

export default abstract class Protocol {
  [append]<T, V>(this: Iterable<T>, value: V): IterableIterator<T | V> {
    return __append(this, value)
  }
}

declare global {
  interface Object extends Protocol { }
}

extend(Object.prototype, Protocol.prototype)
