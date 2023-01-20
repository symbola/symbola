import setSymbolProperty from './setSymbolProperty'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const extend = (target: object, ...sources: any[]): void => {
  sources
    .map((x) =>
      Object.getOwnPropertySymbols(x).map((symbol) => ({
        symbol,
        method: x[symbol],
      })),
    )
    .reduce((a, b) => a.concat(b))
    .forEach(({ symbol, method }) => setSymbolProperty(target, symbol, method))
}

export default extend
