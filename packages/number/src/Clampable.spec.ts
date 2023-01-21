import { clamp } from './Clampable'

describe('Clampable', () => {
  it('clamps', () => {
    expect((4)[clamp](2, 6)).toBe(4)
    expect((4)[clamp](1, 2)).toBe(2)
    expect((4)[clamp](9, 5)).toBe(5)
  })
})
