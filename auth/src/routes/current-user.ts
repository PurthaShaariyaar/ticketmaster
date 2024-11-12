/**
 * Import dependencies: express, jwt, common
 * Initiate router
 * Router.get an api, ensure the middleware currentUser is passed in
 * Return a response with either the currentUser from request, or null
 * Export router as currentUserRouter
 */

import express from 'express';
import jwt from 'jsonwebtoken';

import { currentUser } from '@psticketmaster/common';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
