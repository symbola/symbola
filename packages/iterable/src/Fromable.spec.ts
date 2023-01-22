import { from } from './Fromable'

describe('Fromable', () => {
  it('wraps iterator-like', () => {
    const iterator = {
      next() {
        return { done: false, value: 123 }
      },
    }
    const iterable = iterator[from]()
    expect(iterable[Symbol.iterator]().next()).toEqual({ done: false, value: 123 })
  })
})
