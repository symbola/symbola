import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";

import { filter, flatMap, map } from "./Symbols.ts";
import {
  install,
  installGuarded,
  type GuardedSymbolProtocolEntry,
  type SymbolProtocolEntry,
} from "./internal/install.ts";

export { filter, flatMap, map } from "./Symbols.ts";

export const tap: unique symbol = Symbol("Stream/tap");
export const runCollect: unique symbol = Symbol("Stream/runCollect");

type Str<A, E, R> = Stream.Stream<A, E, R>;

// ── Types: method-form; `this` gates them to Streams ─────────────────────────
declare global {
  interface Object {
    [map]<A, E, R, B>(this: Str<A, E, R>, f: (value: A) => B): Str<B, E, R>;
    [flatMap]<A, E, R, B, E2, R2>(
      this: Str<A, E, R>,
      f: (value: A) => Str<B, E2, R2>,
    ): Str<B, E | E2, R | R2>;
    [filter]<A, E, R>(this: Str<A, E, R>, predicate: (value: A) => boolean): Str<A, E, R>;
    [tap]<A, E, R, X, E2, R2>(
      this: Str<A, E, R>,
      f: (value: A) => Effect.Effect<X, E2, R2>,
    ): Str<A, E | E2, R | R2>;
    [runCollect]<A, E, R>(this: Str<A, E, R>): Effect.Effect<A[], E, R>;
  }
}

// ── Runtime ──────────────────────────────────────────────────────────────────
const isStream = (value: unknown): boolean =>
  value !== null && typeof value === "object" && Stream.TypeId in (value as object);

// Shared symbols (map/flatMap/filter) use guarded dispatch so they coexist with
// the Effect protocol on Object.prototype — guard checks Stream TypeId presence.
const guardedProtocol: readonly GuardedSymbolProtocolEntry[] = [
  { symbol: map, guard: isStream, implementation: Stream.map },
  { symbol: flatMap, guard: isStream, implementation: Stream.flatMap },
  { symbol: filter, guard: isStream, implementation: Stream.filter },
];

// Stream-unique symbols can be installed directly (no collision risk).
const uniqueProtocol: readonly SymbolProtocolEntry[] = [
  { symbol: tap, implementation: Stream.tap },
  { symbol: runCollect, implementation: Stream.runCollect },
];

Effect.runSync(installGuarded(guardedProtocol));
Effect.runSync(install(uniqueProtocol));
