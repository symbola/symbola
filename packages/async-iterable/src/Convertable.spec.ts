import { toArray } from './Convertable'

describe('Convertable', () => {
  it('collects all values from an async iterable into an array', async () => {
    const asyncIterable = (async function* () {
      yield* [1, 2, 3]
    })()
    const result = await asyncIterable[toArray]()
    expect(result).toEqual([1, 2, 3])
  })
})
