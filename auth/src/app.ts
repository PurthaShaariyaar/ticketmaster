import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError } from '@psticketmaster/common';

import { signupRouter } from './routes/signup';
import { signinRouter } from './routes/signin';
import { currentUserRouter } from './routes/current-user';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
  })
);

app.use(signupRouter);
app.use(signinRouter);
app.use(currentUserRouter);


app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };

