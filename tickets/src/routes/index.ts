/**
 * Import dependencies: express, Req, Res, Ticket
 * Create router
 * Create router get api
 * use Ticket.find to send all tickets, that have an orderId as undefined
 * send a response with all the tickets
 * Export router as indexTicketRouter
 */

import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets', async (req: Request, res: Response) => {
  const tickets = await Ticket.find({
    orderId: undefined
  });

  res.send(tickets);
});

export { router as indexTicketRouter };
