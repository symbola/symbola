import { Effect } from "effect"

export type SymbolProtocolImplementation = (...args: readonly never[]) => unknown

export interface SymbolProtocolEntry {
  readonly symbol: symbol
  readonly implementation: SymbolProtocolImplementation
}

export type SymbolProtocol = Iterable<SymbolProtocolEntry> | object

export interface GuardedSymbolProtocolEntry {
  readonly symbol: symbol
  readonly guard: (value: unknown) => boolean
  readonly implementation: SymbolProtocolImplementation
}

const isEntryIterable = (protocol: SymbolProtocol): protocol is Iterable<SymbolProtocolEntry> =>
  Symbol.iterator in protocol && typeof protocol[Symbol.iterator] === "function"

const installProperty = (target: object, symbol: symbol, value: unknown): void => {
  // oxlint-disable-next-line no-extend-native
  Object.defineProperty(target, symbol, {
    value,
    enumerable: false,
    writable: true,
    configurable: true
  })
}

/**
 * Registry of guarded handlers per symbol. When multiple type-protocols share
 * a symbol (e.g. `map` used by both Effect and Stream), each registers a
 * guard+implementation pair. The dispatcher tries guards in registration order
 * and falls through to the default (unguarded) handler.
 *
 * Shared symbols may have exactly one unguarded default. Additional
 * prototype-less types that share the symbol must use `installGuarded`, so a
 * later protocol cannot silently replace the fallback for existing receivers.
 */
const registry = new Map<
  symbol,
  {
    guards: {
      guard: (value: unknown) => boolean
      implementation: SymbolProtocolImplementation
    }[]
    default?: SymbolProtocolImplementation
  }
>()

const getOrCreateEntry = (symbol: symbol) => {
  let entry = registry.get(symbol)
  if (!entry) {
    entry = { guards: [] }
    registry.set(symbol, entry)
  }
  return entry
}

const buildDispatcher = (symbol: symbol) =>
  function(this: unknown, ...args: readonly unknown[]) {
    const entry = registry.get(symbol)!
    for (const { guard, implementation } of entry.guards) {
      if (guard(this)) {
        return Reflect.apply(implementation, undefined, [this, ...args])
      }
    }
    if (entry.default) {
      return Reflect.apply(entry.default, undefined, [this, ...args])
    }
    throw new TypeError(
      `No protocol handler found for symbol ${String(symbol)} on ${String(this)}`
    )
  }

const installDefault = (symbol: symbol, implementation: SymbolProtocolImplementation): void => {
  const reg = getOrCreateEntry(symbol)
  if (reg.default !== undefined && reg.default !== implementation) {
    throw new TypeError(
      `Symbol ${String(symbol)} already has an unguarded default; install shared symbols with installGuarded`
    )
  }
  reg.default = implementation
}

export const install = (
  protocol: SymbolProtocol,
  target: object = Object.prototype
): Effect.Effect<void> =>
  Effect.sync(() => {
    if (isEntryIterable(protocol)) {
      for (const entry of protocol) {
        installDefault(entry.symbol, entry.implementation)
        installProperty(target, entry.symbol, buildDispatcher(entry.symbol))
      }
      return
    }

    for (const symbol of Object.getOwnPropertySymbols(protocol)) {
      const descriptor = Object.getOwnPropertyDescriptor(protocol, symbol)
      if (descriptor === undefined || !("value" in descriptor)) {
        continue
      }
      installProperty(target, symbol, descriptor.value)
    }
  })

/**
 * Install guarded protocol entries on Object.prototype using the dispatch
 * registry. For shared symbols (e.g. `map`, `flatMap`, `filter`) that are used
 * by multiple type protocols (Effect, Stream, etc.), each registers a
 * guard+implementation pair. The dispatcher checks guards first, then falls
 * through to the default handler.
 *
 * Use this for every prototype-less type after the one unguarded default has
 * been installed for a shared symbol.
 *
 * Order-independent: works regardless of whether the default (unguarded) handler
 * is installed before or after the guarded one.
 */
export const installGuarded = (
  entries: readonly GuardedSymbolProtocolEntry[],
  target: object = Object.prototype
): Effect.Effect<void> =>
  Effect.sync(() => {
    for (const entry of entries) {
      const reg = getOrCreateEntry(entry.symbol)
      reg.guards.push({
        guard: entry.guard,
        implementation: entry.implementation
      })
      installProperty(target, entry.symbol, buildDispatcher(entry.symbol))
    }
  })
