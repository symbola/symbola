import { describe, it } from "vitest";
import { RuleTester } from "oxlint/plugins-dev";

import { preferMethodForm } from "./preferMethodForm.ts";

RuleTester.describe = describe;
RuleTester.it = it;

const error = /Prefer Symbola method form/;

new RuleTester({
  languageOptions: {
    sourceType: "module",
    parserOptions: {
      lang: "ts",
    },
  },
}).run("prefer-method-form", preferMethodForm, {
  valid: [
    "const result = [1, 2].map(f);",
    "const result = local.map(self, f);",
    "import * as Local from './local'; const result = Local.map(self, f);",
    "import { map } from 'effect/Effect'; const result = map(self, f);",
    "import * as Effect from 'effect/Effect'; import { pipe } from 'effect/Function'; const result = pipe(self, other.map(f));",
    "import * as Effect from 'effect/Effect'; import { pipe } from 'effect/Function'; const result = pipe(self, Effect.succeed());",
    "import * as Schema from 'effect/Schema'; const branded = Schema.brand('InternalId');",
  ],
  invalid: [
    {
      code: "import * as Effect from 'effect/Effect'; const result = Effect.map(self, f);",
      output:
        "import * as Effect from 'effect/Effect';\nimport { map } from \"@symbola/effect\"; const result = self[map](f);",
      errors: [{ message: error }],
    },
    {
      code: "import { Effect } from 'effect'; const result = Effect.map(self, f);",
      output:
        "import { Effect } from 'effect';\nimport { map } from \"@symbola/effect\"; const result = self[map](f);",
      errors: [{ message: error }],
    },
    {
      code: "import { map } from \"@symbola/effect\"; import * as Effect from 'effect/Effect'; const result = Effect.map(self, f);",
      output:
        "import { map } from \"@symbola/effect\"; import * as Effect from 'effect/Effect'; const result = self[map](f);",
      errors: [{ message: error }],
    },
    {
      code: "import { map } from \"@symbola/effect\"; import * as Effect from 'effect/Effect'; import { pipe } from 'effect/Function'; const result = pipe(self, Effect.map(f), Effect.flatMap(g));",
      output:
        "import { flatMap, map } from \"@symbola/effect\"; import * as Effect from 'effect/Effect'; import { pipe } from 'effect/Function'; const result = self[map](f)[flatMap](g);",
      errors: [{ message: error }, { message: error }],
    },
    {
      code: "import * as Effect from 'effect/Effect'; import { map } from 'effect/Effect'; const result = Effect.map(self, f);",
      output: null,
      errors: [{ message: error }],
    },
    {
      code: "import * as Effect from 'effect/Effect'; const result = Effect.map(self, f); const map = 1;",
      output: null,
      errors: [{ message: error }],
    },
    {
      code: "import * as Effect from 'effect/Effect'; function run(map: symbol) { return Effect.map(self, f); }",
      output: null,
      errors: [{ message: error }],
    },
    {
      code: "import type { map } from \"@symbola/effect\"; import * as Effect from 'effect/Effect'; const result = Effect.map(self, f);",
      output: null,
      errors: [{ message: error }],
    },
    {
      code: "import * as Effect from 'effect/Effect'; import { pipe } from 'effect/Function'; const result = pipe(self, Effect.map(f));",
      output:
        "import * as Effect from 'effect/Effect'; import { pipe } from 'effect/Function';\nimport { map } from \"@symbola/effect\"; const result = self[map](f);",
      errors: [{ message: error }],
    },
    {
      code: "import * as Effect from 'effect/Effect'; import { pipe } from 'effect/Function'; const result = pipe(self, Effect.map(f), Effect.flatMap(g));",
      output:
        "import * as Effect from 'effect/Effect'; import { pipe } from 'effect/Function';\nimport { flatMap, map } from \"@symbola/effect\"; const result = self[map](f)[flatMap](g);",
      errors: [{ message: error }, { message: error }],
    },
    {
      code: "import * as Effect from 'effect/Effect'; import * as Option from 'effect/Option'; import { pipe } from 'effect/Function'; const result = pipe(self, Effect.map(f), Option.map(g));",
      output: null,
      errors: [{ message: error }, { message: error }],
    },
    {
      code: "import * as Effect from 'effect/Effect'; import { pipe as flow } from 'effect/Function'; const result = flow(self, Effect.map(f));",
      output:
        "import * as Effect from 'effect/Effect'; import { pipe as flow } from 'effect/Function';\nimport { map } from \"@symbola/effect\"; const result = self[map](f);",
      errors: [{ message: error }],
    },
    {
      code: "import * as Stream from 'effect/Stream'; const result = Stream.runCollect(stream);",
      output:
        "import * as Stream from 'effect/Stream';\nimport { runCollect } from \"@symbola/effect/Stream\"; const result = stream[runCollect]();",
      errors: [{ message: error }],
    },
    {
      code: "import * as Option from 'effect/Option'; const result = Option.flatMapNullishOr(value, f);",
      output:
        "import * as Option from 'effect/Option';\nimport { flatMapNullishOr } from \"@symbola/effect/Option\"; const result = value[flatMapNullishOr](f);",
      errors: [{ message: error }],
    },
    {
      code: "import * as Result from 'effect/Result'; const result = Result.filterOrFail(value, predicate, orFailWith);",
      output:
        "import * as Result from 'effect/Result';\nimport { filterOrFail } from \"@symbola/effect/Result\"; const result = value[filterOrFail](predicate, orFailWith);",
      errors: [{ message: error }],
    },
    {
      code: "import * as Array from 'effect/Array'; const result = Array.flatMap(values, f);",
      output:
        "import * as Array from 'effect/Array';\nimport { flatMap } from \"@symbola/effect/Array\"; const result = values[flatMap](f);",
      errors: [{ message: error }],
    },
    {
      code: "import * as Chunk from 'effect/Chunk'; const result = Chunk.append(values, value);",
      output:
        "import * as Chunk from 'effect/Chunk';\nimport { append } from \"@symbola/effect/Chunk\"; const result = values[append](value);",
      errors: [{ message: error }],
    },
    {
      code: "import * as Exit from 'effect/Exit'; const result = Exit.match(value, cases);",
      output:
        "import * as Exit from 'effect/Exit';\nimport { match } from \"@symbola/effect/Exit\"; const result = value[match](cases);",
      errors: [{ message: error }],
    },
    {
      code: "import * as HashMap from 'effect/HashMap'; const result = HashMap.get(map, key);",
      output:
        "import * as HashMap from 'effect/HashMap';\nimport { get } from \"@symbola/effect/HashMap\"; const result = map[get](key);",
      errors: [{ message: error }],
    },
    {
      code: "import * as HashSet from 'effect/HashSet'; const result = HashSet.union(set, other);",
      output:
        "import * as HashSet from 'effect/HashSet';\nimport { union } from \"@symbola/effect/HashSet\"; const result = set[union](other);",
      errors: [{ message: error }],
    },
    {
      code: "import * as Effect from 'effect/Effect'; const result = Effect.succeed(value);",
      output:
        "import * as Effect from 'effect/Effect';\nimport { succeed } from \"@symbola/effect/Constructors\"; const result = value[succeed]();",
      errors: [{ message: error }],
    },
    {
      code: "import * as Effect from 'effect/Effect'; const result = Effect.try(fn);",
      output:
        "import * as Effect from 'effect/Effect';\nimport { try_ } from \"@symbola/effect/Constructors\"; const result = fn[try_]();",
      errors: [{ message: /self\[try_\]/ }],
    },
    {
      code: "import * as Option from 'effect/Option'; const result = Option.some(value);",
      output:
        "import * as Option from 'effect/Option';\nimport { some } from \"@symbola/effect/Constructors\"; const result = value[some]();",
      errors: [{ message: error }],
    },
    {
      code: "import * as Schema from 'effect/Schema'; const result = Schema.optional(schema);",
      output:
        "import * as Schema from 'effect/Schema';\nimport { optional } from \"@symbola/effect/Schema\"; const result = schema[optional]();",
      errors: [{ message: error }],
    },
    {
      code: "import { Schema } from 'effect'; const result = Schema.optional(schema);",
      output:
        "import { Schema } from 'effect';\nimport { optional } from \"@symbola/effect/Schema\"; const result = schema[optional]();",
      errors: [{ message: error }],
    },
    {
      code: "import { Schema as S } from 'effect'; const result = S.optional(schema);",
      output:
        "import { Schema as S } from 'effect';\nimport { optional } from \"@symbola/effect/Schema\"; const result = schema[optional]();",
      errors: [{ message: error }],
    },
    {
      code: "import { Schema } from 'effect'; const result = Schema.String.pipe(Schema.brand('InternalId'));",
      output:
        "import { Schema } from 'effect';\nimport { brand } from \"@symbola/effect/Schema\"; const result = Schema.String[brand]('InternalId');",
      errors: [{ message: error }],
    },
    {
      code: "import * as Schema from 'effect/Schema'; import { pipe } from 'effect/Function'; const result = pipe(Schema.String, Schema.brand('InternalId'));",
      output:
        "import * as Schema from 'effect/Schema'; import { pipe } from 'effect/Function';\nimport { brand } from \"@symbola/effect/Schema\"; const result = Schema.String[brand]('InternalId');",
      errors: [{ message: error }],
    },
    {
      code: "import * as SchemaParser from 'effect/SchemaParser'; const result = SchemaParser.decodeUnknownResult(schema, input);",
      output:
        "import * as SchemaParser from 'effect/SchemaParser';\nimport { decodeUnknownResult } from \"@symbola/effect/Schema\"; const result = schema[decodeUnknownResult](input);",
      errors: [{ message: error }],
    },
    {
      code: "import { SchemaParser } from 'effect'; const result = SchemaParser.encodeEffect(schema, input);",
      output:
        "import { SchemaParser } from 'effect';\nimport { encodeEffect } from \"@symbola/effect/Schema\"; const result = schema[encodeEffect](input);",
      errors: [{ message: error }],
    },
    {
      code: "import * as Effect from 'effect/Effect'; import { pipe } from 'effect/Function'; const result = pipe(self, Effect.map(f), other);",
      output: null,
      errors: [{ message: error }],
    },
    {
      code: "import * as Effect from 'effect/Effect'; const result = Effect.map(...args);",
      output: null,
      errors: [{ message: error }],
    },
    {
      code: "import * as Effect from 'effect/Effect'; const result = Effect['map'](self, f);",
      output: null,
      errors: [{ message: error }],
    },
    {
      code: "import * as Effect from 'effect/Effect'; const result = Effect.map<number, number>(self, f);",
      output: null,
      errors: [{ message: error }],
    },
  ],
});
