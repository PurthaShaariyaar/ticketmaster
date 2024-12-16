/**
 * Necessary dependencies: queue, natsWrapper, expirationcompletepublisher
 */
import Queue from 'bull';
import { natsWrapper } from '../nats-wrapper';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';

/**
 * Create interface: Payload
 * Create expiration queue: new Queue, init redis property via host
 * Call expiration queue as a job, publish expiration complete and include orderId
 */
interface Payload {
  orderId: string;
}

const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST
  }
});

expirationQueue.process(async (job) => {
  new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId: job.data.orderId
  });
});

export { expirationQueue };
