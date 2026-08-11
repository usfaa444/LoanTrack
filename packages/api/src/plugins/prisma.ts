import fp from 'fastify-plugin';
import db from '@loantrack/database';

// Decorate Fastify instance with database client
export default fp(async (app) => {
  app.decorate('db', db);
  
  app.addHook('onClose', async () => {
    await db.$disconnect();
  });
});

// TypeScript declaration
declare module 'fastify' {
  interface FastifyInstance {
    db: typeof db;
  }
}