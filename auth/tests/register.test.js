jest.mock('../src/broker/broker', () => ({
  publishToQueue: jest.fn()
}));

const request = require('supertest');
const app = require('../src/app');
const User = require('../src/model/user.model');
const { publishToQueue } = require('../src/broker/broker');

describe('POST /api/auth/register', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    publishToQueue.mockReset();
    publishToQueue.mockResolvedValue(true);
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

  it('creates a username from the email when username is omitted', async () => {
    const payload = {
      email: 'new.user@example.com',
      password: 'password123',
      fullName: {
        firstName: 'New',
        lastName: 'User'
      }
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.user.username).toBe('new.user');
  });

  it('still registers a user when queue publishing fails', async () => {
    publishToQueue.mockRejectedValue(new Error('RabbitMQ unavailable'));

    const payload = {
      username: 'queuefallback',
      email: 'queuefallback@example.com',
      password: 'password123',
      fullName: {
        firstName: 'Queue',
        lastName: 'Fallback'
      }
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body.user.username).toBe('queuefallback');
  });
});