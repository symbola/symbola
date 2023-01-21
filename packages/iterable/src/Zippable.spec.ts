import { zip } from './Zippable'

describe('Zippable', () => {
  it('zips two iterables', () => {
    const iterable1 = [1, 2, 3]
    const iterable2 = [4, 5, 6]
    const result = iterable1[zip](iterable2)
    expect([...result]).toEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ])
  })
})
