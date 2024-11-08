import request from 'supertest';
import { app } from '../../app';

describe('User input errors', () => {
  it('Returns a 400 if email entered does not exist.', async () => {
    await request(app)
      .post('/api/users/signin')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(400);
  });

  it('Returns a 400 if password entered is incorrect.', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(201);

    await request(app)
      .post('/api/users/signin')
      .send({
        email: 'test@test.com',
        password: 'p'
      })
      .expect(400);
  });
});

describe('Sign in success', () => {
  it('Returns a 200 and responds with a cookie when providing valid credentials', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(201)

    const response = await request(app)
      .post('/api/users/signin')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(200);

    expect(response.get('Set-Cookie')).toBeDefined();
  });
});
