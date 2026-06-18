import type {
  Candidate,
  CandidateWithPolicy,
  EffectExport,
  EffectModuleSurface,
  FixShape,
  PolicyResult,
  SignatureInfo,
  SignatureParameter,
  SymbolaMethod,
} from "./symbola.types.ts";

const receiverParameterNames = new Set<string>([
  "array",
  "chunk",
  "effect",
  "exit",
  "map",
  "option",
  "result",
  "schema",
  "self",
  "set",
  "stream",
]);

const receiverTypeFragmentsByModule = new Map<string, readonly string[]>([
  ["effect/Array", ["readonly ", "[]", "ReadonlyArray", "Array<"]],
  ["effect/Chunk", ["Chunk<"]],
  ["effect/Effect", ["Effect<"]],
  ["effect/Exit", ["Exit<"]],
  ["effect/HashMap", ["HashMap<"]],
  ["effect/HashSet", ["HashSet<"]],
  ["effect/Option", ["Option<"]],
  ["effect/Result", ["Result<"]],
  ["effect/Schema", ["Schema<", "Top", "Struct<"]],
  ["effect/SchemaParser", ["Schema<", "Top", "Struct<"]],
  ["effect/Stream", ["Stream<"]],
]);

const returnTypeFragmentsByModule = new Map<string, readonly string[]>([
  ["effect/Array", ["readonly ", "ReadonlyArray", "Array<"]],
  ["effect/Chunk", ["Chunk<"]],
  ["effect/Effect", ["Effect<"]],
  ["effect/Exit", ["Exit<"]],
  ["effect/HashMap", ["HashMap<"]],
  ["effect/HashSet", ["HashSet<"]],
  ["effect/Option", ["Option<"]],
  ["effect/Result", ["Result<"]],
  ["effect/Schema", ["Schema<", "Struct<"]],
  ["effect/Stream", ["Stream<"]],
]);

export function buildCandidate(
  exported: EffectExport,
  moduleSpecifier: string,
): CandidateWithPolicy {
  const reasons: string[] = [];
  let direct: FixShape = false;
  let pipe: FixShape = false;
  const syntax = collectSyntaxHints(exported);

  if (syntax.usesDual) {
    direct = { kind: "receiverFirst" };
    pipe = { kind: "pipeOperator" };
    reasons.push("dual-helper");
  }
  if (hasReceiverFirstSignature(exported.signatures)) {
    direct = { kind: "receiverFirst" };
    reasons.push("first-parameter-receiver");
  }
  if (hasDomainConstructorSignature(moduleSpecifier, exported.signatures)) {
    direct = { kind: "receiverFirst" };
    reasons.push("domain-constructor");
  }
  if (
    hasCurriedReceiverSignature(exported.signatures) ||
    syntax.returnsReceiverFunction
  ) {
    pipe = { kind: "pipeOperator" };
    reasons.push("curried-receiver-operator");
  }

  const candidate: Candidate = {
    declarationKind: exported.declarationKind,
    inferred: {
      direct,
      pipe,
      reasons: [...new Set(reasons)],
    },
    initKind: exported.initKind,
    jsdoc: exported.jsdoc,
    method: exported.method,
    module: moduleSpecifier,
    signatures: exported.signatures,
    symbol: exported.localName,
  };
  return {
    ...candidate,
    policy: evaluatePolicy(candidate),
  };
}

export function buildSymbolaMethods(
  surfaces: readonly EffectModuleSurface[],
): readonly SymbolaMethod[] {
  return surfaces.flatMap((surface) =>
    surface.exports
      .map((item) => buildCandidate(item, surface.module))
      .filter(
        (candidate) =>
          (candidate.inferred.direct || candidate.inferred.pipe) &&
          candidate.policy.accepted,
      )
      .map((candidate) => ({
        effectModule: candidate.module,
        effectMethod: candidate.method,
        symbol: candidate.symbol,
        implementation: candidate.inferred.reasons.includes(
          "domain-constructor",
        )
          ? "constructor"
          : "receiverFirst",
        direct: candidate.inferred.direct,
        pipe: candidate.inferred.pipe,
      })),
  );
}

function collectSyntaxHints(exported: EffectExport): {
  readonly returnsReceiverFunction: boolean;
  readonly usesDual: boolean;
} {
  return {
    returnsReceiverFunction:
      /=>\s*\(\s*(self|schema|stream|effect|option|result|chunk|set|map)\b/.test(
        exported.snippet,
      ) ||
      /function\s*\(\s*(self|schema|stream|effect|option|result|chunk|set|map)\b/.test(
        exported.snippet,
      ),
    usesDual:
      exported.initKind === "call:dual" || /\bdual\s*\(/.test(exported.snippet),
  };
}

function hasReceiverFirstSignature(
  signatures: readonly SignatureInfo[],
): boolean {
  return signatures.some((signature) =>
    receiverParameterNames.has(signature.parameters[0]?.name),
  );
}

function hasCurriedReceiverSignature(
  signatures: readonly SignatureInfo[],
): boolean {
  return signatures.some(
    (signature) =>
      signature.returnType.includes("=>") &&
      signature.returnCallSignatures.some((inner) =>
        receiverParameterNames.has(inner.parameters[0]?.name),
      ),
  );
}

function evaluatePolicy(candidate: Candidate): PolicyResult {
  const accepted: string[] = [];
  const rejected: string[] = [];
  if (candidate.method.match(/^is[A-Z]/)) {
    rejected.push("predicate-guard-name");
  }
  if (
    candidate.inferred.direct &&
    hasDomainReceiver(candidate.module, candidate.signatures)
  ) {
    accepted.push("direct-domain-receiver");
  }
  if (
    candidate.inferred.direct &&
    hasDomainConstructor(candidate.module, candidate.signatures)
  ) {
    accepted.push("direct-domain-constructor");
  }
  if (
    candidate.inferred.pipe &&
    hasDomainCurriedReceiver(candidate.module, candidate.signatures)
  ) {
    accepted.push("pipe-domain-receiver");
  }
  return {
    accepted: accepted.length > 0 && rejected.length === 0,
    acceptedReasons: accepted,
    rejectedReasons: rejected,
  };
}

function hasDomainReceiver(
  moduleSpecifier: string,
  signatures: readonly SignatureInfo[],
): boolean {
  return signatures.some((signature) =>
    isDomainReceiver(moduleSpecifier, signature.parameters[0]),
  );
}

function hasDomainConstructor(
  moduleSpecifier: string,
  signatures: readonly SignatureInfo[],
): boolean {
  return signatures.some((signature) =>
    isDomainConstructor(moduleSpecifier, signature),
  );
}

function hasDomainConstructorSignature(
  moduleSpecifier: string,
  signatures: readonly SignatureInfo[],
): boolean {
  return signatures.some((signature) =>
    isDomainConstructor(moduleSpecifier, signature),
  );
}

function hasDomainCurriedReceiver(
  moduleSpecifier: string,
  signatures: readonly SignatureInfo[],
): boolean {
  return signatures.some(
    (signature) =>
      signature.returnType.includes("=>") &&
      signature.returnCallSignatures.some((inner) =>
        isDomainReceiver(moduleSpecifier, inner.parameters[0]),
      ),
  );
}

function isDomainReceiver(
  moduleSpecifier: string,
  parameter: SignatureParameter | undefined,
): boolean {
  if (!parameter) return false;
  if (receiverParameterNames.has(parameter.name)) return true;
  return (
    receiverTypeFragmentsByModule
      .get(moduleSpecifier)
      ?.some((fragment) => parameter.type.includes(fragment)) ?? false
  );
}

function isDomainConstructor(
  moduleSpecifier: string,
  signature: SignatureInfo,
): boolean {
  const parameter = signature.parameters[0];
  if (
    !parameter ||
    isDomainReceiver(moduleSpecifier, parameter) ||
    signature.returnCallSignatures.length > 0 ||
    signature.returnType.includes("=>")
  ) {
    return false;
  }
  const returnType = signature.returnType.trimStart();
  return (
    returnTypeFragmentsByModule
      .get(moduleSpecifier)
      ?.some((fragment) => returnType.startsWith(fragment)) ?? false
  );
}
