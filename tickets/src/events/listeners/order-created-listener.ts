/**
 * Dependencies: Message, Listener, queueGroupName, Ticket, TicketUpdatedPublisher Subjects, OrderCreatedEvent
 */
import { Message } from "node-nats-streaming";
import { Listener, NotFoundError, OrderCreatedEvent, Subjects } from "@psticketmaster/common";
import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

/**
 * Class extends Listener abs: subject, queueGroupName, onMessage
 * Find ticket, if not found thorw an error, if found update the tickets orderId to data.id and save ticket
 * Publish an updated ticket event and ack the message
 */
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id)

    if (!ticket) {
      throw new NotFoundError();
    }

    ticket.set({ orderId: data.id });

    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId
    });

    msg.ack();
  }
}
