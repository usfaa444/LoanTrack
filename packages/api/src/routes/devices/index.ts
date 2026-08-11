import { FastifyInstance } from 'fastify';

export default async function routes(fastify: FastifyInstance) {
  fastify.post('/', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any)?.id;
    const { token, platform, deviceName } = request.body as any;
    await fastify.db.deviceToken.upsert({
      where: { userId_token: { userId, token } },
      update: { platform, deviceName, lastSeenAt: new Date() },
      create: { userId, token, platform, deviceName },
    });
    return reply.status(201).send({ success: true });
  });

  fastify.delete('/:token', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any)?.id;
    const { token } = request.params as { token: string };
    await fastify.db.deviceToken.deleteMany({ where: { userId, token } });
    return reply.send({ success: true });
  });
}