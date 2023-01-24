import { _curry } from './Curryable'

describe('Curryable', () => {
  it('curries a binary function', () => {
    const add = (a: number, b: number) => a + b

    expect(add[_curry]()(1)(2)).toBe(3)
  })
})
