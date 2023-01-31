/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'node:path'
import {
  StructureKind,
  type FunctionDeclaration,
  Project,
  type ParameterDeclarationStructure,
  type Type,
  TypeNode,
} from 'ts-morph'
import { ZipOpenFS } from '@yarnpkg/libzip'

const fs = new ZipOpenFS()
let methodNames: string[]
const { dir } = path.parse(require.resolve('iter-tools'))

const camelCase = (text: string) => text.replace(/-([a-z])/g, (g) => g[1].toUpperCase())

const skip = [
  '$deep-equal',
  '$equal',
  '$interleave',
  '$map',
  '$spliterate',
  '$spliterate-grouped',
  '$str',
  '$zip',
  '$zip-all',
  '$wrap',
  '$window-ahead',
  'wrap-values',
  'wrap-keys',
  'wrap-entries',
  'when',
  'string-from-async',
  'string-from',
  'repeat-times',
  'repeat',
  'range',
  'pipe',
  'object-values',
  'object-keys',
  'object-from-async',
  'object-from',
  'object-entries',
  'not-wrappable',
  'not-undefined',
  'not-string',
  'not-object',
  'not-null',
  'not-nil',
  'not-loopable',
  'not-iterable',
  'not-async-wrappable',
  'not-async-loopable',
  'not-async-iterable',
  'not-array',
  'last-lowest',
  'last-highest',
  'is-wrappable',
  'is-undefined',
  'is-string',
  'is-object',
  'is-null',
  'is-nil',
  'is-loopable',
  'is-iterable',
  'is-async-wrappable',
  'is-async-loopable',
  'is-async-iterable',
  'is-array',
  'get-size',
  'first-lowest',
  'first-highest',
  'exec-pipe',
  'compose',
  'call',
  'async-throttle',
  'async-interleave-ready',
  'async-buffer',
  'array-last-or',
  'array-last',
  'array-first-or',
  'array-first',
  'apply',
  '$size',
  '$reverse',
  '$first-or',
  '$first',
]

export const getMethodNames = () => {
  if (methodNames) {
    return methodNames
  }

  methodNames = fs
    .readdirSync(path.join(dir, 'impls') as any)
    .filter((name) => !skip.includes(name))

  return methodNames
}

export const getSourceText = (method: string) => {
  const isAsync = method.startsWith('async')
  const normalizedMethod = method.replace(/^async/, '').toLowerCase()

  const methodDir = getMethodNames().find((name) => name.endsWith(normalizedMethod))

  if (!methodDir) {
    throw new Error(`Unknown method: ${method}`)
  }

  const fileName = `${isAsync ? `async-` : ''}${normalizedMethod}.d.ts`
  const sourcePath: any = path.join(dir, 'impls', methodDir, fileName)

  return String(fs.readFileSync(sourcePath))
}

export const getSourceFile = (method: string) => {
  return new Project().createSourceFile(`${method}.ts`, getSourceText(method))
}

export const getFunctionDeclaration = (method: string) => {
  const sourceFile = getSourceFile(method)
  const overloadedDeclaration = sourceFile.getFunctionOrThrow(camelCase(method))
  const overloads = overloadedDeclaration.getOverloads()

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const declaration = overloads.find(
    (overload) => overload.getReturnType()?.getCallSignatures().length === 0,
  )!

  uncurry(declaration)

  return declaration
}

const uncurry = (declaration: FunctionDeclaration) => {
  const params = declaration.getParameters()
  const thisParam = declaration.getParameter('iterable') || declaration.getParameter('source')
  const newParams: ParameterDeclarationStructure[] = []
  if (!thisParam) {
    const sources = declaration.getParameter('sources')
    if (sources && sources.isRestParameter()) {
      const type = sources.getType().getArrayElementType()

      newParams.push({
        name: 'this',
        kind: StructureKind.Parameter,
        type: type?.getText(),
      })
    }
  } else {
    newParams.push({ ...thisParam.getStructure(), name: 'this' })
  }
  if (typeof newParams[0].type === 'string') {
    newParams[0].type = newParams[0].type.replace('Wrappable', 'Iterable')
  }
  for (const param of params) {
    if (param !== thisParam) {
      newParams.push(param.getStructure())
    }
    param.remove()
  }

  declaration.addParameters(newParams)
}

const _getReferences = (node: TypeNode | Type) => {
  return (node.getText().match(/\b(\w+)\b/g) || []).filter(({ length }) => length > 1)
}

export const getReferences = (declaration: FunctionDeclaration) => {
  const params = declaration.getParameters()
  const returnType = declaration.getReturnTypeNodeOrThrow()
  const result = [
    ...params.flatMap((param) => _getReferences(param.getType())),
    ..._getReferences(returnType),
  ]
    .map((name) =>
      name === 'SyncIterableIterator' ? 'IterableIterator as SyncIterableIterator' : name,
    )
    .filter((name) => name !== 'Iterable')
    .sort()

  return new Set(result)
}
