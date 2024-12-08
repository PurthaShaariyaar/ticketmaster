/**
 * Necessary dependencies
 * - Message, Ticket, TicketCreatedEvent, TicketCreatedListener, natsWrapper, mongoose
 */
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { TicketCreatedEvent } from "@psticketmaster/common";
import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import mongoose from "mongoose";

/**
 * Setup function to initiate a ticket created event
 * - create an instance of listener
 * - create a mock data event to create a ticket
 * - ack the message
 * - return everything
 */
const setup = async () => {
  const listener = new TicketCreatedListener(natsWrapper.client);

  const data: TicketCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    title: 'Ticket A',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString()
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, data, msg };
}

describe('Databases: system tests', () => {
  it('Ticket created event received in turn creates and saves a new ticket.', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const ticket = await Ticket.findById(data.id);

    expect(ticket).toBeDefined();
    expect(ticket!.title).toEqual(data.title);
    expect(ticket!.price).toEqual(data.price);
  });
});

describe('Acknowledgements: unit tests', () => {
  it('Verifies if the message was acknowledged.', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });
});


