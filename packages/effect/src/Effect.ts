/**
 * Effect symbol protocol — a hand-picked set of Effect combinators exposed as
 * symbol-keyed methods, so `Effect.map(self, f)` can be written
 * `self[map](f)` and chained.
 *
 * Design decisions (verified against effect 3.x at build time):
 *  - Common algebraic operators reuse the shared symbols from `symbols.ts`; Effect-only
 *    operators keep Effect-specific symbol identities in this module.
 *  - Type side: global `interface Object` augmentation with a `this: Effect<...>`
 *    constraint. The constraint means these only type-check on Effect receivers;
 *    calling `({})[map](...)` is a *type error* even though the method exists at runtime.
 *  - Runtime side: installed on `Object.prototype`. Effect's primitives mix their
 *    prototype in by value rather than linking a shared ancestor, so there is no
 *    single Effect prototype to target — Object.prototype is the only robust point.
 *    Symbol keys + non-enumerable keep this collision-proof and invisible to
 *    Object.keys / JSON / spread.
 *  - Bodies forward `...args` verbatim into the data-first function. Effect's `dual`
 *    sees the full argument list and dispatches data-first, so the runtime mapping is
 *    exact across every overload of the underlying operator.
 */
import type * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import type { LazyArg } from "effect/Function"

import { install, type SymbolProtocolEntry } from "./internal/install.ts"
import { flatMap, map, orElse } from "./Symbols.ts"

// ── Symbols (the canonical identities; import these to call the methods) ──────────
export { flatMap, map, orElse } from "./Symbols.ts"
export const tap: unique symbol = Symbol("Effect/tap")
export const andThen: unique symbol = Symbol("Effect/andThen")
export const as: unique symbol = Symbol("Effect/as")
export const asVoid: unique symbol = Symbol("Effect/asVoid")
export const catchAll: unique symbol = Symbol("Effect/catchAll")
export const catchTag: unique symbol = Symbol("Effect/catchTag")
export const mapError: unique symbol = Symbol("Effect/mapError")
export const tapError: unique symbol = Symbol("Effect/tapError")
export const ensuring: unique symbol = Symbol("Effect/ensuring")
export const flip: unique symbol = Symbol("Effect/flip")
export const provideService: unique symbol = Symbol("Effect/provideService")
export const runPromise: unique symbol = Symbol("Effect/runPromise")
export const runSync: unique symbol = Symbol("Effect/runSync")

type Eff<A, E, R> = Effect.Effect<A, E, R>

// ── Types: method-form so they merge as overloads; `this` gates them to Effects ───
declare global {
  interface Object {
    // success channel
    [map]<A, E, R, B>(this: Eff<A, E, R>, f: (a: A) => B): Eff<B, E, R>
    [flatMap]<A, E, R, B, E2, R2>(
      this: Eff<A, E, R>,
      f: (a: A) => Eff<B, E2, R2>
    ): Eff<B, E | E2, R | R2>
    [tap]<A, E, R, X, E2, R2>(
      this: Eff<A, E, R>,
      f: (a: A) => Eff<X, E2, R2>
    ): Eff<A, E | E2, R | R2>
    // andThen: the two common shapes (a following effect, or a fn returning one)
    [andThen]<A, E, R, B, E2, R2>(this: Eff<A, E, R>, that: Eff<B, E2, R2>): Eff<B, E | E2, R | R2>
    [andThen]<A, E, R, B, E2, R2>(
      this: Eff<A, E, R>,
      f: (a: A) => Eff<B, E2, R2>
    ): Eff<B, E | E2, R | R2>
    [as]<A, E, R, B>(this: Eff<A, E, R>, value: B): Eff<B, E, R>
    [asVoid]<A, E, R>(this: Eff<A, E, R>): Eff<void, E, R>
    // error channel
    [catchAll]<A, E, R, A2, E2, R2>(
      this: Eff<A, E, R>,
      f: (e: E) => Eff<A2, E2, R2>
    ): Eff<A | A2, E2, R | R2>
    [catchTag]<A, E extends { _tag: string }, R, const K extends E["_tag"], A1, E1, R1>(
      this: Eff<A, E, R>,
      k: K,
      f: (e: Extract<E, { _tag: K }>) => Eff<A1, E1, R1>
    ): Eff<A | A1, Exclude<E, { _tag: K }> | E1, R | R1>
    [mapError]<A, E, R, E2>(this: Eff<A, E, R>, f: (e: E) => E2): Eff<A, E2, R>
    [tapError]<A, E, R, X, E2, R2>(
      this: Eff<A, E, R>,
      f: (e: E) => Eff<X, E2, R2>
    ): Eff<A, E | E2, R | R2>
    [orElse]<A, E, R, A2, E2, R2>(
      this: Eff<A, E, R>,
      that: LazyArg<Eff<A2, E2, R2>>
    ): Eff<A | A2, E2, R | R2>
    [ensuring]<A, E, R, X, R2>(this: Eff<A, E, R>, finalizer: Eff<X, never, R2>): Eff<A, E, R | R2>
    [flip]<A, E, R>(this: Eff<A, E, R>): Eff<E, A, R>
    [provideService]<A, E, R, I, S>(
      this: Eff<A, E, R>,
      tag: Context.Key<I, S>,
      service: S
    ): Eff<A, E, Exclude<R, I>>
    [runPromise]<A, E>(
      this: Eff<A, E, never>,
      options?: { readonly signal?: AbortSignal | undefined }
    ): Promise<A>
    [runSync]<A, E, R>(this: Eff<A, E, R>): A
  }
}

const catchAllImpl = <A, E, R, A2, E2, R2>(
  self: Eff<A, E, R>,
  f: (error: E) => Eff<A2, E2, R2>
): Eff<A | A2, E2, R | R2> =>
  Effect.catchIf(self, () => true, f as (error: E) => Eff<A2, E2, R2>) as Eff<A | A2, E2, R | R2>

const orElseImpl = <A, E, R, A2, E2, R2>(
  self: Eff<A, E, R>,
  that: LazyArg<Eff<A2, E2, R2>>
): Eff<A | A2, E2, R | R2> =>
  Effect.catchIf(self, () => true, that as (error: E) => Eff<A2, E2, R2>) as Eff<
    A | A2,
    E2,
    R | R2
  >

const protocol: readonly SymbolProtocolEntry[] = [
  { symbol: map, implementation: Effect.map },
  { symbol: flatMap, implementation: Effect.flatMap },
  { symbol: tap, implementation: Effect.tap },
  { symbol: andThen, implementation: Effect.andThen },
  { symbol: as, implementation: Effect.as },
  { symbol: asVoid, implementation: Effect.asVoid },
  { symbol: catchAll, implementation: catchAllImpl },
  { symbol: catchTag, implementation: Effect.catchTag },
  { symbol: mapError, implementation: Effect.mapError },
  { symbol: tapError, implementation: Effect.tapError },
  { symbol: orElse, implementation: orElseImpl },
  { symbol: ensuring, implementation: Effect.ensuring },
  { symbol: flip, implementation: Effect.flip },
  { symbol: provideService, implementation: Effect.provideService },
  { symbol: runPromise, implementation: Effect.runPromise },
  { symbol: runSync, implementation: Effect.runSync }
]

Effect.runSync(install(protocol))
