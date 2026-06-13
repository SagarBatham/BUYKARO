const request = require('supertest')
const path = require('path')
const app = require('../src/app')
const Product = require('../src/model/product.model')

jest.mock('../src/services/imageService', () => ({
  uploadImage: jest.fn(async (buffer, filename) => ({
    url: `https://example.com/${filename}`,
    thumbnail: `https://example.com/thumb_${filename}`,
    id: `id_${filename}`
  }))
}))

describe('POST /api/products', () => {
  beforeAll(() => {
    // Mock mongoose model create to avoid DB dependency
    jest.spyOn(Product, 'create').mockImplementation(async (obj) => ({
      _id: 'someid',
      ...obj
    }))
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  test('creates product and uploads images', async () => {
    const fixture = path.join(__dirname, 'fixtures', 'sample.jpg')

    const res = await request(app)
      .post('/api/products')
      .field('title', 'Test Product')
      .field('price', '100')
      .field('seller', 'seller123')
      .attach('images', fixture)

    expect(res.statusCode).toBe(201)
    expect(res.body.title).toBe('Test Product')
    expect(res.body.images).toBeDefined()
    expect(res.body.images.length).toBeGreaterThan(0)
    expect(res.body.price.amount).toBe(100)
  })
})

describe('GET /api/products', () => {
  test('returns a list of products', async () => {
    const sampleProducts = [
      { _id: 'p1', title: 'Prod 1', price: { amount: 10, currency: 'INR' } },
      { _id: 'p2', title: 'Prod 2', price: { amount: 20, currency: 'INR' } }
    ]

    const productModel = require('../src/model/product.model')
    const fakeQuery = { skip: jest.fn().mockReturnThis(), limit: jest.fn().mockResolvedValue(sampleProducts) }
    jest.spyOn(productModel, 'find').mockReturnValue(fakeQuery)

    const res = await request(app).get('/api/products')

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBe(2)
    expect(res.body.data[0].title).toBe('Prod 1')

    jest.restoreAllMocks()
  })
})

describe('GET /api/products/:id', () => {
  test('returns product when found', async () => {
    const productModel = require('../src/model/product.model')
    const product = { _id: 'p1', title: 'Prod 1', price: { amount: 10, currency: 'INR' } }

    jest.spyOn(productModel, 'findById').mockResolvedValue(product)

    const res = await request(app).get('/api/products/p1')

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('product')
    expect(res.body.product._id).toBe('p1')

    jest.restoreAllMocks()
  })

  test('returns 404 when product not found', async () => {
    const productModel = require('../src/model/product.model')

    jest.spyOn(productModel, 'findById').mockResolvedValue(null)

    const res = await request(app).get('/api/products/nonexistent')

    expect(res.statusCode).toBe(404)
    expect(res.body).toHaveProperty('message')

    jest.restoreAllMocks()
  })
})

describe('PATCH /api/products/:id (SELLER)', () => {
  test('updates product when seller is owner', async () => {
    const productModel = require('../src/model/product.model')
    const id = '507f1f77bcf86cd799439011'
    const product = {
      _id: id,
      title: 'Old Title',
      seller: 'test-seller',
      price: { amount: 50, currency: 'INR' },
      save: jest.fn(async function () { return this })
    }

    jest.spyOn(productModel, 'findOne').mockResolvedValue(product)

    const res = await request(app)
      .patch(`/api/products/${id}`)
      .set('Authorization', 'Bearer faketoken')
      .send({ title: 'New Title', price: { amount: 75 } })

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('product')
    expect(res.body.product.title).toBe('New Title')

    jest.restoreAllMocks()
  })

  test('returns 404 when product to update not found', async () => {
    const productModel = require('../src/model/product.model')
    const id = '507f1f77bcf86cd799439022'

    jest.spyOn(productModel, 'findOne').mockResolvedValue(null)

    const res = await request(app)
      .patch(`/api/products/${id}`)
      .set('Authorization', 'Bearer faketoken')
      .send({ title: 'Doesnt Matter' })

    expect(res.statusCode).toBe(404)
    expect(res.body).toHaveProperty('message')

    jest.restoreAllMocks()
  })
})

describe('DELETE /api/products/:id (SELLER)', () => {
  test('deletes product when seller is owner', async () => {
    const productModel = require('../src/model/product.model')
    const id = '507f1f77bcf86cd799439033'
    const product = { _id: id, title: 'ToDelete', seller: 'test-seller' }

    jest.spyOn(productModel, 'findOne').mockResolvedValue(product)
    jest.spyOn(productModel, 'findOneAndDelete').mockResolvedValue(product)

    const res = await request(app)
      .delete(`/api/products/${id}`)
      .set('Authorization', 'Bearer faketoken')

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('message')

    jest.restoreAllMocks()
  })

  test('returns 404 when product to delete not found', async () => {
    const productModel = require('../src/model/product.model')
    const id = '507f1f77bcf86cd799439044'

    jest.spyOn(productModel, 'findOne').mockResolvedValue(null)

    const res = await request(app)
      .delete(`/api/products/${id}`)
      .set('Authorization', 'Bearer faketoken')

    expect(res.statusCode).toBe(404)
    expect(res.body).toHaveProperty('message')

    jest.restoreAllMocks()
  })
})

describe('GET /api/products/seller (SELLER)', () => {
  test('returns products for the authenticated seller', async () => {
    const productModel = require('../src/model/product.model')
    const sampleProducts = [
      { _id: 's1', title: 'Seller Prod 1', seller: 'test-seller' },
      { _id: 's2', title: 'Seller Prod 2', seller: 'test-seller' }
    ]

    const fakeQuery = { skip: jest.fn().mockReturnThis(), limit: jest.fn().mockResolvedValue(sampleProducts) }
    jest.spyOn(productModel, 'find').mockReturnValue(fakeQuery)

    const res = await request(app)
      .get('/api/products/seller')
      .set('Authorization', 'Bearer faketoken')

    if (res.statusCode !== 200) console.log('SELLER RES', res.statusCode, res.body)

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBe(2)

    jest.restoreAllMocks()
  })

  test('returns empty array when no products for seller', async () => {
    const productModel = require('../src/model/product.model')

    const fakeQuery = { skip: jest.fn().mockReturnThis(), limit: jest.fn().mockResolvedValue([]) }
    jest.spyOn(productModel, 'find').mockReturnValue(fakeQuery)

    const res = await request(app)
      .get('/api/products/seller')
      .set('Authorization', 'Bearer faketoken')

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBe(0)

    jest.restoreAllMocks()
  })
})
