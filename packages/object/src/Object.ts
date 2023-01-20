const map = Symbol('map')

Object.prototype[map] = () => {
  console.log(123)
}

declare global {
  interface Object {
    [map]: () => unknown
  }
}

export { map }
