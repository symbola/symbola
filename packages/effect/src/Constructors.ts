import * as Effect from "effect/Effect";
import * as Option from "effect/Option";

// ── Symbols ──────────────────────────────────────────────────────────────────
export const succeed: unique symbol = Symbol("constructors/succeed");
export const fail: unique symbol = Symbol("constructors/fail");
export const gen: unique symbol = Symbol("constructors/gen");
export const tryPromise: unique symbol = Symbol("constructors/tryPromise");
export const promise: unique symbol = Symbol("constructors/promise");
// Using a different name to avoid collision with native try keyword
export const try_: unique symbol = Symbol("constructors/try");
export const sync: unique symbol = Symbol("constructors/sync");
export const fromNullable: unique symbol = Symbol("constructors/fromNullable");
export const some: unique symbol = Symbol("constructors/some");

// ── Types ────────────────────────────────────────────────────────────────────
declare global {
  interface Object {
    [succeed]<A>(this: A): Effect.Effect<A>;
    [sync]<A>(this: () => A): Effect.Effect<A>;
    [try_]<A>(this: () => A): Effect.Effect<A, unknown>;
    [tryPromise]<A>(this: () => PromiseLike<A>): Effect.Effect<A, unknown>;
    [promise]<A>(this: () => PromiseLike<A>): Effect.Effect<A>;
    [fromNullable]<A>(this: A): Option.Option<NonNullable<A>>;
    [some]<A>(this: A): Option.Option<A>;
  }

  interface Error {
    [fail]<E>(this: E): Effect.Effect<never, E>;
  }
}

interface GeneratorFunctionProtocol {
  [gen]<Eff extends Effect.Effect<unknown, unknown, unknown>, AEff>(
    this: () => Generator<Eff, AEff, never>,
  ): Effect.Effect<
    AEff,
    Eff extends Effect.Effect<unknown, infer E, unknown> ? E : never,
    Eff extends Effect.Effect<unknown, unknown, infer R> ? R : never
  >;
}

type EffectGeneratorFunction = () => Generator<
  Effect.Effect<unknown, unknown, unknown>,
  unknown,
  never
>;

// Augment GeneratorFunction instances with [gen]
declare global {
  interface Function extends GeneratorFunctionProtocol {}
}

// ── Runtime installation on Object.prototype ─────────────────────────────────
const installProperty = (
  target: object,
  symbol: symbol,
  value: unknown,
): void => {
  Object.defineProperty(target, symbol, {
    value,
    enumerable: false,
    writable: true,
    configurable: true,
  });
};

installProperty(Object.prototype, succeed, function (this: unknown) {
  return Effect.succeed(this);
});

installProperty(Error.prototype, fail, function (this: unknown) {
  return Effect.fail(this);
});

installProperty(Object.prototype, sync, function (this: () => unknown) {
  return Effect.sync(this);
});

installProperty(Object.prototype, try_, function (this: () => unknown) {
  return Effect.try({ try: this, catch: (error) => error });
});

installProperty(
  Object.prototype,
  tryPromise,
  function (this: () => PromiseLike<unknown>) {
    return Effect.tryPromise(this);
  },
);

installProperty(
  Object.prototype,
  promise,
  function (this: () => PromiseLike<unknown>) {
    return Effect.promise(this);
  },
);

installProperty(
  Function.prototype,
  gen,
  function (this: EffectGeneratorFunction) {
    return Effect.gen(this as unknown as EffectGeneratorFunction);
  },
);

installProperty(Object.prototype, fromNullable, function (this: unknown) {
  return Option.fromNullishOr(this);
});

installProperty(Object.prototype, some, function (this: unknown) {
  return Option.some(this);
});
