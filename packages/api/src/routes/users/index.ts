import { FastifyInstance } from 'fastify';

export default async function routes(fastify: FastifyInstance) {
  fastify.get('/me', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const user = await fastify.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true, phone: true, email: true, displayName: true,
        region: true, city: true, preferredWallet: true,
        defaultCurrency: true, isTrustScorePublic: true, hasPinSet: true,
        createdAt: true,
      },
    });
    if (!user) return reply.status(404).send({ error: 'User not found' });
    return reply.send(user);
  });

  fastify.patch('/me', {
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const userId = (request.user as any).id;
    const { region, city, preferredWallet, displayName } = request.body as any;
    const user = await fastify.db.user.update({
      where: { id: userId },
      data: {
        ...(region !== undefined ? { region } : {}),
        ...(city !== undefined ? { city } : {}),
        ...(preferredWallet !== undefined ? { preferredWallet } : {}),
        ...(displayName !== undefined ? { displayName } : {}),
      },
      select: {
        id: true, phone: true, email: true, displayName: true,
        region: true, city: true, preferredWallet: true,
        defaultCurrency: true,
      },
    });
    return reply.send(user);
  });
}