import { toArray, toMap, toSet, toObject, toWeakMap, toWeakSet, from } from './Convertable'

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

  describe('toWeakMap', () => {
    it('converts iterables to weak maps', () => {
      const object = {}
      const entries: [object, string][] = [
        [object, 'a'],
        [object, 'b'],
        [object, 'c'],
      ]
      const result = entries[toWeakMap]()

      expect(result).toEqual(
        new WeakMap([
          [object, 'a'],
          [object, 'b'],
          [object, 'c'],
        ]),
      )
      expect(result).toBeInstanceOf(WeakMap)
    })
  })

  describe('toWeakSet', () => {
    it('converts iterables to weak sets', () => {
      const object = {}
      const result = [object, object, object][toWeakSet]()

      expect(result).toEqual(new WeakSet([object, object, object]))
      expect(result).toBeInstanceOf(WeakSet)
    })
  })

  describe('from', () => {
    it('wraps iterator-like', () => {
      const iteratorLike = {
        next() {
          return { done: false, value: 123 }
        },
      }
      const iterable = iteratorLike[from]()

      expect(iterable[Symbol.iterator]().next()).toEqual({ done: false, value: 123 })
    })

    it('returns the same iterable', () => {
      const iterable = new Set([1, 2, 3, 4, 5])

      expect(iterable[from]()).toBe(iterable)
    })

    it('returns if done', () => {
      const iterator = {
        next() {
          return { done: true, value: undefined }
        },
      }
      const iterable = iterator[from]()

      expect(iterable[Symbol.iterator]().next()).toEqual({ done: true })
    })

    it('returns if done with value', () => {
      const iterator = {
        next() {
          return { done: true, value: 123 }
        },
      }
      const iterable = iterator[from]()

      expect(iterable[Symbol.iterator]().next()).toEqual({ done: true, value: 123 })
    })
  })
})
