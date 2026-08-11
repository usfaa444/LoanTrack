import { Queue } from 'bullmq';
import { connection } from './connection';

// Create reminders queue
export const remindersQueue = new Queue('reminders', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});

// Create sweep overdue queue
export const sweepOverdueQueue = new Queue('sweep-overdue', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});