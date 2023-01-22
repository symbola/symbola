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
})
