/**
 * Import dependencies: express, Req, Res, body, requireAuth, validateRequest, Ticket, TicketCreatedPublisher, natsWrapper
 * Create express router
 * Create router.post api, requireAuth, body (title, price), validateRequest, async (req, res)
 * destructure title and price, build the ticket and save to database
 * publish a ticket created event
 * send out a res status of 201 with the ticket created
 * Export router as createTicketRouter
 */

import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@psticketmaster/common';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/tickets', requireAuth,
  [
    body('title')
      .not()
      .isEmpty()
      .withMessage('Title is required.'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0.')
  ], validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const ticket = await Ticket.build({
      title,
      price,
      userId: req.currentUser!.id
    });
    await ticket.save();

    await new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId
    });

    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
