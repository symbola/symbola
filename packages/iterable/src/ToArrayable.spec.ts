import { toArray } from './ToArrayable'

describe('ToArrayable', () => {
  it('converts iterables to arrays', () => {
    const result = [1, 2, 3][toArray]()
    expect(result).toEqual([1, 2, 3])
    expect(result).toBeInstanceOf(Array)
  })
})
