import { group, groupToMap } from './Groupable'

describe('Groupable', () => {
  it('groups iterables to objects', () => {
    const o = new Set([1, 2, 3, 4, 5])
    const s = o[group]((x) => x % 2)

    expect(s).toEqual({
      0: [2, 4],
      1: [1, 3, 5],
    })
  })

  it('groups iterables to maps', () => {
    const o = new Set([1, 2, 3, 4, 5])
    const s = o[groupToMap]((x) => x % 2)

    expect(s).toEqual(
      new Map([
        [0, [2, 4]],
        [1, [1, 3, 5]],
      ]),
    )
  })
})
