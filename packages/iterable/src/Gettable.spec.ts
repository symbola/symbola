import { at, find } from './Gettable'

describe('Gettable', () => {
  describe('at', () => {
    it('returns array items with positive index', () => {
      const array = [1, 2, 3]

      expect(array[at](0)).toBe(1)
      expect(array[at](1)).toBe(2)
      expect(array[at](2)).toBe(3)
    })

    it('returns array items with negative index', () => {
      const array = [1, 2, 3, 4]

      expect(array[at](-1)).toBe(4)
      expect(array[at](-2)).toBe(3)
    })

    it('returns iterable items with positive index', () => {
      const set = new Set([1, 2, 3, 4])

      expect(set[at](0)).toBe(1)
      expect(set[at](1)).toBe(2)
      expect(set[at](2)).toBe(3)
    })

    it('returns iterable items with negative index', () => {
      const set = new Set([1, 2, 3, 4])

      expect(set[at](-1)).toBe(4)
      expect(set[at](-2)).toBe(3)
      expect(set[at](-3)).toBe(2)
      expect(set[at](-4)).toBe(1)
    })

    it('returns undefined for out of bounds index', () => {
      const array = new Set([1, 2, 3])

      expect(array[at](3)).toBe(undefined)
      expect(array[at](4)).toBe(undefined)
      expect(array[at](-4)).toBe(undefined)
      expect(array[at](-5)).toBe(undefined)
    })
  })

  describe('find', () => {
    it('finds in arrays', () => {
      const xs = [{ a: 1 }, { a: 2 }, { a: 3 }]

      expect(xs[find](({ a }) => a === 2)).toEqual({ a: 2 })
    })

    it('finds in iterables', () => {
      function* iterable() {
        yield* [{ a: 1 }, { a: 2 }, { a: 3 }]
      }

      expect(iterable()[find](({ a }) => a === 2)).toEqual({ a: 2 })
    })

    it('returns undefined if not found', () => {
      const xs = [{ a: 1 }, { a: 2 }, { a: 3 }]

      expect(xs[find](({ a }) => a === 4)).toBeUndefined()
    })
  })
})
