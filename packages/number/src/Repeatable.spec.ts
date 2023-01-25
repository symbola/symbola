import { times } from './Repeatable'

describe('Repeatable', () => {
  it('finite times', () => {
    const result = (3)[times]((i) => i + 1)

    expect([...result]).toEqual([1, 2, 3])
  })

  it('infinite times', () => {
    const iterator = Infinity[times]()[Symbol.iterator]()

    expect(iterator.next().value).toBe(0)
    expect(iterator.next().value).toBe(1)
  })
})
