import { Subjects } from "./subjects";

export interface PaymentCreated {
  subject: Subjects.PaymentCreated;
  data: {
    id: string;
    orderId: string;
    stripeId: string;
  }
}
