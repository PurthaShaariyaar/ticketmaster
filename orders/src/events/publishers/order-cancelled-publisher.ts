import { Publisher, OrderCancelledEvent, Subjects } from "@psticketmaster/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
