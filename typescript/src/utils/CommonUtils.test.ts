import { isEmpty } from './CommonUtils'

describe('Check object isEmpty function', () => {
  test('it should return true if the input object is empty', () => {
    const input = {}
    expect(isEmpty(input)).toBe(true)
  })

  test('it should return false if the input object is not empty', () => {
    const input = { test: 'test' }
    expect(isEmpty(input)).toBe(false)
  })
})
