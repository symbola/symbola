import { value } from './Valuable'

describe('Valuable', () => {
  it('compares to self', () => {
    const object = { a: 1, b: 2 }
    expect(object[value]()).toBe(object[value]())
    expect(object[value]()).not.toBe({ a: 2, b: 3 }[value]())
  })
})
