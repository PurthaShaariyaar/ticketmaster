import express from 'express';
import 'express-async-errors'
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@psticketmaster/common';
import { createTicketRouter } from './routes/new';
import { updateTicketRouter } from './routes/update';
import { showTicketRouter } from './routes/show';
import { indexTicketRouter } from './routes/index';
import { deleteTicketRouter } from './routes/delete';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
  })
);

app.use(currentUser);

app.use(createTicketRouter);
app.use(updateTicketRouter);
app.use(showTicketRouter);
app.use(indexTicketRouter);
app.use(deleteTicketRouter);


app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app }
