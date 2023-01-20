import extend from "./extend"

it('extends', () => {
  const s1 = Symbol()
  const s2 = Symbol()
  const v1 = 1
  const v2 = 2
  const o: any = {}
  extend(o, {
    [s1]: v1,
    [s2]: v2,
  })

  expect(o[s1]).toBe(v1)
  expect(o[s2]).toBe(v2)
})
