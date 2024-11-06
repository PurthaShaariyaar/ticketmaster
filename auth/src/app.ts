import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';

const app = express();
app.set('trust proxy', false);
app.use(json());

app.all('*', async (req, res) => {
  // UPDATE TO COMMON SHARED AFTER CREATING DOCKER IMAGES
  res.status(404).send({ error: 'Route not found' });
});

export { app }
