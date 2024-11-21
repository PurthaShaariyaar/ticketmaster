import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

describe('Route handler: unit tests', () => {
  it('Has a route handler listening to /api/tickets/ for a post request', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .send({})

      expect(response.status).not.toEqual(404);
  });
});

describe('Authentication: integration tests', () => {
  it('If a user is not authenticated, throw an error.', async () => {
    await request(app)
      .post('/api/tickets')
      .send({})
      .expect(401)
  });

  it('If a user is authenticated expect a success status of 200 OK.', async () => {
    const response = await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({})

    expect(response.status).not.toEqual(401);
  });
});

describe('Input validation: unit tests', () => {
  it('Returns an error if an invalid title is provided.', async () => {
    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title: '',
        price: 30
      })
      .expect(400);

    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        price: 10
      })
      .expect(400);
  });

  it('Returns an error if an invalid price is provided.', async () => {
    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title: 'Ticket A',
        price: -10
      })
      .expect(400);

    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title: 'Ticket A'
      })
      .expect(400);
  });

  it('Creates a ticket with valid inputs.', async () => {
    let tickets = await Ticket.find({});
    expect(tickets.length).toEqual(0);

    const title = 'Ticket A';
    const price = 10;

    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title, price
      })
      .expect(201)

    tickets = await Ticket.find({});
    expect(tickets.length).toEqual(1);
    expect(tickets[0].title).toEqual(title);
    expect(tickets[0].price).toEqual(price);
  });
});

describe('Event handlers: system tests', () => {
  it('Publishes a ticket:created event when a ticket is created.', async () => {
    const title = 'Ticket A';
    const price = 10;

    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({
        title, price
      })
      .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });
});
