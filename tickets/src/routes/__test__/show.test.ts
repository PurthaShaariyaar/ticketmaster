import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

describe('Databases: system tests', () => {
  it('Returns a 404 if the ticket is not found.', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
      .get(`/api/tickets/${id}`)
      .send()
      .expect(404);
  });
});

describe('Successful request: system test', () => {
  it('Returns the ticket if the ticket is found in the database.', async () => {
    const title = 'Ticket A';
    const price = 30;

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title, price
      })
      .expect(201);

    const ticketResponse = await request(app)
      .get(`/api/tickets/${response.body.id}`)
      .send()
      .expect(200);

    expect(ticketResponse.body.title).toEqual(title);
    expect(ticketResponse.body.price).toEqual(price);
  });
});
