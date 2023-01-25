import { entries, toMap, values, keys, to } from './Convertable'

describe('Convertable', () => {
  it('converts records to entries', () => {
    const record: Record<string, number> = {
      a: 1,
      b: 2,
    }
    const result: [string, number][] = record[entries]()

    expect(result).toEqual([
      ['a', 1],
      ['b', 2],
    ])
    expect(result).toBeInstanceOf(Array)
  })

  it('converts records to maps', () => {
    const record: Record<string, number> = {
      a: 1,
      b: 2,
    }
    const result: Map<string, number> = record[toMap]()

    expect(result).toEqual(
      new Map([
        ['a', 1],
        ['b', 2],
      ]),
    )
    expect(result).toBeInstanceOf(Map)
  })

  it('converts records to values', () => {
    const record: Record<string, number> = {
      a: 1,
      b: 2,
    }
    const result: number[] = record[values]()

    expect(result).toEqual([1, 2])
    expect(result).toBeInstanceOf(Array)
  })

  it('converts records to keys', () => {
    const record: Record<string, number> = {
      a: 1,
      b: 2,
    }
    const result: string[] = record[keys]()

    expect(result).toEqual(['a', 'b'])
    expect(result).toBeInstanceOf(Array)
  })

  describe('to', () => {
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
})
