import { times } from '@symbola/core'
import './NumberExtended'

describe('NumberExtended', () => {
  it('times', () => {
    expect((3)[times]((i) => i)).toEqual([0, 1, 2])
  })
})
