import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";

import { install } from "./internal/install.ts";
import { flatMap, map, match } from "./Symbols.ts";

export { flatMap, map, match } from "./Symbols.ts";

type Ex<A, E> = Exit.Exit<A, E>;

declare module "effect/Exit" {
  interface Success<A, E> extends ExitProtocol<A, E> {}
  interface Failure<A, E> extends ExitProtocol<A, E> {}
}

abstract class ExitProtocol<A, E> {
  [map]<B>(this: Ex<A, E>, f: (value: A) => B): Ex<B, E> {
    return Exit.map(this, f);
  }

  [flatMap]<B, E2>(this: Ex<A, E>, f: (value: A) => Ex<B, E2>): Ex<B, E | E2> {
    return Exit.isSuccess(this)
      ? f(this.value)
      : (this as unknown as Ex<B, E | E2>);
  }

  [match]<B, C>(
    this: Ex<A, E>,
    options: {
      readonly onFailure: (
        cause: Exit.Exit<never, E> extends Exit.Exit<never, infer E0>
          ? import("effect/Cause").Cause<E0>
          : never,
      ) => B;
      readonly onSuccess: (value: A) => C;
    },
  ): B | C {
    return Exit.match(this, options);
  }
}

const prototypeOf = (value: object): object => {
  const prototype = Object.getPrototypeOf(value);
  if (prototype === null) {
    throw new TypeError("Expected Exit branch to have a prototype");
  }
  return prototype;
};

// Safe: all Success exits share one prototype and all Failure exits share one
// prototype, unlike Stream where constructors do not share a single prototype.
Effect.runSync(install(ExitProtocol.prototype, prototypeOf(Exit.succeed(0))));
Effect.runSync(install(ExitProtocol.prototype, prototypeOf(Exit.fail("e"))));
