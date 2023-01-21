import extend from './extend'

export const log = Symbol('log')
export const _logger = Symbol('logger')

export default abstract class Loggable {
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
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Object extends Loggable {}
}

extend(Object.prototype, Loggable.prototype, {
  [_logger]: console.log,
})
