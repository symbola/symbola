import { sort } from './Sortable'

describe('Sortable', () => {
  it('sorts', () => {
    expect([1, 2, 3][sort]()).toEqual([1, 2, 3])
    expect([1, 2, 3][sort]((a, b) => b - a)).toEqual([3, 2, 1])
  })
})
