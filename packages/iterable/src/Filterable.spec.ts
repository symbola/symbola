import { filter } from './Filterable'

describe('Filterable', () => {
  it('filters iterables', () => {
    const o = new Set([1, 2, 3])
    const s = o[filter]((x) => x > 1)

    expect([...s]).toEqual([2, 3])
  })
})
