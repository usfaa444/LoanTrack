import { FastifyInstance } from 'fastify';

export default async function routes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    const badges = await fastify.db.badge.findMany({ orderBy: { tier: 'asc' } });
    return reply.send(badges);
  });

  fastify.get('/me', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const userBadges = await fastify.db.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { awardedAt: 'desc' },
    });
    return reply.send(userBadges.map(ub => ub.badge));
  });
}