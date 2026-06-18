import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as SchemaParser from "effect/SchemaParser";
import { expectTypeOf } from "vitest";

import { decodeUnknownEffect, encodeEffect } from "./Schema.ts";

const schema = Schema.Struct({ name: Schema.String });
const input = { name: "Ada" };

describe("schema value protocol", () => {
  it("is isolated to ./schema-value and matches schema-side decode/encode", async () => {
    expect(() => input[decodeUnknownEffect](schema)).toThrow(
      "No protocol handler found",
    );

    const schemaValue = await import("./SchemaValue.ts");

    expect(schemaValue.decodeUnknownEffect).toBe(decodeUnknownEffect);
    expect(schemaValue.encodeEffect).toBe(encodeEffect);
    expect(Effect.runSync(input[decodeUnknownEffect](schema))).toEqual(
      Effect.runSync(SchemaParser.decodeUnknownEffect(schema)(input)),
    );
    expect(Effect.runSync(input[encodeEffect](schema))).toEqual(
      Effect.runSync(SchemaParser.encodeEffect(schema)(input)),
    );
  });

  it("types decodeUnknownEffect and encodeEffect as value receivers", async () => {
    await import("./SchemaValue.ts");

    const decoded = input[decodeUnknownEffect](schema);
    const encoded = input[encodeEffect](schema);

    expectTypeOf(decoded).toEqualTypeOf(
      SchemaParser.decodeUnknownEffect(schema)(input),
    );
    expectTypeOf(encoded).toEqualTypeOf(
      SchemaParser.encodeEffect(schema)(input),
    );
  });
});
