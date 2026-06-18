/**
 * Opt-in value receiver schema protocol.
 *
 * Importing `@symbola/effect/SchemaValue` installs v4 parser symbols on
 * ordinary values, so boundary code can write `input[decodeUnknownEffect](schema)`.
 */
import * as Effect from "effect/Effect"
import * as Schema from "effect/Schema"
import type { ParseOptions } from "effect/SchemaAST"
import type * as SchemaIssue from "effect/SchemaIssue"
import * as SchemaParser from "effect/SchemaParser"

import { type GuardedSymbolProtocolEntry, installGuarded } from "./internal/install.ts"
import { decodeUnknownEffect, encodeEffect } from "./Schema.ts"

export { decodeUnknownEffect, encodeEffect } from "./Schema.ts"

type AnySchema = Schema.Top
type Issue = SchemaIssue.Issue

declare global {
  interface Object {
    [decodeUnknownEffect]<S extends AnySchema>(
      this: unknown,
      schema: S,
      overrideOptions?: ParseOptions
    ): Effect.Effect<S["Type"], Issue, S["DecodingServices"]>
    [encodeEffect]<S extends AnySchema>(
      this: S["Type"],
      schema: S,
      overrideOptions?: ParseOptions
    ): Effect.Effect<S["Encoded"], Issue, S["EncodingServices"]>
  }
}

const isValueReceiver = (value: unknown): boolean => value !== null && value !== undefined

const decodeValueImpl = <S extends AnySchema>(
  self: unknown,
  schema: S,
  overrideOptions?: ParseOptions
): Effect.Effect<S["Type"], Issue, S["DecodingServices"]> =>
  SchemaParser.decodeUnknownEffect(schema)(self, overrideOptions)

const encodeValueImpl = <S extends AnySchema>(
  self: S["Type"],
  schema: S,
  overrideOptions?: ParseOptions
): Effect.Effect<S["Encoded"], Issue, S["EncodingServices"]> => SchemaParser.encodeEffect(schema)(self, overrideOptions)

type Impl = GuardedSymbolProtocolEntry["implementation"]
const guardedProtocol: readonly GuardedSymbolProtocolEntry[] = [
  {
    symbol: decodeUnknownEffect,
    guard: isValueReceiver,
    implementation: decodeValueImpl as Impl
  },
  {
    symbol: encodeEffect,
    guard: isValueReceiver,
    implementation: encodeValueImpl as Impl
  }
]

Effect.runSync(installGuarded(guardedProtocol))
