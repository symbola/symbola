import { flip } from './Flippable'

describe('Flippable', () => {
  it('flips arguments', () => {
    const fn = (a: string, b: string) => a + b

    expect(fn[flip]()('a', 'b')).toBe('ba')
  })
})
