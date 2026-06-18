import { describe, expect, it } from "vitest";
import {
  type ImportDeclarationModel,
  planSymbolImports,
  symbolaImportSource,
} from "./importPlanner.ts";

describe("symbolaImportSource", () => {
  it("maps Effect modules to per-domain Symbola imports", () => {
    expect(
      symbolaImportSource({ module: "effect/Effect", symbol: "map" }),
    ).toBe("@symbola/effect");
    expect(
      symbolaImportSource({
        module: "effect/SchemaParser",
        symbol: "decodeResult",
      }),
    ).toBe("@symbola/effect/Schema");
  });

  it("maps constructor symbols to the constructor module", () => {
    expect(
      symbolaImportSource({ module: "effect/Effect", symbol: "succeed" }),
    ).toBe("@symbola/effect/Constructors");
    expect(
      symbolaImportSource({ module: "effect/Option", symbol: "some" }),
    ).toBe("@symbola/effect/Constructors");
  });
});

describe("planSymbolImports", () => {
  it("inserts a new import after the last import declaration", () => {
    expect(
      planSymbolImports({
        boundNames: new Set(),
        imports: [namedImport("effect/Effect", ["Effect"], [0, 37])],
        needed: [{ module: "effect/Effect", symbol: "map" }],
      }),
    ).toEqual({
      blocked: false,
      edits: [
        {
          range: [37, 37],
          text: '\nimport { map } from "@symbola/effect";',
        },
      ],
    });
  });

  it("extends an existing plain named Symbola import", () => {
    expect(
      planSymbolImports({
        boundNames: new Set(),
        imports: [namedImport("@symbola/effect", ["map"], [0, 44])],
        needed: [
          { module: "effect/Effect", symbol: "flatMap" },
          { module: "effect/Effect", symbol: "map" },
        ],
      }),
    ).toEqual({
      blocked: false,
      edits: [
        {
          range: [0, 44],
          text: 'import { flatMap, map } from "@symbola/effect";',
        },
      ],
    });
  });

  it("blocks when a missing symbol already has a local binding", () => {
    expect(
      planSymbolImports({
        boundNames: new Set(["map"]),
        imports: [],
        needed: [{ module: "effect/Effect", symbol: "map" }],
      }),
    ).toEqual({ blocked: true, edits: [] });
  });

  it("blocks when two import sources need the same local symbol", () => {
    expect(
      planSymbolImports({
        boundNames: new Set(),
        imports: [],
        needed: [
          { module: "effect/Effect", symbol: "map" },
          { module: "effect/Option", symbol: "map" },
        ],
      }),
    ).toEqual({ blocked: true, edits: [] });
  });

  it("blocks when the target Symbola import shape is unsupported", () => {
    expect(
      planSymbolImports({
        boundNames: new Set(),
        imports: [
          {
            ...namedImport("@symbola/effect", ["map"], [0, 44]),
            hasOnlyNamedSpecifiers: false,
          },
        ],
        needed: [{ module: "effect/Effect", symbol: "flatMap" }],
      }),
    ).toEqual({ blocked: true, edits: [] });
  });

  it("blocks when the target Symbola import is type-only", () => {
    expect(
      planSymbolImports({
        boundNames: new Set(),
        imports: [
          {
            ...namedImport("@symbola/effect", ["map"], [0, 49]),
            hasTypeOnlySpecifiers: true,
          },
        ],
        needed: [{ module: "effect/Effect", symbol: "map" }],
      }),
    ).toEqual({ blocked: true, edits: [] });
  });
});

function namedImport(
  source: string,
  symbols: readonly string[],
  range: [number, number],
): ImportDeclarationModel {
  return {
    hasComments: false,
    hasOnlyNamedSpecifiers: true,
    hasTypeOnlySpecifiers: false,
    quote: '"',
    range,
    source,
    specifiers: symbols.map((symbol) => ({ imported: symbol, local: symbol })),
  };
}
