import { concat, zip, _with } from './Combineable'

describe('Combineable', () => {
  describe('concat', () => {
    it('concats two iterables', () => {
      const iterable = new Set([1, 2, 3])
      const result = iterable[concat](new Set([4, 5, 6]))

      expect([...result]).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('concats multiple iterables', () => {
      const iterable = new Set([1, 2, 3])
      const result = iterable[concat](new Set([4, 5, 6]), new Set([7, 8, 9]))

      expect([...result]).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })

  describe('zip', () => {
    it('zips two iterables', () => {
      const iterable1 = [1, 2, 3]
      const iterable2 = ['a', 'b', 'c']
      const result = iterable1[zip](iterable2)

      expect([...result]).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })
  })

  describe('with', () => {
    it('should with arrays', () => {
      const array = [1, 2, 3]

      expect([...array[_with](1, 4)]).toEqual([1, 4, 3])
      expect(() => [...array[_with](4, 4)]).toThrow(RangeError('Index 4 is out of range'))
    })
  })
})
