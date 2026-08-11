import { FastifyInstance } from 'fastify';
import { setupPinService } from '../../services/auth.service';
import { pinSetupJsonSchema } from '../../schemas/auth.schema';

export default async function routes(fastify: FastifyInstance) {
  fastify.post('/pin/setup', {
    schema: { body: pinSetupJsonSchema },
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const { pin } = request.body as { pin: string };
    const userId = (request.user as any)?.id;
    if (!userId) return reply.status(401).send({ error: 'Unauthorized' });
    const ok = await setupPinService(fastify.db, userId, pin);
    if (!ok) return reply.status(500).send({ error: 'Failed to set PIN' });
    return reply.send({ success: true });
  });
}