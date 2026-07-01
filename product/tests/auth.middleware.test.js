const jwt = require('jsonwebtoken')
const createAuthMiddleware = require('../src/middleware/auth.middleware')

describe('createAuthMiddleware', () => {
  const originalJwtSecret = process.env.JWT_SECRET
  const originalAuthJwtSecret = process.env.AUTH_JWT_SECRET

  afterEach(() => {
    process.env.JWT_SECRET = originalJwtSecret
    process.env.AUTH_JWT_SECRET = originalAuthJwtSecret
    delete process.env.SHARED_JWT_SECRET
  })

  test('accepts tokens signed with AUTH_JWT_SECRET when JWT_SECRET is unavailable', () => {
    process.env.JWT_SECRET = ''
    process.env.AUTH_JWT_SECRET = 'fallback-secret'
    process.env.NODE_ENV = 'development'

    const token = jwt.sign({ id: 'seller-1', role: 'seller' }, 'fallback-secret')
    const req = {
      headers: {
        authorization: `Bearer ${token}`
      }
    }
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    const next = jest.fn()

    createAuthMiddleware(['seller'])(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(req.user).toMatchObject({ id: 'seller-1', role: 'seller' })
    expect(res.status).not.toHaveBeenCalled()
  })
})
