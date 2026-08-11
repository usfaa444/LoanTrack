import fp from 'fastify-plugin';

// Auth plugin
export default fp(async (app) => {
  // Decorate with auth utilities
  app.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
});

// TypeScript declaration
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: any, reply: any) => Promise<void>;
  }
}