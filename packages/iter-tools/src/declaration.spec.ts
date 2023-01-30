import { getDeclaration, getMethodNames } from './declaration'

describe('declaration', () => {
  it('gets declaration', () => {
    const take = getDeclaration('take')
    const batch = getDeclaration('batch')

    expect(take).toBeDefined()
    expect(batch).toBeDefined()
  })

  it('gets method with dash in name', () => {
    const cycleTimes = getDeclaration('cycle-times')

    expect(cycleTimes).toBeDefined()
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
    const callSignature = declaration.getReturnType()?.getCallSignatures()

    expect(callSignature).toHaveLength(0)
  })

  it('uncurries params', () => {
    const take = getDeclaration('take').getText()

    expect(take).toBe(
      'declare function take<T>(this: Iterable<T>, n: number): IterableIterator<T>;',
    )
  })

  it('uncurries rest params', () => {
    const declaration = getDeclaration('collate').getText()

    expect(declaration).toBe(
      'declare function collate<T>(this: Iterable<T>, ...sources: Array<Wrappable<T>>): IterableIterator<T>;',
    )
  })
})
