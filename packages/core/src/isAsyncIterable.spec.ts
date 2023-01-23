import isAsyncIterable from './isAsyncIterable'

describe('isAsyncIterable', () => {
  it('detects async iterables', () => {
    expect(isAsyncIterable([1, 2, 3])).toBe(false)
    expect(isAsyncIterable({ [Symbol.asyncIterator]() {} })).toBe(true)
    expect(isAsyncIterable((async function* () {})())).toBe(true)
  })
})
