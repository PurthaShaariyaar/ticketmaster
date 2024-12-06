/**
 * Imports the required dependencies for testing:
 * - OrderCreatedListener: the listener for order creation events.
 * - OrderCreatedEvent, OrderStatus: event data and status for order creation.
 * - natsWrapper: client to interact with NATS for event publishing.
 * - Ticket: model representing the ticket entity.
 * - mongoose: library for database interactions.
 * - Message: type for the NATS message used in event handling.
 */
import { OrderCreatedListener } from "../order-created-listener";
import { OrderCreatedEvent, OrderStatus } from "@psticketmaster/common";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

/**
 * Setup function to initialize the test environment:
 * - Creates an instance of OrderCreatedListener.
 * - Builds and saves a new Ticket to simulate a reserved ticket.
 * - Constructs a mock OrderCreatedEvent to simulate the incoming event.
 * - Returns necessary objects (listener, ticket, event data, and mock message).
 */

const testOrderId = new mongoose.Types.ObjectId().toHexString();

const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    title: 'Ticket A',
    price: 10,
    userId: '123'
  });
  await ticket.save();

  // Create a mock OrderCreatedEvent
  const data: OrderCreatedEvent['data'] = {
    id: testOrderId,
    version: 0,
    status: OrderStatus.Created,
    userId: '123',
    expiresAt: '12',
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  };

  return { listener, ticket, data, msg };
};

/**
 * Call setup
 * Call listener.onMessage pass in data and msg
 * Create updatedTicket constant via findById
 * Write an assertion to check if the updatedTicket orderId is equal to data.id
 */
describe('Databases: system tests', () => {
  it('Sets the orderId of a ticket that is reserved.', async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    console.log('Tickets Order Id', updatedTicket?.orderId);
    console.log('Order id', data.id)

    expect(updatedTicket!.orderId).toEqual(data.id);
  });
});

/**
 * Call setup()
 * Call listener.onMessage pass in data and msg
 * Write an assertion for natsWrapper to check if publish has been called
 * Create updatedTicketData as mock data via JSON.parse
 * Write an assertion to check if the updatedTicketData orderId is equal to data.id
 */
describe('Trigger events: system tests', () => {
  it('Publishes a ticket:updated event when a ticket is successfully updated.', async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const updatedTicketData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

    console.log("Test Data passed to onMessage:", data);
    console.log("Test Updated ticket data:", updatedTicketData);

    // Fixing the assertion
    expect(updatedTicketData.orderId).toEqual(data.id);
  });
});
/**
 * Test to see if msg was acknowledged
 */
describe('Message ack: unit tests', () => {
  it('Verifies if the message was acknowledged.', async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });
});
