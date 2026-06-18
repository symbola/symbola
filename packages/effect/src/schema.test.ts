import { describe, expect, it } from "@effect/vitest"
import { Equal } from "effect"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Result from "effect/Result"
import * as Schema from "effect/Schema"
import * as SchemaParser from "effect/SchemaParser"
import { expectTypeOf } from "vitest"

import {
  annotate,
  brand,
  check,
  decodeEffect,
  decodeOption,
  decodeResult,
  decodeSync,
  decodeUnknownEffect,
  decodeUnknownOption,
  decodeUnknownResult,
  decodeUnknownSync,
  encodeEffect,
  encodeOption,
  encodeResult,
  encodeSync,
  encodeUnknownEffect,
  encodeUnknownOption,
  encodeUnknownResult,
  encodeUnknownSync,
  optional,
  required
} from "./Schema.ts"

const schema = Schema.String
type ParserWithOptions = typeof SchemaParser & {
  readonly decodeUnknownOption: <S extends Schema.Decoder<unknown>>(
    schema: S
  ) => (input: unknown) => Option.Option<S["Type"]>
  readonly decodeOption: <S extends Schema.Decoder<unknown>>(
    schema: S
  ) => (input: S["Encoded"]) => Option.Option<S["Type"]>
  readonly encodeUnknownOption: <S extends Schema.Encoder<unknown>>(
    schema: S
  ) => (input: unknown) => Option.Option<S["Encoded"]>
  readonly encodeOption: <S extends Schema.Encoder<unknown>>(
    schema: S
  ) => (input: S["Type"]) => Option.Option<S["Encoded"]>
}
const parser = SchemaParser as ParserWithOptions

describe("schema symbol protocol", () => {
  it.effect("mirrors SchemaParser decode effect helpers", () =>
    Effect.gen(function*() {
      const beforeUnknown = yield* Effect.exit(SchemaParser.decodeUnknownEffect(schema)("hello"))
      const afterUnknown = yield* Effect.exit(schema[decodeUnknownEffect]("hello"))
      const beforeTyped = yield* Effect.exit(SchemaParser.decodeEffect(schema)("hello"))
      const afterTyped = yield* Effect.exit(schema[decodeEffect]("hello"))

      expect(Equal.equals(beforeUnknown, afterUnknown)).toBe(true)
      expect(Equal.equals(beforeTyped, afterTyped)).toBe(true)
    }))

  it("mirrors SchemaParser decode option, result, and sync helpers", () => {
    expect(schema[decodeUnknownOption]("hello")).toEqual(
      parser.decodeUnknownOption(schema)("hello")
    )
    expect(schema[decodeOption]("hello")).toEqual(parser.decodeOption(schema)("hello"))
    expect(schema[decodeUnknownResult]("hello")).toEqual(
      SchemaParser.decodeUnknownResult(schema)("hello")
    )
    expect(schema[decodeResult]("hello")).toEqual(SchemaParser.decodeResult(schema)("hello"))
    expect(schema[decodeUnknownSync]("hello")).toBe(
      SchemaParser.decodeUnknownSync(schema)("hello")
    )
    expect(schema[decodeSync]("hello")).toBe(SchemaParser.decodeSync(schema)("hello"))

    expect(Result.isFailure(schema[decodeUnknownResult](42))).toBe(true)
    expect(() => schema[decodeUnknownSync](42)).toThrow()
  })

  it.effect("mirrors SchemaParser encode effect helpers", () =>
    Effect.gen(function*() {
      const beforeUnknown = yield* Effect.exit(SchemaParser.encodeUnknownEffect(schema)("hello"))
      const afterUnknown = yield* Effect.exit(schema[encodeUnknownEffect]("hello"))
      const beforeTyped = yield* Effect.exit(SchemaParser.encodeEffect(schema)("hello"))
      const afterTyped = yield* Effect.exit(schema[encodeEffect]("hello"))

      expect(Equal.equals(beforeUnknown, afterUnknown)).toBe(true)
      expect(Equal.equals(beforeTyped, afterTyped)).toBe(true)
    }))

  it("mirrors SchemaParser encode option, result, and sync helpers", () => {
    expect(schema[encodeUnknownOption]("hello")).toEqual(
      parser.encodeUnknownOption(schema)("hello")
    )
    expect(schema[encodeOption]("hello")).toEqual(parser.encodeOption(schema)("hello"))
    expect(schema[encodeUnknownResult]("hello")).toEqual(
      SchemaParser.encodeUnknownResult(schema)("hello")
    )
    expect(schema[encodeResult]("hello")).toEqual(SchemaParser.encodeResult(schema)("hello"))
    expect(schema[encodeUnknownSync]("hello")).toBe(
      SchemaParser.encodeUnknownSync(schema)("hello")
    )
    expect(schema[encodeSync]("hello")).toBe(SchemaParser.encodeSync(schema)("hello"))
  })

  it("supports v4 schema combinators", () => {
    const annotated = schema[annotate]({ title: "Name" })
    const branded = schema[brand]("Name")
    const optionalField = schema[optional]()
    const requiredField = optionalField[required]()

    expect(Schema.isSchema(annotated)).toBe(true)
    expect(Schema.isSchema(branded)).toBe(true)
    expect(Schema.isSchema(requiredField)).toBe(true)
    expect(
      SchemaParser.decodeUnknownResult(Schema.Struct({ name: optionalField }))({})
    ).toMatchObject({ _tag: "Success" })
  })

  it("installs parser symbols as non-enumerable Object.prototype properties", () => {
    expect(Object.getOwnPropertyDescriptor(Object.prototype, decodeUnknownEffect)).toMatchObject({
      enumerable: false,
      writable: true,
      configurable: true
    })
  })

  it("types parser and combinator results as the v4 functions", () => {
    expectTypeOf(schema[decodeUnknownEffect]("hello")).toEqualTypeOf(
      SchemaParser.decodeUnknownEffect(schema)("hello")
    )
    expectTypeOf(schema[decodeEffect]("hello")).toEqualTypeOf(
      SchemaParser.decodeEffect(schema)("hello")
    )
    expectTypeOf(schema[decodeUnknownOption]("hello")).toEqualTypeOf(
      parser.decodeUnknownOption(schema)("hello")
    )
    expectTypeOf(schema[decodeOption]("hello")).toEqualTypeOf(parser.decodeOption(schema)("hello"))
    expectTypeOf(schema[decodeUnknownResult]("hello")).toEqualTypeOf(
      SchemaParser.decodeUnknownResult(schema)("hello")
    )
    expectTypeOf(schema[decodeResult]("hello")).toEqualTypeOf(
      SchemaParser.decodeResult(schema)("hello")
    )
    expectTypeOf(schema[decodeUnknownSync]("hello")).toEqualTypeOf(
      SchemaParser.decodeUnknownSync(schema)("hello")
    )
    expectTypeOf(schema[decodeSync]("hello")).toEqualTypeOf(
      SchemaParser.decodeSync(schema)("hello")
    )
    expectTypeOf(schema[encodeUnknownEffect]("hello")).toEqualTypeOf(
      SchemaParser.encodeUnknownEffect(schema)("hello")
    )
    expectTypeOf(schema[encodeEffect]("hello")).toEqualTypeOf(
      SchemaParser.encodeEffect(schema)("hello")
    )
    expectTypeOf(schema[encodeUnknownOption]("hello")).toEqualTypeOf(
      parser.encodeUnknownOption(schema)("hello")
    )
    expectTypeOf(schema[encodeOption]("hello")).toEqualTypeOf(parser.encodeOption(schema)("hello"))
    expectTypeOf(schema[encodeUnknownResult]("hello")).toEqualTypeOf(
      SchemaParser.encodeUnknownResult(schema)("hello")
    )
    expectTypeOf(schema[encodeResult]("hello")).toEqualTypeOf(
      SchemaParser.encodeResult(schema)("hello")
    )
    expectTypeOf(schema[encodeUnknownSync]("hello")).toEqualTypeOf(
      SchemaParser.encodeUnknownSync(schema)("hello")
    )
    expectTypeOf(schema[encodeSync]("hello")).toEqualTypeOf(
      SchemaParser.encodeSync(schema)("hello")
    )
    expectTypeOf(schema[annotate]({ title: "Name" })).toMatchTypeOf(
      Schema.annotate({ title: "Name" })(schema)
    )
    expectTypeOf(schema[brand]("Name")).toEqualTypeOf(schema.pipe(Schema.brand("Name")))
    expectTypeOf(schema[optional]()).toEqualTypeOf(Schema.optional(schema))
    expectTypeOf(schema[optional]()[required]()).toEqualTypeOf(
      Schema.required(Schema.optional(schema))
    )
  })

  it("types check as the v4 schema check combinator", () => {
    const minLength = Schema.isMinLength(1)

    expectTypeOf(schema[check](minLength)).toEqualTypeOf(schema.check(minLength))
  })
})
