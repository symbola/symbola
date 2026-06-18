export type JSDocTags = Record<string, string[]>

export type SignatureParameter = {
  readonly name: string
  readonly type: string
}

export type SignatureInfo = {
  readonly parameters: readonly SignatureParameter[]
  readonly returnCallSignatures: readonly {
    readonly parameters: readonly SignatureParameter[]
    readonly returnType: string
  }[]
  readonly returnType: string
}

export type EffectPackageInfo = {
  readonly root: string
  readonly version: string
}

export type EffectExport = {
  readonly declarationKind: string
  readonly initKind: string
  readonly jsdoc: JSDocTags
  readonly localName: string
  readonly method: string
  readonly signatures: readonly SignatureInfo[]
  readonly snippet: string
}

export type EffectModuleSurface = {
  readonly exports: readonly EffectExport[]
  readonly module: string
}
