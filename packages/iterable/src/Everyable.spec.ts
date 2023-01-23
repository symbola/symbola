import { every } from './Everyable'

describe('Everyable', () => {
  it('checks if every value matches a predicate in iterables', () => {
    const iterable = new Set([1, 2, 3, 4, 5])
    expect(iterable[every]((a) => a % 2 === 0)).toBe(false)
    expect(iterable[every]((a) => a % 1 === 0)).toBe(true)
  })

  it('checks if every value matches a predicate in arrays', () => {
    const array = [1, 2, 3, 4, 5]
    expect(array[every]((a) => a % 2 === 0)).toBe(false)
    expect(array[every]((a) => a % 1 === 0)).toBe(true)
  })

  it('returns true for empty iterables', () => {
    const iterable = new Set()
    expect(iterable[every](() => false)).toBe(true)
  })
})
