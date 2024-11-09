/**
 * Import dependencies: express
 * Initiate router
 * Router.post an api -> set req.session to null
 * Export router as signoutRouter
 */

import express from 'express';

const router = express.Router();

router.post('/api/users/signout', (req, res) => {
  req.session = null;

  res.send({});
});

export { router as signoutRouter };
