import { Publisher, Subjects, ExpirationCompleteEvent } from "@psticketmaster/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
