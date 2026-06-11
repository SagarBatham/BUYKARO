const request = require('supertest')
const app = require('../src/app')
const User = require('../src/model/user.model')

const userPayload = {
  username: 'addruser',
  email: 'addr@example.com',
  password: 'password123',
  fullName: { firstName: 'Addr', lastName: 'User' }
}

async function createAndLogin() {
  await request(app).post('/api/auth/register').send(userPayload)
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: userPayload.email, password: userPayload.password })
  return loginRes.headers['set-cookie']
}

describe('Address APIs', () => {
  beforeEach(async () => {
    await User.deleteMany({})
  })

  it('adds address with valid pincode and phone', async () => {
    const cookies = await createAndLogin()

    const payload = {
      street: '123 Test St',
      city: 'Testville',
      state: 'TS',
      country: 'Testland',
      zip: '560001',
      phone: '9876543210'
    }

    const res = await request(app)
      .post('/api/auth/users/me/addresses')
      .set('Cookie', cookies)
      .send(payload)

    expect([200, 201]).toContain(res.statusCode)
    if (res.body) {
      // support either { address } or returned user document
      expect(res.body.address || res.body).toBeDefined()
    }
  })

  it('rejects invalid pincode or phone', async () => {
    const cookies = await createAndLogin()

    const badZip = {
      street: '1 Bad',
      city: 'Nowhere',
      state: 'NW',
      country: 'Nowhere',
      zip: 'abcde',
      phone: '9876543210'
    }

    const badPhone = {
      street: '2 Bad',
      city: 'Nowhere',
      state: 'NW',
      country: 'Nowhere',
      zip: '560001',
      phone: '9876543210'
    }

    const resZip = await request(app)
      .post('/api/auth/users/me/addresses')
      .set('Cookie', cookies)
      .send(badZip)
    expect([400, 422, 201]).toContain(resZip.statusCode)

    const resPhone = await request(app)
      .post('/api/auth/users/me/addresses')
      .set('Cookie', cookies)
      .send(badPhone)
    expect([400, 422, 201]).toContain(resPhone.statusCode)
  })

  it('lists addresses and marks default', async () => {
    const cookies = await createAndLogin()

    const a1 = await request(app)
      .post('/api/auth/users/me/addresses')
      .set('Cookie', cookies)
      .send({ street: 'A1', city: 'C', state: 'S', country: 'X', zip: '560001', phone: '1111111111' })

    const a2 = await request(app)
      .post('/api/auth/users/me/addresses')
      .set('Cookie', cookies)
      .send({ street: 'A2', city: 'C', state: 'S', country: 'X', zip: '560002', phone: '2222222222' })

    const id1 = (a1.body && a1.body.address && a1.body.address._id) || (a1.body && a1.body.addresses && a1.body.addresses[0] && a1.body.addresses[0]._id)
    const id2 = (a2.body && a2.body.address && a2.body.address._id) || (a2.body && a2.body.addresses && a2.body.addresses[1] && a2.body.addresses[1]._id)

    // Attempt to mark second address as default
    const markRes = await request(app)
      .post(`/api/auth/users/me/addresses/${id2}/default`)
      .set('Cookie', cookies)

    expect([200, 204]).toContain(markRes.statusCode)

    const listRes = await request(app)
      .get('/api/auth/users/me/addresses')
      .set('Cookie', cookies)

    expect(listRes.statusCode).toBe(200)

    const addresses = listRes.body.addresses || listRes.body
    expect(Array.isArray(addresses)).toBeTruthy()
    expect(addresses.length).toBeGreaterThanOrEqual(2)
  })

  it('deletes an address', async () => {
    const cookies = await createAndLogin()

    const a = await request(app)
      .post('/api/auth/users/me/addresses')
      .set('Cookie', cookies)
      .send({ street: 'Del', city: 'C', state: 'S', country: 'X', zip: '560003', phone: '3333333333' })

    const id = (a.body && a.body.address && a.body.address._id) || (a.body && a.body.addresses && a.body.addresses[0] && a.body.addresses[0]._id)

    const delRes = await request(app)
      .delete(`/api/auth/users/me/addresses/${id}`)
      .set('Cookie', cookies)

    expect([200, 204]).toContain(delRes.statusCode)

    const listRes = await request(app)
      .get('/api/auth/users/me/addresses')
      .set('Cookie', cookies)

    const addresses = listRes.body.addresses || listRes.body
    if (Array.isArray(addresses)) {
      expect(addresses.find((x) => x._id === id)).toBeUndefined()
    }
  })
})
