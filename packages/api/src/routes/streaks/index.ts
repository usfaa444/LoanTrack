import { FastifyInstance } from 'fastify';

export default async function routes(fastify: FastifyInstance) {
  fastify.get('/me', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const streak = await fastify.db.loanFreeStreak.findUnique({ where: { userId } });
    return reply.send({
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
    });
  });
}