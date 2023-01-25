import { slice, take, skip, splice } from './Sliceable'

describe('Sliceable', () => {
  it('slices', () => {
    const array = [1, 2, 3, 4, 5]

    expect([...array[slice](1, 3)]).toEqual([2, 3])
    expect([...array[slice](3, 1)]).toEqual([])
    expect([...array[slice](3)]).toEqual([4, 5])
    expect([...array[slice](1)]).toEqual([2, 3, 4, 5])
    expect([...array[slice](undefined, 3)]).toEqual([1, 2, 3])
  })

  describe('take', () => {
    it('takes from the beginning of arrays', () => {
      const array = [1, 2, 3]

      expect([...[][take](0)]).toEqual([])
      expect([...[][take](1)]).toEqual([])
      expect([...array[take](1)]).toEqual([1])
      expect([...array[take](2)]).toEqual([1, 2])
      expect([...array[take](3)]).toEqual([1, 2, 3])
      expect([...array[take](5)]).toEqual([1, 2, 3])
    })

    it('takes from the end of arrays', () => {
      const array = [1, 2, 3]

      expect([...[][take](-1)]).toEqual([])
      expect([...array[take](-1)]).toEqual([3])
      expect([...array[take](-2)]).toEqual([2, 3])
      expect([...array[take](-5)]).toEqual([1, 2, 3])
    })

    it('takes from the beginning of iterables', () => {
      const iterable = new Set([1, 2, 3])

      expect([...iterable[take](1)]).toEqual([1])
      expect([...iterable[take](2)]).toEqual([1, 2])
      expect([...iterable[take](3)]).toEqual([1, 2, 3])
      expect([...iterable[take](5)]).toEqual([1, 2, 3])
    })

    it('takes from the end of iterables', () => {
      const iterable = new Set([1, 2, 3])

      expect([...iterable[take](-1)]).toEqual([3])
      expect([...iterable[take](-2)]).toEqual([2, 3])
      expect([...iterable[take](-5)]).toEqual([1, 2, 3])
    })
  })

  describe('skip', () => {
    it('skips from the beginning of arrays', () => {
      const array = [1, 2, 3]

      expect([...[][skip](0)]).toEqual([])
      expect([...[][skip](1)]).toEqual([])
      expect([...array[skip](0)]).toEqual([1, 2, 3])
      expect([...array[skip](1)]).toEqual([2, 3])
      expect([...array[skip](2)]).toEqual([3])
      expect([...array[skip](3)]).toEqual([])
      expect([...array[skip](5)]).toEqual([])
    })

    it('skips from the end of arrays', () => {
      const array = [1, 2, 3]

      expect([...[][skip](-1)]).toEqual([])
      expect([...array[skip](-1)]).toEqual([1, 2])
      expect([...array[skip](-2)]).toEqual([1])
      expect([...array[skip](-3)]).toEqual([])
      expect([...array[skip](-5)]).toEqual([])
    })

    it('skips from the beginning of iterables', () => {
      const iterable = new Set([1, 2, 3])

      expect([...iterable[skip](1)]).toEqual([2, 3])
      expect([...iterable[skip](2)]).toEqual([3])
      expect([...iterable[skip](3)]).toEqual([])
      expect([...iterable[skip](5)]).toEqual([])
    })

    it('skips from the end of iterables', () => {
      const iterable = new Set([1, 2, 3])

      expect([...iterable[skip](-1)]).toEqual([1, 2])
      expect([...iterable[skip](-2)]).toEqual([1])
      expect([...iterable[skip](-3)]).toEqual([])
      expect([...iterable[skip](-5)]).toEqual([])
    })
  })

  describe.skip('splice', () => {
    it('splices', () => {
      const array = [1, 3, 4]

      expect([...array[splice](1, 0, 2)]).toEqual([1, 2, 3, 4])
      expect([...array[splice](4, 1, 5)]).toEqual([1, 3, 4, 5])
      expect([...array[splice](2, 2)]).toEqual([1, 3])
      expect([...array[splice](2, 1, 3, 4)]).toEqual([1, 3, 3, 4])
      expect([...array[splice](0, 0, 1)]).toEqual([1, 1, 3, 4])
      expect([...array[splice](0, 1, 1)]).toEqual([1, 3, 4])
      expect([...array[splice](0, 1)]).toEqual([3, 4])
      expect([...array[splice](0, 2)]).toEqual([4])
      expect([...array[splice](0)]).toEqual([])
    })
  })
})
