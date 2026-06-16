const request = require('supertest')
const express = require('express')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const { createAuthMiddleware } = require('../src/middleware/auth.middleware')

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret'

describe('POST /api/orders/:id/cancel', () => {
  let app
  let authCookie
  let orderModel

  beforeAll(() => {
    const userId = '60f6f9f9a2b4f9a7b0c12345'
    const token = jwt.sign({ id: userId, role: 'user' }, process.env.JWT_SECRET)
    authCookie = `token=${token}`

    orderModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn()
    }

    app = express()
    app.use(express.json())
    app.use(cookieParser())

    app.post('/api/orders/:id/cancel', createAuthMiddleware(['user']), async (req, res) => {
      const order = await orderModel.findById(req.params.id)
      if (!order) return res.status(404).json({ message: 'Not Found' })
      if (order.user !== req.user.id) return res.status(403).json({ message: 'Forbidden' })
      if (order.status === 'CANCELLED') return res.status(400).json({ message: 'Already cancelled' })

      const updated = await orderModel.findByIdAndUpdate(req.params.id, { status: 'CANCELLED' }, { new: true })
      return res.status(200).json(updated)
    })
  })

  test('cancels order when owned by user', async () => {
    const order = { _id: 'o1', user: '60f6f9f9a2b4f9a7b0c12345', status: 'PENDING' }
    orderModel.findById.mockResolvedValue(order)
    const updated = { ...order, status: 'CANCELLED' }
    orderModel.findByIdAndUpdate.mockResolvedValue(updated)

    const res = await request(app).post('/api/orders/o1/cancel').set('Cookie', authCookie)
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('CANCELLED')
  })

  test('returns 403 when not owner', async () => {
    const order = { _id: 'o2', user: 'otherUser', status: 'PENDING' }
    orderModel.findById.mockResolvedValue(order)
    const res = await request(app).post('/api/orders/o2/cancel').set('Cookie', authCookie)
    expect(res.status).toBe(403)
  })

  test('returns 400 when already cancelled', async () => {
    const order = { _id: 'o3', user: '60f6f9f9a2b4f9a7b0c12345', status: 'CANCELLED' }
    orderModel.findById.mockResolvedValue(order)
    const res = await request(app).post('/api/orders/o3/cancel').set('Cookie', authCookie)
    expect(res.status).toBe(400)
  })
})
