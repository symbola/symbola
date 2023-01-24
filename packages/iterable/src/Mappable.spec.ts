import { map, flatMap } from './Mappable'

describe('Mappable', () => {
  it('maps iterables', () => {
    const o = new Set([1, 2, 3])
    const s = o[map]((x) => x + 1)

    expect([...s]).toEqual([2, 3, 4])
  })

  it('flat maps iterables', () => {
    const o = ['a b c', 'd e', 'f']
    const s = o[flatMap]((x) => x.split(' '))

    expect([...s]).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
  })
})
