import { entries, toMap, values, keys } from './Convertable'

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
})
