import { toArray } from './Convertable'

describe('Convertable', () => {
  describe('toArray', () => {
    it('collects all values from an async iterable into an array', async () => {
      const asyncIterable = (async function* () {
        yield* [1, 2, 3]
      })()
      const result = await asyncIterable[toArray]()

      expect(result).toEqual([1, 2, 3])
    })

    it('collects all values from an array into an array', async () => {
      const asyncIterable = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]
      const result = await asyncIterable[toArray]()

      expect(result).toEqual([1, 2, 3])
    })

    it('collects all values from an iterable into an array', async () => {
      const iterable = function* () {
        yield* [1, 2, 3]
      }
      const result = await iterable()[toArray]()

      expect(result).toEqual([1, 2, 3])
    })
  })
})
