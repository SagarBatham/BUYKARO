const request = require('supertest')
const app = require('../src/app')

describe('GET /api/auth/logout', () => {
  it('clears the auth token cookie when logging out', async () => {
    const res = await request(app)
      .get('/api/auth/logout')
      .set('Cookie', ['token=mocktoken'])

    // Accept common success codes (implementation may vary)
    expect([200, 204]).toContain(res.statusCode)

    // Logout should send a Set-Cookie header for the token
    expect(res.headers['set-cookie']).toBeDefined()
    expect(res.headers['set-cookie'][0]).toMatch(/token=/)

    // If a message is returned, ensure it's a string
    if (res.body && res.body.message) {
      expect(typeof res.body.message).toBe('string')
    }
  })
})
