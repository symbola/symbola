import { take } from './template'

describe('Template', () => {
  it('should work', () => {
    const result = [1, 2][take](2)

    expect([...result]).toEqual([1,2])
  })
})
