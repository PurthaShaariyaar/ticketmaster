import request from 'supertest';
import { app } from '../../app';


describe('Validation errors', () => {
  it('Returns a 400 without an email field provided.', async () => {
    return request(app)
      .post('/api/users/signup')
      .send({
        email: '',
        password: 'password'
      })
      .expect(400);
  });

  it('Returns a 400 without a password field provided.', async () => {
    return request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: ''
      })
      .expect(400)
  });

  it('Returns a 400 for an invalid email field provided.', async () => {
    return request(app)
      .post('/api/users/signup')
      .send({
        email: 'test',
        password: 'password'
      })
      .expect(400);
  });

  it('Returns a 400 for invalid password field provided.', async () => {
    return request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'p'
      })
      .expect(400);
  });

  it('Returns a 400 when same email to be used.', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(201);

    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(400)
  });
});

describe('Successful signup', () => {
  it('Returns a 201 after a successful signup.', async () => {
    return request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(201);
  });

  it('Sets a cookie after successful signup.', async () => {
    const response = await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(201)

    expect(response.get('Set-Cookie')).toBeDefined();
  });
});
