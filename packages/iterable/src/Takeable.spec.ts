import { take } from './Takeable'

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('Takeable', () => {
  it('takes from iterables', () => {
    const iterable = new Set([1, 2, 3, 4, 5])
    const result = iterable[take](3)

    expect([...result]).toEqual([1, 2, 3])
  })

  it('takes from iterables with a negative count', () => {
    const iterable = new Set([1, 2, 3, 4, 5])
    const result = iterable[take](-3)

    expect([...result]).toEqual([3, 4, 5])
  })

  it('takes from iterables with a count of zero', () => {
    const iterable = new Set([1, 2, 3, 4, 5])
    const result = iterable[take](0)

    expect([...result]).toEqual([])
  })

  it('takes from iterables with not enough values', () => {
    const iterable = new Set([1, 2, 3, 4, 5])
    const result = iterable[take](10)

    expect([...result]).toEqual([1, 2, 3, 4, 5])
  })
})
