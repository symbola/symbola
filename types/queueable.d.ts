declare module 'queueable' {
  export class Buffer<T> {
    constructor(size: number)
    static from<T>(iterable: Iterable<T>, size: number): Buffer<T>
    length: number
    push(value: T): void
    enqueue(value: T): void
    dequeue(): T | undefined
    toArray(): T[]
    reverse(): Buffer<T>
    [Symbol.iterator](): Iterator<T>
  }
}
