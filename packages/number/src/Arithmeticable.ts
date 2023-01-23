import { extend } from '@symbola/core'

export const add = Symbol('add')
export const divide = Symbol('divide')
export const subtract = Symbol('subtract')
export const multiply = Symbol('multiply')
export const pow = Symbol('pow')
export const abs = Symbol('abs')
export const acos = Symbol('acos')
export const acosh = Symbol('acosh')
export const asin = Symbol('asin')
export const asinh = Symbol('asinh')
export const atan = Symbol('atan')
export const atan2 = Symbol('atan2')
export const atanh = Symbol('atanh')
export const cbrt = Symbol('cbrt')
export const ceil = Symbol('ceil')
export const clz32 = Symbol('clz32')
export const cos = Symbol('cos')
export const cosh = Symbol('cosh')
export const exp = Symbol('exp')
export const expm1 = Symbol('expm1')
export const floor = Symbol('floor')
export const fround = Symbol('fround')
export const hypot = Symbol('hypot')
export const imul = Symbol('imul')
export const log = Symbol('log')
export const log10 = Symbol('log10')
export const log1p = Symbol('log1p')
export const log2 = Symbol('log2')
export const max = Symbol('max')
export const min = Symbol('min')
export const round = Symbol('round')
export const sign = Symbol('sign')
export const sin = Symbol('sin')
export const sinh = Symbol('sinh')
export const sqrt = Symbol('sqrt')
export const tan = Symbol('tan')
export const tanh = Symbol('tanh')
export const trunc = Symbol('trunc')

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math
 */
export default abstract class Arithmeticable {
  [add](this: number): (a: number) => number
  [add](this: number, a: number): number
  [add](this: number, a?: number) {
    if (a === undefined) {
      return (a: number) => this + a
    }
    return this + a
  }

  [subtract](this: number): (a: number) => number
  [subtract](this: number, a: number): number
  [subtract](this: number, a?: number) {
    if (a === undefined) {
      return (a: number) => this - a
    }
    return this - a
  }

  [divide](this: number): (a: number) => number
  [divide](this: number, a: number): number
  [divide](this: number, a?: number) {
    if (a === undefined) {
      return (a: number) => this / a
    }
    return this / a
  }

  [multiply](this: number): (a: number) => number
  [multiply](this: number, a: number): number
  [multiply](this: number, a?: number) {
    if (a === undefined) {
      return (a: number) => this * a
    }
    return this * a
  }

  [pow](this: number): (a: number) => number
  [pow](this: number, a: number): number
  [pow](this: number, a?: number) {
    if (a === undefined) {
      return (a: number) => this ** a
    }
    return this ** a
  }

  [abs](this: number) {
    return Math.abs(this)
  }

  [acos](this: number) {
    return Math.acos(this)
  }

  [acosh](this: number) {
    return Math.acosh(this)
  }

  [asin](this: number) {
    return Math.asin(this)
  }

  [asinh](this: number) {
    return Math.asinh(this)
  }

  [atan](this: number) {
    return Math.atan(this)
  }

  [atan2](this: number): (a: number) => number
  [atan2](this: number, a: number): number
  [atan2](this: number, a?: number) {
    if (a === undefined) {
      return (a: number) => Math.atan2(this, a)
    }
    return Math.atan2(this, a)
  }

  [atanh](this: number) {
    return Math.atanh(this)
  }

  [cbrt](this: number) {
    return Math.cbrt(this)
  }

  [ceil](this: number) {
    return Math.ceil(this)
  }

  [clz32](this: number) {
    return Math.clz32(this)
  }

  [cos](this: number) {
    return Math.cos(this)
  }

  [cosh](this: number) {
    return Math.cosh(this)
  }

  [exp](this: number) {
    return Math.exp(this)
  }

  [expm1](this: number) {
    return Math.expm1(this)
  }

  [floor](this: number) {
    return Math.floor(this)
  }

  [fround](this: number) {
    return Math.fround(this)
  }

  [hypot](this: number): (a: number) => number
  [hypot](this: number, a: number): number
  [hypot](this: number, a?: number) {
    if (a === undefined) {
      return (a: number) => Math.hypot(this, a)
    }
    return Math.hypot(this, a)
  }

  [imul](this: number): (a: number) => number
  [imul](this: number, a: number): number
  [imul](this: number, a?: number) {
    if (a === undefined) {
      return (a: number) => Math.imul(this, a)
    }
    return Math.imul(this, a)
  }

  [log](this: number) {
    return Math.log(this)
  }

  [log10](this: number) {
    return Math.log10(this)
  }

  [log1p](this: number) {
    return Math.log1p(this)
  }

  [log2](this: number) {
    return Math.log2(this)
  }

  [max](this: number): (a: number) => number
  [max](this: number, a: number): number
  [max](this: number, a?: number) {
    if (a === undefined) {
      return (a: number) => Math.max(this, a)
    }
    return Math.max(this, a)
  }

  [min](this: number): (a: number) => number
  [min](this: number, a: number): number
  [min](this: number, a?: number) {
    if (a === undefined) {
      return (a: number) => Math.min(this, a)
    }
    return Math.min(this, a)
  }

  [round](this: number) {
    return Math.round(this)
  }

  [sign](this: number) {
    return Math.sign(this)
  }

  [sin](this: number) {
    return Math.sin(this)
  }

  [sinh](this: number) {
    return Math.sinh(this)
  }

  [sqrt](this: number) {
    return Math.sqrt(this)
  }

  [tan](this: number) {
    return Math.tan(this)
  }

  [tanh](this: number) {
    return Math.tanh(this)
  }

  [trunc](this: number) {
    return Math.trunc(this)
  }
}

declare global {
  interface Number extends Arithmeticable {}
}

extend(Number.prototype, Arithmeticable.prototype)
