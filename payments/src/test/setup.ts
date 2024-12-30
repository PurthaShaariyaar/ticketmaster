import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';
import jwt from 'jsonwebtoken';

declare global {
  var signin: (id?: string) => string[];
}

jest.mock('../nats-wrapper.ts');

process.env.STRIPE_KEY = 'sk_test_51Q7nYkGLAYEwNBdLIZ4W7orCcnDC1LPo2JcbThJBVggGDdAIVs1iOxwZLUZn8DPraVJvpjMSjJ5qRQn7if0l6fXj00BSdimQPs';

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = 'asflaskjdf';
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {})
});

beforeEach(async () => {
  const collections = await mongoose.connection.db?.collections();

  if (collections) {
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  };

  await mongoose.connection.close();
});

global.signin = (userId?: string) => {
  const id = userId || new mongoose.Types.ObjectId().toHexString();

  const payload = {
    id,
    email: 'test@test.com'
  };

  const token = jwt.sign(payload, process.env.JWT_KEY!);

  const session = { jwt: token };

  const sessionJSON = JSON.stringify(session);

  const base64 = Buffer.from(sessionJSON).toString('base64');

  return [`session=${base64}`];
}
