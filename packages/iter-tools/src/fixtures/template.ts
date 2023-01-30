export default `import { extend } from '@symbola/core'
import { type Wrappable } from 'iter-tools'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const __append = require('iter-tools/__methods/append')

export const append = Symbol('append')

export default abstract class Protocol {
  [append]<A>(this: Iterable<A>, limit: number): IterableIterator<A> {
    return __append(this, limit)
  }
}

declare global {
  interface Object extends Protocol {}
}

extend(Object.prototype, Protocol.prototype)
`
