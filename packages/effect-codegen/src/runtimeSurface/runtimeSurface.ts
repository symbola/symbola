/// <reference types="node" />

import fs from "node:fs"
import path from "node:path"
import type { SymbolaMethod, SymbolaSourceFile } from "../supportedPairs/symbola.types.ts"

const exportedConstSymbol = /export const (?<name>\w+): unique symbol/g
const reexportList = /export \{(?<names>[^}]+)\} from/g
const classSymbolMethod = /\[(?<symbol>\w+)\](?:<|\()/g
const protocolEntrySymbol = /symbol:\s*(?<symbol>\w+)/g
const installedPropertySymbol = /installProperty\([^,]+,\s*(?<symbol>\w+),/g

const modulesByRuntimeFile = new Map<string, readonly string[]>([
  ["Array.ts", ["effect/Array"]],
  ["Chunk.ts", ["effect/Chunk"]],
  ["Effect.ts", ["effect/Effect"]],
  ["Exit.ts", ["effect/Exit"]],
  ["HashMap.ts", ["effect/HashMap"]],
  ["HashSet.ts", ["effect/HashSet"]],
  ["Option.ts", ["effect/Option"]],
  ["Result.ts", ["effect/Result"]],
  ["Schema.ts", ["effect/Schema", "effect/SchemaParser"]],
  ["Stream.ts", ["effect/Stream"]]
])

const constructorModulesBySymbol = new Map<string, readonly string[]>([
  ["fail", ["effect/Effect"]],
  ["gen", ["effect/Effect", "effect/Option"]],
  ["promise", ["effect/Effect"]],
  ["succeed", ["effect/Effect", "effect/Result"]],
  ["sync", ["effect/Effect"]],
  ["tryPromise", ["effect/Effect"]],
  ["try_", ["effect/Effect", "effect/Result"]],
  ["fromNullable", ["effect/Option"]],
  ["some", ["effect/Option"]]
])

export function loadImplementedSymbols(symbolaPackageDir: string): ReadonlySet<string> {
  return collectImplementedSymbols(readSymbolaSources(symbolaPackageDir))
}

export function loadImplementedPairs(symbolaPackageDir: string): ReadonlySet<string> {
  return collectImplementedPairs(readSymbolaSources(symbolaPackageDir))
}

export function collectImplementedSymbols(
  files: readonly SymbolaSourceFile[]
): ReadonlySet<string> {
  const symbols = new Set<string>()
  for (const file of files) {
    for (const match of file.text.matchAll(exportedConstSymbol)) {
      if (match.groups?.name !== undefined) {
        symbols.add(match.groups.name)
      }
    }
    for (const match of file.text.matchAll(reexportList)) {
      const names = match.groups?.names
      if (names === undefined) {
        continue
      }
      for (const name of names.split(",")) {
        const exportedName = name
          .trim()
          .split(/\s+as\s+/)
          .at(-1)
        if (exportedName) {
          symbols.add(exportedName)
        }
      }
    }
  }
  return symbols
}

export function filterImplementedPairs(
  methods: readonly SymbolaMethod[],
  implementedPairs: ReadonlySet<string>
): readonly SymbolaMethod[] {
  return methods.filter((method) => implementedPairs.has(pairKey(method.effectModule, method.symbol)))
}

export function selectRuntimeBackedMethods(
  methods: readonly SymbolaMethod[],
  implementedPairs: ReadonlySet<string>,
  generatedRuntimePairs: ReadonlySet<string>
): readonly SymbolaMethod[] {
  return filterImplementedPairs(methods, new Set([...implementedPairs, ...generatedRuntimePairs]))
}

export function collectImplementedPairs(files: readonly SymbolaSourceFile[]): ReadonlySet<string> {
  const pairs = new Set<string>()
  for (const file of files) {
    const fileName = path.basename(file.path)
    const symbols = collectImplementedSymbolsFromSource(file.text)
    if (fileName === "Constructors.ts") {
      for (const symbol of symbols) {
        for (const moduleSpecifier of constructorModulesBySymbol.get(symbol) ?? []) {
          pairs.add(pairKey(moduleSpecifier, symbol))
        }
      }
      continue
    }
    for (const moduleSpecifier of modulesByRuntimeFile.get(fileName) ?? []) {
      for (const symbol of symbols) {
        pairs.add(pairKey(moduleSpecifier, symbol))
      }
    }
  }
  return pairs
}

function readSymbolaSources(symbolaPackageDir: string): readonly SymbolaSourceFile[] {
  return readSourceFiles(path.resolve(symbolaPackageDir, "src"))
}

function readSourceFiles(directory: string): readonly SymbolaSourceFile[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.resolve(directory, entry.name)
    if (entry.isDirectory()) {
      return readSourceFiles(filePath)
    }
    if (!entry.name.endsWith(".ts") || entry.name.endsWith(".test.ts")) {
      return []
    }
    return [
      {
        path: filePath,
        text: fs.readFileSync(filePath, "utf8")
      }
    ]
  })
}

function collectImplementedSymbolsFromSource(text: string): ReadonlySet<string> {
  const symbols = new Set<string>()
  for (const pattern of [classSymbolMethod, protocolEntrySymbol, installedPropertySymbol]) {
    for (const match of text.matchAll(pattern)) {
      if (match.groups?.symbol !== undefined) {
        symbols.add(match.groups.symbol)
      }
    }
  }
  return symbols
}

function pairKey(moduleSpecifier: string, symbol: string): string {
  return `${moduleSpecifier}:${symbol}`
}
