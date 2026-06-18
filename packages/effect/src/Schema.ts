/**
 * Schema symbol protocol for Effect v4.
 *
 * Parser helpers live in `effect/SchemaParser`, while schema combinators stay on
 * `effect/Schema`. This module mirrors those names as symbol-keyed methods on
 * schema receivers.
 */
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"
import * as Result from "effect/Result"
import * as Schema from "effect/Schema"
import type * as SchemaAST from "effect/SchemaAST"
import type { ParseOptions } from "effect/SchemaAST"
import type * as SchemaIssue from "effect/SchemaIssue"
import * as SchemaParser from "effect/SchemaParser"

import { type GuardedSymbolProtocolEntry, installGuarded } from "./internal/install.ts"

export const decodeUnknownEffect: unique symbol = Symbol("Schema/decodeUnknownEffect")
export const decodeEffect: unique symbol = Symbol("Schema/decodeEffect")
export const decodeUnknownOption: unique symbol = Symbol("Schema/decodeUnknownOption")
export const decodeOption: unique symbol = Symbol("Schema/decodeOption")
export const decodeUnknownResult: unique symbol = Symbol("Schema/decodeUnknownResult")
export const decodeResult: unique symbol = Symbol("Schema/decodeResult")
export const decodeUnknownSync: unique symbol = Symbol("Schema/decodeUnknownSync")
export const decodeSync: unique symbol = Symbol("Schema/decodeSync")
export const encodeUnknownEffect: unique symbol = Symbol("Schema/encodeUnknownEffect")
export const encodeEffect: unique symbol = Symbol("Schema/encodeEffect")
export const encodeUnknownOption: unique symbol = Symbol("Schema/encodeUnknownOption")
export const encodeOption: unique symbol = Symbol("Schema/encodeOption")
export const encodeUnknownResult: unique symbol = Symbol("Schema/encodeUnknownResult")
export const encodeResult: unique symbol = Symbol("Schema/encodeResult")
export const encodeUnknownSync: unique symbol = Symbol("Schema/encodeUnknownSync")
export const encodeSync: unique symbol = Symbol("Schema/encodeSync")
export const annotate: unique symbol = Symbol("Schema/annotate")
export const brand: unique symbol = Symbol("Schema/brand")
export const check: unique symbol = Symbol("Schema/check")
export const optional: unique symbol = Symbol("Schema/optional")
export const required: unique symbol = Symbol("Schema/required")
export const fieldsAssign: unique symbol = Symbol("Schema/fieldsAssign")
export const extendTo: unique symbol = Symbol("Schema/extendTo")

type AnySchema = Schema.Top
type Issue = SchemaIssue.Issue
type SchemaParserWithOptions = typeof SchemaParser & {
  readonly decodeUnknownOption: <S extends Schema.Decoder<unknown>>(
    schema: S,
    options?: ParseOptions
  ) => (input: unknown, options?: ParseOptions) => Option.Option<S["Type"]>
  readonly decodeOption: <S extends Schema.Decoder<unknown>>(
    schema: S,
    options?: ParseOptions
  ) => (input: S["Encoded"], options?: ParseOptions) => Option.Option<S["Type"]>
  readonly encodeUnknownOption: <S extends Schema.Encoder<unknown>>(
    schema: S,
    options?: ParseOptions
  ) => (input: unknown, options?: ParseOptions) => Option.Option<S["Encoded"]>
  readonly encodeOption: <S extends Schema.Encoder<unknown>>(
    schema: S,
    options?: ParseOptions
  ) => (input: S["Type"], options?: ParseOptions) => Option.Option<S["Encoded"]>
}

const parser = SchemaParser as SchemaParserWithOptions

declare global {
  interface Object {
    [decodeUnknownEffect]<S extends AnySchema>(
      this: S,
      input: unknown,
      overrideOptions?: ParseOptions
    ): Effect.Effect<S["Type"], Issue, S["DecodingServices"]>
    [decodeEffect]<S extends AnySchema>(
      this: S,
      input: S["Encoded"],
      overrideOptions?: ParseOptions
    ): Effect.Effect<S["Type"], Issue, S["DecodingServices"]>
    [decodeUnknownOption]<S extends Schema.Decoder<unknown>>(
      this: S,
      input: unknown,
      overrideOptions?: ParseOptions
    ): Option.Option<S["Type"]>
    [decodeOption]<S extends Schema.Decoder<unknown>>(
      this: S,
      input: S["Encoded"],
      overrideOptions?: ParseOptions
    ): Option.Option<S["Type"]>
    [decodeUnknownResult]<S extends Schema.Decoder<unknown>>(
      this: S,
      input: unknown,
      overrideOptions?: ParseOptions
    ): Result.Result<S["Type"], Issue>
    [decodeResult]<S extends Schema.Decoder<unknown>>(
      this: S,
      input: S["Encoded"],
      overrideOptions?: ParseOptions
    ): Result.Result<S["Type"], Issue>
    [decodeUnknownSync]<S extends Schema.Decoder<unknown>>(
      this: S,
      input: unknown,
      overrideOptions?: ParseOptions
    ): S["Type"]
    [decodeSync]<S extends Schema.Decoder<unknown>>(
      this: S,
      input: S["Encoded"],
      overrideOptions?: ParseOptions
    ): S["Type"]
    [encodeUnknownEffect]<S extends AnySchema>(
      this: S,
      input: unknown,
      overrideOptions?: ParseOptions
    ): Effect.Effect<S["Encoded"], Issue, S["EncodingServices"]>
    [encodeEffect]<S extends AnySchema>(
      this: S,
      input: S["Type"],
      overrideOptions?: ParseOptions
    ): Effect.Effect<S["Encoded"], Issue, S["EncodingServices"]>
    [encodeUnknownOption]<S extends Schema.Encoder<unknown>>(
      this: S,
      input: unknown,
      overrideOptions?: ParseOptions
    ): Option.Option<S["Encoded"]>
    [encodeOption]<S extends Schema.Encoder<unknown>>(
      this: S,
      input: S["Type"],
      overrideOptions?: ParseOptions
    ): Option.Option<S["Encoded"]>
    [encodeUnknownResult]<S extends Schema.Encoder<unknown>>(
      this: S,
      input: unknown,
      overrideOptions?: ParseOptions
    ): Result.Result<S["Encoded"], Issue>
    [encodeResult]<S extends Schema.Encoder<unknown>>(
      this: S,
      input: S["Type"],
      overrideOptions?: ParseOptions
    ): Result.Result<S["Encoded"], Issue>
    [encodeUnknownSync]<S extends AnySchema>(
      this: S,
      input: unknown,
      overrideOptions?: ParseOptions
    ): S["Encoded"]
    [encodeSync]<S extends AnySchema>(
      this: S,
      input: S["Type"],
      overrideOptions?: ParseOptions
    ): S["Encoded"]
    [annotate]<S extends AnySchema>(
      this: S,
      annotations: Schema.Annotations.Bottom<S["Type"], S["~type.parameters"]>
    ): S["Rebuild"]
    [brand]<S extends AnySchema, B extends string>(
      this: S,
      identifier: B
    ): Schema.brand<S["Rebuild"], B>
    [check]<S extends AnySchema>(
      this: S,
      ...checks: readonly [SchemaAST.Check<S["Type"]>, ...SchemaAST.Check<S["Type"]>[]]
    ): S["Rebuild"]
    [optional]<S extends AnySchema>(this: S): Schema.optional<S>
    [required]<S extends Schema.optional<AnySchema>>(this: S): S["schema"]["members"][0]
    [fieldsAssign]<
      S extends Schema.Struct<Schema.Struct.Fields>,
      NewFields extends Schema.Struct.Fields
    >(
      this: S,
      fields: NewFields
    ): AnySchema
    [extendTo]<S extends Schema.Struct<Schema.Struct.Fields>, Fields extends Schema.Struct.Fields>(
      this: S,
      fields: Fields,
      derive: {
        readonly [K in keyof Fields]: (value: S["Type"]) => Option.Option<Fields[K]["Type"]>
      }
    ): AnySchema
  }
}

const isSchema = (value: unknown): boolean => Schema.isSchema(value)

const decodeUnknownEffectImpl = (schema: AnySchema, input: unknown, options?: ParseOptions) =>
  SchemaParser.decodeUnknownEffect(schema)(input, options)
const decodeEffectImpl = (schema: AnySchema, input: unknown, options?: ParseOptions) =>
  SchemaParser.decodeEffect(schema)(input, options)
const decodeUnknownOptionImpl = (schema: AnySchema, input: unknown, options?: ParseOptions) =>
  parser.decodeUnknownOption(schema as Schema.Decoder<unknown>)(input, options)
const decodeOptionImpl = (schema: AnySchema, input: unknown, options?: ParseOptions) =>
  parser.decodeOption(schema as Schema.Decoder<unknown>)(input, options)
const decodeUnknownResultImpl = (schema: AnySchema, input: unknown, options?: ParseOptions) =>
  SchemaParser.decodeUnknownResult(schema as Schema.Decoder<unknown>)(input, options)
const decodeResultImpl = (schema: AnySchema, input: unknown, options?: ParseOptions) =>
  SchemaParser.decodeResult(schema as Schema.Decoder<unknown>)(input, options)
const decodeUnknownSyncImpl = (schema: AnySchema, input: unknown, options?: ParseOptions) =>
  SchemaParser.decodeUnknownSync(schema as Schema.Decoder<unknown>)(input, options)
const decodeSyncImpl = (schema: AnySchema, input: unknown, options?: ParseOptions) =>
  SchemaParser.decodeSync(schema as Schema.Decoder<unknown>)(input, options)
const encodeUnknownEffectImpl = (schema: AnySchema, input: unknown, options?: ParseOptions) =>
  SchemaParser.encodeUnknownEffect(schema)(input, options)
const encodeEffectImpl = (schema: AnySchema, input: unknown, options?: ParseOptions) =>
  SchemaParser.encodeEffect(schema)(input, options)
const encodeUnknownOptionImpl = (schema: AnySchema, input: unknown, options?: ParseOptions) =>
  parser.encodeUnknownOption(schema as Schema.Encoder<unknown>)(input, options)
const encodeOptionImpl = (schema: AnySchema, input: unknown, options?: ParseOptions) =>
  parser.encodeOption(schema as Schema.Encoder<unknown>)(input, options)
const encodeUnknownResultImpl = (schema: AnySchema, input: unknown, options?: ParseOptions) =>
  SchemaParser.encodeUnknownResult(schema as Schema.Encoder<unknown>)(input, options)
const encodeResultImpl = (schema: AnySchema, input: unknown, options?: ParseOptions) =>
  SchemaParser.encodeResult(schema as Schema.Encoder<unknown>)(input, options)
const encodeUnknownSyncImpl = (schema: AnySchema, input: unknown, options?: ParseOptions) =>
  SchemaParser.encodeUnknownSync(schema as Schema.Encoder<unknown>)(input, options)
const encodeSyncImpl = (schema: AnySchema, input: unknown, options?: ParseOptions) =>
  SchemaParser.encodeSync(schema as Schema.Encoder<unknown>)(input, options)
const annotateImpl = (
  schema: AnySchema,
  annotations: Schema.Annotations.Bottom<unknown, readonly AnySchema[]>
) => schema.annotate(annotations)
const brandImpl = (schema: AnySchema, identifier: string) => Schema.brand(identifier)(schema)
const checkImpl = (schema: AnySchema, ...checks: readonly SchemaAST.Check<unknown>[]) =>
  schema.check(...(checks as [SchemaAST.Check<unknown>, ...SchemaAST.Check<unknown>[]]))
const optionalImpl = (schema: AnySchema) => Schema.optional(schema)
const requiredImpl = (schema: Schema.optional<AnySchema>) => Schema.required(schema)
const fieldsAssignImpl = (
  schema: Schema.Struct<Schema.Struct.Fields>,
  fields: Schema.Struct.Fields
) => schema.pipe(Schema.fieldsAssign(fields))
const extendToImpl = (
  schema: Schema.Struct<Schema.Struct.Fields>,
  fields: Schema.Struct.Fields,
  derive: Record<PropertyKey, (value: unknown) => Option.Option<unknown>>
) => schema.pipe(Schema.extendTo(fields, derive as never))

type Impl = GuardedSymbolProtocolEntry["implementation"]
const guardedProtocol: readonly GuardedSymbolProtocolEntry[] = [
  {
    symbol: decodeUnknownEffect,
    guard: isSchema,
    implementation: decodeUnknownEffectImpl as Impl
  },
  {
    symbol: decodeEffect,
    guard: isSchema,
    implementation: decodeEffectImpl as Impl
  },
  {
    symbol: decodeUnknownOption,
    guard: isSchema,
    implementation: decodeUnknownOptionImpl as Impl
  },
  {
    symbol: decodeOption,
    guard: isSchema,
    implementation: decodeOptionImpl as Impl
  },
  {
    symbol: decodeUnknownResult,
    guard: isSchema,
    implementation: decodeUnknownResultImpl as Impl
  },
  {
    symbol: decodeResult,
    guard: isSchema,
    implementation: decodeResultImpl as Impl
  },
  {
    symbol: decodeUnknownSync,
    guard: isSchema,
    implementation: decodeUnknownSyncImpl as Impl
  },
  {
    symbol: decodeSync,
    guard: isSchema,
    implementation: decodeSyncImpl as Impl
  },
  {
    symbol: encodeUnknownEffect,
    guard: isSchema,
    implementation: encodeUnknownEffectImpl as Impl
  },
  {
    symbol: encodeEffect,
    guard: isSchema,
    implementation: encodeEffectImpl as Impl
  },
  {
    symbol: encodeUnknownOption,
    guard: isSchema,
    implementation: encodeUnknownOptionImpl as Impl
  },
  {
    symbol: encodeOption,
    guard: isSchema,
    implementation: encodeOptionImpl as Impl
  },
  {
    symbol: encodeUnknownResult,
    guard: isSchema,
    implementation: encodeUnknownResultImpl as Impl
  },
  {
    symbol: encodeResult,
    guard: isSchema,
    implementation: encodeResultImpl as Impl
  },
  {
    symbol: encodeUnknownSync,
    guard: isSchema,
    implementation: encodeUnknownSyncImpl as Impl
  },
  {
    symbol: encodeSync,
    guard: isSchema,
    implementation: encodeSyncImpl as Impl
  },
  { symbol: annotate, guard: isSchema, implementation: annotateImpl as Impl },
  { symbol: brand, guard: isSchema, implementation: brandImpl as Impl },
  { symbol: check, guard: isSchema, implementation: checkImpl as Impl },
  { symbol: optional, guard: isSchema, implementation: optionalImpl as Impl },
  { symbol: required, guard: isSchema, implementation: requiredImpl as Impl },
  {
    symbol: fieldsAssign,
    guard: isSchema,
    implementation: fieldsAssignImpl as Impl
  },
  { symbol: extendTo, guard: isSchema, implementation: extendToImpl as Impl }
]

Effect.runSync(installGuarded(guardedProtocol))
