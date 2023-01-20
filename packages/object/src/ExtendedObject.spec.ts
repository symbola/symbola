import { map } from '@symbola/core'

import './ExtendedObject'

describe('ExtendedObject', () => {
  it('maps', () => {
    const o = { a: 1 }
    expect(o[map](([key, x]: [string, number]) => [key, x + 1])).toEqual({ a: 2 })
  })
})
