const request = require('supertest')
const app = require('../src/app')

describe('Cart API', () => {
  const productId = `test-prod-${Date.now()}`

  test('GET /api/cart - should return cart object (array of items)', async () => {
    const res = await request(app).get('/api/cart')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('items')
    expect(Array.isArray(res.body.items)).toBe(true)
  })

  test('POST /api/cart/items - should add an item to the cart', async () => {
    const payload = { productId, qty: 2 }
    const res = await request(app).post('/api/cart/items').send(payload)
    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('productId', productId)
    expect(res.body).toHaveProperty('qty', 2)
  })

  test('PATCH /api/cart/items/:productId - should update item quantity', async () => {
    const newQty = 5
    const res = await request(app).patch(`/api/cart/items/${productId}`).send({ qty: newQty })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('productId', productId)
    expect(res.body).toHaveProperty('qty', newQty)
  })

  test('DELETE /api/cart/items/:productId - should remove the item from cart', async () => {
    const res = await request(app).delete(`/api/cart/items/${productId}`)
    expect(res.status === 200 || res.status === 204).toBeTruthy()
  })

  test('DELETE /api/cart - should clear the cart', async () => {
    const res = await request(app).delete('/api/cart')
    expect(res.status === 200 || res.status === 204).toBeTruthy()
  })
})
