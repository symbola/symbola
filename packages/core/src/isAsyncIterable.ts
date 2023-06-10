// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isAsyncIterable = (x: any): x is Iterable<unknown> =>
  typeof x[Symbol.asyncIterator] === 'function'

export default isAsyncIterable
