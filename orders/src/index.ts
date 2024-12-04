import { app } from "./app";
import mongoose from "mongoose";
import { natsWrapper } from "./nats-wrapper";

const PORT = 4002;

const start = async () => {

  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined.');
  }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined.');
  }

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined.');
  }

  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined.');
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTERS_ID must be defined.');
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    natsWrapper.client.on('close', () => {
      console.log('NATS connection is closed.');
      process.exit();
    });
    process.on('SIGNINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');
  } catch (err) {
    console.error(err);
  }

  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
};

start();
