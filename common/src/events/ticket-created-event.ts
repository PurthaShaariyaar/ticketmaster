/**
 * Import dependencies: subjects
 * export interface with subject and data (id, version, title, price, userId)
 */
import { Subjects } from "./subjects";

export interface TicketCreatedEvent {
  subject: Subjects.TicketCreated;
  data: {
    id: string;
    version: number;
    title: string;
    price: number;
    userId: string;
  }
}
