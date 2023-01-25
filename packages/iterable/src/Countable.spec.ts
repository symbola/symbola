import { size } from './Countable'

describe('Sizeable', () => {
  it('should size iterables', () => {
    function* iterable() {
      yield* [1, 2, 3]
    }

    expect(iterable()[size]()).toBe(3)
  })

  it('should size arrays', () => {
    expect([1, 2, 3][size]()).toBe(3)
    expect([][size]()).toBe(0)
  })

  it('should size maps and sets', () => {
    expect(
      new Map([
        [1, 2],
        [3, 4],
      ])[size](),
    ).toBe(2)
    expect(new Set([1, 2, 3])[size]()).toBe(3)
  })
})
