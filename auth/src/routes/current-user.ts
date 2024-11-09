/**
 * Import dependencies: express, jwt, common
 * Initiate router
 */

import express from 'express';
import jwt from 'jsonwebtoken';

import { currentUser } from '@psticketmaster/common';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
