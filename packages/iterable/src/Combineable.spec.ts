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
    it('zips one source', () => {
      const iterable1 = [1, 2, 3]
      const iterable2 = ['a', 'b', 'c']
      const result = iterable1[zip](iterable2)

      expect([...result]).toEqual([
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ])
    })

    it('zips two sources', () => {
      const iterable1 = [1, 2, 3]
      const iterable2 = ['a', 'b', 'c']
      const iterable3 = [true, false, true]
      const result = iterable1[zip](iterable2, iterable3)

      expect([...result]).toEqual([
        [1, 'a', true],
        [2, 'b', false],
        [3, 'c', true],
      ])
    })

    it('zips three sources', () => {
      const iterable1 = [1, 2, 3]
      const iterable2 = ['a', 'b', 'c']
      const iterable3 = [true, false, true]
      const iterable4 = [null, undefined, null]
      const result = iterable1[zip](iterable2, iterable3, iterable4)

      expect([...result]).toEqual([
        [1, 'a', true, null],
        [2, 'b', false, undefined],
        [3, 'c', true, null],
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
