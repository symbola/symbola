import fs from 'node:fs'
import { Project, SourceFile } from 'ts-morph'
import prettier from 'prettier'

import {
  getTemplateFile,
  getParts,
  getTransformer,
  transformParams,
  updateImports,
} from './transform'
import { getFunctionDeclaration } from './declaration'

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
    expect(parts).toHaveProperty('importDeclaration')
  })

  it('gets transformer', () => {
    const project = new Project({ useInMemoryFileSystem: true })
    const transformer = getTransformer(project)

    expect(transformer).toBeInstanceOf(Function)
  })

  it('transforms template', () => {
    const project = new Project({ useInMemoryFileSystem: true })
    const transformer = getTransformer(project)

    const methodName = 'append'
    transformer(methodName)

    const source = project.getSourceFile(`src/generated/${methodName}.ts`)!

    const fixtureString = fs.readFileSync('./src/fixtures/append.ts').toString()
    const fixture = project.createSourceFile('fixture.ts', fixtureString)

    const format = (source: SourceFile) =>
      prettier.format(source.getText(), { parser: 'typescript' })

    expect(format(source)).toBe(format(fixture))
  })

  it('transforms collate params', () => {
    const { typeParams, params, returnType } = transformParams(getFunctionDeclaration('collate'))

    expect({
      typeParams: typeParams.map((param) => param.getText()),
      params: params.map((param) => param.getText()),
      returnType,
    }).toEqual({
      typeParams: ['T'],
      params: ['this: Iterable<T>', '...sources: Array<Wrappable<T>>'],
      returnType: 'IterableIterator<T>',
    })
  })

  it('updates imports', () => {
    const functionDeclaration = getFunctionDeclaration('fork')
    const { importDeclaration } = getParts(getTemplateFile())
    updateImports(importDeclaration, functionDeclaration)

    const expected = `import { type IterableIterator as SyncIterableIterator, type SingletonIterableIterator } from 'iter-tools'`

    expect(importDeclaration.getText()).toBe(expected)
  })
})
