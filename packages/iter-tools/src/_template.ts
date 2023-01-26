import { extend } from '@symbola/core'
import zip from 'iter-tools/methods/zip'
import take from 'iter-tools/methods/take'

export const foo = Symbol('foo')
export const bar = Symbol('bar')

export default abstract class Extensions {
  *[foo]<A>(this: Iterable<A>, limit: number) {
    yield* take(limit, this)
  }

  [bar]<A, B>(this: Iterable<A>, source: Iterable<B>) {
    return zip(this, source)
  }
}

declare global {
  interface Object extends Extensions {}
}

extend(Object.prototype, Extensions.prototype)
