import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";
import { describe, expect, it } from "@effect/vitest";
import { Equal } from "effect";
import { expectTypeOf } from "vitest";

import { append, take } from "./Chunk.ts";
import {
  fail,
  fromNullable,
  gen,
  promise,
  some,
  succeed,
  sync,
  try_,
  tryPromise,
} from "./Constructors.ts";
import { match } from "./Exit.ts";
import { get, has } from "./HashMap.ts";
import { union } from "./HashSet.ts";
import { runCollect, tap } from "./Stream.ts";
import { filter, flatMap, map } from "./Symbols.ts";
import { installGuarded, type GuardedSymbolProtocolEntry } from "./internal/install.ts";
// Import the Effect protocol to prove shared Stream/Effect symbols stay gated by receiver type.
// oxlint-disable-next-line import/no-unassigned-import
import "./Effect.ts";

const sameValue = (before: unknown, after: unknown): void => {
  expect(Equal.equals(before, after)).toBe(true);
};

const sameEffect = <A, E, R>(before: Effect.Effect<A, E, R>, after: Effect.Effect<A, E, R>) =>
  Effect.gen(function* () {
    sameValue(yield* Effect.exit(before), yield* Effect.exit(after));
  });

const sameType = expectTypeOf;

const sameHashSet = <A>(before: HashSet.HashSet<A, A>, after: HashSet.HashSet<A, A>): void => {
  expect(HashSet.size(before)).toBe(HashSet.size(after));
  for (const value of before) {
    expect(HashSet.has(after, value)).toBe(true);
  }
};

describe("symbola slice evidence", () => {
  it("provides equivalence harnesses that fail on mismatches", () => {
    sameValue(Chunk.make(1), Chunk.make(1));
    expect(() => sameValue(Chunk.make(1), Chunk.make(2))).toThrow();
  });

  it.effect("proves Chunk and Exit method forms against their module functions", () =>
    Effect.gen(function* () {
      const chunk: Chunk.Chunk<number> = Chunk.make(1, 2, 3);
      sameValue(Chunk.take(Chunk.append(chunk, 4), 2), chunk[append](4)[take](2));
      sameType(chunk[map]((value) => value + 1)).toEqualTypeOf(
        Chunk.map(chunk, (value) => value + 1),
      );

      const exit: Exit.Exit<number, string> = Exit.succeed(1);
      sameValue(
        Exit.match(exit, {
          onFailure: () => 0,
          onSuccess: (value) => value + 1,
        }),
        exit[match]({ onFailure: () => 0, onSuccess: (value) => value + 1 }),
      );
      const mappedExit: Exit.Exit<number, string> = Exit.succeed(2);
      sameType(exit[flatMap]((value) => Exit.succeed(value + 1))).toEqualTypeOf(mappedExit);

      yield* sameEffect(
        Effect.succeed(Chunk.make(1))[map]((value) => Chunk.append(value, 2)),
        Effect.map(Effect.succeed(Chunk.make(1)), (value) => Chunk.append(value, 2)),
      );
    }),
  );

  it("routes guarded protocol symbols and rejects unhandled receivers", () => {
    const probe: unique symbol = Symbol("test/probe");
    const entries: readonly GuardedSymbolProtocolEntry[] = [
      {
        symbol: probe,
        guard: () => false,
        implementation: (() => "handled") as GuardedSymbolProtocolEntry["implementation"],
      },
    ];

    Effect.runSync(installGuarded(entries));

    expect(() => (({}) as { [probe]: () => unknown })[probe]()).toThrow(
      "No protocol handler found",
    );
  });

  it("proves HashMap and HashSet method forms against their module functions", () => {
    const hashmap = HashMap.make(["a", 1], ["b", 2]);
    sameValue(
      hashmap[map]((value) => value * 2),
      HashMap.map(hashmap, (value) => value * 2),
    );
    sameValue(
      hashmap[filter]((value) => value > 1),
      HashMap.filter(hashmap, (value) => value > 1),
    );
    sameValue(
      hashmap[flatMap]((value, key) => HashMap.make([key, value + 1])),
      HashMap.flatMap(hashmap, (value, key) => HashMap.make([key, value + 1])),
    );
    sameValue(hashmap[get]("a"), HashMap.get(hashmap, "a"));
    expect(hashmap[has]("b")).toBe(HashMap.has(hashmap, "b"));
    sameType(hashmap[get]("a")).toEqualTypeOf(HashMap.get(hashmap, "a"));

    const hashset = HashSet.make(1, 2, 3);
    sameHashSet(
      hashset[map]((value) => value * 2),
      HashSet.map(hashset, (value) => value * 2),
    );
    sameHashSet(
      hashset[filter]((value) => value > 1),
      HashSet.filter(hashset, (value) => value > 1),
    );
    sameHashSet(hashset[union](HashSet.make(3, 4)), HashSet.union(hashset, HashSet.make(3, 4)));
    sameType(hashset[union](HashSet.make(4))).toEqualTypeOf(
      HashSet.union(hashset, HashSet.make(4)),
    );
  });

  it.effect("proves Stream method forms and type gates non-Stream receivers", () =>
    Effect.gen(function* () {
      const stream = Stream.make(1, 2, 3);
      const mappedStream = stream[map]((value) => value + 1);
      const filteredStream = mappedStream[filter]((value) => value > 2);
      const collectedStream = filteredStream[runCollect]();
      const flatMappedStream = stream[flatMap]((value) => Stream.make(value, value * 10));
      const tappedStream = flatMappedStream[tap](() => Effect.void);
      const collectedTappedStream = tappedStream[runCollect]();

      yield* sameEffect(
        collectedStream,
        Stream.runCollect(
          Stream.filter(
            Stream.map(stream, (value) => value + 1),
            (value) => value > 2,
          ),
        ),
      );
      yield* sameEffect(
        collectedTappedStream,
        Stream.runCollect(
          Stream.tap(
            Stream.flatMap(stream, (value) => Stream.make(value, value * 10)),
            () => Effect.void,
          ),
        ),
      );
      sameType(stream[runCollect]()).toEqualTypeOf(Stream.runCollect(stream));

      void (() => {
        // @ts-expect-error non-Stream receiver cannot use stream/effect shared method
        (({}) as object)[map]((value: number) => value + 1);
      });
    }),
  );

  it("proves constructor/lifting method forms, laziness, and type gates", async () => {
    sameType(1[succeed]()).toEqualTypeOf(Effect.succeed(1));
    sameType(new Error("oops")[fail]()).toEqualTypeOf(Effect.fail(new Error("oops")));
    const nullableOption: Option.Option<string> = Option.fromNullishOr("value");
    const someOption: Option.Option<string> = Option.some("value");
    sameType("value"[fromNullable]()).toEqualTypeOf(nullableOption);
    sameType("value"[some]()).toEqualTypeOf(someOption);

    let syncRuns = 0;
    const syncThunk = () => ++syncRuns;
    const syncEffect = syncThunk[sync]();
    expect(syncRuns).toBe(0);
    expect(Effect.runSync(syncEffect)).toBe(1);
    expect(Effect.runSync(syncEffect)).toBe(2);

    let tryRuns = 0;
    const tryThunk = () => ++tryRuns;
    const tryEffect = tryThunk[try_]();
    expect(Effect.runSync(tryEffect)).toBe(1);
    expect(Effect.runSync(tryEffect)).toBe(2);

    let promiseRuns = 0;
    const promiseThunk = () => Promise.resolve(++promiseRuns);
    const promiseEffect = promiseThunk[promise]();
    expect(await Effect.runPromise(promiseEffect)).toBe(1);
    expect(await Effect.runPromise(promiseEffect)).toBe(2);

    let tryPromiseRuns = 0;
    const tryPromiseThunk = () => Promise.resolve(++tryPromiseRuns);
    const tryPromiseEffect = tryPromiseThunk[tryPromise]();
    expect(await Effect.runPromise(tryPromiseEffect)).toBe(1);
    expect(await Effect.runPromise(tryPromiseEffect)).toBe(2);

    let genRuns = 0;
    const program = function* () {
      genRuns++;
      return yield* Effect.succeed(genRuns);
    };
    const programEffect = program[gen]();
    expect(Effect.runSync(programEffect)).toBe(1);
    expect(Effect.runSync(programEffect)).toBe(2);

    void (() => {
      // @ts-expect-error fail is deliberately limited to Error receivers
      ({ message: "plain" })[fail]();
      // @ts-expect-error live generators are not generator functions
      program()[gen]();
    });
  });
});
