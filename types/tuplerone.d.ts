declare module 'tuplerone' {
  export function memoize<T extends Function>(fn: T): T
  export function ValueObject<T>(...args: any[]): T
}
