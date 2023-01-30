/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'node:path'
import { StructureKind, type FunctionDeclaration, Project, type SourceFile, type ParameterDeclarationStructure } from "ts-morph";
import { ZipOpenFS } from '@yarnpkg/libzip'

const fs = new ZipOpenFS()
let methodNames: string[]
const { dir } = path.parse(require.resolve('iter-tools'))

export const getMethodNames = () => {
  if (methodNames) {
    return methodNames
  }

  methodNames = fs.readdirSync(path.join(dir, 'impls') as any)

  return methodNames
}

export const getSourceText = (method: string) => {
  const isAsync = method.startsWith('async')
  const normalizedMethod = method.replace(/^async/, '').toLowerCase()
  
  const methodDir = getMethodNames().find((name) => name.endsWith(normalizedMethod))

  if (!methodDir) {
    throw new Error(`Unknown method ${method}`)
  }

  const fileName = `${isAsync ? `async-` : ''}${normalizedMethod}.d.ts`
  const sourcePath: any = path.join(dir, 'impls', methodDir, fileName)

  console.log(23, sourcePath)
  return String(fs.readFileSync(sourcePath))
}

export const getSourceFile = (method: string, isAsync: boolean) => {
  return (new Project()).createSourceFile(`${method}.ts`, getSourceText(method, isAsync));
}

export const getDeclaration = (method: string, isAsync = false) => {
  const sourceFile = getSourceFile(method, isAsync)
  const declaration = sourceFile.getFunctionOrThrow(method)
  const overloads = declaration.getOverloads()

  for (const overload of overloads) {
    if (overload.getReturnType()?.getCallSignatures().length > 0) {
      overload.remove()
    }
  }

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

  // console.log(declaration.getText())
}
