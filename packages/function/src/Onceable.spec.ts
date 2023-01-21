import { once } from './Onceable'

describe('Onceable', () => {
  it('runs only once', () => {
    let count = 0
    const spy = () => {
      void count++
    }
    const onced = spy[once]()
    onced()
    onced()
    onced()
    expect(count).toBe(1)
  })
})
