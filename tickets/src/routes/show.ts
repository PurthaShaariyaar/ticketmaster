/**
 * Import dependencies: express, Req, Res, NotFoundError, Ticket
 * Create router
 * Create router.get api
 * check the database for the ticket with the req.params.id
 * if not found throw not found errer
 * if found simply send the ticket
 * Export router as showTicketRouter
 */

import express, { Request, Response } from 'express';
import { NotFoundError } from '@psticketmaster/common';
import { Ticket } from '../models/ticket';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new NotFoundError();
  }

  res.send(ticket);
});

export { router as showTicketRouter };
