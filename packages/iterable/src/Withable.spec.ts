import { _with } from './Withable'

describe('Withable', () => {
  it('should with arrays', () => {
    const array = [1, 2, 3]

    expect([...array[_with](1, 4)]).toEqual([1, 4, 3])
    expect(() => [...array[_with](4, 4)]).toThrow(RangeError('Index 4 is out of range'))
  })
})
