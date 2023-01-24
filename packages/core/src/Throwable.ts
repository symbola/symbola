import extend from './extend'

export const _throw = Symbol('throw')

/**
 * @alpha
 * @see https://github.com/tc39/proposal-throw-expressions
 */
export default abstract class Throwable {
  /**
   * @throws
   */
  [_throw](this: ErrorConstructor, message?: string, options?: ErrorOptions): never {
    throw new this(message, options)
  }
}

declare global {
  interface Object extends Throwable {}
}

extend(Object.prototype, Throwable.prototype)
