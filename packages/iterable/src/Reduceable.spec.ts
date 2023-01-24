import { reduce } from './Reduceable'

describe('Reduceable', () => {
  it('reduces iterables', () => {
    const iterable = new Set([1, 2])
    const result = iterable[reduce]((a, b) => a + b)

    expect(result).toEqual(3)
  })

  it('reduces iterables with initial value', () => {
    const iterable = new Set([1, 2, 3])
    const result = iterable[reduce]((a, b) => a + b, 1)

    expect(result).toEqual(7)
  })

  it('reduces iterables to a different type', () => {
    const iterable = new Set([1, 2, 3])
    const result = iterable[reduce]((a, b) => `${a}${b}`, '')

    expect(result).toEqual('123')
  })

  it('reduces arrays', () => {
    const array = [1, 2]
    const result = array[reduce]((a, b) => a + b)

    expect(result).toEqual(3)
  })

  it('reduces arrays with initial value', () => {
    const array = [1, 2, 3]
    const result = array[reduce]((a, b) => a + b, 1)

    expect(result).toEqual(7)
  })
})
