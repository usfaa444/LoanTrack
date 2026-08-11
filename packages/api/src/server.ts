import fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';

const app = fastify({ logger: true });
const prisma = new PrismaClient();

app.register(cors, { origin: true });

app.get('/health', async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', database: 'connected', timestamp: new Date().toISOString() };
  } catch (e) {
    return { status: 'degraded', database: 'disconnected' };
  }
});

const start = async () => {
  try {
    await app.listen({ port: 3001, host: '0.0.0.0' });
    console.log('LoanTrack API running on port 3001');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();