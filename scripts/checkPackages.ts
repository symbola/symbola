import { spawnSync } from "node:child_process"
import { mkdtempSync, readdirSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const packages = ["@symbola/effect", "@symbola/effect-oxlint"] as const

function run(command: string, args: readonly string[]): void {
  const result = spawnSync(command, args, {
    shell: process.platform === "win32",
    stdio: "inherit"
  })
  if (result.error) {
    throw result.error
  }
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`)
  }
}

for (const packageName of packages) {
  const outputDir = mkdtempSync(join(tmpdir(), "symbola-package-check-"))
  try {
    console.log(`Packing ${packageName}`)
    run("pnpm", ["--filter", packageName, "pack", "--pack-destination", outputDir])

    const tarball = readdirSync(outputDir).find((entry) => entry.endsWith(".tgz"))
    if (tarball === undefined) {
      throw new Error(`No tarball produced for ${packageName}`)
    }

    const tarballPath = join(outputDir, tarball)
    run("pnpm", ["exec", "publint", "run", tarballPath, "--strict"])
    run("pnpm", [
      "exec",
      "attw",
      tarballPath,
      "--profile",
      "esm-only",
      "--no-emoji",
      "--no-summary"
    ])
  } finally {
    rmSync(outputDir, { force: true, recursive: true })
  }
}
