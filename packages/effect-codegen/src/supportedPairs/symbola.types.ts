import type {
  EffectModuleSurface,
  EffectExport,
  JSDocTags,
  SignatureInfo,
  SignatureParameter,
} from "../effectSurface/effect.types.ts";

export type { EffectExport, EffectModuleSurface, JSDocTags, SignatureInfo, SignatureParameter };

export type DirectFix = {
  readonly kind: "receiverFirst";
};

export type PipeFix = {
  readonly kind: "pipeOperator";
};

export type Fix = DirectFix | PipeFix;
export type FixShape = Fix | false;

export type InferredPair = {
  readonly direct: FixShape;
  readonly pipe: FixShape;
  readonly reasons: readonly string[];
};

export type PolicyResult = {
  readonly accepted: boolean;
  readonly acceptedReasons: readonly string[];
  readonly rejectedReasons: readonly string[];
};

export type Candidate = {
  readonly declarationKind: string;
  readonly inferred: InferredPair;
  readonly initKind: string;
  readonly jsdoc: JSDocTags;
  readonly method: string;
  readonly module: string;
  readonly signatures: readonly SignatureInfo[];
  readonly symbol: string;
};

export type CandidateWithPolicy = Candidate & {
  readonly policy: PolicyResult;
};

export type SymbolaMethod = {
  readonly direct: FixShape;
  readonly effectMethod: string;
  readonly effectModule: string;
  readonly implementation: "constructor" | "receiverFirst";
  readonly pipe: FixShape;
  readonly symbol: string;
};

export type SymbolaSourceFile = {
  readonly path: string;
  readonly text: string;
};

export type ImplementedSymbolaPair = {
  readonly module: string;
  readonly symbol: string;
};
