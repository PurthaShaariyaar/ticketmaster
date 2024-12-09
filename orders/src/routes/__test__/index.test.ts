import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order } from '../../models/order';
import mongoose from 'mongoose';

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Ticket A',
    price: 10
  });
  await ticket.save();

  return ticket;
}

describe('Authentication: integration tests', () => {
  it('If a user is not authenticated, throw a 401 error.', async () => {
    await request(app)
      .get('/api/orders')
      .send({})
      .expect(401);
  });

  it('If a user is authenticated, return 200 success.', async () => {
    const ticketOne = await buildTicket();
    const user = global.signin();

    await request(app)
      .post('/api/orders')
      .set('Cookie', user)
      .send({ ticketId: ticketOne.id })
      .expect(201)

    await request(app)
      .get('/api/orders')
      .set('Cookie', user)
      .expect(200);
  })
});

describe('Databases: system tests', () => {
  it('Fetches all orders for a specific user.', async () => {
    const userA = global.signin();
    const userB = global.signin();

    const ticketOne = await buildTicket();
    const ticketTwo = await buildTicket();
    const ticketThree = await buildTicket();

    const { body: orderOne } = await request(app)
      .post('/api/orders')
      .set('Cookie', userA)
      .send({ ticketId: ticketOne.id })
      .expect(201);

    const { body: orderTwo } = await request(app)
      .post('/api/orders')
      .set('Cookie', userB)
      .send({ ticketId: ticketTwo.id })
      .expect(201);

    const { body: orderThree } = await request(app)
      .post('/api/orders')
      .set('Cookie', userB)
      .send({ ticketId: ticketThree.id })
      .expect(201);

    const response = await request(app)
      .get('/api/orders')
      .set('Cookie', userB)
      .expect(200);

    console.log(response.body);

    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(orderTwo.id);
    expect(response.body[1].id).toEqual(orderThree.id);
  });
});
