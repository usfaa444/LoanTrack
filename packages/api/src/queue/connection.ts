import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config';

// Create Redis connection
const connection = new IORedis(config.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false
});

export { connection };