/**
 * Necessary dependencies
 * - express, Request, Response, mongoose, body, Order, Ticket, natsWrapper
 * - OrderCreatedPublisher, OrderStatus, requireAuth, validateRequest,
 * - NotFoundError, BadRequestError
 */
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { Ticket } from '../models/ticket';
import { natsWrapper } from '../nats-wrapper';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { requireAuth, validateRequest, OrderStatus, NotFoundError, BadRequestError } from '@psticketmaster/common';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 1 * 60;

router.post('/api/orders', requireAuth, [
  body('ticketId')
    .not()
    .isEmpty()
    .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
    .withMessage('ticketId must be provided.')
], validateRequest, async (req: Request, res: Response) => {

  const { ticketId } = req.body;

  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new NotFoundError();
  }

  const ticketIsReserved = await ticket.isReserved();

  if (ticketIsReserved) {
    throw new BadRequestError('Ticket is already reserved cannot place an order.');
  }

  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

  const order = Order.build({
    userId: req.currentUser!.id,
    status: OrderStatus.Created,
    expiresAt: expiration,
    ticket
  });
  await order.save();

  new OrderCreatedPublisher(natsWrapper.client).publish({
    id: order.id,
    version: order.version,
    status: order.status,
    userId: order.userId,
    expiresAt: order.expiresAt.toISOString(),
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  });

  res.status(201).send(order);
});

export { router as newOrderRouter };
