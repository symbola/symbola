import extend from './extend'
import { log, logger } from './symbols'

export abstract class Loggable {
  [logger](...args: unknown[]): void

  [log]<A>(this: A, ...args: unknown[]): A {
    // TODO
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this[logger](...args, this)

    return this
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Object extends Loggable {}
}

extend(Object.prototype, Loggable.prototype, {
  [logger]: console.log,
})
