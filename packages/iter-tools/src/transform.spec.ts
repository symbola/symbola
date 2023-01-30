import { Project } from "ts-morph";

import templateFixture from './fixtures/template'
import { getTemplateFile, getParts, getTransformer, transformParams } from "./transform"

describe('transform', () => {
  it('gets and cleans template file', () => {
    expect(getTemplateFile().getText()).toBeDefined()
  })

  it('gets template parts', () => {
    const parts = getParts(getTemplateFile())

    expect(parts).toHaveProperty('protocol')
    expect(parts).toHaveProperty('method')
    expect(parts).toHaveProperty('methodParams')
    expect(parts).toHaveProperty('methodTypeParams')
    expect(parts).toHaveProperty('computedProp')
    expect(parts).toHaveProperty('call')
    expect(parts).toHaveProperty('symbolDeclaration')
    expect(parts).toHaveProperty('methodDeclaration')
  })

  it('gets transformer', () => {
    const project = new Project({ useInMemoryFileSystem: true })
    const transformer = getTransformer(project)
    
    expect(transformer).toBeInstanceOf(Function)
  })
  
  it.skip('transforms template', () => {
    const project = new Project({ useInMemoryFileSystem: true })
    const transformer = getTransformer(project)

    const methodName = 'append'
    transformer(methodName)

    const source = project.getSourceFile(`generated/${methodName}.ts`)?.getText()
    
    expect(source).toMatchSnapshot()
  })

  it.skip('transforms collate params', () => {
    const result = transformParams('collate')

    expect(result).toEqual({
      typeParams: ['T'],
      params: ['this: Iterable<T>', '...sources: Array<Iterable<T>>'],
      returnType: 'IterableIterator<T>'
    })
  })
})
