import { some } from './Somable'

describe('Somable', () => {
  it('checks if any value matches a predicate', () => {
    const iterable = new Set([1, 2, 3, 4, 5])
    expect(iterable[some]((a) => a % 2 === 0)).toBe(true)
    expect(iterable[some]((a) => a % 6 === 0)).toBe(false)
  })
})
