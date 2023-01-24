import { reverse } from './Reversable'

describe('Reversable', () => {
  it('reverses', () => {
    const result = [1, 2, 3][reverse]()

    expect([...result]).toEqual([3, 2, 1])
  })
})
