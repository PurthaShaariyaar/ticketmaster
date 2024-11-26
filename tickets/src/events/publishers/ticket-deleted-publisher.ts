import { Publisher, Subjects, TicketDeletedEvent } from "@psticketmaster/common";

export class TicketDeletedPublisher extends Publisher<TicketDeletedEvent> {
  subject: Subjects.TicketDeleted = Subjects.TicketDeleted;
}
