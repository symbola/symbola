const map = Symbol('map')

Object.prototype[map] = function(fn) {
  return Object.fromEntries(Object.entries(this).map(fn))
}

declare global {
  interface Object {
    [map]: any
  }
}
const bla = {
  a: 1
}

const b = [12, 3, 4]

export { map }
