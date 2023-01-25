import { cycle } from './Cycleable'

describe('Cycleable', () => {
  it('cycles an iterable', () => {
    const iterable = [1, 2][cycle]()
    const results = []

    for (const value of iterable) {
      results.push(value)
      if (results.length === 5) {
        break
      }
    }

    expect(results).toEqual([1, 2, 1, 2, 1])
  })
})
