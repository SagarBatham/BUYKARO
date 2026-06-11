const request = require('supertest');
const app = require('../src/app');
const User = require('../src/model/user.model');

describe('POST /api/auth/register', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('registers a user successfully', async () => {
    const payload = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      fullName: {
        firstName: 'Test',
        lastName: 'User'
      }
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(payload);

    expect(res.statusCode).toBe(201);

    expect(res.body).toHaveProperty('message');

    expect(res.body).toHaveProperty(
      'user.username',
      'testuser'
    );

    expect(res.body).toHaveProperty(
      'user.email',
      'test@example.com'
    );

    expect(res.body.user).not.toHaveProperty('password');

    const user = await User.findOne({
      username: 'testuser'
    }).lean();

    expect(user).toBeTruthy();
    expect(user.email).toBe('test@example.com');
  });
});