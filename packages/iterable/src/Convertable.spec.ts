import { toArray, toMap, toSet, toObject } from './Convertable'

describe('Convertable', () => {
  describe('toArray', () => {
    it('converts iterables to arrays', () => {
      const result = [1, 2, 3][toArray]()
      expect(result).toEqual([1, 2, 3])
      expect(result).toBeInstanceOf(Array)
    })

    it('noops on arrays', () => {
      const result = [1, 2, 3][toArray]()
      expect(result).toBe(result)
    })
  })

  describe('toMap', () => {
    it('converts iterables to maps', () => {
      const entries: [number, string][] = [
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ]
      const result = entries[toMap]()
      expect(result).toEqual(
        new Map([
          [1, 'a'],
          [2, 'b'],
          [3, 'c'],
        ]),
      )
      expect(result).toBeInstanceOf(Map)
    })

    it('noop on maps', () => {
      const entries: [number, string][] = [
        [1, 'a'],
        [2, 'b'],
        [3, 'c'],
      ]
      const result = new Map(entries)[toMap]()
      expect(result).toBe(result)
    })
  })

  describe('toSet', () => {
    it('converts iterables to sets', () => {
      const result = [1, 2, 3][toSet]()
      expect(result).toEqual(new Set([1, 2, 3]))
      expect(result).toBeInstanceOf(Set)
    })

    it('noop on sets', () => {
      const result = new Set([1, 2, 3])[toSet]()
      expect(result).toBe(result)
    })
  })

  describe('toObject', () => {
    it('converts iterables to objects', () => {
      const entries: [string, number][] = [
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ]
      const result = entries[toObject]()
      expect(result).toEqual({
        a: 1,
        b: 2,
        c: 3,
      })
      expect(result).toBeInstanceOf(Object)
    })
  })
})
