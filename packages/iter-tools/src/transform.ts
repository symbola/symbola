import ts from 'typescript'
import { log } from '@symbola/core'
import { FunctionDeclaration, Project, type SourceFile } from "ts-morph";

import { getDeclaration } from './declaration';


export const getTemplateFile = (templatePath = 'src/template.ts') => {
  const sourceFile = (new Project()).addSourceFileAtPath(templatePath)
  const {
    method,
    methodParams,
    methodTypeParams,
    call,
  } = getParts(sourceFile)
  
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

  return {
    protocol,
    method,
    methodParams,
    methodTypeParams,
    computedProp,
    call,
    symbolDeclaration,
    methodDeclaration,
  }
}

export const getTransformer = (project = new Project()) => {
  const templateStructure = getTemplateFile().getStructure()

  const transformTemplate = (methodName: string) => {
    const sourceFile = project.createSourceFile(`src/generated/${methodName}.ts`, templateStructure)

    const {
      method,
      call,
      symbolDeclaration,
      methodDeclaration
    } = getParts(sourceFile)

    const declaration = getDeclaration(methodName)

    const { typeParams, params, returnType } = transformParams(declaration)

    method.addParameters(params.map(param => param.getStructure()))
    method.addTypeParameters(typeParams.map(param => param.getStructure()))
    method.setReturnType(returnType)

    symbolDeclaration.setInitializer(`Symbol('${methodName}')`)
    symbolDeclaration.rename(methodName);
    methodDeclaration.setInitializer(`require('iter-tools/__methods/${methodName}')`)
    methodDeclaration.rename(`__${methodName}`)

    call.addArguments(params.map(param => param.getName()));

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
