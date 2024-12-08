/**
 * Necessary dependencies
 * - request, app, mongoose, Order, OrderStatus, Ticket, natsWrapper
 */
import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

describe('Route handler: unit tests', () => {
  it('Has a route handler to /api/orders for a post request.', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({})

    expect(response.status).not.toEqual(404);
  });
});

describe('Authentication: integration tests', () => {
  it('If a user is not authenticated, throw a 404 error.', async () => {
    await request(app)
      .post('/api/orders')
      .send({})
      .expect(401);
  });

  it('If a user is authenticated, return 200 OK.', async () => {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'Ticket A',
      price: 10
    });
    await ticket.save();

    const response = await request(app)
      .post('/api/orders')
      .set('Cookie', global.signin())
      .send({ ticketId: ticket.id })

    expect(response.statusCode).toEqual(201);
  });
});

describe('Input validation: unit tests', () => {
  it('Returns an error 400 if ticketId is not a valid MongoDB object.', async () => {
    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signin())
      .send({ ticketId: 'invalid-id' })
      .expect(400)
  });

  it('Returns an error 400 if ticketId is not provided.', async () => {
    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signin())
      .send({ ticketId: '' });
  });
});

describe('Databases: system tests', () => {
  it('Returns an error 404 if the ticket does not exist.', async () => {
    const ticketId = new mongoose.Types.ObjectId().toHexString();

    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signin())
      .send({ ticketId })
      .expect(404)
  });

  it('Returns an error 400 if a ticket is already reserved.', async () => {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'Ticket A',
      price: 20
    });
    await ticket.save();

    const order = Order.build({
      userId: '123',
      status: OrderStatus.Created,
      expiresAt: new Date(),
      ticket
    });
    await order.save();

    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signin())
      .send({ ticketId: ticket.id })
      .expect(400)
  });

  it('Reserves a ticket when an order is created.', async () => {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'Ticket A',
      price: 10
    });
    await ticket.save();

    const order = await request(app)
      .post('/api/orders')
      .set('Cookie', global.signin())
      .send({ ticketId: ticket.id })
      .expect(201)
  });
});

describe('Trigger events: system tests', () => {
  it('Publishes an order:created event when an order is successfully created.', async () => {
    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'Ticket A',
      price: 10
    });
    await ticket.save();

    await request(app)
      .post('/api/orders')
      .set('Cookie', global.signin())
      .send({ ticketId: ticket.id })
      .expect(201)

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
})
