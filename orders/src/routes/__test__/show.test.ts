import request from 'supertest';
import { Ticket } from '../../models/ticket';
import mongoose from 'mongoose';
import { app } from '../../app';

describe('Databases: system tests', () => {
  it('Throws a 404 if the order does not exist.', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();

    await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Cookie', global.signin())
      .send()
      .expect(404)
  });

  it('Returns a 401 error if user tries to fetch another users order.', async () => {
    const userA = global.signin();
    const userB = global.signin();

    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'Ticket A',
      price: 10
    });
    await ticket.save();

    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', userA)
      .send({ ticketId: ticket.id })
      .expect(201)

    await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', userB)
      .send({})
      .expect(401)
  });

  it('Fetches the order with a status 200 OK.', async () => {
    const user = global.signin();

    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'Ticket A',
      price: 10
    });
    await ticket.save();

    const { body: order } = await request(app)
      .post('/api/orders')
      .set('Cookie', user)
      .send({ ticketId: ticket.id })
      .expect(201)

    const { body: fetchedOrder } = await request(app)
      .get(`/api/orders/${order.id}`)
      .set('Cookie', user)
      .send()
      .expect(200)

    expect(fetchedOrder.id).toEqual(order.id);
  });
});
