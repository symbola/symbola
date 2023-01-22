import { flatMap } from './FlatMappable'

describe('FlatMappable', () => {
  it('flatmaps iterables', () => {
    const o = ['a b c', 'd e', 'f']
    const s = o[flatMap]((x) => x.split(' '))
    expect([...s]).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
  })
})
