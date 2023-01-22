import { find } from './Findable'

describe('Findable', () => {
  it('finds', () => {
    const xs = [{ a: 1 }, { a: 2 }, { a: 3 }]
    expect(xs[find](({ a }) => a === 2)).toEqual({ a: 2 })
  })

  it('returns undefined if not found', () => {
    const xs = [{ a: 1 }, { a: 2 }, { a: 3 }]
    expect(xs[find](({ a }) => a === 4)).toBeUndefined()
  })
})
