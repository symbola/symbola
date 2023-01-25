import { index } from './Indexable'

describe('Indexable', () => {
  it('indexes', () => {
    const iterable = new Set(['a', 'b', 'c'])
    const result = iterable[index]()

    expect([...result]).toEqual([
      [0, 'a'],
      [1, 'b'],
      [2, 'c'],
    ])
    expect([...[][index]()]).toEqual([])
  })
})
