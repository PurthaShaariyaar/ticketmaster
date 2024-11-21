/**
 * Import dependencies: subjects
 * export interface with subject and data (id, version, title, price, userId, orderId?)
 */
import { Subjects } from "./subjects";

export interface TicketUpdatedEvent {
  subject: Subjects.TicketUpdated;
  data: {
    id: string;
    version: number;
    title: string;
    price: number;
    userId: string;
    orderId?: string;
  };
}
