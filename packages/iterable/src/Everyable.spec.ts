import { every } from './Everyable'

describe('Everyable', () => {
  it('checks if every value matches a predicate', () => {
    const iterable = new Set([1, 2, 3, 4, 5])
    expect(iterable[every]((a) => a % 2 === 0)).toBe(false)
    expect(iterable[every]((a) => a % 1 === 0)).toBe(true)
  })
})
