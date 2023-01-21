import { to } from './Toable'

describe('Tobale', () => {
  it('converts using constructor', () => {
    const array = [1, 2, 3]
    const result = array[to](Set)
    expect(result).toBeInstanceOf(Set)
    expect([...result]).toEqual([1, 2, 3])
  })

  it('converts entries', () => {
    const array: [string, number][] = [
      ['a', 1],
      ['b', 2],
    ]
    // TODO: infer parameters
    const result = array[to]<unknown, Map<string, number>>(Map)
    expect(result).toBeInstanceOf(Map)
    expect([...result]).toEqual([
      ['a', 1],
      ['b', 2],
    ])
  })
})
