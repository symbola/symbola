import {
  intersection,
  union,
  difference,
  symmetricDifference,
  isSubsetOf,
  isSupersetOf,
  isDisjointFrom,
} from './SetMethods'

describe('SetMethods', () => {
  it('intersects', () => {
    const a = new Set([1, 2, 3])
    const b = new Set([2, 3, 4])

    expect([...a[intersection](b)]).toEqual([2, 3])
  })

  it('unites', () => {
    const a = new Set([1, 2, 3])
    const b = new Set([2, 3, 4])

    expect([...a[union](b)]).toEqual([1, 2, 3, 4])
  })

  it('differs', () => {
    const a = new Set([1, 2, 3])
    const b = new Set([2, 3, 4])

    expect([...a[difference](b)]).toEqual([1])
  })

  it('symmetrically differs', () => {
    const a = new Set([1, 2, 3])
    const b = new Set([2, 3, 4])

    expect([...a[symmetricDifference](b)]).toEqual([1, 4])
  })

  it('checks subset', () => {
    const a = new Set([1, 2, 3])
    const b = new Set([2, 3, 4])

    expect(a[isSubsetOf](b)).toBe(false)
    expect(b[isSubsetOf](a)).toBe(false)
  })

  it('checks superset', () => {
    const a = new Set([1, 2, 3])
    const b = new Set([2, 3, 4])

    expect(a[isSupersetOf](b)).toBe(false)
    expect(b[isSupersetOf](a)).toBe(false)
  })

  it('checks disjoint', () => {
    const a = new Set([1, 2, 3])
    const b = new Set([2, 3, 4])

    expect(a[isDisjointFrom](b)).toBe(false)
    expect(b[isDisjointFrom](a)).toBe(false)
  })
})
