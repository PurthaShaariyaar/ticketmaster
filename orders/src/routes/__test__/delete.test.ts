import request from 'supertest';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { app } from '../../app';
import { natsWrapper } from '../../nats-wrapper';

const buildOrder = async (userId: string) => {

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Ticket A',
    price: 10
  });
  await ticket.save();

  const order = Order.build({
    userId,
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket
  });
  await order.save();

  return order;
}

describe('Authentication: integration tests', () => {
  it('Returns a 401 error if a user is not authenticated.', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const cookie = global.signin(userId);
    const order = await buildOrder(userId);

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .send()
      .expect(401)
  });

  it('Returns a 401 error if a user is attempting to delete another users order.', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = await buildOrder(userId);

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set('Cookie', global.signin())
      .send()
      .expect(401);
  });

  it('Returns a 200 if user is authenticated.', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const cookie = global.signin(userId);
    const order = await buildOrder(userId);

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set('Cookie', cookie)
      .send()
      .expect(204);
  });
});

describe('Databases: system tests', () => {
  it('If the order does not exist, throws a 404.', async () => {
    const orderId = new mongoose.Types.ObjectId().toHexString();

    await request(app)
      .delete(`/api/orders/${orderId}`)
      .set('Cookie', global.signin())
      .send()
      .expect(404);
  });

  it('Mark the order as cancelled once deleted.', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const cookie = global.signin(userId);
    const order = await buildOrder(userId);

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set('Cookie', cookie)
      .send()
      .expect(204)

    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
  });
});

describe('Trigger events: system tests', () => {
  it('Ensures a publish has been called.', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const cookie = global.signin(userId);
    const order = await buildOrder(userId);

    await request(app)
      .delete(`/api/orders/${order.id}`)
      .set('Cookie', cookie)
      .send()
      .expect(204)

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
