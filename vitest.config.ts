import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "node",
    projects: [
      {
        test: {
          name: "unit",
          environment: "node",
          include: ["packages/*/src/**/*.test.ts"],
          isolate: false
        }
      }
    ]
  }
})
