import express from 'express';
import 'express-async-errors'
import { json } from 'body-parser';

const app = express();
app.set('trust proxy', true);
app.use(json());

app.all('*', async (req, res) => {
  // UPDATE AFTER INSTALLING COMMON DIR
  throw new Error('Route not found.')
});

export { app }
