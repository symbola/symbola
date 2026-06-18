import { readFileSync, writeFileSync } from "node:fs";

type PackageJson = {
  readonly name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  symbola?: {
    targetEffect?: string;
  };
};

const publishablePackagePaths = [
  "packages/effect/package.json",
  "packages/effect-oxlint/package.json",
] as const;

const usage = `Usage:
  node ./scripts/syncEffectVersion.ts --check
  node ./scripts/syncEffectVersion.ts --write
  node ./scripts/syncEffectVersion.ts --bump-symbola`;

const mode = process.argv[2];
if (mode !== "--check" && mode !== "--write" && mode !== "--bump-symbola") {
  throw new Error(usage);
}

function readJson(path: string): PackageJson {
  return JSON.parse(readFileSync(path, "utf8")) as PackageJson;
}

function writeJson(path: string, value: PackageJson): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function readTargetEffectVersion(): string {
  const workspace = readFileSync("pnpm-workspace.yaml", "utf8");
  const match = /^  effect: (?<version>\S+)$/m.exec(workspace);
  const version = match?.groups?.version;
  if (version === undefined) {
    throw new Error("Could not find catalog.effect in pnpm-workspace.yaml");
  }
  if (
    version.startsWith("^") ||
    version.startsWith("~") ||
    version.includes("*")
  ) {
    throw new Error(`catalog.effect must be an exact version, got ${version}`);
  }
  return version;
}

function parseSymbolaVersion(
  version: string,
): { readonly targetEffect: string; readonly revision: number } | undefined {
  const match = /^(?<targetEffect>.+)-symbola\.(?<revision>\d+)$/.exec(version);
  if (match?.groups === undefined) {
    return undefined;
  }
  return {
    targetEffect: match.groups.targetEffect,
    revision: Number(match.groups.revision),
  };
}

function currentRevision(
  packages: readonly PackageJson[],
  targetEffect: string,
): number {
  const revisions = packages
    .map((pkg) => pkg.version)
    .flatMap((version) => {
      if (version === undefined) {
        return [];
      }
      const parsed = parseSymbolaVersion(version);
      return parsed?.targetEffect === targetEffect ? [parsed.revision] : [];
    });
  return revisions.length === 0 ? 0 : Math.max(...revisions);
}

function expectedVersion(targetEffect: string, revision: number): string {
  return `${targetEffect}-symbola.${revision}`;
}

function ensureMutableRecord(
  record: Record<string, string> | undefined,
): Record<string, string> {
  return record ?? {};
}

const targetEffect = readTargetEffectVersion();
const packages = publishablePackagePaths.map(
  (path) => [path, readJson(path)] as const,
);
const revision =
  mode === "--bump-symbola"
    ? currentRevision(
        packages.map(([, pkg]) => pkg),
        targetEffect,
      ) + 1
    : currentRevision(
        packages.map(([, pkg]) => pkg),
        targetEffect,
      );
const version = expectedVersion(targetEffect, revision);

if (mode === "--write" || mode === "--bump-symbola") {
  for (const [path, pkg] of packages) {
    pkg.version = version;
    pkg.symbola = { ...pkg.symbola, targetEffect };
    if (pkg.name === "@symbola/effect") {
      pkg.peerDependencies = ensureMutableRecord(pkg.peerDependencies);
      pkg.peerDependencies.effect = targetEffect;
    }
    writeJson(path, pkg);
  }
  console.log(`Synced Symbola package versions to ${version}`);
  process.exit(0);
}

const errors: string[] = [];
for (const [path, pkg] of packages) {
  if (pkg.version !== version) {
    errors.push(
      `${path}: expected version ${version}, got ${pkg.version ?? "<missing>"}`,
    );
  }
  if (pkg.symbola?.targetEffect !== targetEffect) {
    errors.push(
      `${path}: expected symbola.targetEffect ${targetEffect}, got ${pkg.symbola?.targetEffect ?? "<missing>"}`,
    );
  }
  if (
    pkg.name === "@symbola/effect" &&
    pkg.peerDependencies?.effect !== targetEffect
  ) {
    errors.push(
      `${path}: expected peerDependencies.effect ${targetEffect}, got ${pkg.peerDependencies?.effect ?? "<missing>"}`,
    );
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  console.error(
    "Run pnpm run version:sync, or pnpm run version:bump for a Symbola-only release.",
  );
  process.exit(1);
}

console.log(
  `Symbola package versions target effect@${targetEffect} as ${version}`,
);
