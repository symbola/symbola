import { _throw } from './Throwable'

describe('Throwable', () => {
  it('throws', () => {
    expect(() => Error[_throw]('message')).toThrow(Error('message'))
  })

  it('works as a parameter initializer', () => {
    const save = (filename: string = Error[_throw]('filename is required')) => filename

    expect(() => save()).toThrow(Error('filename is required'))
    expect(() => save('file.txt')).not.toThrow()
  })
})
