import { getFunctionDeclaration, getMethodNames, getReferences } from './declaration'

describe('declaration', () => {
  it('gets declaration', () => {
    const take = getFunctionDeclaration('take')
    const batch = getFunctionDeclaration('batch')

    expect(take).toBeDefined()
    expect(batch).toBeDefined()
  })

  it('gets method with dash in name', () => {
    const cycleTimes = getFunctionDeclaration('cycle-times')

    expect(cycleTimes).toBeDefined()
  })

  it('gets async declaration', () => {
    const declaration = getFunctionDeclaration('asyncTake')

    expect(declaration).toBeDefined()
  })

  it('gets method names', () => {
    const names = getMethodNames()

    expect(names).toContain('$take')
  })

  it('filters out overload', () => {
    const declaration = getFunctionDeclaration('take')
    const callSignature = declaration.getReturnType()?.getCallSignatures()

    expect(callSignature).toHaveLength(0)
  })

  it('uncurries params', () => {
    const take = getFunctionDeclaration('take').getText()

    expect(take).toBe(
      'declare function take<T>(this: Iterable<T>, n: number): IterableIterator<T>;',
    )
  })

  it('uncurries rest params', () => {
    const declaration = getFunctionDeclaration('collate').getText()

    expect(declaration).toBe(
      'declare function collate<T>(this: Iterable<T>, ...sources: Array<Wrappable<T>>): IterableIterator<T>;',
    )
  })

  it('gets references', () => {
    const result = getReferences(getFunctionDeclaration('fork'))

    expect(result).toEqual(
      new Set(['IterableIterator as SyncIterableIterator', 'SingletonIterableIterator'].sort()),
    )
  })
})
