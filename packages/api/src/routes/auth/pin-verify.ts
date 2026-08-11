import { FastifyInstance } from 'fastify';
import { verifyPinService } from '../../services/auth.service';
import { pinVerifyJsonSchema } from '../../schemas/auth.schema';

export default async function routes(fastify: FastifyInstance) {
  fastify.post('/pin/verify', {
    schema: { body: pinVerifyJsonSchema },
    onRequest: fastify.authenticate,
  }, async (request, reply) => {
    const { pin } = request.body as { pin: string };
    const userId = (request.user as any)?.id;
    if (!userId) return reply.status(401).send({ error: 'Unauthorized' });
    const valid = await verifyPinService(fastify.db, userId, pin);
    if (!valid) return reply.status(401).send({ error: 'Invalid PIN' });
    return reply.send({ success: true });
  });
}