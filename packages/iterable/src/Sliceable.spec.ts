import { slice } from './Sliceable'

describe('Sliceable', () => {
  it('slices', () => {
    const array = [1, 2, 3, 4, 5]
    expect([...array[slice](1, 3)]).toEqual([2, 3])
    expect([...array[slice](3, 1)]).toEqual([])
    expect([...array[slice](3)]).toEqual([4, 5])
    expect([...array[slice](1)]).toEqual([2, 3, 4, 5])
    expect([...array[slice](undefined, 3)]).toEqual([1, 2, 3])
  })
})
