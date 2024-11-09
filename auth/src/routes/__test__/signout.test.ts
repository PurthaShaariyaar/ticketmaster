import request from 'supertest';
import { app } from '../../app';

describe('Successful signout', () => {
  it('Clears the cookie after signing out.', async () => {
    await request(app)
      .post('/api/users/signup')
      .send({
        email: 'test@test.com',
        password: 'password'
      })
      .expect(201);

    const response = await request(app)
      .post('/api/users/signout')
      .send({})
      .expect(200);

    const cookie = response.get('Set-Cookie');

    expect(cookie).toBeDefined();
    expect(cookie![0]).toMatch(/session=;/);
  });
});
