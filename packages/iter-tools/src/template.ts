import { extend } from '@symbola/core'
import { type IterableIterator } from 'iter-tools'

const __take = require('iter-tools/__methods/take')
export const take = Symbol('take')

export default abstract class Protocol {
  [take]<A>(this: Iterable<A>, limit: number): IterableIterator<A> {
    return __take(this, limit)
  }
}

declare global {
  interface Object extends Protocol {}
}

extend(Object.prototype, Protocol.prototype)
