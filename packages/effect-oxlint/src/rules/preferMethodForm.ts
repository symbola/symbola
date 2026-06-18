import { supportedPairsByModule, type SymbolaPair } from "../internal/supportedPairs.ts";
import {
  planSymbolImports,
  type ImportDeclarationModel,
  type Replacement,
} from "../internal/importPlanner.ts";
import type { RuleTester } from "oxlint/plugins-dev";

type OxlintRule = Parameters<RuleTester["run"]>[1];
type OxlintContext = Parameters<NonNullable<OxlintRule["create"]>>[0];

export type Node = {
  readonly type: string;
  readonly range: [number, number];
  readonly parent?: Node | null;
};

export type Identifier = Node & {
  readonly type: "Identifier";
  readonly name: string;
};

export type StringLiteral = Node & {
  readonly type: "Literal";
  readonly value: string;
};

export type ImportDeclaration = Node & {
  readonly type: "ImportDeclaration";
  readonly importKind?: "type" | "value";
  readonly source: StringLiteral;
  readonly specifiers: readonly ImportSpecifier[];
};

export type ImportSpecifier =
  | (Node & {
      readonly type: "ImportNamespaceSpecifier";
      readonly local: Identifier;
    })
  | (Node & {
      readonly type: "ImportSpecifier";
      readonly imported: Identifier | StringLiteral;
      readonly importKind?: "type" | "value";
      readonly local: Identifier;
    })
  | (Node & {
      readonly type: "ImportDefaultSpecifier";
      readonly local: Identifier;
    });

export type Expression = Node & {
  readonly type: string;
};

export type MemberExpression = Expression & {
  readonly type: "MemberExpression";
  readonly object: Expression;
  readonly property: Expression | Identifier;
  readonly computed: boolean;
};

export type CallExpression = Expression & {
  readonly type: "CallExpression";
  readonly callee: Expression;
  readonly arguments: readonly Argument[];
  readonly parent: Node;
  readonly typeArguments?: unknown;
  readonly typeParameters?: unknown;
};

export type SpreadElement = Node & {
  readonly type: "SpreadElement";
  readonly argument: Expression;
};

export type Argument = Expression | SpreadElement;

export type Context = Pick<OxlintContext, "report" | "sourceCode">;

const isIdentifier = (node: Node): node is Identifier => node.type === "Identifier";

const isCallExpression = (node: Node): node is CallExpression => node.type === "CallExpression";

const isMemberExpression = (node: Node): node is MemberExpression =>
  node.type === "MemberExpression";

const isSpreadElement = (node: Node): node is SpreadElement => node.type === "SpreadElement";

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === "object" && value !== null;

const importName = (specifier: ImportSpecifier): string | null => {
  if (specifier.type !== "ImportSpecifier") {
    return null;
  }
  return specifier.imported.type === "Literal" ? specifier.imported.value : specifier.imported.name;
};

type NamespaceCall = {
  readonly computed: boolean;
  readonly node: CallExpression;
  readonly namespace: string;
  readonly method: string;
};

const literalName = (node: Expression | Identifier): string | null =>
  node.type === "Literal" && typeof (node as StringLiteral).value === "string"
    ? (node as StringLiteral).value
    : null;

const namespaceCall = (node: CallExpression): NamespaceCall | null => {
  if (!isMemberExpression(node.callee)) {
    return null;
  }
  if (!isIdentifier(node.callee.object)) {
    return null;
  }
  const method = node.callee.computed
    ? literalName(node.callee.property)
    : isIdentifier(node.callee.property)
      ? node.callee.property.name
      : null;
  if (method === null) {
    return null;
  }
  return {
    computed: node.callee.computed,
    node,
    namespace: node.callee.object.name,
    method,
  };
};

const isMethodPipeCall = (node: CallExpression): boolean =>
  isMemberExpression(node.callee) &&
  !node.callee.computed &&
  isIdentifier(node.callee.property) &&
  node.callee.property.name === "pipe";

const methodTarget = (argument: Argument | undefined): Expression | null =>
  argument === undefined || isSpreadElement(argument) ? null : argument;

const hasTypeArguments = (call: CallExpression): boolean =>
  call.typeArguments != null || call.typeParameters != null;

const needsMemberParentheses = (node: Expression): boolean =>
  ![
    "ArrayExpression",
    "CallExpression",
    "ChainExpression",
    "Identifier",
    "Literal",
    "MemberExpression",
    "NewExpression",
    "Super",
    "TemplateLiteral",
    "ThisExpression",
  ].includes(node.type);

export const preferMethodForm = {
  meta: {
    type: "suggestion" as const,
    fixable: "code" as const,
    docs: {
      description: "Prefer Symbola method form where a namespace call has a method equivalent.",
      recommended: false,
    },
    messages: {
      preferMethodForm: "Prefer Symbola method form: self[{{symbol}}](...).",
    },
  },
  create(context: Context) {
    const namespaces = new Map<string, ReadonlyMap<string, SymbolaPair>>();
    const boundNames = new Set<string>();
    const importDeclarations: ImportDeclarationModel[] = [];
    const pipeNames = new Set<string>();
    const sourceCode = context.sourceCode;

    const pairFor = (call: NamespaceCall): SymbolaPair | null =>
      namespaces.get(call.namespace)?.get(call.method) ?? null;

    const isPipeCallee = (node: Node): node is Identifier =>
      isIdentifier(node) && pipeNames.has(node.name);

    const isWithinPipeCall = (node: CallExpression): boolean => {
      const parent = node.parent;
      return isCallExpression(parent) && isPipeCallee(parent.callee);
    };

    const isWithinMethodPipeCall = (node: CallExpression): boolean => {
      const parent = node.parent;
      return isCallExpression(parent) && isMethodPipeCall(parent);
    };

    const hasCommentInRange = ([start, end]: [number, number]): boolean =>
      sourceCode
        .getAllComments()
        .some((comment) => start <= comment.range[0] && comment.range[1] <= end);

    const text = (node: Node): string => sourceCode.getText(node);

    const quote = (declaration: ImportDeclaration): "'" | '"' => {
      const sourceText = sourceCode.getText(declaration.source);
      return sourceText.startsWith("'") ? "'" : '"';
    };

    const importModel = (declaration: ImportDeclaration): ImportDeclarationModel => ({
      hasComments: hasCommentInRange(declaration.range),
      hasOnlyNamedSpecifiers: declaration.specifiers.every(
        (specifier) => specifier.type === "ImportSpecifier",
      ),
      hasTypeOnlySpecifiers:
        declaration.importKind === "type" ||
        declaration.specifiers.some(
          (specifier) => specifier.type === "ImportSpecifier" && specifier.importKind === "type",
        ),
      quote: quote(declaration),
      range: declaration.range,
      source: declaration.source.value,
      specifiers: declaration.specifiers.flatMap((specifier) => {
        if (specifier.type !== "ImportSpecifier") {
          return [];
        }
        const imported = importName(specifier);
        return imported === null ? [] : [{ imported, local: specifier.local.name }];
      }),
    });

    const nodeField = (node: unknown, field: string): unknown =>
      isRecord(node) ? node[field] : undefined;

    const nodeListField = (node: unknown, field: string): readonly unknown[] => {
      const value = nodeField(node, field);
      return Array.isArray(value) ? value : [];
    };

    const addBindingPattern = (pattern: unknown): void => {
      if (!isRecord(pattern) || typeof pattern.type !== "string") {
        return;
      }
      switch (pattern.type) {
        case "Identifier": {
          const name = nodeField(pattern, "name");
          if (typeof name === "string") {
            boundNames.add(name);
          }
          return;
        }
        case "AssignmentPattern": {
          addBindingPattern(nodeField(pattern, "left"));
          return;
        }
        case "RestElement": {
          addBindingPattern(nodeField(pattern, "argument"));
          return;
        }
        case "ArrayPattern": {
          for (const element of nodeListField(pattern, "elements")) {
            addBindingPattern(element);
          }
          return;
        }
        case "ObjectPattern": {
          for (const property of nodeListField(pattern, "properties")) {
            if (!isRecord(property) || typeof property.type !== "string") {
              continue;
            }
            addBindingPattern(
              property.type === "Property"
                ? nodeField(property, "value")
                : nodeField(property, "argument"),
            );
          }
        }
      }
    };

    const collectBindings = (node: unknown): void => {
      if (!isRecord(node) || typeof node.type !== "string") {
        return;
      }

      switch (node.type) {
        case "ImportDeclaration": {
          for (const specifier of nodeListField(node, "specifiers")) {
            addBindingPattern(nodeField(specifier, "local"));
          }
          break;
        }
        case "VariableDeclarator": {
          addBindingPattern(nodeField(node, "id"));
          break;
        }
        case "FunctionDeclaration":
        case "ClassDeclaration":
        case "FunctionExpression": {
          addBindingPattern(nodeField(node, "id"));
          for (const param of nodeListField(node, "params")) {
            addBindingPattern(param);
          }
          break;
        }
        case "ArrowFunctionExpression": {
          for (const param of nodeListField(node, "params")) {
            addBindingPattern(param);
          }
          break;
        }
        case "CatchClause": {
          addBindingPattern(nodeField(node, "param"));
          break;
        }
      }

      for (const [field, value] of Object.entries(node)) {
        if (field === "parent" || field === "range") {
          continue;
        }
        if (Array.isArray(value)) {
          for (const item of value) {
            collectBindings(item);
          }
        } else {
          collectBindings(value);
        }
      }
    };

    const receiverText = (target: Expression): string => {
      const targetText = text(target);
      return needsMemberParentheses(target) ? `(${targetText})` : targetText;
    };

    const argumentText = (args: readonly Argument[]): string | null => {
      if (args.some(isSpreadElement)) {
        return null;
      }
      return args.map(text).join(", ");
    };

    const directReplacement = (call: NamespaceCall, pair: SymbolaPair): Replacement | null => {
      if (pair.direct === false || call.computed || hasTypeArguments(call.node)) {
        return null;
      }
      if (hasCommentInRange(call.node.range)) {
        return null;
      }
      const target = methodTarget(call.node.arguments[0]);
      if (target === null) {
        return null;
      }
      const args = argumentText(call.node.arguments.slice(1));
      if (args === null) {
        return null;
      }
      return {
        range: call.node.range,
        text: `${receiverText(target)}[${pair.symbol}](${args})`,
      };
    };

    const pipeTransformPart = (transform: CallExpression, pair: SymbolaPair): string | null => {
      if (pair.pipe === false || hasTypeArguments(transform)) {
        return null;
      }
      const args = argumentText(transform.arguments);
      if (args === null) {
        return null;
      }
      return `[${pair.symbol}](${args})`;
    };

    const pipeReplacement = (call: CallExpression): Replacement | null => {
      if (hasCommentInRange(call.range)) {
        return null;
      }
      const target =
        isMethodPipeCall(call) && isMemberExpression(call.callee)
          ? call.callee.object
          : methodTarget(call.arguments[0]);
      if (target === null) {
        return null;
      }
      const transforms = isMethodPipeCall(call) ? call.arguments : call.arguments.slice(1);
      if (transforms.length === 0) {
        return null;
      }
      const parts: string[] = [];
      for (const transform of transforms) {
        if (isSpreadElement(transform) || !isCallExpression(transform)) {
          return null;
        }
        const pipeCall = namespaceCall(transform);
        if (pipeCall === null || pipeCall.computed) {
          return null;
        }
        const pair = pairFor(pipeCall);
        if (pair === null) {
          return null;
        }
        const part = pipeTransformPart(transform, pair);
        if (part === null) {
          return null;
        }
        parts.push(part);
      }
      return {
        range: call.range,
        text: `${receiverText(target)}${parts.join("")}`,
      };
    };

    const replacementWithImports = (
      replacement: Replacement | null,
      pairs: readonly SymbolaPair[],
    ): readonly Replacement[] | undefined => {
      if (replacement === null) {
        return undefined;
      }
      const importPlan = planSymbolImports({
        boundNames,
        imports: importDeclarations,
        needed: pairs,
      });
      if (importPlan.blocked) {
        return undefined;
      }
      // This rule inserts the needed Symbola imports but intentionally leaves old Effect imports alone.
      // Oxlint can remove now-unused imports with --fix-suggestions; the normal hook only runs --fix.
      return [replacement, ...importPlan.edits];
    };

    const report = (
      call: NamespaceCall,
      pair: SymbolaPair,
      replacements?: readonly Replacement[],
    ): void => {
      context.report({
        node: call.node.callee,
        messageId: "preferMethodForm",
        data: { symbol: pair.symbol },
        ...(replacements === undefined
          ? {}
          : {
              fix: (fixer) =>
                replacements.map((replacement) =>
                  fixer.replaceTextRange(replacement.range, replacement.text),
                ),
            }),
      });
    };

    return {
      Program(node: Node) {
        collectBindings(node);
      },

      ImportDeclaration(node: Node) {
        const declaration = node as ImportDeclaration;
        importDeclarations.push(importModel(declaration));
        for (const specifier of declaration.specifiers) {
          if (specifier.type === "ImportNamespaceSpecifier") {
            const pairs = supportedPairsByModule.get(declaration.source.value);
            if (pairs !== undefined) {
              namespaces.set(specifier.local.name, pairs);
            }
            continue;
          }

          if (declaration.source.value === "effect") {
            const imported = importName(specifier);
            const pairs =
              imported === null ? undefined : supportedPairsByModule.get(`effect/${imported}`);
            if (pairs !== undefined) {
              namespaces.set(specifier.local.name, pairs);
            }
            continue;
          }

          if (declaration.source.value === "effect/Function" && importName(specifier) === "pipe") {
            pipeNames.add(specifier.local.name);
          }
        }
      },

      CallExpression(node: Node) {
        const call = node as CallExpression;
        const direct = namespaceCall(call);
        if (
          direct !== null &&
          call.arguments[0] !== undefined &&
          !isWithinPipeCall(call) &&
          !isWithinMethodPipeCall(call)
        ) {
          const pair = pairFor(direct);
          if (pair !== null && pair.direct) {
            report(direct, pair, replacementWithImports(directReplacement(direct, pair), [pair]));
          }
          return;
        }

        if (!isPipeCallee(call.callee) && !isMethodPipeCall(call)) {
          return;
        }

        const transforms = isMethodPipeCall(call) ? call.arguments : call.arguments.slice(1);
        const replacement = pipeReplacement(call) ?? undefined;
        const replacementPairs: SymbolaPair[] = [];
        for (const transform of transforms) {
          if (isSpreadElement(transform) || !isCallExpression(transform)) {
            continue;
          }
          const pipeCall = namespaceCall(transform);
          if (pipeCall === null) {
            continue;
          }
          const pair = pairFor(pipeCall);
          if (pair !== null && pair.pipe) {
            replacementPairs.push(pair);
          }
        }
        const replacements =
          replacement === undefined
            ? undefined
            : replacementWithImports(replacement, replacementPairs);
        let replacementUsed = false;
        for (const transform of transforms) {
          if (isSpreadElement(transform) || !isCallExpression(transform)) {
            continue;
          }

          const pipeCall = namespaceCall(transform);
          if (pipeCall === null) {
            continue;
          }

          const pair = pairFor(pipeCall);
          if (pair !== null && pair.pipe) {
            report(pipeCall, pair, replacementUsed ? undefined : replacements);
            replacementUsed = replacements !== undefined || replacementUsed;
          }
        }
      },
    };
  },
} satisfies OxlintRule;
