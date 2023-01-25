export type IteratorLike<A> = {
  next(): { done: false; value: A } | { done: true; value?: unknown }
}
