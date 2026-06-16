const request = require('supertest')
const express = require('express')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const { createAuthMiddleware } = require('../src/middleware/auth.middleware')

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret'

describe('GET /api/orders/:id', () => {
  let app
  let authCookie
  let orderModel

  beforeAll(() => {
    const userId = '60f6f9f9a2b4f9a7b0c12345'
    const token = jwt.sign({ id: userId, role: 'user' }, process.env.JWT_SECRET)
    authCookie = `token=${token}`

    orderModel = {
      findById: jest.fn()
    }

    app = express()
    app.use(express.json())
    app.use(cookieParser())

    app.get('/api/orders/:id', createAuthMiddleware(['user']), async (req, res) => {
      const order = await orderModel.findById(req.params.id)
      if (!order) return res.status(404).json({ message: 'Not Found' })
      return res.status(200).json(order)
    })
  })

  test('returns order when found', async () => {
    const sampleOrder = { _id: 'order1', user: '60f6f9f9a2b4f9a7b0c12345', items: [] }
    orderModel.findById.mockResolvedValue(sampleOrder)

    const res = await request(app).get('/api/orders/order1').set('Cookie', authCookie)
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject(sampleOrder)
  })

  test('returns 404 when not found', async () => {
    orderModel.findById.mockResolvedValue(null)
    const res = await request(app).get('/api/orders/missing').set('Cookie', authCookie)
    expect(res.status).toBe(404)
  })

  test('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/orders/order1').set('Authorization', 'Bearer ')
    expect(res.status).toBe(401)
  })
})
