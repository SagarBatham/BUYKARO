const { extractBearerToken } = require('../src/utils/token')

describe('extractBearerToken', () => {
  test('extracts a JWT from a cookie-style token string', () => {
    const raw = 'token=eyJhbGciOiJIUzI1NiJ9.payload; Path=/; Secure; HttpOnly'

    expect(extractBearerToken(raw)).toBe('eyJhbGciOiJIUzI1NiJ9.payload')
  })

  test('removes a Bearer prefix when present', () => {
    expect(extractBearerToken('Bearer eyJhbGciOiJIUzI1NiJ9.payload')).toBe('eyJhbGciOiJIUzI1NiJ9.payload')
  })
})
