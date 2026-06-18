import { preferMethodForm } from "./rules/preferMethodForm.ts"

type OxlintPlugin = {
  readonly meta: {
    readonly name: string
  }
  readonly rules: Readonly<Record<string, unknown>>
}

const plugin: OxlintPlugin = {
  meta: {
    name: "symbola"
  },
  rules: {
    "prefer-method-form": preferMethodForm
  }
}

export default plugin
