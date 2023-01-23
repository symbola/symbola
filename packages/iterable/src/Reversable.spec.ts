import { reverse } from './Reversable'

describe('Reversable', () => {
  it('reverses', () => {
    expect([1, 2, 3][reverse]()).toEqual([3, 2, 1])
  })
})
