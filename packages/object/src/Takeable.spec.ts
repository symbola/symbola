import { take } from './Takeable'

describe('Takeable', () => {
  it('takes from iterables', () => {
    const iterable = new Set([1, 2, 3, 4, 5])
    const result = iterable[take](3)
    expect([...result]).toEqual([1, 2, 3])
  })
})
