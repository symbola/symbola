import { times } from './Timesable'

describe('Timesable', () => {
  it('times', () => {
    expect((3)[times]((i) => i)).toEqual([0, 1, 2])
  })
})
