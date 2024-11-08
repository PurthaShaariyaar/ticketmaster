/**
 * Import dependencies: express, Req, Res, body, jwt, common
 * Import User model
 * Initiate express router
 * Router.post an api with body: email and password, validateRequest
 * Use jwt.sign to assign user payload and then store the session
 * Return status of 201 and send the user json as a response
 * Export router as signupRouter
 */

import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@psticketmaster/common';

import { User } from '../models/user';

const router = express.Router();

router.post('/api/users/signup', [
  body('email')
    .isEmail()
    .withMessage('Email must be valid.'),
  body('password')
    .trim()
    .isLength({ min: 4, max:20 })
    .withMessage('Password must be between 4 and 20 characters.')
],
validateRequest,
async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new BadRequestError('Email in use, enter a different email.');
  }

  const user = User.build({ email, password });
  await user.save();

  const userJwt = jwt.sign({
    id: user.id,
    email: user.email
  },
  process.env.JWT_KEY!
)

  req.session = {
    jwt: userJwt
  }

  res.status(201).send(user);
});

export { router as signupRouter }
