import request from 'supertest';
import { app } from '../../app';

describe('Returns user payload', () => {
  it('Responds with user payload of user currently signed in.', async () => {
    const cookie = await global.signin();

    const response = await request(app)
      .get('/api/users/currentuser')
      .set('Cookie', cookie)
      .send()
      .expect(200);

    expect(response.body.currentUser.email).toEqual('test@test.com');
  });

  it('Responds with null if user is not authenticated.', async () => {
    const response = await request(app)
      .get('/api/users/currentuser')
      .send()
      .expect(200);

    expect(response.body.currentUser).toEqual(null);
  });
});
