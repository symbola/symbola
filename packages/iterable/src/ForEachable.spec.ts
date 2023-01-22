import { forEach } from './ForEachable'

describe('ForEachable', () => {
  it('calls callback for each iterator result', () => {
    const iterable = new Set([1, 2, 3])
    const callback = jest.fn()
    iterable[forEach](callback)
    expect(callback).toHaveBeenCalledTimes(3)
    expect(callback).toHaveBeenCalledWith(1)
    expect(callback).toHaveBeenCalledWith(2)
    expect(callback).toHaveBeenCalledWith(3)
  })
})
