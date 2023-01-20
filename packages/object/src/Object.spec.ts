import { map } from './Object'

it('tests', () => {
  // expect(1).toBe(1)
  const o = { a: 1 }
  expect(o[map](x => x + 1)).toEqual({ a: 2 })
})
