const request = require('supertest')
const express = require('express')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const { createAuthMiddleware } = require('../src/middleware/auth.middleware')

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret'

describe('PATCH /api/orders/:id/address', () => {
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

    app.patch('/api/orders/:id/address', createAuthMiddleware(['user']), async (req, res) => {
      const order = await orderModel.findById(req.params.id)
      if (!order) return res.status(404).json({ message: 'Not Found' })
      if (order.user !== req.user.id) return res.status(403).json({ message: 'Forbidden' })

      const updated = await orderModel.findByIdAndUpdate(req.params.id, { shippingAddress: req.body.shippingAddress }, { new: true })
      return res.status(200).json(updated)
    })
  })

  test('updates shipping address when owner', async () => {
    const order = { _id: 'o1', user: '60f6f9f9a2b4f9a7b0c12345', shippingAddress: { city: 'Old' } }
    orderModel.findById.mockResolvedValue(order)
    const updated = { ...order, shippingAddress: { city: 'New' } }
    orderModel.findByIdAndUpdate.mockResolvedValue(updated)

    const res = await request(app)
      .patch('/api/orders/o1/address')
      .set('Cookie', authCookie)
      .send({ shippingAddress: { city: 'New' } })

    expect(res.status).toBe(200)
    expect(res.body.shippingAddress.city).toBe('New')
  })

  test('returns 403 when not owner', async () => {
    const order = { _id: 'o2', user: 'otherUser' }
    orderModel.findById.mockResolvedValue(order)
    const res = await request(app)
      .patch('/api/orders/o2/address')
      .set('Cookie', authCookie)
      .send({ shippingAddress: { city: 'New' } })
    expect(res.status).toBe(403)
  })

  test('returns 404 when not found', async () => {
    orderModel.findById.mockResolvedValue(null)
    const res = await request(app)
      .patch('/api/orders/missing/address')
      .set('Cookie', authCookie)
      .send({ shippingAddress: { city: 'Nowhere' } })
    expect(res.status).toBe(404)
  })
})
