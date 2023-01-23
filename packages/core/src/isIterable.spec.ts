import isIterable from './isIterable'

describe('isIterable', () => {
  it('detects iterables', () => {
    expect(isIterable([1, 2, 3])).toBe(true)
    expect(isIterable({})).toBe(false)
    expect(isIterable(new Set([1, 2, 3]))).toBe(true)
    expect(
      isIterable(
        new Map([
          [1, 2],
          [3, 4],
        ]),
      ),
    ).toBe(true)
    expect(isIterable('abc')).toBe(true)
  })
})
