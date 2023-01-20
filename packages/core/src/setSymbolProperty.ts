const setSymbolProperty = (target: object, symbol: symbol, value: unknown) =>
  Object.defineProperty(target, symbol, {
    value,
    writable: false,
    enumerable: false,
  })

export default setSymbolProperty
