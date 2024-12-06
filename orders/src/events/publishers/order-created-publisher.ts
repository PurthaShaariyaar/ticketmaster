import { Publisher, OrderCreatedEvent, Subjects } from "@psticketmaster/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
