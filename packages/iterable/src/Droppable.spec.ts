import { drop } from './Droppable'

describe('Droppable', () => {
  it('drops from iterables', () => {
    const iterable = new Set([1, 2, 3, 4, 5])
    const result = iterable[drop](3)
    expect([...result]).toEqual([4, 5])
  })
})
