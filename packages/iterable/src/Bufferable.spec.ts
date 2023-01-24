import { buffer } from './Bufferable'

describe('Bufferable', () => {
  it('buffers last values of an iterable', () => {
    const iterable = new Set([1, 2, 3, 4, 5])
    expect([...iterable[buffer](3)]).toEqual([3, 4, 5])
  })

  it('buffers last values of an array', () => {
    const array = [1, 2, 3, 4, 5]
    expect([...array[buffer](3)]).toEqual([3, 4, 5])
  })
})
