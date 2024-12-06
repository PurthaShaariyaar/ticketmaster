/**
 * Import required dependencies for testing:
 * - natsWrapper, Message, OrderCancelledListener, OrderCancelledEvent, Ticket, mongoose
 */
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { OrderCancelledEvent } from "@psticketmaster/common";
import { Ticket } from "../../../models/ticket";
import mongoose from "mongoose";

/**
 * Setup function to initialize test:
 * - create an instance of the listener
 * - build ticket, set orderId, save ticket
 * - create an order cancelled event
 * - ack message
 * - return everything
 */
const setup = async () => {
  const testOrderId = new mongoose.Types.ObjectId().toHexString();
  const listener = new OrderCancelledListener(natsWrapper.client);

  const ticket = Ticket.build({
    title: 'Ticket A',
    price: 20,
    userId: '123'
  });
  ticket.set({ testOrderId });
  await ticket.save();

  const data: OrderCancelledEvent['data'] = {
    id: testOrderId,
    version: 0,
    ticket: {
      id: ticket.id
    }
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }

  return { listener, testOrderId, ticket, data, msg };
}

describe('Databases: system tests', () => {
  it('Sets the orderId of a ticket to undefined after an order is cancelled.', async () => {
    const { listener, testOrderId, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).not.toBeDefined();
  });
});

describe('Trigger event: system tests', () => {
  it('Publishes a ticket:updated event after a ticket has been successfully updated.', async () => {
    const { listener, testOrderId, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const updatedTicketData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    expect(updatedTicketData.orderId).not.toBeDefined();
  });
})

describe('Message ack: unit tests', () => {
  it('Verifies that the message was acknowledges.', async () => {
    const { listener, testOrderId, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });
});
