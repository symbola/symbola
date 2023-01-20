import { compose } from '@symbola/core'

import './FunctionExtended'

describe('ExtendedFunction', () => {
  it('composes', () => {
    const f = Math.round[compose](Math.sqrt)
    expect(f(4.2)).toBe(2)
  })
})
