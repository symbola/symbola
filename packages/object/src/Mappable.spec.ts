import { map } from './Mappable'

describe('Mappable', () => {
  it('maps iterables', () => {
    const o = new Set([1, 2, 3])
    const s = o[map]((x) => x + 1)
    expect([...s]).toEqual([2, 3, 4])
  })
})
