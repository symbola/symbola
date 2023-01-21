import { compose } from './Composable'

describe('Composable', () => {
  it('composes', () => {
    const f = Math.round[compose](Math.sqrt)
    expect(f(4.2)).toBe(2)
  })
})
