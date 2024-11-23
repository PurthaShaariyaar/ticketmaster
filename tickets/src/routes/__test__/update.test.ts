import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

describe('Databases: system tests', () => {
  it('Return 404 if the ticket does not exist.', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
      .put(`/api/tickets/${id}`)
      .set('Cookie', global.signin())
      .send({
        title: 'Ticket A',
        price: 30
      })
      .expect(404);
  });

  it('Rejects updates if the ticket is reserved.', async () => {
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
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'Ticket B',
        price: 10
      })
      .expect(400);
  });
});

describe('Authentication: integration tests', () => {
  it('Returns a 401 if the user is not authenticated.', async () => {
    const id = new mongoose.Types.ObjectId().toHexString();

    await request(app)
      .put(`/api/tickets/${id}`)
      .send({
        title: 'Ticket A',
        price: 30
      })
      .expect(401);
  });

  it('Returns a 401 if the user does not own the ticket.', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title: 'Ticket',
        price: 10
      })

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', global.signin())
      .send({
        title: 'Ticket A',
        price: 20
      })
      .expect(401);
  });
});

describe('Input validation: unit tests', () => {
  it('Returns an error if an invalid title is provided.', async () => {
    const cookie = global.signin();

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title: 'Ticket A',
        price: 10
      });

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: '',
        price: 20
      })
      .expect(400)
  });

  it('Returns a 400 if user inputs an invalid price.', async () => {
    const cookie = global.signin();

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title: 'Ticket A',
        price: 10
      })

    await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'Ticket A',
        price: -30
      })
      .expect(400);
  });

  it('Updates a ticket with valid inputs.', async () => {
    const cookie = global.signin();

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title: 'Ticket',
        price: 20
      });

    const updatedTicket = await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'Ticket A',
        price: 30
      })
      .expect(200);

    expect(updatedTicket.body.title).toEqual('Ticket A');
    expect(updatedTicket.body.price).toEqual(30);
  });
});

describe('Trigger events: system tests', () => {
  it('Publishes a ticket:updated event when a ticket is successfully updated.', async () => {
    const cookie = global.signin();

    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', cookie)
      .send({
        title: 'Ticket',
        price: 20
      });

    const updatedTicket = await request(app)
      .put(`/api/tickets/${response.body.id}`)
      .set('Cookie', cookie)
      .send({
        title: 'Ticket A',
        price: 30
      })
      .expect(200);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
