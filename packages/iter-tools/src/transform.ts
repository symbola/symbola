import ts from 'typescript'
import { log } from '@symbola/core'
import { Project, type SourceFile } from "ts-morph";

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
    const sourceFile = project.createSourceFile(`generated/${methodName}.ts`, templateStructure)

    const {
      protocol,
      method,
      methodParams,
      methodTypeParams,
      computedProp,
      call,
      symbolDeclaration,
      methodDeclaration
    } = getParts(sourceFile)

    symbolDeclaration.setInitializer(`Symbol('${methodName}')`)
    symbolDeclaration.rename(methodName);
    methodDeclaration.setInitializer(`require('iter-tools/__methods/${methodName}')`)
    methodDeclaration.rename(`__${methodName}`)

    project.saveSync()
  }

  return transformTemplate
}

export const transformParams = (methodName: string) => {
  const declaration = getDeclaration(methodName)

  const result = {
    params: [] as string[],
    typeParams: [] as string[],
    returnType: '',
  }

  const params = declaration.getParameters()
  const sourceParam = declaration.getParameter('source')
  if (sourceParam) {
    sourceParam.rename('this')
    result.params.push(sourceParam.getText())
  }
  const typeParams = declaration.getTypeParameters()

  return result
}
