import setSymbolProperty from './setSymbolProperty'

it('sets symbol property', () => {
  const s = Symbol()
  const o: any = {}
  const v = 1

  setSymbolProperty(o, s, v)

  expect(o[s]).toBe(v)
})
