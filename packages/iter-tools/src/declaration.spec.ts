import { getDeclaration, getMethodNames } from './declaration'

describe('declaration', () => {
  it('gets declaration', () => {
    const declaration = getDeclaration('take')

    expect(declaration).toBeDefined()
  })

  it('gets async declaration', () => {
    const declaration = getDeclaration('asyncTake')

    expect(declaration).toBeDefined()
  })

  it('gets method names', () => {
    const names = getMethodNames()

    expect(names).toContain('$take')
  })

  it('filters out overload', () => {
    const declaration = getDeclaration('take')
    
    expect(declaration?.getOverloads()).toHaveLength(1)
  })
  
  it('uncurries params', () => {
    const take = getDeclaration('take').getText()

    expect(take).toBe('declare function take<T>(this: Iterable<T>, n: number): IterableIterator<T>;')
  })

  it('uncurries rest params', () => {
    const declaration = getDeclaration('collate').getText()

    expect(declaration).toBe('declare function collate<T>(this: Iterable<T>, ...sources: Array<Wrappable<T>>): IterableIterator<T>;')
  })
})
