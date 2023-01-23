import {
  add,
  divide,
  subtract,
  multiply,
  pow,
  abs,
  acos,
  acosh,
  asin,
  asinh,
  atan,
  atan2,
  atanh,
  cbrt,
  ceil,
  clz32,
  cos,
  cosh,
  exp,
  expm1,
  floor,
  fround,
  hypot,
  imul,
  log,
  log10,
  log1p,
  log2,
  max,
  min,
  round,
  sign,
  sin,
  sinh,
  sqrt,
  tan,
  tanh,
  trunc,
} from './Arithmeticable'

describe('Arithmeticable', () => {
  it('should add', () => {
    expect((1)[add](2)).toBe(3)
    expect((1)[add]()(2)).toBe(3)
  })

  it('should subtract', () => {
    expect((1)[subtract](2)).toBe(-1)
    expect((1)[subtract]()(2)).toBe(-1)
  })

  it('should multiply', () => {
    expect((1)[multiply](2)).toBe(2)
    expect((1)[multiply]()(2)).toBe(2)
  })

  it('should divide', () => {
    expect((1)[divide](2)).toBe(0.5)
    expect((1)[divide]()(2)).toBe(0.5)
  })

  it('should pow', () => {
    expect((2)[pow](3)).toBe(8)
    expect((2)[pow]()(3)).toBe(8)
  })

  it('should abs', () => {
    expect((-1)[abs]()).toBe(1)
  })

  it('should acos', () => {
    expect((1)[acos]()).toBe(0)
  })

  it('should acosh', () => {
    expect((1)[acosh]()).toBe(0)
  })

  it('should asin', () => {
    expect((1)[asin]()).toBe(Math.PI / 2)
  })

  it('should asinh', () => {
    expect((1)[asinh]()).toBe(Math.asinh(1))
  })

  it('should atan', () => {
    expect((1)[atan]()).toBe(Math.PI / 4)
  })

  it('should atan2', () => {
    expect((1)[atan2](1)).toBe(Math.PI / 4)
    expect((1)[atan2]()(1)).toBe(Math.PI / 4)
  })

  it('should atanh', () => {
    expect((1)[atanh]()).toBe(Infinity)
  })

  it('should cbrt', () => {
    expect((8)[cbrt]()).toBe(2)
  })

  it('should ceil', () => {
    expect((1.1)[ceil]()).toBe(2)
  })

  it('should clz32', () => {
    expect((1)[clz32]()).toBe(31)
  })

  it('should cos', () => {
    expect((1)[cos]()).toBe(Math.cos(1))
  })

  it('should cosh', () => {
    expect((1)[cosh]()).toBe(Math.cosh(1))
  })

  it('should exp', () => {
    expect((1)[exp]()).toBe(Math.E)
  })

  it('should expm1', () => {
    expect((1)[expm1]()).toBe(Math.expm1(1))
  })

  it('should floor', () => {
    expect((1.1)[floor]()).toBe(1)
  })

  it('should fround', () => {
    expect((1.1)[fround]()).toBe(Math.fround(1.1))
  })

  it('should hypot', () => {
    expect((3)[hypot](4)).toBe(5)
    expect((3)[hypot]()(4)).toBe(5)
  })

  it('should imul', () => {
    expect((2)[imul](3)).toBe(6)
    expect((2)[imul]()(3)).toBe(6)
  })

  it('should log', () => {
    expect(Math.E[log]()).toBe(1)
  })

  it('should log10', () => {
    expect((100)[log10]()).toBe(2)
  })

  it('should log1p', () => {
    expect((1)[log1p]()).toBe(Math.log1p(1))
  })

  it('should log2', () => {
    expect((4)[log2]()).toBe(2)
  })

  it('should max', () => {
    expect((1)[max](2)).toBe(2)
    expect((1)[max]()(2)).toBe(2)
  })

  it('should min', () => {
    expect((1)[min](2)).toBe(1)
    expect((1)[min]()(2)).toBe(1)
  })

  it('should round', () => {
    expect((1.1)[round]()).toBe(1)
  })

  it('should sign', () => {
    expect((1)[sign]()).toBe(1)
  })

  it('should sin', () => {
    expect((1)[sin]()).toBe(Math.sin(1))
  })

  it('should sinh', () => {
    expect((1)[sinh]()).toBe(Math.sinh(1))
  })

  it('should sqrt', () => {
    expect((4)[sqrt]()).toBe(2)
  })

  it('should tan', () => {
    expect((1)[tan]()).toBe(Math.tan(1))
  })

  it('should tanh', () => {
    expect((1)[tanh]()).toBe(Math.tanh(1))
  })

  it('should trunc', () => {
    expect((1.1)[trunc]()).toBe(1)
  })
})
