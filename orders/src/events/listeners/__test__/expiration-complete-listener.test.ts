import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { Message } from "node-nats-streaming";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { OrderStatus, ExpirationCompleteEvent } from "@psticketmaster/common";
import { Order } from "../../../models/order";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    userId: '123',
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, ticket, data, msg };
};

describe('Databases: system tests', () => {
  it('Upon receiving expiration complete event, updates the orders status to cancelled.', async () => {
    const { listener, ticket, order, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
  });
});

describe('Trigger events: system tests', () => {
  it('emit an OrderCancelled event', async () => {
    const { listener, order, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
  });

  it('Acknowledges the message.', async () => {
    const { listener, ticket, order, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
  });
});
