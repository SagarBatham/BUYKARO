const request = require('supertest')
const app = require('../src/app')
const User = require('../src/model/user.model')

const payload = {
  username: 'meuser',
  email: 'me@example.com',
  password: 'password123',
  fullName: { firstName: 'Me', lastName: 'User' }
}

describe('GET /api/auth/me', () => {
  beforeEach(async () => {
    await User.deleteMany({})
  })

  it('returns the current user when authenticated via cookie', async () => {
    await request(app).post('/api/auth/register').send(payload)

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: payload.email, password: payload.password })

    const cookies = loginRes.headers['set-cookie']
    expect(cookies).toBeDefined()

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookies)

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('user.username', 'meuser')
    expect(res.body).toHaveProperty('user.email', 'me@example.com')
    expect(res.body.user).not.toHaveProperty('password')
  })
})
