import { Publisher, Subjects, TicketUpdatedEvent } from "@psticketmaster/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
