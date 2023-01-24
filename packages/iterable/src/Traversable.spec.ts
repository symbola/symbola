import { traverse, _break, _continue } from './Traversable'

describe('Traversable', () => {
  it('identity', () => {
    const iterable = new Set([1, 2, 3])
    const result = iterable[traverse]((x) => x)

    expect([...result]).toEqual([1, 2, 3])
  })

  describe('can be short-circuited', () => {
    it('continues', () => {
      const iterable = new Set([1, 2, 3])
      const result = iterable[traverse]((x) => (x === 2 ? _continue : x))

      expect([...result]).toEqual([1, 3])
    })

    it('breaks', () => {
      const iterable = new Set([1, 2, 3])
      const result = iterable[traverse]((x) => (x === 2 ? _break : x))

      expect([...result]).toEqual([1])
    })
  })
})
