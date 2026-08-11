import { FastifyInstance } from 'fastify';

export default async function routes(fastify: FastifyInstance) {
  fastify.get('/', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any)?.id;
    const { limit = '50', offset = '0' } = request.query as any;
    const notifications = await fastify.db.notificationLog.findMany({
      where: { userId },
      orderBy: { sentAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });
    return reply.send(notifications);
  });

  fastify.patch('/:id/read', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await fastify.db.notificationLog.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
    return reply.send({ success: true });
  });

  fastify.patch('/read-all', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any)?.id;
    await fastify.db.notificationLog.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return reply.send({ success: true });
  });
}