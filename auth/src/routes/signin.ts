/**
 * Import dependencies: express, Req, Res, body, jwt, common
 * Import user model
 * Import password service
 * Initiate express router
 * Router.post an api with body: email and password
 * Use jwt.sign to assign an existingUser payload and then store the session
 * Return status of 200 and send the existingUser json as a response
 * Export router as signinRouter
 */
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@psticketmaster/common';

import { User } from '../models/user';
import { Password } from '../services/password';

const router = express.Router();

router.post('/api/users/signin', [
  body('email')
    .isEmail()
    .withMessage('Email must be valid.'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('You must supply a password.')
],
validateRequest,
async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    throw new BadRequestError('Email is incorrect or does not exist, if so please sign up.');
  }

  const passwordsMatch = await Password.compare(existingUser.password, password);

  if (!passwordsMatch) {
    throw new BadRequestError('Password is incorrect.');
  }

  const userJwt = jwt.sign({
    id: existingUser.id,
    email: existingUser.email
  },
    process.env.JWT_KEY!
  );

  req.session = {
    jwt: userJwt
  }

  res.status(200).send(existingUser);
});

export { router as signinRouter };
