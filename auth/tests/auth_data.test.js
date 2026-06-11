const request = require('supertest')
const app = require('../src/app')
const User = require('../src/model/user.model')

const payload = {
  username: 'test',
  email: 'test@gmail.com',
  password: 'test123',
  fullName: { firstName: 'test_first', lastName: 'test_last' }
}

describe('Auth flow using provided test data', () => {
  beforeEach(async () => {
    await User.deleteMany({})
  })

  it('registers the test user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send(payload)

    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('message')
    expect(res.body).toHaveProperty('user.username', 'test')
    expect(res.body).toHaveProperty('user.email', 'test@gmail.com')
    expect(res.body.user).not.toHaveProperty('password')

    const user = await User.findOne({ username: 'test' }).lean()
    expect(user).toBeTruthy()
    expect(user.email).toBe('test@gmail.com')
  })

  it('logs in with email and password', async () => {
    // ensure user exists
    await request(app).post('/api/auth/register').send(payload)

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@gmail.com', password: 'test123' })

    expect(res.statusCode).toBe(200)
    expect(res.headers['set-cookie']).toBeDefined()
    expect(res.body.user).toHaveProperty('username', 'test')
    expect(res.body.user).toHaveProperty('email', 'test@gmail.com')
  })

  it('logs in with username and password', async () => {
    // ensure user exists
    await request(app).post('/api/auth/register').send(payload)

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'test', password: 'test123' })

    expect(res.statusCode).toBe(200)
    expect(res.headers['set-cookie']).toBeDefined()
    expect(res.body.user).toHaveProperty('username', 'test')
    expect(res.body.user).toHaveProperty('email', 'test@gmail.com')
  })
})
