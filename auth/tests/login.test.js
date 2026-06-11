const request = require('supertest')
const app = require('../src/app')
const User = require('../src/model/user.model')
const bcrypt = require('bcrypt')

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const hash = await bcrypt.hash('password123', 10)
    await User.create({
      username: 'loginuser',
      email: 'login@example.com',
      password: hash,
      fullName: { firstName: 'Login', lastName: 'User' }
    })
  })

  it('logs in a user successfully and sets a token cookie', async () => {
    const payload = {
      email: 'login@example.com',
      password: 'password123'
    }

    const res = await request(app)
      .post('/api/auth/login')
      .send(payload)

    // Expected structure depends on implementation; assert likely behavior
    expect([200, 201, 204]).toContain(res.statusCode)

    expect(res.headers['set-cookie']).toBeDefined()

    // If body includes user info, assert common fields
    if (res.body && res.body.user) {
      expect(res.body.user).toHaveProperty('username', 'loginuser')
      expect(res.body.user).toHaveProperty('email', 'login@example.com')
      expect(res.body.user).not.toHaveProperty('password')
    }
  })

  it('logs in using username successfully and sets a token cookie', async () => {
    const payload = {
      username: 'loginuser',
      password: 'password123'
    }

    const res = await request(app)
      .post('/api/auth/login')
      .send(payload)

    expect([200, 201, 204]).toContain(res.statusCode)
    expect(res.headers['set-cookie']).toBeDefined()

    if (res.body && res.body.user) {
      expect(res.body.user).toHaveProperty('username', 'loginuser')
      expect(res.body.user).toHaveProperty('email', 'login@example.com')
      expect(res.body.user).not.toHaveProperty('password')
    }
  })
})