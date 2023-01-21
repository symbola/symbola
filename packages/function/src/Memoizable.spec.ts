import { memoize } from './Memoizable'

describe('Memoizable', () => {
  it('returns a function', () => {
    expect((() => void 0)[memoize]()).toBeInstanceOf(Function)
  })

  it('memoizes', () => {
    const fn = ((n: number) => Symbol(n))[memoize]()
    expect(fn(1)).toBe(fn(1))
    expect(fn(1)).not.toBe(fn(2))
  })
})
