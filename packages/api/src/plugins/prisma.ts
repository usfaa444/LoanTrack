import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

export default fp(async (app) => {
  app.decorate('db', db);
  
  app.addHook('onClose', async () => {
    await db.$disconnect();
  });
});