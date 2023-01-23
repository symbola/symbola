import { collect } from './Collectable'

describe('Collectable', () => {
  it('collects all values from an async iterable into an array', async () => {
    const asyncIterable = (async function* () {
      yield* [1, 2, 3]
    })()
    const result = await asyncIterable[collect]()
    expect(result).toEqual([1, 2, 3])
  })
})
