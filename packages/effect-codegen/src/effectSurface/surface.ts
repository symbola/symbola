/// <reference types="node" />

import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { parseSync } from "oxc-parser";
import type { Comment, Expression, Statement } from "oxc-parser";
import ts from "typescript";
import type {
  EffectModuleSurface,
  EffectPackageInfo,
  JSDocTags,
  SignatureInfo,
} from "./effect.types.ts";

const targetModules = [
  "Array",
  "Chunk",
  "Effect",
  "Exit",
  "HashMap",
  "HashSet",
  "Option",
  "Result",
  "Schema",
  "SchemaParser",
  "Stream",
] as const;

type EffectPackageJson = {
  readonly version: string;
};

type LocalExport = {
  readonly declarationKind: string;
  readonly initKind: string;
  readonly jsdoc: JSDocTags;
  readonly localName: string;
  readonly name: string;
  readonly snippet: string;
};

type LocalDeclaration = Omit<LocalExport, "name">;

type TsLocalDeclaration = {
  readonly jsdocNode: ts.Node;
  readonly name: ts.Identifier;
};

type OxcNode = {
  readonly end: number;
  readonly start: number;
  readonly type: string;
};

type OxcIdentifier = OxcNode & {
  readonly name: string;
  readonly type: "Identifier";
};

type OxcVariableDeclarator = OxcNode & {
  readonly id?: OxcIdentifier;
  readonly init?: Expression | null;
};

type OxcVariableDeclaration = OxcNode & {
  readonly declarations: readonly OxcVariableDeclarator[];
  readonly kind: string;
  readonly type: "VariableDeclaration";
};

type OxcFunctionDeclaration = OxcNode & {
  readonly id?: OxcIdentifier | null;
  readonly type: "FunctionDeclaration";
};

type OxcExportSpecifier = OxcNode & {
  readonly exported?: OxcIdentifier;
  readonly local?: OxcIdentifier;
};

type OxcExportNamedDeclaration = OxcNode & {
  readonly declaration?: OxcFunctionDeclaration | OxcVariableDeclaration | null;
  readonly source?: unknown;
  readonly specifiers: readonly OxcExportSpecifier[];
  readonly type: "ExportNamedDeclaration";
};

type OxcCallExpression = OxcNode & {
  readonly callee?: Expression | null;
  readonly type: "CallExpression";
};

type OxcMemberExpression = OxcNode & {
  readonly object?: Expression | null;
  readonly property?: Expression | null;
  readonly type: "MemberExpression";
};

export function loadEffectSurface(syntaxPackageDir: string): {
  readonly effectPackage: EffectPackageInfo;
  readonly modules: readonly EffectModuleSurface[];
} {
  const require = createRequire(import.meta.url);
  const packageJsonPath = require.resolve("effect/package.json", {
    paths: [syntaxPackageDir],
  });
  const root = path.dirname(packageJsonPath);
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8")) as EffectPackageJson;
  const sourceFiles = targetModules.map((moduleName) => path.join(root, "src", `${moduleName}.ts`));
  const program = ts.createProgram(sourceFiles, {
    allowImportingTsExtensions: true,
    allowJs: false,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noEmit: true,
    skipLibCheck: true,
    strict: true,
    target: ts.ScriptTarget.ES2022,
  });
  const checker = program.getTypeChecker();
  return {
    effectPackage: {
      root,
      version: packageJson.version,
    },
    modules: targetModules.map((moduleName) => {
      const filePath = path.join(root, "src", `${moduleName}.ts`);
      const source = fs.readFileSync(filePath, "utf8");
      const exports = collectOxcExports(filePath, source);
      const sourceFile = program.getSourceFile(filePath);
      return {
        module: `effect/${moduleName}`,
        exports: exports.map((item) => ({
          declarationKind: item.declarationKind,
          initKind: item.initKind,
          jsdoc: sourceFile
            ? collectTypeScriptMetadata(checker, sourceFile, item.localName).jsdoc
            : item.jsdoc,
          localName: item.localName,
          method: item.name,
          signatures: sourceFile
            ? collectTypeScriptMetadata(checker, sourceFile, item.localName).signatures
            : [],
          snippet: item.snippet,
        })),
      };
    }),
  };
}

function collectOxcExports(filePath: string, source: string): readonly LocalExport[] {
  const parsed = parseSync(filePath, source, {
    lang: "ts",
    range: true,
    sourceType: "module",
  });
  const comments = parsed.comments ?? [];
  const declarations = new Map<string, LocalDeclaration>();
  const exports = new Map<string, LocalExport>();
  for (const statement of parsed.program.body as readonly Statement[]) {
    collectLocalDeclaration(statement, source, comments, declarations);
    if (statement.type !== "ExportNamedDeclaration") continue;
    const exportDeclaration = statement as OxcExportNamedDeclaration;
    if (!exportDeclaration.declaration) {
      if (!exportDeclaration.source) {
        collectNamedExportSpecifiers(exportDeclaration, declarations, exports);
      }
      continue;
    }
    collectExportedDeclaration(exportDeclaration.declaration, source, comments, exports);
  }
  const values = Array.from(exports.values());
  values.sort(compareLocalExports);
  return values;
}

function collectExportedDeclaration(
  declaration: OxcFunctionDeclaration | OxcVariableDeclaration,
  source: string,
  comments: readonly Comment[],
  exports: Map<string, LocalExport>,
): void {
  if (declaration.type === "VariableDeclaration") {
    for (const declarator of declaration.declarations) {
      if (declarator.id?.type !== "Identifier") continue;
      exports.set(declarator.id.name, {
        declarationKind: declaration.kind,
        initKind: describeExpression(declarator.init),
        jsdoc: extractLeadingTags(comments, declaration.start, source),
        localName: declarator.id.name,
        name: declarator.id.name,
        snippet: source.slice(declarator.start, declarator.end),
      });
    }
  }
  if (declaration.type === "FunctionDeclaration" && declaration.id) {
    exports.set(declaration.id.name, {
      declarationKind: "function",
      initKind: "function",
      jsdoc: extractLeadingTags(comments, declaration.start, source),
      localName: declaration.id.name,
      name: declaration.id.name,
      snippet: source.slice(declaration.start, declaration.end),
    });
  }
}

function collectLocalDeclaration(
  statement: Statement,
  source: string,
  comments: readonly Comment[],
  declarations: Map<string, LocalDeclaration>,
): void {
  if (statement.type === "VariableDeclaration") {
    const declaration = statement as OxcVariableDeclaration;
    for (const declarator of declaration.declarations) {
      if (declarator.id?.type !== "Identifier") continue;
      declarations.set(declarator.id.name, {
        declarationKind: declaration.kind,
        initKind: describeExpression(declarator.init),
        jsdoc: extractLeadingTags(comments, declaration.start, source),
        localName: declarator.id.name,
        snippet: source.slice(declarator.start, declarator.end),
      });
    }
  }
  if (statement.type === "FunctionDeclaration") {
    const declaration = statement as OxcFunctionDeclaration;
    if (!declaration.id) return;
    declarations.set(declaration.id.name, {
      declarationKind: "function",
      initKind: "function",
      jsdoc: extractLeadingTags(comments, declaration.start, source),
      localName: declaration.id.name,
      snippet: source.slice(declaration.start, declaration.end),
    });
  }
}

function collectNamedExportSpecifiers(
  statement: OxcExportNamedDeclaration,
  declarations: ReadonlyMap<string, LocalDeclaration>,
  exports: Map<string, LocalExport>,
): void {
  for (const specifier of statement.specifiers) {
    if (
      specifier.type !== "ExportSpecifier" ||
      specifier.local?.type !== "Identifier" ||
      specifier.exported?.type !== "Identifier"
    ) {
      continue;
    }
    const local = declarations.get(specifier.local.name);
    if (!local) continue;
    exports.set(specifier.exported.name, {
      ...local,
      localName: specifier.local.name,
      name: specifier.exported.name,
    });
  }
}

function extractLeadingTags(
  comments: readonly Comment[],
  start: number,
  source: string,
): JSDocTags {
  const preceding = comments.filter((item) => item.end <= start);
  preceding.sort(compareCommentsDescending);
  const comment = preceding.find((item) => source.slice(item.end, start).trim() === "");
  if (!comment) return {};
  const tags: JSDocTags = {};
  for (const line of comment.value.split("\n")) {
    const match = line.match(/^\s*\*\s*@(\w+)\s+(.+?)\s*$/);
    if (!match) continue;
    const [, tag, value] = match;
    tags[tag] ??= [];
    tags[tag].push(value);
  }
  return tags;
}

function compareLocalExports(left: LocalExport, right: LocalExport): number {
  return left.name.localeCompare(right.name);
}

function compareCommentsDescending(left: Comment, right: Comment): number {
  return right.end - left.end;
}

function collectTypeScriptMetadata(
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile,
  name: string,
): {
  readonly jsdoc: JSDocTags;
  readonly signatures: readonly SignatureInfo[];
} {
  const declaration = findLocalDeclaration(sourceFile, name);
  if (!declaration) return { jsdoc: {}, signatures: [] };
  const symbol = checker.getSymbolAtLocation(declaration.name);
  if (!symbol) return { jsdoc: collectJSDoc(declaration.jsdocNode), signatures: [] };
  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration.name);
  return {
    jsdoc: collectJSDoc(declaration.jsdocNode),
    signatures: type
      .getCallSignatures()
      .map((signature) => formatSignature(checker, signature, declaration.name)),
  };
}

function findLocalDeclaration(
  sourceFile: ts.SourceFile,
  name: string,
): TsLocalDeclaration | undefined {
  let found: TsLocalDeclaration | undefined;
  const visit = (node: ts.Node): void => {
    if (found) return;
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
      if (node.name.text === name) {
        found = {
          jsdocNode: node.parent.parent,
          name: node.name,
        };
        return;
      }
    }
    if (ts.isFunctionDeclaration(node) && node.name?.text === name) {
      found = {
        jsdocNode: node,
        name: node.name,
      };
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

function collectJSDoc(node: ts.Node): JSDocTags {
  const tags: JSDocTags = {};
  for (const tag of ts.getJSDocTags(node)) {
    const name = tag.tagName.text;
    tags[name] ??= [];
    tags[name].push(formatJSDocComment(tag.comment));
  }
  return tags;
}

function formatJSDocComment(comment: string | ts.NodeArray<ts.JSDocComment> | undefined): string {
  if (comment === undefined) return "";
  if (typeof comment === "string") return comment.trim();
  return [...comment]
    .map((part) => part.getText())
    .join("")
    .trim();
}

function formatSignature(
  checker: ts.TypeChecker,
  signature: ts.Signature,
  location: ts.Node,
): SignatureInfo {
  const returnType = checker.getReturnTypeOfSignature(signature);
  return {
    parameters: signature.getParameters().map((parameter) => ({
      name: parameter.getName(),
      type: checker.typeToString(checker.getTypeOfSymbolAtLocation(parameter, location)),
    })),
    returnType: checker.typeToString(returnType),
    returnCallSignatures: returnType.getCallSignatures().map((inner) => ({
      parameters: inner.getParameters().map((parameter) => ({
        name: parameter.getName(),
        type: checker.typeToString(checker.getTypeOfSymbolAtLocation(parameter, location)),
      })),
      returnType: checker.typeToString(checker.getReturnTypeOfSignature(inner)),
    })),
  };
}

function describeExpression(expression: Expression | null | undefined): string {
  if (!expression) return "none";
  if (expression.type === "CallExpression") {
    return `call:${describeCallee((expression as OxcCallExpression).callee)}`;
  }
  if (expression.type === "ArrowFunctionExpression") return "arrow";
  if (expression.type === "FunctionExpression") return "function";
  if (expression.type === "Identifier") {
    return `identifier:${(expression as OxcIdentifier).name}`;
  }
  if (expression.type === "MemberExpression") return `member:${describeMember(expression)}`;
  return expression.type;
}

function describeCallee(callee: Expression | null | undefined): string {
  if (!callee) return "unknown";
  if (callee.type === "Identifier") return (callee as OxcIdentifier).name;
  if (callee.type === "MemberExpression") return describeMember(callee);
  if (callee.type === "CallExpression") {
    return `call:${describeCallee((callee as OxcCallExpression).callee)}`;
  }
  return callee.type;
}

function describeMember(member: Expression): string {
  const memberExpression = member as OxcMemberExpression;
  const object =
    memberExpression.object?.type === "Identifier"
      ? (memberExpression.object as OxcIdentifier).name
      : (memberExpression.object?.type ?? "unknown");
  const property =
    memberExpression.property?.type === "Identifier"
      ? (memberExpression.property as OxcIdentifier).name
      : (memberExpression.property?.type ?? "unknown");
  return `${object}.${property}`;
}
