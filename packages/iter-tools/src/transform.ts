import ts from 'typescript'
import { FunctionDeclaration, ImportDeclaration, Project, type SourceFile } from 'ts-morph'

import { getFunctionDeclaration, getReferences } from './declaration'

export const getTemplateFile = (templatePath = 'src/template.ts') => {
  const sourceFile = new Project().addSourceFileAtPath(templatePath)
  const { method, methodParams, methodTypeParams, call } = getParts(sourceFile)

  method.removeReturnType()
  methodParams.forEach((param) => void param.remove())
  methodTypeParams.forEach((param) => void param.remove())
  call.getArguments().forEach(() => void call.removeArgument(0))

  return sourceFile
}

export const getParts = (template: SourceFile) => {
  const protocol = template.getClassOrThrow('Protocol')
  const method = protocol.getMethods()[0]
  const methodParams = method.getParameters()
  const methodTypeParams = method.getTypeParameters()
  const computedProp = method.getChildrenOfKind(ts.SyntaxKind.ComputedPropertyName)[0]
  const call = method.getDescendantsOfKind(ts.SyntaxKind.CallExpression)[0]
  const symbolDeclaration = template.getVariableDeclarationOrThrow('take')
  const methodDeclaration = template.getVariableDeclarationOrThrow('__take')
  const importDeclaration = template.getImportDeclarationOrThrow('iter-tools')

  return {
    protocol,
    method,
    methodParams,
    methodTypeParams,
    computedProp,
    call,
    symbolDeclaration,
    methodDeclaration,
    importDeclaration,
  }
}

export const getTransformer = (project = new Project()) => {
  const templateStructure = getTemplateFile().getStructure()

  const transformTemplate = (methodName: string) => {
    const sourceFile = project.createSourceFile(`src/generated/${methodName}.ts`, templateStructure)

    const { method, call, symbolDeclaration, methodDeclaration, importDeclaration } =
      getParts(sourceFile)

    const functionDeclaration = getFunctionDeclaration(methodName)

    const { typeParams, params, returnType } = transformParams(functionDeclaration)

    method.addParameters(params.map((param) => param.getStructure()))
    method.addTypeParameters(typeParams.map((param) => param.getStructure()))
    method.setReturnType(returnType)

    symbolDeclaration.setInitializer(`Symbol('${methodName}')`)
    symbolDeclaration.rename(methodName)
    methodDeclaration.setInitializer(`require('iter-tools/__methods/${methodName}')`)
    methodDeclaration.rename(`__${methodName}`)

    call.addArguments(params.map((param) => param.getName()))

    updateImports(importDeclaration, functionDeclaration)

    project.saveSync()
  }

  return transformTemplate
}

export const transformParams = (declaration: FunctionDeclaration) => {
  const params = declaration.getParameters()
  const typeParams = declaration.getTypeParameters()

  return {
    typeParams,
    params,
    returnType: declaration.getReturnType().getText(),
  }
}

export const updateImports = (
  importDeclaration: ImportDeclaration,
  functionDeclaration: FunctionDeclaration,
) => {
  const references = getReferences(functionDeclaration)

  importDeclaration.removeNamedImports()
  importDeclaration.addNamedImports([...references].map((ref) => `type ${ref}`))
}
