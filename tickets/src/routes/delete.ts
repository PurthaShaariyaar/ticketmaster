/**
 * Import dependencies: express, Req, Res, requireAuth, NotFoundError, NotAuthorizedError,
 *   BadRequestError, Ticket, TicketDeletedPublisher, natsWrapper
 * Create express router
 * Create router.delete api -> requireAuth, async (req, res)
 * check if ticket exists -> check if user owns ticket -> check if ticket is reserved
 * delete ticket -> await ticket.deleteOne
 * send a status 204 and response
 * Export router as deleteTicketRouter
 */

import express, { Request, Response } from 'express';
import {
  requireAuth, NotFoundError, NotAuthorizedError, BadRequestError
} from '@psticketmaster/common';
import { Ticket } from '../models/ticket';
import { TicketDeletedPublisher } from '../events/publishers/ticket-deleted-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete('/api/tickets/:id', requireAuth, async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new NotFoundError();
  }

  if (ticket.userId != req.currentUser!.id) {
    throw new NotAuthorizedError();
  }

  if (ticket.orderId) {
    throw new BadRequestError('Cannot delete a ticket that is currently in order process.');
  }

  await ticket.deleteOne();

  res.status(204).send();
});

export { router as deleteTicketRouter };
