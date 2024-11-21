import { Publisher, Subjects, TicketCreatedEvent } from "@psticketmaster/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}

