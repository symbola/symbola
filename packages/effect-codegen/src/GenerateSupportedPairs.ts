/// <reference types="node" />

import * as NodeServices from "@effect/platform-node/NodeServices";
import * as Effect from "effect/Effect";
import * as Command from "effect/unstable/cli/Command";
import * as Flag from "effect/unstable/cli/Flag";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEffectSurface } from "./effectSurface/surface.ts";
import { arrayRuntimePairKeys, renderArrayRuntime } from "./generatedRuntime/Array.ts";
import {
  loadImplementedPairs,
  selectRuntimeBackedMethods,
} from "./runtimeSurface/runtimeSurface.ts";
import { buildSymbolaMethods } from "./supportedPairs/candidates.ts";
import { renderSupportedPairs } from "./supportedPairs/renderSupportedPairs.ts";

const codegenDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceDir = path.resolve(codegenDir, "../../..");
const effectPackageDir = path.resolve(workspaceDir, "packages/effect");
const effectOxlintPackageDir = path.resolve(workspaceDir, "packages/effect-oxlint");
const supportedPairsPath = path.resolve(effectOxlintPackageDir, "src/internal/supportedPairs.ts");
const generatedArrayRuntimePath = path.resolve(effectPackageDir, "src/internal/generated/Array.ts");
const effectSync = Effect.sync;
const runEffectPromise = Effect.runPromise;

const command = Command.make("symbola-supported-pairs", {
  check: Flag.boolean("check").pipe(
    Flag.withDescription(
      "Fail when packages/effect-oxlint/src/internal/supportedPairs.ts is not generated output",
    ),
  ),
  write: Flag.boolean("write").pipe(
    Flag.withDescription(
      "Write generated output to packages/effect-oxlint/src/internal/supportedPairs.ts",
    ),
  ),
}).pipe(
  Command.withDescription("Generate Symbola syntax supported pairs from Effect source"),
  Command.withHandler(({ check, write }) =>
    effectSync(() => {
      if (check && write) {
        throw new Error("--check and --write are mutually exclusive");
      }

      const { modules } = loadEffectSurface(effectPackageDir);
      const symbolaMethods = buildSymbolaMethods(modules);
      const generatedRuntimePairs = arrayRuntimePairKeys(symbolaMethods);
      const implementedMethods = selectRuntimeBackedMethods(
        symbolaMethods,
        loadImplementedPairs(effectPackageDir),
        generatedRuntimePairs,
      );
      const renderedPairs = renderSupportedPairs(implementedMethods);
      const renderedArrayRuntime = renderArrayRuntime(implementedMethods);
      if (write) {
        fs.mkdirSync(path.dirname(supportedPairsPath), {
          recursive: true,
        });
        fs.mkdirSync(path.dirname(generatedArrayRuntimePath), {
          recursive: true,
        });
        fs.writeFileSync(supportedPairsPath, renderedPairs);
        fs.writeFileSync(generatedArrayRuntimePath, renderedArrayRuntime);
        return;
      }
      const current = fs.readFileSync(supportedPairsPath, "utf8");
      if (current !== renderedPairs) {
        throw new Error(
          "packages/effect-oxlint/src/internal/supportedPairs.ts is stale. Run `pnpm --filter @symbola/effect-codegen codegen`.",
        );
      }
      const currentArrayRuntime = fs.readFileSync(generatedArrayRuntimePath, "utf8");
      if (currentArrayRuntime !== renderedArrayRuntime) {
        throw new Error(
          "packages/effect/src/internal/generated/Array.ts is stale. Run `pnpm --filter @symbola/effect-codegen codegen`.",
        );
      }
    }),
  ),
);

void runEffectPromise(
  Command.run(command, { version: "0.0.0" }).pipe(Effect.provide(NodeServices.layer)),
);
