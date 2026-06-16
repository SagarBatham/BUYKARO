const request = require('supertest')
const express = require('express')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const { createAuthMiddleware } = require('../src/middleware/auth.middleware')

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret'

describe('GET /api/orders/me', () => {
  let app
  let authCookie
  let orderModel

  beforeAll(() => {
    const userId = '60f6f9f9a2b4f9a7b0c12345'
    const token = jwt.sign({ id: userId, role: 'user' }, process.env.JWT_SECRET)
    authCookie = `token=${token}`

    orderModel = {
      find: jest.fn()
    }

    app = express()
    app.use(express.json())
    app.use(cookieParser())

    app.get('/api/orders/me', createAuthMiddleware(['user']), async (req, res) => {
      const orders = await orderModel.find({ user: req.user.id })
      return res.status(200).json(orders)
    })
  })

  test('returns list of orders for authenticated user', async () => {
    const sampleOrders = [{ _id: 'o1' }, { _id: 'o2' }]
    orderModel.find.mockResolvedValue(sampleOrders)

    const res = await request(app).get('/api/orders/me').set('Cookie', authCookie)
    expect(res.status).toBe(200)
    expect(res.body).toEqual(sampleOrders)
  })

  test('returns 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/orders/me')
    expect(res.status).toBe(401)
  })
})
