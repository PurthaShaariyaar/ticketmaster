/**
 * Necessary dependencies
 * - Ticket, TicketUpdatedListener, TicketUpdatedEvent, mongoose, natsWrapper, Message
 */
import { Ticket } from "../../../models/ticket";
import { TicketUpdatedEvent } from "@psticketmaster/common";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { Message } from "node-nats-streaming";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";

/**
 * Setup function to initiate a ticket udpated event
 * - create listener
 * - create ticket -> initiate TicketUpdatedEvent mock data
 * - create mock msg
 * - return everything
 */
const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Ticket A',
    price: 20
  });
  await ticket.save();

  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: ticket.title,
    price: ticket.price,
    userId: '123'
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, ticket, data, msg };
}

describe('Databases: system tests', () => {
  it('Finds and updates the ticket.', async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.id).toEqual(data.id);
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
  });

  it('Does not send acknowledgement if event has a skipped version number.', async () => {
    const { listener, ticket, data, msg } = await setup();

    data.version = 10;

    try {
      await listener.onMessage(data, msg);
    } catch (err) {

    }

    expect(msg.ack).not.toHaveBeenCalled();
  });
});

describe('Acknowledgements: unit tests', () => {
  it('Verifies if the message was acknowledged.', async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });
});


