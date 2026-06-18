import type { SymbolaPair } from "./supportedPairs.ts"

export type Replacement = {
  readonly range: [number, number]
  readonly text: string
}

export type ImportSpecifierModel = {
  readonly imported: string
  readonly local: string
}

export type ImportDeclarationModel = {
  readonly hasComments: boolean
  readonly hasOnlyNamedSpecifiers: boolean
  readonly hasTypeOnlySpecifiers: boolean
  readonly quote: "'" | "\""
  readonly range: [number, number]
  readonly source: string
  readonly specifiers: readonly ImportSpecifierModel[]
}

export type ImportPlan = {
  readonly blocked: boolean
  readonly edits: readonly Replacement[]
}

const constructorSymbols = new Set([
  "fail",
  "fromNullable",
  "gen",
  "promise",
  "some",
  "succeed",
  "sync",
  "tryPromise",
  "try_"
])

export function symbolaImportSource(pair: Pick<SymbolaPair, "module" | "symbol">): string {
  if (constructorSymbols.has(pair.symbol)) {
    return "@symbola/effect/Constructors"
  }
  if (pair.module === "effect/SchemaParser") {
    return "@symbola/effect/Schema"
  }
  if (pair.module === "effect/Effect") {
    return "@symbola/effect"
  }
  return `@symbola/effect/${pair.module.slice("effect/".length)}`
}

export function planSymbolImports(input: {
  readonly boundNames: ReadonlySet<string>
  readonly imports: readonly ImportDeclarationModel[]
  readonly needed: readonly Pick<SymbolaPair, "module" | "symbol">[]
}): ImportPlan {
  const neededBySource = groupNeededSymbols(input.needed)
  const edits: Replacement[] = []
  const reservedNames = new Set(input.boundNames)

  for (const [source, neededSymbols] of neededBySource) {
    const existingImports = input.imports.filter((declaration) => declaration.source === source)
    if (existingImports.some((declaration) => declaration.hasTypeOnlySpecifiers)) {
      return blockedPlan
    }
    const importedSymbols = new Set(
      existingImports.flatMap((declaration) =>
        declaration.specifiers
          .filter((specifier) => specifier.imported === specifier.local)
          .map((specifier) => specifier.imported)
      )
    )
    const missingSymbols = [...neededSymbols].filter((symbol) => !importedSymbols.has(symbol))
    if (missingSymbols.length === 0) {
      continue
    }
    if (missingSymbols.some((symbol) => reservedNames.has(symbol))) {
      return blockedPlan
    }

    if (existingImports.length > 0) {
      if (existingImports.length !== 1) {
        return blockedPlan
      }
      const declaration = existingImports[0]!
      if (
        declaration.hasComments ||
        !declaration.hasOnlyNamedSpecifiers ||
        declaration.specifiers.some((specifier) => specifier.imported !== specifier.local)
      ) {
        return blockedPlan
      }
      const symbols = [
        ...new Set([
          ...declaration.specifiers.map((specifier) => specifier.imported),
          ...missingSymbols
        ])
      ].toSorted()
      edits.push({
        range: declaration.range,
        text: `import { ${symbols.join(", ")} } from ${declaration.quote}${source}${declaration.quote};`
      })
      for (const symbol of missingSymbols) {
        reservedNames.add(symbol)
      }
      continue
    }

    const lastImport = input.imports.at(-1)
    const symbols = missingSymbols.toSorted()
    const importText = `import { ${symbols.join(", ")} } from "${source}";`
    edits.push(
      lastImport === undefined
        ? { range: [0, 0], text: `${importText}\n` }
        : {
          range: [lastImport.range[1], lastImport.range[1]],
          text: `\n${importText}`
        }
    )
    for (const symbol of missingSymbols) {
      reservedNames.add(symbol)
    }
  }

  return { blocked: false, edits }
}

const blockedPlan: ImportPlan = { blocked: true, edits: [] }

function groupNeededSymbols(
  needed: readonly Pick<SymbolaPair, "module" | "symbol">[]
): Map<string, Set<string>> {
  const grouped = new Map<string, Set<string>>()
  for (const pair of needed) {
    const source = symbolaImportSource(pair)
    const group = grouped.get(source)
    if (group === undefined) {
      grouped.set(source, new Set([pair.symbol]))
    } else {
      group.add(pair.symbol)
    }
  }
  return grouped
}
