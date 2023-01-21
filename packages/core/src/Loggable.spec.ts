import { log, _logger } from './Loggable'

describe('Loggable', () => {
  it('logs', () => {
    const fn = jest.fn((x) => x)
    const o = {
      [_logger]: fn,
    }
    expect(o[log](123)).toBe(o)
    expect(fn).toHaveBeenCalledWith(123, o)
    expect(o[log]()).toBe(o)
  })
})
