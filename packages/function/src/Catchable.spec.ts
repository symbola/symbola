import { _catch } from './Catchable'

describe('Catchable', () => {
  it('catches', () => {
    const throws = () => {
      throw 123
    }
    expect(throws[_catch]((x) => x)()).toBe(123)
  })
})
