import request from 'supertest';
import { app } from '../../app';

const createTicket = () => {
  return request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({
      title: 'Ticket',
      price: 10
    });
};

describe('Databases: system test', () => {
  it('Returns all tickets.', async () => {
    for(let i = 0; i < 3; i++) {
      await createTicket();
    }

    const response = await request(app)
      .get('/api/tickets')
      .send()
      .expect(200)

    // console.log(response.body);
    expect(response.body.length).toEqual(3);
  });
});
