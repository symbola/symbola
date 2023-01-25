import extend from './extend'

export const log = Symbol('log')
export const _logger = Symbol('logger')

export abstract class Loggable {
  [_logger](...args: unknown[]): void

  [log]<A>(this: A, ...args: unknown[]): A {
    // TODO
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this[_logger](...args, this)

    return this
  }
}

declare global {
  interface Object extends Loggable {}
}

extend(Object.prototype, Loggable.prototype, {
  [_logger]: console.log,
})
