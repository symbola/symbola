import { extend } from '@symbola/core'

export const once = Symbol('once')

export default abstract class Onceable {
  [once]<A extends (...args: unknown[]) => B, B>(this: A) {
    let called = false
    let result: B
    return (...args: Parameters<A>) => {
      if (called) {
        return result
      }
      called = true
      result = this(...args)
      return result
    }
  }
}

declare global {
  interface Function extends Onceable {}
}

extend(Function.prototype, Onceable.prototype)
