import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

describe('Databases: system test', () => {
  it('Returns a 404 if the ticket does not exist.', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
      .delete(`/api/tickets/${id}`)
      .set('Cookie', global.signin())
      .expect(404)
  });

  it('Rejects a deletion if the ticket is currently reserved.', async () => {
    const cookie = global.signin();

    const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'Ticket A',
      price: 20
    });

    const ticket = await Ticket.findById(response.body.id);
    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
    await ticket!.save();

    await request(app)
      .delete(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .expect(400);
  });

  it('Successfully deletes a ticket.', async () => {
    const cookie = global.signin();
    const title = 'Ticket A';
    const price = 25;

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title, price
      })
      .expect(201);

    await request(app)
      .delete(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .expect(204)

    const ticket = await Ticket.findById(response.body.id);
    expect(ticket).toBeNull();
  });
});

describe('Authentication: integration tests', () => {
  it('Returns 401 if user is not authenticated.', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
      .delete(`/api/tickets/${id}`)
      .expect(401);
  });

  it('Returns a 401 if the user attempting to delete ticket does not own the ticket.', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title: 'Ticket A',
        price: 20
      })
      .expect(201)

    await request(app)
      .delete(`/api/tickets/${response.body.id}`)
      .set('Cookie', global.signin())
      .expect(401);
  });
});

describe('Triggering events: system tests', () => {
  it('Publishes a ticket:deleted event when a ticket is successfully deleted.', async () => {
    const cookie = global.signin();

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title: 'Ticket A',
        price: 10
      })
      .expect(201);

    await request(app)
      .delete(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
