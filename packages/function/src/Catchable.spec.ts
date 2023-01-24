import { _catch } from './Catchable'

describe('Catchable', () => {
  it('catches', () => {
    const throws = () => {
      throw 123
    }
    expect(throws[_catch]((x) => x)()).toBe(123)
  })

  it.skip('catches by type', () => {
    const throws = (ctor: ErrorConstructor) => {
      throw new ctor()
    }
    expect(throws[_catch](RangeError)(RangeError)).toBeInstanceOf(RangeError)
  })
})
