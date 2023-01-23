import { splice } from './Splicable'

describe('Splicable', () => {
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
  })
})
