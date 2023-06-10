// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isIterable = (x: any): x is Iterable<unknown> => typeof x[Symbol.iterator] === 'function'

export default isIterable
