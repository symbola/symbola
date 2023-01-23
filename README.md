<h1 align="center"><img src="https://raw.githubusercontent.com/slikts/symbola/master/logo.png?sanitize=true" width="541" height="180" alt="Symbola"></h1>

<p align="center">
  <a href="https://github.com/prettier/prettier#readme"><img alt="code style" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square"></a>
  <a href="https://conventionalcommits.org"><img alt="Conventional Commits: 1.0.0" src="https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square"></a>
  <a href="https://renovatebot.com"><img alt="Renovate enabled" src="https://img.shields.io/badge/renovate-enabled-brightgreen.svg?style=flat-square"></a>
  <a href="https://github.com/renovatebot/github-action/actions"><img alt="GitHub workflow status" src="https://img.shields.io/github/actions/workflow/status/symbola/symbola/cicd.yml"></a>
  <a href="https://codecov.io/github/symbola/symbola" > 
 <img src="https://codecov.io/github/symbola/symbola/branch/main/graph/badge.svg?token=4GR7BO7977"/> 
 </a>
</p>

**Symbola** is a proof-of-concept library for 🤯 extending the native JavaScript prototypes 🤯 with methods identified by [symbols] to prevent naming collisions, which enables method chaining syntax without having to wrap or convert the target. For example, `Map` and `Set` objects don't have built-in iteration methods, so iterating over them requires a conversion to an array:

[symbols]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol

```js
const xs = new Set([1, 2, 3, 4])
// Converting to array with ... spread syntax to chain map and filter
const ys = [...xs].map((x) => x + 1).filter((x) => x % 2)
```

In comparison, extending the native prototypes allows to use iteration methods on iterables without conversion:

```js
// Importing the unique symbols used to access iteration methods
import { map, filter } from '@symbola/iterable'

const xs = new Set([1, 2, 3, 4])
// Calling [map] and [filter] methods without conversion
const ys = xs[map]((x) => x + 1)[filter]((x) => x % 2)
```

## Rationale for symbol protocol extensions

The key difference when extending native prototypes with [symbols] as keys is that symbol primitives are unique, so there is no practical chance of repeating situations like [SmooshGate], where a non-standard `Array.prototype.flatten` method prevented a standard method with the same name from being added. The trade off is that accessing methods with symbols requires the `[]` operator instead of the `.`, but it's a small difference compared to overcoming the limitations of method chaining that are well documented in, for example, the [pipeline operator proposal]. In short, extending native prototoypes is a workaround for making [fluent interfaces] more widely applicable without the downsides of other workarounds like temporary variables or wrappers like [_.chain].

[_.chain]: https://lodash.com/docs/4.17.15#chain
[fluent interfaces]: https://en.wikipedia.org/wiki/Fluent_interface
[pipeline operator proposal]: https://github.com/tc39/proposal-pipeline-operator/blob/main/README.md
[SmooshGate]: https://developer.chrome.com/blog/smooshgate/

### Similar features in other languages

A number of other languages have ad-hoc extension features like [trait composition] or [protocol extensions], which allow to retroactively extend types without modifying their definition based on conformity to a specific blueprint, contract, convention or _protocol_. For example, JavaScript defines [iteration protocols], which are a set of requirements for types to be iterable, which means returning an associated iterator type when the `[Symbol.iterator]()` method is called, which in turn implements methods to return iteration results. Conforming to the iteration protocols means that the type is supported by `for-of` loop syntax or `yield` or `yield*` operators in generator functions, and is also supported by third-party utility libraries like [IxJS] or [iterall], but these libraries have generally had limited adoption because of the limitations of chaining syntax in JavaScript, where retroactively extending types with chainable methods requires using wrappers, or to extend the native prototypes as in the [iteration helpers proposal], which means going through an exceedingly long standardization process.

Symbol protocol extensions are a userland workaround for the typical limitations of avoiding a nested coding style in JavaScript, and it uses the language's flexibility to implement something similar to Rust traits, Swift protocols or Haskell typeclasses, and an additional advantage over, for example, the proposed standard extensions to native prototypes is that symbol protocols work for all objects that implement them, not just those inheriting from specific intrinsics like `%Iterator.prototype%`.

[iteration helpers proposal]: https://github.com/tc39/proposal-iterator-helpers
[iterall]: https://github.com/leebyron/iterall
[IxJS]: https://github.com/ReactiveX/IxJS
[iteration protocols]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
[trait composition]: https://doc.rust-lang.org/book/ch19-03-advanced-traits.html
[protocol extensions]: https://docs.swift.org/swift-book/LanguageGuide/Protocols.html#ID521

### Type safety

TypeScript allows constraining methods to just receivers that conform to a specific protocol, so symbol protocol methods are typed to prevent being used with non-conforming types like so:

```ts
{
  [filter]()<A>(this: Iterable<A>, fn: (a: A) => boolean) { ... }
}
```

The actual implementation for the symbol protocols also does not rely on anything magical and just add the methods to the native prototypes and use [declaration merging] to make TypeScript recognize the added methods.

[declaration merging]: https://www.typescriptlang.org/docs/handbook/declaration-merging.html

<details>
<summary><strong>Full implementation for the filterable protocol</strong></summary>

```ts
import { extend } from '@symbola/core'

export const filter = Symbol('filter')

export default abstract class Filterable {
  *[filter]<T>(this: Iterable<T>, callback: (value: T) => boolean) {
    for (const value of this) {
      if (callback(value)) {
        yield value
      }
    }
  }
}

declare global {
  interface Object extends Filterable {}
}

extend(Object.prototype, Filterable.prototype)
```

</details>

### Standard ad-hoc extension proposal

Aside from the `|>` pipeline operator proposal, there is also the `::` bind operator proposal that addresses the same issue of ad-hoc extension of existing types, and there is also a stage-1 [extensions proposal] based on the same operator, which would essentially do the same as is currently already possible in userland with symbol protocol extensions.

[extensions proposal]: https://www.proposals.es/proposals/Extensions

## Example use cases

### Lazy iteration

The symbol methods are added to `Object.prototype`, so they work on any object that implements the JavaScript [iteration protocols], including generators:

```js
import { filter } from '@symbola/iterable'

function* naturals() {
  let i = 1
  while (true) {
    yield i++
  }
}
const xs = naturals()[filter]((x) => x % 2)
```

The above example doesn't get stuck in an infinite loop because it takes advantage of the laziness of iterators, which is not possible when converting iterators to arrays, because the array iteration methods are eager.

The `@symbola/iterable` package implements the methods from the [iterator helpers proposal] meant to support lazy iteration.

[iteration protocols]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols

### Logging

`[log]()` calls can be inserted in the code without having to wrap the target:

```js
import { log } from '@symbola/core'

const foo = bar[log]().baz().qux()
```

[iterator helpers proposal]: https://github.com/tc39/proposal-iterator-helpers
[`Set` methods]: https://github.com/tc39/proposal-set-methods

### Set methods

The `@symbola/set` package implements the proposed method extensions from the [`Set` methods] proposal.

<details>
<summary><strong>Example</strong></summary>

```js
import { difference } from '@symbola/set'

const a = new Set([1, 2, 3, 4])
const b = new Set([3, 4, 5, 6])

a[difference](b) // -> Set([3, 4])
```

</details>

## Usage

The library is divided into separate packages:

- `@symbola/core`
- `@symbola/iterable`
- `@symbola/object`
- `@symbola/function`
- `@symbola/number`
- `@symbola/set`

Importing the specific package will extend the corresponding native prototypes.

## Caveats

JavaScript [symbols] provide only weak encapsulation or privacy, so it's possible for code that uses [Reflect.ownKeys] on native prototypes to conflict with the custom symbol properties, but the practical chances of it are exceedingly low.

[Reflect.ownKeys]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/ownKeys

The symbol properties also won't work on objects that don't inherit from `Object.prototype`, like those created with `Object.create(null)` or `null` or `undefined` values.
